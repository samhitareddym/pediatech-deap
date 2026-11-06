import { useEffect, useState } from 'react'
import { BAT, ROLES } from '../script'
import '../pet/pet.css'
import './room.css'
import { Account, CalmRoutine, CalmToday, Celebrate, Icon, Nav, SetupPrompt, SignIn, VoiceSheet, type DoseView, type RoutinePlan, type Theme } from './calm'
import './calm.css'

/* ---------------- state ---------------- */

type Slot = 'am' | 'pm'
type Report = { day: number; slot: Slot; status: 'taken' | 'missed' | 'help'; tapAt: number; tookAt?: number }
type Req = { id: number; text: string; owner: string; day: number; hard: boolean }
type Plan = { amCue: string; pmCue: string; food: string; backup: string; barriers: string[] }
type S = { stage: 'signin' | 'home'; theme: Theme; plan: Plan | null; am: number; pm: number; day: number; now: number; reports: Report[]; reqs: Req[]; simDays: number }

const KEY = 'tend-v1'
const PATIENT = 'Maya' // from the linked portal (simulated)
const fresh: S = { stage: 'signin', theme: 'bright', plan: null, am: 480, pm: 1200, day: 1, now: 485, reports: [], reqs: [], simDays: 0 }
const load = (): S => { try { return { ...fresh, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') } } catch { return fresh } }
const emptyPlan: Plan = { amCue: '', pmCue: '', food: '', backup: '', barriers: [] }

const WINDOW = 60
const HARD = new Set([10, 11, 13]) // ran out, can't afford, refuse: a person reaches out fast
const OWNER: Record<string, string> = { coord: 'Transplant coordinator', pharm: 'Pharmacist or NP', social: 'Social worker', psych: 'Psychologist' }
const TABS = ['room', 'routine', 'account'] as const
type Tab = (typeof TABS)[number]

const clock = (m: number) => { const h = Math.floor(m / 60) % 24; return `${((h + 11) % 12) + 1}:${String(m % 60).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}` }
const low = (t: string) => t.charAt(0).toLowerCase() + t.slice(1)
const cue = (s: S, slot: Slot) => { const c = slot === 'am' ? s.plan?.amCue : s.plan?.pmCue; return c ? low(c).replace(/\bmy\b/g, 'your') : null }

function opportunity(s: S, slot: Slot) {
  const sched = slot === 'am' ? s.am : s.pm
  const close = slot === 'am' ? s.pm - WINDOW : 1440
  const rep = s.reports.find((r) => r.day === s.day && r.slot === slot)
  return { slot, sched, rep, open: !rep && s.now >= sched - WINDOW && s.now < close }
}
/* consecutive days with a check-in (a check-in streak, not a medicine score) */
function streak(s: S) {
  const days = new Set(s.reports.map((r) => r.day))
  let d = days.has(s.day) ? s.day : s.day - 1, n = 0
  while (days.has(d)) { n++; d-- }
  return n
}
const partDays = (s: S) => new Set(s.reports.map((r) => r.day)).size + s.simDays

/* ---------------- app ---------------- */

type View = Tab | 'help' | 'missed'
type Scenario = 'home' | 'reported' | 'driving' | 'locoff' | 'help'

export default function TendApp() {
  const [s, setS] = useState<S>(load)
  const [view, setView] = useState<View>('room')
  const [dir, setDir] = useState<'left' | 'right' | 'fade'>('fade')
  const [toast, setToast] = useState<string | null>(null)
  const [notif, setNotif] = useState<string | null>(null)
  const [scn, setScn] = useState<Scenario | null>(null)
  const [cel, setCel] = useState<string | null>(null)
  const [prompt, setPrompt] = useState(false)
  const [promptSeen, setPromptSeen] = useState(false)
  const [guide, setGuide] = useState(false)
  const [voice, setVoice] = useState(false)

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* private mode */ } }, [s])
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(null), 3500); return () => clearTimeout(id) }, [toast])
  useEffect(() => { if (!notif) return; const id = setTimeout(() => setNotif(null), 5000); return () => clearTimeout(id) }, [notif])
  useEffect(() => { if (!cel) return; const id = setTimeout(() => setCel(null), 4000); return () => clearTimeout(id) }, [cel])
  useEffect(() => { // gentle setup prompt a few seconds after launch, once per session
    if (s.stage !== 'home' || view !== 'room' || s.plan || promptSeen || voice) return
    const id = setTimeout(() => { setPrompt(true); setPromptSeen(true) }, 2500)
    return () => clearTimeout(id)
  }, [s.stage, view, s.plan, promptSeen, voice])

  const up = (fn: (d: S) => void) => setS((p) => { const d = structuredClone(p); fn(d); return d })
  const am = opportunity(s, 'am'), pm = opportunity(s, 'pm')
  const open = [am, pm].find((o) => o.open)

  /* tabs slide in the direction of travel; other views fade */
  const go = (v: View) => {
    const a = TABS.indexOf(view as Tab), b = TABS.indexOf(v as Tab)
    setDir(a >= 0 && b >= 0 && a !== b ? (b > a ? 'left' : 'right') : 'fade')
    setView(v)
  }
  const record = (status: Report['status'], tookAt?: number) => {
    if (!open) return
    up((d) => {
      if (d.reports.some((r) => r.day === d.day && r.slot === open.slot)) return // one report per opportunity
      d.reports.push({ day: d.day, slot: open.slot, status, tapAt: d.now, tookAt })
    })
  }
  const ask = (text: string, batId: number | null) => {
    const role = batId ? BAT[batId - 1].owner : 'coord'
    const hard = batId === null || HARD.has(batId)
    up((d) => { d.reqs.unshift({ id: Date.now(), text, owner: OWNER[role], day: d.day, hard }) })
    setToast(hard ? 'Sent. Someone from your team will reach out within 1–2 days.' : `Sent to your ${OWNER[role].toLowerCase()}. They'll follow up within 2 weeks.`)
  }
  const decide = (k: Scenario) => {
    setScn(k)
    const msg = k === 'help' ? `Want to talk to someone on your team? They can help with what's been hard.` : `A little time for your evening routine? It's ready when you are.`
    setNotif(k !== 'reported' && k !== 'driving' ? msg : null)
  }
  const setRoutine = (p: Partial<RoutinePlan>) => up((d) => {
    const { am: a, pm: b, ...rest } = p
    if (a !== undefined) d.am = a
    if (b !== undefined) d.pm = b
    d.plan = { ...(d.plan ?? emptyPlan), ...rest }
  })

  /* derived */
  const dv = (o: ReturnType<typeof opportunity>): DoseView => ({ slot: o.slot, time: clock(o.sched), cue: cue(s, o.slot), status: o.rep ? o.rep.status : o.open ? 'now' : s.now > o.sched ? 'none' : 'later' })
  const days7 = Array.from({ length: 7 }, (_, i) => s.day - 6 + i).filter((d) => d >= 1)
  const wk = s.reports.filter((r) => r.day > s.day - 7)
  const week = { reported: wk.length, possible: days7.length * 2, taken: wk.filter((r) => r.status === 'taken').length, days: new Set(wk.map((r) => r.day)).size }
  const insight = { title: 'Your evening routine', body: cue(s, 'pm') ? `After you ${cue(s, 'pm')}, ${clock(s.pm)}` : clock(s.pm) }
  const history = days7.map((d) => ({ day: d, am: s.reports.find((r) => r.day === d && r.slot === 'am')?.status ?? 'none', pm: s.reports.find((r) => r.day === d && r.slot === 'pm')?.status ?? 'none' }))
  const nextTime = clock(s.now < s.am - WINDOW ? s.am : s.now < s.pm - WINDOW ? s.pm : s.am)

  /* ---------- screens ---------- */
  let screen
  if (s.stage === 'signin') screen = <SignIn onDone={() => up((d) => { d.stage = 'home' })} />
  else if (view === 'missed')
    screen = (
      <div className="panel-screen">
        <h1 className="large-title">Thanks for telling us.</h1>
        <p className="foot">Missed doses happen. Knowing helps your team help you.</p>
        <div className="row end">
          <button className="btn" onClick={() => go('help')}>Get help</button>
          <button className="btn primary" onClick={() => go('room')}>Back to today</button>
        </div>
      </div>
    )
  else if (view === 'help') screen = <Help s={s} onBack={() => go('account')} onAsk={ask} />
  else if (view === 'account')
    screen = <Account name={`${PATIENT} R.`} theme={s.theme} onTheme={(th) => up((d) => { d.theme = th })}
      onSupport={() => go('help')} onSignOut={() => { setS({ ...fresh, theme: s.theme }); setView('room') }} />
  else if (view === 'routine')
    screen = <CalmRoutine week={week} insight={insight} history={history} guide={guide} onSet={setRoutine}
      plan={{ am: s.am, pm: s.pm, amCue: s.plan?.amCue ?? '', pmCue: s.plan?.pmCue ?? '', food: s.plan?.food ?? '', backup: s.plan?.backup ?? '', barriers: s.plan?.barriers ?? [] }} />
  else
    screen = <CalmToday streak={streak(s)}
      now={s.now} open={open ? dv(open) : null} doses={[{ ...dv(am), m: s.am }, { ...dv(pm), m: s.pm }]} nextTime={nextTime} onRoutine={() => go('routine')}
      onReport={() => { if (open) { record('taken', s.now); setCel(clock(s.now)) } }}
      onNotYet={() => setToast(`Okay. We'll check back later.`)}
      onMissed={() => { record('missed'); go('missed') }}
      onHelp={() => { record('help'); go('help') }} />

  return (
    <div className={`pet-stage room-app calm-app theme-${s.theme}`}>
      <div className="handheld">
        <div className="notch" />
        <div className="status-bar"><span>{clock(s.now)}</span><span>Day {s.day}</span></div>
        <div className="viewport">
          <div className={'view-anim from-' + dir} key={view + s.stage}>{screen}</div>
          {s.stage === 'home' && view === 'room' && <button className="mic-fab" onClick={() => { setPrompt(false); setPromptSeen(true); setVoice(true) }} aria-label="Talk to Tend"><Icon name="mic" size={22} /></button>}
          {voice && <VoiceSheet eveningTime={clock(s.pm)} onClose={() => setVoice(false)} onMockCall={(l) => { setVoice(false); setToast(`Mock call set for ${clock(s.pm)} · "${l}". Your dose time stays the same.`) }} />}
          {cel && <Celebrate time={cel} total={s.reports.length} days={partDays(s)} onDone={() => setCel(null)} />}
          {prompt && <SetupPrompt onLater={() => setPrompt(false)} onStart={() => { setPrompt(false); setGuide(true); go('routine') }} />}
          {s.stage === 'home' && TABS.includes(view as Tab) && (
            <Nav view={view} onView={go} tabs={[['room', 'Today', 'circle'], ['routine', 'Routine', 'square'], ['account', 'Account', 'bubble']]} />
          )}
          {notif && <button className="lock-notif" onClick={() => setNotif(null)}><span className="ln-icon"><Icon name="sun" /></span><span><b>Tend</b><small>now</small><br />{notif}</span></button>}
          {toast && <div className="toast" role="status">{toast}</div>}
        </div>
      </div>

      <aside className="presenter wide-panel">
        <h3>Demo controls</h3>
        <div className="pgrid">
          <button onClick={() => up((d) => { d.now = d.am + 5 })}>Morning<small>{clock(s.am + 5)}</small></button>
          <button onClick={() => up((d) => { d.now = d.pm + 10 })}>Evening<small>{clock(s.pm + 10)}</small></button>
          <button onClick={() => up((d) => { d.day += 1; d.now = d.am + 5 })}>Next day<small>history stays</small></button>
          <button onClick={() => up((d) => { d.simDays += 3 })}>+3 days<small>simulated, labeled</small></button>
        </div>
        <h3>Prompting demo <em>(simulated)</em></h3>
        <div className="pgrid">
          {([['home', 'Arrives home'], ['reported', 'Already reported'], ['driving', 'Possible driving'], ['locoff', 'Location off'], ['help', 'Needs support']] as [Scenario, string][]).map(([k, l]) => (
            <button key={k} className={scn === k ? 'on' : ''} onClick={() => decide(k)}>{l}</button>
          ))}
        </div>
        {scn && <Decision k={scn} s={s} />}
        <hr />
        <div className="pgrid">
          <button onClick={() => { setS({ ...fresh, theme: s.theme }); setView('room'); setScn(null) }}>Reset</button>
          <button onClick={() => up((d) => { d.stage = 'home' })}>Skip sign-in</button>
          <button onClick={() => up((d) => { d.theme = d.theme === 'bright' ? 'light' : d.theme === 'light' ? 'evening' : d.theme === 'evening' ? 'oura' : 'bright' })}>Theme: {s.theme}<small>bright → light → evening → Oura</small></button>
        </div>
        <p className="links"><a href="#patients">Compare patient days</a></p>
        {s.simDays > 0 && <p className="sim-note">Includes {s.simDays} simulated participation days.</p>}
      </aside>
    </div>
  )
}

/* ---------------- support ---------------- */

function Help({ s, onBack, onAsk }: { s: S; onBack: () => void; onAsk: (t: string, id: number | null) => void }) {
  const [list, setList] = useState(false)
  return (
    <div className="panel-screen">
      <div className="sheet-top"><button className="btn ghost" onClick={onBack}>Back</button><b>Support</b><span /></div>
      {!list ? (
        <div className="row wrap">
          <button className="btn primary" onClick={() => setList(true)}>Tell my team what's hard</button>
          <button className="btn" onClick={() => onAsk('Wants to talk to a person', null)}>Talk to a person</button>
        </div>
      ) : (
        <div className="bat">
          {BAT.map((b) => <button key={b.id} onClick={() => { onAsk(b.text, b.id); setList(false) }}>{b.text}<small>{ROLES[b.owner].label}</small></button>)}
          <button className="btn ghost" onClick={() => setList(false)}>Cancel</button>
        </div>
      )}
      {s.reqs.length > 0 && (
        <>
          <h4 className="h4">Sent to your team</h4>
          {s.reqs.map((r) => (
            <div key={r.id} className="req">
              <b>{r.text}</b>
              <small>{r.owner} · sent day {r.day} · {r.hard ? 'a person reaches out within 1–2 days' : `follow-up by day ${r.day + 14}`}</small>
            </div>
          ))}
        </>
      )}
      <p className="fine">Your care team sees your check-ins and what you send here. If there are no check-ins for 2 days, they'll reach out. Nobody's in trouble, ever.</p>
    </div>
  )
}

function Decision({ k, s }: { k: Scenario; s: S }) {
  const reported = k === 'reported'
  const ctx = { home: 'Arrived home 7:52 PM (coarse, simulated)', reported: 'Arrived home 7:52 PM (simulated)', driving: 'Moving at driving speed (simulated)', locoff: 'Location is off: using routine time only', help: '"Need help" twice this week (simulated)' }[k]
  const checks: [string, boolean][] = [
    ['Evening dose not reported yet', !reported], ['Inside the care team’s timing window', true], ['Not quiet hours', true], ['No routine prompt sent yet', true], ['Not possibly driving', k !== 'driving'],
  ]
  const decision = reported ? 'Stay quiet' : k === 'driving' ? 'Wait, then check again' : k === 'help' ? 'Offer help from a person' : 'Prompt'
  return (
    <div className="decision">
      <div><span>Routine</span>Evening dose after you {cue(s, 'pm') ?? 'do your evening routine'}, {clock(s.pm)}</div>
      <div><span>Context</span>{ctx}</div>
      <div><span>Checks</span>{checks.map(([t, ok]) => <em key={t} className={ok ? 'ok' : 'no'}>{ok ? '✓' : '✕'} {t}</em>)}</div>
      <div className="dec"><span>Decision</span>{decision}</div>
      <p>Explainable rules, not a trained model. Medicine timing never moves. Clinical outreach follows its own protocol.</p>
    </div>
  )
}

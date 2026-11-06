import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { BAT, ROLES } from '../script'
import '../pet/pet.css'
import './room.css'
import { CalmRoutine, CalmToday, Celebrate, Icon, Nav, SetupPrompt, SignIn, type DoseView, type RoutinePlan, type Theme } from './calm'
import './calm.css'
import { CHALLENGES, CHAPTERS, CHAPTER_BONUS, Grow, STEPS, award, freshTrans, readyForNext, stateOf, type Entry, type Kid, type Trans, type Wallet } from './grow'
import { AwayCard, MAYA, ScheduleSetup, SetupCard, WeekView, awayOn, clock as sclock, dayLabel, dowOf, packLine, span, timesOf } from './schedule'
import { CARDS, ConnectHub, Settings, WeeklyRewards, WidgetPreview, connOf, type DayDots, type Week } from './connect'
import './midnight.css'

/* ---------------- state ---------------- */

type Slot = 'am' | 'pm'
type Report = { day: number; slot: Slot; status: 'taken' | 'missed' | 'help'; tapAt: number; tookAt?: number }
type Req = { id: number; text: string; owner: string; day: number; hard: boolean }
type Plan = { amCue: string; pmCue: string; food: string; backup: string; barriers: string[] }
type Sched = { done: boolean; cal: string | null; pharm: string | null; mid: number; remind: boolean; added: boolean; packed: number[]; notified: number }
const freshSched: Sched = { done: false, cal: null, pharm: null, mid: 780, remind: true, added: false, packed: [], notified: 0 }
type S = {
  stage: 'signin' | 'connect' | 'home'; theme: Theme; plan: Plan | null; am: number; pm: number; day: number; now: number; reports: Report[]; reqs: Req[]; simDays: number
  sched: Sched // schedule setup after the visit (schedule.tsx)
  tokens: number; ledger: Entry[]; trans: Trans // points + Grow (grow.tsx)
  apps: string[]; widgets: string[]; card: string | null; weeks: Week[] // Settings + weekly reward (connect.tsx)
}

const KEY = 'tend-v3'
const PATIENT = 'Maya' // from the linked portal (simulated)
const fresh: S = {
  stage: 'signin', theme: 'midnight', plan: null, am: 480, pm: 1200, day: 1, now: 485, reports: [], reqs: [], simDays: 0,
  sched: freshSched, tokens: 100, ledger: [{ day: 1, text: 'Visit checklist with your care team', amt: 100, src: 'skill' }], trans: freshTrans(),
  apps: [], widgets: [], card: null, weeks: [],
}
const load = (): S => { try { return { ...fresh, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') } } catch { return fresh } }
const emptyPlan: Plan = { amCue: '', pmCue: '', food: '', backup: '', barriers: [] }

const WINDOW = 60
const HARD = new Set([10, 11, 13]) // ran out, can't afford, refuse: a person reaches out fast
const OWNER: Record<string, string> = { coord: 'Transplant coordinator', pharm: 'Pharmacist or NP', social: 'Social worker', psych: 'Psychologist' }
const TABS = ['room', 'routine', 'rewards', 'settings'] as const
const CHECKIN_PTS = 10
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
const partDays = (s: S) => new Set(s.reports.map((r) => r.day)).size + s.simDays

/* Grow: Maya's points are the app's points; demo profiles like Leo keep their own wallet */
const walletOf = (d: S, k: Kid): Wallet => (k.id === 'maya' ? d : k)
const cur = (d: S) => d.trans.kids[d.trans.who]
const confirmStep = (d: S, k: Kid, id: string, by: string) => {
  const x = STEPS.find((y) => y.id === id)!
  if (stateOf(k, id).st === 'confirmed') return
  k.steps[id] = { st: 'confirmed', by, day: d.day }
  award(walletOf(d, k), d.day, x.pts, x.label, 'skill')
}
const confirmDay = (d: S, k: Kid, day: number) => {
  const c = CHALLENGES[k.chapter], e = k.challenge.days.find((x) => x.day === day)
  if (!e || e.ok) return
  e.ok = true
  if (!k.challenge.done && k.challenge.days.filter((x) => x.ok).length >= c.goal) {
    k.challenge.done = true
    k.badges.push(c.badge)
    award(walletOf(d, k), d.day, c.pts, `${c.title} challenge complete`, 'challenge')
  }
}

/* ---------------- app ---------------- */

type View = Tab | 'help' | 'missed' | 'setup' | 'grow'
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
  const [notifGo, setNotifGo] = useState<'setup' | 'room' | null>(null)
  const [visitSeen, setVisitSeen] = useState(false)
  const pane = useRef<HTMLDivElement>(null)
  const swipe = useRef<{ x: number; y: number; dx: number; on: boolean } | null>(null)

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* private mode */ } }, [s])
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(null), 3500); return () => clearTimeout(id) }, [toast])
  useEffect(() => { if (!notif) return; const id = setTimeout(() => setNotif(null), 5000); return () => clearTimeout(id) }, [notif])
  useEffect(() => { if (!cel) return; const id = setTimeout(() => setCel(null), 4000); return () => clearTimeout(id) }, [cel])
  useEffect(() => { // gentle setup prompt a few seconds after launch, once per session
    if (s.stage !== 'home' || view !== 'room' || s.plan || !s.sched.done || promptSeen) return
    const id = setTimeout(() => { setPrompt(true); setPromptSeen(true) }, 2500)
    return () => clearTimeout(id)
  }, [s.stage, view, s.plan, s.sched.done, promptSeen])

  const up = (fn: (d: S) => void) => setS((p) => { const d = structuredClone(p); fn(d); return d })
  const am = opportunity(s, 'am'), pm = opportunity(s, 'pm')
  const open = [am, pm].find((o) => o.open)

  /* schedule: calendar events (simulated) and today's away doses */
  const sEvents = s.sched.cal ? [...MAYA.events, ...(s.sched.added ? [MAYA.added] : [])] : []
  const sT = { ...timesOf(s.am, s.sched.mid), pm: s.pm }
  const awayAt = (day: number) => (s.sched.done ? awayOn(MAYA, sEvents, sT, dowOf(day)) : [])
  const awayToday = awayAt(s.day)
  useEffect(() => { // right after the visit: a notification points to schedule setup (once per session)
    if (s.stage !== 'home' || s.sched.done || view !== 'room' || visitSeen) return
    const id = setTimeout(() => { setVisitSeen(true); setNotifGo('setup'); setNotif('Your visit checklist is done. Next step: set up your medicine schedule.') }, 1200)
    return () => clearTimeout(id)
  }, [s.stage, s.sched.done, view, visitSeen])
  useEffect(() => { // busy-day morning reminder: names the event and the exact medicines to bring
    if (s.stage !== 'home' || !s.sched.done || !s.sched.remind || s.now >= 720 || s.sched.notified === s.day || !awayToday.length) return
    const id = setTimeout(() => { up((d) => { d.sched.notified = d.day }); setNotifGo('room'); setNotif(`Busy day: ${packLine(awayToday)}`) }, 700)
    return () => clearTimeout(id)
  }, [s.stage, s.sched.done, s.sched.remind, s.now, s.day, s.sched.notified, awayToday.length]) // eslint-disable-line react-hooks/exhaustive-deps
  /* Grow steps Tend can see for itself are confirmed automatically */
  useEffect(() => {
    const m = s.trans.kids.maya
    const auto: [string, boolean][] = [['alarm', !!s.plan], ['checkins', partDays(s) >= 3], ['message', s.reqs.length > 0]]
    const due = auto.filter(([id, ok]) => ok && stateOf(m, id).st !== 'confirmed').map(([id]) => id)
    if (due.length) up((d) => { due.forEach((id) => confirmStep(d, d.trans.kids.maya, id, 'Tend')) })
  }, [s]) // eslint-disable-line react-hooks/exhaustive-deps

  /* tabs slide in the direction of travel; other views fade */
  const go = (v: View) => {
    const a = TABS.indexOf(view as Tab), b = TABS.indexOf(v as Tab)
    setDir(a >= 0 && b >= 0 && a !== b ? (b > a ? 'left' : 'right') : 'fade')
    setView(v)
  }
  /* swipe between tabs: the page follows the finger, then commits or springs back */
  const onDown = (e: PointerEvent) => { if (TABS.includes(view as Tab)) swipe.current = { x: e.clientX, y: e.clientY, dx: 0, on: false } }
  const onMove = (e: PointerEvent) => {
    const w = swipe.current
    if (!w) return
    const dx = e.clientX - w.x, dy = e.clientY - w.y
    if (!w.on && Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.4) w.on = true
    if (!w.on) return
    w.dx = dx
    if (pane.current) { pane.current.style.transition = 'none'; pane.current.style.transform = `translateX(${dx * 0.6}px)`; pane.current.style.opacity = String(1 - Math.min(0.4, Math.abs(dx) / 500)) }
  }
  const onUp = () => {
    const w = swipe.current
    swipe.current = null
    if (!w?.on || !pane.current) return
    const i = TABS.indexOf(view as Tab), next = w.dx < -70 ? TABS[i + 1] : w.dx > 70 ? TABS[i - 1] : undefined
    pane.current.style.transition = 'transform .25s cubic-bezier(.2,.8,.2,1), opacity .25s'
    pane.current.style.transform = ''
    pane.current.style.opacity = ''
    if (next) go(next)
  }

  const record = (status: Report['status'], tookAt?: number) => {
    if (!open) return
    up((d) => {
      if (d.reports.some((r) => r.day === d.day && r.slot === open.slot)) return // one report per opportunity
      d.reports.push({ day: d.day, slot: open.slot, status, tapAt: d.now, tookAt })
      award(d, d.day, CHECKIN_PTS, `${open.slot === 'am' ? 'Morning' : 'Evening'} check-in (${{ taken: 'taken', missed: 'missed', help: 'asked for help' }[status]})`, 'checkin')
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
    setNotifGo(null)
    setNotif(k !== 'reported' && k !== 'driving' ? msg : null)
  }
  const setRoutine = (p: Partial<RoutinePlan>) => up((d) => {
    const { am: a, pm: b, ...rest } = p
    if (a !== undefined) d.am = a
    if (b !== undefined) d.pm = b
    d.plan = { ...(d.plan ?? emptyPlan), ...rest }
  })

  const ck = s.trans.kids[s.trans.who]
  /* derived */
  const dv = (o: ReturnType<typeof opportunity>): DoseView => ({ slot: o.slot, time: clock(o.sched), cue: cue(s, o.slot), status: o.rep ? o.rep.status : o.open ? 'now' : s.now > o.sched ? 'none' : 'later' })
  const days7 = Array.from({ length: 7 }, (_, i) => s.day - 6 + i).filter((d) => d >= 1)
  const wk = s.reports.filter((r) => r.day > s.day - 7)
  const week = { reported: wk.length, possible: days7.length * 2, taken: wk.filter((r) => r.status === 'taken').length, days: new Set(wk.map((r) => r.day)).size }
  const insight = { title: 'Your evening routine', body: cue(s, 'pm') ? `After you ${cue(s, 'pm')}, ${clock(s.pm)}` : clock(s.pm) }
  const history = days7.map((d) => ({ day: d, am: s.reports.find((r) => r.day === d && r.slot === 'am')?.status ?? 'none', pm: s.reports.find((r) => r.day === d && r.slot === 'pm')?.status ?? 'none' }))
  const nextTime = clock(s.now < s.am - WINDOW ? s.am : s.now < s.pm - WINDOW ? s.pm : s.am)

  const scheduleGroup = (
    <>
      <p className="group-label">Schedule</p>
      <div className="group">
        <div className="row-ios"><span className="glyph" style={{ background: 'var(--sys-red)' }}><Icon name="list" size={15} /></span><span className="row-title">Calendar<small>{s.sched.cal ?? 'Not connected'}</small></span></div>
        <div className="row-ios"><span className="glyph" style={{ background: 'var(--sys-blue)' }}><Icon name="bag" size={15} /></span><span className="row-title">Pharmacy<small>{s.sched.done ? s.sched.pharm ?? "Care team's list" : 'Not connected'}</small></span></div>
        {s.sched.done && s.sched.cal && <button className="row-ios" onClick={() => up((d) => { d.sched.remind = !d.sched.remind })}><span className="glyph" style={{ background: 'var(--sys-orange)' }}><Icon name="bell" size={15} /></span><span className="row-title">Morning pack reminders<small>On busy days, lists what to bring</small></span><span className="row-detail">{s.sched.remind ? 'On' : 'Off'}</span></button>}
        <button className="row-ios" onClick={() => go('setup')}><span className="glyph" style={{ background: 'var(--sys-green)' }}><Icon name="edit" size={15} /></span><span className="row-title">{s.sched.done ? 'Redo schedule setup' : 'Set up schedule'}</span><span className="chev" aria-hidden="true" /></button>
      </div>
    </>
  )

  /* ---------- screens ---------- */
  let screen
  /* weekly reward: a week = 7 simulated days from day 1; 14 doses; 99% = every dose checked in as taken */
  const wIdx = Math.floor((s.day - 1) / 7), wStart = wIdx * 7 + 1, TOTAL = 14
  const dot = (d: number, slot: Slot) => {
    const rep = s.reports.find((r) => r.day === d && r.slot === slot)
    if (rep) return rep.status === 'taken' ? 'taken' : 'missed'
    return d < s.day ? 'missed' : 'later'
  }
  const wDays: DayDots[] = Array.from({ length: 7 }, (_, i) => wStart + i).map((d) => ({ label: dayLabel(d).slice(0, 1), am: dot(d, 'am'), pm: dot(d, 'pm') }))
  const wTaken = wDays.reduce((n, d) => n + (d.am === 'taken' ? 1 : 0) + (d.pm === 'taken' ? 1 : 0), 0)
  const wOff = wDays.some((d) => d.am === 'missed' || d.pm === 'missed')
  const endWeek = (taken: number) => up((d) => { const w = Math.max(wIdx, ...d.weeks.map((x) => x.wk + 1)); d.weeks.unshift({ wk: w, taken, total: TOTAL, earned: taken >= Math.ceil(TOTAL * 0.99), card: d.card ?? 'amazon', st: taken >= Math.ceil(TOTAL * 0.99) ? 'pending' : 'none', sim: true }) })
  const preview = (id: string) => <WidgetPreview id={id} next={nextTime} am={clock(s.am)} pm={clock(s.pm)} pts={wTaken} goal={TOTAL} />
  if (s.stage === 'signin') screen = <SignIn onDone={() => up((d) => { d.stage = 'connect' })} />
  else if (s.stage === 'connect')
    screen = (
      <div className="calm-page"><div className="calm-body top cx-onb">
        <p className="group-label">Step 1 of 2 · optional</p>
        <h1 className="large-title">Bring Tend into the apps you already use</h1>
        <p className="foot">Reminders can come from Alexa, your ring or watch, or a text, wherever you already look. You sign in on each app's own page.</p>
        <ConnectHub apps={s.apps} onConnect={(id) => { up((d) => { d.apps.push(id) }); setToast(`${connOf(id).name} connected (simulated).`) }} onRemove={(id) => up((d) => { d.apps = d.apps.filter((x) => x !== id) })} />
        <button className="cbtn primary" onClick={() => up((d) => { d.stage = 'home' })}>{s.apps.length ? 'Continue' : 'Skip for now'}</button>
        <p className="foot">You can add or remove connections anytime in Settings.</p>
      </div></div>
    )
  else if (view === 'setup')
    screen = <ScheduleSetup p={MAYA} today={s.day} onClose={() => go('room')} onDone={(r) => {
      up((d) => { d.sched = { ...d.sched, done: true, cal: r.cal, pharm: r.pharm, mid: r.mid, remind: r.remind, notified: 0 }; d.am = r.am; d.pm = r.am + 720; award(d, d.day, 50, 'Set up your medicine schedule', 'skill') })
      go('room'); setToast(`Schedule saved: ${sclock(r.am)} and ${sclock(r.am + 720)}. +50 points.`)
    }} />
  else if (view === 'grow') {
    const k = s.trans.kids[s.trans.who]
    screen = <>
      <div className="grow-back"><button className="pp-back" onClick={() => go('settings')}>‹ Settings</button></div>
      <Grow trans={s.trans} wallet={k.id === 'maya' ? s : k} today={s.day}
        onClaim={(id) => { up((d) => { cur(d).steps[id] = { st: 'claimed', day: d.day } }); setToast(`Sent to ${k.parent} to check. Points arrive once they do.`) }}
        onToday={() => { up((d) => { const x = cur(d); if (!x.challenge.days.some((e) => e.day === d.day)) x.challenge.days.push({ day: d.day, ok: false }) }); setToast(`Nice! ${k.parent} will tap “I saw it.”`) }}
        onConfirm={(id) => { up((d) => confirmStep(d, cur(d), id, k.parent)); setToast(`Confirmed by ${k.parent}.`) }}
        onConfirmDay={(day) => { const c = CHALLENGES[k.chapter], last = k.challenge.days.filter((e) => e.ok).length === c.goal - 1; up((d) => confirmDay(d, cur(d), day)); setToast(last ? `${c.title} complete! +${c.pts} points and a badge.` : `Confirmed by ${k.parent}.`) }}
        onAsk={() => { up((d) => { const x = cur(d); x.asked = true; if (x.id === 'maya') d.reqs.unshift({ id: Date.now(), text: `Wants to talk about the ${CHAPTERS[x.chapter].name} chapter`, owner: OWNER.coord, day: d.day, hard: false }) }); setToast(`Sent. The team will talk it over with ${k.name} and ${k.parent}.`) }}
        onMessage={() => go('help')} />
    </>
  }
  else if (view === 'rewards')
    screen = <WeeklyRewards card={s.card} onCard={(id) => { up((d) => { d.card = id }); setToast(`Working toward a $10 ${CARDS.find((c) => c.id === id)!.name} card.`) }}
      days={wDays} taken={wTaken} total={TOTAL} off={wOff} ends={dayLabel(wStart + 6)} fresh={dayLabel(wStart + 7)} history={s.weeks} />
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
  else if (view === 'help') screen = <Help s={s} onBack={() => go('settings')} onAsk={ask} />
  else if (view === 'settings')
    screen = <Settings name={`${PATIENT} R.`} theme={s.theme} onTheme={(th) => up((d) => { d.theme = th })}
      apps={s.apps} onConnect={(id) => { up((d) => { d.apps.push(id) }); setToast(`${connOf(id).name} connected (simulated).`) }} onRemove={(id) => up((d) => { d.apps = d.apps.filter((x) => x !== id) })}
      widgets={s.widgets} preview={preview} onWidget={(id) => { up((d) => { d.widgets.push(id) }); setToast('Added. On a phone: long-press the Home Screen, tap +, pick Tend (simulated).') }} onRemoveWidget={(id) => up((d) => { d.widgets = d.widgets.filter((x) => x !== id) })}
      schedule={<>{scheduleGroup}<div className="group"><button className="row-ios" onClick={() => { up((d) => { d.trans.who = 'maya' }); go('grow') }}><span className="glyph" style={{ background: 'var(--sys-green)' }}><Icon name="star" size={15} /></span><span className="row-title">Grow<small>Skills for taking charge of your care</small></span><span className="chev" aria-hidden="true" /></button></div></>}
      onSupport={() => go('help')} onSignOut={() => { setS({ ...fresh, theme: s.theme }); setView('room') }} />
  else if (view === 'routine')
    screen = <CalmRoutine extra={<>{scheduleGroup}{s.sched.done && <><p className="group-label">Next 7 days</p><WeekView p={MAYA} events={sEvents} t={sT} from={s.day} /></>}</>} week={week} insight={insight} history={history} guide={guide} onSet={setRoutine}
      plan={{ am: s.am, pm: s.pm, amCue: s.plan?.amCue ?? '', pmCue: s.plan?.pmCue ?? '', food: s.plan?.food ?? '', backup: s.plan?.backup ?? '', barriers: s.plan?.barriers ?? [] }} />
  else
    screen = <CalmToday extra={!s.sched.done
      ? <SetupCard who="your" onStart={() => go('setup')} />
      : awayToday.length ? <AwayCard away={awayToday} packed={s.sched.packed.includes(s.day)} onPacked={() => { up((d) => { d.sched.packed.push(d.day) }); setToast('Packed. Have fun!') }} /> : null}
      greeting={s.now < 720 ? 'Good morning' : s.now < 1080 ? 'Good afternoon' : 'Good evening'}
      now={s.now} open={open ? dv(open) : null} doses={[{ ...dv(am), m: s.am }, { ...dv(pm), m: s.pm }]} nextTime={nextTime} onRoutine={() => go('routine')}
      onReport={() => { if (open) { record('taken', s.now); setCel(clock(s.now)) } }}
      onNotYet={() => setToast(`Okay. We'll check back later.`)}
      onMissed={() => { record('missed'); go('missed') }}
      onHelp={() => { record('help'); go('help') }} />

  return (
    <div className={`pet-stage room-app calm-app theme-${s.theme}`}>
      <div className="handheld">
        <div className="notch" />
        <div className="status-bar"><span>{clock(s.now)}</span><span>{dayLabel(s.day)}</span></div>
        <div className="viewport" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          <div ref={pane} className={'view-anim from-' + dir} key={view + s.stage}>{screen}</div>
          {cel && <Celebrate time={cel} total={s.reports.length} days={partDays(s)} onDone={() => setCel(null)} />}
          {prompt && <SetupPrompt onLater={() => setPrompt(false)} onStart={() => { setPrompt(false); setGuide(true); go('routine') }} />}
          {s.stage === 'home' && TABS.includes(view as Tab) && (
            <Nav view={view} onView={go} tabs={[['room', 'Today', 'circle'], ['routine', 'Routine', 'square'], ['rewards', 'Rewards', 'gift'], ['settings', 'Settings', 'gear']]} />
          )}
          {notif && <button className="lock-notif" onClick={() => { setNotif(null); if (notifGo === 'setup') go('setup'); else if (notifGo === 'room') go('room') }}><span className="ln-icon"><Icon name="sun" /></span><span><b>Tend</b><small>now</small><br />{notif}</span></button>}
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
        <h3>Schedule <em>(simulated calendar + pharmacy)</em></h3>
        <div className="pgrid">
          <button onClick={() => { up((d) => { d.sched = freshSched; d.stage = 'home' }); setVisitSeen(false); go('room') }}>After the visit<small>setup not done yet</small></button>
          <button disabled={!s.sched.done || !s.sched.cal || s.sched.added} onClick={() => {
            const hit = awayOn(MAYA, [MAYA.added], sT, MAYA.added.days[0])
            up((d) => { d.sched.added = true }); setNotifGo('room')
            setNotif(hit.length ? `New on your calendar: ${MAYA.added.title}, Wed ${span(MAYA.added)}. It overlaps your ${hit[0].items.map((i) => sclock(i.t)).join(' and ')} medicines. Wednesday morning Tend will list what to pack.` : `New on your calendar: ${MAYA.added.title}. It doesn't overlap a dose.`)
          }}>Add event<small>Band trip, Wed 4–9:30 PM</small></button>
          <button disabled={!s.sched.done || !s.sched.cal} onClick={() => { const n = Array.from({ length: 7 }, (_, i) => s.day + 1 + i).find((x) => awayAt(x).length); if (n) up((d) => { d.day = n; d.now = Math.max(360, d.am - 30) }) }}>Next busy morning<small>pack reminder</small></button>
        </div>
        <h3>Weekly reward + Grow <em>(simulated program)</em></h3>
        <div className="pgrid">
          <button onClick={() => { endWeek(14); setToast('Simulated week: 14 of 14. $10 card earned, waiting for approval.') }}>Week: all 14<small>earns $10 (simulated)</small></button>
          <button onClick={() => { endWeek(13); setToast('Simulated week: 13 of 14. No card this week.') }}>Week: 13 of 14<small>no card (simulated)</small></button>
          <button disabled={!s.weeks.some((w) => w.st === 'pending')} onClick={() => { up((d) => { d.weeks.forEach((w) => { if (w.st === 'pending') w.st = 'sent' }) }); setToast('Program approved: gift card code sent (simulated).') }}>Program approves<small>pending cards</small></button>
          {(['leo', 'maya'] as const).map((id) => { const x = s.trans.kids[id]; return (
            <button key={id} className={s.trans.who === id && view === 'grow' ? 'on' : ''} onClick={() => { up((d) => { d.trans.who = id; d.stage = 'home' }); go('grow') }}>Grow: {x.name}, {x.age}<small>{CHAPTERS[x.chapter - 1].name} · {x.parent}</small></button>) })}
          <button disabled={!(STEPS.some((y) => stateOf(ck, y.id).st === 'claimed') || ck.challenge.days.some((e) => !e.ok))}
            onClick={() => up((d) => { const x = cur(d); STEPS.filter((y) => stateOf(x, y.id).st === 'claimed').forEach((y) => confirmStep(d, x, y.id, x.parent)); x.challenge.days.filter((e) => !e.ok).forEach((e) => confirmDay(d, x, e.day)) })}>
            {ck.parent} confirms<small>{STEPS.filter((y) => stateOf(ck, y.id).st === 'claimed').length + ck.challenge.days.filter((e) => !e.ok).length} waiting</small></button>
          <button disabled={!readyForNext(ck)}
            onClick={() => { up((d) => { const x = cur(d); x.chapter += 1; x.asked = false; x.challenge = { days: [], done: false }; award(walletOf(d, x), d.day, CHAPTER_BONUS, `Started the ${CHAPTERS[x.chapter - 1].name} chapter`, 'level') }); setToast(`Care team approved the next chapter. +${CHAPTER_BONUS} points.`) }}>
            Team approves<small>next chapter</small></button>
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
          <button onClick={() => { setS({ ...fresh, theme: s.theme }); setView('room'); setScn(null); setVisitSeen(false) }}>Reset</button>
          <button onClick={() => up((d) => { d.stage = 'home' })}>Skip sign-in</button>
          <button onClick={() => up((d) => { const o: Theme[] = ['midnight', 'bright', 'light', 'evening', 'oura']; d.theme = o[(o.indexOf(d.theme) + 1) % o.length] })}>Theme: {s.theme}<small>midnight → bright → light → evening → Oura</small></button>
        </div>
        <p className="links"><a href="#parent">Parent portal</a> · <a href="#patients">Compare patient days</a></p>
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

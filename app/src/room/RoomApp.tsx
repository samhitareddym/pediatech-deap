import { useEffect, useState } from 'react'
import { BAT, ROLES } from '../script'
import { Onboarding, emptyPlan, type Plan } from '../pet/Onboarding'
import '../pet/pet.css'
import './room.css'
import { COMPANIONS, Companion, companion } from './companions'
import { FLOORS, ITEMS, ItemThumb, Room, TINTS, WALLS, companionSpot, item, type Owned } from './Room'
import PetApp from '../pet/PetApp'
import { ShelfShuffle } from './ShelfShuffle'
import { Account, CalmRoutine, CalmToday, Celebrate, Icon, Nav, SetupPrompt, SignIn, Start, type DoseView, type RoutinePlan, type Theme } from './calm'
import './calm.css'
import { CHALLENGES, CHAPTERS, CHAPTER_BONUS, Grow, STEPS, award, freshTrans, readyForNext, stateOf, type Entry, type Kid, type Trans, type Wallet } from './grow'

/* ---------------- state ---------------- */

type Slot = 'am' | 'pm'
type Report = { day: number; slot: Slot; status: 'taken' | 'missed' | 'help'; tapAt: number; tookAt?: number; cue?: string }
type Req = { id: number; text: string; owner: string; day: number; hard: boolean }
type RS = {
  stage: 'signin' | 'start' | 'select' | 'quiz' | 'starter' | 'home'
  theme: Theme
  mode: 'game' | 'calm'
  cid: string; name: string; plan: Plan | null; am: number; pm: number
  day: number; now: number
  reports: Report[]; tokens: number
  owned: Owned[]; n: number; wall: string; floor: string
  gameDay: number; gameRewards: number; shelfWon: boolean
  reqs: Req[]; gifts: number[]; simDays: number
  trans: Trans; ledger: Entry[] // Grow: transition readiness + rewards tracker (grow.tsx)
}
const KEY = 'tend-room-v6'
const PATIENT = 'Maya' // from the linked portal (simulated)
const fresh: RS = {
  stage: 'signin', mode: 'calm', theme: 'bright', cid: 'miso', name: 'Miso', plan: null, am: 480, pm: 1200, day: 1, now: 485,
  reports: [], tokens: 0, n: 4, wall: WALLS[0], floor: FLOORS[0],
  owned: [
    { uid: 'c1', item: 'chair', on: true, u: 2.75, v: 3.25 },
    { uid: 'r1', item: 'rug', on: true, u: 2, v: 2 },
    { uid: 'w1', item: 'window', on: true, u: 2, v: 0, side: 'R', h: 80 },
  ],
  gameDay: 0, gameRewards: 0, shelfWon: false, reqs: [], gifts: [], simDays: 0,
  trans: freshTrans(), ledger: [],
}
const load = (): RS => { try { return { ...fresh, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') } } catch { return fresh } }

const CHECKIN_TOKENS = 10, GAME_TOKENS = 5, GAME_CAP = 3, WINDOW = 60, MAX_N = 7
const expandCost = (n: number) => n * 20
const MILESTONES = [
  { days: 3, game: 'Cloud Catch', blurb: 'Move a basket between lanes to catch drifting stars. Slow mode included.' },
  { days: 7, game: 'Pattern Studio', blurb: 'Match short patterns of shapes. Unlocks rug patterns and prints.' },
  { days: 14, game: 'Pocket Garden', blurb: 'Arrange plant tiles for light and space. Unlocks planters.' },
]
const HARD = new Set([10, 11, 13])
const OWNER: Record<string, string> = { coord: 'Transplant coordinator', pharm: 'Pharmacist or NP', social: 'Social worker', psych: 'Psychologist' }

const clock = (m: number) => { const h = Math.floor(m / 60) % 24; return `${((h + 11) % 12) + 1}:${String(m % 60).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}` }
const toInput = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
const fromInput = (v: string) => { const [h, m] = v.split(':').map(Number); return h * 60 + (m || 0) }
const low = (t: string) => t.charAt(0).toLowerCase() + t.slice(1)
const cue = (s: RS, slot: Slot) => { const c = slot === 'am' ? s.plan?.amCue : s.plan?.pmCue; return c && c !== 'Something else' ? low(c) : null }
const yours = (t: string) => t.replace(/\bmy\b/g, 'your')

function opportunity(s: RS, slot: Slot) {
  const sched = slot === 'am' ? s.am : s.pm
  const close = slot === 'am' ? s.pm - WINDOW : 1440
  const rep = s.reports.find((r) => r.day === s.day && r.slot === slot)
  return { slot, sched, rep, open: !rep && s.now >= sched - WINDOW && s.now < close }
}
const partDays = (s: RS) => new Set(s.reports.map((r) => r.day)).size + s.simDays
function streak(s: RS) {
  const days = new Set(s.reports.map((r) => r.day))
  let d = days.has(s.day) ? s.day : s.day - 1, n = 0
  while (days.has(d)) { n++; d-- }
  return n
}
const newOwned = (id: string, n: number): Owned => item(id).kind === 'wall'
  ? { uid: `${id}-${Date.now()}`, item: id, on: true, u: n / 2, v: 0, side: 'L', h: 90 }
  : { uid: `${id}-${Date.now()}`, item: id, on: true, u: n / 2 + 0.25, v: n / 2 + 0.25 }

/* Grow (grow.tsx): Maya's points are the app's tokens; demo profiles like Leo keep their own wallet */
const walletOf = (d: RS, k: Kid): Wallet => (k.id === 'maya' ? d : k)
const cur = (d: RS) => d.trans.kids[d.trans.who]
const confirmStep = (d: RS, k: Kid, id: string, by: string) => {
  const x = STEPS.find((y) => y.id === id)!
  if (stateOf(k, id).st === 'confirmed') return
  k.steps[id] = { st: 'confirmed', by, day: d.day }
  award(walletOf(d, k), d.day, x.pts, x.label, 'skill')
}
const confirmDay = (d: RS, k: Kid, day: number) => {
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

type View = 'room' | 'routine' | 'checkin' | 'shop' | 'game' | 'progress' | 'help' | 'account' | 'grow'
type Scenario = 'home' | 'reported' | 'driving' | 'locoff' | 'help'

export default function RoomApp() {
  const [s, setS] = useState<RS>(load)
  const [view, setView] = useState<View>('room')
  const [editing, setEditing] = useState(false)
  const [sel, setSel] = useState<string | null>(null)
  const [pending, setPending] = useState<string | null>(null) // uid of an item previewed but not bought yet
  const [toast, setToast] = useState<{ text: string; undo?: RS } | null>(null)
  const [pick, setPick] = useState(s.cid)
  const [nameDraft, setNameDraft] = useState(s.name)
  const [switching, setSwitching] = useState(false)
  const [bubble, setBubble] = useState(false)
  const [notif, setNotif] = useState<string | null>(null)
  const [scn, setScn] = useState<Scenario | null>(null)
  const [cel, setCel] = useState<string | null>(null)
  const [prompt, setPrompt] = useState(false)
  const [promptSeen, setPromptSeen] = useState(false)
  const [guide, setGuide] = useState(false)

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* private mode */ } }, [s])
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(null), 4000); return () => clearTimeout(id) }, [toast])
  useEffect(() => { if (!notif) return; const id = setTimeout(() => setNotif(null), 5000); return () => clearTimeout(id) }, [notif])
  useEffect(() => { if (!cel) return; const id = setTimeout(() => setCel(null), 4000); return () => clearTimeout(id) }, [cel])
  useEffect(() => { // gentle setup prompt a few seconds after launch, once per session
    if (s.mode !== 'calm' || s.stage !== 'home' || view !== 'room' || s.plan || promptSeen) return
    const id = setTimeout(() => { setPrompt(true); setPromptSeen(true) }, 2500)
    return () => clearTimeout(id)
  }, [s.mode, s.stage, view, s.plan, promptSeen])

  const up = (fn: (d: RS) => void) => setS((p) => { const d = structuredClone(p); fn(d); return d })

  /* Grow steps Tend can see for itself are confirmed automatically: routine set up, 3 check-in days, a message to the team */
  useEffect(() => {
    const m = s.trans.kids.maya
    const auto: [string, boolean][] = [['alarm', !!s.plan], ['checkins', partDays(s) >= 3], ['message', s.reqs.length > 0]]
    const due = auto.filter(([id, ok]) => ok && stateOf(m, id).st !== 'confirmed').map(([id]) => id)
    if (due.length) up((d) => { due.forEach((id) => confirmStep(d, d.trans.kids.maya, id, 'Tend')) })
  }, [s]) // eslint-disable-line react-hooks/exhaustive-deps
  const am = opportunity(s, 'am'), pm = opportunity(s, 'pm')
  const open = [am, pm].find((o) => o.open)
  const spot = companionSpot(s.cid, s.owned, s.n)
  const selO = s.owned.find((o) => o.uid === sel)
  const calm = s.mode === 'calm'
  const ck = s.trans.kids[s.trans.who] // Grow profile shown in the presenter panel
  const Avatar = ({ pose }: { pose?: 'happy' }) => (calm ? <div className="calm-mark"><Icon name="sun" size={30} /></div> : <Companion id={s.cid} pose={pose} />)

  /* keyboard: arrows nudge the selected item (tap/keys are the accessible route; drag is the extra) */
  useEffect(() => {
    if (!editing || !sel) return
    const onKey = (e: KeyboardEvent) => {
      const d = ({ ArrowUp: [0, -0.25], ArrowDown: [0, 0.25], ArrowLeft: [-0.25, 0], ArrowRight: [0.25, 0] } as Record<string, number[]>)[e.key]
      if (!d) return
      e.preventDefault()
      up((x) => { const o = x.owned.find((y) => y.uid === sel)!; o.u = Math.max(0.3, Math.min(x.n - 0.3, o.u + d[0])); if (item(o.item).kind !== 'wall') o.v = Math.max(0.3, Math.min(x.n - 0.3, o.v + d[1])); else o.h = Math.max(40, Math.min(120, (o.h ?? 80) - d[1] * 40)) })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editing, sel])

  /* ---------- decorating ---------- */
  const moveItem = (uid: string, p: Partial<Owned>) => up((d) => { Object.assign(d.owned.find((o) => o.uid === uid)!, p) })
  const preview = (id: string) => { // shop: drop it in the room first, pay only when you keep it
    const o = newOwned(id, s.n)
    up((d) => { d.owned.push(o) })
    setPending(o.uid); setSel(o.uid); setEditing(true); setView('room')
  }
  const buy = () => {
    const o = s.owned.find((x) => x.uid === pending)!
    const price = item(o.item).price
    if (s.tokens < price) return setToast({ text: `You need ${price - s.tokens} more tokens. Check-ins and games earn them.` })
    up((d) => { d.tokens -= price })
    setPending(null); setToast({ text: `${item(o.item).name} is yours!` })
  }
  const cancelPreview = () => { up((d) => { d.owned = d.owned.filter((o) => o.uid !== pending) }); setPending(null); setSel(null) }
  const expand = () => {
    if (s.n >= MAX_N) return setToast({ text: 'Your room is as big as it gets (for now).' })
    const cost = expandCost(s.n)
    if (s.tokens < cost) return setToast({ text: `Adding more room costs ${cost} tokens. You have ${s.tokens}.` })
    const before = s
    up((d) => { d.tokens -= cost; d.n += 1; d.owned.forEach((o) => { if (item(o.item).kind !== 'wall') { o.u += 0.5; o.v += 0.5 } }) })
    setToast({ text: `More room! Now ${s.n + 1}×${s.n + 1}.`, undo: before })
  }

  /* ---------- check-in ---------- */
  const [ci, setCi] = useState<{ step: 'choose' | 'time' | 'cue' | 'done' | 'missed'; when: 'now' | 'earlier'; took: number }>({ step: 'choose', when: 'now', took: 0 })
  const openCheckin = () => { setCi({ step: 'choose', when: 'now', took: open?.sched ?? s.now }); setView('checkin') }
  const record = (status: Report['status'], tookAt?: number, cueAns?: string) => {
    if (!open) return
    up((d) => {
      if (d.reports.some((r) => r.day === d.day && r.slot === open.slot)) return // one report per opportunity: no farming
      d.reports.push({ day: d.day, slot: open.slot, status, tapAt: d.now, tookAt, cue: cueAns })
      d.tokens += CHECKIN_TOKENS
      d.ledger.push({ day: d.day, text: `${open.slot === 'am' ? 'Morning' : 'Evening'} check-in (${{ taken: 'taken', missed: 'missed', help: 'asked for help' }[status]})`, amt: CHECKIN_TOKENS, src: 'checkin' })
    })
  }

  /* ---------- game reward ---------- */
  const gameReward = () => {
    const used = s.gameDay === s.day ? s.gameRewards : 0
    const paid = used < GAME_CAP, first = !s.shelfWon
    up((d) => {
      if (d.gameDay !== d.day) { d.gameDay = d.day; d.gameRewards = 0 }
      if (d.gameRewards < GAME_CAP) { d.gameRewards++; d.tokens += GAME_TOKENS; d.ledger.push({ day: d.day, text: 'Finished Shelf Shuffle', amt: GAME_TOKENS, src: 'game' }) }
      if (!d.shelfWon) { d.shelfWon = true; d.owned.push({ ...newOwned('bookends', d.n), on: false }) }
    })
    return [paid ? `+${GAME_TOKENS} room tokens.` : `Free play: today's ${GAME_CAP} rewarded games are done.`, first ? 'New: Fox bookends are in your storage.' : ''].join(' ')
  }

  /* ---------- help ---------- */
  const ask = (text: string, batId: number | null) => {
    const role = batId ? BAT[batId - 1].owner : 'coord'
    const hard = batId === null || HARD.has(batId)
    up((d) => { d.reqs.unshift({ id: Date.now(), text, owner: OWNER[role], day: d.day, hard }) })
    setToast({ text: hard ? `Sent. Someone from your team will reach out within 1–2 days.` : `Sent to your ${OWNER[role].toLowerCase()}. They'll follow up within 2 weeks.` })
  }

  /* ---------- prompting demo ---------- */
  const decide = (k: Scenario) => {
    setScn(k)
    const reported = k === 'reported' // each simulated scenario stands alone
    const msg = k === 'help' ? `Want to talk to someone on your team? They can help with what's been hard.` : `A little time for you and ${s.name}? Your evening routine is ready.`
    setNotif(!reported && k !== 'driving' ? msg : null)
  }

  /* ---------- screens ---------- */
  const checkinCard = (
    <div className="checkin-card">
      {open ? (
        <>
          <div className="ci-head">
            <Icon name={open.slot === 'am' ? 'sun' : 'moon'} size={16} />
            <div><b>{open.slot === 'am' ? 'Morning' : 'Evening'} check-in</b><small>{clock(open.sched)}{cue(s, open.slot) ? ` · after you ${yours(cue(s, open.slot)!)}` : ''}</small></div>
          </div>
          <button className="btn primary wide" onClick={openCheckin}>Check in</button>
        </>
      ) : (
        <div className="ci-head">
          <Icon name="check" size={16} />
          <div><b>You're all set for now</b><small>Next check-in: {clock(s.now < s.am - WINDOW ? s.am : s.now < s.pm - WINDOW ? s.pm : s.am)}</small></div>
        </div>
      )}
      <div className="today">
        {[am, pm].map((o) => (
          <span key={o.slot} className={'pill ' + (o.rep?.status ?? 'none')}>
            <Icon name={o.slot === 'am' ? 'sun' : 'moon'} size={11} /> {clock(o.sched)} · {o.rep ? { taken: 'taken', missed: 'missed', help: 'asked for help' }[o.rep.status] : o.open ? 'now' : s.now > o.sched ? 'no report' : 'later'}
          </span>
        ))}
      </div>
    </div>
  )

  const dv = (o: ReturnType<typeof opportunity>): DoseView => ({ slot: o.slot, time: clock(o.sched), cue: cue(s, o.slot) ? yours(cue(s, o.slot)!) : null, status: o.rep ? o.rep.status : o.open ? 'now' : s.now > o.sched ? 'none' : 'later' })
  const days7 = Array.from({ length: 7 }, (_, i) => s.day - 6 + i).filter((d) => d >= 1)
  const wk = s.reports.filter((r) => r.day > s.day - 7)
  const week = { reported: wk.length, possible: days7.length * 2, taken: wk.filter((r) => r.status === 'taken').length, days: new Set(wk.map((r) => r.day)).size }
  const answered = s.reports.filter((r) => r.cue).slice(-5), helped = answered.filter((r) => r.cue === 'Yes').length
  const insight = answered.length
    ? { title: helped * 2 >= answered.length ? 'Your cue seems to be fitting.' : 'Your cue might need a tweak.', body: `Helped ${helped} of your last ${answered.length} answers.` }
    : { title: 'Your evening routine', body: cue(s, 'pm') ? `After you ${yours(cue(s, 'pm')!)}, ${clock(s.pm)}` : clock(s.pm) }
  const history = days7.map((d) => ({ day: d, am: s.reports.find((r) => r.day === d && r.slot === 'am')?.status ?? 'none', pm: s.reports.find((r) => r.day === d && r.slot === 'pm')?.status ?? 'none' }))
  const nextTime = clock(s.now < s.am - WINDOW ? s.am : s.now < s.pm - WINDOW ? s.pm : s.am)
  const setRoutine = (p: Partial<RoutinePlan>) => up((d) => {
    const { am: a, pm: b, ...rest } = p
    if (a !== undefined) d.am = a
    if (b !== undefined) d.pm = b
    d.plan = { ...(d.plan ?? emptyPlan), ...rest }
  })
  let screen
  if (s.stage === 'signin')
    screen = <SignIn onDone={() => up((d) => { d.stage = 'start' })} />
  else if (s.stage === 'start')
    screen = <Start name={PATIENT} onPick={(m) => { setView('room'); up((d) => { d.mode = m; d.stage = d.plan || m === 'calm' ? 'home' : 'select' }) }} />
  else if (s.stage === 'select' || switching)
    screen = (
      <div className="select">
        <h1 className="h-title">{switching ? 'Switch companion' : 'Choose your companion'}</h1>
        <p className="sub-line">{switching ? 'Your room, tokens and plan stay exactly as they are.' : 'All eight are yours to pick. You can switch later.'}</p>
        <div className="hero">
          <div className="hero-art"><Companion id={pick} pose="happy" /></div>
          <div className="hero-text">
            <b>{companion(pick).name}</b>
            <span>{companion(pick).line}</span>
            <small>In your room, {companion(pick).name} {companion(pick).does}.</small>
          </div>
        </div>
        <div className="roster" role="listbox" aria-label="Companions">
          {COMPANIONS.map((x) => (
            <button key={x.id} role="option" aria-selected={pick === x.id} className={'portrait' + (pick === x.id ? ' on' : '')} style={{ ['--acc' as string]: x.accent }}
              onClick={() => { setPick(x.id); setNameDraft(x.id === s.cid && s.stage !== 'select' ? s.name : x.name) }}>
              <Companion id={x.id} /><span>{x.name}</span>
            </button>
          ))}
        </div>
        <label className="rename">Name <input value={nameDraft} maxLength={12} onChange={(e) => setNameDraft(e.target.value)} /></label>
        <button className="btn primary wide" onClick={() => {
          up((d) => { d.name = nameDraft.trim() || companion(pick).name; d.cid = pick; if (d.stage === 'select') d.stage = d.owned.some((o) => ['lamp', 'plant', 'poster'].includes(o.item)) ? 'home' : 'starter' /* swag room: no survey up front */ })
          setSwitching(false)
        }}>Choose {companion(pick).name}</button>
      </div>
    )
  else if (s.stage === 'quiz')
    screen = (
      <Onboarding avatar={<Avatar pose="happy" />} name={s.name} voice={calm ? 'calm' : 'game'} onDone={(plan, t) => {
        up((d) => { d.plan = plan; d.am = t.am; d.pm = t.pm; d.now = t.am + 5; d.stage = d.mode === 'calm' || d.owned.some((o) => ['lamp', 'plant', 'poster'].includes(o.item)) ? 'home' : 'starter' })
        setView('room')
      }} />
    )
  else if (s.stage === 'starter')
    screen = (
      <div className="panel-screen">
        <div className="ask"><div className="ask-sprite"><Companion id={s.cid} pose="happy" /></div><div className="speech">Welcome to your room! Pick a first piece, on the house.</div></div>
        <div className="cards3">
          {['lamp', 'plant', 'poster'].map((id) => (
            <button key={id} className="shop-card" onClick={() => {
              const o = newOwned(id, s.n)
              up((d) => { d.owned.push(o); d.stage = 'home' })
              setSel(o.uid); setEditing(true); setView('room')
              setToast({ text: 'Drag it anywhere you like. Tap Done when it looks right.' })
            }}>
              <ItemThumb id={id} /><b>{item(id).name}</b><small>Free starter</small>
            </button>
          ))}
        </div>
      </div>
    )
  else if (view === 'checkin' && open) {
    const label = open.slot === 'am' ? 'Morning' : 'Evening'
    screen = (
      <div className="panel-screen">
        <div className="ask"><div className="ask-sprite"><Avatar /></div><div className="speech">{label} check-in. {cue(s, open.slot) ? `Right after you ${yours(cue(s, open.slot)!)}.` : ''}</div></div>
        {ci.step === 'choose' && (
          <div className="choices">
            <button className="btn primary big" onClick={() => setCi({ ...ci, step: 'time' })}>Report dose taken</button>
            <button className="btn" onClick={() => { setView('room'); setToast({ text: `Okay. We'll check back later.` }) }}>Not yet</button>
            <button className="btn" onClick={() => { record('missed'); setCi({ ...ci, step: 'missed' }) }}>Missed</button>
            <button className="btn" onClick={() => { record('help'); setView('help'); setToast({ text: calm ? `Thanks. Let's find you some help.` : `+${CHECKIN_TOKENS} room tokens. Let's find you some help.` }) }}>Need help</button>
            <p className="fine">{calm ? 'Every honest answer helps your team. There are no wrong answers.' : `Every honest answer earns the same ${CHECKIN_TOKENS} tokens, once per check-in.`}</p>
          </div>
        )}
        {ci.step === 'time' && (
          <div className="choices">
            <b className="q">When did you take it?</b>
            <div className="seg">
              <button className={ci.when === 'now' ? 'on' : ''} onClick={() => setCi({ ...ci, when: 'now' })}>Just now</button>
              <button className={ci.when === 'earlier' ? 'on' : ''} onClick={() => setCi({ ...ci, when: 'earlier' })}>Earlier</button>
            </div>
            {ci.when === 'earlier' && <label className="time-in">Around <input type="time" value={toInput(ci.took)} onChange={(e) => setCi({ ...ci, took: fromInput(e.target.value) })} /></label>}
            <button className="btn primary" onClick={() => {
              const took = ci.when === 'now' ? s.now : ci.took
              if (s.reports.length % 3 === 1 && s.plan) setCi({ ...ci, took, step: 'cue' })
              else { record('taken', took); setCi({ ...ci, took, step: 'done' }) }
            }}>Save</button>
          </div>
        )}
        {ci.step === 'cue' && (
          <div className="choices">
            <b className="q">Did your planned cue help today?</b>
            {['Yes', 'Used another cue', 'Need help'].map((a) => <button key={a} className="btn" onClick={() => { record('taken', ci.took, a); if (a === 'Need help') setView('help'); else setCi({ ...ci, step: 'done' }) }}>{a}</button>)}
            <button className="btn ghost" onClick={() => { record('taken', ci.took); setCi({ ...ci, step: 'done' }) }}>Skip</button>
          </div>
        )}
      </div>
    )
  } else if (view === 'checkin')
    screen = (
      <div className="panel-screen">
        <div className="ask"><div className="ask-sprite"><Avatar pose="happy" /></div>
          <div className="speech">{ci.step === 'missed' ? `Thanks for telling me. Missed doses happen, and knowing helps your team help you.` : `Saved. Thanks for checking in!`}</div></div>
        {!calm && <div className="reward"><Icon name="star" size={22} /> +{CHECKIN_TOKENS} room tokens</div>}
        {ci.step === 'done' && <p className="fine">Reported time: {clock(ci.took)}. This is a report, not a test. Your care team uses it alongside your lab results.</p>}
        <div className="row end">
          {ci.step === 'missed' && <button className="btn" onClick={() => setView('help')}>Get help with what got in the way</button>}
          <button className="btn primary" onClick={() => setView('room')}>Back to room</button>
        </div>
      </div>
    )
  else if (view === 'shop')
    screen = (
      <div className="panel-screen">
        <div className="sheet-top"><button className="btn ghost" onClick={() => setView('room')}>Back</button><b>Shop</b><span className="tokens"><Icon name="star" size={14} /> {s.tokens}</span></div>
        <p className="fine">Tap anything to try it in your room first. You only pay if you keep it.</p>
        <div className="shop-grid three">
          {ITEMS.filter((i) => !i.reward).map((i) => (
            <button key={i.id} className="shop-card" onClick={() => preview(i.id)}>
              <ItemThumb id={i.id} /><b>{i.name}</b>
              <small className={s.tokens >= i.price ? '' : 'short'}><Icon name="star" size={14} /> {i.price}</small>
            </button>
          ))}
        </div>
        <button className="shop-card expand-card" onClick={expand}>
          <b>Add more room</b><small>{s.n >= MAX_N ? 'Max size' : `${s.n}×${s.n} → ${s.n + 1}×${s.n + 1} · `}{s.n < MAX_N && <><Icon name="star" size={14} /> {expandCost(s.n)}</>}</small>
        </button>
        <p className="fine">Demo prices. No real money, ever.</p>
      </div>
    )
  else if (view === 'game')
    screen = <ShelfShuffle onExit={() => setView('room')} onComplete={gameReward} rewardNote={`Finishing earns ${GAME_TOKENS} tokens (up to ${GAME_CAP} a day). Score doesn't matter.`} />
  else if (view === 'progress')
    screen = <Progress calm={calm} s={s} onBack={() => setView('room')} onPlay={() => setView('game')} onGift={(days, id) => up((d) => { d.gifts.push(days); d.owned.push({ ...newOwned(id, d.n), on: false }) })} />
  else if (view === 'account')
    screen = <Account name={`${PATIENT} R.`} theme={s.theme} mode={s.mode} onTheme={(th) => up((d) => { d.theme = th })}
      onMode={(m) => { setEditing(false); up((d) => { d.mode = m; if (m === 'game' && !d.owned.some((o) => ['lamp', 'plant', 'poster'].includes(o.item))) d.stage = 'select' }) }}
      onSwitchCompanion={() => { setPick(s.cid); setNameDraft(s.name); setSwitching(true) }}
      onSupport={() => setView('help')}
      onSignOut={() => { setS({ ...fresh, theme: s.theme }); setView('room') }} />
  else if (view === 'grow') {
    const k = s.trans.kids[s.trans.who]
    screen = <Grow trans={s.trans} wallet={k.id === 'maya' ? s : k} today={s.day}
      onClaim={(id) => { up((d) => { cur(d).steps[id] = { st: 'claimed', day: d.day } }); setToast({ text: `Sent to ${k.parent} to check. Points arrive once they do.` }) }}
      onToday={() => { up((d) => { const x = cur(d); if (!x.challenge.days.some((e) => e.day === d.day)) x.challenge.days.push({ day: d.day, ok: false }) }); setToast({ text: `Nice! ${k.parent} will tap “I saw it.”` }) }}
      onConfirm={(id) => { up((d) => confirmStep(d, cur(d), id, k.parent)); setToast({ text: `Confirmed by ${k.parent}.` }) }}
      onConfirmDay={(day) => { const c = CHALLENGES[k.chapter], last = k.challenge.days.filter((e) => e.ok).length === c.goal - 1; up((d) => confirmDay(d, cur(d), day)); setToast({ text: last ? `${c.title} complete! +${c.pts} points and a badge.` : `Confirmed by ${k.parent}.` }) }}
      onAsk={() => { up((d) => { const x = cur(d); x.asked = true; if (x.id === 'maya') d.reqs.unshift({ id: Date.now(), text: `Wants to talk about the ${CHAPTERS[x.chapter].name} chapter`, owner: OWNER.coord, day: d.day, hard: false }) }); setToast({ text: `Sent. The team will talk it over with ${k.name} and ${k.parent}.` }) }}
      onMessage={() => setView('help')} />
  }
  else if (view === 'help')
    screen = <Help calm={calm} onStyle={() => setView('account')} s={s} onBack={() => setView('room')} onAsk={ask} onEdit={() => setView('routine')} onSwitch={() => { setPick(s.cid); setNameDraft(s.name); setSwitching(true) }} />
  else if (calm && view === 'routine')
    screen = <CalmRoutine week={week} insight={insight} history={history} guide={guide} onSet={setRoutine}
      plan={{ am: s.am, pm: s.pm, amCue: s.plan?.amCue ?? '', pmCue: s.plan?.pmCue ?? '', food: s.plan?.food ?? '', backup: s.plan?.backup ?? '', barriers: s.plan?.barriers ?? [] }} />
  else if (calm)
    screen = <CalmToday greeting={s.now < 720 ? 'Good morning' : s.now < 1080 ? 'Good afternoon' : 'Good evening'}
      now={s.now} mascot={s.theme === 'bright'} open={open ? dv(open) : null} doses={[{ ...dv(am), m: s.am }, { ...dv(pm), m: s.pm }]} nextTime={nextTime} onRoutine={() => setView('routine')}
      onReport={() => { if (open) { record('taken', s.now); setCel(clock(s.now)) } }}
      onNotYet={() => setToast({ text: 'Okay. We\'ll check back later.' })}
      onMissed={() => { record('missed'); setCi({ step: 'missed', when: 'now', took: 0 }); setView('checkin') }}
      onHelp={() => { record('help'); setView('help') }} />
  else {
    const stored = s.owned.filter((o) => !o.on)
    screen = (
      <div className="home2">
        <div className="hud-bar">
          <span className="hud-chip"><Icon name="star" size={16} /> {s.tokens}</span>
          <span className="hud-chip"><Icon name="check" size={14} /> {partDays(s)} days</span>
          <button className={'hud-edit' + (editing ? ' on' : '')} onClick={() => { if (pending) cancelPreview(); setEditing(!editing); setSel(null) }}><Icon name={editing ? 'check' : 'edit'} size={16} />{editing ? 'Done' : 'Edit room'}</button>
        </div>
        <div className="room-wrap">
          <Room n={s.n} wall={s.wall} floor={s.floor} owned={s.owned} cid={s.cid} editing={editing} selected={sel}
            onSelect={setSel} onMove={moveItem} onExpand={expand}
            onCompanion={() => { setBubble(true); setTimeout(() => setBubble(false), 2500) }} />
          {bubble && <div className="room-bubble">{s.name} {spot.doing}.</div>}
        </div>

        {editing ? (
          <div className="edit-panel">
            {pending && selO ? (
              <div className="row between">
                <span><b>{item(selO.item).name}</b> · <Icon name="star" size={14} /> {item(selO.item).price}</span>
                <span className="row"><button className="btn ghost" onClick={cancelPreview}>Remove</button><button className="btn primary" onClick={buy}>Buy</button></span>
              </div>
            ) : selO ? (
              <div className="row between">
                <b>{item(selO.item).name}</b>
                <span className="row">
                  {item(selO.item).kind === 'floor' && <button className="mini" onClick={() => moveItem(selO.uid, { flip: !selO.flip })}>Flip</button>}
                  <button className="mini" onClick={() => { moveItem(selO.uid, { on: false }); setSel(null) }}>Store</button>
                </span>
              </div>
            ) : <p className="fine center">Drag anything to slide it around. Tap empty space to paint the room.</p>}
            <div className="swatches" aria-label={selO ? 'Item color' : 'Wall color'}>
              {(selO ? TINTS : WALLS).map((c) => (
                <button key={c} style={{ background: c }} className={(selO ? selO.tint ?? item(selO.item).tint : s.wall) === c ? 'on' : ''}
                  aria-label={`Color ${c}`} onClick={() => (selO ? moveItem(selO.uid, { tint: c }) : up((d) => { d.wall = c }))} />
              ))}
            </div>
            {!selO && (
              <div className="swatches floor" aria-label="Floor color">
                {FLOORS.map((c) => <button key={c} style={{ background: c }} className={s.floor === c ? 'on' : ''} aria-label={`Floor ${c}`} onClick={() => up((d) => { d.floor = c })} />)}
              </div>
            )}
            {!selO && stored.length > 0 && (
              <div className="tray-strip">
                {stored.map((o) => (
                  <button key={o.uid} className="tray-item" onClick={() => { moveItem(o.uid, { ...newOwned(o.item, s.n), uid: o.uid, tint: o.tint }); setSel(o.uid) }} aria-label={`Place ${item(o.item).name}`}>
                    <ItemThumb id={o.item} tint={o.tint} />
                  </button>
                ))}
              </div>
            )}
          </div>

        ) : checkinCard}

      </div>
    )
  }

  if (s.mode === 'game') return <PetApp onExit={() => up((d) => { d.mode = 'calm'; d.stage = 'home' })} />

  return (
    <div className={`pet-stage room-app calm-app theme-${s.theme}`}>
      <div className="handheld">
        <div className="notch" />
        <div className="status-bar"><span>{clock(s.now)}</span><span>Day {s.day}</span></div>
        <div className="viewport">
          <div className="view-anim" key={s.mode + view + s.stage}>{screen}</div>
          {cel && <Celebrate time={cel} total={s.reports.length} days={partDays(s)} mascot={s.theme === 'bright'} onDone={() => setCel(null)} />}
          {prompt && <SetupPrompt onLater={() => setPrompt(false)} onStart={() => { setPrompt(false); setGuide(true); setView('routine') }} />}
          {s.stage === 'home' && !switching && (calm ? ['room', 'routine', 'grow', 'help', 'account'] : ['room', 'shop', 'progress', 'help', 'account']).includes(view) && (calm
            ? <Nav view={view} onView={setView} tabs={[['room', 'Today', 'circle'], ['routine', 'Routine', 'square'], ['grow', 'Grow', 'arch'], ['account', 'Account', 'bubble']]} />
            : <Nav view={view} onView={(v) => { setEditing(false); setView(v) }} tabs={[['room', 'Room', 'circle'], ['shop', 'Shop', 'square'], ['progress', 'Play', 'diamond'], ['account', 'Account', 'bubble']]} />)}
          {notif && <button className="lock-notif" onClick={() => { setNotif(null); if (open) openCheckin() }}><span className="ln-icon"><Companion id={s.cid} /></span><span><b>Tend</b><small>now</small><br />{notif}</span></button>}
          {toast && <div className="toast" role="status">{toast.text}{toast.undo && <button onClick={() => { setS(toast.undo!); setToast(null) }}>Undo</button>}</div>}
        </div>
      </div>

      <aside className="presenter wide-panel">
        <h3>Demo controls</h3>
        <div className="pgrid">
          <button onClick={() => up((d) => { d.now = d.am + 5 })}>Morning<small>{clock(s.am + 5)}</small></button>
          <button onClick={() => up((d) => { d.now = d.pm + 10 })}>Evening<small>{clock(s.pm + 10)}</small></button>
          <button onClick={() => up((d) => { d.day += 1; d.now = d.am + 5 })}>Next day<small>room stays intact</small></button>
          <button onClick={() => up((d) => { d.simDays += 3 })}>+3 days<small>simulated, labeled</small></button>
          <button onClick={() => up((d) => { d.tokens += 100; d.ledger.push({ day: d.day, text: 'Demo points (presenter)', amt: 100, src: 'demo' }) })}>+100 tokens<small>demo only</small></button>
        </div>
        <h3>Grow <em>(simulated family + clinic)</em></h3>
        <div className="pgrid">
          {(['leo', 'maya'] as const).map((id) => { const x = s.trans.kids[id]; return (
            <button key={id} className={s.trans.who === id ? 'on' : ''} onClick={() => { up((d) => { d.trans.who = id; d.mode = 'calm'; d.stage = 'home' }); setEditing(false); setView('grow') }}>
              {x.name}, {x.age}<small>{CHAPTERS[x.chapter - 1].name} · {x.parent}</small></button>) })}
          <button disabled={!(STEPS.some((y) => stateOf(ck, y.id).st === 'claimed') || ck.challenge.days.some((e) => !e.ok))}
            onClick={() => up((d) => { const x = cur(d); STEPS.filter((y) => stateOf(x, y.id).st === 'claimed').forEach((y) => confirmStep(d, x, y.id, x.parent)); x.challenge.days.filter((e) => !e.ok).forEach((e) => confirmDay(d, x, e.day)) })}>
            {ck.parent} confirms<small>{STEPS.filter((y) => stateOf(ck, y.id).st === 'claimed').length + ck.challenge.days.filter((e) => !e.ok).length} waiting</small></button>
          <button disabled={ck.challenge.done || ck.challenge.days.filter((e) => e.ok).length >= CHALLENGES[ck.chapter].goal - 1}
            onClick={() => up((d) => { const x = cur(d), goal = CHALLENGES[x.chapter].goal; let back = 1; while (x.challenge.days.filter((e) => e.ok).length < goal - 1) { x.challenge.days.unshift({ day: -back, ok: true }); back++ } })}>
            Fill challenge<small>earlier days, demo</small></button>
          <button disabled={!STEPS.some((y) => y.ch === ck.chapter && y.how === 'clinic' && stateOf(ck, y.id).st !== 'confirmed')}
            onClick={() => { up((d) => { const x = cur(d); STEPS.filter((y) => y.ch === x.chapter && y.how === 'clinic').forEach((y) => confirmStep(d, x, y.id, 'Clinic')) }); setToast({ text: 'Clinic visit: the care team confirmed visit steps.' }) }}>
            Clinic visit<small>confirms visit steps</small></button>
          <button disabled={!readyForNext(ck)}
            onClick={() => { up((d) => { const x = cur(d); x.chapter += 1; x.asked = false; x.challenge = { days: [], done: false }; award(walletOf(d, x), d.day, CHAPTER_BONUS, `Started the ${CHAPTERS[x.chapter - 1].name} chapter`, 'level') }); setToast({ text: `Care team approved the next chapter. +${CHAPTER_BONUS} points.` }) }}>
            Team approves<small>next chapter</small></button>
        </div>
        <p className="tr-note">{ck.name}: chapter {ck.chapter}, {CHAPTERS[ck.chapter - 1].name}. The care team approves new chapters after talking with the child and parent; the app never moves a chapter on its own.</p>
        <h3>Prompting demo <em>(simulated)</em></h3>
        <div className="pgrid">
          {([['home', 'Arrives home'], ['reported', 'Already reported'], ['driving', 'Possible driving'], ['locoff', 'Location off'], ['help', 'Needs support']] as [Scenario, string][]).map(([k, l]) => (
            <button key={k} className={scn === k ? 'on' : ''} onClick={() => decide(k)}>{l}</button>
          ))}
        </div>
        {scn && <Decision k={scn} s={s} />}
        <hr />
        <div className="pgrid">
          <button onClick={() => { setS({ ...fresh, theme: s.theme }); setView('room'); setScn(null); setPick('miso'); setEditing(false); setSel(null); setPending(null) }}>Reset</button>
          <button onClick={() => up((d) => { d.stage = 'home' })}>Skip setup</button>
          <button onClick={() => { setEditing(false); setView('room'); up((d) => { d.mode = d.mode === 'calm' ? 'game' : 'calm' }) }}>{s.mode === 'calm' ? 'Game version' : 'Calm version'}<small>same data</small></button>
          {calm && <button onClick={() => up((d) => { d.theme = d.theme === 'bright' ? 'light' : d.theme === 'light' ? 'evening' : d.theme === 'evening' ? 'oura' : 'bright' })}>Theme: {s.theme}<small>bright → light → evening → Oura</small></button>}
        </div>
        <p className="links"><a href="#parent">Parent portal</a> · <a href="#patients">Compare patient days</a> · <a href="#pet">Pixel pet v1</a> · <a href="#demo">Team demo</a></p>
        {s.simDays > 0 && <p className="sim-note">Includes {s.simDays} simulated participation days.</p>}
      </aside>
    </div>
  )
}

/* ---------------- sub screens ---------------- */

function Progress({ calm, s, onBack, onPlay, onGift }: { calm: boolean; s: RS; onBack: () => void; onPlay: () => void; onGift: (days: number, id: string) => void }) {
  const days = partDays(s)
  const [choosing, setChoosing] = useState<number | null>(null)
  return (
    <div className="panel-screen">
      <div className="sheet-top"><button className="btn ghost" onClick={onBack}>Back</button><b>Progress</b><span /></div>
      <div className="stats2">
        <div><b>{days}</b><span>participation days<br /><small>total, never resets</small></span></div>
        <div><b>{streak(s)}</b><span>check-in streak<br /><small>days in a row you checked in, not a medicine score</small></span></div>
      </div>
      {!calm && <>
      <h4 className="h4">Games</h4>
      <div className="games">
        <div className="game-card open"><b>Shelf Shuffle</b><small>Untimed shelf puzzle</small><button className="mini" onClick={onPlay}>Play</button></div>
        {MILESTONES.map((m) => (
          <div key={m.days} className={'game-card' + (days >= m.days ? ' unlocked' : '')}>
            <b>{m.game}</b><small>{m.blurb}</small>
            <span className="mini tag">{days >= m.days ? 'Unlocked · preview, coming to your room' : `Unlocks at ${m.days} participation days`}</span>
          </div>
        ))}
      </div>
      <h4 className="h4">Milestone gifts</h4>
      <div className="games">
        {MILESTONES.map((m) => {
          const got = s.gifts.includes(m.days)
          return (
            <div key={m.days} className={'game-card' + (days >= m.days ? ' unlocked' : '')}>
              <b>{m.days} days together</b>
              {got ? <small>Gift claimed. It's in your storage (Edit room).</small>
                : days >= m.days ? (choosing === m.days
                  ? <div className="row wrap">{['sofa', 'bed', 'desk'].map((id) => <button key={id} className="mini" onClick={() => { onGift(m.days, id); setChoosing(null) }}>{item(id).name}</button>)}</div>
                  : <button className="mini" onClick={() => setChoosing(m.days)}>Choose a furniture gift</button>)
                : <small>Days don't need to be in a row.</small>}
            </div>
          )
        })}
      </div>
      </>}
    </div>
  )
}

function Help({ calm, onStyle, s, onBack, onAsk, onEdit, onSwitch }: { calm: boolean; onStyle: () => void; s: RS; onBack: () => void; onAsk: (t: string, id: number | null) => void; onEdit: () => void; onSwitch: () => void }) {
  const [list, setList] = useState(false)
  return (
    <div className="panel-screen">
      <div className="sheet-top"><button className="btn ghost" onClick={onBack}>Back</button><b>Routine &amp; help</b><span /></div>
      <div className="plan-cards">
        <div className="plan-card"><Icon name="sun" size={14} /><p>After I <b>{cue(s, 'am') ?? 'do my morning routine'}</b>, at <b>{clock(s.am)}</b>, I take my medicine.</p></div>
        <div className="plan-card"><Icon name="moon" size={14} /><p>After I <b>{cue(s, 'pm') ?? 'do my evening routine'}</b>, at <b>{clock(s.pm)}</b>, I take my medicine.</p></div>
      </div>
      <div className="row"><button className="btn" onClick={onEdit}>Edit my plan</button>{!calm && <button className="btn" onClick={onSwitch}>Switch companion</button>}<button className="btn" onClick={onStyle}>Account &amp; settings</button></div>
      <h4 className="h4">Something getting in the way?</h4>
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

function Decision({ k, s }: { k: Scenario; s: RS }) {
  const reported = k === 'reported'
  const ctx = { home: 'Arrived home 7:52 PM (coarse, simulated)', reported: 'Arrived home 7:52 PM (simulated)', driving: 'Moving at driving speed (simulated)', locoff: 'Location is off: using routine time only', help: '"Need help" twice this week (simulated)' }[k]
  const checks: [string, boolean][] = [
    ['Evening dose not reported yet', !reported],
    ['Inside the care team’s timing window', true],
    ['Not quiet hours', true],
    ['No routine prompt sent yet', true],
    ['Not possibly driving', k !== 'driving'],
  ]
  const decision = reported ? 'Stay quiet' : k === 'driving' ? 'Wait, then check again' : k === 'help' ? 'Offer help from a person' : 'Prompt'
  return (
    <div className="decision">
      <div><span>Routine</span>Evening dose after you {yours(cue(s, 'pm') ?? 'do my evening routine')}, {clock(s.pm)}</div>
      <div><span>Context</span>{ctx}</div>
      <div><span>Checks</span>{checks.map(([t, ok]) => <em key={t} className={ok ? 'ok' : 'no'}>{ok ? '✓' : '✕'} {t}</em>)}</div>
      <div className="dec"><span>Decision</span>{decision}</div>
      <p>Explainable rules, not a trained model. Medicine timing never moves. Clinical outreach follows its own protocol.</p>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { BAT, ROLES } from '../script'
import { Onboarding, type Plan } from '../pet/Onboarding'
import { Px } from '../pet/icons'
import '../pet/pet.css'
import './room.css'
import { COMPANIONS, Companion, companion } from './companions'
import { ITEMS, Room, SLOTS, STYLES, companionSpot, item, type Owned, type StyleId } from './Room'
import { ShelfShuffle } from './ShelfShuffle'

/* ---------------- state ---------------- */

type Slot = 'am' | 'pm'
type Report = { day: number; slot: Slot; status: 'taken' | 'missed' | 'help'; tapAt: number; tookAt?: number; cue?: string }
type Req = { id: number; text: string; owner: string; day: number; hard: boolean }
type RS = {
  stage: 'select' | 'quiz' | 'starter' | 'home'
  cid: string; name: string; plan: Plan | null; am: number; pm: number
  day: number; now: number
  reports: Report[]; tokens: number
  owned: Owned[]; style: StyleId
  gameDay: number; gameRewards: number; shelfWon: boolean
  reqs: Req[]; gifts: number[]; simDays: number
}
const KEY = 'tend-room-v1'
const fresh: RS = {
  stage: 'select', cid: 'miso', name: 'Miso', plan: null, am: 480, pm: 1200, day: 1, now: 485,
  reports: [], tokens: 0, owned: [{ uid: 'c1', item: 'chair', slot: 'front-l' }, { uid: 'r1', item: 'rug', slot: 'rug' }], style: 'cozy',
  gameDay: 0, gameRewards: 0, shelfWon: false, reqs: [], gifts: [], simDays: 0,
}
const load = (): RS => { try { return { ...fresh, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') } } catch { return fresh } }

const CHECKIN_TOKENS = 10, GAME_TOKENS = 5, GAME_CAP = 3, WINDOW = 60
const MILESTONES = [
  { days: 3, game: 'Cloud Catch', blurb: 'Move a basket between lanes to catch drifting stars. Slow mode included.' },
  { days: 7, game: 'Pattern Studio', blurb: 'Match short patterns of shapes. Unlocks rug patterns and prints.' },
  { days: 14, game: 'Pocket Garden', blurb: 'Arrange plant tiles for light and space. Unlocks planters.' },
]
const HARD = new Set([10, 11, 13]) // ran out, can't afford, refuse: a person reaches out fast
const OWNER: Record<string, string> = { coord: 'Transplant coordinator', pharm: 'Pharmacist or NP', social: 'Social worker', psych: 'Psychologist' }

const clock = (m: number) => { const h = Math.floor(m / 60) % 24; return `${((h + 11) % 12) + 1}:${String(m % 60).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}` }
const toInput = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
const fromInput = (v: string) => { const [h, m] = v.split(':').map(Number); return h * 60 + (m || 0) }
const low = (t: string) => t.charAt(0).toLowerCase() + t.slice(1)
const cue = (s: RS, slot: Slot) => { const c = slot === 'am' ? s.plan?.amCue : s.plan?.pmCue; return c && c !== 'Something else' ? low(c) : null }

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

/* ---------------- app ---------------- */

type View = 'room' | 'checkin' | 'shop' | 'place' | 'game' | 'progress' | 'help'
type Placing = { item: string; uid?: string; buy: boolean; slot: string | null }
type Scenario = 'home' | 'reported' | 'driving' | 'locoff' | 'help'

export default function RoomApp() {
  const [s, setS] = useState<RS>(load)
  const [view, setView] = useState<View>('room')
  const [placing, setPlacing] = useState<Placing | null>(null)
  const [toast, setToast] = useState<{ text: string; undo?: RS } | null>(null)
  const [pick, setPick] = useState(s.cid)
  const [nameDraft, setNameDraft] = useState(s.name)
  const [switching, setSwitching] = useState(false)
  const [bubble, setBubble] = useState(false)
  const [notif, setNotif] = useState<string | null>(null)
  const [scn, setScn] = useState<Scenario | null>(null)

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* private mode */ } }, [s])
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(null), 4000); return () => clearTimeout(id) }, [toast])
  useEffect(() => { if (!notif) return; const id = setTimeout(() => setNotif(null), 5000); return () => clearTimeout(id) }, [notif])

  const up = (fn: (d: RS) => void) => setS((p) => { const d = structuredClone(p); fn(d); return d })
  const am = opportunity(s, 'am'), pm = opportunity(s, 'pm')
  const open = [am, pm].find((o) => o.open)
  const spot = companionSpot(s.cid, s.owned)

  /* ---------- placement ---------- */
  const startPlace = (p: Placing) => { setPlacing(p); setView('place') }
  const confirmPlace = () => {
    if (!placing?.slot) return
    const before = s
    const target = placing.slot
    const it = item(placing.item)
    const prev = s.owned.find((o) => o.slot === target && o.uid !== placing.uid)
    const moved = prev ? item(prev.item).name : ''
    up((d) => {
      d.owned.forEach((o) => { if (o.slot === target) o.slot = null })
      if (placing.buy) { d.tokens -= it.price; d.owned.push({ uid: `${it.id}-${Date.now()}`, item: it.id, slot: target }) }
      else d.owned.find((o) => o.uid === placing.uid)!.slot = target
    })
    setToast({ text: `${it.name} placed${moved ? `. ${moved} went to storage` : ''}.`, undo: before })
    setPlacing(null)
    setView(s.stage === 'starter' ? 'room' : 'shop')
    if (s.stage === 'starter') up((d) => { d.stage = 'home' })
  }

  /* ---------- check-in ---------- */
  const [ci, setCi] = useState<{ step: 'choose' | 'time' | 'cue' | 'done' | 'missed'; when: 'now' | 'earlier'; took: number; status?: Report['status'] }>({ step: 'choose', when: 'now', took: 0 })
  const openCheckin = () => { setCi({ step: 'choose', when: 'now', took: open?.sched ?? s.now }); setView('checkin') }
  const record = (status: Report['status'], tookAt?: number, cueAns?: string) => {
    if (!open) return
    up((d) => {
      if (d.reports.some((r) => r.day === d.day && r.slot === open.slot)) return // one report per opportunity: no farming
      d.reports.push({ day: d.day, slot: open.slot, status, tapAt: d.now, tookAt, cue: cueAns })
      d.tokens += CHECKIN_TOKENS
    })
  }

  /* ---------- game reward ---------- */
  const gameReward = () => {
    const used = s.gameDay === s.day ? s.gameRewards : 0
    const paid = used < GAME_CAP, first = !s.shelfWon
    up((d) => {
      if (d.gameDay !== d.day) { d.gameDay = d.day; d.gameRewards = 0 }
      if (d.gameRewards < GAME_CAP) { d.gameRewards++; d.tokens += GAME_TOKENS }
      if (!d.shelfWon) { d.shelfWon = true; d.owned.push({ uid: `bookends-${Date.now()}`, item: 'bookends', slot: null }) }
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
  let screen
  if (s.stage === 'select' || switching)
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
            <button key={x.id} role="option" aria-selected={pick === x.id} className={'portrait' + (pick === x.id ? ' on' : '')} onClick={() => { setPick(x.id); setNameDraft(x.id === s.cid && s.stage !== 'select' ? s.name : x.name) }} style={{ ['--acc' as string]: x.accent }}>
              <Companion id={x.id} /><span>{x.name}</span>
            </button>
          ))}
        </div>
        <label className="rename">Name <input value={nameDraft} maxLength={12} onChange={(e) => setNameDraft(e.target.value)} /></label>
        <button className="btn primary wide" onClick={() => {
          up((d) => { d.name = nameDraft.trim() || companion(pick).name; d.cid = pick; if (d.stage === 'select') d.stage = 'quiz' })
          setSwitching(false)
        }}>Choose {companion(pick).name}</button>
      </div>
    )
  else if (s.stage === 'quiz')
    screen = (
      <Onboarding avatar={<Companion id={s.cid} pose="happy" />} name={s.name} onDone={(plan, t) => {
        up((d) => { d.plan = plan; d.am = t.am; d.pm = t.pm; d.now = t.am + 5; if (d.stage === 'quiz' && !d.owned.some((o) => ['lamp', 'plant', 'poster'].includes(o.item))) d.stage = 'starter'; else d.stage = 'home' })
        setView('room')
      }} />
    )
  else if (s.stage === 'starter' && view !== 'place')
    screen = (
      <div className="panel-screen">
        <div className="ask"><div className="ask-sprite"><Companion id={s.cid} pose="happy" /></div><div className="speech">Plan saved! Pick a first piece for your room. It's on the house.</div></div>
        <div className="cards3">
          {['lamp', 'plant', 'poster'].map((id) => (
            <button key={id} className="shop-card" onClick={() => {
              const uid = `${id}-${Date.now()}`
              up((d) => { d.owned.push({ uid, item: id, slot: null }) })
              startPlace({ item: id, uid, buy: false, slot: null })
            }}>
              <ItemThumb id={id} style={s.style} /><b>{item(id).name}</b><small>Free starter</small>
            </button>
          ))}
        </div>
      </div>
    )
  else if (view === 'place' && placing) {
    const it = item(placing.item)
    const targets = SLOTS.filter((x) => x.kind === it.kind).map((x) => ({ slot: x.id, busy: s.owned.some((o) => o.slot === x.id && o.uid !== placing.uid) }))
    const owned = placing.uid ? s.owned.map((o) => (o.uid === placing.uid ? { ...o, slot: null } : o)) : s.owned
    screen = (
      <div className="place">
        <div className="place-head"><b>Choose a spot for the {it.name.toLowerCase()}</b><small>{placing.buy ? `Preview first. Nothing is spent until you place it. Cost: ${it.price} tokens.` : 'Tap a highlighted spot.'}</small></div>
        <Room style={s.style} owned={owned} cid={s.cid} ghost={placing.slot ? { item: placing.item, slot: placing.slot } : null} targets={targets} onSlot={(sl) => setPlacing({ ...placing, slot: sl })} />
        <div className="slot-list">
          {targets.map((t) => (
            <button key={t.slot} className={'slot-btn' + (placing.slot === t.slot ? ' on' : '')} onClick={() => setPlacing({ ...placing, slot: t.slot })}>
              {SLOTS.find((x) => x.id === t.slot)!.label}{t.busy ? ' · swap' : ''}
            </button>
          ))}
        </div>
        <div className="row end">
          {s.stage !== 'starter' && <button className="btn ghost" onClick={() => { setPlacing(null); setView('shop') }}>Cancel</button>}
          <button className="btn primary" disabled={!placing.slot || (placing.buy && s.tokens < it.price)} onClick={confirmPlace}>
            {placing.buy ? `Buy for ${it.price} & place` : 'Place in room'}
          </button>
        </div>
      </div>
    )
  } else if (view === 'checkin' && open) {
    const label = open.slot === 'am' ? 'Morning' : 'Evening'
    screen = (
      <div className="panel-screen">
        <div className="ask"><div className="ask-sprite"><Companion id={s.cid} /></div><div className="speech">{label} check-in. {cue(s, open.slot) ? `Right after you ${cue(s, open.slot)!.replace(/\bmy\b/g, 'your')}.` : ''}</div></div>
        {ci.step === 'choose' && (
          <div className="choices">
            <button className="btn primary big" onClick={() => setCi({ ...ci, step: 'time', status: 'taken' })}>Report dose taken</button>
            <button className="btn" onClick={() => { setView('room'); setToast({ text: `Okay. We'll check back later.` }) }}>Not yet</button>
            <button className="btn" onClick={() => { record('missed'); setCi({ ...ci, step: 'missed', status: 'missed' }) }}>Missed</button>
            <button className="btn" onClick={() => { record('help'); setView('help'); setToast({ text: `+${CHECKIN_TOKENS} room tokens. Let's find you some help.` }) }}>Need help</button>
            <p className="fine">Every honest answer earns the same {CHECKIN_TOKENS} tokens, once per check-in.</p>
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
              const askCue = s.reports.length % 3 === 1 && !!s.plan
              if (askCue) setCi({ ...ci, took, step: 'cue' })
              else { record('taken', took); setCi({ ...ci, took, step: 'done' }) }
            }}>Save</button>
          </div>
        )}
        {ci.step === 'cue' && (
          <div className="choices">
            <b className="q">Did your planned cue help today?</b>
            {['Yes', 'Used another cue', 'Need help'].map((a) => <button key={a} className="btn" onClick={() => { record('taken', ci.took, a); if (a === 'Need help') { setView('help') } else setCi({ ...ci, step: 'done' }) }}>{a}</button>)}
            <button className="btn ghost" onClick={() => { record('taken', ci.took); setCi({ ...ci, step: 'done' }) }}>Skip</button>
          </div>
        )}
      </div>
    )
  } else if (view === 'checkin' && (ci.step === 'done' || ci.step === 'missed')) {
    screen = (
      <div className="panel-screen">
        <div className="ask"><div className="ask-sprite"><Companion id={s.cid} pose="happy" /></div>
          <div className="speech">{ci.step === 'done' ? `Saved. Thanks for checking in!` : `Thanks for telling me. Missed doses happen, and knowing helps your team help you.`}</div></div>
        <div className="reward"><Px name="star" size={22} /> +{CHECKIN_TOKENS} room tokens</div>
        {ci.step === 'done' && <p className="fine">Reported time: {clock(ci.took)}. This is a report, not a test. Your care team uses it alongside your lab results.</p>}
        <div className="row end">
          {ci.step === 'missed' && <button className="btn" onClick={() => setView('help')}>Get help with what got in the way</button>}
          <button className="btn primary" onClick={() => setView('room')}>Back to room</button>
        </div>
      </div>
    )
  } else if (view === 'shop')
    screen = <Shop s={s} onBack={() => setView('room')} onStyle={(st) => up((d) => { d.style = st })} onPreview={startPlace} onStore={(uid) => up((d) => { d.owned.find((o) => o.uid === uid)!.slot = null })} />
  else if (view === 'game')
    screen = <ShelfShuffle onExit={() => setView('room')} onComplete={gameReward} rewardNote={`Finishing earns ${GAME_TOKENS} tokens (up to ${GAME_CAP} a day). Score doesn't matter.`} />
  else if (view === 'progress')
    screen = <Progress s={s} onBack={() => setView('room')} onPlay={() => setView('game')} onGift={(days, id) => up((d) => { d.gifts.push(days); d.owned.push({ uid: `${id}-${Date.now()}`, item: id, slot: null }) })} />
  else if (view === 'help')
    screen = <Help s={s} onBack={() => setView('room')} onAsk={ask} onEdit={() => up((d) => { d.stage = 'quiz' })} onSwitch={() => { setPick(s.cid); setNameDraft(s.name); setSwitching(true) }} />
  else
    screen = (
      <div className="home2">
        <div className="topbar">
          <div><b>{s.name}'s room</b><small>{partDays(s)} participation day{partDays(s) === 1 ? '' : 's'}</small></div>
          <span className="tokens"><Px name="star" size={14} /> {s.tokens}</span>
        </div>
        <div className="room-wrap">
          <Room style={s.style} owned={s.owned} cid={s.cid} onCompanion={() => { setBubble(true); setTimeout(() => setBubble(false), 2500) }} />
          {bubble && <div className="room-bubble">{s.name} {spot.doing}.</div>}
        </div>
        <div className="checkin-card">
          {open ? (
            <>
              <div className="ci-head">
                <Px name={open.slot === 'am' ? 'sun' : 'moon'} size={16} />
                <div><b>{open.slot === 'am' ? 'Morning' : 'Evening'} check-in</b><small>{clock(open.sched)}{cue(s, open.slot) ? ` · after you ${cue(s, open.slot)!.replace(/\bmy\b/g, 'your')}` : ''}</small></div>
              </div>
              <button className="btn primary wide" onClick={openCheckin}>Check in</button>
            </>
          ) : (
            <div className="ci-head">
              <Px name="check" size={16} />
              <div><b>You're all set for now</b><small>Next check-in: {clock(s.now < s.am - WINDOW ? s.am : s.now < s.pm - WINDOW ? s.pm : s.am)}</small></div>
            </div>
          )}
          <div className="today">
            {[am, pm].map((o) => (
              <span key={o.slot} className={'pill ' + (o.rep?.status ?? 'none')}>
                <Px name={o.slot === 'am' ? 'sun' : 'moon'} size={11} /> {clock(o.sched)} · {o.rep ? { taken: 'taken', missed: 'missed', help: 'asked for help' }[o.rep.status] : o.open ? 'now' : s.now > o.sched ? 'no report' : 'later'}
              </span>
            ))}
          </div>
        </div>
        <nav className="dock">
          <button onClick={() => setView('shop')}><Px name="lamp" size={20} />Decorate</button>
          <button onClick={() => setView('game')}><Px name="star" size={20} />Play</button>
          <button onClick={() => setView('progress')}><Px name="bars" size={20} />Progress</button>
          <button onClick={() => setView('help')}><Px name="talk" size={20} />Help</button>
        </nav>
      </div>
    )

  return (
    <div className="pet-stage room-app">
      <div className="handheld">
        <div className="notch" />
        <div className="status-bar"><span>{clock(s.now)}</span><span>Day {s.day}</span></div>
        <div className="viewport">
          {screen}
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
          <button onClick={() => { setS(fresh); setView('room'); setScn(null); setPick('miso') }}>Reset</button>
          <button onClick={() => up((d) => { d.stage = 'home' })}>Skip setup</button>
        </div>
        <p className="links"><a href="#pet">Pixel pet v1</a> · <a href="#demo">Team demo</a></p>
        {s.simDays > 0 && <p className="sim-note">Includes {s.simDays} simulated participation days.</p>}
      </aside>
    </div>
  )
}

/* ---------------- sub screens ---------------- */

function ItemThumb({ id, style }: { id: string; style: StyleId }) {
  const it = item(id)
  return (
    <svg viewBox={it.kind === 'wall' ? '-34 -42 68 76' : it.kind === 'rug' ? '-60 -40 120 80' : '-60 -112 120 128'} className="thumb" aria-hidden="true">
      {it.art(STYLES[style] as never)}
    </svg>
  )
}

function Shop({ s, onBack, onStyle, onPreview, onStore }: { s: RS; onBack: () => void; onStyle: (st: StyleId) => void; onPreview: (p: Placing) => void; onStore: (uid: string) => void }) {
  const [tab, setTab] = useState<'shop' | 'mine'>('shop')
  return (
    <div className="panel-screen">
      <div className="sheet-top"><button className="btn ghost" onClick={onBack}>Back</button><b>Decorate</b><span className="tokens"><Px name="star" size={14} /> {s.tokens}</span></div>
      <div className="styles">
        {(Object.keys(STYLES) as StyleId[]).map((k) => (
          <button key={k} className={'style-chip' + (s.style === k ? ' on' : '')} onClick={() => onStyle(k)}>
            <i style={{ background: `linear-gradient(135deg, ${STYLES[k].wallL} 50%, ${STYLES[k].floor} 50%)` }} />{STYLES[k].name}
          </button>
        ))}
      </div>
      <div className="seg">
        <button className={tab === 'shop' ? 'on' : ''} onClick={() => setTab('shop')}>Catalog</button>
        <button className={tab === 'mine' ? 'on' : ''} onClick={() => setTab('mine')}>My stuff ({s.owned.length})</button>
      </div>
      <div className="shop-grid">
        {tab === 'shop' && ITEMS.filter((i) => i.price > 0).map((i) => {
          const can = s.tokens >= i.price
          return (
            <button key={i.id} className="shop-card" onClick={() => onPreview({ item: i.id, buy: true, slot: null })}>
              <ItemThumb id={i.id} style={s.style} /><b>{i.name}</b>
              <small className={can ? '' : 'short'}><Px name="star" size={10} /> {i.price}{can ? '' : ` · need ${i.price - s.tokens} more`}</small>
              <span className="mini">Preview</span>
            </button>
          )
        })}
        {tab === 'mine' && s.owned.map((o) => (
          <div key={o.uid} className="shop-card">
            <ItemThumb id={o.item} style={s.style} /><b>{item(o.item).name}</b>
            <small>{o.slot ? SLOTS.find((x) => x.id === o.slot)!.label : 'In storage'}</small>
            <div className="row">
              <button className="mini" onClick={() => onPreview({ item: o.item, uid: o.uid, buy: false, slot: null })}>{o.slot ? 'Move' : 'Place'}</button>
              {o.slot && <button className="mini" onClick={() => onStore(o.uid)}>Store</button>}
            </div>
          </div>
        ))}
      </div>
      <p className="fine">Prices are demo values. No real money, ever. Stored items are yours to place again for free.</p>
    </div>
  )
}

function Progress({ s, onBack, onPlay, onGift }: { s: RS; onBack: () => void; onPlay: () => void; onGift: (days: number, id: string) => void }) {
  const days = partDays(s)
  const [choosing, setChoosing] = useState<number | null>(null)
  return (
    <div className="panel-screen">
      <div className="sheet-top"><button className="btn ghost" onClick={onBack}>Back</button><b>Progress</b><span /></div>
      <div className="stats2">
        <div><b>{days}</b><span>participation days<br /><small>total, never resets</small></span></div>
        <div><b>{streak(s)}</b><span>check-in streak<br /><small>days in a row you checked in, not a medicine score</small></span></div>
      </div>
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
              {got ? <small>Gift claimed. Check My stuff.</small>
                : days >= m.days ? (choosing === m.days
                  ? <div className="row wrap">{['sofa', 'shelf', 'rug-stripe'].map((id) => <button key={id} className="mini" onClick={() => { onGift(m.days, id); setChoosing(null) }}>{item(id).name}</button>)}</div>
                  : <button className="mini" onClick={() => setChoosing(m.days)}>Choose a furniture gift</button>)
                : <small>Days don't need to be in a row.</small>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Help({ s, onBack, onAsk, onEdit, onSwitch }: { s: RS; onBack: () => void; onAsk: (t: string, id: number | null) => void; onEdit: () => void; onSwitch: () => void }) {
  const [list, setList] = useState(false)
  const amC = cue(s, 'am') ?? 'do my morning routine', pmC = cue(s, 'pm') ?? 'do my evening routine'
  return (
    <div className="panel-screen">
      <div className="sheet-top"><button className="btn ghost" onClick={onBack}>Back</button><b>Routine &amp; help</b><span /></div>
      <div className="plan-cards">
        <div className="plan-card"><Px name="sun" size={14} /><p>After I <b>{amC}</b>, at <b>{clock(s.am)}</b>, I take my medicine.</p></div>
        <div className="plan-card"><Px name="moon" size={14} /><p>After I <b>{pmC}</b>, at <b>{clock(s.pm)}</b>, I take my medicine.</p></div>
      </div>
      <div className="row"><button className="btn" onClick={onEdit}>Edit my plan</button><button className="btn" onClick={onSwitch}>Switch companion</button></div>
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
      <div><span>Routine</span>Evening dose after you {(cue(s, 'pm') ?? 'do your evening routine').replace(/my/g, 'your')}, {clock(s.pm)}</div>
      <div><span>Context</span>{ctx}</div>
      <div><span>Checks</span>{checks.map(([t, ok]) => <em key={t} className={ok ? 'ok' : 'no'}>{ok ? '✓' : '✕'} {t}</em>)}</div>
      <div className="dec"><span>Decision</span>{decision}</div>
      <p>Explainable rules, not a trained model. Medicine timing never moves. Clinical outreach follows its own protocol.</p>
    </div>
  )
}

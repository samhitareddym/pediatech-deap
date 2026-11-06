import { useState } from 'react'
import './day-planner.css'

// Linked calendar + proactive help. Plain rules over a simulated calendar, pharmacy and care-plan record.
// The same triggers drive the patient's suggestion and the care team's agent card. Nothing real is sent.

type Ev = { start: number; end: number; title: string; src: string }
type Day = 'busy' | 'free' | 'late'
type P = {
  id: 'maya' | 'jordan'; name: string; age: number; blurb: string
  am: number; pm: number; events: Ev[]; barriers: string[]
  supplyDays: number; pharmacy: { name: string; ships: boolean; open: [number, number] }
  labsDueDays: number; tomorrow: string[]
}
const PATIENTS: P[] = [
  { id: 'maya', name: 'Maya', age: 15, blurb: 'School, friends, evening routine', am: 480, pm: 1200,
    events: [{ start: 930, end: 1020, title: 'Art club', src: 'School' }, { start: 1140, end: 1290, title: 'Dinner with friends', src: 'Personal' }],
    barriers: ['privacy'], supplyDays: 12, pharmacy: { name: 'Community Pharmacy', ships: true, open: [540, 1080] }, labsDueDays: 20, tomorrow: ['Sleepover at Ava’s'] },
  { id: 'jordan', name: 'Jordan', age: 20, blurb: 'College, work, managing refills', am: 540, pm: 1260,
    events: [{ start: 540, end: 720, title: 'Classes', src: 'College' }, { start: 750, end: 1110, title: 'Work shift', src: 'Personal' }],
    barriers: ['running out'], supplyDays: 2, pharmacy: { name: 'Community Pharmacy', ships: true, open: [540, 1080] }, labsDueDays: 2, tomorrow: [] },
]

const clock = (m: number) => { const h = Math.floor(m / 60) % 24; return `${((h + 11) % 12) + 1}:${String(m % 60).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}` }
const span = (e: { start: number; end: number }) => `${clock(e.start)} – ${clock(e.end)}`

/* longest free gap inside a window, given busy events */
function freeGap(events: Ev[], [a, b]: [number, number]) {
  let cur = a, best = { start: a, len: 0 }
  for (const e of [...events].sort((x, y) => x.start - y.start)) {
    if (e.end <= a || e.start >= b) continue
    if (e.start - cur > best.len) best = { start: cur, len: e.start - cur }
    cur = Math.max(cur, e.end)
  }
  if (b - cur > best.len) best = { start: cur, len: b - cur }
  return best
}

/* the sample day changes Jordan's calendar and supply (demo switch) */
function applyDay(p: P, day: Day): P {
  if (p.id !== 'jordan') return p
  if (day === 'free') return { ...p, events: p.events.map((e) => (e.title === 'Work shift' ? { ...e, start: 1110, end: 1260 } : e)) }
  if (day === 'late') return { ...p, supplyDays: 0 }
  return p
}

type Rule = {
  id: string; tag: string; urgent?: boolean
  when: (p: P) => boolean
  title: (p: P) => string; say: (p: P) => string; why: (p: P) => string[]
  act: string; done: (p: P) => string
  team: { owner: string; note: (p: P) => string; action: string }
}
const RULES: Rule[] = [
  { id: 'supply-out', tag: 'Refill', urgent: true,
    when: (p) => p.supplyDays < 1,
    title: () => 'Your medicine runs out today', say: () => 'Shipping won’t make it in time. Want your team to sort it out now?',
    why: (p) => [`You reported supply through today`, `${p.pharmacy.name} shipping arrives tomorrow at the earliest`],
    act: 'Get help now', done: () => 'Your team will call you today',
    team: { owner: 'Social worker', note: (p) => `${p.name}: supply ends today, shipping too late. Agent drafted an urgent call and an emergency fill request.`, action: 'Call today' } },
  { id: 'ship-refill', tag: 'Refill',
    when: (p) => p.supplyDays >= 1 && p.supplyDays <= 3 && p.pharmacy.ships && freeGap(p.events, p.pharmacy.open).len < 60,
    title: () => 'Refill due, and your day is packed', say: (p) => `${p.pharmacy.name} can ship it by Saturday. Request it?`,
    why: (p) => [`About ${p.supplyDays} days of medicine left (you reported)`, `Longest free gap during pickup hours: ${freeGap(p.events, p.pharmacy.open).len} min`, `${p.pharmacy.name} ships this prescription`],
    act: 'Request shipping', done: (p) => `Request sent to ${p.pharmacy.name} for review`,
    team: { owner: 'Pharmacist', note: (p) => `${p.name}: existing tacrolimus refill, busy day, pharmacy ships. Agent prepared a shipping request. Same dose and quantity.`, action: 'Approve request' } },
  { id: 'pickup-window', tag: 'Refill',
    when: (p) => p.supplyDays >= 1 && p.supplyDays <= 3 && freeGap(p.events, p.pharmacy.open).len >= 60,
    title: (p) => `Refill due. You’re free at ${clock(freeGap(p.events, p.pharmacy.open).start)}`, say: (p) => `Add a pickup at ${p.pharmacy.name} to your calendar?`,
    why: (p) => [`About ${p.supplyDays} days of medicine left`, `Free ${clock(freeGap(p.events, p.pharmacy.open).start)} for ${freeGap(p.events, p.pharmacy.open).len} min during pickup hours`],
    act: 'Add pickup', done: (p) => `Pickup added at ${clock(freeGap(p.events, p.pharmacy.open).start)}`,
    team: { owner: 'Pharmacist', note: (p) => `${p.name} plans to pick up today. Agent will confirm the refill is ready.`, action: 'Mark ready' } },
  { id: 'privacy-overlap', tag: 'Evening dose',
    when: (p) => p.barriers.includes('privacy') && p.events.some((e) => e.start <= p.pm + 30 && e.end >= p.pm - 30),
    title: (p) => `${p.events.find((e) => e.start <= p.pm + 30 && e.end >= p.pm - 30)!.title} overlaps your ${clock(p.pm)} dose`,
    say: () => 'Want a discreet “mock call” to step away for a minute?',
    why: (p) => [`Your calendar: ${p.events.find((e) => e.start <= p.pm + 30 && e.end >= p.pm - 30)!.title}`, 'You said taking medicine around friends feels awkward', 'Your dose time stays the same'],
    act: 'Set mock call', done: (p) => `Mock call set for ${clock(p.pm)}`,
    team: { owner: 'Coordinator', note: (p) => `${p.name}: social plans overlap the evening dose, privacy barrier. Agent offered a mock-call cue. No action needed.`, action: 'Looks good' } },
  { id: 'labs-due', tag: 'Labs',
    when: (p) => p.labsDueDays <= 3,
    title: () => 'Labs due this week', say: () => 'Saturday 9:00 AM is open on your calendar. Book it?',
    why: (p) => [`Last labs ~${42 - p.labsDueDays} days ago; due every 6 weeks`, 'Saturday morning has no events'],
    act: 'Book Saturday', done: () => 'Lab draw booked for Sat 9:00 AM',
    team: { owner: 'Coordinator', note: (p) => `${p.name}: labs due in ${p.labsDueDays} days. Agent found Sat 9 AM free and drafted the lab order reminder.`, action: 'Send lab order' } },
  { id: 'sleepover', tag: 'Tomorrow',
    when: (p) => p.tomorrow.some((t) => /sleepover|trip|away/i.test(t)),
    title: (p) => `${p.tomorrow[0]} tomorrow`, say: () => 'Pack your evening dose tonight? I’ll nudge you at 9 PM.',
    why: (p) => [`Your calendar: ${p.tomorrow[0]}`, 'Weekends and sleepovers are when doses get missed most'],
    act: 'Remind me', done: () => 'Reminder set for 9:00 PM tonight',
    team: { owner: 'Coordinator', note: (p) => `${p.name}: overnight away tomorrow. Agent set a packing reminder. No action needed.`, action: 'Looks good' } },
]
const fired = (p: P) => RULES.filter((r) => r.when(p))

/* ---------- patient view: your day + suggestions ---------- */
export function DayPlanner({ patientId = 'maya', day = 'busy', compareLink = false, eveningTime, eveningMinutes, eveningReported = false }: {
  patientId?: P['id']; day?: Day; compareLink?: boolean; eveningTime?: string; eveningMinutes?: number; eveningReported?: boolean
}) {
  const base = applyDay(PATIENTS.find((x) => x.id === patientId)!, day)
  const p = eveningMinutes ? { ...base, pm: eveningMinutes } : base
  const [done, setDone] = useState<Record<string, boolean>>({})
  const [later, setLater] = useState<Record<string, boolean>>({})
  const rules = fired(p).filter((r) => !(r.id === 'privacy-overlap' && eveningReported))
  const rows = [
    ...p.events.map((e) => ({ t: e.start, el: <li key={e.title}><time>{span(e)}</time><div><b>{e.title}</b><small>{e.src} calendar</small></div></li> })),
    { t: p.am, el: <li key="am" className="dose"><time>{clock(p.am)}</time><div><b>Morning medicine</b><small>Your routine</small></div></li> },
    { t: p.pm, el: <li key="pm" className="dose"><time>{eveningTime ?? clock(p.pm)}</time><div><b>Evening medicine</b><small>{eveningReported ? 'Reported' : 'Your routine'}</small></div></li> },
  ].sort((a, b) => a.t - b.t)

  return (
    <section className="dp" aria-label={`${p.name}'s day`}>
      <div className="dp-head"><h3>Your day</h3><span className="dp-linked">Calendar linked</span></div>
      <ol className="dp-timeline">{rows.map((r) => r.el)}</ol>
      {rules.length > 0 && <h3 className="dp-sub">ReNu can help</h3>}
      {rules.map((r) => (
        <article key={r.id} className={'dp-card' + (r.urgent ? ' urgent' : '') + (done[r.id] ? ' done' : '')}>
          <span className="dp-tag">{r.tag}</span>
          <b>{r.title(p)}</b>
          {done[r.id] ? <p className="dp-ok">✓ {r.done(p)}</p>
            : later[r.id] ? <p className="dp-muted">Saved for later</p>
            : <>
                <p>{r.say(p)}</p>
                <div className="dp-acts">
                  <button className="dp-yes" onClick={() => setDone({ ...done, [r.id]: true })}>{r.act}</button>
                  <button className="dp-no" onClick={() => setLater({ ...later, [r.id]: true })}>Not now</button>
                </div>
              </>}
          <details><summary>Why?</summary><ul>{r.why(p).map((w) => <li key={w}>{w}</li>)}</ul></details>
        </article>
      ))}
      <p className="dp-fine">Simulated calendar, pharmacy and care plan. Nothing is ordered or sent.</p>
      {compareLink && <a className="dp-compare" href="#patients">Compare two patients' days →</a>}
    </section>
  )
}

/* ---------- care team view: same triggers, agent-drafted next steps ---------- */
export function CareView({ patientId, day = 'busy' }: { patientId: P['id']; day?: Day }) {
  const p = applyDay(PATIENTS.find((x) => x.id === patientId)!, day)
  const [ok, setOk] = useState<Record<string, boolean>>({})
  return (
    <section className="cv" aria-label={`Care team view for ${p.name}`}>
      <div className="dp-head"><h3>Care team · agent</h3><span className="dp-linked">{fired(p).length} trigger{fired(p).length === 1 ? '' : 's'}</span></div>
      {fired(p).map((r) => (
        <article key={r.id} className={'cv-card' + (r.urgent ? ' urgent' : '')}>
          <div className="cv-top"><span className="cv-owner">{r.team.owner}</span>{r.urgent && <span className="cv-urgent">Today</span>}</div>
          <p>{r.team.note(p)}</p>
          {ok[r.id] ? <p className="dp-ok">✓ Done · logged to chart (simulated)</p>
            : <button className="dp-yes" onClick={() => setOk({ ...ok, [r.id]: true })}>{r.team.action}</button>}
        </article>
      ))}
    </section>
  )
}

/* ---------- side by side (#patients) ---------- */
export default function PatientDays() {
  const [days, setDays] = useState<Record<string, Day>>({ maya: 'busy', jordan: 'busy' })
  return (
    <main className="pd calm-app theme-bright">
      <header className="pd-top"><a href="#">← Back to app</a><span>Fictional patients · simulated connections</span></header>
      <h1>Two patients. Different days.</h1>
      <p className="pd-lede">ReNu reads the linked calendar, spots what could get in the way, and offers one next step. The care team sees the same triggers with an agent-drafted action.</p>
      <div className="pd-grid">
        {PATIENTS.map((p) => (
          <section key={p.id} className="pd-col">
            <header className="pd-who">
              <span className="pd-av">{p.name[0]}</span>
              <div><b>{p.name}, {p.age}</b><small>{p.blurb}</small></div>
            </header>
            {p.id === 'jordan' && (
              <div className="pd-days" role="radiogroup" aria-label="Sample day">
                {([['busy', 'Busy day'], ['free', 'Free afternoon'], ['late', 'Out of medicine']] as [Day, string][]).map(([k, l]) => (
                  <button key={k} role="radio" aria-checked={days.jordan === k} className={days.jordan === k ? 'on' : ''} onClick={() => setDays({ ...days, jordan: k })}>{l}</button>
                ))}
              </div>
            )}
            <div className="pd-phone" key={p.id + days[p.id]}><DayPlanner patientId={p.id} day={days[p.id]} /></div>
            <CareView key={'cv' + p.id + days[p.id]} patientId={p.id} day={days[p.id]} />
          </section>
        ))}
      </div>
    </main>
  )
}

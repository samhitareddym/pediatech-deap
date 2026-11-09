import { useEffect, useState } from 'react'
import { CHALLENGES, Grow, STEPS, award, freshTrans, stateOf, type Kid, type Trans } from './room/grow'
import { CareView, DayPlanner } from './room/DayPlanner'
import './pet/pet.css'
import './room/room.css'
import './room/calm.css'
import './room/grow.css'
import './room/midnight.css'
import './views.css'

/* Demo views: one URL per experience so the team can walk through them in order, like a kid growing up.
   Hash routes keep it to one Vite entry and work from any static server. All data is synthetic. */

export const VIEWS = [
  { id: 'kid', n: 1, title: 'Kid app', who: 'Leo, 8', line: 'Small jobs while a parent gives the doses. Monthly challenge, parent says “I saw it.”' },
  { id: 'parent', n: 2, title: 'Parent portal', who: 'Ana, Leo’s mom', line: 'Calendar + pharmacy setup with nothing to type, dose tracking, pack reminders.' },
  { id: 'teen', n: 3, title: 'Teen app', who: 'Maya, 15', line: 'Her own check-ins, schedule, connected apps, weekly reward, Grow.' },
  { id: 'young-adult', n: 4, title: 'Young adult', who: 'Jordan, 20', line: 'Owns refills, labs and a busy class and work schedule.' },
  { id: 'care-team', n: 5, title: 'Care team', who: 'Riley Chen, RN and team', line: 'Worklist, patient review, referrals, agreed plans and follow-up.' },
] as const
export type ViewId = (typeof VIEWS)[number]['id']

/* Thin bar on every view: where you are, previous / next, back to the list */
export function DemoBar({ id }: { id: ViewId }) {
  const i = VIEWS.findIndex((v) => v.id === id), prev = VIEWS[i - 1], next = VIEWS[i + 1]
  return (
    <nav className="demo-bar" aria-label="Demo views">
      <a className="db-home" href="#/">ReNew demo</a>
      <ol>{VIEWS.map((v) => <li key={v.id}><a href={`#/${v.id}`} aria-current={v.id === id ? 'page' : undefined}><b>{v.n}</b>{v.title}</a></li>)}</ol>
      <span className="db-step">
        {prev ? <a href={`#/${prev.id}`} aria-label={`Previous: ${prev.title}`}>‹ Prev</a> : <span />}
        {next ? <a href={`#/${next.id}`} aria-label={`Next: ${next.title}`}>Next ›</a> : <span />}
      </span>
    </nav>
  )
}

export function Hub() {
  return (
    <main className="hub">
      <p className="hub-kicker">Pedia Tech · CCHMC Digital Health Hackathon</p>
      <h1>ReNew demo</h1>
      <p className="hub-lede">One kidney transplant journey, from a parent-run kid app to a young adult who owns their care, with the care team behind every stage. Pick a view, or start at 1 and use Next.</p>
      <ol className="hub-list">
        {VIEWS.map((v) => (
          <li key={v.id}><a href={`#/${v.id}`}>
            <span className="hub-n">{v.n}</span>
            <span className="hub-t"><b>{v.title}</b><small>{v.who}</small><em>{v.line}</em></span>
            <span className="hub-go" aria-hidden="true">›</span>
          </a></li>
        ))}
      </ol>
      <p className="hub-fine">Fictional patients, synthetic data, simulated connections and time. Not medical advice. Each view keeps its own demo controls and Reset.</p>
    </main>
  )
}

/* 1 · Kid app: Leo's challenge and skills; Mom confirms in the same app (Mom tab) */
const KEY = 'renew-kid-v1'
const freshKid = (): Trans => ({ ...freshTrans(), who: 'leo' })
export function KidView() {
  const [t, setT] = useState<Trans>(() => { try { return JSON.parse(localStorage.getItem(KEY) ?? '') as Trans } catch { return freshKid() } })
  const [day, setDay] = useState(1)
  const [toast, setToast] = useState<string | null>(null)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(t)) } catch { /* private mode */ } }, [t])
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(null), 3000); return () => clearTimeout(id) }, [toast])
  const up = (fn: (k: Kid) => void) => setT((x) => { const d = structuredClone(x); fn(d.kids.leo); return d })
  const k = t.kids.leo, c = CHALLENGES[k.chapter]
  return (
    <div className="pet-stage room-app calm-app theme-bright">
      <div className="handheld">
        <div className="notch" />
        <div className="status-bar"><span>7:30 PM</span><span>Day {day}</span></div>
        <div className="viewport">
          <Grow trans={t} wallet={k} today={day}
            onClaim={(id) => { up((x) => { x.steps[id] = { st: 'claimed', day } }); setToast('Sent to Mom to check.') }}
            onToday={() => { up((x) => { if (!x.challenge.days.some((e) => e.day === day)) x.challenge.days.push({ day, ok: false }) }); setToast('Nice! Mom will tap “I saw it.”') }}
            onConfirm={(id) => { up((x) => { const s = STEPS.find((y) => y.id === id)!; if (stateOf(x, id).st === 'confirmed') return; x.steps[id] = { st: 'confirmed', by: 'Mom', day }; award(x, day, s.pts, s.label, 'skill') }); setToast('Confirmed by Mom.') }}
            onConfirmDay={(d) => { up((x) => { const e = x.challenge.days.find((y) => y.day === d); if (!e || e.ok) return; e.ok = true; if (!x.challenge.done && x.challenge.days.filter((y) => y.ok).length >= c.goal) { x.challenge.done = true; x.badges.push(c.badge); award(x, day, c.pts, `${c.title} challenge complete`, 'challenge') } }); setToast('Confirmed by Mom.') }}
            onAsk={() => { up((x) => { x.asked = true }); setToast('Sent. The care team will talk it over with Leo and Mom.') }}
            onMessage={() => setToast('Message the care team (simulated).')} />
          {toast && <div className="toast" role="status">{toast}</div>}
        </div>
      </div>
      <aside className="presenter wide-panel">
        <h3>Kid app <em>(simulated)</em></h3>
        <p className="tr-note">Leo, 8. Tap “Did it” on the challenge, switch to the Mom tab, tap “I saw it.” Points and the badge arrive only after Mom confirms.</p>
        <div className="pgrid">
          <button onClick={() => setDay(day + 1)}>Next day<small>Day {day + 1}</small></button>
          <button onClick={() => { up((x) => { const have = new Set(x.challenge.days.map((e) => e.day)); for (let d = 1; x.challenge.days.length < c.goal - 1; d++) if (!have.has(d)) x.challenge.days.push({ day: d, ok: false }) }); setDay(c.goal) }}>Fill challenge<small>{c.goal - 1} days done</small></button>
          <button onClick={() => { setT(freshKid()); setDay(1) }}>Reset<small>start over</small></button>
        </div>
      </aside>
    </div>
  )
}

/* 4 · Young adult: Jordan's day planner and what the care team sees */
type Day = 'busy' | 'free' | 'late'
export function YoungAdultView() {
  const [day, setDay] = useState<Day>('busy')
  return (
    <main className="pd calm-app theme-bright ya">
      <h1>Jordan, 20: owning it</h1>
      <p className="pd-lede">Classes and a work shift fill the day. ReNew reads the linked calendar, spots what could get in the way, and offers one next step. The care team sees the same trigger with a drafted action for a person to approve.</p>
      <div className="pd-days" role="radiogroup" aria-label="Sample day">
        {([['busy', 'Busy day'], ['free', 'Free afternoon'], ['late', 'Out of medicine']] as [Day, string][]).map(([k, l]) => (
          <button key={k} role="radio" aria-checked={day === k} className={day === k ? 'on' : ''} onClick={() => setDay(k)}>{l}</button>
        ))}
      </div>
      <div className="pd-grid">
        <section className="pd-col"><p className="ya-label">Jordan's phone</p><div className="pd-phone" key={day}><DayPlanner patientId="jordan" day={day} /></div></section>
        <section className="pd-col"><p className="ya-label">Care team sees</p><CareView key={'cv' + day} patientId="jordan" day={day} /></section>
      </div>
      <p className="ya-fine">Fictional patient · simulated calendar, pharmacy and agent drafts</p>
    </main>
  )
}

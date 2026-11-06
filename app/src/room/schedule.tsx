import { useState } from 'react'
import { Icon } from './calm'
import './schedule.css'

/* Schedule setup (shared by the teen app and the parent portal).
   After the barrier checklist at the visit, the family connects a calendar and a pharmacy (both simulated).
   Medicines and label instructions come from the pharmacy; the weekly calendar shows when they are away.
   Tend suggests dose times inside the care team's window, the family accepts or nudges them, and on any day an
   event overlaps a dose, a morning reminder names the exact medicines to bring. Synthetic data; not medical advice. */

export type Slot = 'am' | 'mid' | 'pm'
export type Med = { id: string; name: string; why: string; instr: string; slots: Slot[]; days?: number[]; refill?: number }
export type Ev = { id: string; title: string; days: number[]; start: number; end: number; kind?: 'school' | 'work' | 'activity' | 'overnight'; who?: string }
export type Profile = { child: string; parent: string; meds: Med[]; events: Ev[]; added: Ev; provider: Record<Slot, number> }
export type Times = Record<Slot, number>
export type Away = { ev: Ev; items: { slot: Slot; t: number; next: boolean; meds: Med[] }[] }

export const WIN = 60 // minutes the family can move a time without asking the team
export const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const SLOT: Record<Slot, { label: string; glyph: 'sun' | 'star' | 'moon'; tone: string }> = {
  am: { label: 'Morning', glyph: 'sun', tone: 'var(--sys-orange)' },
  mid: { label: 'Midday', glyph: 'star', tone: 'var(--sys-teal)' },
  pm: { label: 'Evening', glyph: 'moon', tone: 'var(--sys-indigo)' },
}
export const CALS = ['Google Calendar', 'Apple Calendar', 'Outlook']
export const PHARMS: { name: string; site: string }[] = [
  { name: 'Walgreens', site: 'walgreens.com' },
  { name: 'CVS Pharmacy', site: 'cvs.com' },
  { name: "Cincinnati Children's Pharmacy", site: 'cincinnatichildrens.org' },
  { name: 'Kroger Pharmacy', site: 'kroger.com' },
]

export const clock = (m: number) => { const h = Math.floor(m / 60) % 24; return `${((h + 11) % 12) + 1}:${String(m % 60).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}` }
const short = (m: number) => clock(m).replace(':00', '')
export const span = (e: Ev) => `${short(e.start)}–${short(e.end % 1440)}${e.end > 1440 ? ' next day' : ''}`
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
const round15 = (m: number) => Math.round(m / 15) * 15
/* simulated day 1 = Fri, Nov 6, 2026 */
const date = (day: number) => new Date(2026, 10, 5 + day)
export const dowOf = (day: number) => date(day).getDay()
export const dayLabel = (day: number) => date(day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

export const usedSlots = (p: Profile) => (['am', 'mid', 'pm'] as Slot[]).filter((k) => p.meds.some((m) => m.slots.includes(k)))
export const medsFor = (p: Profile, slot: Slot, dow: number) => p.meds.filter((m) => m.slots.includes(slot) && (!m.days || m.days.includes(dow)))
export const timesOf = (am: number, mid: number): Times => ({ am, mid, pm: am + 720 })

/* Suggest: morning dose 30 minutes before the earliest weekday departure (school, work), kept inside the care team's window. */
export function suggest(p: Profile, events: Ev[]) {
  const lo = p.provider.am - WIN, hi = p.provider.am + WIN
  const first = events.filter((e) => e.start >= 300 && e.start <= 660 && e.days.some((d) => d >= 1 && d <= 5)).sort((a, b) => a.start - b.start)[0]
  const am = first ? clamp(round15(first.start - 30), lo, hi) : p.provider.am
  const why = first ? `${first.start - 30 < lo ? 'Earliest the care team suggests' : '30 min'} before ${first.who ? `${first.who} leaves for ` : ''}${first.title.toLowerCase()} at ${clock(first.start)}` : `The care team's suggested time`
  return { am, mid: p.provider.mid, why }
}

/* Doses that fall inside events starting on this weekday (overnight events reach into the next morning).
   School counts as covered (the school nurse gives midday doses); a parent's work is not a reason to pack. */
export function awayOn(p: Profile, events: Ev[], t: Times, dow: number): Away[] {
  const out: Away[] = []
  for (const ev of events) {
    if (!ev.days.includes(dow) || ev.kind === 'school' || ev.kind === 'work') continue
    const items: Away['items'] = []
    for (const slot of usedSlots(p)) for (const next of [false, true]) {
      const at = t[slot] + (next ? 1440 : 0)
      if (at < ev.start || at >= ev.end) continue
      const meds = medsFor(p, slot, next ? (dow + 1) % 7 : dow)
      if (meds.length) items.push({ slot, t: t[slot], next, meds })
    }
    items.sort((a, b) => a.t + (a.next ? 1440 : 0) - (b.t + (b.next ? 1440 : 0)))
    if (items.length) out.push({ ev, items })
  }
  return out
}
export const nurseOn = (p: Profile, events: Ev[], t: Times, dow: number) =>
  usedSlots(p).includes('mid') && events.some((e) => e.kind === 'school' && e.days.includes(dow) && t.mid >= e.start && t.mid < e.end)
const itemLabel = (i: Away['items'][number], lower = false) => { const l = (i.next ? 'Tomorrow ' + SLOT[i.slot].label.toLowerCase() : SLOT[i.slot].label); return `${lower ? l.toLowerCase() : l} ${clock(i.t)}` }
/* one-line notification text: the event, the dose times it covers, and every medicine to bring */
export const packLine = (a: Away[]) => `${a.map((x) => `${x.ev.title} (${span(x.ev)})`).join(', ')}. Pack your ${a.flatMap((x) => x.items.map((i) => itemLabel(i, true))).join(' + ')} medicines: ${[...new Set(a.flatMap((x) => x.items.flatMap((i) => i.meds.map((m) => m.name))))].join(', ')}.`

/* ---------- pieces ---------- */

export function WeekView({ p, events, t, from, n = 7 }: { p: Profile; events: Ev[]; t: Times; from: number; n?: number }) {
  const slots = usedSlots(p)
  return (
    <div className="group sc-week" aria-label="Your week">
      {Array.from({ length: n }, (_, i) => from + i).map((day) => {
        const dow = dowOf(day), away = awayOn(p, events, t, dow), nurse = nurseOn(p, events, t, dow)
        const busy = events.filter((e) => e.days.includes(dow) && e.kind !== 'work')
        return (
          <div key={day} className="row-ios sc-day">
            <span className="glyph" style={{ background: away.length ? 'var(--sys-orange)' : 'var(--sys-green)' }}><Icon name={away.length ? 'bag' : 'home'} size={15} /></span>
            <span className="row-title">{dayLabel(day)}
              <small>{slots.map((k) => short(t[k])).join(' · ')}{busy.length ? ` · ${busy.map((e) => e.title).join(', ')}` : ''}</small></span>
            <span className="sc-tags">
              {away.flatMap((a) => a.items).map((i) => <span key={i.slot + i.next} className="sc-tag pack">Pack {i.next ? 'next ' : ''}{SLOT[i.slot].label.toLowerCase()}</span>)}
              {nurse && <span className="sc-tag">Nurse midday</span>}
              {!away.length && !nurse && <span className="sc-tag home">Home</span>}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* Today card: what to bring, by name, for each event that overlaps a dose */
export function AwayCard({ away, packed, onPacked, child }: { away: Away[]; packed: boolean; onPacked: () => void; child?: string }) {
  return (
    <div className={'sc-away' + (packed ? ' packed' : '')} aria-label="Away today">
      <p className="group-label">{child ? `${child} is away today` : 'Away today'}</p>
      {away.map((a) => (
        <div key={a.ev.id} className="sc-away-ev">
          <b>{a.ev.title}</b><small>{span(a.ev)} · overlaps {a.items.map((i) => itemLabel(i, true)).join(' and ')}</small>
          {a.items.map((i) => (
            <div key={i.slot + i.next} className="sc-bring"><span className="sc-tag pack">{itemLabel(i)}</span>
              <ul>{i.meds.map((m) => <li key={m.id}>{m.name}</li>)}</ul></div>
          ))}
        </div>
      ))}
      <button className="cbtn primary" onClick={onPacked} disabled={packed}>{packed ? '✓ Packed' : 'Packed'}</button>
    </div>
  )
}

/* Visit-done card shown on Today until setup is finished */
export function SetupCard({ who, onStart }: { who: string; onStart: () => void }) {
  return (
    <div className="sc-start">
      <div className="row-ios"><span className="glyph" style={{ background: 'var(--sys-green)' }}><Icon name="check" size={15} /></span>
        <span className="row-title">Visit checklist done<small>With Riley Chen, RN · {dayLabel(1)}</small></span></div>
      <b>Next: set up {who} medicine schedule</b>
      <small>Connect your calendar and pharmacy. We suggest times around school, work and practice, and remind you what to bring on busy days.</small>
      <button className="cbtn primary" onClick={onStart}>Set up schedule</button>
    </div>
  )
}

/* ---------- setup flow ---------- */

type St = 'intro' | 'cal' | 'pharm' | 'other' | 'review' | 'suggest'
export type SetupResult = { cal: string | null; pharm: string | null; am: number; mid: number; remind: boolean }

export function ScheduleSetup({ p, parent, onDone, onClose, today = 1 }: { p: Profile; parent?: boolean; onDone: (r: SetupResult) => void; onClose: () => void; today?: number }) {
  const [st, setSt] = useState<St>('intro')
  const [busy, setBusy] = useState<string | null>(null)
  const [cal, setCal] = useState<string | null>(null)
  const [pharm, setPharm] = useState<string | null>(null)
  const [remind, setRemind] = useState(true)
  const events = cal ? p.events : []
  const sug = suggest(p, events)
  const [am, setAm] = useState(sug.am)
  const [mid, setMid] = useState(sug.mid)
  const [note, setNote] = useState<string | null>(null)
  const [auth, setAuth] = useState<{ name: string; site: string } | null>(null) // pharmacy sign-in handoff
  const [signing, setSigning] = useState(false)
  const [oName, setOName] = useState(''), [oZip, setOZip] = useState(''), [found, setFound] = useState<{ name: string; addr: string }[] | null>(null)
  const t = timesOf(am, mid), slots = usedSlots(p)
  const your = parent ? `${p.child}'s` : 'your'
  const ORDER: St[] = ['cal', 'pharm', 'review', 'suggest']
  const at = ORDER.indexOf(st === 'other' ? 'pharm' : st)
  const connect = (name: string, then: () => void) => { setBusy(name); setTimeout(() => { setBusy(null); then() }, 800) }
  const nudge = (k: 'am' | 'mid', d: number) => {
    const v = (k === 'am' ? am : mid) + d
    if (Math.abs(v - p.provider[k]) > WIN) return setNote(`That's outside the care team's window (${clock(p.provider[k] - WIN)}–${clock(p.provider[k] + WIN)}). Ask them before moving it further.`)
    setNote(null); if (k === 'am') setAm(v); else setMid(v)
  }
  const back = (to: St) => <button className="pp-back" onClick={() => setSt(to)}>‹ Back</button>
  const top = (to: St | null) => (
    <div className="pp-top">{to ? back(to) : <button className="pp-back" onClick={onClose}>Later</button>}
      {at >= 0 && <div className="pp-pips" aria-label={`Step ${at + 1} of ${ORDER.length}`}>{ORDER.map((x, i) => <i key={x} className={i < at ? 'done' : i === at ? 'now' : ''} />)}</div>}</div>
  )

  let body
  if (st === 'intro')
    body = <>
      {top(null)}
      <h1 className="large-title">Set up {your} schedule</h1>
      <p className="foot">Your visit checklist is done. Two quick connections and Tend suggests dose times that fit around {parent ? 'school, work and activities' : 'school, practice and plans'}. You accept or adjust. {parent ? 'Nothing to type.' : ''}</p>
      <div className="group">
        <div className="row-ios"><span className="glyph" style={{ background: 'var(--sys-red)' }}><Icon name="list" size={15} /></span><span className="row-title">Calendar<small>Your week: {parent ? 'school, work, sports, weekends away' : 'school, practice, sleepovers'}</small></span></div>
        <div className="row-ios"><span className="glyph" style={{ background: 'var(--sys-blue)' }}><Icon name="bag" size={15} /></span><span className="row-title">Pharmacy account<small>Walgreens, CVS, Kroger, Cincinnati Children's or another · medicines and label instructions</small></span></div>
      </div>
      <button className="cbtn primary" onClick={() => setSt('cal')}>Get started</button>
    </>
  else if (st === 'cal')
    body = <>
      {top('intro')}
      <h1 className="large-title">Connect a calendar</h1>
      <p className="foot">Tend reads when you're busy or away. It never adds medicine names to your calendar.</p>
      <div className="group">
        {CALS.map((c) => (
          <button key={c} className="row-ios" disabled={!!busy} onClick={() => connect(c, () => { setCal(c); const s2 = suggest(p, p.events); setAm(s2.am); setMid(s2.mid); setSt('pharm') })}>
            <span className="glyph" style={{ background: 'var(--sys-red)' }}><Icon name="list" size={15} /></span>
            <span className="row-title">{busy === c ? 'Connecting…' : c}</span><span className="chev" aria-hidden="true" />
          </button>
        ))}
      </div>
      <button className="cbtn ghost" onClick={() => { setCal(null); setAm(p.provider.am); setMid(p.provider.mid); setSt('pharm') }}>Skip: use the care team's times</button>
      <p className="foot">Simulated connection · synthetic calendar</p>
    </>
  else if (st === 'pharm')
    body = <>
      {top('cal')}
      <h1 className="large-title">Connect your pharmacy</h1>
      <p className="foot">Brings in every medicine and its label instructions, and keeps them updated. You sign in on the pharmacy's own website.</p>
      <div className="group">
        {PHARMS.map((c) => (
          <button key={c.name} className="row-ios" onClick={() => setAuth(c)}>
            <span className="glyph" style={{ background: 'var(--sys-blue)' }}><Icon name="bag" size={15} /></span>
            <span className="row-title">{c.name}</span><span className="chev" aria-hidden="true" />
          </button>
        ))}
        <button className="row-ios" onClick={() => { setFound(null); setSt('other') }}>
          <span className="glyph" style={{ background: 'var(--sys-indigo)' }}><Icon name="edit" size={15} /></span>
          <span className="row-title">Other<small>Find your pharmacy by name and ZIP code</small></span><span className="chev" aria-hidden="true" />
        </button>
      </div>
      <button className="cbtn ghost" onClick={() => { setPharm(null); setSt('review') }}>Use the care team's list instead</button>
      <p className="foot">Simulated connections · not affiliated with these pharmacies · synthetic medicines</p>
    </>
  else if (st === 'other') {
    const zipOk = /^\d{5}$/.test(oZip), nameOk = oName.trim().length > 1
    body = <>
      {top('pharm')}
      <h1 className="large-title">Find your pharmacy</h1>
      <label className="sc-field"><span className="group-label">Pharmacy name</span>
        <input value={oName} onChange={(e) => { setOName(e.target.value); setFound(null) }} placeholder="e.g. Hometown Drug" autoComplete="off" /></label>
      <label className="sc-field"><span className="group-label">ZIP code</span>
        <input value={oZip} onChange={(e) => { setOZip(e.target.value.replace(/\D/g, '').slice(0, 5)); setFound(null) }} inputMode="numeric" placeholder="45229" /></label>
      {!found && <button className="cbtn primary" disabled={!zipOk || !nameOk} onClick={() => {
        const n = oName.trim()
        setFound([{ name: n, addr: `120 Main St · ${oZip}` }, { name: n, addr: `4500 Vine St · ${oZip}` }])
      }}>Search</button>}
      {found && <>
        <p className="group-label">Select your location · sample results</p>
        <div className="group">
          {found.map((f) => (
            <button key={f.addr} className="row-ios" onClick={() => setAuth({ name: f.name, site: `${f.name}'s website` })}>
              <span className="glyph" style={{ background: 'var(--sys-blue)' }}><Icon name="home" size={15} /></span>
              <span className="row-title">{f.name}<small>{f.addr}</small></span><span className="chev" aria-hidden="true" />
            </button>
          ))}
        </div>
        <button className="cbtn ghost" onClick={() => setFound(null)}>Not listed? Search again</button>
      </>}
      <p className="foot">Simulated search · results are placeholders</p>
    </>
  }
  else if (st === 'review')
    body = <>
      {top('pharm')}
      <h1 className="large-title">Here's what we found</h1>
      <p className="group-label">{p.meds.length} medicines · {pharm ?? "care team's list"}</p>
      <div className="group">
        {p.meds.map((m) => <div key={m.id} className="row-ios"><span className="glyph" style={{ background: 'var(--sys-green)' }}><Icon name="bag" size={15} /></span><span className="row-title">{m.name}<small>{m.why} · {m.instr}</small></span></div>)}
      </div>
      <p className="group-label">{cal ? `Your week · ${cal}` : 'No calendar connected'}</p>
      <div className="group">
        {events.length ? events.map((e) => <div key={e.id} className="row-ios"><span className="glyph" style={{ background: e.kind === 'work' ? 'var(--sys-indigo)' : e.kind === 'school' ? 'var(--sys-teal)' : 'var(--sys-orange)' }}><Icon name={e.kind === 'work' ? 'user' : e.kind === 'school' ? 'home' : 'star'} size={15} /></span>
          <span className="row-title">{e.who ? `${e.who}: ` : ''}{e.title}<small>{e.days.map((d) => DOW[d]).join(' · ')} · {span(e)}</small></span></div>)
          : <div className="row-ios"><span className="row-title">Suggestions use the care team's times<small>Connect a calendar anytime from Routine</small></span></div>}
      </div>
      <button className="cbtn primary" onClick={() => setSt('suggest')}>Suggest a schedule</button>
      <button className="cbtn ghost" onClick={() => setNote('Sent to Riley Chen, RN. She will follow up. (simulated)')}>Something looks wrong</button>
      {note && <p className="foot sc-note" role="status">{note}</p>}
    </>
  else {
    const awayDays = Array.from({ length: 7 }, (_, i) => dowOf(today + i)).filter((d) => awayOn(p, events, t, d).length)
    body = <>
      {top('review')}
      <h1 className="large-title">Suggested schedule</h1>
      <p className="foot">Same times every day keeps doses 12 hours apart. Nudge a time if it fits {parent ? 'your family' : 'you'} better.</p>
      {slots.map((k) => (
        <div key={k} className="pp-slot">
          <div className="go-card">
            <div>
              <small>{SLOT[k].label} · {[...new Set(p.meds.filter((m) => m.slots.includes(k)).map((m) => m.name))].length} medicines</small>
              <b className="go-time">{clock(t[k])}</b>
              <small>{k === 'am' ? (am === sug.am ? sug.why : `Adjusted · suggested ${clock(sug.am)}`) : k === 'mid' ? 'Care team time · school nurse on school days' : 'Follows morning: 12 hours apart'}</small>
            </div>
            {k !== 'pm'
              ? <div className="chips pp-nudge"><button aria-label={`${SLOT[k].label} 30 minutes earlier`} onClick={() => nudge(k, -30)}>−30</button><button aria-label={`${SLOT[k].label} 30 minutes later`} onClick={() => nudge(k, 30)}>+30</button></div>
              : null}
          </div>
        </div>
      ))}
      {note && <p className="foot sc-note" role="status">{note}</p>}
      <p className="group-label">Your next 7 days</p>
      <WeekView p={p} events={events} t={t} from={today} />
      {events.length > 0 && <>
        <div className="segpill" role="group" aria-label="Morning pack reminders">
          <button className={remind ? 'on' : ''} onClick={() => setRemind(true)}>Pack reminders on</button>
          <button className={!remind ? 'on' : ''} onClick={() => setRemind(false)}>Off</button>
        </div>
        <p className="foot">{awayDays.length ? `On ${awayDays.map((d) => DOW[d]).join(', ')} a plan overlaps a dose. ` : ''}That morning, Tend lists exactly which medicines to bring. New calendar events are checked too.</p>
      </>}
      <button className="cbtn primary" onClick={() => onDone({ cal, pharm, am, mid, remind: remind && !!cal })}>Use this schedule</button>
      <p className="foot">You can move a time up to 1 hour. Bigger changes go to the care team.</p>
    </>
  }
  const sheet = auth && (
    <div className="modal-dim" onClick={() => { if (!signing) setAuth(null) }}>
      <div className="prompt-sheet sc-auth" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={`Connect ${auth.name}`}>
        <div className="grabber" />
        <b>{signing ? `Signing in on ${auth.site}…` : `Connect ${auth.name}`}</b>
        {signing
          ? <p>Finish signing in on {auth.name}'s page, then come back here. (Simulated: no website opens in this demo.)</p>
          : <>
            <p>You'll go to {auth.site} to sign in and approve sharing. Tend never sees your password.</p>
            <div className="group">
              {['Your medicine list', 'Label instructions (how and when to take)', 'Refill dates'].map((x) => <div key={x} className="row-ios"><span className="glyph" style={{ background: 'var(--sys-green)' }}><Icon name="check" size={15} /></span><span className="row-title">{x}</span></div>)}
            </div>
            <p>You can stop sharing anytime in Account.</p>
          </>}
        <button className="cbtn primary" disabled={signing} onClick={() => {
          setSigning(true)
          setTimeout(() => { setSigning(false); setPharm(auth.name); setAuth(null); setSt('review') }, 1200)
        }}>{signing ? 'Waiting for sign-in…' : `Continue to ${auth.name}`}</button>
        {!signing && <button className="cbtn ghost" onClick={() => setAuth(null)}>Cancel</button>}
      </div>
    </div>
  )
  return <div className="calm-page parent-portal sc-setup"><div className="calm-body top">{body}</div>{sheet}</div>
}

/* ---------- synthetic profiles ---------- */

const PROVIDER: Record<Slot, number> = { am: 480, mid: 780, pm: 1200 } // care team's suggested times (synthetic)
const WD = [1, 2, 3, 4, 5]

export const MAYA: Profile = {
  child: 'Maya', parent: 'Mom', provider: PROVIDER,
  meds: [
    { id: 'tac', name: 'Tacrolimus', why: 'Anti-rejection', instr: 'Every 12 hours, same times each day', slots: ['am', 'pm'], refill: 12 },
    { id: 'myc', name: 'Mycophenolate', why: 'Anti-rejection', instr: 'Every 12 hours', slots: ['am', 'pm'], refill: 20 },
    { id: 'pred', name: 'Prednisone', why: 'Anti-rejection', instr: 'Once a day in the morning, with food', slots: ['am'], refill: 25 },
    { id: 'aml', name: 'Amlodipine', why: 'Blood pressure', instr: 'Once a day', slots: ['am'], refill: 6 },
    { id: 'mag', name: 'Magnesium oxide', why: 'Supplement', instr: 'Twice a day', slots: ['am', 'pm'], refill: 22 },
    { id: 'vitd', name: 'Vitamin D', why: 'Supplement', instr: 'Once a day, evening', slots: ['pm'], refill: 40 },
  ],
  events: [
    { id: 'school', title: 'School', days: WD, start: 465, end: 900, kind: 'school' },
    { id: 'soccer', title: 'Soccer practice', days: [2, 4], start: 1050, end: 1200, kind: 'activity' },
    { id: 'game', title: 'Soccer game', days: [6], start: 540, end: 720, kind: 'activity' },
    { id: 'sleep', title: "Sleepover at Jess's", days: [5], start: 1080, end: 1440 + 600, kind: 'overnight' },
    { id: 'gma', title: "Dinner at Grandma's", days: [0], start: 1020, end: 1260, kind: 'activity' },
  ],
  added: { id: 'band', title: 'Band trip', days: [3], start: 960, end: 1290, kind: 'activity' },
}

export const LEO: Profile = {
  child: 'Leo', parent: 'Ana', provider: PROVIDER,
  meds: [
    { id: 'tac', name: 'Tacrolimus', why: 'Anti-rejection', instr: 'Every 12 hours, same times each day', slots: ['am', 'pm'], refill: 12 },
    { id: 'myc', name: 'Mycophenolate', why: 'Anti-rejection', instr: 'Every 12 hours', slots: ['am', 'pm'], refill: 20 },
    { id: 'pred', name: 'Prednisone', why: 'Anti-rejection', instr: 'Once a day in the morning, with food', slots: ['am'], refill: 25 },
    { id: 'valg', name: 'Valganciclovir', why: 'Prevents infection', instr: 'Once a day, with food', slots: ['am'], refill: 6 },
    { id: 'smx', name: 'Sulfamethoxazole-trimethoprim', why: 'Prevents infection', instr: 'Mon, Wed, Fri evenings', slots: ['pm'], days: [1, 3, 5], refill: 30 },
    { id: 'aml', name: 'Amlodipine', why: 'Blood pressure', instr: 'Once a day', slots: ['am'], refill: 18 },
    { id: 'bicarb', name: 'Sodium bicarbonate', why: 'Kidney balance', instr: 'Three times a day', slots: ['am', 'mid', 'pm'], refill: 14 },
    { id: 'mag', name: 'Magnesium oxide', why: 'Supplement', instr: 'Twice a day', slots: ['am', 'pm'], refill: 22 },
    { id: 'vitd', name: 'Vitamin D', why: 'Supplement', instr: 'Once a day', slots: ['pm'], refill: 40 },
  ],
  events: [
    { id: 'work', title: 'Work', who: 'Ana', days: WD, start: 450, end: 990, kind: 'work' },
    { id: 'school', title: 'School', days: WD, start: 480, end: 900, kind: 'school' },
    { id: 'swim', title: 'Swim lessons', days: [3], start: 1080, end: 1170, kind: 'activity' },
    { id: 'gpa', title: "Weekend at Grandpa's", days: [6], start: 600, end: 1440 + 1020, kind: 'overnight' },
  ],
  added: { id: 'party', title: 'Birthday party', days: [2], start: 1050, end: 1200, kind: 'activity' },
}

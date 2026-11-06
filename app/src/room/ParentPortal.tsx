import { useEffect, useState } from 'react'
import { Icon, type Theme } from './calm'
import { AwayCard, LEO, ScheduleSetup, SetupCard, SLOT, WeekView, awayOn, clock, dayLabel, dowOf, medsFor, nurseOn, packLine, span, timesOf, usedSlots, type Med, type Slot } from './schedule'
import '../pet/pet.css'
import './room.css'
import './calm.css'
import './grow.css'
import './parent.css'
import './midnight.css'

/* Parent portal ("#parent"): for younger kids (Leo, 8). Right after the visit checklist, the parent connects a
   calendar (school, work, weekends away) and a pharmacy (medicines + label instructions), both simulated. Tend
   suggests times inside the care team's window around the family's week; the parent accepts or nudges them.
   On busy days a morning reminder lists exactly which of Leo's medicines to send along. Synthetic data only. */

type PS = {
  theme: Theme; setup: boolean; done: boolean; cal: string | null; pharm: string | null; am: number; mid: number; remind: boolean
  day: number; added: boolean; packed: number[]; given: string[]; pending: boolean; extra: boolean
}
const FAM: Med = { id: 'fam', name: 'Famotidine', why: 'Stomach protection', instr: 'Twice a day', slots: ['am', 'pm'], refill: 30 }
const KEY = 'tend-parent-v4'
const fresh: PS = { theme: 'midnight', setup: false, done: false, cal: null, pharm: null, am: 480, mid: 780, remind: true, day: 1, added: false, packed: [], given: [], pending: false, extra: false }
const load = (): PS => { try { return { ...fresh, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') } } catch { return fresh } }

export default function ParentPortal() {
  const [s, setS] = useState<PS>(load)
  const [toast, setToast] = useState<string | null>(null)
  const [notif, setNotif] = useState<string | null>(null)
  const [open, setOpen] = useState<Slot | null>(null)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* private mode */ } }, [s])
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(null), 3500); return () => clearTimeout(id) }, [toast])
  useEffect(() => { if (!notif) return; const id = setTimeout(() => setNotif(null), 6000); return () => clearTimeout(id) }, [notif])
  const up = (p: Partial<PS>) => setS((x) => ({ ...x, ...p }))

  const p = { ...LEO, meds: s.extra ? [...LEO.meds, FAM] : LEO.meds }
  const events = s.cal ? [...p.events, ...(s.added ? [p.added] : [])] : []
  const t = timesOf(s.am, s.mid)
  const dow = dowOf(s.day)
  const away = s.done ? awayOn(p, events, t, dow) : []
  const slots = usedSlots(p)
  const today = (k: Slot) => medsFor(p, k, dow)
  const nurse = nurseOn(p, events, t, dow)
  const C = p.child

  /* morning pack reminder whenever a day with an overlap starts */
  useEffect(() => {
    if (!s.done || !s.remind || !away.length) return
    setNotif(`${C} is busy today: ${packLine(away).replace('Pack your', 'Send along the')}`)
  }, [s.day, s.done]) // eslint-disable-line react-hooks/exhaustive-deps

  let screen
  if (s.setup)
    screen = <ScheduleSetup p={p} parent today={s.day} onClose={() => up({ setup: false })}
      onDone={(r) => { up({ setup: false, done: true, cal: r.cal, pharm: r.pharm, am: r.am, mid: r.mid, remind: r.remind }); setToast(`Saved: ${slots.map((k) => clock(timesOf(r.am, r.mid)[k])).join(', ')}.`) }} />
  else if (!s.done)
    screen = (
      <div className="calm-page parent-portal"><div className="calm-body top">
        <h1 className="large-title">Hi, {p.parent}</h1>
        <div className="group"><div className="row-ios profile"><span className="avatar-ios">{C[0]}</span><span className="row-title">{C}, 8<small>Patient portal linked (simulated)</small></span></div></div>
        <SetupCard who={`${C}'s`} onStart={() => up({ setup: true })} />
      </div></div>
    )
  else
    screen = (
      <div className="calm-page parent-portal"><div className="calm-body top">
        <h1 className="large-title">{C} · {dayLabel(s.day)}</h1>
        {away.length > 0 && <AwayCard child={C} away={away} packed={s.packed.includes(s.day)} onPacked={() => { up({ packed: [...s.packed, s.day] }); setToast('Packed. Have a good day!') }} />}
        {s.pending && (
          <div className="pp-change">
            <p className="group-label">New from {s.pharm ?? 'the care team'}</p>
            <div className="group"><div className="row-ios"><span className="glyph" style={{ background: 'var(--sys-indigo)' }}><Icon name="star" size={15} /></span>
              <span className="row-title">{FAM.name}<small>{FAM.instr} · fits {clock(t.am)} and {clock(t.pm)}</small></span></div></div>
            <button className="cbtn primary" onClick={() => { up({ extra: true, pending: false }); setToast('Added. Nothing else to fill out.') }}>Add to schedule</button>
            <button className="cbtn ghost" onClick={() => setToast('Sent to Riley Chen, RN. (simulated)')}>Ask the care team first</button>
          </div>
        )}
        {slots.map((k) => {
          const key = `${s.day}-${k}`, done = s.given.includes(key), list = today(k), school = k === 'mid' && nurse
          return (
            <div key={k} className={'go-card pp-dose' + (done ? ' done' : '')}>
              <button className="pp-dose-head" aria-expanded={open === k} onClick={() => setOpen(open === k ? null : k)}>
                <small>{SLOT[k].label} · {list.length} medicine{list.length === 1 ? '' : 's'}{school ? ' · school nurse' : ''}</small>
                <b className="go-time">{clock(t[k])}</b>
                {open === k && <small className="pp-names">{list.map((m) => m.name).join(' · ')}</small>}
              </button>
              <button className="go" onClick={() => up({ given: done ? s.given.filter((x) => x !== key) : [...s.given, key] })}>{done ? '✓' : school ? 'Nurse gave' : 'Given'}</button>
            </div>
          )
        })}
        <p className="group-label">Next 7 days</p>
        <WeekView p={p} events={events} t={t} from={s.day} />
        <div className="group">
          <div className="row-ios"><span className="glyph" style={{ background: 'var(--sys-blue)' }}><Icon name="bag" size={15} /></span><span className="row-title">{s.pharm ?? "Care team's list"}<small>Synced today · changes come in on their own</small></span></div>
          {s.cal
            ? <button className="row-ios" onClick={() => up({ remind: !s.remind })}><span className="glyph" style={{ background: 'var(--sys-red)' }}><Icon name="list" size={15} /></span><span className="row-title">{s.cal}<small>Morning pack reminders on busy days</small></span><span className="row-detail">{s.remind ? 'On' : 'Off'}</span></button>
            : <button className="row-ios add" onClick={() => up({ setup: true })}><span className="glyph plus" /><span className="row-title">Connect a calendar</span></button>}
          {p.meds.filter((m) => (m.refill ?? 99) <= 7).map((m) => <div key={m.id} className="row-ios"><span className="glyph" style={{ background: 'var(--sys-orange)' }}><Icon name="bag" size={15} /></span><span className="row-title">Refill soon: {m.name}<small>About {m.refill} days left</small></span></div>)}
          <button className="row-ios" onClick={() => up({ setup: true })}><span className="glyph" style={{ background: 'var(--sys-indigo)' }}><Icon name="edit" size={15} /></span><span className="row-title">Adjust times</span><span className="chev" aria-hidden="true" /></button>
        </div>
        <p className="foot">Nothing to fill out again. Times stay inside the care team's window; bigger changes go to the team.</p>
      </div></div>
    )

  const nextBusy = Array.from({ length: 7 }, (_, i) => s.day + 1 + i).find((x) => awayOn(p, events, t, dowOf(x)).length)
  return (
    <div className={`pet-stage room-app calm-app theme-${s.theme}`}>
      <div className="handheld">
        <div className="notch" />
        <div className="status-bar"><span>{clock(Math.max(360, t.am - 45))}</span><span>{dayLabel(s.day)}</span></div>
        <div className="viewport">
          <div className="view-anim" key={String(s.setup) + s.done}>{screen}</div>
          {notif && <button className="lock-notif" onClick={() => setNotif(null)}><span className="ln-icon"><Icon name="sun" /></span><span><b>Tend</b><small>now</small><br />{notif}</span></button>}
          {toast && <div className="toast" role="status">{toast}</div>}
        </div>
      </div>
      <aside className="presenter wide-panel">
        <h3>Parent portal <em>(simulated)</em></h3>
        <p className="tr-note">For younger kids (Leo, 8, with Ana). Calendar and pharmacy connections are simulated; all medicines and events are synthetic. Times stay inside the care team's window.</p>
        <div className="pgrid">
          <button onClick={() => { setS({ ...fresh, theme: s.theme }); setOpen(null); setNotif(null) }}>After the visit<small>restart setup</small></button>
          <button disabled={!s.done || !nextBusy} onClick={() => nextBusy && up({ day: nextBusy })}>Next busy morning<small>pack reminder</small></button>
          <button disabled={!s.done} onClick={() => up({ day: s.day + 1 })}>Next day<small>{dayLabel(s.day + 1)}</small></button>
          <button disabled={!s.done || !s.cal || s.added} onClick={() => {
            const hit = awayOn(p, [p.added], t, p.added.days[0])
            up({ added: true })
            setNotif(hit.length ? `New on your calendar: ${p.added.title}, Tue ${span(p.added)}. It overlaps ${C}'s ${hit[0].items.map((i) => clock(i.t)).join(' and ')} medicines. Tuesday morning you'll get a list to pack.` : `New event: ${p.added.title}. It doesn't overlap a dose.`)
          }}>Add event<small>Birthday party, Tue</small></button>
          <button disabled={!s.done || s.extra || s.pending} onClick={() => { up({ pending: true }); setToast(`${s.pharm ?? 'Pharmacy'} update: 1 new medicine to review.`) }}>Pharmacy update<small>new prescription</small></button>
          <button onClick={() => { const o: Theme[] = ['midnight', 'bright', 'light', 'evening', 'oura']; up({ theme: o[(o.indexOf(s.theme) + 1) % o.length] }) }}>Theme: {s.theme}<small>midnight → bright → light → evening → Oura</small></button>
        </div>
        <p className="links"><a href="#">Teen app</a> · <a href="#demo">Team demo</a></p>
      </aside>
    </div>
  )
}

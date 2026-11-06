import { useEffect, useState } from 'react'
import { Companion } from './companions'
import { Icon, type Theme } from './calm'
import '../pet/pet.css'
import './room.css'
import './calm.css'
import './grow.css'
import './parent.css'

/* Parent portal ("#parent"): fast setup for a younger child's medicines, in the General app's design language.
   The parent types two things (wake-up time and bedtime). Medicines and label instructions come from the
   connected pharmacy (simulated); suggested times come from the care team's prescription (synthetic). The parent
   can nudge times only inside the care team's window; anything outside goes to the team. Calendar is optional.
   After setup there is nothing to fill out again: pharmacy changes arrive as a one-tap review. */

type Slot = 'am' | 'mid' | 'pm'
type Med = { id: string; name: string; why: string; instr: string; slots: Slot[]; days?: string; refill: number }
type Step = 'welcome' | 'pharmacy' | 'meds' | 'day' | 'schedule' | 'calendar' | 'home'
type PS = {
  step: Step; theme: Theme; pharmacy: string | null; wake: number; bed: number; am: number; mid: number
  cal: string | null; calDoses: boolean; meds: string[]; pending: string[]; given: Slot[]
}

/* synthetic example list for an 8-year-old kidney transplant patient; not medical advice */
const ALL: Med[] = [
  { id: 'tac', name: 'Tacrolimus', why: 'Anti-rejection', instr: 'Every 12 hours, same times each day', slots: ['am', 'pm'], refill: 12 },
  { id: 'myc', name: 'Mycophenolate', why: 'Anti-rejection', instr: 'Every 12 hours', slots: ['am', 'pm'], refill: 20 },
  { id: 'pred', name: 'Prednisone', why: 'Anti-rejection', instr: 'Once a day in the morning, with food', slots: ['am'], refill: 25 },
  { id: 'valg', name: 'Valganciclovir', why: 'Prevents infection', instr: 'Once a day, with food', slots: ['am'], refill: 6 },
  { id: 'smx', name: 'Sulfamethoxazole-trimethoprim', why: 'Prevents infection', instr: 'Mon, Wed, Fri', slots: ['pm'], days: 'Mon · Wed · Fri', refill: 30 },
  { id: 'aml', name: 'Amlodipine', why: 'Blood pressure', instr: 'Once a day', slots: ['am'], refill: 18 },
  { id: 'bicarb', name: 'Sodium bicarbonate', why: 'Kidney balance', instr: 'Three times a day', slots: ['am', 'mid', 'pm'], refill: 14 },
  { id: 'mag', name: 'Magnesium oxide', why: 'Supplement', instr: 'Twice a day', slots: ['am', 'pm'], refill: 22 },
  { id: 'vitd', name: 'Vitamin D', why: 'Supplement', instr: 'Once a day', slots: ['pm'], refill: 40 },
  { id: 'fam', name: 'Famotidine', why: 'Stomach protection', instr: 'Twice a day', slots: ['am', 'pm'], refill: 30 },
]
const START = ALL.filter((m) => m.id !== 'fam').map((m) => m.id)
const PROVIDER: Record<Slot, number> = { am: 480, mid: 780, pm: 1200 } // care team's suggested times (synthetic)
const WIN = 60 // minutes the family can move a time without asking the team
const SLOT: Record<Slot, { label: string; glyph: 'sun' | 'star' | 'moon'; tone: string }> = {
  am: { label: 'Morning', glyph: 'sun', tone: 'var(--sys-orange)' },
  mid: { label: 'Midday', glyph: 'star', tone: 'var(--sys-teal)' },
  pm: { label: 'Evening', glyph: 'moon', tone: 'var(--sys-indigo)' },
}
const WHY_TONE: Record<string, string> = { 'Anti-rejection': 'var(--sys-green)', 'Prevents infection': 'var(--sys-blue)', 'Blood pressure': 'var(--sys-pink)', 'Kidney balance': 'var(--sys-teal)', Supplement: 'var(--sys-orange)', 'Stomach protection': 'var(--sys-indigo)' }
const PHARM = ["Cincinnati Children's pharmacy", 'Our local pharmacy app', 'Mail-order pharmacy']
const CALS = ['Google Calendar', 'Apple Calendar', 'Outlook']
const KEY = 'tend-parent-v2'
const CHILD = 'Leo', PARENT = 'Ana'

const clock = (m: number) => { const h = Math.floor(m / 60) % 24; return `${((h + 11) % 12) + 1}:${String(m % 60).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}` }
const toIn = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
const fromIn = (v: string) => { const [h, m] = v.split(':').map(Number); return h * 60 + (m || 0) }
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
const round15 = (m: number) => Math.round(m / 15) * 15
const suggestAm = (wake: number) => clamp(round15(Math.max(wake + 30, PROVIDER.am - WIN)), PROVIDER.am - WIN, PROVIDER.am + WIN)
const fresh: PS = { step: 'welcome', theme: 'bright', pharmacy: null, wake: 420, bed: 1230, am: suggestAm(420), mid: PROVIDER.mid, cal: null, calDoses: true, meds: START, pending: [], given: [] }
const load = (): PS => { try { return { ...fresh, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') } } catch { return fresh } }
const ORDER: Step[] = ['pharmacy', 'meds', 'day', 'schedule', 'calendar']

export default function ParentPortal() {
  const [s, setS] = useState<PS>(load)
  const [busy, setBusy] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [open, setOpen] = useState<Slot | null>(null)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* private mode */ } }, [s])
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(null), 3500); return () => clearTimeout(id) }, [toast])
  const up = (p: Partial<PS>) => setS((x) => ({ ...x, ...p }))

  const meds = ALL.filter((m) => s.meds.includes(m.id))
  const time: Record<Slot, number> = { am: s.am, mid: s.mid, pm: s.am + 720 }
  const slots = (['am', 'mid', 'pm'] as Slot[]).filter((k) => meds.some((m) => m.slots.includes(k)))
  const inSlot = (k: Slot) => meds.filter((m) => m.slots.includes(k))
  const names = (k: Slot) => inSlot(k).map((m) => m.name + (m.days ? ` (${m.days})` : '')).join(' · ')
  const plural = (n: number) => `${n} medicine${n === 1 ? '' : 's'}`
  const nudge = (k: 'am' | 'mid', d: number) => {
    const v = s[k] + d
    if (Math.abs(v - PROVIDER[k]) > WIN) return setToast(`That's outside your care team's window. Ask them before moving it further.`)
    if (k === 'am' && v + 720 > s.bed) return setToast(`The evening dose would land after bedtime. Ask your care team about options.`)
    up({ [k]: v } as Partial<PS>)
  }
  const connect = (what: 'pharmacy' | 'cal', name: string) => {
    setBusy(name)
    setTimeout(() => { setBusy(null); if (what === 'pharmacy') up({ pharmacy: name, step: 'meds' }); else up({ cal: name, step: 'home' }) }, 900)
  }
  const stepNo = ORDER.indexOf(s.step)
  const top = (to: Step | null) => (
    <div className="pp-top">
      {to ? <button className="pp-back" onClick={() => up({ step: to })}>‹ Back</button> : <span />}
      {stepNo >= 0 && <div className="pp-pips" aria-label={`Step ${stepNo + 1} of ${ORDER.length}`}>{ORDER.map((x, i) => <i key={x} className={i < stepNo ? 'done' : i === stepNo ? 'now' : ''} />)}</div>}
    </div>
  )
  const refillSoon = meds.filter((m) => m.refill <= 7)
  const mascot = s.theme === 'bright'

  let screen
  if (s.step === 'welcome')
    screen = (
      <div className="calm-body top">
        {mascot && <div className="pp-mascot"><Companion id="moss" pose="happy" /></div>}
        <h1 className="large-title">Set up {CHILD}'s medicines</h1>
        <p className="foot">About 2 minutes. We bring in {CHILD}'s medicines from your pharmacy and suggest a schedule from the care team's times. You only type two things.</p>
        <div className="group">
          <div className="row-ios profile"><span className="avatar-ios">{PARENT[0]}</span><span className="row-title">{PARENT}<small>Patient portal linked · {CHILD}, 8 (simulated)</small></span></div>
        </div>
        <button className="cbtn primary" onClick={() => up({ step: 'pharmacy' })}>Get started</button>
      </div>
    )
  else if (s.step === 'pharmacy')
    screen = (
      <div className="calm-body top">
        {top('welcome')}
        <h1 className="large-title">Connect your pharmacy</h1>
        <p className="foot">This brings in every medicine and its instructions, so you don't type them.</p>
        <div className="group">
          {PHARM.map((p) => (
            <button key={p} className="row-ios" disabled={!!busy} onClick={() => connect('pharmacy', p)}>
              <span className="glyph" style={{ background: 'var(--sys-blue)' }}><Icon name="bag" size={15} /></span>
              <span className="row-title">{busy === p ? 'Connecting…' : p}</span><span className="chev" aria-hidden="true" />
            </button>
          ))}
        </div>
        <button className="cbtn ghost" onClick={() => up({ step: 'meds', pharmacy: null })}>Not listed? Use the care team's list</button>
        <p className="foot">Simulated connection · synthetic example data</p>
      </div>
    )
  else if (s.step === 'meds')
    screen = (
      <div className="calm-body top">
        {top('pharmacy')}
        <h1 className="large-title">{meds.length} medicines found</h1>
        <p className="foot">From {s.pharmacy ?? "the care team's list"}. Nothing to type.</p>
        <div className="group">
          {meds.map((m) => (
            <div key={m.id} className="row-ios"><span className="glyph" style={{ background: WHY_TONE[m.why] }}><Icon name="check" size={15} /></span>
              <span className="row-title">{m.name}<small>{m.why} · {m.instr}</small></span></div>
          ))}
        </div>
        <button className="cbtn primary" onClick={() => up({ step: 'day' })}>Looks right</button>
        <button className="cbtn ghost" onClick={() => setToast('Sent to Riley Chen, RN. She will follow up. (simulated)')}>Something looks wrong</button>
      </div>
    )
  else if (s.step === 'day')
    screen = (
      <div className="calm-body top">
        {top('meds')}
        <h1 className="large-title">{CHILD}'s day</h1>
        <p className="foot">We fit the care team's times into your routine.</p>
        <p className="group-label">Wakes up</p>
        <input className="time-big" type="time" step={900} value={toIn(s.wake)} onChange={(e) => { const w = fromIn(e.target.value); up({ wake: w, am: suggestAm(w) }) }} />
        <p className="group-label">Bedtime</p>
        <input className="time-big" type="time" step={900} value={toIn(s.bed)} onChange={(e) => up({ bed: fromIn(e.target.value) })} />
        <button className="cbtn primary" onClick={() => up({ step: 'schedule' })}>See schedule</button>
      </div>
    )
  else if (s.step === 'schedule')
    screen = (
      <div className="calm-body top">
        {top('day')}
        <h1 className="large-title">{slots.length} times a day</h1>
        <p className="foot">For {meds.length} medicines, suggested from the care team's times. Nudge if it fits your family better.</p>
        {slots.map((k) => (
          <div key={k} className="pp-slot">
            <div className="go-card">
              <div>
                <small>{SLOT[k].label} · {plural(inSlot(k).length)}</small>
                <b className="go-time">{clock(time[k])}</b>
                <small>Care team: {clock(PROVIDER[k])}</small>
              </div>
              {k !== 'pm'
                ? <div className="chips pp-nudge"><button aria-label={`${SLOT[k].label} 30 minutes earlier`} onClick={() => nudge(k, -30)}>−30</button><button aria-label={`${SLOT[k].label} 30 minutes later`} onClick={() => nudge(k, 30)}>+30</button></div>
                : <small className="pp-follow">Moves with morning: 12 hours apart</small>}
            </div>
            <p className="foot">{names(k)}{k === 'mid' ? '. During school hours, the school nurse can give it.' : ''}</p>
          </div>
        ))}
        <p className="foot">You can move a time up to 1 hour. Bigger changes go to the care team.</p>
        <button className="cbtn primary" onClick={() => up({ step: 'calendar' })}>Use this schedule</button>
      </div>
    )
  else if (s.step === 'calendar')
    screen = (
      <div className="calm-body top">
        {top('schedule')}
        <h1 className="large-title">Add to your calendar?</h1>
        <p className="foot">Optional. Events just say “{CHILD} check-in.”</p>
        <div className="segpill">
          <button className={s.calDoses ? 'on' : ''} onClick={() => up({ calDoses: true })}>Doses + visits</button>
          <button className={!s.calDoses ? 'on' : ''} onClick={() => up({ calDoses: false })}>Visits only</button>
        </div>
        <div className="group">
          {CALS.map((c) => (
            <button key={c} className="row-ios" disabled={!!busy} onClick={() => connect('cal', c)}>
              <span className="glyph" style={{ background: 'var(--sys-red)' }}><Icon name="list" size={15} /></span>
              <span className="row-title">{busy === c ? 'Connecting…' : c}</span><span className="chev" aria-hidden="true" />
            </button>
          ))}
        </div>
        <button className="cbtn ghost" onClick={() => up({ step: 'home' })}>Skip for now</button>
      </div>
    )
  else {
    const pendingMeds = ALL.filter((m) => s.pending.includes(m.id))
    screen = (
      <div className="calm-body top">
        <h1 className="large-title">{CHILD} today</h1>
        {pendingMeds.length > 0 && (
          <div className="pp-change">
            <p className="group-label">From {s.pharmacy ?? 'the care team'}</p>
            {pendingMeds.map((m) => (
              <div key={m.id} className="group"><div className="row-ios"><span className="glyph" style={{ background: WHY_TONE[m.why] }}><Icon name="star" size={15} /></span>
                <span className="row-title">New: {m.name}<small>{m.instr} · fits {m.slots.map((k) => clock(time[k])).join(' and ')}</small></span></div></div>
            ))}
            <button className="cbtn primary" onClick={() => { up({ meds: [...s.meds, ...s.pending], pending: [] }); setToast('Added. Nothing else to fill out.') }}>Add to schedule</button>
            <button className="cbtn ghost" onClick={() => setToast('Sent to Riley Chen, RN. (simulated)')}>Ask the care team first</button>
          </div>
        )}
        {slots.map((k) => {
          const done = s.given.includes(k)
          return (
            <div key={k} className={'go-card pp-dose' + (done ? ' done' : '')}>
              <button className="pp-dose-head" aria-expanded={open === k} onClick={() => setOpen(open === k ? null : k)}>
                <small>{SLOT[k].label} · {plural(inSlot(k).length)}</small>
                <b className="go-time">{clock(time[k])}</b>
                {open === k && <small className="pp-names">{names(k)}</small>}
              </button>
              <button className="go" onClick={() => up({ given: done ? s.given.filter((x) => x !== k) : [...s.given, k] })}>{done ? '✓' : 'Given'}</button>
            </div>
          )
        })}
        <div className="group">
          <div className="row-ios"><span className="glyph" style={{ background: 'var(--sys-blue)' }}><Icon name="bag" size={15} /></span><span className="row-title">{s.pharmacy ?? 'Care team list'}<small>Synced today · changes come in on their own</small></span></div>
          {s.cal
            ? <div className="row-ios"><span className="glyph" style={{ background: 'var(--sys-red)' }}><Icon name="list" size={15} /></span><span className="row-title">{s.cal}<small>{s.calDoses ? 'Doses and visits' : 'Visits only'}</small></span></div>
            : <button className="row-ios add" onClick={() => up({ step: 'calendar' })}><span className="glyph plus" /><span className="row-title">Connect a calendar</span></button>}
          {refillSoon.map((m) => <div key={m.id} className="row-ios"><span className="glyph" style={{ background: 'var(--sys-orange)' }}><Icon name="bag" size={15} /></span><span className="row-title">Refill soon: {m.name}<small>About {m.refill} days left</small></span></div>)}
          <button className="row-ios" onClick={() => up({ step: 'schedule' })}><span className="glyph" style={{ background: 'var(--sys-indigo)' }}><Icon name="edit" size={15} /></span><span className="row-title">Adjust times</span><span className="chev" aria-hidden="true" /></button>
        </div>
        <p className="foot">Nothing to fill out next time. Times stay inside the care team's window; bigger changes go to the team.</p>
      </div>
    )
  }

  return (
    <div className={`pet-stage room-app calm-app theme-${s.theme}`}>
      <div className="handheld">
        <div className="notch" />
        <div className="status-bar"><span>7:15 AM</span><span>Parent</span></div>
        <div className="viewport">
          <div className="view-anim calm-page parent-portal" key={s.step}>{screen}</div>
          {toast && <div className="toast" role="status">{toast}</div>}
        </div>
      </div>
      <aside className="presenter wide-panel">
        <h3>Parent portal <em>(simulated)</em></h3>
        <p className="tr-note">For younger kids (Leo, 8). The parent types two times. Medicines and instructions come from the pharmacy; suggested times come from the care team. All data is synthetic.</p>
        <div className="pgrid">
          <button onClick={() => { setS({ ...fresh, theme: s.theme }); setOpen(null) }}>Restart setup<small>from welcome</small></button>
          <button onClick={() => up({ step: 'home', pharmacy: s.pharmacy ?? PHARM[0] })}>Skip to home<small>after setup</small></button>
          <button disabled={s.meds.includes('fam') || s.pending.includes('fam')} onClick={() => { up({ pending: ['fam'], step: 'home' }); setToast('Pharmacy update: 1 new medicine to review.') }}>Pharmacy update<small>new prescription</small></button>
          <button onClick={() => up({ theme: s.theme === 'bright' ? 'light' : s.theme === 'light' ? 'evening' : s.theme === 'evening' ? 'oura' : 'bright' })}>Theme: {s.theme}<small>bright → light → evening → Oura</small></button>
        </div>
        <p className="links"><a href="#">Teen app</a> · <a href="#demo">Team demo</a></p>
      </aside>
    </div>
  )
}

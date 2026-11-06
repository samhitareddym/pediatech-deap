import { useEffect, useState } from 'react'
import { DayPlanner } from './DayPlanner'
// Calm version (Tend × Oura): quiet hierarchy, one scene, one clear action per card. No game, no rewards.
// Visual direction: docs/design/TEND-OURA-BLEND.md (light, evening) and OURA-STYLE-GUIDE.md (oura).

export type Theme = 'bright' | 'light' | 'evening' | 'oura'
export const THEMES: { id: Theme; name: string; line: string; sw: [string, string, string] }[] = [
  { id: 'bright', name: 'Bright', line: 'White, green and blue. Friendly and bold.', sw: ['#ffffff', '#58cc02', '#1cb0f6'] },
  { id: 'light', name: 'Light', line: 'Warm paper, forest green, apricot. The Tend × Oura blend.', sw: ['#f3eee5', '#2f4a3a', '#ef8a4c'] },
  { id: 'evening', name: 'Evening', line: 'Deep pine and warm white. The blend after dark.', sw: ['#101813', '#1d2a22', '#f2a16e'] },
  { id: 'oura', name: 'Oura style', line: 'Near-black canvas, cool atmosphere, quiet white figures.', sw: ['#090b0c', '#252729', '#83c9ef'] },
]

/* abstract atmosphere: two soft color orbs on the page tone (no scenery) */
export function Scene({ evening }: { evening: boolean }) {
  return (
    <svg className="calm-scene" viewBox="0 0 390 210" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="orb1"><stop offset="0" stopColor="var(--orb-1)" stopOpacity=".9" /><stop offset="1" stopColor="var(--orb-1)" stopOpacity="0" /></radialGradient>
        <radialGradient id="orb2"><stop offset="0" stopColor="var(--orb-2)" stopOpacity=".8" /><stop offset="1" stopColor="var(--orb-2)" stopOpacity="0" /></radialGradient>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset=".5" stopColor="var(--page)" stopOpacity="0" /><stop offset="1" stopColor="var(--page)" /></linearGradient>
      </defs>
      <rect width="390" height="210" fill="var(--page)" />
      <circle cx={evening ? 310 : 300} cy={evening ? 30 : 50} r="170" fill="url(#orb1)" />
      <circle cx={evening ? 40 : 70} cy="150" r="150" fill="url(#orb2)" />
      <rect width="390" height="210" fill="url(#fade)" />
    </svg>
  )
}

/* thin open ring: share of check-ins reported this week (a count, not a health score) */
export function Ring({ value, max, label }: { value: number; max: number; label: string }) {
  const r = 22, c = 2 * Math.PI * r, arc = c * 0.75
  const f = max ? Math.min(1, value / max) : 0
  return (
    <div className="ring">
      <svg viewBox="0 0 56 56" aria-hidden="true">
        <circle cx="28" cy="28" r={r} fill="none" stroke="var(--track)" strokeWidth="3" strokeDasharray={`${arc} ${c}`} transform="rotate(135 28 28)" strokeLinecap="round" />
        <circle cx="28" cy="28" r={r} fill="none" stroke="var(--ink)" strokeWidth="3" strokeDasharray={`${arc * f} ${c}`} transform="rotate(135 28 28)" strokeLinecap="round" />
      </svg>
      <b>{value}</b>
      <span>{label}</span>
    </div>
  )
}

export function ThemePick({ theme, onTheme }: { theme: Theme; onTheme: (t: Theme) => void }) {
  return (
    <div className="segpill" role="radiogroup" aria-label="Appearance">
      {THEMES.map((t) => <button key={t.id} role="radio" aria-checked={theme === t.id} className={theme === t.id ? 'on' : ''} onClick={() => onTheme(t.id)}>{t.name.replace(' style', '')}</button>)}
    </div>
  )
}

export type DoseView = { slot: 'am' | 'pm'; time: string; cue: string | null; status: 'taken' | 'missed' | 'help' | 'now' | 'later' | 'none' }
const STATUS: Record<DoseView['status'], string> = { taken: 'Taken', missed: 'Missed', help: 'Help asked', now: 'Now', later: '', none: 'No report' }

/* one grouped-list row, iOS style: colored leading glyph, title, trailing detail + chevron */
function Row({ glyph, tone, title, detail, onClick }: { glyph: IconName; tone: string; title: string; detail?: string; onClick?: () => void }) {
  const inner = <>
    <span className="glyph" style={{ background: tone }}><Icon name={glyph} size={15} /></span>
    <span className="row-title">{title}</span>
    {detail && <span className="row-detail">{detail}</span>}
    {onClick && <span className="chev" aria-hidden="true" />}
  </>
  return onClick ? <button className="row-ios" onClick={onClick}>{inner}</button> : <div className="row-ios">{inner}</div>
}

/* Day arc: 5am → 11pm. Dose dots fill when reported; a soft marker shows now. Useful, not decorative. */
const DAY0 = 300, DAY1 = 1380
const arcPt = (m: number, r = 150): [number, number] => {
  const f = Math.max(0, Math.min(1, (m - DAY0) / (DAY1 - DAY0)))
  const a = Math.PI - f * Math.PI
  return [195 + r * Math.cos(a), 178 - r * Math.sin(a)]
}
export function DayArc({ now, doses, streak }: { now: number; streak: number; doses: { m: number; label: string; status: DoseView['status'] }[] }) {
  const [nx, ny] = arcPt(now)
  const frac = Math.max(0, Math.min(1, (now - DAY0) / (DAY1 - DAY0)))
  const len = Math.PI * 150
  return (
    <div className="day-arc">
      <svg viewBox="0 0 390 200" aria-hidden="true">
        <defs><radialGradient id="nowglow"><stop offset="0" stopColor="var(--accent)" stopOpacity=".55" /><stop offset="1" stopColor="var(--accent)" stopOpacity="0" /></radialGradient></defs>
        <path d="M45 178 A150 150 0 0 1 345 178" fill="none" stroke="var(--track)" strokeWidth="6" strokeLinecap="round" />
        <path className="arc-fill" d="M45 178 A150 150 0 0 1 345 178" fill="none" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - frac)} style={{ ['--len' as string]: len }} />
        <circle cx={nx} cy={ny} r="22" fill="url(#nowglow)" className="now-glow" />
        <circle cx={nx} cy={ny} r="6" fill="var(--accent)" />
        {doses.map((d) => {
          const [x, y] = arcPt(d.m)
          const done = d.status === 'taken'
          return (
            <g key={d.label}>
              <circle cx={x} cy={y} r="11" fill={done ? 'var(--sys-green)' : 'var(--page)'} stroke={done ? 'var(--sys-green)' : d.status === 'now' ? 'var(--accent)' : 'var(--ink-2)'} strokeWidth="2.5" />
              {done && <path d={`M${x - 5} ${y} l3.5 3.5 l6.5 -7`} stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
              <text x={x} y={y + 28} textAnchor="middle" className="arc-label">{d.label}</text>
            </g>
          )
        })}
      </svg>
      <div className="arc-center">
        <div className={'streak-glow' + (streak ? '' : ' zero')}><b>{streak}</b><span>day streak</span></div>
        <p className="congrats">{streak ? 'Congrats!' : 'Check in to start a streak'}</p>
      </div>
    </div>
  )
}

/* Today: day arc on top, the check-in as a bottom sheet */
export function CalmToday({ streak, now, open, doses, onReport, onNotYet, onMissed, onHelp, onRoutine, nextTime }: {
  streak: number; now: number; open: DoseView | null; doses: (DoseView & { m: number })[]
  onReport: () => void; onNotYet: () => void; onMissed: () => void; onHelp: () => void; onRoutine: () => void; nextTime: string
}) {
  return (
    <div className="calm-page today">
      <DayArc now={now} streak={streak} doses={doses.map((d) => ({ m: d.m, label: d.time, status: d.status }))} />
      <section className="sheet-ios rise" aria-label="Check-in">
        <div className="grabber" />
        <h2 className="sheet-title">{open ? 'Check-in' : 'All set'}</h2>
        <div className="group">
          {doses.map((d) => <Row key={d.slot} glyph={d.slot === 'am' ? 'sun' : 'moon'} tone={d.slot === 'am' ? 'var(--sys-orange)' : 'var(--sys-indigo)'} title={d.slot === 'am' ? 'Morning' : 'Evening'} detail={STATUS[d.status] || d.time} />)}
          <button className="row-ios add" onClick={onRoutine}><span className="glyph plus" /><span className="row-title">Edit routine</span></button>
        </div>
        {open && <div className="chips">
          <button onClick={onNotYet}>Not yet</button><button onClick={onMissed}>Missed</button><button onClick={onHelp}>Need help</button>
        </div>}
        <div className="go-card">
          <div><b className="go-time">{open ? open.time : nextTime}</b><small>{open ? (open.cue ? 'after you ' + open.cue : (open.slot === 'am' ? 'morning dose' : 'evening dose')) : 'next check-in'}</small></div>
          {open && <button className="go" onClick={onReport}>Taken</button>}
        </div>
      </section>
      <DayPlanner compareLink eveningTime={doses.find(d => d.slot === 'pm')?.time} eveningMinutes={doses.find(d => d.slot === 'pm')?.m} eveningReported={doses.some(d => d.slot === 'pm' && ['taken', 'missed', 'help'].includes(d.status))} />
    </div>
  )
}

/* Reward moment after a dose is reported: a check that draws itself, a ring that blooms */
export function Celebrate({ time, total, days, onDone }: { time: string; total: number; days: number; onDone: () => void }) {
  return (
    <div className="celebrate" role="status">
      <div className="cel-card">
        <svg viewBox="0 0 120 120" className="cel-mark" aria-hidden="true"><circle className="cel-burst" cx="60" cy="60" r="44" /><circle className="cel-disc" cx="60" cy="60" r="40" /><path className="cel-check" d="M41 61 l13 13 l26 -28" /></svg>
        <b className="cel-title">Dose logged!</b>
        <small>{time}</small>
        <div className="cel-stats">
          <div className="st green"><span>Check-ins</span><b>{total}</b></div>
          <div className="st blue"><span>Days</span><b>{days}</b></div>
          <div className="st gold"><span>Time</span><b>{time.replace(/ (AM|PM)/, '')}</b></div>
        </div>
        <button className="cbtn primary cel-go" onClick={onDone}>Continue</button>
      </div>
    </div>
  )
}

/* Gentle setup prompt a few seconds after launch */
export function SetupPrompt({ onStart, onLater }: { onStart: () => void; onLater: () => void }) {
  return (
    <div className="modal-dim" onClick={onLater}>
      <div className="prompt-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Set up your routine">
        <div className="grabber" />
        <b>Set up your routine?</b>
        <p>A few taps. You can change it anytime.</p>
        <button className="cbtn primary" onClick={onStart}>Start</button>
        <button className="cbtn ghost" onClick={onLater}>Later</button>
      </div>
    </div>
  )
}

export type RoutinePlan = { am: number; pm: number; amCue: string; pmCue: string; food: string; backup: string; barriers: string[] }
type Q = { key: keyof RoutinePlan; title: string; glyph: IconName; tone: string; ask: string; kind: 'time' | 'one' | 'many'; options?: string[] }
const QS: Q[] = [
  { key: 'am', title: 'Morning dose', glyph: 'sun', tone: 'var(--sys-orange)', ask: 'When is your morning dose?', kind: 'time' },
  { key: 'amCue', title: 'Morning cue', glyph: 'check', tone: 'var(--sys-orange)', ask: 'What do you do right before it?', kind: 'one', options: ['Brush my teeth', 'Eat breakfast', 'Get dressed', 'Check my phone'] },
  { key: 'pm', title: 'Evening dose', glyph: 'moon', tone: 'var(--sys-indigo)', ask: 'When is your evening dose?', kind: 'time' },
  { key: 'pmCue', title: 'Evening cue', glyph: 'check', tone: 'var(--sys-indigo)', ask: 'What do you do right before it?', kind: 'one', options: ['Eat dinner', 'Brush my teeth', 'Shower', 'Get ready for bed'] },
  { key: 'food', title: 'Food', glyph: 'star', tone: 'var(--sys-green)', ask: 'Do you take it with food?', kind: 'one', options: ['With a meal', 'Without food', 'It changes'] },
  { key: 'backup', title: 'Backup plan', glyph: 'star', tone: 'var(--sys-teal)', ask: 'If your day changes, what helps?', kind: 'one', options: ['Phone alarm', 'Pocket pill case', 'A text from someone', 'Take it with a meal'] },
  { key: 'barriers', title: "What's hard", glyph: 'help', tone: 'var(--sys-pink)', ask: 'Is anything making it harder?', kind: 'many', options: ['I forget', 'The taste', 'Hard to swallow', 'Side effects', 'Privacy', 'Too busy', 'Running out', 'Nothing right now'] },
]
const clk = (m: number) => { const h = Math.floor(m / 60) % 24; return `${((h + 11) % 12) + 1}:${String(m % 60).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}` }
const show = (p: RoutinePlan, q: Q) => {
  const v = p[q.key]
  if (q.kind === 'time') return clk(v as number)
  if (Array.isArray(v)) return v.length ? (v.length === 1 ? v[0] : `${v.length} picked`) : ''
  return v as string
}

export function CalmRoutine({ plan, history, week, insight, onSet, guide, onVoice }: {
  plan: RoutinePlan
  history: { day: number; am: string; pm: string }[]
  week: { reported: number; possible: number; taken: number; days: number }
  insight: { title: string; body: string }
  onSet: (p: Partial<RoutinePlan>) => void
  guide?: boolean
  onVoice?: () => void
}) {
  const [q, setQ] = useState<Q | null>(null)
  const [draft, setDraft] = useState<RoutinePlan>(plan)
  const open = (x: Q) => { setDraft(plan); setQ(x) }
  const nextEmpty = (after: Q) => QS.slice(QS.indexOf(after) + 1).find((x) => !show(plan, x) || (x.kind === 'many' && !plan.barriers.length))
  const save = (patch: Partial<RoutinePlan>, from: Q) => {
    onSet(patch)
    const nx = guide ? nextEmpty(from) : undefined
    setQ(null)
    if (nx) setTimeout(() => open(nx), 320) // guided setup: next unanswered question slides up on its own
  }
  useEffect(() => { if (!guide) return; const f0 = QS.find((x) => !show(plan, x)); if (f0) { const id = setTimeout(() => open(f0), 350); return () => clearTimeout(id) } }, [guide]) // eslint-disable-line react-hooks/exhaustive-deps
  const mark = (st: string) => ({ taken: '●', missed: '✕', help: '?', none: '–', later: '·' } as Record<string, string>)[st] ?? '–'
  const gap = (plan.pm - plan.am) / 60
  return (
    <div className="calm-page">
      <div className="calm-body top">
        <h1 className="large-title">Routine</h1>
        {onVoice && <button className="voice-hero" onClick={onVoice} aria-label="Set up your routine by voice">
          <span className="orb hero-orb"><span className="ring r1" /><span className="ring r2" /><span className="core"><Icon name="mic" size={38} /></span></span>
          <b>Set up by voice</b>
          <small>Tap and tell Tend about your day</small>
        </button>}
        <p className="group-label">Or tap to edit</p>
        <div className="group">
          {QS.map((x) => (
            <button key={x.key} className="row-ios" onClick={() => open(x)}>
              <span className="glyph" style={{ background: x.tone }}><Icon name={x.glyph} size={15} /></span>
              <span className="row-title">{x.title}</span>
              <span className={'row-detail' + (show(plan, x) ? '' : ' add-hint')}>{show(plan, x) || 'Add'}</span>
              <span className="chev" aria-hidden="true" />
            </button>
          ))}
        </div>
        {(gap < 11 || gap > 13) && <p className="foot">Doses are {Math.round(gap * 10) / 10} hours apart. Your team usually wants about 12.</p>}
        <section className="metrics" aria-label="This week">
          <Ring value={week.reported} max={week.possible} label="check-ins" />
          <Ring value={week.taken} max={week.possible} label="taken" />
          <Ring value={week.days} max={7} label="days" />
        </section>
        <p className="group-label">{insight.title}</p>
        <p className="foot">{insight.body}</p>
        <p className="group-label">Last 7 days</p>
        <div className="hist" role="table" aria-label="Check-in history">
          <div className="hist-row head" role="row"><span />{history.map((h) => <span key={h.day} role="columnheader">D{h.day}</span>)}</div>
          {(['am', 'pm'] as const).map((k) => (
            <div key={k} className="hist-row" role="row">
              <span role="rowheader">{k === 'am' ? 'AM' : 'PM'}</span>
              {history.map((h) => <span key={h.day} role="cell" className={'mk ' + h[k]} aria-label={h[k]}>{mark(h[k])}</span>)}
            </div>
          ))}
        </div>
      </div>

      {q && (
        <div className="modal-dim" onClick={() => setQ(null)}>
          <div className="prompt-sheet q-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={q.ask}>
            <div className="grabber" />
            <b>{q.ask}</b>
            {q.kind === 'time' && <>
              <input className="time-big" type="time" value={`${String(Math.floor((draft[q.key] as number) / 60)).padStart(2, '0')}:${String((draft[q.key] as number) % 60).padStart(2, '0')}`}
                onChange={(e) => { const [h, m] = e.target.value.split(':').map(Number); setDraft({ ...draft, [q.key]: h * 60 + (m || 0) }) }} />
              <button className="cbtn primary" onClick={() => save({ [q.key]: draft[q.key] }, q)}>Done</button>
            </>}
            {q.kind === 'one' && <div className="opts">{q.options!.map((o, i) => (
              <button key={o} style={{ animationDelay: `${i * 40}ms` }} className={'opt' + (plan[q.key] === o ? ' on' : '')} onClick={() => save({ [q.key]: o }, q)}>{o}</button>
            ))}</div>}
            {q.kind === 'many' && <>
              <div className="opts">{q.options!.map((o, i) => {
                const on = draft.barriers.includes(o)
                return <button key={o} style={{ animationDelay: `${i * 30}ms` }} className={'opt' + (on ? ' on' : '')} onClick={() => setDraft({ ...draft, barriers: o === 'Nothing right now' ? (on ? [] : [o]) : on ? draft.barriers.filter((b) => b !== o) : [...draft.barriers.filter((b) => b !== 'Nothing right now'), o] })}>{o}</button>
              })}</div>
              <button className="cbtn primary" onClick={() => save({ barriers: draft.barriers }, q)}>Done</button>
            </>}
          </div>
        </div>
      )}
    </div>
  )
}

type IconName = 'mic' | 'star' | 'check' | 'sun' | 'moon' | 'home' | 'bag' | 'play' | 'help' | 'user' | 'edit' | 'list' | 'chart'
const PATHS: Record<IconName, string> = {
  mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21',
  star: 'M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.9 6.7 19.6l1-5.8-4.2-4.1 5.9-.9z',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8',
  moon: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
  home: 'M4 11l8-6.5 8 6.5V20a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z',
  bag: 'M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2',
  play: 'M8 5.5v13l11-6.5z',
  help: 'M4 5h16v11H9l-5 4z',
  user: 'M12 4.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM5 20c1.5-4 4-5.5 7-5.5s5.5 1.5 7 5.5',
  edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
  list: 'M5 4h14v16H5zM8 9h8M8 13h8M8 17h5',
  chart: 'M5 20V10M12 20V4M19 20v-7',
}
export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg className="ic" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={PATHS[name]} /></svg>
}

export function Nav<T extends string>({ tabs, view, onView }: { tabs: [T, string, string][]; view: string; onView: (v: T) => void }) {
  return (
    <nav className="calm-nav-bar" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }} aria-label="Main">
      {tabs.map(([k, l, ic]) => <button key={k} aria-current={view === k ? 'page' : undefined} className={view === k ? 'on' : ''} onClick={() => onView(k)}><i className={'ic-' + ic} />{l}</button>)}
    </nav>
  )
}

/* simulated single sign-on with the hospital patient portal */
export function SignIn({ onDone }: { onDone: () => void }) {
  const [linking, setLinking] = useState(false)
  return (
    <div className="calm-page center-col">
      <div className="calm-hero"><Scene evening /></div>
      <div className="calm-body">
        <h1 className="ed">Tend</h1>
        <p className="csub">Your routine, with your care team.</p>
        <button className="cbtn primary" disabled={linking} onClick={() => { setLinking(true); setTimeout(onDone, 900) }}>{linking ? 'Linking your portal…' : 'Continue with patient portal'}</button>
        <p className="note">Simulated sign-in</p>
      </div>
    </div>
  )
}

export function Account({ name, theme, onTheme, onSupport, onSignOut }: {
  name: string; theme: Theme
  onTheme: (t: Theme) => void; onSupport: () => void; onSignOut: () => void
}) {
  return (
    <div className="calm-page">
      <div className="calm-body top">
        <h1 className="large-title">Account</h1>
        <div className="group">
          <div className="row-ios profile"><span className="avatar-ios">{name[0]}</span><span className="row-title">{name}<small>Patient portal linked</small></span></div>
        </div>
        <p className="group-label">Appearance</p>
        <ThemePick theme={theme} onTheme={onTheme} />
        <div className="group">
          <Row glyph="help" tone="var(--sys-blue)" title="Get support" onClick={onSupport} />
        </div>
        <div className="group">
          <button className="row-ios danger" onClick={onSignOut}><span className="row-title">Sign out</span></button>
        </div>
      </div>
    </div>
  )
}

/* ---------- voice demo: listening orb → transcript → typed reply (scripted) ---------- */
export type VoiceScript = { heard: string; reply: string; chips: string[]; primary: string; secondary: string; contact?: boolean }
export const MOCK_CALL_SCRIPT = (eveningTime: string): VoiceScript => ({
  heard: 'I have a basketball game tonight and am going out to dinner with friends.',
  reply: MOCK_REPLY,
  chips: ['Basketball game · 6:00 PM', 'Dinner with friends · 8:30 PM', `Evening medicine · ${eveningTime}`],
  primary: 'Set mock call', secondary: 'Use a different contact', contact: true,
})
export const ROUTINE_SCRIPT: VoiceScript = {
  heard: 'I take my morning pills after breakfast and my evening ones after dinner, but I always forget on weekends.',
  reply: "Got it. I set your morning cue to after breakfast and your evening cue to after dinner. Weekends are tricky for a lot of people. I'll add a phone alarm as your backup plan, and I noted that forgetting is the hard part so your care team can help.",
  chips: ['Morning · after breakfast', 'Evening · after dinner', 'Backup · phone alarm', 'Hard part · forgetting'],
  primary: 'Save routine', secondary: 'Change something',
}
const MOCK_REPLY = "I just checked your calendar. It looks like you're going to be busy. Would a discreet mock call help? Your phone can buzz with a contact label you choose, giving you a reason to step away for your medicine routine. You have Mom saved, so I'll use that for now unless you tell me different."

/* time-based typewriter so throttled timers can't stall it */
function useTyped(text: string, run: boolean, msPerChar: number, onDone?: () => void) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!run) return
    const start = performance.now()
    const id = setInterval(() => {
      const v = Math.min(text.length, Math.floor((performance.now() - start) / msPerChar))
      setN(v)
      if (v >= text.length) { clearInterval(id); onDone?.() }
    }, 16)
    return () => clearInterval(id)
  }, [run]) // eslint-disable-line react-hooks/exhaustive-deps
  return text.slice(0, n)
}

export function VoiceSheet({ script, onClose, onPrimary, onSecondary }: { script: VoiceScript; onClose: () => void; onPrimary: (label: string) => void; onSecondary?: () => void }) {
  const HEARD = script.heard, REPLY = script.reply
  const [step, setStep] = useState<'listen' | 'heard' | 'think' | 'reply' | 'done'>('listen')
  const [label, setLabel] = useState('Mom')
  const [editing, setEditing] = useState(false)
  useEffect(() => {
    if (step === 'listen') { const id = setTimeout(() => setStep('heard'), 2600); return () => clearTimeout(id) }
    if (step === 'think') { const id = setTimeout(() => setStep('reply'), 1100); return () => clearTimeout(id) }
  }, [step])
  const heard = useTyped(HEARD, step !== 'listen', 32, () => setStep('think'))
  const reply = useTyped(REPLY, step === 'reply' || step === 'done', 24, () => setStep('done'))
  const listening = step === 'listen' || (step === 'heard' && heard.length < HEARD.length)
  return (
    <div className="modal-dim voice-dim" onClick={onClose}>
      <div className="voice-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Talk to Tend">
        <div className="voice-top"><span>Tend voice</span><button className="voice-x" onClick={onClose} aria-label="Close">✕</button></div>
        <div className="voice-chat" aria-live="polite">
          {step !== 'listen' && <p className="bub me">{heard}{heard.length < HEARD.length && <i className="caret" />}</p>}
          {step === 'think' && <p className="bub ai thinking"><i /><i /><i /></p>}
          {(step === 'reply' || step === 'done') && <p className="bub ai">{reply}{step === 'reply' && <i className="caret" />}</p>}
          {step === 'done' && <>
            <div className="found">{script.chips.map((x) => <span key={x}>{x}</span>)}</div>
            {script.contact && editing
              ? <label className="voice-edit">Contact label<input value={label} maxLength={20} autoFocus onChange={(e) => setLabel(e.target.value)} /></label>
              : null}
            <div className="voice-acts">
              <button className="cbtn primary" onClick={() => onPrimary(label.trim() || 'Mom')}>{script.primary}{script.contact ? ` · ${label.trim() || 'Mom'}` : ''}</button>
              <button className="cbtn" onClick={() => (script.contact ? setEditing(!editing) : onSecondary?.())}>{script.contact && editing ? 'Done' : script.secondary}</button>
            </div>
          </>}
        </div>
        <button className={'orb' + (listening ? ' live' : step === 'think' ? ' busy' : ' idle')} onClick={() => step === 'listen' && setStep('heard')} aria-label={listening ? 'Listening' : 'Voice'}>
          <span className="ring r1" /><span className="ring r2" /><span className="core"><Icon name="mic" size={30} /></span>
        </button>
        <div className={'wave' + (listening ? ' on' : '')} aria-hidden="true">{Array.from({ length: 24 }, (_, i) => <i key={i} style={{ animationDelay: `${(i % 8) * 70}ms` }} />)}</div>
        <p className="voice-hint">{listening ? 'Listening…' : step === 'think' ? (script.contact ? 'Checking your calendar…' : 'Setting up your routine…') : step === 'reply' ? 'Tend is answering' : 'Simulated voice demo · nothing is recorded'}</p>
      </div>
    </div>
  )
}

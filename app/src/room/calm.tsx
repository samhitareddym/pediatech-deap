import { useState } from 'react'
// Calm version (Tend × Oura): quiet hierarchy, one scene, one clear action per card. No game, no rewards.
// Visual direction: docs/design/TEND-OURA-BLEND.md (light, evening) and OURA-STYLE-GUIDE.md (oura).

export type Theme = 'light' | 'evening' | 'oura'
export const THEMES: { id: Theme; name: string; line: string; sw: [string, string, string] }[] = [
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
    <div className="theme-pick" role="radiogroup" aria-label="Appearance">
      {THEMES.map((t) => (
        <button key={t.id} role="radio" aria-checked={theme === t.id} className={'theme-opt' + (theme === t.id ? ' on' : '')} onClick={() => onTheme(t.id)}>
          <span className="sw">{t.sw.map((c) => <i key={c} style={{ background: c }} />)}</span>
          <b>{t.name}</b><small>{t.line}</small>
        </button>
      ))}
    </div>
  )
}

export type DoseView = { slot: 'am' | 'pm'; time: string; cue: string | null; status: 'taken' | 'missed' | 'help' | 'now' | 'later' | 'none' }

export function CalmToday({ greeting, evening, open, week, insight, onReport, onNotYet, onMissed, onHelp, nextTime }: {
  greeting: string; evening: boolean; open: DoseView | null
  week: { reported: number; possible: number; taken: number; days: number }
  insight: { title: string; body: string }
  onReport: () => void; onNotYet: () => void; onMissed: () => void; onHelp: () => void; nextTime: string
}) {
  return (
    <div className="calm-page">
      <div className="calm-hero short"><Scene evening={evening} /><div className="hero-copy"><h1 className="ed">{greeting}</h1></div></div>
      <div className="calm-body">
        <section className="spot" aria-label="Next check-in">
          {open ? (
            <>
              <p className="eyebrow">{open.slot === 'am' ? 'Morning' : 'Evening'} check-in</p>
              <p className="big-fig">{open.time}</p>
              {open.cue && <p className="csub">After you {open.cue}</p>}
              <button className="cbtn primary" onClick={onReport}>Report dose taken</button>
              <div className="quiet-actions">
                <button onClick={onNotYet}>Not yet</button><button onClick={onMissed}>Missed</button><button onClick={onHelp}>Need help</button>
              </div>
            </>
          ) : (
            <>
              <p className="eyebrow">All set for now</p>
              <p className="big-fig">{nextTime}</p>
            </>
          )}
        </section>

        <section className="metrics" aria-label="This week">
          <Ring value={week.reported} max={week.possible} label="check-ins" />
          <Ring value={week.taken} max={week.possible} label="taken" />
          <Ring value={week.days} max={7} label="days" />
        </section>

        <section className="insight">
          <p className="ed small">{insight.title}</p>
          <p className="csub">{insight.body}</p>
        </section>
      </div>
    </div>
  )
}

export function CalmRoutine({ plan, history, onEdit }: {
  plan: { am: string; pm: string; amCue: string; pmCue: string; backup: string; food: string }
  history: { day: number; am: string; pm: string }[]
  onEdit: () => void
}) {
  const mark = (st: string) => ({ taken: '●', missed: '✕', help: '?', none: '–', later: '·' } as Record<string, string>)[st] ?? '–'
  return (
    <div className="calm-page">
      <div className="calm-body top">
        <p className="eyebrow">My routine</p>
        <h1 className="ed">Your plan</h1>
        <div className="plan-list">
          <div><span>Morning</span><b>{plan.am}</b><small>after you {plan.amCue}</small></div>
          <div><span>Evening</span><b>{plan.pm}</b><small>after you {plan.pmCue}</small></div>
          <div><span>Backup</span><b>{plan.backup}</b><small>when your day changes</small></div>
          {plan.food && <div><span>Food</span><b>{plan.food}</b><small>keep it the same each day</small></div>}
        </div>
        <button className="cbtn" onClick={onEdit}>Edit my plan</button>

        <h2 className="ed small">Last 7 days</h2>
        <div className="hist" role="table" aria-label="Check-in history">
          <div className="hist-row head" role="row"><span />{history.map((h) => <span key={h.day} role="columnheader">D{h.day}</span>)}</div>
          {(['am', 'pm'] as const).map((k) => (
            <div key={k} className="hist-row" role="row">
              <span role="rowheader">{k === 'am' ? 'AM' : 'PM'}</span>
              {history.map((h) => <span key={h.day} role="cell" className={'mk ' + h[k]} aria-label={h[k]}>{mark(h[k])}</span>)}
            </div>
          ))}
        </div>
        <p className="note">● reported taken · ✕ reported missed · ? asked for help · – no report (unknown, not missed)</p>
      </div>
    </div>
  )
}

type IconName = 'star' | 'check' | 'sun' | 'moon' | 'home' | 'bag' | 'play' | 'help' | 'user' | 'edit' | 'list' | 'chart'
const PATHS: Record<IconName, string> = {
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

/* two simple choices; General is the default */
export function Start({ name, onPick }: { name: string; onPick: (m: 'calm' | 'game') => void }) {
  return (
    <div className="calm-page">
      <div className="calm-body top">
        <p className="eyebrow">Welcome, {name}</p>
        <h1 className="ed">Where to?</h1>
        <button className="choice-card" onClick={() => onPick('calm')}><b>General</b><span>Check-ins and your care team</span></button>
        <button className="choice-card" onClick={() => onPick('game')}><b>Check out my swag room</b><span>Your room, rewards and games</span></button>
      </div>
    </div>
  )
}

export function Account({ name, theme, mode, onTheme, onMode, onSwitchCompanion, onSupport, onSignOut }: {
  name: string; theme: Theme; mode: 'calm' | 'game'
  onTheme: (t: Theme) => void; onMode: (m: 'calm' | 'game') => void; onSwitchCompanion: () => void; onSupport: () => void; onSignOut: () => void
}) {
  return (
    <div className="calm-page">
      <div className="calm-body top">
        <p className="eyebrow">Account</p>
        <h1 className="ed">{name}</h1>
        <div className="linked"><Icon name="check" /><div><b>Patient portal linked</b><small>Single sign-on (simulated)</small></div></div>
        <h2 className="ed small">Appearance</h2>
        <ThemePick theme={theme} onTheme={onTheme} />
        <h2 className="ed small">App version</h2>
        <div className="seg2">
          <button className={mode === 'calm' ? 'on' : ''} onClick={() => onMode('calm')}>General</button>
          <button className={mode === 'game' ? 'on' : ''} onClick={() => onMode('game')}>Swag room</button>
        </div>
        {mode === 'game' && <button className="cbtn" onClick={onSwitchCompanion}>Switch companion</button>}
        <button className="cbtn" onClick={onSupport}>Get support</button>
        <button className="cbtn ghost" onClick={onSignOut}>Sign out</button>
      </div>
    </div>
  )
}

// Calm version (Tend × Oura): quiet hierarchy, one scene, one clear action per card. No game, no rewards.
// Visual direction: docs/design/TEND-OURA-BLEND.md (light, evening) and OURA-STYLE-GUIDE.md (oura).

export type Theme = 'light' | 'evening' | 'oura'
export const THEMES: { id: Theme; name: string; line: string; sw: [string, string, string] }[] = [
  { id: 'light', name: 'Light', line: 'Warm paper, forest green, apricot. The Tend × Oura blend.', sw: ['#f3eee5', '#2f4a3a', '#ef8a4c'] },
  { id: 'evening', name: 'Evening', line: 'Deep pine and warm white. The blend after dark.', sw: ['#101813', '#1d2a22', '#f2a16e'] },
  { id: 'oura', name: 'Oura style', line: 'Near-black canvas, cool atmosphere, quiet white figures.', sw: ['#090b0c', '#252729', '#83c9ef'] },
]

/* atmospheric scene: a tree at the edge of hills; morning or evening light (atmosphere only, never a judgment) */
export function Scene({ evening }: { evening: boolean }) {
  return (
    <svg className="calm-scene" viewBox="0 0 390 210" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--sky-1)" /><stop offset="1" stopColor="var(--sky-2)" />
        </linearGradient>
        <radialGradient id="sunglow"><stop offset="0" stopColor="var(--sun)" stopOpacity=".55" /><stop offset="1" stopColor="var(--sun)" stopOpacity="0" /></radialGradient>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stopColor="var(--page)" stopOpacity="0" /><stop offset="1" stopColor="var(--page)" /></linearGradient>
      </defs>
      <rect width="390" height="210" fill="url(#sky)" />
      <circle cx={evening ? 300 : 90} cy={evening ? 70 : 82} r="70" fill="url(#sunglow)" />
      <circle cx={evening ? 300 : 90} cy={evening ? 70 : 82} r={evening ? 11 : 14} fill="var(--sun)" opacity=".9" />
      <path d="M0 140 C 70 110, 130 122, 200 112 C 270 102, 330 118, 390 104 L390 210 L0 210 Z" fill="var(--hill-1)" />
      <path d="M0 168 C 90 140, 170 160, 250 146 C 310 136, 350 148, 390 140 L390 210 L0 210 Z" fill="var(--hill-2)" />
      <g fill="var(--tree)">
        <rect x="286" y="96" width="5" height="56" rx="2" />
        <ellipse cx="288" cy="92" rx="26" ry="22" /><ellipse cx="270" cy="104" rx="16" ry="13" /><ellipse cx="306" cy="104" rx="17" ry="13" />
      </g>
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

export function CalmWelcome({ theme, onTheme, onNext }: { theme: Theme; onTheme: (t: Theme) => void; onNext: () => void }) {
  return (
    <div className="calm-page">
      <div className="calm-hero"><Scene evening={theme !== 'light'} /><div className="hero-copy"><h1 className="ed">A quiet place for your routine.</h1><p>Check in, keep your plan, reach your care team. Nothing to play, nothing to keep alive.</p></div></div>
      <div className="calm-body">
        <h2 className="ed small">Choose how it looks</h2>
        <ThemePick theme={theme} onTheme={onTheme} />
        <p className="note">You can change this anytime in Support.</p>
        <button className="cbtn primary" onClick={onNext}>Set up my routine</button>
      </div>
    </div>
  )
}

export type DoseView = { slot: 'am' | 'pm'; time: string; cue: string | null; status: 'taken' | 'missed' | 'help' | 'now' | 'later' | 'none' }

export function CalmToday({ greeting, evening, open, doses, week, insight, onReport, onNotYet, onMissed, onHelp, nextTime }: {
  greeting: string; evening: boolean; open: DoseView | null; doses: DoseView[]
  week: { reported: number; possible: number; taken: number; days: number }
  insight: { title: string; body: string }
  onReport: () => void; onNotYet: () => void; onMissed: () => void; onHelp: () => void; nextTime: string
}) {
  const word = { taken: 'Reported taken', missed: 'Reported missed', help: 'Asked for help', now: 'Now', later: 'Later', none: 'No report' }
  return (
    <div className="calm-page">
      <div className="calm-hero short"><Scene evening={evening} /><div className="hero-copy"><p className="eyebrow">Today</p><h1 className="ed">{greeting}</h1></div></div>
      <div className="calm-body">
        <section className="spot" aria-label="Next check-in">
          {open ? (
            <>
              <p className="eyebrow">{open.slot === 'am' ? 'Morning' : 'Evening'} check-in</p>
              <p className="big-fig">{open.time}</p>
              <p className="csub">{open.cue ? `Right after you ${open.cue}.` : 'Whenever you take it, let us know.'}</p>
              <button className="cbtn primary" onClick={onReport}>Report dose taken</button>
              <div className="quiet-actions">
                <button onClick={onNotYet}>Not yet</button><button onClick={onMissed}>Missed</button><button onClick={onHelp}>Need help</button>
              </div>
            </>
          ) : (
            <>
              <p className="eyebrow">All set for now</p>
              <p className="big-fig">{nextTime}</p>
              <p className="csub">Your next check-in.</p>
            </>
          )}
        </section>

        <div className="dose-rows">
          {doses.map((d) => (
            <div key={d.slot} className={'dose-row ' + d.status}>
              <span>{d.slot === 'am' ? 'Morning' : 'Evening'} · {d.time}</span><em>{word[d.status]}</em>
            </div>
          ))}
        </div>

        <section className="metrics" aria-label="This week">
          <Ring value={week.reported} max={week.possible} label={`of ${week.possible} check-ins`} />
          <Ring value={week.taken} max={week.possible} label="reported taken" />
          <Ring value={week.days} max={7} label="days checked in" />
        </section>

        <section className="insight">
          <p className="eyebrow">My routine</p>
          <p className="ed small">{insight.title}</p>
          <p className="csub">{insight.body}</p>
        </section>
        <p className="note">Check-ins are your reports, not proof. Your care team reads them alongside your labs.</p>
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

export function CalmNav({ view, onView }: { view: string; onView: (v: 'room' | 'routine' | 'help') => void }) {
  const tabs: [ 'room' | 'routine' | 'help', string][] = [['room', 'Today'], ['routine', 'Routine'], ['help', 'Support']]
  return (
    <nav className="calm-nav-bar" aria-label="Main">
      {tabs.map(([k, l]) => <button key={k} aria-current={view === k ? 'page' : undefined} className={view === k ? 'on' : ''} onClick={() => onView(k)}><i className={'ic-' + k} />{l}</button>)}
    </nav>
  )
}

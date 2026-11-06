import { useState, type ReactNode } from 'react'
import { Icon, ThemePick, type IconName, type Theme } from './calm'
import type { Entry } from './grow'
import './connect.css'

/* Settings (connected apps + widgets) and Rewards (next incentive tracker + gift cards).
   All connections are simulated: each one hands off to the provider's own sign-in page; ReNu never sees passwords.
   Gift cards are examples of what a program could offer; real-world rewards need program approval. */

/* ---------- connected apps ---------- */

export type Conn = { id: string; name: string; site: string; glyph: IconName; tone: string; blurb: string; perms: string[] }
export const CONNECTORS: Conn[] = [
  { id: 'alexa', name: 'Amazon Alexa', site: 'amazon.com', glyph: 'mic', tone: '#22b8cf', blurb: 'Spoken reminders when you get home', perms: ['Say a reminder at your dose times on your Echo', 'Let you answer “Alexa, tell ReNu I took it”', 'Never says medicine names out loud unless you turn it on'] },
  { id: 'google-home', name: 'Google Home', site: 'home.google.com', glyph: 'home', tone: '#5b8def', blurb: 'Nest speaker and display reminders', perms: ['Speak a reminder at your dose times', 'Log a check-in by voice'] },
  { id: 'oura', name: 'Oura', site: 'ouraring.com', glyph: 'ring', tone: '#8b9dff', blurb: 'Time reminders to when you wake up', perms: ['Read wake-up and bedtime (not sleep scores)', 'Show your check-in in the Oura app'] },
  { id: 'health', name: 'Apple Health', site: 'Health on this iPhone', glyph: 'heart', tone: '#ff6b8b', blurb: 'Sleep and activity, on your phone', perms: ['Read sleep and wake times', 'Write your check-ins to Medications (optional)'] },
  { id: 'fitbit', name: 'Fitbit', site: 'fitbit.com', glyph: 'chart', tone: '#3ddc97', blurb: 'Watch buzz at check-in times', perms: ['Send a quiet buzz to your watch', 'Read wake-up time'] },
  { id: 'mychart', name: 'MyChart', site: 'mychart.cincinnatichildrens.org', glyph: 'list', tone: '#ffb35c', blurb: 'Visits, labs due, care-team messages', perms: ['See upcoming visits and labs due', 'Send messages to your care team through MyChart'] },
  { id: 'sms', name: 'Text messages', site: 'your phone number', glyph: 'help', tone: '#9d8cff', blurb: 'Reminders by text if you prefer', perms: ['Text you at check-in times', 'Reply 1 = took it, 2 = not yet, 3 = need help'] },
]
export const connOf = (id: string) => CONNECTORS.find((c) => c.id === id)!

function Handoff({ c, onDone, onCancel }: { c: Conn; onDone: () => void; onCancel: () => void }) {
  const [busy, setBusy] = useState(false)
  return (
    <div className="modal-dim" onClick={() => !busy && onCancel()}>
      <div className="prompt-sheet cx-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={`Connect ${c.name}`}>
        <div className="grabber" />
        <div className="cx-pair"><span className="cx-logo tend">T</span><span className="cx-dots" aria-hidden="true">···</span><span className="cx-logo" style={{ background: c.tone }}><Icon name={c.glyph} size={20} /></span></div>
        <b>{busy ? `Signing in on ${c.site}…` : `Connect ${c.name}`}</b>
        {busy
          ? <p>Finish signing in on {c.name}'s page, then come back. (Simulated: no website opens in this demo.)</p>
          : <>
            <p>You'll go to <b className="cx-site">{c.site}</b> to sign in and choose what to share. ReNu never sees your password.</p>
            <div className="cx-perms">{c.perms.map((x) => <div key={x}><Icon name="check" size={14} />{x}</div>)}</div>
            <p className="cx-fine">Disconnect anytime in Settings.</p>
          </>}
        <button className="cbtn primary" disabled={busy} onClick={() => { setBusy(true); setTimeout(onDone, 1200) }}>{busy ? 'Waiting for sign-in…' : `Continue to ${c.name}`}</button>
        {!busy && <button className="cbtn ghost" onClick={onCancel}>Cancel</button>}
      </div>
    </div>
  )
}

/* Dashed "add" tile + connected tiles. Used in onboarding and Settings. */
export function ConnectHub({ apps, onConnect, onRemove }: { apps: string[]; onConnect: (id: string) => void; onRemove: (id: string) => void }) {
  const [pick, setPick] = useState(false)
  const [c, setC] = useState<Conn | null>(null)
  const left = CONNECTORS.filter((x) => !apps.includes(x.id))
  return (
    <>
      <div className="cx-grid">
        {apps.map((id) => { const x = connOf(id); return (
          <div key={id} className="cx-tile on">
            <span className="cx-logo" style={{ background: x.tone }}><Icon name={x.glyph} size={18} /></span>
            <b>{x.name}</b><small><i className="cx-live" />Connected</small>
            <button className="cx-x" aria-label={`Disconnect ${x.name}`} onClick={() => onRemove(id)}>Disconnect</button>
          </div>) })}
        {left.length > 0 && <button className="cx-tile cx-add" onClick={() => setPick(true)}><span className="cx-plus"><Icon name="plus" size={20} /></span><b>Add connection</b><small>Alexa, Oura, Health and more</small></button>}
      </div>
      {pick && (
        <div className="modal-dim" onClick={() => setPick(false)}>
          <div className="prompt-sheet cx-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Add a connection">
            <div className="grabber" />
            <b>Use the apps you already have</b>
            <p>ReNu works through them, so reminders reach you where you already look.</p>
            <div className="group cx-list">
              {left.map((x) => (
                <button key={x.id} className="row-ios" onClick={() => { setPick(false); setC(x) }}>
                  <span className="glyph" style={{ background: x.tone }}><Icon name={x.glyph} size={15} /></span>
                  <span className="row-title">{x.name}<small>{x.blurb}</small></span><span className="chev" aria-hidden="true" />
                </button>
              ))}
            </div>
            <button className="cbtn ghost" onClick={() => setPick(false)}>Close</button>
          </div>
        </div>
      )}
      {c && <Handoff c={c} onCancel={() => setC(null)} onDone={() => { onConnect(c.id); setC(null) }} />}
    </>
  )
}

/* ---------- widgets ---------- */

export const WIDGETS: { id: string; name: string; size: 'S' | 'M'; blurb: string }[] = [
  { id: 'next', name: 'Next check-in', size: 'S', blurb: 'Time only. No medicine names on your Home Screen.' },
  { id: 'today', name: 'Today', size: 'M', blurb: 'Morning and evening status, tap to check in.' },
  { id: 'reward', name: 'This week', size: 'S', blurb: 'Doses checked in toward this week’s $10 card.' },
]
export function WidgetPreview({ id, next, am, pm, pts, goal }: { id: string; next: string; am: string; pm: string; pts: number; goal: number }) {
  if (id === 'next') return <div className="wg wg-s"><small>ReNu</small><b>{next}</b><span>Next check-in</span></div>
  if (id === 'reward') return <div className="wg wg-s"><small>ReNu · this week</small><b>{pts}/{goal}</b><span>doses for your $10 card</span><i style={{ ['--p' as string]: `${Math.min(100, (pts / goal) * 100)}%` }} /></div>
  return <div className="wg wg-m"><small>ReNu · today</small><div><span><Icon name="sun" size={14} />{am}</span><span><Icon name="moon" size={14} />{pm}</span></div><em>Tap to check in</em></div>
}
function WidgetSheet({ have, onAdd, onClose, preview }: { have: string[]; onAdd: (id: string) => void; onClose: () => void; preview: (id: string) => ReactNode }) {
  const [sel, setSel] = useState(WIDGETS.find((w) => !have.includes(w.id))?.id ?? 'next')
  const w = WIDGETS.find((x) => x.id === sel)!
  return (
    <div className="modal-dim" onClick={onClose}>
      <div className="prompt-sheet cx-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Add a widget">
        <div className="grabber" />
        <b>Add a widget</b>
        <div className="segpill">{WIDGETS.map((x) => <button key={x.id} className={sel === x.id ? 'on' : ''} onClick={() => setSel(x.id)}>{x.name}</button>)}</div>
        <div className="wg-stage">{preview(sel)}</div>
        <p>{w.blurb}</p>
        <button className="cbtn primary" disabled={have.includes(sel)} onClick={() => onAdd(sel)}>{have.includes(sel) ? 'Already on your Home Screen' : 'Add to Home Screen'}</button>
        <button className="cbtn ghost" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

/* ---------- settings ---------- */

export function Settings({ name, theme, onTheme, apps, onConnect, onRemove, widgets, onWidget, onRemoveWidget, preview, schedule, onSupport, onSignOut }: {
  name: string; theme: Theme; onTheme: (t: Theme) => void
  apps: string[]; onConnect: (id: string) => void; onRemove: (id: string) => void
  widgets: string[]; onWidget: (id: string) => void; onRemoveWidget: (id: string) => void; preview: (id: string) => ReactNode
  schedule: ReactNode; onSupport: () => void; onSignOut: () => void
}) {
  const [wsheet, setWsheet] = useState(false)
  return (
    <div className="calm-page">
      <div className="calm-body top">
        <h1 className="large-title">Settings</h1>
        <div className="group">
          <div className="row-ios profile"><span className="avatar-ios">{name[0]}</span><span className="row-title">{name}<small>Patient portal linked (simulated)</small></span></div>
        </div>
        <p className="group-label">Connected apps</p>
        <ConnectHub apps={apps} onConnect={onConnect} onRemove={onRemove} />
        {schedule}
        <p className="group-label">Widgets</p>
        <div className="cx-grid">
          {widgets.map((id) => (
            <div key={id} className="cx-tile on wg-tile">{preview(id)}<button className="cx-x" onClick={() => onRemoveWidget(id)}>Remove</button></div>
          ))}
          {widgets.length < WIDGETS.length && <button className="cx-tile cx-add" onClick={() => setWsheet(true)}><span className="cx-plus"><Icon name="grid" size={20} /></span><b>Add widget</b><small>Next check-in on your Home Screen</small></button>}
        </div>
        <p className="group-label">Appearance</p>
        <ThemePick theme={theme} onTheme={onTheme} />
        <div className="group">
          <button className="row-ios" onClick={onSupport}><span className="glyph" style={{ background: 'var(--sys-blue)' }}><Icon name="help" size={15} /></span><span className="row-title">Get support</span><span className="chev" aria-hidden="true" /></button>
          <div className="row-ios"><span className="glyph" style={{ background: 'var(--sys-indigo)' }}><Icon name="lock" size={15} /></span><span className="row-title">Privacy<small>Your parent sees status, never your answers</small></span></div>
        </div>
        <div className="group"><button className="row-ios danger" onClick={onSignOut}><span className="row-title">Sign out</span></button></div>
      </div>
      {wsheet && <WidgetSheet have={widgets} preview={preview} onClose={() => setWsheet(false)} onAdd={(id) => { onWidget(id); setWsheet(false) }} />}
    </div>
  )
}

/* ---------- rewards ---------- */

export const TIERS = [{ usd: 5, pts: 300 }, { usd: 10, pts: 600 }, { usd: 25, pts: 1500 }]
export const CARDS: { id: string; name: string; c1: string; c2: string; tag: string }[] = [
  { id: 'amazon', name: 'Amazon', c1: '#232f3e', c2: '#ff9900', tag: 'Shopping' },
  { id: 'target', name: 'Target', c1: '#cc0000', c2: '#ff4d4d', tag: 'Shopping' },
  { id: 'starbucks', name: 'Starbucks', c1: '#00704a', c2: '#1e9e6a', tag: 'Food' },
  { id: 'spotify', name: 'Spotify', c1: '#121212', c2: '#1ed760', tag: 'Music' },
  { id: 'roblox', name: 'Roblox', c1: '#1f2937', c2: '#e5e7eb', tag: 'Games' },
  { id: 'apple', name: 'Apple', c1: '#1c1c1e', c2: '#8e8e93', tag: 'Apps & music' },
  { id: 'chipotle', name: 'Chipotle', c1: '#451400', c2: '#a81612', tag: 'Food' },
  { id: 'nintendo', name: 'Nintendo eShop', c1: '#e60012', c2: '#ff5a5f', tag: 'Games' },
  { id: 'xbox', name: 'Xbox', c1: '#0e7a0d', c2: '#52b043', tag: 'Games' },
  { id: 'bn', name: 'Barnes & Noble', c1: '#2a5934', c2: '#5d8a63', tag: 'Books' },
  { id: 'amc', name: 'AMC Theatres', c1: '#1a1a1a', c2: '#e50914', tag: 'Movies' },
  { id: 'doordash', name: 'DoorDash', c1: '#eb1700', c2: '#ff6a4d', tag: 'Food' },
  { id: 'sephora', name: 'Sephora', c1: '#000000', c2: '#555555', tag: 'Beauty' },
  { id: 'nike', name: 'Nike', c1: '#111111', c2: '#ff6a00', tag: 'Sports' },
  { id: 'gplay', name: 'Google Play', c1: '#0f9d58', c2: '#4285f4', tag: 'Apps & games' },
  { id: 'visa', name: 'Visa prepaid', c1: '#1a1f71', c2: '#4b5bd6', tag: 'Anywhere' },
]
export type Redeem = { id: number; card: string; usd: number; pts: number; day: number; st: 'pending' | 'sent' }
const shuffle = (seed: number) => [...CARDS].map((c, i) => ({ c, k: Math.sin(seed * 97 + i * 13.37) })).sort((a, b) => a.k - b.k).map((x) => x.c)

export function Rewards({ pts, ledger, goal, reqs, onGoal, onRedeem, onGrow, perDay }: {
  pts: number; ledger: Entry[]; goal: { card: string; usd: number } | null; reqs: Redeem[]; perDay: number
  onGoal: (card: string, usd: number) => void; onRedeem: (card: string, usd: number, cost: number) => void; onGrow: () => void
}) {
  const [seed, setSeed] = useState(1)
  const [open, setOpen] = useState<string | null>(null)
  const [tab, setTab] = useState<'cards' | 'history'>('cards')
  const tier = goal ? TIERS.find((t) => t.usd === goal.usd)! : TIERS.find((t) => t.pts > pts) ?? TIERS[TIERS.length - 1]
  const card = goal ? CARDS.find((c) => c.id === goal.card)! : null
  const left = Math.max(0, tier.pts - pts), pct = Math.min(100, (pts / tier.pts) * 100)
  const days = Math.ceil(left / perDay)
  const list = shuffle(seed).slice(0, 8)
  const sel = open ? CARDS.find((c) => c.id === open)! : null
  return (
    <div className="calm-page">
      <div className="calm-body top rw">
        <h1 className="large-title">Rewards</h1>
        <section className="rw-hero" aria-label="Next reward">
          <div className="rw-ring" style={{ ['--p' as string]: `${pct}%` }}><div><b>{pts}</b><small>points</small></div></div>
          <div className="rw-next">
            <small>Next reward</small>
            <b>${tier.usd} {card ? card.name : 'gift card'}</b>
            <span>{left ? `${left} points to go · about ${days} day${days === 1 ? '' : 's'} of check-ins` : 'Ready to redeem'}</span>
            <div className="rw-steps">{TIERS.map((t) => <i key={t.usd} className={pts >= t.pts ? 'got' : t === tier ? 'now' : ''}>${t.usd}<em>{t.pts}</em></i>)}</div>
          </div>
        </section>
        <div className="rw-earn">
          <div><b>+10</b><small>every honest check-in, even “Missed”</small></div>
          <div><b>+15–40</b><small>Grow steps your parent or team confirms</small></div>
          <button onClick={onGrow}><b>Grow</b><small>See steps ›</small></button>
        </div>
        <div className="segpill"><button className={tab === 'cards' ? 'on' : ''} onClick={() => setTab('cards')}>Gift cards</button><button className={tab === 'history' ? 'on' : ''} onClick={() => setTab('history')}>History</button></div>
        {tab === 'cards' ? <>
          <div className="rw-head"><p className="group-label">Pick a goal</p><button className="rw-shuffle" onClick={() => setSeed(seed + 1)}>Shuffle</button></div>
          <div className="rw-cards">
            {list.map((c) => (
              <button key={c.id} className={'rw-card' + (goal?.card === c.id ? ' is-goal' : '')} style={{ ['--c1' as string]: c.c1, ['--c2' as string]: c.c2 }} onClick={() => setOpen(c.id)}>
                <span className="rw-brand">{c.name}</span><small>{c.tag}</small><em>from 300 pts</em>
                {goal?.card === c.id && <i className="rw-goal">Goal</i>}
              </button>
            ))}
          </div>
          <p className="foot">Example rewards. Real gift cards would come from the transplant program and need its approval. Points are for showing up and building skills, never for perfect doses.</p>
        </> : <>
          {reqs.length > 0 && <div className="group">{reqs.map((r) => <div key={r.id} className="row-ios"><span className="glyph" style={{ background: r.st === 'sent' ? 'var(--sys-green)' : 'var(--sys-orange)' }}><Icon name="gift" size={15} /></span><span className="row-title">${r.usd} {CARDS.find((c) => c.id === r.card)!.name}<small>{r.st === 'sent' ? 'Approved · code sent to your email (simulated)' : 'Waiting for program approval'}</small></span><span className="row-detail">−{r.pts}</span></div>)}</div>}
          <div className="group">
            {ledger.length === 0 && <div className="row-ios"><span className="row-title">No points yet<small>Check in to start</small></span></div>}
            {[...ledger].reverse().slice(0, 12).map((e, i) => <div key={i} className="row-ios"><span className="glyph" style={{ background: e.amt < 0 ? 'var(--sys-pink)' : 'var(--sys-indigo)' }}><Icon name={e.amt < 0 ? 'gift' : 'star'} size={15} /></span><span className="row-title">{e.text}<small>Day {e.day}</small></span><span className="row-detail">{e.amt > 0 ? '+' : ''}{e.amt}</span></div>)}
          </div>
        </>}
      </div>
      {sel && (
        <div className="modal-dim" onClick={() => setOpen(null)}>
          <div className="prompt-sheet cx-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={sel.name}>
            <div className="grabber" />
            <div className="rw-card big" style={{ ['--c1' as string]: sel.c1, ['--c2' as string]: sel.c2 }}><span className="rw-brand">{sel.name}</span><small>{sel.tag}</small></div>
            <div className="group cx-list">
              {TIERS.map((t) => (
                <div key={t.usd} className="row-ios">
                  <span className="row-title">${t.usd} gift card<small>{t.pts} points{pts < t.pts ? ` · ${t.pts - pts} to go` : ''}</small></span>
                  {pts >= t.pts
                    ? <button className="rw-btn" onClick={() => { onRedeem(sel.id, t.usd, t.pts); setOpen(null) }}>Redeem</button>
                    : <button className="rw-btn ghost" onClick={() => { onGoal(sel.id, t.usd); setOpen(null) }}>{goal?.card === sel.id && goal.usd === t.usd ? 'Your goal' : 'Set goal'}</button>}
                </div>
              ))}
            </div>
            <p className="cx-fine">Redeeming sends a request; the program approves before a code is sent. Simulated.</p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- weekly reward (team rule: $10 card for a week at 99%+ of doses checked in as taken) ---------- */

export type Week = { wk: number; taken: number; total: number; earned: boolean; card: string; st: 'pending' | 'sent' | 'none'; sim?: boolean }
export type DayDots = { label: string; am: string; pm: string }
const PICK = ['amazon', 'target', 'starbucks', 'spotify', 'roblox', 'chipotle', 'apple', 'nintendo']

export function WeeklyRewards({ card, onCard, days, taken, total, off, ends, fresh, history }: {
  fresh: string; card: string | null; onCard: (id: string) => void; days: DayDots[]; taken: number; total: number; off: boolean; ends: string; history: Week[]
}) {
  const [pick, setPick] = useState(false)
  const c = card ? CARDS.find((x) => x.id === card)! : null
  const need = Math.ceil(total * 0.99)
  return (
    <div className="calm-page">
      <div className="calm-body top rw">
        <h1 className="large-title">Rewards</h1>
        <section className={'wk-hero' + (off ? ' off' : '')} aria-label="This week">
          <small>This week · ends {ends}</small>
          <b>{taken} of {total} doses</b>
          <div className="wk-bar"><i style={{ width: `${(taken / total) * 100}%` }} /></div>
          <span className="wk-status">{off
            ? `This week’s card is off the table. A fresh week starts ${fresh}. You’ve got this.`
            : `On track for a $10 ${c ? c.name : 'gift'} card. Check in every dose (${need} of ${total}).`}</span>
          <div className="wk-days">{days.map((d, i) => (
            <div key={i}><em>{d.label}</em><span className={d.am} title={`Morning: ${d.am}`} /><span className={d.pm} title={`Evening: ${d.pm}`} /></div>
          ))}</div>
          <p className="wk-key"><span className="taken" /> taken <span className="missed" /> missed or no check-in <span className="later" /> coming up</p>
        </section>
        <p className="group-label">Your card this week</p>
        <button className="wk-pick" onClick={() => setPick(true)}>
          {c ? <span className="rw-card mini" style={{ ['--c1' as string]: c.c1, ['--c2' as string]: c.c2 }}><span className="rw-brand">{c.name}</span></span> : <span className="cx-plus"><Icon name="gift" size={18} /></span>}
          <span className="row-title">{c ? `$10 ${c.name}` : 'Pick a gift card'}<small>{c ? 'Tap to change' : 'Choose what you’re working toward'}</small></span><span className="chev" aria-hidden="true" />
        </button>
        {history.length > 0 && <>
          <p className="group-label">Past weeks</p>
          <div className="group">{history.map((w, i) => (
            <div key={i} className="row-ios"><span className="glyph" style={{ background: w.earned ? 'var(--sys-green)' : 'var(--track)' }}><Icon name={w.earned ? 'gift' : 'moon'} size={15} /></span>
              <span className="row-title">{w.sim ? 'Sample week' : `Week ${w.wk + 1}`}: {w.taken} of {w.total}<small>{w.earned ? (w.st === 'sent' ? `$10 ${CARDS.find((x) => x.id === w.card)!.name} sent to your email` : 'Earned · waiting for program approval') : 'No card this week'}</small></span>
              <span className="row-detail">{w.earned ? '$10' : '—'}</span></div>
          ))}</div>
        </>}
        <p className="foot">Based on your check-ins. Your care team may compare with lab results. Missing a week never affects your care. Program-funded; simulated in this demo.</p>
      </div>
      {pick && (
        <div className="modal-dim" onClick={() => setPick(false)}>
          <div className="prompt-sheet cx-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Pick a gift card">
            <div className="grabber" />
            <b>Pick your $10 card</b>
            <div className="rw-cards">{PICK.map((id) => { const x = CARDS.find((y) => y.id === id)!; return (
              <button key={id} className={'rw-card' + (card === id ? ' is-goal' : '')} style={{ ['--c1' as string]: x.c1, ['--c2' as string]: x.c2 }} onClick={() => { onCard(id); setPick(false) }}>
                <span className="rw-brand">{x.name}</span><small>{x.tag}</small><em>$10</em>{card === id && <i className="rw-goal">Picked</i>}</button>) })}</div>
          </div>
        </div>
      )}
    </div>
  )
}

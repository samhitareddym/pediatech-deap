import { useState } from 'react'
import { Px } from './icons'
import { Sprite, type Species } from './sprites'

// Routine quiz from HABIT-AND-PROMPTING.md: agree a practical routine before any prompting.
// Dose times are NOT asked here; they come from the care team's prescription.

export type Plan = {
  amCue: string; pmCue: string
  where: string; access: string
  away: string; backup: string
  barriers: string[]
  help: string[]; location: string
}
export const emptyPlan: Plan = { amCue: '', pmCue: '', where: '', access: '', away: '', backup: '', barriers: [], help: [], location: '' }

type Group = { key: keyof Plan; label: string; options: string[]; multi?: boolean; none?: string }
type Screen = { q: (name: string) => string; groups: Group[] }

// Barrier options map to BAT items so answers route to the right owner.
export const BARRIER_TO_BAT: Record<string, number> = {
  'I forget': 1, 'The taste': 2, 'Pills are hard to swallow': 3, 'Side effects': 4,
  "I don't want others to know": 5, "I'm too busy": 12, 'I run out': 10,
}

const SCREENS: Screen[] = [
  {
    q: () => `What do you usually do around medicine time?`,
    groups: [
      { key: 'amCue', label: 'Morning', options: ['Brush my teeth', 'Eat breakfast', 'Get dressed', 'Check my phone', 'Something else'] },
      { key: 'pmCue', label: 'Evening', options: ['Eat dinner', 'Brush my teeth', 'Shower', 'Homework or games', 'Get ready for bed', 'Something else'] },
    ],
  },
  {
    q: () => `Where are you at medicine time on most days?`,
    groups: [
      { key: 'where', label: 'I am usually at', options: ['Home', 'School', 'Work', 'One of two homes', 'It changes'] },
      { key: 'access', label: 'Is your medicine there?', options: ['Yes, always', 'Sometimes', 'No'] },
    ],
  },
  {
    q: () => `What changes on weekends or days away?`,
    groups: [
      { key: 'away', label: 'Usually', options: ['I sleep in', 'Sleepovers', 'Sports or trips', 'My other home', 'Not much'] },
      { key: 'backup', label: 'Backup plan when my day changes', options: ['Phone alarm', 'Pocket pill case', 'A text from someone I pick', 'Take it with a meal'] },
    ],
  },
  {
    q: () => `Does anything make it hard right now? Pick any.`,
    groups: [
      { key: 'barriers', label: 'Lots of people say yes to some of these', multi: true, none: 'Nothing right now', options: [...Object.keys(BARRIER_TO_BAT), 'Something else', 'Nothing right now'] },
    ],
  },
  {
    q: (n) => `How should ${n} help you?`,
    groups: [
      { key: 'help', label: 'Pick any', multi: true, options: ['Quiet nudges that never say "medicine"', 'Check in at my routine', 'Let a parent help', 'Help from my care team'] },
      { key: 'location', label: 'Nudge me when I get home? (optional)', options: ['Not now', 'Yes, when I get home'] },
    ],
  },
]

const low = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)
const time = (m: number) => { const h = Math.floor(m / 60); return `${((h + 11) % 12) + 1}:${String(m % 60).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}` }

export function Onboarding({ sp, name, doses, onDone }: { sp: Species; name: string; doses: { am: number; pm: number }; onDone: (p: Plan) => void }) {
  const [i, setI] = useState(0)
  const [p, setP] = useState<Plan>(emptyPlan)
  const total = SCREENS.length + 1
  const last = i === SCREENS.length

  const pick = (g: Group, o: string) => setP((cur) => {
    if (!g.multi) return { ...cur, [g.key]: o }
    const list = cur[g.key] as string[]
    if (o === g.none) return { ...cur, [g.key]: list.includes(o) ? [] : [o] }
    const base = list.filter((x) => x !== g.none)
    return { ...cur, [g.key]: base.includes(o) ? base.filter((x) => x !== o) : [...base, o] }
  })
  const answered = last || SCREENS[i].groups.every((g) => g.key === 'location' || (g.multi ? (p[g.key] as string[]).length > 0 : p[g.key] !== ''))

  const am = p.amCue === 'Something else' ? 'my morning routine' : low(p.amCue || 'my morning routine')
  const pm = p.pmCue === 'Something else' ? 'my evening routine' : low(p.pmCue || 'my evening routine')

  return (
    <div className="quiz">
      <div className="pips">{Array.from({ length: total }, (_, k) => <i key={k} className={k < i ? 'done' : k === i ? 'now' : ''} />)}</div>
      <div className="ask">
        <div className="ask-sprite bob"><Sprite sp={sp} mood={last ? 'joy' : 'happy'} /></div>
        <div className="speech">{last ? `Here's our plan! Does it fit your day?` : SCREENS[i].q(name)}</div>
      </div>

      {i === 0 && (
        <div className="rx">
          <span className="rx-label">Medicine times from your care team</span>
          <span className="rx-times"><Px name="sun" size={14} /> {time(doses.am)} <Px name="moon" size={14} /> {time(doses.pm)}</span>
        </div>
      )}

      <div className="quiz-body">
        {!last && SCREENS[i].groups.map((g) => (
          <div key={g.key} className="qgroup">
            <span className="qlabel">{g.label}</span>
            <div className="qopts">
              {g.options.map((o) => {
                const on = g.multi ? (p[g.key] as string[]).includes(o) : p[g.key] === o
                return <button key={o} className={'qopt' + (on ? ' on' : '')} onClick={() => pick(g, o)}>{on && <Px name="check" size={11} />}{o}</button>
              })}
            </div>
          </div>
        ))}

        {last && (
          <div className="plan-cards">
            <div className="plan-card"><Px name="sun" size={16} /><p>After I <b>{am}</b>, at <b>{time(doses.am)}</b>, I take my medicine.</p></div>
            <div className="plan-card"><Px name="moon" size={16} /><p>After I <b>{pm}</b>, at <b>{time(doses.pm)}</b>, I take my medicine.</p></div>
            <div className="plan-card alt"><Px name="star" size={16} /><p>If my day changes, my backup is: <b>{low(p.backup || 'Phone alarm')}</b>.</p></div>
            {p.access && p.access !== 'Yes, always' && <p className="flag">Your medicine isn't always where you are. Your care team can help with that.</p>}
            {p.barriers.some((b) => b !== 'Nothing right now') && <p className="flag">Thanks for being honest about what's hard. Your team will help you with it.</p>}
          </div>
        )}
      </div>

      <div className="quiz-nav">
        <button className="back" disabled={i === 0} onClick={() => setI(i - 1)}>BACK</button>
        {last
          ? <>
              <button className="back" onClick={() => setI(0)}>CHANGE</button>
              <button className="next" onClick={() => onDone(p)}>THAT'S MY PLAN</button>
            </>
          : <button className="next" disabled={!answered} onClick={() => setI(i + 1)}>NEXT</button>}
      </div>
    </div>
  )
}

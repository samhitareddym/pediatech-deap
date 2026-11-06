import { useState } from 'react'
import { Px } from './icons'
import { Sprite, type Species } from './sprites'

// Routine quiz from HABIT-AND-PROMPTING.md: learn the routine the patient has now, then agree a plan.
// The care team sets HOW OFTEN (e.g. twice a day, ~12h apart). The patient picks WHEN, to fit their life.

export type Plan = {
  when: string[]; food: string
  amCue: string; pmCue: string
  where: string; access: string
  away: string; backup: string
  barriers: string[]
  help: string[]; location: string
}
export const emptyPlan: Plan = { when: [], food: '', amCue: '', pmCue: '', where: '', access: '', away: '', backup: '', barriers: [], help: [], location: '' }

type Group = { key: keyof Plan; label: string; options: string[]; multi?: boolean; none?: string }
type Screen = { q: (name: string) => string; groups: Group[]; times?: boolean }

export const BARRIER_TO_BAT: Record<string, number> = {
  'I forget': 1, 'The taste': 2, 'Pills are hard to swallow': 3, 'Side effects': 4,
  "I don't want others to know": 5, "I'm too busy": 12, 'I run out': 10,
}

const NO_SCHEDULE = "I don't really have a schedule right now"
const SLOT_TIME: Record<string, number> = { Morning: 480, Midday: 720, Afternoon: 900, Evening: 1200, Bedtime: 1290 }
const TEAM_RULE = '2 times a day, about 12 hours apart' // from the care team (configurable per patient)

const SCREENS: Screen[] = [
  {
    q: () => `When do you take your medicine right now?`,
    groups: [
      { key: 'when', label: 'Pick the times you usually take it', multi: true, none: NO_SCHEDULE, options: ['Morning', 'Midday', 'Afternoon', 'Evening', 'Bedtime', NO_SCHEDULE] },
      { key: 'food', label: 'Do you take it with food?', options: ['With a meal', 'Without food', 'It changes'] },
    ],
  },
  {
    q: () => `About what time, and what do you do right before?`,
    times: true,
    groups: [
      { key: 'amCue', label: 'First dose', options: ['Brush my teeth', 'Eat breakfast', 'Get dressed', 'Check my phone', 'Something else'] },
      { key: 'pmCue', label: 'Second dose', options: ['Eat dinner', 'Brush my teeth', 'Shower', 'Homework or games', 'Get ready for bed', 'Something else'] },
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
const time = (m: number) => { const h = Math.floor(m / 60) % 24; return `${((h + 11) % 12) + 1}:${String(m % 60).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}` }
const toInput = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
const fromInput = (v: string) => { const [h, m] = v.split(':').map(Number); return h * 60 + (m || 0) }

// Turn "Morning + Evening" into two clock times; one pick gets a partner 12 hours later.
function startTimes(when: string[]) {
  const picks = when.filter((w) => SLOT_TIME[w] !== undefined).map((w) => SLOT_TIME[w]).sort((a, b) => a - b)
  if (!picks.length) return { am: 480, pm: 1200 }
  if (picks.length === 1) return picks[0] < 720 ? { am: picks[0], pm: picks[0] + 720 } : { am: picks[0] - 720, pm: picks[0] }
  return { am: picks[0], pm: picks[picks.length - 1] }
}

export function Onboarding({ sp, name, onDone }: { sp: Species; name: string; onDone: (p: Plan, t: { am: number; pm: number }) => void }) {
  const [i, setI] = useState(0)
  const [p, setP] = useState<Plan>(emptyPlan)
  const [t, setT] = useState({ am: 480, pm: 1200 })
  const total = SCREENS.length + 1
  const last = i === SCREENS.length
  const noSchedule = p.when.includes(NO_SCHEDULE)
  const gap = (t.pm - t.am) / 60

  const pick = (g: Group, o: string) => setP((cur) => {
    if (!g.multi) return { ...cur, [g.key]: o }
    const list = cur[g.key] as string[]
    if (o === g.none) return { ...cur, [g.key]: list.includes(o) ? [] : [o] }
    const base = list.filter((x) => x !== g.none)
    return { ...cur, [g.key]: base.includes(o) ? base.filter((x) => x !== o) : [...base, o] }
  })
  const answered = last || SCREENS[i].groups.every((g) =>
    g.key === 'location' || (g.key === 'food' && noSchedule) || (g.multi ? (p[g.key] as string[]).length > 0 : p[g.key] !== ''))
  const next = () => { if (i === 0) setT(startTimes(p.when)); setI(i + 1) }

  const am = p.amCue === 'Something else' ? 'my morning routine' : low(p.amCue || 'my morning routine')
  const pm = p.pmCue === 'Something else' ? 'my evening routine' : low(p.pmCue || 'my evening routine')
  const screen = SCREENS[i]

  return (
    <div className="quiz">
      <div className="pips">{Array.from({ length: total }, (_, k) => <i key={k} className={k < i ? 'done' : k === i ? 'now' : ''} />)}</div>
      <div className="ask">
        <div className="ask-sprite bob"><Sprite sp={sp} mood={last ? 'joy' : 'happy'} /></div>
        <div className="speech">
          {last ? `Here's our plan! Does it fit your day?`
            : screen.times && noSchedule ? `No problem! Let's pick times that could work. We can change them anytime.`
            : screen.q(name)}
        </div>
      </div>

      <div className="quiz-body">
        {screen?.times && (
          <div className="rx">
            <span className="rx-label">Your care team says: {TEAM_RULE}</span>
            <div className="rx-inputs">
              <label><Px name="sun" size={14} /> First <input type="time" value={toInput(t.am)} onChange={(e) => setT({ ...t, am: fromInput(e.target.value) })} /></label>
              <label><Px name="moon" size={14} /> Second <input type="time" value={toInput(t.pm)} onChange={(e) => setT({ ...t, pm: fromInput(e.target.value) })} /></label>
            </div>
            {(gap < 11 || gap > 13) && <span className="rx-warn">These are {Math.round(gap * 10) / 10} hours apart. Your team usually wants about 12. You can ask them.</span>}
          </div>
        )}

        {!last && screen.groups.filter((g) => !(g.key === 'food' && noSchedule)).map((g) => (
          <div key={g.key} className="qgroup">
            <span className="qlabel">{screen.times ? `${g.label} · ${time(g.key === 'amCue' ? t.am : t.pm)}` : g.label}</span>
            <div className="qopts">
              {g.options.map((o) => {
                const on = g.multi ? (p[g.key] as string[]).includes(o) : p[g.key] === o
                return <button key={o} className={'qopt' + (on ? ' on' : '') + (o === g.none ? ' wide' : '')} onClick={() => pick(g, o)}>{on && <Px name="check" size={11} />}{o}</button>
              })}
            </div>
          </div>
        ))}

        {last && (
          <div className="plan-cards">
            <div className="plan-card"><Px name="sun" size={16} /><p>After I <b>{am}</b>, at <b>{time(t.am)}</b>, I take my medicine{p.food === 'With a meal' ? ' with food' : p.food === 'Without food' ? ' without food' : ''}.</p></div>
            <div className="plan-card"><Px name="moon" size={16} /><p>After I <b>{pm}</b>, at <b>{time(t.pm)}</b>, I take my medicine{p.food === 'With a meal' ? ' with food' : p.food === 'Without food' ? ' without food' : ''}.</p></div>
            <div className="plan-card alt"><Px name="star" size={16} /><p>If my day changes, my backup is: <b>{low(p.backup || 'Phone alarm')}</b>.</p></div>
            {(noSchedule || p.food === 'It changes') && <p className="flag">Your team will help you settle on times{p.food === 'It changes' ? ' and whether to take it with food' : ''}. Taking it the same way each day helps it work best.</p>}
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
              <button className="next" onClick={() => onDone(p, t)}>THAT'S MY PLAN</button>
            </>
          : <button className="next" disabled={!answered} onClick={next}>NEXT</button>}
      </div>
    </div>
  )
}

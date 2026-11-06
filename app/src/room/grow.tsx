import { useState } from 'react'
import { Icon } from './calm'
import './grow.css'

/* Grow: a transition-readiness journey in four chapters (Seed → Sprout → Sapling → Tree) plus a rewards tracker.
   Built in the General app's language (grouped rows, segmented control, bottom sheets, Bright-theme tiles).
   - Starts early, when habits form: Leo (8) begins in Seed with Mom doing most of it.
   - Mixes medicine steps with everyday-life steps (packing a bag, keeping a calendar, speaking up).
   - Each chapter has a monthly challenge the child does and a parent validates day by day.
   - Steps follow the four TRAQ areas (Transition Readiness Assessment Questionnaire; Wood et al. 2014):
     managing medications, keeping appointments, tracking health issues, talking with providers. Our own list built
     on those areas, not the TRAQ itself.
   - Clinicians: independence follows skills, not age. Ages are typical, never gates. The care team approves each
     new chapter; the app only suggests when to talk about it. */

export type Cat = 'Medicine' | 'Everyday' | 'Talking' | 'Planning'
export type How = 'app' | 'parent' | 'clinic'
export type Step = { id: string; ch: number; label: string; cat: Cat; how: How; pts: number }
export type StepState = { st: 'todo' | 'claimed' | 'confirmed'; by?: string; day?: number }
export type Entry = { day: number; text: string; amt: number; src: 'checkin' | 'skill' | 'level' | 'game' | 'shop' | 'demo' | 'challenge' }
export type Wallet = { tokens: number; ledger: Entry[] }
export type KidId = 'leo' | 'maya'
export type Kid = Wallet & {
  id: KidId; name: string; age: number; parent: string; chapter: number; asked: boolean; badges: string[]
  steps: Record<string, StepState>
  challenge: { days: { day: number; ok: boolean }[]; done: boolean }
}
export type Trans = { who: KidId; kids: Record<KidId, Kid> }

export const CHAPTERS = [
  { n: 1, name: 'Seed', line: 'Learn the routine', typical: 'Often starts around ages 7–10',
    you: ['A parent gives your doses while you learn', 'You help: get your water, say which pill is which', 'Your parent gets every reminder'],
    parent: 'Gives doses and gets every reminder' },
  { n: 2, name: 'Sprout', line: 'Do it, with backup', typical: 'Often around ages 10–14',
    you: ['You take your doses with a parent checking', 'Reminders come to you and your parent', 'You answer your own check-ins'],
    parent: 'Checks on doses and gets reminders too' },
  { n: 3, name: 'Sapling', line: 'You lead, parent backs up', typical: 'Often around ages 14–17',
    you: ['Reminders come to you first', 'You order and pick up your own refills', 'Your parent gets a weekly “on track” summary', 'You message your care team directly'],
    parent: 'Gets a weekly “on track” summary' },
  { n: 4, name: 'Tree', line: 'Ready for adult care', typical: 'Often around ages 17–21',
    you: ['You choose what your parent can see', 'You book your own visits', 'Adult-care readiness checklist with your team'],
    parent: 'Sees only what you choose to share' },
]

export const STEPS: Step[] = [
  { id: 'looks', ch: 1, label: 'Know what each of my medicines looks like', cat: 'Medicine', how: 'parent', pts: 10 },
  { id: 'cue', ch: 1, label: 'Take my dose right after brushing my teeth', cat: 'Medicine', how: 'parent', pts: 10 },
  { id: 'bag', ch: 1, label: 'Pack my own school bag the night before', cat: 'Everyday', how: 'parent', pts: 10 },
  { id: 'feel', ch: 1, label: 'Tell a grown-up when I feel sick or different', cat: 'Talking', how: 'parent', pts: 10 },
  { id: 'setout', ch: 2, label: 'Set out my own doses with a parent checking', cat: 'Medicine', how: 'parent', pts: 20 },
  { id: 'alarm', ch: 2, label: 'Set up my own routine in Tend', cat: 'Planning', how: 'app', pts: 10 },
  { id: 'checkins', ch: 2, label: 'Check in on my own on 3 days', cat: 'Medicine', how: 'app', pts: 20 },
  { id: 'names', ch: 2, label: 'Say my medicines’ names and times to my care team', cat: 'Talking', how: 'clinic', pts: 20 },
  { id: 'sleepover', ch: 2, label: 'Pack my medicines for a sleepover or trip', cat: 'Planning', how: 'parent', pts: 20 },
  { id: 'refill', ch: 3, label: 'Order a refill myself', cat: 'Medicine', how: 'parent', pts: 30 },
  { id: 'pickup', ch: 3, label: 'Pick up my prescription myself', cat: 'Medicine', how: 'parent', pts: 30 },
  { id: 'message', ch: 3, label: 'Send my care team a message myself', cat: 'Talking', how: 'app', pts: 20 },
  { id: 'alone', ch: 3, label: 'Talk with my provider on my own for part of a visit', cat: 'Talking', how: 'clinic', pts: 20 },
  { id: 'calendar', ch: 3, label: 'Keep my own calendar for school, practice and clinic', cat: 'Planning', how: 'parent', pts: 20 },
  { id: 'appt', ch: 4, label: 'Book or confirm my own clinic visit', cat: 'Planning', how: 'clinic', pts: 30 },
  { id: 'insurance', ch: 4, label: 'Know my insurance card and my pharmacy', cat: 'Everyday', how: 'parent', pts: 20 },
  { id: 'explain', ch: 4, label: 'Explain my transplant and medicines in my own words', cat: 'Talking', how: 'clinic', pts: 30 },
]

/* one challenge per chapter, refreshed monthly (November shown) */
export const CHALLENGES: Record<number, { title: string; blurb: string; goal: number; pts: number; badge: string }> = {
  1: { title: 'Brush & dose', blurb: 'Take your evening dose right after you brush your teeth.', goal: 7, pts: 40, badge: 'Brush & dose' },
  2: { title: 'Set-up pro', blurb: 'Set out your own evening dose before a parent checks it.', goal: 7, pts: 50, badge: 'Set-up pro' },
  3: { title: 'Refill radar', blurb: 'Check your pill count each Sunday and order a refill when 7 days are left.', goal: 4, pts: 60, badge: 'Refill radar' },
  4: { title: 'Own the visit', blurb: 'Write down 3 questions and ask them at your visit.', goal: 3, pts: 60, badge: 'Own the visit' },
}
export const MONTH = 'November'
export const CHAPTER_BONUS = 50
const HOW: Record<How, string> = { app: 'Tend records it', parent: 'A parent says “I saw it”', clinic: 'Your care team confirms at a visit' }
const CAT: Record<Cat, { glyph: 'bag' | 'home' | 'help' | 'list'; tone: string }> = {
  Medicine: { glyph: 'bag', tone: 'var(--sys-green)' },
  Everyday: { glyph: 'home', tone: 'var(--sys-orange)' },
  Talking: { glyph: 'help', tone: 'var(--sys-blue)' },
  Planning: { glyph: 'list', tone: 'var(--sys-indigo)' },
}

const kid = (id: KidId, name: string, age: number, parent: string, chapter: number, done: [string, string][]): Kid => ({
  id, name, age, parent, chapter, asked: false, tokens: 0, ledger: [], badges: [],
  steps: Object.fromEntries(done.map(([s, by]) => [s, { st: 'confirmed' as const, by, day: 1 }])),
  challenge: { days: [], done: false },
})
export const freshTrans = (): Trans => ({
  who: 'maya',
  kids: {
    leo: kid('leo', 'Leo', 8, 'Mom', 1, [['looks', 'Mom']]),
    maya: kid('maya', 'Maya', 15, 'Mom', 2, [['looks', 'Mom'], ['cue', 'Mom'], ['bag', 'Mom'], ['feel', 'Mom'], ['names', 'Clinic'], ['sleepover', 'Mom']]),
  },
})
export const stateOf = (k: Kid, id: string): StepState => k.steps[id] ?? { st: 'todo' }
export const chapterSteps = (n: number) => STEPS.filter((x) => x.ch === n)
export const doneIn = (k: Kid, n: number) => chapterSteps(n).filter((x) => stateOf(k, x.id).st === 'confirmed').length
/* ready to talk about the next chapter: all but one step of the current chapter confirmed (site-configurable) */
export const readyForNext = (k: Kid) => k.chapter < 4 && doneIn(k, k.chapter) >= chapterSteps(k.chapter).length - 1
export const award = (w: Wallet, day: number, amt: number, text: string, src: Entry['src']) => { w.tokens += amt; w.ledger.push({ day, text, amt, src }) }

/* a plant that grows with the chapters: Grow's own illustration, in theme colors */
function Plant({ stage }: { stage: number }) {
  return (
    <svg className="g-plant" viewBox="0 0 64 64" aria-hidden="true">
      <path d="M12 49h40l-5 12H17z" fill="var(--track)" stroke="var(--ink-2)" strokeWidth="1.5" />
      {stage === 1 && <><ellipse cx="32" cy="46" rx="8" ry="5" fill="var(--sys-orange)" /><path d="M32 41c0-4 2-6 5-7" stroke="var(--sys-green)" strokeWidth="2.5" fill="none" strokeLinecap="round" /></>}
      {stage >= 2 && <path d={`M32 50V${stage === 2 ? 38 : stage === 3 ? 26 : 16}`} stroke="var(--ink-2)" strokeWidth="2.5" strokeLinecap="round" />}
      {stage >= 2 && <path d="M32 42c-6-1-9-5-9-9 5 0 9 3 9 9zM32 40c5-1 8-5 8-9-5 0-8 3-8 9z" fill="var(--sys-green)" />}
      {stage >= 3 && <path d="M32 31c-7-1-11-6-11-11 6 0 11 4 11 11zM32 29c6-1 10-6 10-11-6 0-10 4-10 11z" fill="var(--sys-green)" opacity=".85" />}
      {stage >= 4 && <circle cx="32" cy="14" r="11" fill="var(--sys-green)" opacity=".7" />}
    </svg>
  )
}

type Props = {
  trans: Trans; wallet: Wallet; today: number
  onClaim: (id: string) => void; onToday: () => void; onConfirm: (id: string) => void; onConfirmDay: (day: number) => void
  onAsk: () => void; onMessage: () => void
}

export function Grow({ trans, wallet, today, onClaim, onToday, onConfirm, onConfirmDay, onAsk, onMessage }: Props) {
  const [tab, setTab] = useState<'me' | 'parent'>('me')
  const [sheet, setSheet] = useState<{ step?: Step; ch?: number } | null>(null)
  const k = trans.kids[trans.who]
  const ch = CHAPTERS[k.chapter - 1], next = CHAPTERS[k.chapter]
  const steps = chapterSteps(k.chapter), done = doneIn(k, k.chapter)
  const ready = readyForNext(k)
  const c = CHALLENGES[k.chapter]
  const okDays = k.challenge.days.filter((d) => d.ok).length
  const todayClaimed = k.challenge.days.some((d) => d.day === today)
  const pendingSteps = STEPS.filter((x) => stateOf(k, x.id).st === 'claimed')
  const pendingDays = k.challenge.days.filter((d) => !d.ok)
  const toCheck = pendingSteps.length + pendingDays.length
  const earlier = STEPS.filter((x) => x.ch < k.chapter && stateOf(k, x.id).st === 'confirmed').length
  const earned = (src: Entry['src'][]) => wallet.ledger.filter((e) => src.includes(e.src) && e.amt > 0).reduce((a, e) => a + e.amt, 0)
  const teen = k.age >= 13
  const status = (x: Step) => { const st = stateOf(k, x.id); return st.st === 'confirmed' ? 'Done' : st.st === 'claimed' ? `${k.parent} to check` : '' }

  const hero = (
    <section className="grow-hero" aria-label="Current chapter">
      <Plant stage={k.chapter} />
      <div>
        <span className="grow-kicker">Chapter {ch.n} of 4</span>
        <b className="grow-name">{ch.name}</b>
        <small>{ch.line}</small>
        <div className="g-meter" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={done} aria-label="Steps done in this chapter"><span style={{ width: `${(done / steps.length) * 100}%` }} /></div>
        <small>{done} of {steps.length} steps · {k.chapter === 4 ? 'final chapter' : ready ? `ready to talk about ${next.name}` : `${steps.length - 1 - done} more to talk about ${next.name}`}</small>
      </div>
    </section>
  )

  return (
    <div className="calm-page grow">
      <div className="calm-body top">
        <h1 className="large-title">Grow</h1>
        <div className="segpill" role="group" aria-label="View">
          <button className={tab === 'me' ? 'on' : ''} aria-pressed={tab === 'me'} onClick={() => setTab('me')}>{k.name}, {k.age}</button>
          <button className={tab === 'parent' ? 'on' : ''} aria-pressed={tab === 'parent'} onClick={() => setTab('parent')}>{k.parent}{toCheck ? ` · ${toCheck}` : ''}</button>
        </div>
        {hero}

        {tab === 'me' ? (
          <>
            {ready && !k.asked && <button className="cbtn primary" onClick={onAsk}>Ask to talk about {next.name}</button>}
            {ready && k.asked && <p className="foot">Asked. Your team will talk it over with you and {k.parent}.</p>}

            <p className="group-label">{MONTH} challenge</p>
            <div className="go-card grow-chal">
              <div>
                <b className="go-time">{c.title}</b>
                <small>{k.challenge.done ? `Complete! +${c.pts} points and a badge` : `${okDays} of ${c.goal} days · ${k.parent} checks each one`}</small>
                <div className="g-dots" role="img" aria-label={`${okDays} of ${c.goal} days confirmed`}>
                  {Array.from({ length: c.goal }, (_, i) => { const d = k.challenge.days[i]; return <span key={i} className={d ? (d.ok ? 'ok' : 'wait') : ''} /> })}
                </div>
              </div>
              {!k.challenge.done && <button className="go" disabled={todayClaimed} onClick={onToday}>{todayClaimed ? 'Done' : 'Did it'}</button>}
            </div>
            <p className="foot">{c.blurb} Days don’t need to be in a row.{pendingDays.length ? ` ${pendingDays.length} waiting for ${k.parent}.` : ''}</p>

            <p className="group-label">{ch.name} steps</p>
            <div className="group">
              {steps.map((x) => (
                <button key={x.id} className={'row-ios' + (stateOf(k, x.id).st === 'confirmed' ? ' g-done' : '')} onClick={() => setSheet({ step: x })}>
                  <span className="glyph" style={{ background: CAT[x.cat].tone }}><Icon name={stateOf(k, x.id).st === 'confirmed' ? 'check' : CAT[x.cat].glyph} size={15} /></span>
                  <span className="row-title">{x.label}<small>{x.cat} · +{x.pts}</small></span>
                  <span className={'row-detail' + (status(x) ? '' : ' add-hint')}>{status(x) || 'Start'}</span>
                  <span className="chev" aria-hidden="true" />
                </button>
              ))}
            </div>
            {earlier > 0 && <p className="foot">Earlier chapters: {earlier} steps done.</p>}

            <p className="group-label">Your path</p>
            <div className="group">
              {CHAPTERS.map((l) => (
                <button key={l.n} className="row-ios" onClick={() => setSheet({ ch: l.n })}>
                  <span className="glyph g-num" style={{ background: l.n <= k.chapter ? 'var(--sys-green)' : 'var(--track)' }}>{l.n < k.chapter ? <Icon name="check" size={15} /> : l.n}</span>
                  <span className="row-title">{l.name}<small>{l.line}</small></span>
                  <span className="row-detail">{l.n === k.chapter ? 'You’re here' : l.n < k.chapter ? 'Done' : l.n === k.chapter + 1 ? 'Next' : ''}</span>
                  <span className="chev" aria-hidden="true" />
                </button>
              ))}
            </div>
            <p className="foot">Never changes in any chapter: medicines, doses, lab schedule, and your care team’s check-ins. Moving on is decided with {k.parent} and your care team, and going back for support is never a punishment.</p>

            <p className="group-label">Rewards</p>
            <div className="cel-stats grow-stats">
              <div className="st green"><span>Check-ins</span><b>{earned(['checkin'])}</b></div>
              <div className="st blue"><span>Growing</span><b>{earned(['skill', 'level', 'challenge'])}</b></div>
              <div className="st gold"><span>Badges</span><b>{k.badges.length}</b></div>
            </div>
            <div className="group">
              {wallet.ledger.slice(-5).reverse().map((e, i) => (
                <div key={i} className="row-ios"><span className="glyph" style={{ background: 'var(--sys-orange)' }}><Icon name="star" size={15} /></span>
                  <span className="row-title">{e.text}<small>Day {e.day}</small></span><span className="row-detail">{e.amt > 0 ? '+' : ''}{e.amt}</span></div>
              ))}
              {wallet.ledger.length === 0 && <div className="row-ios"><span className="row-title">No points yet<small>Do a step or a challenge day to earn your first.</small></span></div>}
            </div>
            <p className="foot">{wallet.tokens} points total. Same points for every honest check-in, including “Missed” and “Need help.” Points are for showing up and growing, never for perfect doses.{teen ? ' Real-world rewards like gift cards would need program approval.' : ` For kids under 13, ${k.parent} picks the rewards.`}</p>
          </>
        ) : (
          <>
            <p className="group-label">Needs your OK</p>
            <div className="group">
              {pendingSteps.map((x) => (
                <div key={x.id} className="row-ios"><span className="glyph" style={{ background: CAT[x.cat].tone }}><Icon name={CAT[x.cat].glyph} size={15} /></span>
                  <span className="row-title">{x.label}<small>{k.name} says they did it</small></span><button className="grow-ok" onClick={() => onConfirm(x.id)}>I saw it</button></div>
              ))}
              {pendingDays.map((d) => (
                <div key={d.day} className="row-ios"><span className="glyph" style={{ background: 'var(--sys-orange)' }}><Icon name="star" size={15} /></span>
                  <span className="row-title">{c.title}<small>Challenge · day {d.day}</small></span><button className="grow-ok" onClick={() => onConfirmDay(d.day)}>I saw it</button></div>
              ))}
              {!toCheck && <div className="row-ios"><span className="row-title">Nothing to check<small>You’ll see {k.name}’s steps and challenge days here.</small></span></div>}
            </div>
            <p className="group-label">Your role</p>
            <div className="group">
              <div className="row-ios"><span className="glyph" style={{ background: 'var(--sys-blue)' }}><Icon name="user" size={15} /></span><span className="row-title">Now, in {ch.name}<small>{ch.parent}</small></span></div>
              {next && <div className="row-ios"><span className="glyph" style={{ background: 'var(--track)' }}><Icon name="user" size={15} /></span><span className="row-title">In {next.name}<small>{next.parent}</small></span></div>}
            </div>
            <p className="foot">{teen
              ? `You see chapters, steps and challenge days. Never ${k.name}’s check-in answers, daily taps or messages to the team. What parents see in each chapter is set with the care team.`
              : `${k.name} is under 13, so you manage settings and pick rewards. Confirming is a quick “I saw it,” not a test.`}</p>
          </>
        )}
      </div>

      {sheet && (
        <div className="modal-dim" onClick={() => setSheet(null)}>
          <div className="prompt-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={sheet.step ? sheet.step.label : 'Chapter'}>
            <div className="grabber" />
            {sheet.step ? (() => {
              const x = sheet.step, st = stateOf(k, x.id)
              return <>
                <b>{x.label}</b>
                <p>{x.cat} · {HOW[x.how]} · +{x.pts} points</p>
                {st.st === 'confirmed' && <p>Done · confirmed by {st.by}, day {st.day}.</p>}
                {st.st === 'claimed' && <p>Waiting for {k.parent} to check.</p>}
                {st.st === 'todo' && x.how === 'parent' && <button className="cbtn primary" onClick={() => { onClaim(x.id); setSheet(null) }}>I did this</button>}
                {st.st === 'todo' && x.id === 'message' && <button className="cbtn primary" onClick={() => { setSheet(null); onMessage() }}>Message my team</button>}
                {st.st === 'todo' && x.how === 'clinic' && <p>Your care team checks this at your next visit.</p>}
                {st.st === 'todo' && x.how === 'app' && x.id !== 'message' && <p>Tend marks this on its own when it happens.</p>}
                <button className="cbtn ghost" onClick={() => setSheet(null)}>Close</button>
              </>
            })() : (() => {
              const l = CHAPTERS[(sheet.ch ?? 1) - 1]
              return <>
                <b>{l.n}. {l.name}</b>
                <p>{l.line}. {l.typical}; skills decide, not birthdays.</p>
                <div className="group">{l.you.map((y) => <div key={y} className="row-ios"><span className="row-title">{y}</span></div>)}</div>
                <button className="cbtn ghost" onClick={() => setSheet(null)}>Close</button>
              </>
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

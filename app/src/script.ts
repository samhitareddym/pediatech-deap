// The whole demo is a scripted story: each step shows a state and waits for one action.
// Clicking the real button (or pressing →) runs that step's apply() to reach the next state.

export type Role = 'coord' | 'pharm' | 'social' | 'psych'
export type Pane = 'maya' | 'mom' | 'staff' | 'all'

export const ROLES: Record<Role, { label: string; person: string }> = {
  coord: { label: 'Coordinator', person: 'Nurse Kim' },
  pharm: { label: 'Pharmacy · NP', person: 'Dr. Patel' },
  social: { label: 'Social work', person: 'Rosa' },
  psych: { label: 'Psychology', person: 'Dr. Okafor' },
}

// The 14-item Barriers Assessment Tool, in a teen's words, with its owner (builder packet p.5)
export const BAT: { id: number; text: string; owner: Role }[] = [
  { id: 1, text: 'I forget, or forget to bring them', owner: 'coord' },
  { id: 2, text: 'I hate the taste', owner: 'coord' },
  { id: 3, text: 'The pills are hard to swallow', owner: 'coord' },
  { id: 4, text: 'Side effects (like feeling sick)', owner: 'coord' },
  { id: 5, text: "I don't want others to know", owner: 'coord' },
  { id: 6, text: "I don't think I need them", owner: 'coord' },
  { id: 7, text: 'Too many pills, too many times a day', owner: 'pharm' },
  { id: 8, text: "I don't think they work", owner: 'pharm' },
  { id: 9, text: 'The instructions are confusing', owner: 'pharm' },
  { id: 10, text: 'I ran out', owner: 'social' },
  { id: 11, text: 'They cost too much', owner: 'social' },
  { id: 12, text: 'They get in the way of things I do', owner: 'psych' },
  { id: 13, text: "I don't want to take them", owner: 'psych' },
  { id: 14, text: "It's a hassle", owner: 'psych' },
]

export const PLAN_OPTIONS: Record<number, { title: string; options: string[] }> = {
  1: {
    title: 'Forgetting',
    options: ['Right after I brush my teeth · 8pm', 'A nudge at a time I pick', 'Keep them by my phone charger', 'Someone I trust texts me'],
  },
  5: {
    title: 'Keeping it private',
    options: ['A pocket case that looks like mints', 'Take them somewhere private', 'One line to say if friends ask'],
  },
}

export type Card = {
  id: string
  role: Role
  patient: string
  urgent?: boolean
  reason: string
  context: [string, string][]
  note?: string
  action: string
  status: 'open' | 'approved' | 'declined'
}

export type Dose = 'taken' | 'rest' | 'missed' | 'none'

export type S = {
  day: number
  staffTab: Role
  closedAuto: number
  sel: { maya: number[]; mom: number[]; plans: Record<number, string> }
  maya: {
    screen: 'home' | 'bat' | 'plans' | 'checkback' | 'talk' | 'reached'
    notif?: string
    barriers: number[]
    plans: string[]
    plan: 'none' | 'pending' | 'active' | 'working'
    week: Dose[]
    streak: number
    leaves: number
    watered: boolean
  }
  care: {
    who: 'maya' | 'leo'
    screen: 'idle' | 'bat' | 'thanks' | 'status' | 'help' | 'checkback' | 'finding' | 'ready'
    notif?: string
    lang: 'en' | 'es'
  }
  cards: Card[]
  outro?: boolean
}

const TAC = '6.1 · 9.8 · 4.2 · 8.9 ng/mL'

export const s0: S = {
  day: 0,
  staffTab: 'coord',
  closedAuto: 0,
  sel: { maya: [], mom: [], plans: {} },
  maya: { screen: 'home', barriers: [], plans: [], plan: 'none', week: ['taken', 'taken', 'missed', 'taken', 'missed', 'taken', 'none'], streak: 1, leaves: 4, watered: false },
  care: { who: 'maya', screen: 'idle', lang: 'en' },
  cards: [
    {
      id: 'c1', role: 'coord', patient: 'Maya R., 15', reason: 'Tacrolimus is swinging. Barrier check is due.',
      context: [['Last 4 levels', TAC], ['Variability', 'MLVI 2.6 · flag is > 2.0'], ['Last barrier check', '7 months ago'], ['Last visit', '3 months ago']],
      note: 'I drafted the check-in texts for Maya and her mom. Each gets their own link.',
      action: 'Send barrier check to Maya + mom', status: 'open',
    },
    {
      id: 'j1', role: 'social', patient: 'Jordan T., 20', reason: 'Ran out of medicine twice in 60 days.',
      context: [['Refill gaps', '3 days (Sep) · 2 days (Oct)'], ['What changed', 'Turned 19, moved to own insurance'], ['Barrier check', '“I ran out”']],
      note: 'Pharmacy confirms a prior-auth lapse. I filled in the referral form.',
      action: 'Start refill + insurance referral', status: 'open',
    },
  ],
}

export type Step = {
  title: string
  say: string
  focus: Pane
  expects?: string
  cta?: string
  apply?: (s: S) => S
}

const card = (s: S, id: string) => s.cards.find((c) => c.id === id)!

export const steps: Step[] = [
  {
    title: 'A signal, not a phone call',
    say: 'Monday 8am. The coordinator’s agent read the chart overnight: Maya’s drug levels are swinging. It prepped everything. Nurse Kim makes one decision.',
    focus: 'staff', expects: 'approve:c1', cta: 'Approve the barrier check',
    apply: (s) => {
      card(s, 'c1').status = 'approved'
      s.maya.notif = 'Fern has a question for you 🌱'
      s.maya.screen = 'bat'
      s.care.screen = 'bat'
      s.care.notif = 'Quick 1-minute check about Maya'
      return s
    },
  },
  {
    title: 'Maya answers in Fern’s voice',
    say: 'The same 14 validated barriers, in a teen’s words. Nobody else sees her answers. Not even mom.',
    focus: 'maya', expects: 'maya:bat', cta: 'Send Maya’s answers',
    apply: (s) => {
      s.maya.barriers = s.sel.maya.length ? s.sel.maya : [1, 5]
      s.maya.screen = 'plans'
      s.maya.notif = undefined
      return s
    },
  },
  {
    title: 'Mom answers separately',
    say: 'Her own phone, her own link. If they disagree, that tells the team something about the family.',
    focus: 'mom', expects: 'mom:bat', cta: 'Send mom’s answers',
    apply: (s) => {
      s.sel.mom = s.sel.mom.length ? s.sel.mom : [1]
      s.care.screen = 'thanks'
      s.care.notif = undefined
      return s
    },
  },
  {
    title: 'Maya picks her own plan',
    say: 'One plan per barrier, chosen by her from the MAPS action plans. Made with her, not handed to her.',
    focus: 'maya', expects: 'maya:plans', cta: 'Send plans to the team',
    apply: (s) => {
      const self = s.maya.barriers.filter((b) => PLAN_OPTIONS[b])
      s.maya.plans = self.map((b) => s.sel.plans[b] ?? PLAN_OPTIONS[b].options[0])
      s.maya.plan = 'pending'
      s.maya.screen = 'home'
      const teenOnly = s.maya.barriers.filter((b) => !s.sel.mom.includes(b))
      s.cards.unshift({
        id: 'c2', role: 'coord', patient: 'Maya R., 15', reason: `Maya chose ${s.maya.plans.length} plans. Ready for your OK.`,
        context: [
          ['Maya said', s.maya.barriers.map((b) => BAT[b - 1].text).join(' · ')],
          ['Mom said', s.sel.mom.map((b) => BAT[b - 1].text).join(' · ') || '—'],
          ...s.maya.plans.map((p, i) => [`Plan ${i + 1}`, p] as [string, string]),
        ],
        note: teenOnly.length
          ? `Only Maya mentioned “${BAT[teenOnly[0] - 1].text.toLowerCase()}”. I kept it private from mom. Mom will only see that a plan exists.`
          : 'Maya and mom agree.',
        action: 'Approve plans · check back in 2 weeks', status: 'open',
      })
      s.staffTab = 'coord'
      return s
    },
  },
  {
    title: 'Thirty seconds of nurse time',
    say: 'No data entry, no callback to schedule. The agent wrote the chart note and booked the 2-week check-back. Kim just says yes.',
    focus: 'staff', expects: 'approve:c2', cta: 'Approve Maya’s plans',
    apply: (s) => {
      card(s, 'c2').status = 'approved'
      s.maya.plan = 'active'
      s.maya.notif = 'Fern has new goals 🌿'
      s.care.screen = 'status'
      return s
    },
  },
  {
    title: 'Taking meds = caring for Fern',
    say: 'One tap logs the dose. The lock screen never says “medication”. To her friends, it’s a plant game.',
    focus: 'maya', expects: 'maya:water', cta: 'Water Fern',
    apply: (s) => {
      s.maya.notif = undefined
      s.maya.watered = true
      s.maya.week = ['taken', 'taken', 'missed', 'taken', 'missed', 'taken', 'taken']
      s.maya.leaves = 5
      s.maya.streak = 2
      return s
    },
  },
  {
    title: 'Two weeks later',
    say: 'She missed a Saturday sleepover. Fern took a rest day. No broken streak, no guilt. Nudges are already tapering because the habit is forming.',
    focus: 'maya', expects: 'skip', cta: 'Skip ahead 2 weeks',
    apply: (s) => {
      s.day = 14
      s.maya.week = ['taken', 'taken', 'taken', 'taken', 'taken', 'rest', 'taken']
      s.maya.streak = 14
      s.maya.leaves = 9
      s.maya.watered = true
      s.maya.screen = 'checkback'
      s.maya.notif = 'Fern wants to ask you something'
      return s
    },
  },
  {
    title: 'The check-back runs itself',
    say: 'MAPS needs a coordinator call at 2 weeks. Here, Fern asks. “Working” closes the loop with zero staff time.',
    focus: 'maya', expects: 'maya:working', cta: 'Maya taps “Working”',
    apply: (s) => {
      s.maya.notif = undefined
      s.maya.plan = 'working'
      s.maya.screen = 'home'
      s.closedAuto = 2
      return s
    },
  },
  {
    title: 'Nothing for the nurse. That’s the point.',
    say: 'Two loops closed without a phone call. Kim’s list is short because patients who are doing well never show up on it.',
    focus: 'staff', expects: 'skip', cta: 'Skip ahead to week 10',
    apply: (s) => {
      s.day = 70
      s.maya.week = ['taken', 'missed', 'taken', 'missed', 'missed', 'taken', 'none']
      s.maya.streak = 1
      s.maya.leaves = 9
      s.maya.watered = false
      return s
    },
  },
  {
    title: 'Week 10. Something changes.',
    say: 'Maya has been skipping. She opens “Something getting in the way?” Fern doesn’t lecture or counsel. It listens and gets a human.',
    focus: 'maya', expects: 'maya:refuse', cta: 'Maya taps “I don’t want to take them”',
    apply: (s) => {
      s.maya.screen = 'reached'
      s.care.screen = 'help'
      s.staffTab = 'psych'
      s.cards.unshift({
        id: 'c3', role: 'psych', patient: 'Maya R., 15', urgent: true, reason: 'Maya said: “I don’t want to take them.”',
        context: [
          ['History', 'Forgetting → 8pm plan ✓ · Privacy → mint case ✓'],
          ['Last 7 days', '3 of 7 doses (was 13 of 14)'],
          ['Latest level', '3.9 ng/mL · below her range'],
          ['Mom sees', '“Team is checking in”. Not the reason.'],
        ],
        note: 'I did not discuss this with Maya. Refusal goes to a person. I told her someone will reach out within 2 days.',
        action: 'Book a call with Maya within 48 hours', status: 'open',
      })
      return s
    },
  },
  {
    title: 'Hard barriers go to a human, fast',
    say: 'Same day, top of the psychology list, with the whole story. No center psychologist? The routing table sends it to social work instead.',
    focus: 'staff', expects: 'approve:c3', cta: 'Book the call',
    apply: (s) => {
      card(s, 'c3').status = 'approved'
      s.maya.notif = 'Dr. Okafor · Thu 4:00pm 📅'
      s.care = { who: 'leo', screen: 'checkback', lang: 'es', notif: 'Mochi tiene una pregunta 💜' }
      return s
    },
  },
  {
    title: 'Meet Leo, 8, and his mom Ana',
    say: 'For young kids the caregiver is the user. Same loop, a sillier pet, in Spanish. Leo’s taste plan isn’t working, for the second time.',
    focus: 'mom', expects: 'mom:notworking', cta: 'Ana taps “No funciona”',
    apply: (s) => {
      s.care.screen = 'finding'
      s.care.notif = undefined
      s.staffTab = 'pharm'
      s.cards.unshift({
        id: 'c4', role: 'pharm', patient: 'Leo M., 8', reason: 'Taste plan failed twice. Time for a clinical fix.',
        context: [
          ['Barriers (mom)', 'Hates the taste · hard to swallow'],
          ['Tried', 'Popsicle first (2 wk ✗) · applesauce (2 wk ✗)'],
          ['Doses', '9 of 14 this period'],
          ['Family', 'Prefers Spanish'],
        ],
        note: 'Self-help is exhausted. Suggest switching to a flavored liquid. I drafted the pharmacy order and a Spanish how-to.',
        action: 'Order flavored liquid tacrolimus', status: 'open',
      })
      return s
    },
  },
  {
    title: 'The pharmacist approves the fix',
    say: 'Self-help handles the simple barriers. When it runs out, the right owner gets one decision with full context.',
    focus: 'staff', expects: 'approve:c4', cta: 'Approve the order',
    apply: (s) => {
      card(s, 'c4').status = 'approved'
      s.care.screen = 'ready'
      s.care.notif = 'Nuevo sabor listo en la farmacia 🍓'
      return s
    },
  },
  {
    title: 'Ana gets the good news',
    say: 'In her language, with a picture. Mochi is waiting.',
    focus: 'mom', expects: 'skip', cta: 'Wrap up',
    apply: (s) => ({ ...s, outro: true }),
  },
  { title: 'The loop, kept whole', say: '', focus: 'all' },
]

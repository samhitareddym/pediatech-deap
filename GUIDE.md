# Tend: team guide

The doc to plan and build from. Why we chose this direction: [RESEARCH.md](RESEARCH.md). Design decisions: [PLAN.md](PLAN.md). **What the CCHMC papers changed: [FINDINGS.md](FINDINGS.md). Read it first.** Original brief and papers: `context/`.

> **Status: planning phase. No new building.** Features and issues get planned first; graphics and build come last. The current demo has known errors listed in FINDINGS.md (e.g. it shows one dose a day, but tacrolimus is taken twice a day).

## The pitch in one breath

**Tend** keeps Cincinnati Children's MAPS loop (find barriers → agree one plan → check back) running between visits. Families tend a pet: Fern for teens, Mochi for kids. Feeding or watering it logs a dose, and the pet asks the barrier questions and the 2-week check-back. The team gets **one AI agent per role** that does the prep and hands a human a **yes/no card**. *Quiet when it's working:* patients doing well never reach the team's list.

## Run it

```bash
cd app
npm install
npm run dev
```
Open the URL Vite prints. Present with **→ / Space** (next) and **←** (back), or click the button that pulses orange. In Claude Code, the `tend` launch config in `.claude/launch.json` serves it at port 5179.

## What we're optimizing for

**Design, presentation and scripted front-end interactions.** There is no backend, no real SMS, no real AI calls and no login. Everything is a scripted story with sample data, and that's deliberate. Live Claude calls for the agent summaries are a stretch goal only.

## Two prototypes, one app
- **`/` → patient pet app (current focus).** A retro creature-game look with original pixel buddies: choose a buddy, name it, set your morning and evening dose times, then care for it in Sprout Hollow. FEED logs a dose (on time / late / missed = a nap), PLAY is a star-hunt mini game, BOOK holds friends you unlock plus the morning/evening snack log, TALK is the barrier check plus "talk to a real person". Demo controls on the right move the clock.
- **`/#demo` → the earlier 3-pane team story** (Maya / mom / staff inbox). It needs updating per FINDINGS.md.

| Patient app file | What's in it |
|---|---|
| [app/src/pet/sprites.tsx](app/src/pet/sprites.tsx) | Pixel buddy generator + all 7 buddies + Olive the guide. Add a buddy = one entry (colors + a `feature` shape) |
| [app/src/pet/World.tsx](app/src/pet/World.tsx) | The Sprout Hollow tile map (edit the `MAP` strings: T tree, g grass, f flowers, p path, w water, h house) |
| [app/src/pet/PetApp.tsx](app/src/pet/PetApp.tsx) | Flow, dialog box, dose logic (60-minute on-time window), feed/play/book/talk |
| [app/src/pet/pet.css](app/src/pet/pet.css) | The whole patient-app look |

**Originality rule:** creature-game *genre*, our own everything. No names, characters, ball icons or screens copied from any existing game.

## File map (team demo)

| File | What's in it | Edit it when… |
|---|---|---|
| [app/src/script.ts](app/src/script.ts) | **The story.** Sample data, the 14 BAT barriers + owners, plan options, every step's caption, and what each step changes | You change wording, add or reorder steps, or change a card's content |
| [app/src/App.tsx](app/src/App.tsx) | Screens: Maya's phone, caregiver phone (Lisa / Ana), staff inbox, caption bar, outro | You change a layout or add a screen |
| [app/src/Pets.tsx](app/src/Pets.tsx) | Fern (plant) and Mochi (blob) as SVG with moods: `happy`, `thirsty`, `proud`, `asking` | You change the pets |
| [app/src/index.css](app/src/index.css) | All styling. Tokens at the top in `:root` | You change the look |

## How the script engine works (2 minutes)

- `steps[]` in `script.ts`. Each step has `title` + `say` (the caption), `focus` (which pane stays bright), `expects` (the action that advances it), `cta` (the button label) and `apply(state) → nextState`.
- A button in the UI calls `act('maya:bat')`. If the current step `expects` that id, the story advances. Its CSS gets the `cue` class (an orange pulse) via `cue('maya:bat')`.
- `patch()` makes free, unscripted changes that don't advance the story: chip toggles, tab switches, dismissing banners, approving Jordan's card.
- History is a stack, so ← always undoes cleanly.

**To add a step:** insert an object in `steps[]` → give it an `expects` id → wire a button with `onClick={() => act('that-id')}` and `className={'…' + cue('that-id')}`.

## The demo story (current)

| # | Pane | Beat | Packet must-keep it proves |
|---|---|---|---|
| 1 | Team | A drug-level swing → the coordinator agent card → approve the barrier check | 6 risk signals |
| 2 | Maya | 14 barriers in Fern's voice, private from mom | 1 structured ask |
| 3 | Mom | Answers separately on her own phone | 2 separate voices |
| 4 | Maya | Picks one plan per barrier | 4 plan made *with* her |
| 5 | Team | Nurse approves; the agent notes the teen/mom disagreement | 3 named owner |
| 6 | Maya | Water Fern = dose logged; lock screen never says "medication" | discreet (barrier 5) |
| 7 | Maya | +2 weeks, a missed day = ❄ rest day, no penalty | no shaming streaks |
| 8 | Maya | Fern's 2-week check-back → "Working" | 5 close the loop |
| 9 | Team | Empty list, "2 plans closed by patients" | staff time |
| 10 | Maya | Week 10, "I don't want to take them" | hard barrier |
| 11 | Team | Urgent psych card with full history → book a call | human in the loop |
| 12 | Ana | Leo (8), Mochi, Spanish, taste plan "No funciona" | caregiver as user, language |
| 13 | Team | Pharmacist card → flavored liquid | right owner |
| 14 | Ana | Good news in Spanish | access |
| — | Outro | Six must-keeps + stats | |

## Design system

- **Type:** Fraunces (headings, pet voice, warm) + DM Sans (UI).
- **Palette:** warm paper `#f3eee5`, forest `#2f4a3a` (brand / Fern), apricot `#ef8a4c` (cues, accents), lilac `#c9b6f2` (Mochi).
- **Role colors**, used on cards, tabs and badges: coordinator blue, pharmacy purple, social work amber, psychology rose.
- **Tone:** 5th-grade reading level, never "medication" in a notification, never blame. "You're not in trouble." Missed days are "rest days".

### Guardrails (from the brief; don't break these)
1. The pet never gets sick or dies from missed doses.
2. Agents never counsel. Refusal, mood and cost always become a human card.
3. Nothing clinical reaches a patient without a human ✅.
4. The parent sees *plan status*, not the teen's answers or daily taps.
5. Staff see 5 or fewer cards a day; patients doing fine stay hidden.

## Grow: transition readiness journey and rewards (General app)

New **Grow** tab in the General app (Today · Routine · Grow · Account). Built with the General app's own pieces: grouped rows, segmented control, bottom sheets, Bright-theme tiles and stat boxes. Files: [app/src/room/grow.tsx](app/src/room/grow.tsx) (data + screen), [app/src/room/grow.css](app/src/room/grow.css). Wiring in `RoomApp.tsx`: `trans`, `ledger`, `confirmStep`, `confirmDay`, and a "Grow" section in the presenter panel.

**Why:** clinicians asked us to look into transition readiness: independence should follow skills, not age, and medicine habits start forming early. Builder packet p.4 lists "shifting responsibility from parent to teen over several years" as open to redesign; p.6 looks for "responsibility can shift over time."

**Four chapters that grow like a plant:**

| Chapter | Theme | Typical ages* | What changes |
|---|---|---|---|
| 1 Seed | Learn the routine | 7–10 | Parent gives doses and gets every reminder; child helps and learns |
| 2 Sprout | Do it, with backup | 10–14 | Child takes doses with a parent checking; answers own check-ins |
| 3 Sapling | You lead, parent backs up | 14–17 | Child gets reminders first, handles refills; parent gets a weekly "on track" summary |
| 4 Tree | Ready for adult care | 17–21 | Young adult chooses what the parent sees and books visits |

\*Typical only. Skills decide, not birthdays. **Never changes in any chapter:** medicines, doses, lab schedule, care-team check-ins.

**17 steps mix medicine and everyday life**, tagged Medicine / Everyday / Talking / Planning and built on the four TRAQ areas (Transition Readiness Assessment Questionnaire; Wood et al. 2014). Examples: *take my dose right after brushing my teeth*, *pack my school bag the night before*, *pack my medicines for a sleepover*, *order a refill*, *keep my own calendar*, *explain my transplant in my own words*. Tap a step to open a sheet. Steps are confirmed by Tend (automatic for Maya: routine set up, 3 check-in days, a message to the team), a parent ("I saw it") or the clinic at a visit. This is our own list built on the TRAQ areas, not the TRAQ itself.

**Monthly challenge per chapter** (November shown): Seed "Brush & dose" (7 days), Sprout "Set-up pro" (7), Sapling "Refill radar" (4 Sundays), Tree "Own the visit" (3 questions). The child taps **Did it**; the parent taps **I saw it**. Days don't need to be in a row. Finishing gives points and a badge.

**Moving chapters:** when all but one step is done, the child can ask to talk about the next chapter; the **care team approves** it (never automatic). +50 points. Going back for support is never a punishment.

**Parent tab** (segmented control in Grow): a "Needs your OK" list with **I saw it** buttons, plus the parent's role now and in the next chapter. Teens: the parent never sees check-in answers, taps or messages. Under 13: the parent manages settings and picks rewards.

**Rewards:** every point goes into a ledger shown as stat boxes (Check-ins / Growing / Badges, same style as the "Dose logged!" celebration) and a recent list. Points reward showing up and growing, never perfect doses.

**Demo profiles:** presenter → Grow → **Leo, 8** (Seed, Mom) or **Maya, 15** (Sprout, Mom). Maya is the app user; Leo is a demo profile with his own points.

**Demo script (about 90 seconds):**
1. Skip setup → presenter **Leo, 8** → **Did it** → tap two Seed steps → **I did this** → switch to **Mom** to show "Needs your OK" → presenter **Mom confirms**.
2. Presenter **Fill challenge** → **Next day** → Grow → **Did it** → **Mom** → **I saw it** → "Brush & dose complete" and "Ask to talk about Sprout".
3. Presenter **Maya, 15** → *Set out my own doses* → **I did this** → **Mom confirms** → **+3 days** → Grow → **Ask to talk about Sapling** → **Team approves** → Chapter 3.

## Schedule setup after the visit (teen app and parent portal)

Files: [app/src/room/schedule.tsx](app/src/room/schedule.tsx) (shared engine + setup flow) + `schedule.css`. Used by Maya's General app (Today and Routine) and by the parent portal. Calendar and pharmacy connections are **simulated**; every medicine and event is synthetic. Not affiliated with any of the listed pharmacies; we'd pitch it as "ready to partner".

**Where it lives:** after the barrier checklist with the clinician, the home screen (Today) shows **Visit checklist done → Set up schedule**, and a notification says "Next step: set up your medicine schedule." It is also on the Routine tab (Schedule section). Thomas's routine-cue prompt now waits until the schedule is set.

**Flow (no typing):**
1. **Calendar:** Google, Apple or Outlook. Tend reads busy/away times only and never writes medicine names to the calendar. Skip = use the care team's times.
2. **Pharmacy:** pick **Walgreens, CVS, Cincinnati Children's Pharmacy, Kroger Pharmacy, or Other**. Other = type the pharmacy name + ZIP, pick the location from (sample) results. Every choice opens a handoff sheet: you sign in on the pharmacy's own website and approve sharing the medicine list, label instructions and refill dates. Tend never sees the password, and no credential fields exist in the app. Simulated in the demo. "Use the care team's list" skips it.
3. **Review:** medicines + the family's week (school, work, practice, sleepovers, weekends away). "Something looks wrong" goes to the care team.
4. **Suggested schedule:** morning dose = 30 min before the earliest weekday departure (Maya: school 7:45 → **7:15 AM**; Leo: Ana leaves for work 7:30 → **7:00 AM**), always inside the care team's window (±1 hour of 8 AM). Evening follows 12 hours later. −30/+30 nudges; outside the window → "ask your care team." A 7-day view tags each day **Pack evening / Pack next morning / Nurse midday / Home** (text labels, not color alone).
5. **Accept** (with morning pack reminders on or off).

**Away-day reminders:** each morning when an event overlaps a dose, Tend notifies with the event and the exact medicines, and Today shows an **Away today** card listing them per dose with a **Packed** button. School midday doses count as the school nurse, and a parent's work isn't a reason to pack. New calendar events are checked when they appear.

**Demo (Maya, presenter "Schedule" section):** After the visit → tap the notification → Google → Walgreens → Suggest (7:15 / 7:15) → Use this schedule. It's Friday, so the reminder fires right away: *Sleepover at Jess's, pack evening 7:15 PM + tomorrow morning 7:15 AM medicines* (lists names). **Add event** (Band trip, Wed 4–9:30 PM) → "overlaps your 7:15 PM medicines; Wednesday morning Tend will list what to pack." **Next busy morning** steps through Sun (Grandma's), Tue/Thu (soccer), Wed (band trip).

## Parent portal (`#parent`): setup for younger kids

File: [app/src/room/ParentPortal.tsx](app/src/room/ParentPortal.tsx), same engine. Ana (Leo, 8) sees "Visit checklist done → Set up Leo's schedule", connects a calendar (her work M–F 7:30, Leo's school, Wed swim, a weekend at Grandpa's) and Walgreens (9 synthetic medicines, including a midday dose). Suggested: **7:00 AM · 1:00 PM · 7:00 PM**; the 1 PM dose on school days shows **Nurse midday**.

**Home:** away card ("Leo is away today": Weekend at Grandpa's lists midday, evening, next morning and next midday medicines), dose cards with **Given** / **Nurse gave**, the 7-day view, Walgreens sync, calendar + pack-reminder toggle, refill-soon alerts, Adjust times. Presenter: **After the visit**, **Next busy morning**, **Next day**, **Add event** (birthday party Tue, overlaps 7 PM), **Pharmacy update** (one-tap Add to schedule), Theme.

## Judge questions → our answer (rehearse these)

1. **Busy Tuesday?** A short list of yes/no cards, prepped with context. Self-closing plans never appear.
2. **"I refuse"?** Same day, top of psychology's list, full history. Fern only says someone will reach out.
3. **Parent vs teen?** Parent: "has a plan / on track / team is checking in". Teen keeps answers and taps. The handoff slider moves ownership over the years.
4. **Month 6?** It gets quieter as things go well; nudges taper. It wakes up when something changes.
5. **No psychologist?** Routing is one table (`BAT[].owner`). Swap psych → social work or an external referral.

## Backlog (pick one, put your name on it)

**Polish (high value for the demo)**
- [ ] Maya's checklist: the Send button is below the fold. Make the button sticky or the chips more compact
- [ ] Make the mini Fern beside question bubbles bigger and more expressive
- [ ] Make Edit / Reassign on staff cards do something (a small inline editor or role picker)
- [ ] Animate the water/feed tap (a droplet, a leaf pops)
- [ ] Mom's phone: a Spanish version of the barrier check (we show the language pattern only for Leo)
- [ ] Check layout at the projector resolution we'll actually present on

**Story**
- [ ] Jordan (20, college, insurance lapse) as a third mini-story: the transition to adult care
- [ ] Show the "teen/parent disagreement" moment more visually
- [ ] Show nudge tapering (a settings sheet: daily → only if late → off)

**Pitch**
- [ ] 3-minute talk track that matches the 14 steps
- [ ] Metrics slide: barriers resolved, check-backs closed in 14 days, staff minutes/patient, tacrolimus variability
- [ ] Stretch: a live Claude call writes the agent note on a card

## Open questions for the team
- Name: keep **Tend**?
- Who owns which pane (phones / staff inbox / pitch)?
- Present from one laptop at what resolution?

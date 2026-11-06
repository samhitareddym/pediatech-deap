# Tend: team guide

The doc to plan and build from. Why we chose this direction: [RESEARCH.md](RESEARCH.md). Design decisions: [PLAN.md](PLAN.md). Original brief: `context/`.

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

## File map

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

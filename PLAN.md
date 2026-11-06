# Plan: pet companion + staff agents

Two halves, one loop:
- **Family side:** a Tamagotchi-style pet you tap in to care for. Taking your pills = caring for it. Duolingo-style nudges bring you back.
- **Team side:** each staff role gets an AI agent that watches its patients, prepares the context, and hands the human a **yes/no decision card**. Staff approve; agents never counsel.

Background in [RESEARCH.md](RESEARCH.md). The packet's six must-keep functions are mapped at the bottom.

---

## 1. Family side: the pet

### The core tap
Open the app → the pet is there → **"Feed [pet]"** = I took my dose. That one tap is the dose log. The pet reacts, and that's the reward.

### Guardrails from the packet (non-negotiable)
| Risk | Rule |
|---|---|
| "Streaks that punish a missed day" are explicitly weak | **The pet never gets sick, sad or dies from missed doses.** A missed dose = the pet is *sleepy / waiting for you*, never hurt. Coming back is always celebrated. |
| Duolingo's guilt-trip notifications | Borrow the **streak freeze** (forgiveness) and the **timing** (nudge around when you usually tap), not the guilt |
| Feeling childish at 15 | Age-skinned: a cute creature for Leo (8); for Maya (15), something closer to a cozy room or plant/aesthetic companion she can style |
| "I don't want others to know" (barrier 5) | **This is a feature:** it looks like a pet game on her lock screen, not a medical app. Notifications never say "medication". |
| Reminders block habits (research) | Nudges **taper** as the habit forms (daily → only if late → off) |
| Fatigue | At most one nudge per dose window. Silence for 3+ days goes to the team, not more pings. |

### Where the MAPS loop lives inside the pet
- **Barrier check (BAT):** the pet "asks" in its voice: *"What's making it hard lately?"* The same 14 items at a 5th-grade level. The teen and the caregiver each answer on their own device.
- **Plan:** the teen picks one self-help plan, and it becomes a **pet goal** ("Feed Mochi after brushing teeth, 8pm").
- **2-week check-back:** the pet asks, *"Is the 8pm plan working? ✅ / 🔧 / ❌"*
- **"Talk to someone" button** is always visible, and it goes straight to a human.

### Caregiver view
- Leo (8): Mom is the main user and feeds the pet with him.
- Maya (15): Mom sees **"plan on track ✓ / needs help"** only. She doesn't see Maya's answers or each dose.
- Ownership slider: parent → shared → teen, moved by the team or by age defaults.

---

## 2. Team side: role agents + yes/no cards

### Agents (one per role, owned by the routing table from the packet)
| Agent | Watches | Example card |
|---|---|---|
| **Coordinator agent** | Barriers 1-6, check-backs, silence, tacrolimus swings | "Maya: forgetting. She chose an 8pm routine plan. **Approve plan?** ✅ / ✏️ / ❌" |
| **Pharmacist / NP agent** | 7-9 (too many pills, doesn't work, confusing instructions), side effects | "Leo: taste + swallowing for 3 weeks, plan failed twice. **Request liquid formulation?** ✅ / ❌" |
| **Social worker agent** | 10-11 (ran out, can't afford) | "Jordan ran out twice in 2 months; insurance changed at 19. **Start refill/insurance referral?** ✅ / ❌" |
| **Psychologist agent** | 12-14 (refusal, gets in the way, inconvenient) | "Maya tapped 'I refuse'. History: forgetting → embarrassment → now refusal. **Schedule call within 48 hours?** ✅ / reassign" |

### Every card has the same shape
1. **One-line reason** (why now)
2. **Context:** barrier history, what's been tried, dose-tap trend, tacrolimus trend, teen vs parent disagreement
3. **One proposed action** → ✅ approve / ❌ decline / ✏️ edit / ↪ reassign
4. Approve → the agent carries it out (sends the plan to the pet, books the task, writes the chart note draft)

### Hard rules for agents
- **The agent never talks to the patient about a hard barrier.** Refusal, mood and cost always become a human task. The patient sees "someone from your team will reach out".
- Nothing clinical reaches the patient without a human ✅.
- A card not acted on in 48 hours → escalates to the coordinator.
- Each role sees a **short queue (5 or fewer a day)**. All-✅ patients never show up. That is the time saving.
- No psychologist at a center → the routing table swaps psych cards to the social worker or an external referral.

---

## 3. The demo script (also the build order)

One page: **[Maya's phone] [Mom's phone] [Staff inbox with role tabs]** + a **⏩ skip ahead** clock.

1. Tacrolimus swing → the coordinator agent card: "Send barrier check to Maya and mom?" ✅
2. Maya's pet asks; Maya picks forgetting + embarrassment. Mom picks forgetting only → the card shows the disagreement.
3. Maya picks the 8pm plan → the coordinator card "Approve plan?" ✅ → it becomes a pet goal.
4. Mom's screen: "Maya has a plan ✓".
5. ⏩ Maya taps "feed" for a few days; the pet grows. She misses one day → streak freeze, no penalty.
6. ⏩ 2 weeks: "Plan working?" ✅ → the loop closes, and no staff card is shown.
7. Branch: Maya taps **"I refuse"** → the psychologist card appears with full history → ✅ "schedule call".
8. Leo's family (a second patient, already set up): a taste/swallow plan fails twice → the pharmacist card ✅ liquid formulation.

## 4. Must-keep coverage
| Packet must-keep | Where |
|---|---|
| 1 Structured barrier ask | The pet asks the BAT at setup, every 6 months, or on a trigger |
| 2 Patient + caregiver separately | Separate devices, and the disagreement goes on the card |
| 3 Named owner | One agent per role, fed by the routing table; the human owns the decision |
| 4 One plan per barrier, made with the patient | The teen picks it, staff approve it, and it becomes a pet goal |
| 5 Close the loop | The pet's 2-week check-back; ✅ closes it automatically, ❌ makes a card |
| 6 Chart risk signals | Sample tacrolimus/visit/lab data triggers coordinator cards |

## 5. Build decisions (my defaults)
- **Stack:** Vite + React + TypeScript, sample data, demo clock, no login, no real SMS/EHR.
- **Agents for the demo:** the routing and triggers are plain rules (reliable on stage). Card summaries are pre-written in the sample data. A **live Claude call for the summary** is a stretch goal.
- **Pet art:** simple CSS/SVG creature with 3-4 moods. No art pipeline.
- **Languages:** English, plus a Spanish toggle on the BAT.

## Metrics slide
Barriers resolved · check-backs closed within 14 days (and the % closed with zero staff time) · cards per staff member per day · dose-tap consistency · tacrolimus variability (sample)

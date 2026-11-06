# RenewU user stories: developer handoff

**Working name:** RenewU (patient and family app), built on the KTx-CONNECT / DEAP clinical loop.
**Companion docs:** [feature-priorities-and-connected-apps.md](feature-priorities-and-connected-apps.md) (feature IDs `F##`, channel tiers), the builder packet PDF (clinical rules).

The product in one line: a barrier is reported, a named person owns it, a plan is agreed, and a short check-in arrives through whatever app the family already uses. Routine "it's working" answers are logged automatically. Problems reach a human with the plan attached.

## How to read this

- **ID:** `US-##`. Stories are grouped into epics in build order.
- **Links:** feature IDs from the feature list and channel names from the connected-apps ranking.
- **Priority:** the feature's computed priority (P0 / P1 / P2). Channel stories use the channel tier (**Now / Next / Later**).
- **Demo:** ✅ works in `demo/connected-apps.html` · ◐ partly · — not built yet.
- **Acceptance criteria** are written as testable checks. **Guardrails** are rules that must not be broken, even if a story seems to ask for it.

> **Note for the team:** the connected-apps idea came after the feature list was scored. The channel picker (F17, F37) was scored P2 before that change. The team treats it as core now, so those stories are marked **P0 (pivot)** here. Re-score F17 and F37 in the spreadsheet if you agree.

## People

| Persona | Who they are | What they need from the app |
|---|---|---|
| **Maya, 15** | Patient, transplant at age 9, high school | Discreet, quick, never feels like parental surveillance |
| **Jordan, 20** | Patient in college, moving to adult care | Refill and schedule help; taking over from Mom |
| **Leo's mom** | Caregiver for Leo, 8; English as a second language | She is the user; low literacy; Spanish/Arabic matter |
| **Riley Chen, RN** | Transplant coordinator, owns most plans | A short list she trusts, not more alerts |
| **Dana Ortiz, LISW** | Social worker | Referrals that arrive with the "why" |
| **Psychologist** | Receives refusal and motivation referrals | Context and history; may not exist at every site |
| **Site admin** | Configures routing and staff | Map barriers to named staff at their center |

All names are fictional. All data in development and demos must be synthetic.

---

## Epic 1: Barrier check-in

### US-01: Answer the 14-question checklist on my own
**As** Maya, **I want** to answer the barrier checklist by myself on my phone **so that** I can be honest about what gets in the way.
- **Links:** F01, F02 · **Priority:** P0 · **Screen:** Check-in · **Channels:** app, MyChart (Now) · **Demo:** —
- **Acceptance criteria**
  - Shows all 14 items using the exact wording in `data/barriers.json` (builder packet p.5).
  - Each item needs an explicit Yes or No. Submit stays disabled until all 14 are answered, and a counter shows "11 of 14 answered."
  - All-No is a valid submission.
  - Unanswered items are never saved as No.
  - After submit: "Thanks for telling us. Your team will review this." plus who owns each Yes.
- **Guardrails:** don't rewrite the questions or interpret free text with AI. Reading level about 5th grade.

### US-02: Caregiver answers separately
**As** Leo's mom, **I want** to answer my own checklist **so that** the team hears my view as well as my child's.
- **Links:** F02, F12 · **Priority:** P0 · **Screen:** Check-in (caregiver) · **Demo:** ◐ (caregiver view exists, checklist not built)
- **Acceptance criteria**
  - Patient under 10: only the caregiver checklist is offered.
  - Patient 10 or older: patient and caregiver each get their own checklist, saved as separate records with `respondent` = patient or caregiver.
  - The caregiver sees only their own answers and a confirmation, never the teen's answers.
- **Guardrails:** never merge or average two reports. Final family-sharing rules are a clinical decision; label the current behavior "demo policy."

### US-03: Report a new barrier anytime
**As** Jordan, **I want** to report a new problem between visits **so that** I don't have to wait six months.
- **Links:** F10, F01 · **Priority:** P0 · **Screen:** My plan · **Demo:** —
- **Acceptance criteria**
  - "Something new is getting in the way" is always visible on My plan.
  - It opens the 14-item list (not free text) and creates new open barriers with owners.

### US-04: Supportive language everywhere
**As** any patient or caregiver, **I want** the app to talk to me without blame **so that** I feel safe being honest.
- **Links:** F15, F29 (cut), F40 (cut) · **Priority:** P1 · **Demo:** ✅
- **Acceptance criteria**
  - Use approved phrases such as "Thanks for telling us" and "Let's find something that works for you."
  - No streak resets, countdowns, scary rejection warnings, or sad mascots anywhere.
  - Missing answers are shown neutrally ("Not answered yet").

### US-05: Plain language and approved translations
**As** Leo's mom, **I want** to choose Spanish **so that** I understand every question.
- **Links:** F18 · **Priority:** P1 · **Demo:** ◐ (language picker with "pending approval" note)
- **Acceptance criteria**
  - Language picker: English, Español, العربية.
  - If no approved clinical translation exists, show English plus a note: "We'll switch once approved wording is ready."
- **Guardrails:** no machine translation of clinical content.

---

## Epic 2: Routing and ownership

### US-06: Every "Yes" gets a named owner
**As** Riley, **I want** each reported barrier routed to the right role and a named person **so that** nothing falls through.
- **Links:** F04 · **Priority:** P0 · **Screen:** Worklist · **Demo:** ✅ (seeded data)
- **Acceptance criteria**
  - Routing follows the default 14-item map exactly. Example: forgetting → transplant coordinator; ran out or can't afford → social worker; refuse → psychologist.
  - Each open barrier stores `ownerRole` and `ownerId` (a named staff member) or an explicit unassigned status.
  - The owner's name is shown to the patient on My plan.
- **Data:** see the "Open barrier" entity in `docs/architecture.md`.

### US-07: Visible gap when a role is missing
**As** Riley at a center with no psychologist, **I want** unroutable barriers to stay visible **so that** I can decide who handles them.
- **Links:** F14 · **Priority:** P1 · **Demo:** ✅ ("Unassigned · coordinator review")
- **Acceptance criteria**
  - If no staff member exists for the role, the status is "Unassigned · coordinator review," and the item is counted in the worklist's Unassigned tile.
- **Guardrails:** never auto-substitute an unapproved clinical role.

### US-08: Refusal goes to a person fast
**As** Maya, **when** I say "I refuse to take them," **I want** a real person to follow up **so that** I'm heard, not lectured.
- **Links:** F13, F28 (cut) · **Priority:** P0 · **Demo:** ◐ (seeded row)
- **Acceptance criteria**
  - Routed to psychology (or unassigned review, per US-07), with the patient's report and history attached.
  - The patient sees a supportive message and who will reach out. No automated counseling.
- **Guardrails:** no chatbot motivational interviewing. Don't invent urgency rules.

### US-09: Site admin maps roles to staff
**As** a site admin, **I want** to assign named staff to each owner role **so that** routing works at my center.
- **Links:** F04, F14 · **Priority:** P1 · **Demo:** —
- **Acceptance criteria:** edit the role → staff list; the 14-item map is editable per site but shows the CCHMC default and who changed it.

---

## Epic 3: Agreed plan

### US-10: Record one agreed plan per barrier
**As** Riley, **after** talking with Maya, **I want** to save one concrete plan **so that** we both know what we're trying.
- **Links:** F05 · **Priority:** P0 · **Screen:** Review and plan · **Demo:** ◐ (plan shown; full form not built)
- **Acceptance criteria**
  - Required fields: who, what, how, where, when, the owner (a named person), and who agreed.
  - The first check-in date is set automatically and is at most 14 days after agreement.
  - Only one active plan per barrier; the other barriers stay open and visibly owned.
- **Guardrails:** a human records the agreement after a conversation. The app never picks the solution.

### US-11: Plan B for away days
**As** Maya, **I want** a different version of my plan for sleepovers and weekends **so that** a change in routine doesn't break it.
- **Links:** F30 · **Priority:** P1 · **Demo:** ◐ (Riley records "plan B for away nights")
- **Acceptance criteria**
  - The plan can hold an optional "away days" variant (days and time), agreed with the owner.
  - Check-in wording on those days references the plan B.
- **Guardrails:** never changes prescribed dose times on its own.

### US-12: Commit to my plan
**As** Maya, **I want** to tap "I'll try this until Nov 20" **so that** I feel ownership of the plan.
- **Links:** F33 · **Priority:** P2 · **Demo:** —
- **Acceptance criteria:** optional confirmation stored on the plan; no points, stakes or penalties.

---

## Epic 4: Follow-up loop

### US-13: Short check-in about my current plan
**As** Maya, **I want** to answer one quick question about my plan **so that** I don't retake the whole checklist.
- **Links:** F06 · **Priority:** P0 · **Channels:** all Now-tier channels · **Demo:** ✅
- **Acceptance criteria**
  - The question references the current plan ("How is your reminder plan going?").
  - Three answers: Working, Not working, Need help.
  - "Not working" asks one follow-up with fixed options (e.g., A away from home, B forgot, C something else).
  - The response stores `outcome`, `reason`, `sourceChannel`, `submittedAt`, `respondent`.

### US-14: "Working" is logged without a staff task
**As** Riley, **I want** routine good news logged automatically **so that** I only spend time where I'm needed.
- **Links:** F07 · **Priority:** P0 · **Demo:** ✅ ("'Working' replies logged, no task" tile)
- **Acceptance criteria**
  - A "Working" response creates no task. It adds a history entry ("auto-acknowledged") and sends a thank-you with the next check-in date.
  - The owner and future check-ins stay in place.
- **Guardrails:** label it as **patient-reported**. Never mark the barrier as resolved or the adherence as verified.

### US-15: Problems go to the owner with the plan attached
**As** Riley, **I want** "Not working" and "Need help" to arrive with the current plan, reporter, date, reason and channel **so that** I can act without re-asking.
- **Links:** F08 · **Priority:** P0 · **Demo:** ✅
- **Acceptance criteria**
  - A task is created for the plan's owner, with status "Needs review" or "Help requested" and a due date.
  - The task detail shows the who/what/how/where/when plan, the answer, its source channel and the full history.
  - The owner records the next step and the next check-in date. That closes the task, not the barrier.

### US-16: Continued check-ins and six-month reassessment
**As** Riley, **I want** check-ins to continue after the first one **so that** we know whether the fix holds.
- **Links:** F10 · **Priority:** P0 · **Demo:** ◐
- **Acceptance criteria**
  - The owner sets each next check-in date (no invented cadence).
  - My plan shows the next check-in and a sample six-month checklist date.

### US-17: Progress that never resets
**As** Maya, **I want** to see how many check-ins I've done this month **so that** a missed day doesn't erase my progress.
- **Links:** F31, F36, F39 (cut) · **Priority:** P1 · **Demo:** —
- **Acceptance criteria**
  - A count of check-ins that never resets to zero, plus a plan journey path: agreed → week 1 → 2-week check → keep going → 6-month check.
  - Counts check-ins, never doses.

### US-18: No reply is visible, not silent
**As** Riley, **I want** to see when a check-in got no answer **so that** silence doesn't hide a problem.
- **Links:** gap from research review · **Priority:** P1 (proposed) · **Demo:** —
- **Acceptance criteria:** after a site-configured number of days, show a "No response" status on the worklist.
- **Guardrails:** the number of days is a clinical decision. Leave it configurable; don't hard-code a threshold.

---

## Epic 5: Care-team worklist and review

### US-19: One list, any channel
**As** Riley, **I want** every update in one list, whatever app it came from **so that** I don't watch five inboxes.
- **Links:** F09 · **Priority:** P0 · **Screen:** Worklist (desktop) · **Demo:** ✅
- **Acceptance criteria**
  - Summary tiles: needs a person, unassigned, open or active plans, "working" replies logged with no task.
  - Rows show patient, barrier, owner, "came in via" channel, a text status chip (never color alone) and the due date.
  - The order is operational (overdue, help, needs review, new). Show the note "Not a clinical risk score."
  - Keyboard navigable; rows open a detail panel.

### US-20: See where patient and caregiver disagree
**As** Riley, **I want** to see where Maya's and her mom's answers differ **so that** I can open that conversation.
- **Links:** F03 · **Priority:** P0 · **Screen:** Review and plan · **Demo:** —
- **Acceptance criteria:** two side-by-side report columns with differences marked in text ("Maya: Yes · Caregiver: No"). Shown to staff only.

### US-21: Chart flags shown as they are
**As** Riley, **I want** to see existing chart signals next to the reports **so that** I have context.
- **Links:** F11 · **Priority:** P0 · **Demo:** —
- **Acceptance criteria:** list the flags (e.g., "No clinic visit > 4 months") with source and date, labeled "Synthetic chart fixture."
- **Guardrails:** no composite risk score and no calculated tacrolimus thresholds.

### US-22: Channel preferences are visible to staff
**As** Riley, **I want** to see how each family prefers to be reached **so that** I follow up the way they'll actually see it.
- **Links:** F17 · **Priority:** P0 (pivot) · **Demo:** ✅ ("Prefers: Text + calendar · medicine name hidden")

### US-23: Outcome numbers for a pilot
**As** the program lead, **I want** follow-ups completed vs. due and plans reported working, split by patient and caregiver, **so that** we can show whether the loop works.
- **Links:** F22 · **Priority:** P1 · **Demo:** —
- **Guardrails:** don't claim clinical outcomes from the prototype.

### US-24: One-tap encouragement
**As** Riley, **I want** to send a one-tap "high five" when a patient hits a milestone **so that** I stay connected without a phone call.
- **Links:** F34 · **Priority:** P2 · **Demo:** —

---

## Epic 6: Connected channels (connected-apps pivot)

### US-25: Choose how I'm reached
**As** Maya, **I want** to choose any mix of text, calendar, phone reminders, email and MyChart **so that** check-ins show up where I already look.
- **Links:** F17, F37 · **Priority:** P0 (pivot) · **Channels:** Now tier · **Demo:** ✅
- **Acceptance criteria**
  - Now-tier channels are shown first; Next/Later channels sit under "More options" with a phase label (Pilot, Later, Needs compliance review).
  - At least one channel is required to save.
  - Saved preferences appear on the staff detail panel (US-22).
  - Reminder time options stay within what the care team agreed.
- **Data:** `ChannelPreference { personId, channels[], showMedicineName, homeReminder, reminderTime, language }`

### US-26: Medicine name hidden by default
**As** Maya, **I want** reminders to just say "check-in" **so that** friends can't tell what it's for.
- **Links:** F16 · **Priority:** P1 · **Demo:** ✅
- **Acceptance criteria**
  - `showMedicineName` defaults to off. All texts, calendar titles, lock-screen text and spoken reminders use neutral wording unless it's turned on.
  - Emails, texts and calendar entries never contain health details. They link to MyChart or the app instead.

### US-27: Check-ins by text message
**As** Leo's mom, **I want** to answer by replying 1, 2 or 3 **so that** it works on any phone without an app.
- **Links:** SMS (Now, score 81) · **Demo:** ✅
- **Acceptance criteria**
  - The opt-in message includes "Reply STOP anytime."
  - Replies 1, 2 and 3 map to Working, Not working and Need help; unknown replies get a help prompt.
  - The "Need help" auto-reply includes: "This number isn't watched 24/7. In an emergency, call 911, or call or text 988."
- **Production notes:** needs an approved messaging vendor and consent records. The hackathon demo is simulated only.

### US-28: Check-ins inside MyChart
**As** Leo's mom, **I want** to see the plan and answer check-ins in MyChart **so that** I use a tool the hospital already trusts.
- **Links:** MyChart (Now, 80) · **Demo:** ◐ (concept mock, clearly labeled)
- **Production notes:** requires CCHMC IT and Epic build. Don't imitate the real MyChart screens in demos.

### US-29: Coordinator works the list inside Epic
**As** Riley, **I want** the worklist inside the health record **so that** I don't add another dashboard.
- **Links:** Epic in-chart worklist (Now, 78) · **Demo:** — (our worklist stands in)

### US-30: Check-in dates in my calendar
**As** Jordan, **I want** an "Add to my calendar" button **so that** check-ins show up in the calendar I already use.
- **Links:** Calendar invites (Now, 77) · **Demo:** ✅ (preview)
- **Acceptance criteria:** generates a standard `.ics` file with a neutral title, an alert at event time, and notes containing a link only.

### US-31: Reminder in my phone's Reminders app
**As** Maya, **I want** a repeating reminder in the Reminders app I already use, plus an optional "when I get home" reminder.
- **Links:** Phone reminders (Now, 73), F19 · **Demo:** ✅ (preview)
- **Guardrails:** the location trigger runs on the phone only; location is never sent to us.

### US-32: Short email with a link
**As** Leo's mom, **I want** an email when a check-in is ready **so that** I see it on my computer.
- **Links:** Email (Now, 72) · **Demo:** ✅
- **Acceptance criteria:** a short note, the next date and a link. No medicine names or health details.

### US-33: Next-tier channels (pilot)
**As** a family, **I want** to use WhatsApp, a lock-screen widget, Apple Health logs or pharmacy refill alerts **so that** I can answer in the tool I use most.
- **Links:** Next tier, F20, F32 · **Priority:** Next · **Demo:** ◐ (previews)
- **Notes:**
  - **WhatsApp:** needs business messaging approval.
  - **Widget:** needs the RenewU app installed.
  - **Apple Health:** reads only the medications the patient shares, from iOS 26 onward. A log counts as patient-reported.
  - **Pharmacy:** link-out only, no integration.

### US-34: Rotating reminder wording
**As** Maya, **I want** reminders that don't say the exact same thing every day **so that** I don't tune them out.
- **Links:** F32 · **Priority:** P1 · **Demo:** —
- **Acceptance criteria:** pick from a pool of clinician-approved, discreet messages; skip ones shown recently.

### US-35: Alexa reminder (concept only)
**As** a family with an Echo, **I want** a spoken reminder at home.
- **Links:** Alexa (compliance review) · **Demo:** ◐ (labeled concept)
- **Guardrails:** Amazon ended HIPAA-eligible Alexa skills in 2022. Don't collect health data by voice until compliance review clears it. The reminder always opens with "Here's your reminder."

---

## Epic 7: Privacy and safety (applies to every story)

### US-36: Teen privacy
- Caregivers never see a teen's checklist answers or notes (US-02).
- Under-13 patients get caregiver-managed channels only.
- At age 18, caregiver access changes and the patient gives consent (rule to confirm with the clinical team).

### US-37: Crisis and missed-dose messages
- Any "Need help" or free-text entry shows emergency guidance (911 or 988) and the expected response time.
- The app never gives dosing advice. For a missed dose, show the transplant team's phone number.

### US-38: Opt-in and removable connections
- Every channel and data connection is opt-in, explains what we read or send, and can be turned off in one tap.

### US-40: Rewards for honest check-ins
**As** Maya, **I want** to earn points every time I check in **so that** I have a reason to keep opening the app in month 6.
- **Links:** F24, F34, F31 · **Priority:** P2 in the scored list; the team wants it in the demo · **Screen:** My plan → Rewards · **Demo:** ✅
- **Acceptance criteria**
  - Points: checklist +20, agreed plan +20, each check-in +10, milestones (first 2-week check-in, 30 days on a plan, 6-month checklist) +10 to +20.
  - **Every answer earns the same points**, including "Not working" and "Need help," so there is no reason to answer "Working" just for points.
  - Points never go down. No penalties for missed check-ins.
  - Choose a reward (e.g., $5 gift card, $5 donation to a vetted kidney charity, app theme); the reward unlocks at its point cost.
  - Requesting a reward creates no task for clinical staff. The program handles fulfillment.
  - Under 13: the caregiver chooses the rewards; no money rewards without the caregiver's OK.
  - Staff see the point total as context only.
- **Guardrails:** never reward "taking every dose" or verified adherence. No leaderboards, wagers or gambling-like mechanics (F38, F39). Real money rewards need program funding, legal review and approval. A related trial (U-REAACT, youth kidney transplant) paid for verified on-time doses, which this design deliberately does not do.

---

## Epic 8: Demo controls (hackathon only)

### US-39: Demo controls for judges
**As** a presenter, **I want** a role switcher, a simulated clock and a reset **so that** I can show the full story in three minutes.
- **Demo:** ✅
- **Acceptance criteria**
  - A "Synthetic demo" banner is always visible.
  - The role switcher is labeled as a demo device, not a login.
  - "Skip to Nov 20" sends the check-ins.
  - "Reset demo" restores the seeded state.

---

## Do not build

| Feature | Why |
|---|---|
| F26 Passive GPS or smart-pillbox tracking | Consent and equity concerns; about 4 in 10 patients offered a pillbox refused it or had technical trouble |
| F27, F39 Streaks that reset, gems, wagers | Punishes a missed day; gambling-like for minors |
| F28 AI counseling / MI chatbot | Motivational interviewing needs a trained person (packet p.4) |
| F29, F40 Fear messages, guilt mascots | Fear and blame reduce honest reporting |
| F38 Leaderboards | Shaming; breaks teen privacy |
| Discord / Snapchat channels | Not built for health information; age 13+ |

## Data additions for the connected-apps pivot

Extends the entities in `docs/architecture.md`:

| Entity | Fields | Notes |
|---|---|---|
| `ChannelPreference` | personId, channels[], showMedicineName (default false), homeReminder, reminderTime, language, updatedAt | One per patient or caregiver |
| `OutboundMessage` | id, personId, planId, channel, templateId, scheduledFor, sentAt, simulated: true | Templates are clinician-approved |
| `CheckInResponse` | id, planId, respondent, outcome (working / notworking / help), reason, sourceChannel, submittedAt, autoAcknowledged | Patient-reported; never marks resolution |
| `Task` | id, planId, ownerId, type (review / help / unassigned / noresponse), dueAt, closedAt, closedBy | Created for everything except "working" |

## Traceability

| Story | Features | Channel / tier | Priority | In demo |
|---|---|---|---|---|
| US-01 | F01, F02 | App, MyChart | P0 | — |
| US-02 | F02, F12 | App | P0 | ◐ |
| US-03 | F10, F01 | App | P0 | — |
| US-04 | F15 | All | P1 | ✅ |
| US-05 | F18 | All | P1 | ◐ |
| US-06 | F04 | — | P0 | ✅ |
| US-07 | F14 | — | P1 | ✅ |
| US-08 | F13 | — | P0 | ◐ |
| US-09 | F04, F14 | — | P1 | — |
| US-10 | F05 | — | P0 | ◐ |
| US-11 | F30 | All | P1 | ◐ |
| US-12 | F33 | App | P2 | — |
| US-13 | F06 | All Now | P0 | ✅ |
| US-14 | F07 | All Now | P0 | ✅ |
| US-15 | F08 | All Now | P0 | ✅ |
| US-16 | F10 | All Now | P0 | ◐ |
| US-17 | F31, F36 | App | P1 | — |
| US-18 | Gap (no response) | — | P1 proposed | — |
| US-19 | F09 | Epic (Now) | P0 | ✅ |
| US-20 | F03 | — | P0 | — |
| US-21 | F11 | — | P0 | — |
| US-22 | F17 | — | P0 pivot | ✅ |
| US-23 | F22 | — | P1 | — |
| US-24 | F34 | — | P2 | — |
| US-25 | F17, F37 | Now tier | P0 pivot | ✅ |
| US-26 | F16 | All | P1 | ✅ |
| US-27 | — | SMS (Now) | Now | ✅ |
| US-28 | — | MyChart (Now) | Now | ◐ |
| US-29 | F09 | Epic (Now) | Now | — |
| US-30 | — | Calendar (Now) | Now | ✅ |
| US-31 | F19 | Phone reminders (Now) | Now | ✅ |
| US-32 | — | Email (Now) | Now | ✅ |
| US-33 | F20, F32 | Next tier | Next | ◐ |
| US-34 | F32 | All | P1 | — |
| US-35 | — | Alexa (compliance review) | Later | ◐ |
| US-36–38 | F12, F16 | All | P0 | ◐ |
| US-39 | — | — | Demo | ✅ |
| US-40 | F24, F34, F31 | App, SMS | P2 (team: demo) | ✅ |

## Open questions for the clinical team

1. What may caregivers see, and what changes at 18?
2. How many days of no response before the worklist flags it?
3. Who covers psychology referrals at sites without a psychologist?
4. Which reminder wordings and translations are approved?
5. Is the packet's "> 2 SD across 4 draws" tacrolimus flag the Medication Level Variability Index (MLVI)?
6. What response-time promise can the team make for "Need help"?

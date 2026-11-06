# Pedia Tech — Feature priorities and connected apps

KTx-CONNECT / DEAP · CCHMC Digital Health Hackathon · generated 2026-11-06 from `PediaTech_Feature_Rationale.xlsx` and `PediaTech_Connected_Apps.xlsx`.

> **Caveats.** Scores are team judgment on a written rubric, not a validated measure. Clinician-input scores use the team's summary of the clinician Q&A (raw transcript not reviewed). Research outcomes (e.g., ~50% lower late rejection) belong to the clinical MAPS program, not this prototype. Duolingo figures are company-reported from a language-learning app. Connected-app rows marked *Not verified* need developer-access confirmation.

## Contents

1. [Feature list](#1-feature-list)
2. [Feature rationale (for psychology lead)](#2-feature-rationale-for-psychology-lead)
3. [Problems](#3-problems)
4. [Psychology topics](#4-psychology-topics)
5. [Judging questions](#5-judging-questions)
6. [Duolingo patterns](#6-duolingo-patterns)
7. [Connected apps and channels](#7-connected-apps-and-channels)
8. [Channel guardrails](#8-channel-guardrails)
9. [Channel demo plan](#9-channel-demo-plan)
10. [Scoring method](#10-scoring-method)
11. [Sources](#11-sources)

## 1. Feature list

| Priority | # features | Avg impact |
|---|---|---|
| P0 | 13 | 86 |
| P1 | 12 | 66 |
| P2 / Roadmap | 8 | 49 |
| Cut | 7 | 9 |

| ID | Feature | Screen | Problems | Psych topics | Impact | Priority | Team plan | Build now? |
|---|---|---|---|---|---|---|---|---|
| F04 | Default routing to a named owner | Worklist; Review and plan | PR03; PR05; PR12 | T14 | 95 | **P0** | P0 | Yes – core |
| F01 | Structured 14-item barrier check-in (BAT) | Check-in | PR01; PR02 | T03; T12; T13 | 93 | **P0** | P0 | Yes – core |
| F02 | Separate patient and caregiver reports (age rule) | Check-in | PR06; PR07 | T06; T07; T16 | 93 | **P0** | P0 | Yes – core |
| F05 | One agreed plan per barrier (who/what/how/where/when) | Review and plan | PR02; PR03 | T01; T02; T09; T10 | 93 | **P0** | P0 | Yes – core |
| F06 | Short plan-specific follow-up | My plan | PR02; PR04; PR11 | T10; T12 | 93 | **P0** | P0 | Yes – core |
| F08 | Problem handoff with context | Worklist; Review and plan | PR04; PR05; PR12 | T14; T01 | 93 | **P0** | P0 | Yes – core |
| F10 | Durability check-ins and 6-month reassessment | My plan; Review and plan | PR02; PR11 | T09; T10 | 91 | **P0** | P0 | Yes – core |
| F13 | Refusal routes fast to psychology | Check-in; Worklist | PR12 | T01; T03 | 88 | **P0** | P0 | Yes – core |
| F09 | Care-team worklist | Worklist | PR03; PR04 | T14 | 81 | **P0** | P0 | Yes – core |
| F07 | Auto-acknowledge routine 'working' updates | My plan; Worklist history | PR03; PR04 | T04; T10 | 80 | **P0** | P0 | Yes – core |
| F15 | Supportive, nonjudgmental copy | All patient screens | PR10 | T03; T05 | 78 | **P1** | P0 | If time |
| F03 | Disagreement signal for clinicians | Review and plan | PR06 | T07; T16 | 76 | **P0** | P0 | Yes – core |
| F11 | Chart risk flags shown transparently | Review and plan | PR13 | T15 | 74 | **P0** | P0 | Yes – core |
| F20 | Refill-support request | Check-in; My plan | PR14; PR08 | T16 | 73 | **P1** | P1 | If time |
| F12 | Teen privacy: caregiver sees only own answers | Check-in (caregiver) | PR07 | T06; T15 | 69 | **P0** | P0 | Yes – core |
| F30 | Plan B for away days (Duolingo 'Weekend Amulet' idea) | My plan | PR02; PR07; PR11 | T09; T20; T11 | 68 | **P1** | New (Duolingo) | If time |
| F22 | Outcome measures (patient and caregiver separate) | Worklist | PR03 | T07 | 68 | **P1** | P1 | If time |
| F36 | Plan journey path | My plan | PR02; PR11 | T10; T12 | 66 | **P1** | New (Duolingo) | If time |
| F21 | Gradual responsibility transfer | Settings; My plan | PR08 | T08; T17 | 65 | **P1** | P2 / Roadmap | Roadmap |
| F31 | Never-reset consistency count | My plan | PR10; PR11 | T04; T20 | 64 | **P1** | New (Duolingo) | If time |
| F14 | Visible unassigned referral when a role is missing | Worklist | PR03; PR12 | T14 | 63 | **P1** | P1 | If time |
| F16 | Discreet notifications | My plan; Settings | PR07 | T11; T06 | 63 | **P1** | P1 | If time |
| F18 | Plain language and approved translations | All patient screens | PR09 | T13; T16 | 63 | **P1** | P1 | Roadmap |
| F19 | Routine-aware reminders (patient-chosen cue) | My plan | PR02; PR07 | T09; T17 | 62 | **P1** | P1 | Roadmap |
| F32 | Rotating discreet reminder messages | Settings; notifications (simulated) | PR02; PR07; PR11 | T19; T11; T17 | 60 | **P1** | New (Duolingo) | Roadmap |
| F33 | 'I'll try this until [date]' commitment tap | Review and plan; My plan | PR02; PR11 | T18; T09; T02 | 54 | **P2 / Roadmap** | New (Duolingo) | Roadmap |
| F17 | Support preferences | Settings | PR07; PR09; PR11 | T17; T06 | 53 | **P2 / Roadmap** | P1 | Roadmap |
| F37 | Choose my check-in rhythm | Settings | PR07; PR11 | T17; T06 | 53 | **P2 / Roadmap** | New (Duolingo) | Roadmap |
| F34 | Milestone celebrations and one-tap high-five | My plan; Worklist | PR04; PR11 | T04; T14; T10 | 51 | **P2 / Roadmap** | New (Duolingo) | Roadmap |
| F35 | Opt-in check-in buddy | Settings | PR07; PR11 | T21; T06 | 48 | **P2 / Roadmap** | New (Duolingo) | Roadmap |
| F25 | AI staff summary draft | Review and plan | PR04; PR05 | T14 | 45 | **P2 / Roadmap** | P2 / Roadmap | Roadmap |
| F23 | Friendly companion character | My plan | PR11 | T04; T05 | 44 | **P2 / Roadmap** | P2 / Roadmap | Roadmap |
| F24 | Incentives and rewards | My plan | PR11 | T04 | 44 | **P2 / Roadmap** | P2 / Roadmap | Roadmap |
| F26 | Passive monitoring (GPS, smart pillbox) | None (roadmap) | PR02 | T15; T06 | 27 | **Cut** | Cut | No – exclude |
| F38 | Leagues and leaderboards | None | PR11 | T06; T05 | 14 | **Cut** | Cut | No – exclude |
| F39 | Gems, wagers and resetting streaks | None | PR10 | T20; T04 | 9 | **Cut** | Cut | No – exclude |
| F40 | Guilt-trip mascot notifications | None | PR10 | T05; T03 | 9 | **Cut** | Cut | No – exclude |
| F27 | Punitive streaks / declining pet health | None | PR11 | T04; T05 | 2 | **Cut** | Cut | No – exclude |
| F28 | AI counseling or MI chatbot | None | PR12 | T01 | 2 | **Cut** | Cut | No – exclude |
| F29 | Fear-based risk messaging | None | PR10 | T05; T03 | 2 | **Cut** | Cut | No – exclude |

## 2. Feature rationale (for psychology lead)

### F04 — Default routing to a named owner  
**P0 · impact 95** · E5 C4 A5 S5

- **What it does:** Each 'Yes' becomes an open barrier routed by the 14-item map to a role and named staff member, or visibly unassigned.
- **Rationale:** Clear ownership is one of the reasons MAPS worked. A named person (not just a role) keeps a relationship and accountability for the family.
- **Clinician input:** Consistent with keeping a human owner accountable.
- **Sources:** S01 pp.4–5; S05; S06
- **Guardrails:** Site-specific map; never silently drop a barrier.

### F01 — Structured 14-item barrier check-in (BAT)  
**P0 · impact 93** · E5 C4 A5 S4

- **What it does:** Patient or caregiver answers all 14 items with explicit Yes/No; can't submit with blanks; all-No is valid.
- **Rationale:** A short structured checklist makes it easier to name a barrier than an open question, and uses wording already tested at a 5th-grade level. Requiring an explicit answer avoids treating a skipped item as 'no barrier'.
- **Clinician input:** Keep the full BAT for baseline and reassessment, not every follow-up.
- **Sources:** S01 pp.3–5; S06; S07; S08; S05
- **Guardrails:** Use exact BAT wording; do not reinterpret free text with AI.

### F02 — Separate patient and caregiver reports (age rule)  
**P0 · impact 93** · E5 C4 A5 S4

- **What it does:** Caregiver only under age 10; at 10+, patient and caregiver answer independently.
- **Rationale:** Asking each person separately respects teen privacy and captures two real perspectives. Research shows patient and caregiver reports differ and change differently after intervention.
- **Clinician input:** Independence should follow skills, not age alone (applies beyond the BAT age rule).
- **Sources:** S01 pp.2, 4; S06; S07
- **Guardrails:** Never merge or average reports.

### F05 — One agreed plan per barrier (who/what/how/where/when)  
**P0 · impact 93** · E5 C4 A5 S4

- **What it does:** Clinician records one concrete solution agreed with the patient, owner, and first check-back within 14 days.
- **Rationale:** Small, specific plans made together build ownership and self-efficacy. Capturing where and when turns intentions into cues.
- **Clinician input:** Supports preserving the clinician relationship; plan made by a human.
- **Sources:** S01 pp.4–5; S05
- **Guardrails:** Agreement is recorded by a human after an MI conversation; app does not choose the solution.

### F06 — Short plan-specific follow-up  
**P0 · impact 93** · E4 C5 A5 S5

- **What it does:** Patient answers 'Working', 'Not working' or 'I need help' about their current plan instead of retaking the full BAT.
- **Rationale:** Asking about the one thing they are trying lowers effort and keeps the focus on progress, which helps people keep responding over months.
- **Clinician input:** Explicitly supported: ask if the existing solution is working rather than resending the full survey.
- **Sources:** S01 pp.3–4
- **Guardrails:** Patient report is not verified adherence.

### F08 — Problem handoff with context  
**P0 · impact 93** · E4 C5 A5 S5

- **What it does:** 'Not working', 'I need help' or a new barrier creates a task for the right human, with the previous plan, reporter, date and reason attached.
- **Rationale:** Arriving prepared lets the clinician skip re-asking and go straight to problem-solving, making the follow-up conversation shorter and more respectful.
- **Clinician input:** Supported: unsuccessful follow-ups should reach the team.
- **Sources:** S01 pp.2, 4, 6
- **Guardrails:** No invented escalation thresholds.

### F10 — Durability check-ins and 6-month reassessment  
**P0 · impact 91** · E5 C4 A5 S3

- **What it does:** Continued check-ins after the first; sample 6-month BAT date; 'Report a new barrier' anytime.
- **Rationale:** Habits take time to stick; repeated light check-ins catch relapse and new barriers without waiting for the next visit.
- **Clinician input:** Supports ongoing between-visit contact.
- **Sources:** S01 pp.3–4
- **Guardrails:** Simulated time; no real scheduler.

### F13 — Refusal routes fast to psychology  
**P0 · impact 88** · E4 C4 A5 S5

- **What it does:** 'I refuse to take them' routes to the psychologist with context; patient sees supportive message, no chatbot counseling.
- **Rationale:** Refusal often reflects motivation or mood and needs a trained person. A fast human response keeps the door open instead of lecturing.
- **Clinician input:** Supported: AI helps communicate, does not counsel.
- **Sources:** S01 pp.4–6 (Q2)
- **Guardrails:** No urgency rules invented.

### F09 — Care-team worklist  
**P0 · impact 81** · E3 C4 A5 S5

- **What it does:** Short list: new barriers, unassigned, overdue follow-ups, problem updates; owner and due date on each.
- **Rationale:** A short list the coordinator trusts replaces another alert stream, answering the judges' 'busy Tuesday afternoon' question.
- **Clinician input:** Consistent with reducing staff work.
- **Sources:** S01 pp.2, 6 (Q1)
- **Guardrails:** Operational ordering only; not a risk score.

### F07 — Auto-acknowledge routine 'working' updates  
**P0 · impact 80** · E3 C5 A4 S5

- **What it does:** A 'Working' report gets an automatic thank-you and is logged; no staff task; owner and next check stay.
- **Rationale:** Positive acknowledgment reinforces reporting while cutting unnecessary staff calls, which the packet names as the main staffing barrier.
- **Clinician input:** Supported: successful routine follow-ups may not need human involvement.
- **Sources:** S01 pp.1, 6
- **Guardrails:** Do not mark the barrier clinically resolved; exact automation policy needs clinical approval.

### F15 — Supportive, nonjudgmental copy  
**P1 · impact 78** · E3 C5 A4 S4

- **What it does:** Language like 'Thanks for telling us' and 'Let's find something that works for you'; missing answers shown neutrally.
- **Rationale:** Normalizing barriers lowers shame and fear, which makes honest reporting more likely.
- **Clinician input:** Supported: normalize disclosure; fear and blame undermine useful conversations.
- **Sources:** S01 pp.4, 6
- **Guardrails:** Interface drafts, not clinically validated content.

### F03 — Disagreement signal for clinicians  
**P0 · impact 76** · E4 C2 A5 S4

- **What it does:** Coordinator sees where patient and caregiver answers differ, side by side.
- **Rationale:** Disagreement is a clinical signal about the family; showing it helps the clinician open the conversation without exposing one person's answers to the other.
- **Clinician input:** Not discussed directly in the Q&A summary.
- **Sources:** S01 pp.2, 4; S06
- **Guardrails:** Shown to clinicians only; not a judgment of who is right.

### F11 — Chart risk flags shown transparently  
**P0 · impact 74** · E4 C2 A5 S3

- **What it does:** Labeled synthetic flags (tacrolimus variability, no visit >4 months, no labs >6 weeks) with source and date.
- **Rationale:** Showing individual flags lets clinicians combine them with what the family reports. Research found a composite score did not predict outcomes, so we show the parts, not a score.
- **Clinician input:** Not discussed directly in the Q&A summary.
- **Sources:** S01 p.4; S08; S09
- **Guardrails:** Synthetic fixtures; no calculated thresholds or composite score.

### F20 — Refill-support request  
**P1 · impact 73** · E3 C4 A4 S4

- **What it does:** 'Ran out' or 'can't afford' routes to the social worker with context; optional refill-help button.
- **Rationale:** Access problems aren't solved by motivation; routing them to a social worker removes blame and gets practical help.
- **Clinician input:** Pharmacies and refill data vary; model a request, not an integration.
- **Sources:** S01 pp.2, 5
- **Guardrails:** No pharmacy integration or inventory claims.

### F12 — Teen privacy: caregiver sees only own answers  
**P0 · impact 69** · E3 C2 A5 S4

- **What it does:** Caregiver view shows their own submission and confirmation, not the teen's answers.
- **Rationale:** Teens disclose more when they trust their answers are not shown to parents. Visibility rules are a deliberate clinical decision.
- **Clinician input:** Not discussed directly in the Q&A summary.
- **Sources:** S01 pp.2, 6 (Q3); S11
- **Guardrails:** Demo rule only; real sharing policy is a clinical decision.

### F30 — Plan B for away days (Duolingo 'Weekend Amulet' idea)  
**P1 · impact 68** · E3 C3 A4 S4

- **What it does:** Patient sets a weekend/sleepover version of the plan in advance; check-ins adapt on those days with no penalty.
- **Rationale:** Planned breaks kept Duolingo learners engaged longer. For Maya, weekends and sleepovers are exactly when the plan fails, so planning ahead for them turns a likely lapse into a rehearsed alternative.
- **Clinician input:** Routine-aware ideas welcomed for exploration.
- **Sources:** S01 p.2; S12
- **Guardrails:** Does not change dose times; plan B content agreed with the owner.

### F22 — Outcome measures (patient and caregiver separate)  
**P1 · impact 68** · E4 C2 A4 S3

- **What it does:** Show follow-ups completed vs due and barriers patient-reported as working, split by respondent.
- **Rationale:** Measuring follow-up completion and barrier change (not just clicks) lets the team test whether the loop works; separate tracking reflects research findings.
- **Clinician input:** Not discussed directly in the Q&A summary.
- **Sources:** S01 p.6; S07
- **Guardrails:** Prototype has no outcome results; do not claim improved rejection rates.

### F36 — Plan journey path  
**P1 · impact 66** · E3 C3 A4 S3

- **What it does:** A simple path showing where the patient is: plan agreed → week 1 → 2-week check → keep going → 6-month check-in.
- **Rationale:** Seeing the next step makes the loop concrete and gives a sense of progress based on steps completed, not adherence.
- **Clinician input:** Consistent with ongoing between-visit contact.
- **Sources:** S01 p.3
- **Guardrails:** Progress = steps of the loop, not verified adherence.

### F21 — Gradual responsibility transfer  
**P1 · impact 65** · E2 C5 A3 S4

- **What it does:** Self-management tasks shift from caregiver to youth as skills are shown (roadmap).
- **Rationale:** Transfer based on demonstrated skill supports competence and reduces conflict during transition to adult care.
- **Clinician input:** Supported: independence should follow skills, not age alone.
- **Sources:** S01 pp.2, 4
- **Guardrails:** Requires clinical rules for readiness.

### F31 — Never-reset consistency count  
**P1 · impact 64** · E2 C4 A4 S3

- **What it does:** Shows 'check-ins this month' and a calm weekly rhythm instead of a streak that resets; counts check-ins, not doses.
- **Rationale:** A count that never drops to zero keeps the motivational pull of progress without the 'I blew it, why bother' effect after a missed day.
- **Clinician input:** Consistent with clinicians' 'no lost streaks'.
- **Sources:** S01 p.6; S12; S15
- **Guardrails:** Counts engagement with the plan, never claims doses were taken.

### F14 — Visible unassigned referral when a role is missing  
**P1 · impact 63** · E3 C2 A4 S4

- **What it does:** If a center has no psychologist (or other role), the barrier shows 'Unassigned – coordinator review' instead of disappearing.
- **Rationale:** Making gaps visible keeps responsibility with a person and answers how centers without a psychologist could still use the loop.
- **Clinician input:** Not discussed directly in the Q&A summary.
- **Sources:** S01 pp.1, 6 (Q5)
- **Guardrails:** Do not substitute an unapproved clinical role.

### F16 — Discreet notifications  
**P1 · impact 63** · E3 C2 A4 S4

- **What it does:** Reminder and check-in text with no medication or diagnosis detail on the lock screen (simulated).
- **Rationale:** Teens avoid tools that could reveal their condition to friends; discreet design reduces stigma.
- **Clinician input:** Not discussed directly in the Q&A summary.
- **Sources:** S01 pp.2, 5–6
- **Guardrails:** Simulated; no messages actually sent.

### F18 — Plain language and approved translations  
**P1 · impact 63** · E3 C2 A4 S4

- **What it does:** 5th-grade wording throughout; Spanish/Arabic BAT used only when approved versions are supplied.
- **Rationale:** Caregivers with limited English or literacy need to understand questions to answer honestly.
- **Clinician input:** Not discussed directly in the Q&A summary.
- **Sources:** S01 pp.2, 5–6
- **Guardrails:** No machine translation of clinical content.

### F19 — Routine-aware reminders (patient-chosen cue)  
**P1 · impact 62** · E3 C3 A3 S4

- **What it does:** Patient pairs doses with a daily routine (e.g., brushing teeth) and picks reminder timing manually.
- **Rationale:** Linking doses to an existing habit is one of the packet's own forgetting strategies and builds automatic behavior.
- **Clinician input:** Routine-aware ideas welcomed for exploration.
- **Sources:** S01 p.5; S04
- **Guardrails:** Never move prescribed dose times; no location tracking.

### F32 — Rotating discreet reminder messages  
**P1 · impact 60** · E3 C3 A3 S3

- **What it does:** Pool of clinician-approved, discreet message wordings that rotate; recently seen ones are skipped. Later: learn which wording each patient responds to.
- **Rationale:** Repeated identical reminders get ignored. Duolingo's published algorithm improved return rates by rotating and demoting recently seen messages.
- **Clinician input:** Personalization welcomed for exploration.
- **Sources:** S13; S02
- **Guardrails:** Only approved wording; learning limited to wording/time the patient allowed; no dose-time changes.

### F33 — 'I'll try this until [date]' commitment tap  
**P2 / Roadmap · impact 54** · E2 C2 A4 S3

- **What it does:** After the plan is agreed, the patient confirms one small commitment to the plan until the check-back date.
- **Rationale:** A small, explicit promise in the patient's own words strengthens follow-through; Duolingo saw retention gains from commitment-style features.
- **Clinician input:** Not discussed directly in the Q&A summary.
- **Sources:** S12; S15; S01 p.4
- **Guardrails:** No stakes, points or penalties; patient can decline.

### F17 — Support preferences  
**P2 / Roadmap · impact 53** · E2 C3 A3 S3

- **What it does:** Patient picks channel, language and discreet mode; reminder style choices.
- **Rationale:** Offering choices supports autonomy and tailors support to the person, which DEAP lists as a core goal.
- **Clinician input:** Personalization ideas welcomed for exploration.
- **Sources:** S02; S04
- **Guardrails:** Don't change validated BAT questions or infer personality.

### F37 — Choose my check-in rhythm  
**P2 / Roadmap · impact 53** · E2 C3 A3 S3

- **What it does:** Patient picks reminder time and how often the app nudges, within clinical bounds (first check-back ≤14 days).
- **Rationale:** Letting people set their own goal supports autonomy; Duolingo found a lower daily bar kept more learners going.
- **Clinician input:** Personalization welcomed for exploration.
- **Sources:** S02; S15
- **Guardrails:** Cannot push the first check-back past 14 days.

### F34 — Milestone celebrations and one-tap high-five  
**P2 / Roadmap · impact 51** · E2 C3 A3 S2

- **What it does:** Celebrate first check-in, the 2-week check, and 30 days on a plan; the owner can send a one-tap 'high five'.
- **Rationale:** Positive acknowledgment reinforces reporting, and a one-tap high-five keeps the human connection without a phone call.
- **Clinician input:** Incentives welcomed for exploration.
- **Sources:** S14; S16
- **Guardrails:** Celebrate engagement, never 'perfect adherence'.

### F35 — Opt-in check-in buddy  
**P2 / Roadmap · impact 48** · E2 C2 A3 S3

- **What it does:** Teen can choose a buddy (caregiver or peer mentor) who sees only 'checked in' and can send encouragement.
- **Rationale:** Social support helps teens keep going, and peer mentoring is being studied in adolescent transplant; sharing only 'checked in' protects privacy.
- **Clinician input:** Not discussed directly in the Q&A summary.
- **Sources:** S14; S17; S01 p.2
- **Guardrails:** Never shares answers or barriers; no shared streak that breaks.

### F25 — AI staff summary draft  
**P2 / Roadmap · impact 45** · E1 C4 A2 S3

- **What it does:** Optional draft summary of reports and plan history for a clinician to review and edit.
- **Rationale:** Could shorten clinician prep time while keeping the conversation human.
- **Clinician input:** Supported: AI should help people communicate.
- **Sources:** S01 p.4; S03
- **Guardrails:** Never counsels, prescribes, sets routing or urgency.

### F23 — Friendly companion character  
**P2 / Roadmap · impact 44** · E1 C3 A3 S2

- **What it does:** Optional static supportive character; never declines or suffers with missed doses.
- **Rationale:** A warm character may make the app feel less clinical for teens, if it stays supportive and never guilt-based.
- **Clinician input:** Clinicians cautioned against declining pet health / guilt mechanics.
- **Sources:** S04
- **Guardrails:** No guilt, suffering or dependency tied to medication use.

### F24 — Incentives and rewards  
**P2 / Roadmap · impact 44** · E1 C3 A3 S2

- **What it does:** Rewards or charitable incentives for engagement (roadmap concept).
- **Rationale:** Positive incentives could support month-6 engagement, but need program design and validation.
- **Clinician input:** Welcomed for exploration; not a validated protocol.
- **Sources:** S04
- **Guardrails:** No real rewards or partner commitments in demo.

### F26 — Passive monitoring (GPS, smart pillbox)  
**Cut · impact 27** · E1 C2 A1 S2

- **What it does:** Location-based or device-based tracking of dosing (roadmap only after ethics review).
- **Rationale:** Monitoring raises consent, autonomy and equity issues, and about 4 in 10 patients offered a pillbox refused it or had technical trouble.
- **Clinician input:** Routine ideas welcomed, but never move doses based on location.
- **Sources:** S11; S01 p.4
- **Guardrails:** Excluded from build.

### F38 — Leagues and leaderboards  
**Cut · impact 14** · E1 C1 A0 S1

- **What it does:** Ranking users against each other weekly.
- **Rationale:** Comparing teens' medication behavior is shaming and breaks privacy.
- **Clinician input:** Fear and blame undermine disclosure.
- **Sources:** S01 p.6
- **Guardrails:** Excluded.

### F39 — Gems, wagers and resetting streaks  
**Cut · impact 9** · E1 C0 A0 S1

- **What it does:** Virtual currency bets and streaks that drop to zero after a miss.
- **Rationale:** Punishes a missed day and adds gambling-like mechanics for minors.
- **Clinician input:** Clinicians: no lost streaks.
- **Sources:** S01 p.6; S15
- **Guardrails:** Excluded.

### F40 — Guilt-trip mascot notifications  
**Cut · impact 9** · E1 C0 A0 S1

- **What it does:** Duolingo-style passive-aggressive or sad mascot messages.
- **Rationale:** Guilt and fear reduce honest reporting; the companion must stay supportive.
- **Clinician input:** Clinicians cautioned against guilt mechanics.
- **Sources:** S01 pp.4, 6
- **Guardrails:** Excluded.

### F27 — Punitive streaks / declining pet health  
**Cut · impact 2** · E0 C0 A0 S1

- **What it does:** Streak counters that reset on missed days; virtual pet that gets sick.
- **Rationale:** Punishing missed days conflicts with the packet's nonjudgmental tone and discourages honest reporting.
- **Clinician input:** Clinicians warned against fear and blame mechanics.
- **Sources:** S01 pp.4, 6
- **Guardrails:** Excluded.

### F28 — AI counseling or MI chatbot  
**Cut · impact 2** · E0 C0 A0 S1

- **What it does:** Automated motivational interviewing or treatment advice.
- **Rationale:** MI needs a trained person; the packet sets this as a firm limit.
- **Clinician input:** AI to help communicate only.
- **Sources:** S01 p.4
- **Guardrails:** Excluded.

### F29 — Fear-based risk messaging  
**Cut · impact 2** · E0 C0 A0 S1

- **What it does:** Messages warning of rejection or organ loss to motivate adherence.
- **Rationale:** Fear and blame undermine useful conversations; tone must stay nonjudgmental.
- **Clinician input:** Clinicians cautioned against frightening messages.
- **Sources:** S01 p.4
- **Guardrails:** Excluded.

## 3. Problems

| ID | Problem | Who | Source | Severity | Features |
|---|---|---|---|---|---|
| PR01 | Barriers to taking medicine are rarely assessed in a structured way between visits. | All | S02; S01 p.4 | High | F01 |
| PR02 | Most missed doses happen at home between visits, where the care team has little visibility. | Patient, caregiver, team | S01 pp.1, 3 | High | F01; F05; F06; F10; F30; F36; F19; F32; F33; F26 |
| PR03 | MAPS depends on trained, dedicated staff that most transplant centers cannot provide. | Care team, other centers | S01 p.1 | High | F04; F05; F09; F07; F22; F14 |
| PR04 | Follow-up calls slip when clinic is busy, and the coordinator already gets too many alerts. | Transplant coordinator | S01 p.2; S03 | High | F06; F08; F09; F07; F34; F25 |
| PR05 | Referrals reach the social worker or psychologist without the 'why': barrier, history, what was tried. | Social worker, psychologist | S01 p.2 | High | F04; F08; F25 |
| PR06 | Patient and caregiver can see barriers differently; combining their answers hides a family signal. | Patient 10+, caregiver | S01 pp.2, 4; S06; S07 | High | F02; F03 |
| PR07 | Teens want to feel normal, not nagged or watched; stigma about taking pills in front of friends. | Teen patient (Maya) | S01 p.2, p.5 barrier #5 | High | F02; F12; F30; F16; F19; F32; F17; F37; F35 |
| PR08 | Responsibility must shift from parent to young adult over time (refills, insurance, schedule). | Young adult (Jordan), caregiver | S01 pp.2, 4; S03 | Medium | F20; F21 |
| PR09 | Caregivers may have low health literacy or limited English (Spanish and Arabic matter). | Caregiver (Leo's mom) | S01 pp.2, 5–6 | Medium | F18; F17 |
| PR10 | Fear, blame or punishment discourages honest reporting of missed doses and barriers. | Patient, caregiver | S01 pp.4, 6; S03 | High | F15; F31; F39; F40; F29 |
| PR11 | Keeping families engaged at month 6, not only week 1. | Patient, caregiver | S01 pp.4, 6 (Q4) | Medium | F06; F10; F30; F36; F31; F32; F33; F17; F37; F34; F35; F23; F24; F38; F27 |
| PR12 | Complex barriers (refusal, cost, mood) need a trained human quickly; some centers lack those roles. | Patient, psychologist, social worker | S01 pp.4–6 (Q2, Q5) | High | F04; F08; F13; F14; F28 |
| PR13 | Reported barriers and chart signals are linked to rejection risk but are not used together between visits. | Care team | S01 p.4; S08; S09 | Medium | F11 |
| PR14 | Running out of medicine or cost blocks adherence regardless of motivation. | Patient, caregiver, social worker | S01 pp.2, 5; S03 | High | F20 |

## 4. Psychology topics

Topics marked *teammate to cite* are general psychology concepts not covered by the supplied sources.

| ID | Topic | Meaning | How the app applies it | Avoid | Source basis | Features |
|---|---|---|---|---|---|---|
| T01 | Motivational interviewing (MI) | Collaborative counseling style that draws out the person's own reasons for change. | The app prepares and shortens the MI conversation (barriers, prior plans) but never replaces it; plan is agreed with a trained person. | Chatbots or scripted 'MI'; telling the teen what to do. | Documented: S01 p.4 (firm limit) | F05; F08; F13; F28 |
| T02 | Shared decision-making | Patient, family and clinician choose a solution together from options. | Plan form records who agreed; one solution per barrier chosen with the patient using the action-plan handouts. | Handing the patient a plan; auto-assigning solutions. | Documented: S01 pp.4–5; S05 (MAPS bundle) | F05; F33 |
| T03 | Nonjudgmental disclosure / normalizing barriers | Treating barriers as common problems to solve, which makes honest reporting safer. | Supportive copy ('Thanks for telling us'); missing answers shown neutrally; no blame language. | Shaming, 'you failed', scary consequences. | Documented: S01 pp.4, 6; S03 | F01; F13; F15; F40; F29 |
| T04 | Positive reinforcement vs. punishment | Rewarding helpful behavior tends to sustain engagement better than penalizing lapses. | Acknowledge any update; possible future incentives; no lost streaks or penalties. | Streaks that reset, declining pet health, leaderboards. | Documented direction: S01 p.6; S03. Underlying learning theory: general psychology — teammate to cite. | F07; F31; F34; F23; F24; F39; F27 |
| T05 | Fear appeals / threat messaging | High-fear messages can backfire or increase avoidance, especially in teens. | No frightening transplant-loss messages; calm, factual tone. | Countdowns, 'your kidney will fail' alerts. | Direction: S03 (avoid fear). Theory: general psychology — teammate to cite. | F15; F23; F38; F40; F27; F29 |
| T06 | Adolescent autonomy and confidentiality | Teens are entitled to some privacy and control; surveillance harms trust. | Separate teen and caregiver views; caregiver sees own answers only; discreet notifications. | Parent sees everything; one family account. | Documented: S01 pp.2, 6; S11 | F02; F12; F16; F17; F37; F35; F26; F38 |
| T07 | Multi-informant assessment (informant discrepancy) | Different reporters give different, meaningful views; disagreement is information. | Collect patient (10+) and caregiver separately; show disagreement to clinician only. | Averaging or merging reports; one reporter overwriting another. | Documented: S01 pp.2, 4; S06; S07. Term itself: general psychology — teammate to cite. | F02; F03; F22 |
| T08 | Transition readiness / gradual responsibility | Self-management shifts from parent to youth based on demonstrated skills. | Future: unlock self-management tasks by skill, not birthday; keep caregiver involved as needed. | Automatic hand-off at a set age. | Documented: S01 p.4 (open area); S03 (skills, not age) | F21 |
| T09 | Habit formation / implementation intentions | Linking a behavior to a cue ('after I brush my teeth I take my meds') makes it automatic. | Forgetting plan captures where/when cue; routine-aware reminders chosen by patient. | Moving prescribed dose times; location tracking. | Example in S01 p.5 (pair with routine). Theory: general psychology — teammate to cite. | F05; F10; F30; F19; F33 |
| T10 | Self-efficacy | Belief that one can succeed at a task predicts follow-through. | 'Working' updates acknowledged; one small concrete step per barrier; history shows what worked. | Overloading with many tasks at once. | General psychology — teammate to cite. | F05; F06; F10; F07; F36; F34 |
| T11 | Stigma and social identity | Fear of being seen as different drives hiding medication. | Embarrassment plan (discreet carrying, a short script for friends); lock-screen text with no medical detail. | Visible medical branding on notifications. | Documented: S01 pp.2, 5 | F30; F16; F32 |
| T12 | Cognitive load / executive function | Planning and remembering demands can exceed a person's capacity; simpler tasks help. | Short plan-specific check-ins instead of full survey; one action per screen; flag executive-function concerns for neuropsych. | Long forms each time; many alerts. | Documented: S02 (cognitive load); S01 p.5 (EF referral); S03 | F01; F06; F36 |
| T13 | Health literacy | Ability to understand and use health information. | BAT at 5th-grade level; plain language; approved Spanish/Arabic versions only; literacy concerns to social worker. | Jargon; machine translation of clinical content. | Documented: S01 pp.5–6 | F01; F18 |
| T14 | Therapeutic alliance / relationship continuity | Trusting relationship with clinicians supports adherence and disclosure. | Named owner on every plan; app extends rather than replaces clinician contact. | Anonymous queues; bots presented as the care team. | Documented direction: S03 (preserve relationship); S01 p.4. Theory: teammate to cite. | F04; F08; F09; F14; F34; F25 |
| T15 | Monitoring ethics | Consent, autonomy, privacy and equity before tracking behavior. | Opt-in preferences; no GPS or passive tracking; family visibility is a deliberate clinical decision. | Covert tracking; data-plan or device assumptions. | Documented: S11; S01 p.4 (pillbox refusal ~4 in 10) | F11; F12; F26 |
| T16 | Family systems / caregiver burden | Adherence happens inside a family juggling work, siblings and cost. | Caregiver has own role and view; cost/ran-out to social worker. | Treating caregiver as only a monitor. | Documented: S01 p.2 (Leo's mom persona) | F02; F03; F20; F18 |
| T17 | Self-determination theory (autonomy, competence, relatedness) | Motivation lasts longer when people feel choice, capability and connection. | Choice of reminder style (autonomy), small wins (competence), named care-team person (relatedness). | Controlling or guilt-based nudges. | General psychology — teammate to cite. | F21; F19; F32; F17; F37 |
| T18 | Commitment devices | Making a small, explicit promise in advance raises follow-through. | 'I'll try this until [date]' tap after the plan is agreed; no money or points at stake. | Wagers, gems, gambling-like mechanics for minors. | Non-health evidence: S12 (Streak Wager). Theory: general psychology — teammate to cite. | F33 |
| T19 | Habituation / novelty decay | People tune out a reminder they see over and over. | Rotate a pool of clinician-approved, discreet messages; demote ones seen recently. | Same message every day; escalating volume. | Non-health evidence: S13. Theory: general psychology — teammate to cite. | F32 |
| T20 | Abstinence-violation ('what-the-hell') effect | After one slip, people may give up entirely if they feel the record is ruined. | Counts never reset to zero; planned breaks and 'plan B' days; next step framed as a fresh try. | Streak resets, 'you lost your streak' messages. | S15 (secondary). Habit research (e.g., Lally et al. on a missed day not derailing habit formation) — teammate to verify and cite. | F30; F31; F39 |
| T21 | Social support and peer modeling | Encouragement from people we trust, and seeing peers succeed, supports coping. | Opt-in buddy who sees only 'checked in'; peer tips for the embarrassment plan. | Shared streaks that break when one person misses; exposing answers. | S14 (non-health association); S17 (peer mentoring in transplant). Theory: teammate to cite. | F35 |

## 5. Judging questions

| # | Question (packet p.6) | Our answer | Features | Topics |
|---|---|---|---|---|
| Q1 | What does the coordinator actually do with your output on a busy Tuesday afternoon? | Opens a short worklist (new, unassigned, overdue, problem updates); routine 'working' updates are already acknowledged and don't add tasks; problem updates arrive with the prior plan attached. | F09; F07; F08 | T12; T14 |
| Q2 | What happens when a 16-year-old says 'I refuse to take them'? | The barrier routes to the psychologist with context; the teen sees a supportive message; no chatbot counseling; plan is agreed in a human MI conversation. | F13; F04; F15 | T01; T03 |
| Q3 | What does the parent see, and what does the teen keep private? | Patient (10+) and caregiver answer separately; caregiver sees only their own answers and confirmation; clinicians see both and the disagreement. Final sharing rules are a clinical decision. | F02; F12; F03 | T06; T07 |
| Q4 | Why would someone use this in month 6, not just in week 1? | Check-ins ask only about their current plan; positive updates are acknowledged; discreet, patient-chosen reminders; no punishing streaks; durability check-ins and a 6-month reassessment. | F06; F07; F10; F19; F30; F31; F36 | T04; T09; T10; T17; T20 |
| Q5 | How would a center with no psychologist on staff use this? | The barrier still appears with a visible 'Unassigned – coordinator review' status rather than disappearing; the site edits its routing map. | F14; F04 | T14 |

## 6. Duolingo patterns

| Duolingo feature | What Duolingo reported | Source | Decision | Our version | Feature | Our priority |
|---|---|---|---|---|---|---|
| Low daily bar | Lower daily target kept 40%+ more users on a 7-day streak | S15 | Adopt | One-question plan check-in (<30 sec) | F06; F37 | P0 |
| Weekend Amulet (planned break) | +4% returned a week later; 5% less likely to lose streak | S12 | Adapt | Plan B for away days (sleepovers, weekends) | F30 | P1 |
| Streak freeze | 2nd freeze ≈ 200k more daily returners (reported) | S15 | Adapt | Never-reset consistency count (no freeze needed) | F31 | P1 |
| Streak Wager | +14% Day-7 retention | S12 | Adapt (no stakes) | 'I'll try this until [date]' commitment tap | F33 | P2 / Roadmap |
| Notification bandit (rotate, demote repeats) | +0.5% DAU; +2.2% new-user Day-1 retention | S13 | Adapt | Rotating discreet, approved reminder messages | F32 | P1 |
| Friend streaks | Shared streak → 22% more likely to finish daily lesson (association) | S14 | Adapt (no shared loss) | Opt-in check-in buddy, sees only 'checked in' | F35 | P2 / Roadmap |
| High fives / milestone cheers | No data reported | S14 | Adopt | Milestone celebrations + owner one-tap high-five | F34 | P2 / Roadmap |
| Learning path | No data found | — | Adopt | Plan journey path | F36 | P1 |
| Daily goal setting | Reported as core of streak design | S12 | Adopt | Choose my check-in rhythm | F37 | P2 / Roadmap |
| Duo mascot | Brand recognition; guilt-trip meme tone | — | Adapt | Friendly companion that never sulks or declines (F23) | F23 | P2 / Roadmap |
| Leagues / leaderboards | Engagement claims; no health evidence | — | Reject | — | F38 | Cut |
| Gems, wagers with currency; streak reset to zero | Loss aversion | S15 | Reject | — | F39 | Cut |
| Guilt-trip / passive-aggressive notifications | Meme virality | — | Reject | — | F40 | Cut |
| Duolingo numbers are company-reported from a language-learning app (S13 is peer-reviewed). They show what keeps people coming back to an app, not medication adherence. Scored as Evidence = 2–3 accordingly. |  |  |  |  |  |  |

## 7. Connected apps and channels

Key idea: the care-team loop stays in KTx-CONNECT; reminders and check-ins go through whatever the family already uses.

| Rank | Channel | Who | Score | Tier | Developer access |
|---|---|---|---|---|---|
| 1 | Text messages (SMS) | Everyone | 81 | **Now** | Packet p.6 (reach everyone) |
| 2 | Cincinnati Children's MyChart (Epic) | Patients, caregivers | 80 | **Now** | Not verified — confirm with CCHMC IT |
| 3 | Epic in-chart worklist (staff) | Care team | 78 | **Now** | Not verified — confirm with CCHMC IT |
| 4 | Calendar invites (Google / Apple / Outlook) | Teens, young adults, caregivers | 77 | **Now** | Standard format (no partnership needed) |
| 5 | Phone reminders apps (Apple Reminders / Google Tasks) | Teens, young adults, caregivers | 73 | **Now** | Not verified — check developer access |
| 6 | Email | Caregivers, young adults | 72 | **Now** | Standard channel |
| 7 | Lock-screen widget / live update | Teens | 67 | **Next** | Not verified — check developer access |
| 8 | WhatsApp | Families who prefer it (e.g., Spanish- and Arabic-speaking) | 66 | **Next** | Not verified — check business messaging terms |
| 9 | Pharmacy apps (CVS, Walgreens, local) | Young adults, caregivers | 64 | **Next** | Not verified |
| 9 | Shared family calendars (Cozi, Google Family) | Caregivers, two-household families | 64 | **Next** | Not verified |
| 11 | Apple Health (Medications) | iPhone users | 63 | **Next** | Verified |
| 12 | Smartwatches (Apple Watch / Wear OS) | Teens, young adults | 59 | **Later** | Not verified |
| 13 | Phone location reminder ('when I get home') | Teens, young adults | 58 | **Later** | Design recommendation |
| 14 | Android Health Connect | Android users | 57 | **Later** | Verified |
| 15 | Kids' smartwatches (Garmin Bounce, Fitbit Ace, Gabb) | Kids under 10 (parent-managed) | 55 | **Later** | Not verified |
| 16 | Spotify / music apps | Teens | 51 | **Later** | Not verified |
| 18 | Family phone controls (Apple Family Sharing, Google Family Link) | Caregivers | 49 | **Later** | Not verified |
| 19 | Insurance / benefits apps | Young adults, caregivers | 48 | **Later** | Not verified |
| 20 | Oura | Oura ring owners | 47 | **Later** | Verified |
| 21 | CarPlay / Android Auto | Young adults who drive | 46 | **Later** | Not verified |
| 21 | Smart toothbrush apps (Oral-B, Philips Sonicare For Kids) | Kids, caregivers | 46 | **Later** | Not verified |
| 23 | Amazon Alexa | Families with Echo devices | 45 | **Later – compliance review** | Verified |
| 24 | Bedtime devices (Yoto, Tonies, sound machines) | Young kids | 35 | **Later** | Not verified |
|  | Ripple | TBD |  | **Needs info** | Open question |
| 17 | Discord / Snapchat | Teens 13+ | 50 | **Avoid** | Not verified |

### Channel details

#### Text messages (SMS) — Now

- **Can do:** Works on any phone, no app or data plan. Reply '1' = working, '2' = not working, '3' = need help.
- **Role in the loop:** Universal reminder and check-in channel; same answers as the app.
- **Can't do:** Short messages; needs an approved messaging vendor and opt-in consent in production.
- **Privacy:** Generic wording; no medicine names unless the patient opts in.
- **Without a smartphone:** Yes
- **Demo:** Show SMS check-in thread (simulated).

#### Cincinnati Children's MyChart (Epic) — Now

- **Can do:** Families already have it; supports secure messages and questionnaires.
- **Role in the loop:** Run the 14-item checklist and 2-week check-in inside a tool the clinic already trusts.
- **Can't do:** Requires hospital IT / Epic build; not something a hackathon team can connect live.
- **Privacy:** Inside the hospital's secure system; best privacy option.
- **Without a smartphone:** Web works on any computer
- **Demo:** Mock 'Sent via MyChart' label on the check-in.

#### Epic in-chart worklist (staff) — Now

- **Can do:** Coordinator works the list inside the health record she already uses.
- **Role in the loop:** Replaces 'another dashboard' with the worklist where staff already are.
- **Can't do:** Requires Epic integration and approval.
- **Privacy:** Inside the secure record.
- **Without a smartphone:** n/a (staff)
- **Demo:** Pitch as the production path; demo uses our worklist.

#### Calendar invites (Google / Apple / Outlook) — Now

- **Can do:** A standard calendar file (.ics) adds the check-in date and reminder to any calendar.
- **Role in the loop:** Next check-in appears as an ordinary event the patient already sees.
- **Can't do:** Calendar alert only; the answer still comes back through text, app or MyChart.
- **Privacy:** Neutral event title ('Check-in'); no medical detail.
- **Without a smartphone:** Works with most email/calendar accounts
- **Demo:** 'Add to my calendar' button on My plan.

#### Phone reminders apps (Apple Reminders / Google Tasks) — Now

- **Can do:** Our app (with permission) or the patient can add a repeating reminder in the phone's own reminders app.
- **Role in the loop:** Dose and check-in reminders in the place they already check.
- **Can't do:** Needs our app installed or a manual 'add' step; no reply path inside the reminder.
- **Privacy:** Neutral wording.
- **Without a smartphone:** No
- **Demo:** 'Add to Reminders' option (simulated).

#### Email — Now

- **Can do:** Works anywhere; good for longer content like the plan summary and next date.
- **Role in the loop:** Plan summary, check-in link, and next check-in date.
- **Can't do:** Easy to ignore; teens rarely read email; not ideal for urgent items.
- **Privacy:** Plain email isn't secure; use a link to MyChart or the app for details.
- **Without a smartphone:** Yes (any computer or library)
- **Demo:** Show 'Your plan summary' email (simulated).

#### Lock-screen widget / live update — Next

- **Can do:** One-tap check-in on the lock screen or home screen; very quick and discreet.
- **Role in the loop:** Fast 'Working / Not working / Need help' without opening an app.
- **Can't do:** Requires our own app installed.
- **Privacy:** Neutral label; no medicine names.
- **Without a smartphone:** No
- **Demo:** Mock widget on phone frame.

#### WhatsApp — Next

- **Can do:** Messages and voice notes; familiar to many immigrant families.
- **Role in the loop:** Same check-in as SMS in the family's preferred app; voice notes help low literacy.
- **Can't do:** Needs WhatsApp's business messaging service and clinic approval.
- **Privacy:** Meta platform; keep messages generic.
- **Without a smartphone:** Needs a smartphone
- **Demo:** Mention as option in channel picker.

#### Pharmacy apps (CVS, Walgreens, local) — Next

- **Can do:** Refill reminders and 'ready for pickup' alerts already exist in these apps.
- **Role in the loop:** Tackles 'ran out of medicine'; prompt the patient to turn on refill alerts.
- **Can't do:** Pharmacy apps generally don't offer open developer access; we can link, not integrate.
- **Privacy:** Data stays with the pharmacy.
- **Without a smartphone:** Some pharmacies offer text alerts
- **Demo:** 'Turn on refill alerts' tip in the ran-out plan.

#### Shared family calendars (Cozi, Google Family) — Next

- **Can do:** Both caregivers see the plan and check-in dates.
- **Role in the loop:** Supports kids who split time between homes.
- **Can't do:** Calendar only; answers come back elsewhere.
- **Privacy:** Share only dates and neutral titles; respect teen privacy.
- **Without a smartphone:** Web works
- **Demo:** Roadmap mention.

#### Apple Health (Medications) — Next

- **Can do:** iOS 26: with permission, read shared medications and whether doses were logged taken/skipped/snoozed.
- **Role in the loop:** Patients who already log in Apple Health don't log twice.
- **Can't do:** No sign we can create schedules/reminders there; logs are self-reported.
- **Privacy:** Per-medication permission chosen by the patient.
- **Without a smartphone:** No
- **Demo:** Simulated: Apple Health log feeds check-in.

#### Smartwatches (Apple Watch / Wear OS) — Later

- **Can do:** Wrist tap and quick reply.
- **Role in the loop:** Discreet reminder and one-tap check-in.
- **Can't do:** Requires our app plus a watch app.
- **Privacy:** Discreet by design.
- **Without a smartphone:** No
- **Demo:** Roadmap mention.

#### Phone location reminder ('when I get home') — Later

- **Can do:** Phone's built-in location reminders fire on arrival home.
- **Role in the loop:** 'When I get home' reminder.
- **Can't do:** Depends on phone OS.
- **Privacy:** Location stays on the device; opt-in.
- **Without a smartphone:** No
- **Demo:** Option in channel picker.

#### Android Health Connect — Later

- **Can do:** Sleep, steps and exercise data.
- **Role in the loop:** Timing context for reminders.
- **Can't do:** No medication-logging type comparable to Apple's found.
- **Privacy:** Opt-in per data type.
- **Without a smartphone:** No
- **Demo:** Roadmap only.

#### Kids' smartwatches (Garmin Bounce, Fitbit Ace, Gabb) — Later

- **Can do:** Parent-set buzz reminders; no social media.
- **Role in the loop:** Reminder for kids like Leo, managed by caregiver.
- **Can't do:** Vendor-specific; developer access unclear.
- **Privacy:** Parent-controlled.
- **Without a smartphone:** Needs the watch
- **Demo:** Roadmap mention.

#### Spotify / music apps — Later

- **Can do:** Routine cue: 'evening playlist after your check-in'.
- **Role in the loop:** Pairs check-in with a routine (habit stacking).
- **Can't do:** No reminder or reply path; link-out only.
- **Privacy:** No health data shared.
- **Without a smartphone:** No
- **Demo:** Roadmap mention.

#### Family phone controls (Apple Family Sharing, Google Family Link) — Later

- **Can do:** Structured parent settings that can loosen over time.
- **Role in the loop:** Gradual hand-off of responsibility from parent to teen.
- **Can't do:** Limited developer access; mostly a how-to tip.
- **Privacy:** Teen privacy concerns if used for monitoring.
- **Without a smartphone:** No
- **Demo:** Roadmap mention.

#### Insurance / benefits apps — Later

- **Can do:** Coverage and prior-authorization alerts.
- **Role in the loop:** Cost barrier support (social worker).
- **Can't do:** No developer access; link-out only.
- **Privacy:** Insurance data stays with insurer.
- **Without a smartphone:** Varies
- **Demo:** Roadmap mention.

#### Oura — Later

- **Can do:** Read-only sleep, sleep timing, activity, readiness; webhook on sync.
- **Role in the loop:** Bedtime-aware reminder timing (e.g., Jordan).
- **Can't do:** Read-only; can't send reminders to the ring or Oura app.
- **Privacy:** Opt-in; passive data raises monitoring-ethics questions.
- **Without a smartphone:** No
- **Demo:** Roadmap only.

#### CarPlay / Android Auto — Later

- **Can do:** 'Almost home — check-in when you park.'
- **Role in the loop:** Commute-time reminder.
- **Can't do:** Driving-safety rules limit what apps can show.
- **Privacy:** Spoken alerts only; neutral wording.
- **Without a smartphone:** No
- **Demo:** Roadmap mention.

#### Smart toothbrush apps (Oral-B, Philips Sonicare For Kids) — Later

- **Can do:** Routine app kids already open at brushing time.
- **Role in the loop:** 'Meds after brushing' cue from the packet's forgetting plan.
- **Can't do:** No known developer access for outside reminders.
- **Privacy:** No health data needed.
- **Without a smartphone:** Needs the toothbrush
- **Demo:** Mention as routine idea.

#### Amazon Alexa — Later – compliance review

- **Can do:** Recurring reminders with our label (patient permission).
- **Role in the loop:** Spoken reminder at home.
- **Can't do:** Can't ask 'Should I log that?' inside the reminder; HIPAA-eligible skills ended Dec 2022; no 'arrive home' trigger.
- **Privacy:** Generic wording; avoid collecting health info by voice.
- **Without a smartphone:** Needs an Echo
- **Demo:** Simulated Alexa conversation (labeled).

#### Bedtime devices (Yoto, Tonies, sound machines) — Later

- **Can do:** Part of the bedtime routine.
- **Role in the loop:** Evening-dose routine cue.
- **Can't do:** Unknown whether outside apps can add content.
- **Privacy:** No health data needed.
- **Without a smartphone:** Needs the device
- **Demo:** Roadmap mention.

#### Ripple — Needs info

- **Can do:** Unclear which product the team means (a 'Symptom Tracker: Ripple' app exists).
- **Role in the loop:** TBD
- **Can't do:** TBD
- **Privacy:** TBD
- **Without a smartphone:** TBD
- **Demo:** Confirm with the team.

#### Discord / Snapchat — Avoid

- **Can do:** Where many teens spend time.
- **Role in the loop:** —
- **Can't do:** Not built for health information; minimum age 13.
- **Privacy:** High privacy risk; not recommended.
- **Without a smartphone:** No
- **Demo:** Do not use.

## 8. Channel guardrails

1. **Generic wording by default ('Hey Maya, it's time for your evening check-in'); medicine names only if the patient opts in.** — Shared phones, speakers and family calendars can reveal a teen's medication.
2. **'When I get home' reminders use the phone's own location feature; location never leaves the device.** — Monitoring-ethics guidance (Rich et al. 2022).
3. **Every channel is opt-in and removable, with clear wording about what we read or send.** — Consent and autonomy.
4. **Answers from any channel are patient-reported, not verified adherence.** — The loop still routes 'not working' or 'need help' to a human.
5. **Details live in MyChart or the app; texts, emails, calendar entries carry only neutral text and a link.** — Text and email aren't secure for health details.
6. **Reminder content uses clinician-approved wording.** — Clinical content stays with the care team.
7. **Say 'ready to partner,' not 'partnered,' with any company.** — No partnerships exist; avoid misleading claims.
8. **Kids under 13: only caregiver-managed channels (kids' watches, caregiver texts, MyChart proxy).** — Platform age limits and child privacy rules.

## 9. Channel demo plan

- **1:** 'How should we reach you?' channel picker on My plan: Text, Email, MyChart, Calendar, Phone reminders (Now tier) plus 'More options' (Apple Health, WhatsApp, widgets, Alexa…). *(Simulated connections)*
- **2:** Maya picks Text + Calendar. Show an SMS check-in thread: 'Hey Maya, time for your evening check-in. Reply 1 working, 2 not working, 3 need help.' She replies 2 → 'Thanks for telling us. Jordan Lee will follow up. Next check-in: Nov 20.' *(Simulated SMS)*
- **3:** Leo's mom picks Email + MyChart: plan summary email with a MyChart link. *(Simulated email / MyChart)*
- **4:** Coordinator worklist shows Maya's update the same way regardless of channel. *(—)*
- **Pitch line:** Families use whatever already works for them; the care team sees one list. Production path: MyChart and the Epic worklist. *(—)*

## 10. Scoring method

**Features:** four 0–5 scores — Evidence 35%, Clinician input 25%, Packet alignment 30%, Problem severity 10% → impact 0–100. P0 if it is one of the six must-keep MAPS functions (alignment = 5) or impact ≥ 80; P1 ≥ 60; Cut if Evidence, Clinician or Alignment = 0 or impact < 35.

**Channels:** five 1–5 scores — Reach 30%, Clinic fit 25%, Feasibility 20%, Privacy safety 15%, Engagement 10% → score 0–100. Now ≥ 72, Next ≥ 60, otherwise Later; Avoid if excluded; compliance review if Privacy safety = 1.

Weights are editable in the spreadsheets' Scoring tabs.

## 11. Sources

### Feature workbook

| ID | Source | Location / DOI | Limitation |
|---|---|---|---|
| S01 | KTx-CONNECT (DEAP) Hackathon Builder Packet | docs/reference/KTx-CONNECT-DEAP-Builder-Packet.pdf | Highest authority for clinical rules in this project. |
| S02 | DEAP Technology One-Pager (Modi, Hooper, Varnell) | docs/reference/DEAP-one-pager.pdf | Reports 'nearly half' report a barrier; packet says ~1 in 3. Do not merge statistics. |
| S03 | Clinician Q&A with DEAP team (hackathon recording) | docs/source-review.md (summary of 'hackathon .docx') | Raw transcript not available when this sheet was built; scores rely on the team's written summary. Auto-transcribed: verify quotes before citing. |
| S04 | Pedia Tech implementation plan discussion | docs/source-review.md (summary of 'DEAP _ Implementation Plan Discussion.docx') | Brainstorming, not evidence. Used only to log where ideas came from. |
| S05 | Hooper et al. A Medication Adherence Promotion System to Reduce Late Kidney Allograft Rejection: A Quality Improvement Study | [link](https://doi.org/10.1053/j.ajkd.2021.06.021) | Single center, interrupted time series; evaluates the clinical bundle, not an app or any single component. |
| S06 | Varnell et al. 2017. Assessing barriers to adherence in routine clinical care for pediatric kidney transplant patients | [link](https://doi.org/10.1111/petr.13027) | Implementation evidence; not proof this prototype improves outcomes. |
| S07 | Varnell et al. 2023. The Barriers Assessment Tool — A Patient-Centered Measure of Adherence Barriers in Pediatric Kidney Transplantation | [link](https://doi.org/10.3390/children10091435) | Track patient and caregiver outcomes separately. |
| S08 | Varnell et al. 2021. Predicting acute rejection … by assessing barriers to taking medication | [link](https://doi.org/10.1007/s00467-021-04946-8) | Association in one cohort; not an individual prediction tool. |
| S09 | Rich et al. 2018. Predicting Health Care Utilization and Charges Using a Risk Score for Poor Adherence | [link](https://doi.org/10.1037/cpp0000233) | Supports showing individual chart flags, not a composite score. |
| S10 | Varnell et al. 2022. A Cost-effectiveness Analysis of Adherence Promotion Strategies | [link](https://doi.org/10.1053/j.ajkd.2021.12.013) | Model estimate for MAPS; not measured savings from this prototype. |
| S11 | Rich et al. 2022. Electronic Monitoring of Adherence in Clinical Care: Ethical and Practical Considerations | [link](https://doi.org/10.1037/cpp0000463) | Ethics guidance; informs privacy and monitoring features. |
| S12 | Duolingo blog: How streaks keep Duolingo learners committed to their language goals | [link](https://blog.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals/) | Company-reported; language learning, not health; not peer-reviewed. |
| S13 | Yancey & Settles 2020. A Sleeping, Recovering Bandit Algorithm for Optimizing Recurring Notifications (KDD) | [link](https://research.duolingo.com/papers/yancey.kdd20.pdf) | Language-learning app; small effects at huge scale; tests wording, not timing. |
| S14 | Duolingo blog: Friends and social features | [link](https://blog.duolingo.com/friends-social-features/) | Associations only; method not described; self-selection likely. |
| S15 | Mobbin: Streaks are about losing — a study of 859 streak designs | [link](https://mobbin.com/blog/streaks-are-about-losing-a-study-of-859-streak-designs) | Secondary source; numbers not independently verified. |
| S16 | Aguiar et al. 2025. An approach to boost adherence to self-data reporting in mHealth applications (BMC Med Inform Decis Mak) | [link](https://doi.org/10.1186/s12911-024-02833-4) | Adults without specific conditions; small pilot; self-reporting, not medication. |
| S17 | Peers for Promoting Adolescent Transplant Health (NCT01450033) | [link](https://clinicaltrials.gov/study/NCT01450033) | Results not reviewed for this workbook. |

### Connected apps

| ID | Source | Link |
|---|---|---|
| S1 | Apple WWDC25: Meet the HealthKit Medications API | [link](https://developer.apple.com/videos/play/wwdc2025/321/) |
| S2 | Walkthrough: WWDC 2025 HealthKit Medications API (DEV Community) | [link](https://dev.to/arshtechpro/wwdc-2025-meet-the-healthkit-medications-api-1d23) |
| S3 | Oura API v2 OpenAPI specification | [link](https://cloud.ouraring.com/v2/static/json/openapi-1.28.json) |
| S4 | Android Health Connect data types | [link](https://developer.android.com/health-and-fitness/health-connect/data-types) |
| S5 | Amazon Alexa Reminders API overview | [link](https://developer.amazon.com/docs/smapi/alexa-reminders-overview.html) |
| S6 | HIPAA Journal: Amazon ends support for third-party HIPAA-eligible Alexa skills | [link](https://www.hipaajournal.com/amazon-ends-support-for-third-party-hipaa-eligible-alexa-skills/) |
| S7 | DEAP one-pager: 'connecting instead to the communication tools patients already use' | docs/reference/DEAP-one-pager.pdf |
| S8 | KTx-CONNECT builder packet p.6: reach everyone (5th-grade reading, multiple languages, no new phone or unlimited data) | docs/reference/KTx-CONNECT-DEAP-Builder-Packet.pdf |

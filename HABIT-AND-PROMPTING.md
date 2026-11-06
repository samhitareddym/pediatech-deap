# Tend / Tomo: habit support and adaptive prompting

Research and demo proposal, November 6, 2026. Planning only; the existing application is unchanged. All example locations, events and dose times are simulated.

## Product hypothesis

Make the prescribed medication routine easier to start and immediately satisfying to finish. A chosen real-world cue starts the routine; Tomo provides a brief positive response, a useful dose record and occasional extra delight. Context-aware prompting is a backup. The outcome is taking medication as prescribed with less burden, rather than opening the app more often.

Intermittent reinforcement is a reasonable feature to test. It is not established as a durable transplant-adherence intervention. A dose-reporting habit and a medication-taking habit are different outcomes.

## What the supplied material establishes

- The builder packet requires structured barrier assessment, separate patient/caregiver voices, named ownership, a shared plan, a check-back within two weeks and chart-based risk signals. It explicitly rejects punitive streaks and replacing trained motivational interviewing with a chatbot.
- Hooper's MAPS interrupted time series found an adjusted 50% reduction in rejection incidence at one center. This supports the multicomponent care process; it does not validate our pet or reward mechanism.
- Varnell 2017 describes patient/caregiver differences in barriers. A motivation feature cannot resolve every problem: taste, side effects, privacy and access need their own plans.
- Varnell 2021 associates reported barriers with subsequent rejection risk. Reporting a difficulty should open a useful response, rather than cost someone their accumulated progress.
- Rich 2018 found that the combined risk score did not significantly predict the studied outcomes. Drug-level variation is a signal for review, not proof of nonadherence.
- Rich 2022 emphasizes combining imperfect adherence measures, discussing monitoring and caregiver contact beforehand, and having staff responsible for reviewing data. Even a pillbox opening does not prove ingestion.
- Varnell 2022 models MAPS cost-effectiveness. Its estimated savings are not measured savings for Tend or a budget already available for prizes.
- The clinician discussion notes explicitly suggest routine building, transition readiness and intermittent rewards, including donations or sponsored experiences. These are design leads, not study findings.

Original files are in `context/`; existing synthesis is in `FINDINGS.md`. Older project notes overgeneralize twice-daily tacrolimus to everyone: the software must use each patient's actual prescribed regimen, including once-daily formulations where prescribed. Existing statements that reminders should automatically taper also need qualification: any reduction should be agreed, monitored and reversible.

## Additional evidence

| Source | Finding and implication |
|---|---|
| [TAKE-IT, Foster et al., 2018](https://pubmed.ncbi.nlm.nih.gov/29602631/) | Randomized 169 kidney transplant recipients aged 11–24. Personalized problem solving, feedback and optional reminders improved electronically measured taking and timing adherence. Clinical outcome power was limited. Supports the combined routine-and-support approach, not a pet-specific claim. |
| [WIN2, Kimmel et al., 2016](https://pmc.ncbi.nlm.nih.gov/articles/PMC5093038/) | Four-arm randomized warfarin trial, 270 adults. Lottery incentives improved measured adherence without improving anticoagulation control; reminders improved anticoagulation control. This is adjacent evidence, not transplant or pediatric validation. |
| [Stawarz, Cox and Blandford, 2015](https://discovery.ucl.ac.uk/id/eprint/1468224/) | Four-week habit study found greater automaticity with event-based cues; its positive reinforcement was ineffective. Useful design evidence, but insufficient to conclude that clinical reminders should be removed. |
| [Praise-text pilot, 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC9560958/) | Randomized 35 liver transplant recipients aged 13–21. Some self-reported motivation/adherence outcomes improved, but medication-level variability did not. Praise is plausible; objective benefit remains uncertain. |
| [Habit-formation review, Singh et al., 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11641623/) | Twenty studies, 2,601 participants; formation time varied substantially, and only four studies reported duration directly. Avoid a promise that a habit forms in 21 days or a fixed number of successful doses. |
| [HCT qualitative study, Raab et al., 2026](https://formative.jmir.org/2026/1/e82356) | Twenty-eight patients/care partners discussed app preferences including rewards and games. Useful for co-design; not an adherence efficacy trial, and stem-cell transplantation differs from kidney transplantation. |

## What we can borrow from Duolingo

[Duolingo's published explanation](https://blog.duolingo.com/hi-its-duo-the-ai-behind-the-meme/) and [Yancey and Settles' KDD 2020 paper](https://research.duolingo.com/papers/yancey.kdd20.pdf) describe learning which notification templates work, including the effects of novelty and repetition. This establishes a public precedent for adaptive message selection. It does not establish that Duolingo tracks a person's journey home, or disclose its complete current system.

Describe ours as **Duolingo-inspired adaptive prompting**, with optional location context as our proposed extension. The demo uses explicit rules and simulated history, not a trained predictive model.

## The algorithm to explain

### Onboarding quiz: agree a practical routine before prompting

Use a short, non-scored conversation, with the patient and caregiver roles appropriate to the existing clinical process. Keep the established BAT intact; these routine questions complement it rather than replace it.

1. **What happens around your medicine time most days?** Choose an existing activity or describe one. The medication schedule comes from the clinical plan, not the quiz.
2. **Where are you, and is your medicine available there?** Home, school, work, two households or somewhere else. Check safe storage/access rather than recommending a new storage location automatically.
3. **What changes on weekends or days away?** Choose a backup cue that still fits the prescribed timing.
4. **What usually gets in the way?** Link the response to the existing barrier assessment and its named owner; do not assume every difficulty is forgetting.
5. **What kind of help would you like?** Discreet reminder, routine-based check-in, caregiver support or help from the team. Offer location as an optional enhancement, separately from core use.
6. **Does this plan fit your day?** Show one editable sentence: “After [cue], at [prescribed time], I take my medicine as prescribed. If my day changes, [agreed backup].” The patient confirms it.

Capture cue, typical setting, medicine availability, exceptions, backup, support preferences and confirmation. Do not infer ingestion or readiness for independence from quiz completion.

Dose reports retain the actual reported dose time separately from the app tap time. Occasionally ask “Did your planned cue help?” with “yes,” “used another cue,” and “need help.” If the patient chooses another cue, offer to update the plan. Avoid a questionnaire at every dose or passive tracking of unrelated activities. Missing context remains unknown. Compare the chosen cue and reported context over time; ask the patient before treating an apparent pattern as their routine.

### Decision sequence

1. **Learn the chosen routine.** Start with patient input, their prescribed schedule, preferred tone and a practical anchor. Recent dose reports can suggest a pattern; ask the patient to confirm it. A reliable cue must also fit medication timing and food instructions.
2. **Notice context.** Use time and routine by default. With specific opt-in, accept a recent coarse home-arrival event. Heading home is uncertain; do not assume it means the patient has medicine or can act now. Prefer derived events over storing raw travel trails.
3. **Apply fixed eligibility rules first.** Check the prescribed timing rules, dose status, permissions, quiet hours, prior prompts and possible driving. No activity means unknown, not missed. Clinical follow-up has its own team-approved pathway.
4. **Choose an action.** Send one approved prompt, wait for an eligible safer moment, stay quiet, or offer help. Personalize wording within those limits. Waiting must never silently move a dose beyond its prescribed plan.
5. **Give value and reinforcement.** An honest report creates a clear record. A brief Tomo reaction provides predictable satisfaction; occasional cosmetic variety adds surprise. Never imply that Tomo's health depends on compliance. No extra doses, extra taps, destructive streak resets or lost-prize messages.
6. **Learn again.** Record whether a prompt was followed by a report, whether the patient found it helpful and whether the routine is becoming easier. This association is not proof the prompt caused medication taking. In a future evaluated system, compare approved options and a no-prompt option where clinically appropriate. Optimize for dose timing, routine fit and burden, not notification opens.

Use no more than one routine nudge per dose opportunity as an initial demo rule, subject to clinical review. This cap is a proposed design choice, not a proven optimum. Required clinical outreach must remain separate.

## Demo narrative

Maya chooses an evening toothbrushing anchor that fits her prescribed schedule. At 7:52 pm a simulated home-arrival event occurs. The system checks that the evening dose is not reported, the time is eligible and no routine prompt was sent. It sends: “A little time for you and Tomo? Your evening routine is ready.” Inside the app, the medication action is explicit, alongside “not yet,” “missed,” “already taken” and “need help.” After her report, Tomo does a happy stretch and occasionally reveals a decoration.

Replay the same logic with a dose already reported: no prompt. With possible driving: defer the interactive prompt and recheck at a safe eligible moment. With location disabled: use the agreed schedule. With repeated difficulty: route a barrier and its context to a named human instead of increasing message pressure.

Suggested spoken explanation: “Tomo learns the routine you choose, notices an opportunity, checks whether a reminder is appropriate, then chooses to prompt, wait or stay quiet. Your feedback helps it fit your life better. The clinical schedule remains fixed.”

## Validation before claiming success

Compare the same barrier-support program with predictable feedback versus feedback plus occasional cosmetic surprises. Keep contact burden and reward value comparable. Measure timing/taking using multiple sources where feasible, patient-reported automaticity, honest barrier reporting, notification burden and staff work. Drug-level variability is contextual supporting evidence, not a reward criterion. Include follow-up after novelty or rewards reduce to test persistence. A short demo or pilot cannot establish reduced rejection.

Clinical decisions still needed: actual dose timing windows; handling missed/unknown doses; refill and access escalation; who sees what; who contacts the family and when; whether location provides enough benefit to justify collection. The 48-hour practice discussed in Rich 2022 is not a universal safe waiting period.

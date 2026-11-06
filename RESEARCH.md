# KTx-CONNECT (DEAP): research and open questions

Sources: the files in `context/` (the builder packet, the one-pager and screenshots 1-5) plus the web research linked at the bottom.

## The scenario in one paragraph

About 40% of teens and young adults with a kidney transplant miss doses of their anti-rejection medicine, and their transplants fail about 3 times as often as other age groups'. Cincinnati Children's built MAPS, a clinic loop that runs: 14-item barrier checklist → one plan per barrier with a named owner → check back within 2 weeks → durability check-ins → repeat every 6 months. MAPS cut late rejection roughly in half and saved about $9.1k per patient. But it runs on trained staff, and most missed doses happen at home, where the team can't see them. **The job:** keep the barrier → plan → follow-up loop running between visits and at centers that can't staff it, while keeping a human in the conversations that need one.

## What we must keep (a rough sketch with all six beats a polished one missing any)

1. Ask about barriers on a regular, structured schedule, using the 14-item BAT
2. Ask the patient and the caregiver separately. For patients 10 and older, a disagreement between them is a signal.
3. Give every barrier a named owner: coordinator, nephrologist/NP/pharmacist, social worker or psychologist
4. Agree one concrete plan per barrier (who, what, how, where, when), made *with* the patient
5. Close the loop: check back at 2 weeks (working, not working or adjust), then keep checking that it holds
6. Use risk signals already in the chart: tacrolimus swinging more than 2 SD across 4 draws, more than 4 months since the last visit, more than 6 weeks since the last labs

**Hard limit:** motivational interviewing needs a trained human. We can prepare that conversation and shorten it, but we can't replace it.

## Key problems

| # | Problem | Why it's hard |
|---|---|---|
| P1 | **Blind spot between visits.** Most missed doses happen at home, where nobody sees them. | Pillboxes were refused or broke for about 4 in 10 patients, and self-report drifts. |
| P2 | **Staff time.** Follow-up calls slip, and coordinators already get too many alerts. | Adding a dashboard makes it worse. The output has to be a short to-do list she trusts. |
| P3 | **Why would a teen open it a third time?** Week 1 is easy; month 6 is the test. | Reminders lose their effect as people get used to them (see research). Streaks shame. "Nagging" kills it. |
| P4 | **Teen privacy vs parent oversight**, and shifting responsibility over the years | Separate answers, separate views, and a gradual handoff, not one family account |
| P5 | **Routing hard barriers to a human fast.** Refusal, cost and mood can't be handled by self-help. | Self-help for forgetting, taste and swallowing; a human for the rest. Some centers have no psychologist. |
| P6 | **Reaching everyone:** 5th-grade reading level, English/Spanish/Arabic, no new phone, limited data | Rules out an app-only approach. SMS and the web are the floor. |
| P7 | **Measurement:** proving it works beyond "engagement" | Barriers resolved, follow-ups closed on time, steadier tacrolimus levels |

## What the existing demo already covers (screenshots)

A text message with a one-time link (72-hour expiry, no app, no account) → BAT barrier picker with free text → the patient previews strategies and flags which ones feel doable → those preferences land in the clinician portal before the visit. **That covers the pre-visit part well.** It's thin on the between-visit loop (steps 4-5), the caregiver/teen split, routing, and the coordinator's worklist.

## Research: medication-specific solutions

- **MAPS itself:** about a 50% drop in rejection in an interrupted time series at one center (an abstract says 45%), about $9k saved per patient, and early spread to 9 programs through the IROC collaborative. It's observational, not randomized.
- **Adolescent transplant apps mostly haven't proven themselves.** The Adhere4U RCT (Korea) showed no gain in adherence and poor sustained use. TransNephro (a case manager plus an app, Germany) showed no improvement, possibly because nonadherent patients opted out. Several US trials have no published results: Stanford paper vs app, Teen Pocket PATH (heart), and the Johns Hopkins mDOT video pilot (enrolled 1).
- **Johns Hopkins micro-randomized trial (NCT05613010, ends Nov 2026):** e-pillbox plus a supportive text *after a missed dose*, ages 13-25. It's the closest live analogue: responding to an event instead of sending a fixed daily nag.
- **Miloh 2009 (pediatric liver):** two-way texts confirming each dose cut tacrolimus SD from 3.46 to 1.37, **but 17 patients dropped out.**
- **TusenTac (Norway):** a med-manager app plus home finger-prick tacrolimus sampling was feasible, and 70% said their timing improved, but there was no lasting change in tacrolimus variability. Takeaway: it only works while people keep using it.
- **Commercial:** Medisafe (caregiver co-monitoring, AI voice agent), Wellth (pays rewards for adherence; reports +16% adherence, company-reported), smart caps and pillboxes (Pillsy, Hero). None are built for teens or around a barrier → plan loop. They are reminder engines.

## Research: reminders in general, and what has worked

- **Reminders help, modestly.** Meta-analyses: about 67% vs 55% adherence, pooled d≈0.29. Frequency and channel didn't clearly matter.
- **Reminders can block habits.** In Stawarz et al., people with reminders forgot less but never built automaticity. **Tying the dose to an existing routine** ("after I brush my teeth") built the habit, and that is already MAPS's "forgetting" plan. Design implication: reminders should taper off as the habit forms, not run forever.
- **People get used to them.** In an SMS weight-loss study the effect shrank as message count grew. Young women in Kenya reported "SMS fatigue" and privacy worries, and the PrEP SMS RCT showed no gain. EHR alert research: fatigue drops when you only fire when something is due and keep it short.
- **Weekly two-way check-ins beat daily one-way nags.** The Kenya HIV trials: weekly texts raised the share reaching 90% adherence by 13-16% (WelTel's weekly "how are you?" text escalated to a nurse call when someone said they had a problem or didn't reply). *The WelTel/daily-vs-weekly details are from my background knowledge; verify before quoting.* **This is close to MAPS's 2-week check-back done by text.**
- **Incentives work while they run, then fade.** Volpp's warfarin lottery cut out-of-range INRs from 35% to 12%, which bounced back to 42% after it stopped. In WIN2, the lottery improved adherence but not INR control, while plain reminders improved INR control.
- **Consumer patterns (Duolingo):** most people drop off in the first 7 days. A "streak freeze" (forgiveness for a missed day) reduced churn. Timing nudges to when you last opened the app beat user-set times. Changing the copy from "continue" to "commit to my goal" helped. **Warning:** streak loss-aversion is exactly the "streaks that punish a missed day" pattern the packet calls weak. Borrow the forgiveness, not the guilt.

### Patterns that seem to explain what works

1. **Two-way, not broadcast:** a reply is data, and silence is a signal
2. **Fewer, triggered messages:** fire on an event (a missed dose, a plan's 2-week mark, a tacrolimus swing) rather than a fixed daily schedule
3. **Habit over reminder:** anchor to a routine, then taper the reminders
4. **Forgiving, not shaming:** a recovery path after a miss
5. **A human behind the machine:** escalation is what made WelTel and MAPS work
6. **Lowest-friction channel:** SMS and links, with no install (the existing demo already does this)

## Defining questions (to answer before building)

**Scope and what we demo**
1. Which slice do we build in one day: patient/caregiver, coordinator worklist, or a thin slice of the whole loop? The packet rewards "rough but loop closed" over polish.
2. Do we build on the GraftWise demo's text + web link model, or deliberately try a different form factor?
3. Who are the judges, and how much weight do they give clinical fidelity vs consumer polish?

**The loop**
4. Between visits, what *is* the check-in? A weekly two-way text ("doses going OK? 👍 / 👎 / talk")? A re-ask of only the barriers that were flagged? Or a full BAT on a trigger?
5. What triggers an early repeat of the BAT: a tacrolimus swing, a missed refill, a 👎 reply, silence?
6. At the 2-week check-back, can the *patient* report "working / not working / adjust", so that only "not working" reaches a human?

**The coordinator**
7. What exactly is on the coordinator's Tuesday list, and what's the cap (5 names? 10?)? What gets her to trust it?
8. How do referrals carry the "why" (the barrier, the history, what's been tried) to the social worker or psychologist?

**Family and privacy**
9. What does the parent see versus the teen? Our proposal: the parent sees that a plan exists and whether it's on track, but not the teen's answers.
10. How does responsibility move from parent to teen? Age-based defaults, or the teen opts in step by step?
11. When the teen's and the caregiver's answers disagree, who sees it and what happens?

**Hard cases (the judges' questions)**
12. A 16-year-old taps "I refuse to take them": what happens in the next 24 hours, and who gets pinged?
13. At a center with no psychologist, where do barriers 12-14 route?
14. Why would someone still use it in month 6? Our current answer: it gets *quieter* as things go well, and only shows up when something changes.

**Access and constraints**
15. Do we prototype in Spanish and Arabic, or show that the architecture supports them?
16. Is sample data enough (the one-pager says yes), or do we mock EHR feeds such as tacrolimus levels?
17. What's our success metric slide: barriers resolved, follow-ups closed within 14 days, coordinator minutes saved, tacrolimus CV?

## Sources

- [MAPS AJKD 2022 (quality improvement study)](https://aminer.org/pub/610e64565244ab9dcb1f8e1c/a-medication-adherence-promotion-system-to-reduce-late-kidney-allograft-rejection-a) · [CCHMC: saves organs, funds](https://accomplishments.cincinnatichildrens.org/2022/nephrology/kidney-transplant-medication-adherence-program-saves-organs-funds) · [Cost-effectiveness](https://www.brightsurf.com/news/8X570PE1/adherence-promotion-programs-are-cost-effective-for-adolescent-kidney-transplant-recipients.html) · [IROC multicenter](https://atcmeetingabstracts.com/?p=25491)
- [NCT05613010 (JHU micro-randomized)](https://clinicaltrials.gov/study/NCT05613010) · [NCT03504137 (mDOT)](https://clinicaltrials.gov/study/NCT03504137) · [NCT02610946 (Stanford)](https://clinicaltrials.gov/study/NCT02610946) · [Teen Pocket PATH](https://bchcmg.tch.harvard.edu/clinical-trials/nct02904278) · [TransNephro results](https://cris.fau.de/publications/340384244)
- [Adhere4U RCT](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6830819/) · [Miloh texting (KevinMD)](https://www.kevinmd.com/2009/10/texting-young-liver-transplant-patients-medications.html) · [Medisafe (pharmacist article)](https://digitaleditions.sheridan.com/article/Adherence%E2%80%93It+Only+Takes+A+Minute/2276319/273988/article.html) · [Boston Children's NFC app](https://transplanttalk.childrenshospital.org/?p=384) · [Wellth funding](https://www.mobihealthnews.com/news/north-america/behavioral-economics-startup-wellth-lands-51m)
- [Reminder meta-analysis 2012](https://www.dovepress.com/the-effect-of-reminder-systems-on-patients39-adherence-to-treatment-peer-reviewed-fulltext-article-PPA) · [Electronic reminders meta-analysis](https://epistemonikos.org/fr/documents/6929983a6ebd56f26b25081cd671611d0251be61) · [Contextual cues vs reminders](https://doaj.org/article/e295012ca8ba4b9a83d33d8bd5772933)
- [SMS fatigue PrEP Kenya](https://pmc.ncbi.nlm.nih.gov/articles/PMC7589266) · [Weekly SMS HIV Kenya](https://www.aidsmap.com/news/jan-2011/weekly-text-messages-improve-hiv-drug-adherence-kenya) · [Clinical reminder fatigue](https://www.jabfm.org/content/28/3/351.abstract)
- [Volpp warfarin lottery](https://repository.upenn.edu/hcmg_papers/39) · [WIN2 trial](https://link.springer.com/doi/10.1007/s11606-014-2778-0)
- [Duolingo streaks (Lenny's)](https://lennysnewsletter.com/p/behind-the-product-duolingo-streaks) · [Streak freeze case study](https://jiwonvyoo.github.io/portfolio/case/duolingo/duo.html)

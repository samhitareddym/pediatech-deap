# Findings from the CCHMC papers

**Read:** all 6 papers added to `context/` on 2026-11-06. Two other files there were byte-identical duplicates and were removed (`Builder Packet (2).pdf`, `Varnell 2017 (1).pdf`).

**Purpose:** what's new, what **changes our design**, and what we still need to ask the CCHMC team. Read this before touching the demo again.

| Short name | Paper | What it is |
|---|---|---|
| **Hooper** | Hooper et al., *AJKD* (in press, 2021): MAPS outcomes | The main result: 50% fewer late rejections |
| **Varnell 17** | Varnell et al., *Ped Transplant* 2017 | How they got the BAT to run reliably in clinic |
| **Varnell 21** | Varnell et al., *Ped Nephrol* 2021 | Any barrier means 2.6× the risk of rejection |
| **Varnell 22** | Varnell et al., *AJKD* 2022 | Cost-effectiveness |
| **Rich 18** | Rich et al., *CPPP* 2018 | EHR risk score vs hospital use |
| **Rich 22** | Rich et al., *CPPP* 2022 | Ethics and practice of electronic monitoring |

---

## 🔴 Things that change our view

### 1. Tacrolimus is twice a day, 12 hours apart. Timing matters.
- Every patient in Varnell 17 was on a **twice-daily** immunosuppressant. Rich 22: tacrolimus "must be taken exactly 12 hr apart every day."
- Rich 22's case example, "Joe" (16): the **evening dose was missed 5× more often than the morning one** (an evening work shift). The fix was a **switch to once-daily extended-release tacrolimus**.
- **Our demo is wrong here:** "Water Fern" is one tap a day. → The pet needs **AM and PM doses with an on-time / late / missed window**. Showing which dose slips (AM vs PM) is the most useful pattern for the team. Simplifying the regimen (once-daily) is a real pharmacist lever and belongs on the pharm agent's menu.

### 2. Self-report misses a lot, and our pet taps *are* self-report.
- Joe and his mom **reported no barriers on two checklists in a row** while his levels were swinging. Both believed he was doing fine.
- Varnell 21: provider and self-report adherence "are often erroneous or inflated".
- Rich 22: a "perfect" pillbox log could be a family member opening it **just to silence the alarm**.
- **So:** a feed/water tap is not proof of a dose. We must **never present taps as adherence data on their own**. Pair them with objective signals (tacrolimus level swings, refill gaps, missed labs). A mismatch ("taps look perfect, levels say otherwise") is exactly the case that needs a **human conversation**, never an accusation.
- **New card type:** *"Levels swinging, no barriers reported."* That is Joe's story, and the most common hidden case.

### 3. Teens almost never say "I refuse". Parents do.
- Varnell 17: teens most often report forgetting, taste and side effects. **Caregivers** report "child refusal".
- Real example from the paper: the parent checked **"refuses to take her medication"**, while the teen checked **"hates the taste, hard to swallow pills, doesn't want others to know"**. To the parent it looked like defiance, but these are three *solvable* barriers.
- **Our demo step 10 (Maya taps "I don't want to take them") is unrealistic.** A truer and stronger story: **mom reports "refuses", Maya reports taste + privacy**, and the agent's card reframes "refusal" as solvable barriers. That's the strongest argument for asking teen and parent separately.

### 4. Teen and parent disagreeing is normal, not an alarm.
- Agreement between teen and parent answers was only "fair" (κ = 0.30). Parents see **external** barriers (swallowing, running out); teens see **internal** ones (embarrassment).
- **So:** disagreement is context on every card, *not* a reason to create a card. Otherwise nearly every family gets flagged.

### 5. Raw EHR risk flags are noisy. A list built straight from them would bury the coordinator.
- Rich 18: **78% of patients** failed at least one risk flag in a 90-day window. A tacrolimus SD > 2 was failed on **40% of patient-days**. The **combined 3-flag score did not predict outcomes**; only the tacrolimus SD (hospitalizations) and missed visits (ER visits) did on their own.
- Tacrolimus levels move with **timing, diet, other meds and diarrhea**, not just missed doses.
- **So:** the coordinator's list can't be "everyone with a flag". The agent must **rank and combine** (flag + barrier + dose pattern + what's already in progress), suppress patients who already have a plan running, and word cards neutrally: "levels are swinging; could be timing, food, illness or missed doses".
- Thresholds differ between sources: labs > 6 weeks (packet, Hooper) vs > 2 months (Rich 18). **They need to be configurable per center.**

### 6. A reported barrier is itself a risk signal, with a window of about 6 months.
- Varnell 21: **any reported barrier = 2.6× the risk of biopsy-proven rejection within 24 months**, after adjusting for age, sex and race. The median time to rejection was **175 days after the checklist**. Barriers were reported for 43% of patients (patients 43%, caregivers 34%).
- **So:** a positive barrier check should raise a patient's priority, and **"positive checklist with no plan within X days" is a core failure the agent watches for**. The 6-month window matches the re-check schedule.

### 7. Even at CCHMC, follow-through leaks.
- Hooper: barriers were found in **36 patients, but interventions were documented for only 29**, so about 1 in 5 had no recorded next step. The checklist reached 90% of eligible patients only with automation plus a **named nurse "champion" catching failures**. Person-dependent steps fell apart with **staff turnover** (Varnell 17).
- **So:** our biggest value is **catching what falls through**: a link never opened, a checklist half-done, a plan never made, a card ignored. That is what the packet means by "the loop is closed", and it's our measurable claim: *every positive barrier gets an owner and a plan within N days.*

### 8. Monitoring brings real ethical rules, and we have to decide them up front.
Rich 22 says to settle these **before** any monitoring starts, and to tell the family:
- **Who is contacted, and when.** CCHMC's consensus is to contact the family if immunosuppression is missed for **48 hours**. Coordinators call after **3 days** of no device activity.
- **Teens must be told up front** that their caregiver **may be contacted** if activity stops. This can strain the teen–parent relationship, so families should plan how they'll react (Joe's mom promised to *ask first, not assume*). **This directly limits our "teen privacy" promise**, and the app has to state its limits honestly at sign-up.
- **What goes into the medical record**, and who reviews it. Data sitting in the record that nobody reviews is a liability, so we shouldn't collect what nobody will look at.
- **Third-party data:** HIPAA business associate agreements, and no selling or reuse of the data.
- **How to stop:** a planned way to step down, back to a regular pillbox plus habits. This matches our "tapering".
- **Show trends to families**, like lab results: praise when it's going well. **Gray out tech-failure days**; don't count them as missed.
- **Equity:** only about 64% of adults earning under $30k own a smartphone. Kids split time between **two homes**, grandparents and sleepovers. Low health literacy and numeracy matter too.

### 9. Pillboxes: the full numbers
- Hooper: 28 offered → **21% refused, 21% technical problems, 57% used** (median about 400 days). A real failure from Rich 22: the family traveled and forgot the power cord.
- This supports the packet's "software-only" stance.

### 10. The business case has room to work with.
- Varnell 22: MAPS costs about **$140 per patient to start and about $180 per patient per year**, mostly staff time. It saved **$9,106 per patient** and added **0.32 QALYs**, and was cost-saving in 100% of simulations.
- A MAPS-like program remains cost-effective up to about **$1,880 per patient per year** (≈ $188k a year for a 100-patient program) or $2.5M to start. **Even a ~3–5% drop in rejection** keeps it cost-effective.
- **Pitch line:** we don't need to beat MAPS. We need to deliver MAPS-like effect at centers that can't staff it, for under about $1.9k per patient per year.

---

## 🟡 Useful details we didn't have

- **Clinic scale (CCHMC):** about 100–120 patients after transplant, 20–30 transplants a year, **3 transplant nurse coordinators**, 1 social worker, 1 psychologist, 1 pharmacist, 6 clinic locations, **12–18 transplant patients seen a week**. After year 1: clinic every 3 months, labs monthly. A weekly multidisciplinary pre-visit planning meeting.
  → About 35–40 patients per coordinator. Our "41 patients" sample is realistic.
- **The BAT:** under 60 seconds; given every 6 months to avoid **survey fatigue**; repeat early after a **new psychosocial stressor or change in family dynamics**. It can be read aloud as an interview for poor vision or non-readers. Patients over 10 with **developmental delay** have the caregiver answer only. **The BAT is not yet fully validated.**
- **Barrier frequency (Hooper):** 418 checklists; barriers in 36% of patients and on 28% of checklists. Most common: side effects 19.8%, taste 19.8%, forgetting 16.4%.
- **MAPS has 7 components, not 6:** it also includes **staff training** (two 60-minute sessions in nonjudgmental, problem-solving communication, with role-plays and scripts). → Our agent's card note could double as **in-the-moment coaching** for staff at centers without that training (e.g. a suggested opening line).
- **Psychology referrals include the parent's mental health** (depression, anxiety, ADHD in the patient *or parent*) and executive-function problems (→ neuropsychology testing).
- **The regimen is more than pills:** monthly labs and quarterly visits count too. Missed visits predicted more ER use (Rich 18).
- **Who's at risk:** patients with genetic kidney disease reported barriers more often; those with congenital urinary-tract conditions (CAKUT), whose families have adapted since birth, reported them half as often. Risk drops about 13% for each year after transplant.
- **The original MAPS design team included a former patient and a software engineer.** It's worth saying in the pitch that we'd do the same.

---

## Demo items now known to be wrong or weak

| Current demo | Problem | Change to plan for |
|---|---|---|
| One "Water Fern" tap a day | Tacrolimus is twice daily, 12 hours apart | AM + PM doses, on-time / late / missed |
| Maya taps "I don't want to take them" | Teens almost never report refusal | Mom reports "refuses", Maya reports taste + privacy → the card reframes it |
| A risk flag directly creates a card | Flags fire for 78% of patients | The agent ranks, combines and suppresses before creating a card |
| Mom sees only plan status, "Maya keeps her taps" | The 48-hour rule may contact the caregiver | State the limits at sign-up: "If no doses for 2 days, we'll check in with you first, then your mom" (order to be decided) |
| Taps shown as adherence | Self-report is unreliable | Taps are a conversation starter; levels and refills carry the weight |
| No failure catching | The real gap is follow-through (29 of 36) | Watch for "positive checklist, no plan", "link never opened", "card ignored" |

---

## Questions for the CCHMC team (hackathon morning)

1. **The 48-hour rule:** for a teen, who gets contacted first after 48 hours of no doses, the teen or the caregiver? Can the teen choose?
2. **Two homes, sleepovers:** how do they handle split households today? Two caregivers each with a link?
3. **What counts as "on time"** for a 12-hour tacrolimus dose? ±1 hour? ±2?
4. **Patients on once-daily extended-release tacrolimus:** what share are on it, and is switching common?
5. **What should go into the chart:** the barrier answers, the plans, the check-back results, and the dose taps?
6. **Without the BAT validated yet,** can we change the wording (teen voice, pet voice) or must it stay word-for-word?
7. **Which flags do they trust most** for the coordinator's list, given that so many patients trip the tacrolimus SD flag?
8. **The "champion" role:** who catches failures today, and could the agent take part of that job?
9. **Coordinator capacity:** how many follow-up calls a week is "too many" today?
10. **Equity:** what share of families have no smartphone or limited data? Is SMS-only acceptable?

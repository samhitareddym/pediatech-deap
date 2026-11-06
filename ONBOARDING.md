# Onboarding: the routine quiz

**Status:** draft for team feedback. It's built in the patient app (after naming your buddy); open `/` and tap through.
**Source:** [HABIT-AND-PROMPTING.md](HABIT-AND-PROMPTING.md) (agree a routine before prompting) and [FINDINGS.md](FINDINGS.md).

## Principles
1. **The team sets *how often*; the patient picks *when*.** The prescription fixes the frequency (e.g. twice a day, about 12 hours apart, or once a day for extended-release). The family chooses clock times that fit their life, and the team wants them kept consistent. So we ask when they take it now, then show the team's rule as a gentle guardrail ("These are 13.5 hours apart; your team usually wants about 12"). *(To confirm with clinicians: the on-time window, and how strict "the same way with food each day" is for tacrolimus.)*
2. **Quiz answers aren't scored or judged.** "No wrong answers"; nothing locks or unlocks.
3. **The quiz supplements the 14-item barrier check; it doesn't replace it.** Screen 4 maps to barrier-check items, so each answer still reaches its named owner.
4. **5th-grade words, the buddy's voice, one tap per answer.** Six short screens (when, time + cue, place, weekends, hard things, help), plus the plan at the end.
5. **Location is opt-in, separate, and off by default.**

## The screens

| # | The buddy asks | Answers (tap) | What we store | What it's for |
|---|---|---|---|---|
| 1 | When do you take your medicine right now? | **Times (pick any):** morning · midday · afternoon · evening · bedtime · **I don't really have a schedule right now**. **With food?** with a meal · without food · it changes | `when[]`, `food` | What the routine is today. "No schedule" is a normal answer, and the team gets told kindly |
| 2 | About what time, and what do you do right before? | Two time pickers, pre-filled from the screen-1 picks (one pick gets a partner 12 hours later; no schedule → 8 AM / 8 PM starter), shown under *"Your care team says: 2 times a day, about 12 hours apart"*. Then per dose: brush teeth · breakfast · get dressed · check phone · something else / dinner · brush teeth · shower · homework/games · get ready for bed · something else | `am`, `pm`, `amCue`, `pmCue` | Real dose times + the habit anchor ("after I brush my teeth…"), used in nudges and the plan |
| 2 | Where are you at medicine time on most days? | **At:** home · school · work · one of two homes · it changes. **Is your medicine there?** yes, always · sometimes · no | `where`, `access` | Access problems go to the team; we don't tell anyone where to store medicine |
| 3 | What changes on weekends or days away? | **Usually:** sleep in · sleepovers · sports/trips · my other home · not much. **Backup:** phone alarm · pocket pill case · text from someone I pick · take it with a meal | `away`, `backup` | The backup cue for days when the routine breaks |
| 4 | Does anything make it hard right now? (pick any) | forget · taste · hard to swallow · side effects · don't want others to know · too busy · run out · something else · **nothing right now** | `barriers[]` → barrier-check items 1, 2, 3, 4, 5, 12, 10 | Routes to the named owner (coordinator, social worker, psychology…) |
| 5 | How should [buddy] help you? (pick any) | quiet nudges that never say "medicine" · check in at my routine · let a parent help · help from my care team. **Optional:** nudge me when I get home? not now / yes | `help[]`, `location` | Prompt style and consent; caregiver role is opt-in |
| 6 | Here's our plan! Does it fit your day? | **That's my plan** · change · back | confirmed plan | *"After I [cue], at [time], I take my medicine. If my day changes, my backup is: [backup]."* |

**After the plan:** if medicine isn't always available, or any barrier was picked, the buddy says the team will help. Olive then explains, honestly, who sees the snack log and the 2-day check-in.

## Where the plan shows up later
- **Hunger banner:** "After you brush your teeth, SPRIG is ready for a snack!"
- **Buddy Book → My plan** shows both sentences and the backup.
- *(Planned)* Every few weeks: "Did your plan help?" yes / used another cue / need help → offer to update the plan.

## Not built yet / open for feedback
- **"Something else"** should let you type a short answer; right now it just falls back to "my morning routine".
- **Caregiver version** of the quiz for under-10s and parents (same screens, adult voice, separate answers).
- **Once-daily regimens:** show one time and one cue.
- **Spanish and Arabic**, plus read-aloud for non-readers.
- Should screen 4 offer the **full 14-item barrier check**, or keep this short list and run the full check every 6 months?
- **Length:** is 6 screens right for a 15-year-old? Candidates to cut: screen 3 or the location question.
- **Consent wording:** who sees what, and the 48-hour contact rule, needs clinician sign-off.

## Decision: Game vs Calm version
The user always chooses (style picker first, switchable in Help). No default from age or caregiver answers, per the clinician note that behavior matters more than age.

## Two onboarding flows (current build)
Both start at **How should Tend feel?** and share the same routine quiz content and data. They differ in voice, look and what comes after.

| Step | Calm (Tend × Oura, no game) | Game (room + rewards) |
|---|---|---|
| 1 | Welcome: "A quiet place for your routine." + choose look: **Light** (Tend × Oura blend), **Evening** (blend, dark pine), **Oura style** (cool dark) | Choose one of 8 companions, rename |
| 2 | Quiz, plain adult voice, serif questions ("When do you usually take your medicine?") | Same quiz, companion voice ("Hey! When do you take your meds right now?") |
| 3 | "Your routine. Does it fit your day?" | "Here's our plan!" |
| 4 | Today: scene header, check-in spotlight, weekly counts, one insight | Free starter piece → room |
| Nav | Today · Routine · Support (theme + switch version live in Support) | Edit · Shop · Play · Progress · Help |

Sensitive screens (what's hard, how to help) have **Skip for now** in both. Calm earns no visible rewards; tokens still accrue quietly in case someone switches to Game later.
Feedback wanted: question wording per voice, whether Calm needs the weekend screen, theme names.

## Update: start flow (latest)
1. **Sign in** with the patient portal (simulated single sign-on). Name and medicine times come from the portal.
2. **Where to?** Two rounded cards: **General** (default, Oura-style calm app) and **Check out my swag room** (game).
3. The theme (Light / Evening / Oura, default Oura) is one setting for both versions and carries over when switching. Theme, version, companion and sign-out all live in **Account**.

# Onboarding: the routine quiz

**Status:** draft for team feedback. It's built in the patient app (after naming your buddy); open `/` and tap through.
**Source:** [HABIT-AND-PROMPTING.md](HABIT-AND-PROMPTING.md) (agree a routine before prompting) and [FINDINGS.md](FINDINGS.md).

## Principles
1. **Medicine times are never asked.** They come from the care team's prescription and are shown read-only ("Medicine times from your care team"). Once-daily regimens show one time. *(The prototype currently assumes twice daily.)*
2. **Quiz answers aren't scored or judged.** "No wrong answers"; nothing locks or unlocks.
3. **The quiz supplements the 14-item barrier check; it doesn't replace it.** Screen 4 maps to barrier-check items, so each answer still reaches its named owner.
4. **5th-grade words, the buddy's voice, one tap per answer.** Six short screens, plus the plan at the end.
5. **Location is opt-in, separate, and off by default.**

## The screens

| # | The buddy asks | Answers (tap) | What we store | What it's for |
|---|---|---|---|---|
| 1 | What do you usually do around medicine time? *(the team's times shown above)* | **Morning:** brush teeth · breakfast · get dressed · check phone · something else. **Evening:** dinner · brush teeth · shower · homework/games · get ready for bed · something else | `amCue`, `pmCue` | The habit anchor ("after I brush my teeth…"); used in nudges and the plan |
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

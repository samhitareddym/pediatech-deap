# pediatech-deap · ReNu
CCHMC Hackathon: ReNu, a medication-routine app for teen kidney transplant patients plus a care-team portal.

## Quick start (see the newest version)

Needs [Git](https://git-scm.com) and [Node.js 20+](https://nodejs.org).

```bash
git clone https://github.com/samhitareddym/pediatech-deap.git
cd pediatech-deap
git checkout thomas/tend-demo
npm install --prefix app
npm run dev --prefix app -- --port 5179
```

Then open:

| Page | URL |
|------|-----|
| **Side-by-side demo** (patient app + clinician portal; keys 1/2/3 or arrows switch views) | http://localhost:5179/#demo |
| Patient app | http://localhost:5179/ |
| Clinician portal | http://localhost:5179/#clinician |
| Parent portal | http://localhost:5179/#parent |
| Two patients side by side | http://localhost:5179/#patients |

Already cloned? Get the latest with `git pull`, then rerun `npm install --prefix app` if dependencies changed. Page looks stale? Hard refresh (Ctrl+Shift+R). Demo stuck in an odd state? Press **Reset** on `#demo`.

Slide decks: open `presentation/slides/index.html`, `presentation/slides-v3-story/index.html` or `presentation/slides-v4-pitch/index.html` in a browser (arrow keys to move, `f` for fullscreen).

## Committing your changes

```bash
git checkout -b yourname/feature    # work on your own branch
git add path/to/changed-files       # add only what you touched
git commit -m "What you changed"
git pull --rebase origin thomas/tend-demo   # pick up teammates' work first
git push -u origin yourname/feature
```

Then open a pull request on GitHub into `thomas/tend-demo` (or `main`). Check the app still starts (`npm run dev --prefix app`) before pushing.

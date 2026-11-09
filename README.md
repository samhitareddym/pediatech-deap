# pediatech-deap
CCHMC Hackathon · Pedia Tech · **ReNew** (KTx-CONNECT / DEAP)

## Run the demo views locally

```bash
cd app
npm install      # first time only
npm run demo     # starts Vite and opens the hub at http://localhost:5173/#/
```

Each experience has its own URL, in the order of a kid growing up. Every view has a top bar with Prev / Next.

| # | View | URL | Who |
|---|---|---|---|
| – | Hub (start here) | http://localhost:5173/#/ | – |
| 1 | Kid app | http://localhost:5173/#/kid | Leo, 8, with Mom |
| 2 | Parent portal | http://localhost:5173/#/parent | Ana, Leo's mom |
| 3 | Teen app | http://localhost:5173/#/teen | Maya, 15 |
| 4 | Young adult | http://localhost:5173/#/young-adult | Jordan, 20 |
| 5 | Care team (clinician portal) | http://localhost:5173/#/care-team | Riley Chen, RN and team |

Older links still work: `#app` (teen app), `#parent`, `#patients` (Maya and Jordan side by side), `#clinician`.

**No npm?** Any static build works from a plain server: build with `npm run build` (or a prebuilt copy), then from the build folder run `python3 -m http.server 5180` and open http://localhost:5180/#/.

### Working vs. simulated

- **Working in the browser:** every screen, view switching, check-ins, schedule suggestions, pack reminders, rewards, Grow confirmations, clinician worklist and patient pages, Reset in each view.
- **Simulated:** identities and sign-in, calendar and pharmacy connections, connected apps and widgets, notifications, time, chart data, gift cards. All patients and data are fictional.

Details and demo scripts: [GUIDE.md](GUIDE.md) · clinician portal: [app/src/clinician/README.md](app/src/clinician/README.md)

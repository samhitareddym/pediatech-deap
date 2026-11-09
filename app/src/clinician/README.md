# Clinician layer

React + TypeScript clinician portal for the DEAP hackathon. It runs on demo data only and has no backend.
It is styled with the CCHMC design-system tokens from the team's Figma file. All styles are scoped under `.clin`, so nothing leaks into the patient (`pet/`) layer.

## Run it

```bash
cd app            # package.json lives here
npm install       # first time only
npm run dev
# open http://localhost:5173/clinician.html
```

`app/clinician.html` (next to `index.html`) is a second Vite entry page. Vite's dev server serves it with no config change.

### Include it in `npm run build`

Add the page to `vite.config.ts` so the production build outputs both apps:

```ts
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        clinician: resolve(__dirname, 'clinician.html'),
      },
    },
  },
})
```

### Or mount it inside the existing app

If the team prefers one page, render it from `app/src/App.tsx` behind a hash:

```tsx
import ClinicianApp from './clinician/ClinicianApp'

export default function App() {
  if (window.location.hash === '#clinician') return <ClinicianApp />
  // ...existing patient app
}
```

## Folder map

```
clinician/
  ClinicianApp.tsx      root: provider, app bar, page switch, modals, toast
  ClinicianProvider.tsx demo state (useState + structuredClone updates)
  context.ts            useClin() hook
  types.ts              Patient, Referral, Plan, BAT...
  data.ts               14 BAT barriers + owners, users, permissions, demo patients
  logic.ts              status rules, weekly worklist, dates, SMS text
  demo.ts               simulated patient-app events (swap for real data later)
  clinician.css         CCHMC tokens + components, scoped under .clin
  components/
    ui.tsx              Button, Chip, StatusPill, Alert, Indicator, Accordion, Switch, Modal, icons
    AppBar.tsx          App Bar + user profile popup (demo controls, sign out)
    Modals.tsx          check-back, plan, referral dialogs
    MedsPanel.tsx       prescriptions on a patient: dose, pharmacy, fills, run-out, dose changes, attachment
    RespondentChip.tsx
  pages/
    Login.tsx           simulated hospital SSO, role picker
    ThisWeek.tsx        coordinator's weekly to-do list
    Patients.tsx        Active Patients table
    PatientDetail.tsx   chart: MAPS loop, barriers, plans, risk, privacy
    Referrals.tsx       SW/psych inbox and coordinator's sent list
    Enroll.tsx          enroll + SMS preview (EN/ES/AR)
    Medications.tsx     every prescription, sorted by run-out date
    Reports.tsx
    Settings.tsx        center setup, role permissions, barrier routing
```

## Medications and refills

Each prescription stores the pharmacy fills (date, quantity, pharmacy) and the daily use (`perDay`).
The run-out date is `quantity / perDay` days after the last fill, so a dose change moves it automatically.
Refills due within 5 days, or already missed, show on the coordinator's weekly list and on the Medications page.
Sample prescriptions and doses are for the demo only.

## Connecting to the patient layer later

Patient-side events (a submitted BAT, a check-in) are faked in `demo.ts`. When the two layers share a store or API, replace those two functions. The data shapes they write are in `types.ts` (`Bat`, `CheckIn`).

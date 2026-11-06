import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import TendApp from './room/TendApp.tsx'
import PatientDays from './room/DayPlanner.tsx'
import ClinicianApp from './clinician/ClinicianApp'

// "/" = Tend patient app, "#patients" = two patients side by side, "#clinician" = Samhita's clinician portal.
function Root() {
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const on = () => setHash(location.hash)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return hash === '#clinician' ? <ClinicianApp /> : hash === '#patients' ? <PatientDays /> : <TendApp />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)

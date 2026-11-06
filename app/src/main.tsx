import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import TendApp from './room/TendApp.tsx'
import PatientDays from './room/DayPlanner.tsx'
import ClinicianApp from './clinician/ClinicianApp'
import ParentPortal from './room/ParentPortal.tsx'
import MayaStory from './room/MayaStory.tsx'
import DemoStage from './DemoStage.tsx'
import './demo-stage.css'

// inside the #demo frames: hide demo-only chrome
if (new URLSearchParams(location.search).has('embed')) document.documentElement.classList.add('embed')

// "/" = ReNu, "#patients" = side by side, "#clinician" = Samhita's clinician portal, "#parent" = parent portal, "#story" = Maya story, "#demo" = patient + clinician side by side for the laptop demo.
function Root() {
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const on = () => setHash(location.hash)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return hash === '#demo' ? <DemoStage /> : hash === '#clinician' ? <ClinicianApp /> : hash === '#patients' ? <PatientDays /> : hash === '#parent' ? <ParentPortal /> : hash === '#story' ? <MayaStory /> : <TendApp />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)

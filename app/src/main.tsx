import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import TendApp from './room/TendApp.tsx'
import PatientDays from './room/DayPlanner.tsx'
import ClinicianApp from './clinician/ClinicianApp'
import ParentPortal from './room/ParentPortal.tsx'
import MayaStory from './room/MayaStory.tsx'

// "/" = Tend, "#patients" = side by side, "#clinician" = Samhita's clinician portal, "#parent" = parent portal, "#story" = Maya story.
function Root() {
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const on = () => setHash(location.hash)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return hash === '#clinician' ? <ClinicianApp /> : hash === '#patients' ? <PatientDays /> : hash === '#parent' ? <ParentPortal /> : hash === '#story' ? <MayaStory /> : <TendApp />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)

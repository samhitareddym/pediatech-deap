import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import PetApp from './pet/PetApp.tsx'
import RoomApp from './room/RoomApp.tsx'
import ClinicianApp from './clinician/ClinicianApp'

// "/" = Tomo's room (newdes.md), "#pet" = pixel pet v1, "#demo" = 3-pane team demo.
function Root() {
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const on = () => setHash(location.hash)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return hash === '#clinician' ? <ClinicianApp /> : hash === '#demo' ? <App /> : <PetApp />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)

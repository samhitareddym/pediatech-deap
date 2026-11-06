import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import TendApp from './room/TendApp.tsx'
import PatientDays from './room/DayPlanner.tsx'
import ParentPortal from './room/ParentPortal.tsx'

// "/" = Tend, "#patients" = two patients side by side, "#parent" = parent portal for younger kids.
function Root() {
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const on = () => setHash(location.hash)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return hash === '#patients' ? <PatientDays /> : hash === '#parent' ? <ParentPortal /> : <TendApp />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)

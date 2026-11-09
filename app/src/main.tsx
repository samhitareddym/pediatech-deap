import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import TendApp from './room/TendApp.tsx'
import PatientDays from './room/DayPlanner.tsx'
import ParentPortal from './room/ParentPortal.tsx'
import ClinicianApp from './clinician/ClinicianApp'
import { DemoBar, Hub, KidView, YoungAdultView, VIEWS, type ViewId } from './views'

/* Demo views, one per experience (walk them in order, like a kid growing up):
   "#/" hub · "#/kid" · "#/parent" · "#/teen" · "#/young-adult" · "#/care-team".
   No hash = the hub. Older links still work: "#app" (teen app), "#parent", "#patients" (Maya and Jordan side by side), "#clinician". */
function Root() {
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const on = () => { setHash(location.hash); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const id = hash.startsWith('#/') ? hash.slice(2) : null
  const view = VIEWS.find((v) => v.id === id)?.id as ViewId | undefined
  useEffect(() => {
    document.body.classList.toggle('has-demo-bar', !!view)
    document.title = view ? `ReNew · ${VIEWS.find((v) => v.id === view)!.title}` : 'ReNew demo'
  }, [view])
  if (id !== null && !view) return <Hub />
  if (view) {
    const screen = view === 'kid' ? <KidView /> : view === 'parent' ? <ParentPortal /> : view === 'teen' ? <TendApp />
      : view === 'young-adult' ? <YoungAdultView /> : <ClinicianApp />
    return <><DemoBar id={view} />{screen}</>
  }
  return hash === '#patients' ? <PatientDays /> : hash === '#parent' ? <ParentPortal /> : hash === '#clinician' ? <ClinicianApp /> : hash === '#app' ? <TendApp /> : <Hub />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)

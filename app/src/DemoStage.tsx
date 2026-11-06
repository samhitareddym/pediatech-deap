import { useEffect, useRef, useState } from 'react'
import './demo-stage.css'

// Laptop demo: pick the patient app or the clinician portal and it fills the screen; toggle between them.
// Both frames stay mounted the whole time, so switching never loses either app's state.
const PHONE = { w: 430, h: 880 }
const PORTAL = { w: 1280, h: 800 }
type Mode = 'both' | 'patient' | 'clinician'
const ORDER: Mode[] = ['both', 'patient', 'clinician']

function Fit({ src, w, h, title, k }: { src: string; w: number; h: number; title: string; k: number }) {
  const box = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const el = box.current!
    const fit = () => setScale(Math.min(el.clientWidth / w, el.clientHeight / h))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [w, h])
  return (
    <div className="ds-fit" ref={box}>
      <iframe key={k} title={title} src={src} style={{ width: w, height: h, transform: `translateX(-50%) scale(${scale})` }} />
    </div>
  )
}

export default function DemoStage() {
  const [mode, setMode] = useState<Mode>('both')
  const [k, setK] = useState(0) // bump to reload both apps
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '1') setMode('both')
      else if (e.key === '2') setMode('patient')
      else if (e.key === '3') setMode('clinician')
      else if (e.key === 'ArrowRight') setMode((m) => ORDER[(ORDER.indexOf(m) + 1) % 3])
      else if (e.key === 'ArrowLeft') setMode((m) => ORDER[(ORDER.indexOf(m) + 2) % 3])
      else if (e.key === 'Escape') setMode('both')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  const reset = () => { try { Object.keys(localStorage).filter((x) => x.startsWith('tend')).forEach((x) => localStorage.removeItem(x)) } catch { /* ignore */ } setK(k + 1) }

  return (
    <main className={'ds mode-' + mode}>
      <header className="ds-top">
        <b className="ds-brand">ReNu</b>
        <div className="ds-toggle" role="tablist" aria-label="Demo view">
          {([['both', 'Both'], ['patient', 'Patient app'], ['clinician', 'Clinician portal']] as [Mode, string][]).map(([m, l], i) => (
            <button key={m} role="tab" aria-selected={mode === m} className={mode === m ? 'on' : ''} onClick={() => setMode(m)}>{l}<kbd>{i + 1}</kbd></button>
          ))}
        </div>
        <button className="ds-reset" onClick={reset}>Reset</button>
      </header>
      <section className="ds-grid">
        <div className="ds-pane ds-patient">
          <Fit k={k} title="ReNu patient app" src="/?embed=1&patient=Anna" w={PHONE.w} h={PHONE.h} />
          {mode === 'both' && <button className="ds-pick" onClick={() => setMode('patient')}><span>Patient app</span><small>Click to open full screen</small></button>}
        </div>
        <div className="ds-pane ds-portal">
          <Fit k={k} title="ReNu clinician portal" src="/?embed=1#clinician" w={PORTAL.w} h={PORTAL.h} />
          {mode === 'both' && <button className="ds-pick" onClick={() => setMode('clinician')}><span>Clinician portal</span><small>Click to open full screen</small></button>}
        </div>
      </section>
    </main>
  )
}

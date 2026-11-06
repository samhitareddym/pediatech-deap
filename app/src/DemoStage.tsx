import { useEffect, useRef, useState } from 'react'
import './demo-stage.css'

// Laptop demo: the live patient app and the live clinician portal side by side.
// Each runs in its own frame at its natural size and is scaled to fit, so both stay fully clickable.
const PHONE = { w: 430, h: 900 }
const PORTAL = { w: 1280, h: 820 }

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
      <iframe key={k} title={title} src={src} style={{ width: w, height: h, transform: `scale(${scale})` }} />
    </div>
  )
}

export default function DemoStage() {
  const [k, setK] = useState(0) // bump to reload both sides
  return (
    <main className="ds">
      <header className="ds-top">
        <b className="ds-brand">ReNu</b>
        <span>Live demo · patient and care team, side by side</span>
        <button onClick={() => { try { Object.keys(localStorage).filter((x) => x.startsWith('tend')).forEach((x) => localStorage.removeItem(x)) } catch { /* ignore */ } setK(k + 1) }}>Reset both</button>
      </header>
      <section className="ds-grid">
        <div className="ds-pane phone">
          <p className="ds-label"><i className="dot g" />Patient · Maya’s phone</p>
          <Fit k={k} title="ReNu patient app" src="/?embed=1" w={PHONE.w} h={PHONE.h} />
        </div>
        <div className="ds-pane portal">
          <p className="ds-label"><i className="dot b" />Care team · Clinician portal</p>
          <Fit k={k} title="ReNu clinician portal" src="/?embed=1#clinician" w={PORTAL.w} h={PORTAL.h} />
        </div>
      </section>
    </main>
  )
}

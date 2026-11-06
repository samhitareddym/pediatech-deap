// Patient app <-> clinician portal, demo only. Both read one localStorage key; the `storage` event
// carries changes between tabs/iframes on the same origin.
// ponytail: localStorage stands in for a backend; swap for a real API when the two layers share one.
import { useEffect, useState } from 'react'

export type Handoff = {
  report?: { at: number; name: string; bid: number; words: string }
  reply?: { at: number; by: string; text: string }
}
const KEY = 'tend-handoff'

export const readHandoff = (): Handoff => { try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') } catch { return {} } }

export function sendHandoff(patch: Handoff) {
  try { localStorage.setItem(KEY, JSON.stringify({ ...readHandoff(), ...patch })) } catch { /* private mode */ }
  window.dispatchEvent(new Event('handoff')) // storage events skip the tab that wrote
}

export function useHandoff(): Handoff {
  const [h, setH] = useState(readHandoff)
  useEffect(() => {
    const on = () => setH(readHandoff())
    window.addEventListener('storage', on); window.addEventListener('handoff', on)
    return () => { window.removeEventListener('storage', on); window.removeEventListener('handoff', on) }
  }, [])
  return h
}

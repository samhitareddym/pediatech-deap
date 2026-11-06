import type { ReactElement } from 'react'
import { companion, type Pose } from './companions'

// Gently isometric room. Floor diamond: back corner (200,170), right (380,260), front (200,350), left (20,260).
const K = '#2b2238'
const P = (u: number, v: number): [number, number] => [200 + 180 * u - 180 * v, 170 + 90 * u + 90 * v]
const UX = 0.894, UY = 0.447

export type Kind = 'floor' | 'rug' | 'wall'
export type Item = { id: string; name: string; kind: Kind; price: number; art: (st: Style) => ReactElement; shopOnly?: boolean; reward?: boolean }
export type Owned = { uid: string; item: string; slot: string | null }
export type StyleId = 'cozy' | 'night' | 'studio' | 'nature'
type Style = { name: string; wallL: string; wallR: string; floor: string; floor2: string; trim: string; accent: string; sky: string; fabric: string }

export const STYLES: Record<StyleId, Style> = {
  cozy: { name: 'Cozy', wallL: '#f3dcc6', wallR: '#ead0b7', floor: '#c99a6e', floor2: '#bb8b60', trim: '#fffaf0', accent: '#ff8fb5', sky: '#bfe8ff', fabric: '#7cc6c0' },
  night: { name: 'Night room', wallL: '#3d3a63', wallR: '#34315a', floor: '#5b4a6e', floor2: '#514163', trim: '#6a6496', accent: '#ffd166', sky: '#1d2340', fabric: '#8f7cc6' },
  studio: { name: 'Studio', wallL: '#f4f2ee', wallR: '#e7e4de', floor: '#b9b2a8', floor2: '#aea79c', trim: '#ffffff', accent: '#2b2238', sky: '#d6ecf5', fabric: '#ff8fb5' },
  nature: { name: 'Nature', wallL: '#dfe9d2', wallR: '#d2dfc3', floor: '#a88a64', floor2: '#9c7e58', trim: '#f6f9ef', accent: '#4f7a4a', sky: '#cfeee0', fabric: '#c9805a' },
}

/* ---------- drawing helpers ---------- */

const pt = (p: [number, number]) => p.join(',')
function box(w: number, d: number, h: number, top: string, left: string, right: string, lift = 0) {
  const U: [number, number] = [UX * w / 2, UY * w / 2]
  const V: [number, number] = [-UX * d / 2, UY * d / 2]
  const c = (su: number, sv: number, up: number): [number, number] => [su * U[0] + sv * V[0], su * U[1] + sv * V[1] - up - lift]
  const s = { stroke: K, strokeWidth: 2, strokeLinejoin: 'round' as const }
  return (
    <>
      <polygon points={[c(-1, 1, 0), c(1, 1, 0), c(1, 1, h), c(-1, 1, h)].map(pt).join(' ')} fill={left} {...s} />
      <polygon points={[c(1, -1, 0), c(1, 1, 0), c(1, 1, h), c(1, -1, h)].map(pt).join(' ')} fill={right} {...s} />
      <polygon points={[c(-1, -1, h), c(1, -1, h), c(1, 1, h), c(-1, 1, h)].map(pt).join(' ')} fill={top} {...s} />
    </>
  )
}
const at = (u: number, v: number, el: ReactElement) => <g transform={`translate(${UX * u - UX * v} ${UY * u + UY * v})`}>{el}</g>
const isoDisc = (r: number) => Array.from({ length: 28 }, (_, i) => { const t = (i / 28) * Math.PI * 2; return pt([UX * r * Math.cos(t) - UX * r * Math.sin(t), UY * r * Math.cos(t) + UY * r * Math.sin(t)]) }).join(' ')

/* ---------- catalog ---------- */

export const ITEMS: Item[] = [
  { id: 'chair', name: 'Armchair', kind: 'floor', price: 0, art: (st) => <>{at(0, -12, box(34, 8, 44, st.fabric, shade(st.fabric, -18), shade(st.fabric, -8), 0))}{box(34, 30, 14, shade(st.fabric, 10), shade(st.fabric, -18), shade(st.fabric, -8), 10)}<line x1="-14" y1="4" x2="-14" y2="-6" stroke={K} strokeWidth="2.4" /><line x1="14" y1="4" x2="14" y2="-6" stroke={K} strokeWidth="2.4" /></> },
  { id: 'rug', name: 'Round rug', kind: 'rug', price: 0, art: (st) => <><polygon points={isoDisc(52)} fill={st.accent} opacity=".85" stroke={K} strokeWidth="2" /><polygon points={isoDisc(36)} fill="none" stroke="#fff" strokeWidth="2.2" strokeDasharray="6 5" opacity=".8" /></> },
  { id: 'poster', name: 'Sunset poster', kind: 'wall', price: 20, art: () => <><rect x="-20" y="-30" width="40" height="54" rx="2" fill="#fffaf0" stroke={K} strokeWidth="2" /><rect x="-15" y="-25" width="30" height="44" fill="#ffd9a8" /><circle cx="0" cy="-6" r="8" fill="#ff8fb5" /><path d="M-15 19 L-5 6 L2 13 L9 4 L15 12 L15 19 Z" fill="#7cc6c0" /></> },
  { id: 'lamp', name: 'Floor lamp', kind: 'floor', price: 30, art: () => <><circle cx="0" cy="-78" r="38" fill="url(#glow)" /><ellipse cx="0" cy="0" rx="13" ry="6" fill="#4a4458" stroke={K} strokeWidth="2" /><line x1="0" y1="0" x2="0" y2="-68" stroke={K} strokeWidth="3" /><path d="M-15 -66 L15 -66 L10 -90 L-10 -90 Z" fill="#ffd166" stroke={K} strokeWidth="2" strokeLinejoin="round" /></> },
  { id: 'plant', name: 'Monstera', kind: 'floor', price: 40, art: () => <>{[[-14, -40, -30], [12, -44, 25], [-2, -58, 0], [-18, -26, -55], [18, -28, 50]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx="11" ry="18" transform={`rotate(${r} ${x} ${y})`} fill={i % 2 ? '#4f9e5a' : '#3f8a4c'} stroke={K} strokeWidth="2" />)}{box(24, 24, 22, '#5a3d2b', '#d9825b', '#c46f4b')}</> },
  { id: 'terrarium', name: 'Terrarium', kind: 'floor', price: 25, art: () => <>{box(28, 22, 22, 'rgba(200,236,240,.55)', 'rgba(180,225,232,.5)', 'rgba(160,212,222,.5)')}<ellipse cx="-2" cy="-14" rx="5" ry="8" fill="#6fbf5e" stroke={K} strokeWidth="1.6" /><ellipse cx="6" cy="-11" rx="4" ry="6" fill="#4f9e5a" stroke={K} strokeWidth="1.6" /></> },
  { id: 'shelf', name: 'Bookshelf', kind: 'floor', price: 50, art: () => <>{box(52, 18, 84, '#b98a5e', '#a4764c', '#8f6540')}{[20, 46, 70].map((y) => <polygon key={y} points={`-23,${-y + 1} 0,${-y + 12} 0,${-y + 15} -23,${-y + 4}`} fill="#6e4c30" />)}<rect x="-20" y="-40" width="5" height="14" fill="#ff8fb5" stroke={K} strokeWidth="1.4" transform="skewY(26)" /><rect x="-13" y="-38" width="5" height="12" fill="#7cc6c0" stroke={K} strokeWidth="1.4" transform="skewY(26)" /><circle cx="-10" cy="-66" r="5" fill="#ffd166" stroke={K} strokeWidth="1.4" /></> },
  { id: 'sofa', name: 'Sofa', kind: 'floor', price: 100, art: (st) => <>{at(0, -16, box(92, 10, 42, st.fabric, shade(st.fabric, -20), shade(st.fabric, -10)))}{box(92, 34, 18, shade(st.fabric, 12), shade(st.fabric, -20), shade(st.fabric, -10), 4)}{at(-44, 0, box(10, 36, 30, st.fabric, shade(st.fabric, -20), shade(st.fabric, -10)))}{at(44, 0, box(10, 36, 30, st.fabric, shade(st.fabric, -20), shade(st.fabric, -10)))}</> },
  { id: 'rug-stripe', name: 'Striped rug', kind: 'rug', price: 60, art: () => <>{[0, 1, 2, 3, 4].map((i) => { const a = -50 + i * 20; return <polygon key={i} points={[[a, -40], [a + 20, -40], [a + 20, 40], [a, 40]].map(([u, v]) => pt([UX * u - UX * v, UY * u + UY * v])).join(' ')} fill={i % 2 ? '#fffaf0' : '#7cc6c0'} stroke={K} strokeWidth="1.6" /> })}</> },
  { id: 'frame', name: 'Abstract print', kind: 'wall', price: 20, art: () => <><rect x="-24" y="-20" width="48" height="36" rx="2" fill="#2b2238" /><rect x="-20" y="-16" width="40" height="28" fill="#fffaf0" /><circle cx="-8" cy="-2" r="8" fill="#ffd166" /><rect x="2" y="-10" width="12" height="18" fill="#ff8fb5" /></> },
  { id: 'bookends', name: 'Fox bookends', kind: 'floor', price: 0, reward: true, art: () => <>{box(14, 12, 18, '#c4612f', '#a8501f', '#93451a')}{at(16, 0, box(6, 12, 22, '#ff8fb5', '#e0779a', '#c96789'))}{at(24, 0, box(6, 12, 20, '#7cc6c0', '#62aaa4', '#4f9e98'))}</> },
]
export const item = (id: string) => ITEMS.find((i) => i.id === id)!

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16)
  const f = (c: number) => Math.max(0, Math.min(255, c + amt))
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`
}

/* ---------- slots ---------- */

export type Slot = { id: string; kind: Kind; label: string; x: number; y: number }
const s = (id: string, kind: Kind, label: string, [x, y]: [number, number]): Slot => ({ id, kind, label, x, y })
export const SLOTS: Slot[] = [
  s('corner', 'floor', 'Back corner', P(0.14, 0.14)),
  s('window', 'floor', 'Under the window', P(0.55, 0.12)),
  s('wall-side', 'floor', 'Along the wall', P(0.12, 0.6)),
  s('front-l', 'floor', 'Front left', P(0.4, 0.84)),
  s('front-r', 'floor', 'Front right', P(0.86, 0.46)),
  s('rug', 'rug', 'Middle of the floor', P(0.5, 0.5)),
  // wall slots are in screen space on the left wall
  s('wall-1', 'wall', 'Left wall', [70, 160]),
  s('wall-2', 'wall', 'Left wall, near corner', [150, 120]),
]

/* where each companion likes to be, in order */
const PREFS: Record<string, string[]> = {
  miso: ['sofa', 'chair'], moss: ['plant', 'terrarium'], orbit: ['lamp', 'shelf'], pip: ['sofa', 'bookends'],
  nori: ['rug-stripe', 'rug', 'sofa'], luma: ['lamp'], rook: ['shelf', 'bookends', 'frame'], sol: ['plant', 'sofa'],
}
const DOING: Record<string, string> = {
  sofa: 'is stretched across the sofa', chair: 'is curled up in the armchair', plant: 'is inspecting the monstera', terrarium: 'is resting by the terrarium',
  lamp: 'is sitting in the lamp light', shelf: 'is studying the bookshelf', bookends: 'is rearranging the bookends', rug: 'is lounging on the rug',
  'rug-stripe': 'is lounging on the striped rug', frame: 'is studying the print',
}

export function companionSpot(cid: string, owned: Owned[]) {
  const placed = owned.filter((o) => o.slot)
  for (const want of PREFS[cid] ?? []) {
    const o = placed.find((p) => p.item === want)
    if (!o) continue
    const sl = SLOTS.find((x) => x.id === o.slot)!
    const it = item(want)
    const pose: Pose = want === 'sofa' || want === 'chair' ? 'rest' : it.kind === 'rug' ? 'rest' : 'inspect'
    const lift = want === 'sofa' ? 22 : want === 'chair' ? 22 : 0
    const dx = it.kind === 'floor' && lift === 0 ? 34 : 0
    const y = it.kind === 'wall' ? 300 : sl.y - lift + (it.kind === 'floor' && lift === 0 ? 14 : 0)
    return { x: it.kind === 'wall' ? 110 : sl.x + dx, y, pose, doing: DOING[want] }
  }
  const [x, y] = P(0.5, 0.5)
  return { x, y, pose: 'idle' as Pose, doing: 'is wandering around the room' }
}

/* ---------- room ---------- */

export function Room({ style, owned, cid, ghost, targets, onSlot, onCompanion }: {
  style: StyleId; owned: Owned[]; cid: string
  ghost?: { item: string; slot: string } | null
  targets?: { slot: string; busy: boolean }[]
  onSlot?: (slot: string) => void; onCompanion?: () => void
}) {
  const st = STYLES[style]
  const placed = owned.filter((o) => o.slot && o.slot !== ghost?.slot)
  const all = [...placed.map((o) => ({ item: o.item, slot: o.slot!, ghost: false })), ...(ghost ? [{ ...ghost, ghost: true }] : [])]
  const bySlot = (k: Kind) => all.filter((a) => item(a.item).kind === k)
  const spot = companionSpot(cid, placed)
  const c = companion(cid)
  const floorThings = [
    ...bySlot('floor').map((a) => ({ y: SLOTS.find((x) => x.id === a.slot)!.y, el: <Placed key={a.slot} a={a} st={st} /> })),
    { y: spot.y + 0.5, el: <g key="me" className="room-comp" transform={`translate(${spot.x - 34} ${spot.y - 66}) scale(.58)`} onClick={onCompanion}><g className={'comp pose-' + spot.pose}>{c.art()}</g></g> },
  ].sort((a, b) => a.y - b.y)

  return (
    <svg viewBox="0 0 400 370" className="room" role="img" aria-label={`Your room. ${c.name} ${spot.doing}.`}>
      <defs>
        <radialGradient id="glow"><stop offset="0" stopColor="#ffe9a8" stopOpacity=".75" /><stop offset="1" stopColor="#ffe9a8" stopOpacity="0" /></radialGradient>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={st.sky} /><stop offset="1" stopColor="#fff" stopOpacity=".7" /></linearGradient>
      </defs>
      {/* walls */}
      <polygon points="20,260 200,170 200,20 20,110" fill={st.wallL} stroke={K} strokeWidth="2.5" strokeLinejoin="round" />
      <polygon points="200,170 380,260 380,110 200,20" fill={st.wallR} stroke={K} strokeWidth="2.5" strokeLinejoin="round" />
      <g transform="matrix(1 .5 0 1 0 0)">
        <rect x="236" y="-52" width="76" height="70" rx="4" fill="url(#sky)" stroke={K} strokeWidth="2.5" />
        {style === 'night' ? <circle cx="292" cy="-34" r="7" fill="#fff6d6" /> : <circle cx="290" cy="-34" r="9" fill="#ffd166" opacity=".9" />}
        <line x1="274" y1="-52" x2="274" y2="18" stroke={K} strokeWidth="2.5" />
        <line x1="236" y1="-17" x2="312" y2="-17" stroke={K} strokeWidth="2.5" />
        <rect x="230" y="18" width="88" height="6" fill={st.trim} stroke={K} strokeWidth="2" />
      </g>
      {/* floor */}
      <polygon points="200,170 380,260 200,350 20,260" fill={st.floor} stroke={K} strokeWidth="2.5" strokeLinejoin="round" />
      {[0.2, 0.4, 0.6, 0.8].map((t) => <line key={t} x1={P(t, 0)[0]} y1={P(t, 0)[1]} x2={P(t, 1)[0]} y2={P(t, 1)[1]} stroke={st.floor2} strokeWidth="2" />)}
      <polyline points="20,260 200,170 380,260" fill="none" stroke={st.trim} strokeWidth="4" />
      <polyline points="20,260 200,170 380,260" fill="none" stroke={K} strokeWidth="1.5" transform="translate(0 -3)" />

      {/* wall art */}
      {bySlot('wall').map((a) => {
        const sl = SLOTS.find((x) => x.id === a.slot)!
        return <g key={a.slot} className={a.ghost ? 'ghost' : ''} transform={`translate(${sl.x} ${sl.y}) skewY(-26.57)`}>{item(a.item).art(st)}</g>
      })}
      {/* rugs under everything */}
      {bySlot('rug').map((a) => <Placed key={a.slot} a={a} st={st} />)}
      {floorThings.map((f) => f.el)}

      {/* placement targets */}
      {targets?.map((t) => {
        const sl = SLOTS.find((x) => x.id === t.slot)!
        return (
          <g key={t.slot} className={'target' + (t.busy ? ' busy' : '')} onClick={() => onSlot?.(t.slot)} role="button" aria-label={`${sl.label}${t.busy ? ' (swap)' : ''}`}>
            {sl.kind === 'wall'
              ? <rect x="-26" y="-34" width="52" height="60" rx="6" transform={`translate(${sl.x} ${sl.y}) skewY(-26.57)`} />
              : <polygon points={isoDisc(sl.kind === 'rug' ? 44 : 22).split(' ').map((p) => p.split(',').map(Number)).map(([x, y]) => `${x + sl.x},${y + sl.y}`).join(' ')} />}
          </g>
        )
      })}
    </svg>
  )
}

function Placed({ a, st }: { a: { item: string; slot: string; ghost: boolean }; st: Style }) {
  const sl = SLOTS.find((x) => x.id === a.slot)!
  return <g className={a.ghost ? 'ghost' : 'placed'} transform={`translate(${sl.x} ${sl.y})`}>{item(a.item).art(st)}</g>
}

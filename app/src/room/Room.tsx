import { useRef, type ReactElement, type PointerEvent as PE } from 'react'
import { companion, type Pose } from './companions'

// Isometric room on a floating slab: crisp vector illustration (pixel filter removed for a defined look),
// with pointer hit-testing on the real shapes for drag and drop.
const K = '#2b2238'
const TW = 45, TH = 22.5, H = 150, SLAB = 22, M = 16
const UX = 0.894, UY = 0.447

export type Kind = 'floor' | 'rug' | 'wall'
export type Item = { id: string; name: string; kind: Kind; price: number; tint?: string; art: (tint: string) => ReactElement; reward?: boolean }
// u,v = floor position in tiles (wall items: u = position along the wall, h = height, side = which wall)
export type Owned = { uid: string; item: string; on: boolean; u: number; v: number; side?: 'L' | 'R'; h?: number; flip?: boolean; tint?: string }

export const TINTS = ['#7cc6c0', '#ff8fb5', '#ffd166', '#8f7cc6', '#ff9f5a', '#6fbf5e', '#5b8def', '#2b2238', '#f4f1ea']
export const WALLS = ['#f3dcc6', '#dfe9d2', '#d6e4f5', '#f6d6e0', '#ffe7a8', '#f4f2ee', '#3d3a63']
export const FLOORS = ['#c99a6e', '#8bd474', '#b9b2a8', '#e8d29a', '#7cc6c0', '#5b4a6e']

/* ---------- drawing helpers ---------- */
const pt = (p: number[]) => p.join(',')
function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16)
  const f = (c: number) => Math.max(0, Math.min(255, c + amt))
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`
}
function box(w: number, d: number, h: number, c: string, lift = 0) {
  const U: [number, number] = [UX * w / 2, UY * w / 2], V: [number, number] = [-UX * d / 2, UY * d / 2]
  const p = (su: number, sv: number, up: number): [number, number] => [su * U[0] + sv * V[0], su * U[1] + sv * V[1] - up - lift]
  const s = { stroke: K, strokeWidth: 2, strokeLinejoin: 'round' as const }
  return <>
    <polygon points={[p(-1, 1, 0), p(1, 1, 0), p(1, 1, h), p(-1, 1, h)].map(pt).join(' ')} fill={shade(c, -28)} {...s} />
    <polygon points={[p(1, -1, 0), p(1, 1, 0), p(1, 1, h), p(1, -1, h)].map(pt).join(' ')} fill={shade(c, -12)} {...s} />
    <polygon points={[p(-1, -1, h), p(1, -1, h), p(1, 1, h), p(-1, 1, h)].map(pt).join(' ')} fill={shade(c, 14)} {...s} />
  </>
}
const at = (u: number, v: number, el: ReactElement) => <g transform={`translate(${UX * u - UX * v} ${UY * u + UY * v})`}>{el}</g>
const isoDisc = (r: number) => Array.from({ length: 28 }, (_, i) => { const t = (i / 28) * Math.PI * 2; return pt([UX * r * (Math.cos(t) - Math.sin(t)), UY * r * (Math.cos(t) + Math.sin(t))]) }).join(' ')

/* ---------- catalog (tint = the recolorable part) ---------- */
export const ITEMS: Item[] = [
  { id: 'chair', name: 'Armchair', kind: 'floor', price: 15, tint: '#7cc6c0', art: (t) => <>{at(0, -12, box(34, 8, 44, t))}{box(34, 30, 14, t, 10)}<line x1="-14" y1="4" x2="-14" y2="-6" stroke={K} strokeWidth="2.4" /><line x1="14" y1="4" x2="14" y2="-6" stroke={K} strokeWidth="2.4" /></> },
  { id: 'rug', name: 'Round rug', kind: 'rug', price: 20, tint: '#ff8fb5', art: (t) => <><polygon points={isoDisc(52)} fill={t} stroke={K} strokeWidth="2" /><polygon points={isoDisc(36)} fill="none" stroke="#fff" strokeWidth="2.2" strokeDasharray="6 5" opacity=".8" /></> },
  { id: 'window', name: 'Window', kind: 'wall', price: 25, tint: '#bfe8ff', art: (t) => <><rect x="-34" y="-32" width="68" height="62" rx="3" fill={t} stroke={K} strokeWidth="2.5" /><circle cx="16" cy="-16" r="8" fill="#ffd166" /><line x1="0" y1="-32" x2="0" y2="30" stroke={K} strokeWidth="2.5" /><line x1="-34" y1="0" x2="34" y2="0" stroke={K} strokeWidth="2.5" /><rect x="-38" y="30" width="76" height="6" fill="#fffaf0" stroke={K} strokeWidth="2" /></> },
  { id: 'poster', name: 'Sunset poster', kind: 'wall', price: 20, tint: '#ffd9a8', art: (t) => <><rect x="-20" y="-28" width="40" height="54" rx="2" fill="#fffaf0" stroke={K} strokeWidth="2" /><rect x="-15" y="-23" width="30" height="44" fill={t} /><circle cx="0" cy="-4" r="8" fill="#ff8fb5" /><path d="M-15 21 L-5 8 L2 15 L9 6 L15 14 L15 21 Z" fill="#7cc6c0" /></> },
  { id: 'frame', name: 'Abstract print', kind: 'wall', price: 20, tint: '#ffd166', art: (t) => <><rect x="-24" y="-18" width="48" height="36" rx="2" fill={K} /><rect x="-20" y="-14" width="40" height="28" fill="#fffaf0" /><circle cx="-8" cy="0" r="8" fill={t} /><rect x="2" y="-8" width="12" height="18" fill="#ff8fb5" /></> },
  { id: 'neon', name: 'Neon sign', kind: 'wall', price: 45, tint: '#ff8fb5', art: (t) => <><rect x="-30" y="-16" width="60" height="32" rx="6" fill="#2b2238" stroke={K} strokeWidth="2" /><path d="M-20 4 C -14 -10, -6 -10, 0 2 C 6 -10, 14 -10, 20 4" fill="none" stroke={t} strokeWidth="4" strokeLinecap="round" /><circle cx="0" cy="8" r="3" fill={t} /></> },
  { id: 'clock', name: 'Wall clock', kind: 'wall', price: 15, tint: '#fffaf0', art: (t) => <><circle r="14" fill={t} stroke={K} strokeWidth="2.5" /><path d="M0 0 L0 -9 M0 0 L6 3" stroke={K} strokeWidth="2.2" strokeLinecap="round" /></> },
  { id: 'lamp', name: 'Floor lamp', kind: 'floor', price: 30, tint: '#ffd166', art: (t) => <><circle cx="0" cy="-78" r="38" fill="url(#glow)" /><ellipse cx="0" cy="0" rx="13" ry="6" fill="#4a4458" stroke={K} strokeWidth="2" /><line x1="0" y1="0" x2="0" y2="-68" stroke={K} strokeWidth="3" /><path d="M-15 -66 L15 -66 L10 -90 L-10 -90 Z" fill={t} stroke={K} strokeWidth="2" strokeLinejoin="round" /></> },
  { id: 'plant', name: 'Monstera', kind: 'floor', price: 40, tint: '#d9825b', art: (t) => <>{[[-14, -40, -30], [12, -44, 25], [-2, -58, 0], [-18, -26, -55], [18, -28, 50]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx="11" ry="18" transform={`rotate(${r} ${x} ${y})`} fill={i % 2 ? '#4f9e5a' : '#3f8a4c'} stroke={K} strokeWidth="2" />)}{box(24, 24, 22, t)}</> },
  { id: 'terrarium', name: 'Terrarium', kind: 'floor', price: 25, tint: '#bfe6ec', art: (t) => <>{box(28, 22, 22, t)}<ellipse cx="-2" cy="-14" rx="5" ry="8" fill="#6fbf5e" stroke={K} strokeWidth="1.6" /><ellipse cx="6" cy="-11" rx="4" ry="6" fill="#4f9e5a" stroke={K} strokeWidth="1.6" /></> },
  { id: 'shelf', name: 'Bookshelf', kind: 'floor', price: 50, tint: '#b98a5e', art: (t) => <>{box(52, 18, 84, t)}{[20, 46, 70].map((y) => <polygon key={y} points={`-23,${-y + 1} 0,${-y + 12} 0,${-y + 15} -23,${-y + 4}`} fill="#6e4c30" />)}<circle cx="-10" cy="-66" r="5" fill="#ffd166" stroke={K} strokeWidth="1.4" /></> },
  { id: 'desk', name: 'Gaming desk', kind: 'floor', price: 70, tint: '#e07a5f', art: (t) => <>{box(70, 34, 30, t)}{at(-6, -6, <><rect x="-16" y="-62" width="32" height="24" rx="2" fill="#2b2238" stroke={K} strokeWidth="2" /><rect x="-12" y="-58" width="24" height="16" fill="#7cc6c0" /><line x1="0" y1="-38" x2="0" y2="-30" stroke={K} strokeWidth="3" /></>)}</> },
  { id: 'bed', name: 'Bed', kind: 'floor', price: 90, tint: '#8f7cc6', art: (t) => <>{at(0, -26, box(56, 8, 44, '#b98a5e'))}{box(56, 72, 20, t, 4)}{at(0, -18, box(44, 16, 8, '#fffaf0', 24))}</> },
  { id: 'beanbag', name: 'Beanbag', kind: 'floor', price: 35, tint: '#ff9f5a', art: (t) => <><ellipse cx="0" cy="-12" rx="26" ry="16" fill={t} stroke={K} strokeWidth="2" /><ellipse cx="-6" cy="-18" rx="12" ry="6" fill={shade(t, 30)} /></> },
  { id: 'petbed', name: 'Cozy pet bed', kind: 'floor', price: 30, tint: '#ff8fb5', art: (t) => <><ellipse cx="0" cy="-6" rx="26" ry="13" fill={t} stroke={K} strokeWidth="2" /><ellipse cx="0" cy="-8" rx="18" ry="8" fill={shade(t, 40)} stroke={K} strokeWidth="1.6" /></> },
  { id: 'sofa', name: 'Sofa', kind: 'floor', price: 100, tint: '#7cc6c0', art: (t) => <>{at(0, -16, box(92, 10, 42, t))}{box(92, 34, 18, t, 4)}{at(-44, 0, box(10, 36, 30, t))}{at(44, 0, box(10, 36, 30, t))}</> },
  { id: 'rug-stripe', name: 'Striped rug', kind: 'rug', price: 60, tint: '#7cc6c0', art: (t) => <>{[0, 1, 2, 3, 4].map((i) => { const a = -50 + i * 20; return <polygon key={i} points={[[a, -40], [a + 20, -40], [a + 20, 40], [a, 40]].map(([u, v]) => pt([UX * u - UX * v, UY * u + UY * v])).join(' ')} fill={i % 2 ? '#fffaf0' : t} stroke={K} strokeWidth="1.6" /> })}</> },
  { id: 'bookends', name: 'Fox bookends', kind: 'floor', price: 0, reward: true, tint: '#c4612f', art: (t) => <>{box(14, 12, 18, t)}{at(16, 0, box(6, 12, 22, '#ff8fb5'))}{at(24, 0, box(6, 12, 20, '#7cc6c0'))}</> },
]
export const item = (id: string) => ITEMS.find((i) => i.id === id)!

/* ---------- geometry ---------- */
export const geom = (n: number) => {
  const OX = M + n * TW, OY = M + H
  const P = (u: number, v: number): [number, number] => [OX + (u - v) * TW, OY + (u + v) * TH]
  return { OX, OY, P, w: 2 * (M + n * TW), h: OY + 2 * n * TH + SLAB + M }
}
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x))
const snap = (x: number) => Math.round(x * 4) / 4

/* where each companion likes to be */
const PREFS: Record<string, string[]> = {
  miso: ['sofa', 'bed', 'chair'], moss: ['plant', 'terrarium'], orbit: ['desk', 'lamp', 'shelf'], pip: ['beanbag', 'sofa', 'bookends'],
  nori: ['petbed', 'rug-stripe', 'rug'], luma: ['lamp', 'neon'], rook: ['shelf', 'bookends', 'frame'], sol: ['plant', 'beanbag', 'sofa'],
}
const DOING: Record<string, string> = {
  sofa: 'is stretched across the sofa', bed: 'is napping on the bed', chair: 'is curled up in the armchair', plant: 'is inspecting the monstera',
  terrarium: 'is resting by the terrarium', lamp: 'is sitting in the lamp light', shelf: 'is studying the bookshelf', bookends: 'is rearranging the bookends',
  rug: 'is lounging on the rug', 'rug-stripe': 'is lounging on the striped rug', frame: 'is studying the print', desk: 'is tinkering at the desk',
  beanbag: 'has sunk into the beanbag', petbed: 'is curled up in the pet bed', neon: 'is staring at the neon glow',
}
export function companionSpot(cid: string, owned: Owned[], n: number) {
  for (const want of PREFS[cid] ?? []) {
    const o = owned.find((p) => p.on && p.item === want)
    if (!o) continue
    const k = item(want).kind
    const sit = ['sofa', 'bed', 'chair', 'beanbag', 'petbed'].includes(want)
    const u = k === 'wall' ? (o.side === 'L' ? 0.9 : o.u) : sit ? o.u : clamp(o.u + 0.7, 0.4, n - 0.4)
    const v = k === 'wall' ? (o.side === 'L' ? o.u : 0.9) : sit ? o.v : clamp(o.v + 0.4, 0.4, n - 0.4)
    return { u, v, lift: sit ? 20 : 0, pose: (sit || k === 'rug' ? 'rest' : 'inspect') as Pose, doing: DOING[want] }
  }
  return { u: n / 2, v: n / 2, lift: 0, pose: 'idle' as Pose, doing: 'is wandering around the room' }
}

/* ---------- room ---------- */
export function Room({ n, wall, floor, owned, cid, editing, selected, onSelect, onMove, onCompanion, onExpand }: {
  n: number; wall: string; floor: string; owned: Owned[]; cid: string
  editing?: boolean; selected?: string | null
  onSelect?: (uid: string | null) => void; onMove?: (uid: string, p: Partial<Owned>) => void
  onCompanion?: () => void; onExpand?: () => void
}) {
  const g = geom(n)
  const { P, OX } = g
  const svg = useRef<SVGSVGElement>(null)
  const drag = useRef<{ uid: string; du: number; dv: number; dh: number } | null>(null)
  const on = owned.filter((o) => o.on)
  const spot = companionSpot(cid, on, n)
  const c = companion(cid)

  const toSvg = (e: PE) => {
    const m = svg.current!.getScreenCTM()!.inverse()
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m)
    return [p.x, p.y]
  }
  const floorUV = (x: number, y: number) => { const a = (x - OX) / TW, b = (y - g.OY) / TH; return [(a + b) / 2, (b - a) / 2] }
  const down = (e: PE, o: Owned) => {
    if (!editing) return
    e.stopPropagation(); e.preventDefault()
    onSelect?.(o.uid)
    const [x, y] = toSvg(e)
    if (item(o.item).kind === 'wall') drag.current = { uid: o.uid, du: 0, dv: 0, dh: 0 }
    else { const [u, v] = floorUV(x, y); drag.current = { uid: o.uid, du: o.u - u, dv: o.v - v, dh: 0 } }
    svg.current!.setPointerCapture(e.pointerId)
  }
  const move = (e: PE) => {
    const d = drag.current
    if (!d) return
    const o = owned.find((x) => x.uid === d.uid)!
    const [x, y] = toSvg(e)
    if (item(o.item).kind === 'wall') {
      const side: 'L' | 'R' = x < OX ? 'L' : 'R'
      const t = clamp(snap(Math.abs(x - OX) / TW), 0.6, n - 0.6)
      const base = side === 'L' ? P(0, t)[1] : P(t, 0)[1]
      onMove?.(d.uid, { side, u: t, h: clamp(Math.round(base - y), 40, H - 30) })
    } else {
      const [u, v] = floorUV(x, y)
      onMove?.(d.uid, { u: clamp(snap(u + d.du), 0.3, n - 0.3), v: clamp(snap(v + d.dv), 0.3, n - 0.3) })
    }
  }
  const end = () => { drag.current = null }

  const wallEls = on.filter((o) => item(o.item).kind === 'wall').map((o) => {
    const [x, y] = o.side === 'L' ? P(0, o.u) : P(o.u, 0)
    return (
      <g key={o.uid} className={'thing' + (selected === o.uid ? ' sel' : '')} transform={`translate(${x} ${y - (o.h ?? 80)}) skewY(${o.side === 'L' ? -26.57 : 26.57})`}
        onPointerDown={(e) => down(e, o)}>{item(o.item).art(o.tint ?? item(o.item).tint!)}</g>
    )
  })
  const rugEls = on.filter((o) => item(o.item).kind === 'rug').map((o) => {
    const [x, y] = P(o.u, o.v)
    return <g key={o.uid} className={'thing' + (selected === o.uid ? ' sel' : '')} transform={`translate(${x} ${y})`} onPointerDown={(e) => down(e, o)}>{item(o.item).art(o.tint ?? item(o.item).tint!)}</g>
  })
  const floorEls = [
    ...on.filter((o) => item(o.item).kind === 'floor').map((o) => {
      const [x, y] = P(o.u, o.v)
      return { z: o.u + o.v, el: <g key={o.uid} className={'thing' + (selected === o.uid ? ' sel' : '')} transform={`translate(${x} ${y}) scale(${o.flip ? -1 : 1} 1)`} onPointerDown={(e) => down(e, o)}>{item(o.item).art(o.tint ?? item(o.item).tint!)}</g> }
    }),
    { z: spot.u + spot.v + 0.01, el: (() => { const [x, y] = P(spot.u, spot.v); return <g key="me" className="room-comp" transform={`translate(${x - 34} ${y - 66 - spot.lift}) scale(.58)`} onClick={onCompanion}><g className={'comp pose-' + spot.pose}>{c.art()}</g></g> })() },
  ].sort((a, b) => a.z - b.z)

  const [b0, r0, f0, l0] = [P(0, 0), P(n, 0), P(n, n), P(0, n)]
  const down2 = (p: [number, number]): [number, number] => [p[0], p[1] + SLAB]
  return (
    <svg ref={svg} viewBox={`0 0 ${g.w} ${g.h}`} className={'room' + (editing ? ' editing' : '')} role="img" aria-label={`Your room. ${c.name} ${spot.doing}.`}
      onPointerMove={move} onPointerUp={end} onPointerCancel={end} onPointerDown={() => editing && onSelect?.(null)}>
      <defs>
        <radialGradient id="glow"><stop offset="0" stopColor="#ffe9a8" stopOpacity=".75" /><stop offset="1" stopColor="#ffe9a8" stopOpacity="0" /></radialGradient>
      </defs>
      <g>
        {/* floating slab */}
        <polygon points={[l0, f0, down2(f0), down2(l0)].map(pt).join(' ')} fill="#7d8aa6" stroke={K} strokeWidth="2.5" />
        <polygon points={[f0, r0, down2(r0), down2(f0)].map(pt).join(' ')} fill="#5f6b88" stroke={K} strokeWidth="2.5" />
        <polygon points={[l0, f0, r0].map(pt).join(' ')} fill="none" stroke="#9fd38a" strokeWidth="6" />
        {/* walls */}
        <polygon points={[l0, b0, [b0[0], b0[1] - H], [l0[0], l0[1] - H]].map(pt).join(' ')} fill={wall} stroke={K} strokeWidth="2.5" strokeLinejoin="round" />
        <polygon points={[b0, r0, [r0[0], r0[1] - H], [b0[0], b0[1] - H]].map(pt).join(' ')} fill={shade(wall, -14)} stroke={K} strokeWidth="2.5" strokeLinejoin="round" />
        {/* floor + tile seams */}
        <polygon points={[b0, r0, f0, l0].map(pt).join(' ')} fill={floor} stroke={K} strokeWidth="2.5" strokeLinejoin="round" />
        {Array.from({ length: n - 1 }, (_, i) => i + 1).map((i) => <g key={i} stroke={shade(floor, -16)} strokeWidth="2"><line x1={P(i, 0)[0]} y1={P(i, 0)[1]} x2={P(i, n)[0]} y2={P(i, n)[1]} /><line x1={P(0, i)[0]} y1={P(0, i)[1]} x2={P(n, i)[0]} y2={P(n, i)[1]} /></g>)}
        <polyline points={[l0, b0, r0].map(pt).join(' ')} fill="none" stroke="#fffaf0" strokeWidth="4" />
        {wallEls}
        {rugEls}
        {floorEls.map((f) => f.el)}
      </g>
      {onExpand && (
        <g className="expand" onClick={onExpand} role="button" aria-label="Add more room">
          {[[(l0[0] + f0[0]) / 2, (l0[1] + f0[1]) / 2 + SLAB / 2], [(f0[0] + r0[0]) / 2, (f0[1] + r0[1]) / 2 + SLAB / 2]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}><rect x="-11" y="-11" width="22" height="22" rx="5" fill="#fffaf0" stroke={K} strokeWidth="2.5" /><path d="M-5 0 H5 M0 -5 V5" stroke={K} strokeWidth="3" strokeLinecap="round" /></g>
          ))}
        </g>
      )}
    </svg>
  )
}

export function ItemThumb({ id, tint }: { id: string; tint?: string }) {
  const it = item(id)
  return (
    <svg viewBox={it.kind === 'wall' ? '-40 -40 80 80' : it.kind === 'rug' ? '-60 -40 120 80' : '-60 -112 120 128'} className="thumb" aria-hidden="true">
      <defs><radialGradient id="glow"><stop offset="0" stopColor="#ffe9a8" stopOpacity=".6" /><stop offset="1" stopColor="#ffe9a8" stopOpacity="0" /></radialGradient></defs>
      {it.art(tint ?? it.tint!)}
    </svg>
  )
}

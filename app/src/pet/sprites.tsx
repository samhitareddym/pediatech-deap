import type { ReactElement } from 'react'

// Original pixel buddies, generated from a few shape rules so they share one cute style.
// Each sprite is an 18x18 grid of palette keys; outlines are added automatically.

export type Mood = 'happy' | 'joy' | 'sleepy' | 'eat'

type Pal = { b: string; d: string; h: string; a: string }
export type Species = {
  id: string
  name: string
  kind: string
  blurb: string
  pal: Pal
  feature: (put: (x: number, y: number, c: string) => void) => void
  beak?: boolean
}

const W = 18
const disc = (put: (x: number, y: number, c: string) => void, cx: number, cy: number, r: number, c: string) => {
  for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) put(x, y, c)
}
const mirror = (put: (x: number, y: number, c: string) => void, pts: [number, number][], c: string) =>
  pts.forEach(([x, y]) => { put(x, y, c); put(17 - x, y, c) })

export const SPECIES: Species[] = [
  {
    id: 'mochi', name: 'MOCHI', kind: 'Bun buddy', blurb: 'Soft, sleepy and always up for a snack.',
    pal: { b: '#ffc9dc', d: '#f293b6', h: '#fff2f7', a: '#ff8fb5' },
    feature: (put) => {
      for (let y = 1; y < 8; y++) { put(5, y, 'b'); put(6, y, 'b'); put(11, y, 'b'); put(12, y, 'b') }
      for (let y = 2; y < 7; y++) { put(6, y, 'a'); put(11, y, 'a') }
    },
  },
  {
    id: 'sprig', name: 'SPRIG', kind: 'Sprout buddy', blurb: 'Grows a little every day you take care of it.',
    pal: { b: '#b4e597', d: '#76c45f', h: '#e9f9dc', a: '#4c9b3a' },
    feature: (put) => {
      put(9, 5, 's'); put(9, 6, 's'); put(8, 6, 's')
      ;[[6, 3], [7, 3], [7, 4], [8, 4], [8, 5], [5, 2]].forEach(([x, y]) => put(x, y, 'a'))
      ;[[10, 2], [11, 2], [10, 3], [11, 3], [12, 3], [10, 4], [12, 1]].forEach(([x, y]) => put(x, y, 'a'))
    },
  },
  {
    id: 'puff', name: 'PUFF', kind: 'Cloud buddy', blurb: 'Floaty and gentle. Hums when it is happy.',
    pal: { b: '#f6f3ff', d: '#cbc3ef', h: '#ffffff', a: '#ffc96b' },
    feature: (put) => {
      ;[[5, 8.2], [9, 6.4], [13, 8.2], [7, 7], [11, 7], [3.6, 10.5], [14.4, 10.5]].forEach(([x, y]) => disc(put, x, y, 1.9, 'b'))
      mirror(put, [[4, 6], [5, 5]], 'a')
    },
  },
  {
    id: 'nori', name: 'NORI', kind: 'Splash buddy', blurb: 'Loves puddles, bubbles and big drinks of water.',
    pal: { b: '#97d8f6', d: '#5fa9da', h: '#e2f6ff', a: '#ff9db4' },
    feature: (put) => mirror(put, [[2, 7], [3, 8], [1, 10], [2, 10], [3, 10], [2, 13], [3, 12]], 'a'),
  },
  {
    id: 'bramble', name: 'BRAMBLE', kind: 'Spiky buddy', blurb: 'Prickly on the outside, a big softie inside.',
    pal: { b: '#e6c49d', d: '#c49a6c', h: '#fbeedd', a: '#8a5a3c' },
    feature: (put) => {
      for (let x = 3; x <= 14; x += 2) { put(x, 7, 'a'); put(x, 6, 'a'); put(x + 1, 7, 'a') }
      ;[[2, 9], [1, 10], [16, 9], [17, 10], [5, 5], [9, 4], [13, 5]].forEach(([x, y]) => put(x, y, 'a'))
    },
  },
  {
    id: 'sol', name: 'SOL', kind: 'Sunny buddy', blurb: 'Wakes up early and cheers everyone on.',
    pal: { b: '#ffe27a', d: '#f4bf3a', h: '#fff7cf', a: '#ff9f1c' },
    feature: (put) => {
      ;[[9, 5], [8, 4], [10, 4], [9, 3], [11, 3]].forEach(([x, y]) => put(x, y, 'a'))
      mirror(put, [[2, 12], [2, 13], [3, 13]], 'd')
    },
    beak: true,
  },
  {
    id: 'kip', name: 'KIP', kind: 'Hoppy buddy', blurb: 'Bounces everywhere. Never sits still.',
    pal: { b: '#8fdc95', d: '#58b464', h: '#dcf7de', a: '#3f8f4a' },
    feature: (put) => { disc(put, 5.5, 7.5, 2.2, 'b'); disc(put, 12.5, 7.5, 2.2, 'b') },
  },
]

export const OLIVE: Species = {
  id: 'olive', name: 'OLIVE', kind: 'Owl helper', blurb: '',
  pal: { b: '#c9a27a', d: '#9c7650', h: '#f3e2cc', a: '#6d4c33' },
  feature: (put) => mirror(put, [[4, 5], [5, 6], [4, 6], [3, 4]], 'a'),
  beak: true,
}

export const STARTERS = SPECIES.slice(0, 4)
export const FRIENDS = SPECIES.slice(4) // visit as you spend days together
export const byId = (id: string) => [...SPECIES, OLIVE].find((s) => s.id === id) ?? SPECIES[0]

const FIXED: Record<string, string> = { k: '#2b2238', w: '#ffffff', r: '#ff8fa3', o: '#ffa94d', s: '#5a8f3a' }

function grid(sp: Species, mood: Mood): string[][] {
  const g = Array.from({ length: W }, () => Array<string>(W).fill('.'))
  const put = (x: number, y: number, c: string) => { if (x >= 0 && y >= 0 && x < W && y < W) g[Math.round(y)][Math.round(x)] = c }
  sp.feature(put)
  for (let y = 0; y < W; y++)
    for (let x = 0; x < W; x++) {
      const dx = (x + 0.5 - 9) / 6.4
      const dy = (y + 0.5 - 11.8) / 5.3
      const r = dx * dx + dy * dy
      if (r > 1) continue
      g[y][x] = dx * 0.55 + dy * 0.85 > 0.62 ? 'd' : dx < -0.25 && dy < -0.45 && r > 0.5 ? 'h' : 'b'
    }
  // outline anything touching the creature
  const solid = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < W && g[y][x] !== '.' && g[y][x] !== 'K'
  for (let y = 0; y < W; y++)
    for (let x = 0; x < W; x++)
      if (g[y][x] === '.' && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) g[y][x] = 'K'
  // face
  const eyes: [number, number, string][] =
    mood === 'sleepy' ? [[5, 12, 'k'], [6, 12, 'k'], [11, 12, 'k'], [12, 12, 'k']]
      : mood === 'joy' || mood === 'eat' ? [[5, 12, 'k'], [6, 11, 'k'], [7, 12, 'k'], [10, 12, 'k'], [11, 11, 'k'], [12, 12, 'k']]
      : [[5, 11, 'w'], [6, 11, 'k'], [5, 12, 'k'], [6, 12, 'k'], [11, 11, 'w'], [12, 11, 'k'], [11, 12, 'k'], [12, 12, 'k']]
  eyes.forEach(([x, y, c]) => (g[y][x] = c))
  g[13][3] = 'r'; g[13][4] = 'r'; g[13][13] = 'r'; g[13][14] = 'r'
  if (sp.beak) { g[13][8] = 'o'; g[13][9] = 'o'; g[14][9] = 'o' }
  else if (mood === 'eat') { g[13][8] = 'k'; g[13][9] = 'r'; g[13][10] = 'k'; g[14][9] = 'k' }
  else { g[13][9] = 'k'; if (mood === 'joy') { g[13][8] = 'k'; g[13][10] = 'k' } }
  return g
}

export function Sprite({ sp, mood = 'happy', silhouette, className }: { sp: Species; mood?: Mood; silhouette?: boolean; className?: string }) {
  const g = grid(sp, mood)
  const color = (c: string) => (silhouette ? (c === '.' ? '' : '#3b3450') : c === 'K' ? FIXED.k : (sp.pal as Record<string, string>)[c] ?? FIXED[c])
  const rects: ReactElement[] = []
  g.forEach((row, y) => {
    let x = 0
    while (x < W) {
      const c = row[x]
      let n = 1
      while (x + n < W && row[x + n] === c) n++
      if (c !== '.') rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={n} height={1} fill={color(c)} />)
      x += n
    }
  })
  return (
    <svg viewBox="0 0 18 18" className={'sprite ' + (className ?? '')} shapeRendering="crispEdges" aria-label={sp.name}>
      {rects}
    </svg>
  )
}

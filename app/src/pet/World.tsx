// Sprout Hollow: a tiny top-down world the buddy lives in. 11x10 tiles, 16px each.

export const MAP = [
  'TTTTTTTTTTT',
  'TgfggggghhT',
  'TgggwwgghhT',
  'TggwwwwpppT',
  'TfggwwgpggT',
  'TggggggpgfT',
  'TpppppppggT',
  'TggfggggggT',
  'TgggggTgfgT',
  'TTTTTTTTTTT',
]
export const COLS = 11
export const ROWS = 10
export const walkable = (x: number, y: number) => 'gfp'.includes(MAP[y]?.[x] ?? 'T')
export const OPEN = MAP.flatMap((row, y) => [...row].map((c, x) => ({ x, y, c }))).filter((t) => walkable(t.x, t.y))

type R = [number, number, number, number, string]
const discPx = (cx: number, cy: number, r: number, c: string): R[] => {
  const out: R[] = []
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if ((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r) out.push([x, y, 1, 1, c])
  return out
}

const grass: R[] = [
  [0, 0, 16, 16, '#8bd474'],
  [2, 3, 1, 1, '#6fbf5e'], [3, 2, 1, 1, '#6fbf5e'], [4, 3, 1, 1, '#6fbf5e'],
  [10, 9, 1, 1, '#6fbf5e'], [11, 8, 1, 1, '#6fbf5e'], [12, 9, 1, 1, '#6fbf5e'],
  [6, 13, 1, 1, '#6fbf5e'], [7, 12, 1, 1, '#6fbf5e'],
  [13, 3, 1, 1, '#a9e592'], [1, 11, 1, 1, '#a9e592'],
]
const TILES: Record<string, R[]> = {
  g: grass,
  f: [
    ...grass,
    [4, 4, 1, 1, '#ff8fb5'], [3, 5, 1, 1, '#ff8fb5'], [5, 5, 1, 1, '#ff8fb5'], [4, 6, 1, 1, '#ff8fb5'], [4, 5, 1, 1, '#ffe066'],
    [11, 10, 1, 1, '#fff6c2'], [10, 11, 1, 1, '#fff6c2'], [12, 11, 1, 1, '#fff6c2'], [11, 12, 1, 1, '#fff6c2'], [11, 11, 1, 1, '#ff9f1c'],
  ],
  p: [
    [0, 0, 16, 16, '#efdcab'],
    [3, 4, 2, 1, '#d8c28b'], [11, 6, 1, 1, '#d8c28b'], [7, 12, 2, 1, '#d8c28b'], [13, 13, 1, 1, '#d8c28b'], [1, 1, 1, 1, '#f8eecf'], [9, 2, 1, 1, '#f8eecf'],
  ],
  w: [
    [0, 0, 16, 16, '#6cc3ef'],
    [2, 4, 4, 1, '#b4e6fc'], [8, 9, 5, 1, '#b4e6fc'], [3, 13, 4, 1, '#b4e6fc'], [12, 2, 2, 1, '#b4e6fc'],
  ],
  T: [
    ...grass,
    [6, 11, 4, 5, '#8a5a3c'], [6, 11, 1, 5, '#6d4630'],
    ...discPx(8, 7, 7, '#2f6b3d'), ...discPx(8, 7, 6, '#4fae5f'), ...discPx(6, 5, 2.4, '#7fd08a'),
  ],
}

function House() {
  const r: R[] = [
    [4, 14, 24, 16, '#2b2238'], [5, 15, 22, 14, '#fff3df'],
    [13, 21, 6, 9, '#2b2238'], [14, 22, 4, 8, '#9a6644'], [16, 26, 1, 1, '#ffe066'],
    [6, 18, 6, 5, '#2b2238'], [7, 19, 4, 3, '#a8e1fb'], [20, 18, 6, 5, '#2b2238'], [21, 19, 4, 3, '#a8e1fb'],
    [22, 2, 4, 8, '#2b2238'], [23, 3, 2, 7, '#c96a4f'],
  ]
  for (let y = 0; y < 12; y++) {
    const half = 3 + y * 1.25
    r.push([Math.round(16 - half), 3 + y, Math.round(half * 2), 1, y === 0 ? '#2b2238' : y === 11 ? '#c96a4f' : y % 3 === 0 ? '#f49b7f' : '#ef8a6a'])
  }
  return (
    <g transform="translate(128 16)">
      {r.map(([x, y, w, h, c], i) => <rect key={i} x={x} y={y} width={w} height={h} fill={c} />)}
    </g>
  )
}

export function World() {
  return (
    <svg viewBox={`0 0 ${COLS * 16} ${ROWS * 16}`} className="world" shapeRendering="crispEdges" aria-label="Sprout Hollow map">
      <defs>
        {Object.entries(TILES).map(([k, rs]) => (
          <g id={`t-${k}`} key={k} className={k === 'w' ? 'water' : undefined}>
            {rs.map(([x, y, w, h, c], i) => <rect key={i} x={x} y={y} width={w} height={h} fill={c} />)}
          </g>
        ))}
      </defs>
      {MAP.flatMap((row, y) => [...row].map((c, x) => <use key={`${x}-${y}`} href={`#t-${c === 'h' ? 'g' : c}`} x={x * 16} y={y * 16} />))}
      <House />
    </svg>
  )
}

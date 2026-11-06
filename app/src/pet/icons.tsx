import type { ReactElement } from 'react'

// Pixel icons drawn on a 10x10 grid, so the UI never falls back to system emoji.
const PAL: Record<string, string> = {
  k: '#2b2238', w: '#ffffff', r: '#ff5d8f', p: '#ffb3c8', g: '#4c9b3a', y: '#ffd166', o: '#ff9f1c',
  b: '#6cc3ef', c: '#fff6d6', n: '#9a6644', t: '#7cc6c0',
}

const ART = {
  berry: ['....gg....', '...g..g...', '..kkkkkk..', '.krrrrrrk.', 'krprrrrrrk', 'krrrrrrrrk', 'krrrrrrrrk', '.krrrrrrk.', '..krrrrk..', '...kkkk...'],
  star: ['....kk....', '...kyyk...', '...kyyk...', 'kkkkyykkkk', 'kyyyyyyyyk', '.kyyyyyyk.', '..kyyyyk..', '.kyykkyyk.', '.kyk..kyk.', '.kk....kk.'],
  book: ['kkkkkkkkk.', 'kbbbbbbbk.', 'kbwwwwwbk.', 'kbbbbbbbk.', 'kbwwwwbbk.', 'kbbbbbbbk.', 'kbbbbbbbk.', 'kkkkkkkkkk', 'kcccccccck', '.kkkkkkkkk'],
  talk: ['.kkkkkkkk.', 'kwwwwwwwwk', 'kwwwwwwwwk', 'kwtwwtwwtk', 'kwwwwwwwwk', '.kkkkwwkk.', '.....kwk..', '......kk..'],
  sun: ['....yy....', '.y..yy..y.', '..ykkkky..', '..kyyyyk..', 'yykyyyykyy', 'yykyyyykyy', '..kyyyyk..', '..ykkkky..', '.y..yy..y.', '....yy....'],
  moon: ['..kkkk....', '.kcccck...', 'kccckk....', 'kcck......', 'kcck......', 'kccck.....', '.kccckkkk.', '..kccccck.', '...kkkkk..'],
  heart: ['.kk...kk..', 'krrk.krrk.', 'krprkrrrk.', 'krrrrrrrk.', '.krrrrrk..', '..krrrk...', '...krk....', '....k.....'],
  check: ['........kk', '.......kgk', '......kgk.', 'kk...kgk..', 'kgk.kgk...', '.kgkgk....', '..kgk.....', '...k......'],
  pin: ['..kkkk....', '.krrrrk...', 'krrwwrrk..', 'krrwwrrk..', '.krrrrk...', '..krrk....', '...kk.....'],
}
export type IconName = keyof typeof ART

export function Px({ name, size = 18, className }: { name: IconName; size?: number; className?: string }) {
  const rows = ART[name]
  const rects: ReactElement[] = []
  rows.forEach((row, y) => [...row].forEach((c, x) => { if (c !== '.') rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={PAL[c]} />) }))
  return (
    <svg viewBox={`0 0 10 ${rows.length}`} width={size} height={(size * rows.length) / 10} shapeRendering="crispEdges" className={'px ' + (className ?? '')} aria-hidden="true">
      {rects}
    </svg>
  )
}

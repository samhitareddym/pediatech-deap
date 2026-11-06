import type { ReactElement } from 'react'

// Eight original companions (newdes.md). Vector art on a 120x120 canvas, feet on y≈110.
// Each has its own silhouette and palette, not a recolored base.

const K = '#2b2238' // shared ink outline
const o = { stroke: K, strokeWidth: 2.6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }

export type Pose = 'idle' | 'rest' | 'inspect' | 'happy'
export type CompanionDef = { id: string; name: string; line: string; does: string; accent: string; art: () => ReactElement }

const Eyes = ({ children }: { children: ReactElement | ReactElement[] }) => <g className="eyes">{children}</g>
const Shadow = () => <ellipse cx="60" cy="112" rx="30" ry="5" fill="rgba(43,34,56,.16)" />

export const COMPANIONS: CompanionDef[] = [
  {
    id: 'miso', name: 'Miso', accent: '#d9a441',
    line: 'Independent, observant, quietly affectionate.', does: 'claims the sunny window seat',
    art: () => (
      <>
        <Shadow />
        <path d="M78 102 C 106 100, 112 70, 98 54 C 93 49, 87 54, 92 59 C 101 71, 98 90, 78 94" fill="#e8dcc4" {...o} />
        <ellipse cx="58" cy="88" rx="24" ry="22" fill="#e8dcc4" {...o} />
        <ellipse cx="57" cy="94" rx="11" ry="13" fill="#f7f0e3" />
        <path d="M38 50 L40 22 L56 40 Z M62 40 L78 22 L80 50 Z" fill="#e8dcc4" {...o} />
        <path d="M42 40 L43 29 L50 37 Z M68 37 L76 29 L76 40 Z" fill="#d9a441" />
        <ellipse cx="59" cy="56" rx="22" ry="19" fill="#e8dcc4" {...o} />
        <Eyes>
          <ellipse cx="50" cy="56" rx="4" ry="4.6" fill="#d9a441" stroke={K} strokeWidth="1.6" />
          <ellipse cx="68" cy="56" rx="4" ry="4.6" fill="#d9a441" stroke={K} strokeWidth="1.6" />
          <rect x="49.2" y="52.6" width="1.6" height="6.8" rx=".8" fill={K} />
          <rect x="67.2" y="52.6" width="1.6" height="6.8" rx=".8" fill={K} />
        </Eyes>
        <path d="M57 62 L61 62 L59 64.5 Z" fill="#c98a7a" stroke={K} strokeWidth="1.2" />
        <path d="M59 64.5 C 58 67, 55 67, 54 66 M59 64.5 C 60 67, 63 67, 64 66" fill="none" stroke={K} strokeWidth="1.4" strokeLinecap="round" />
        <ellipse cx="49" cy="108" rx="7" ry="4" fill="#f7f0e3" {...o} />
        <ellipse cx="66" cy="108" rx="7" ry="4" fill="#f7f0e3" {...o} />
      </>
    ),
  },
  {
    id: 'moss', name: 'Moss', accent: '#4f7a4a',
    line: 'Curious, calm, a little odd.', does: 'inspects plants and naps by the terrarium',
    art: () => (
      <>
        <Shadow />
        <g transform="translate(36 60) rotate(-140)"><path d="M0 0 C 8 -11, 24 -11, 32 0 C 24 11, 8 11, 0 0 Z" fill="#4f7a4a" {...o} /><path d="M3 0 L28 0" stroke="#7fa874" strokeWidth="1.6" /></g>
        <g transform="translate(84 60) rotate(-40)"><path d="M0 0 C 8 -11, 24 -11, 32 0 C 24 11, 8 11, 0 0 Z" fill="#4f7a4a" {...o} /><path d="M3 0 L28 0" stroke="#7fa874" strokeWidth="1.6" /></g>
        <path d="M30 86 C 30 62, 44 52, 60 52 C 76 52, 90 62, 90 86 C 90 104, 78 110, 60 110 C 42 110, 30 104, 30 86 Z" fill="#9db58a" {...o} />
        <ellipse cx="60" cy="94" rx="16" ry="13" fill="#d8d3c3" />
        <circle cx="44" cy="86" r="4" fill="#e7a08f" opacity=".6" />
        <circle cx="76" cy="86" r="4" fill="#e7a08f" opacity=".6" />
        <Eyes>
          <circle cx="50" cy="77" r="4.6" fill={K} /><circle cx="70" cy="77" r="4.6" fill={K} />
          <circle cx="51.5" cy="75.5" r="1.5" fill="#fff" /><circle cx="71.5" cy="75.5" r="1.5" fill="#fff" />
        </Eyes>
        <path d="M56 86 C 58 88, 62 88, 64 86" fill="none" stroke={K} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M60 52 C 60 46, 64 43, 68 44" fill="none" stroke="#4f7a4a" strokeWidth="2.4" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: 'orbit', name: 'Orbit', accent: '#5cc8d6',
    line: 'Inventive, dry humor, methodical.', does: 'adjusts the lamp and studies the shelf',
    art: () => (
      <>
        <Shadow />
        <path d="M60 30 L60 20" stroke={K} strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="60" cy="17" r="4.5" fill="#5cc8d6" stroke={K} strokeWidth="2" />
        <ellipse cx="60" cy="108" rx="19" ry="5" fill="#4a4d57" {...o} />
        <path d="M30 72 C 30 46, 44 32, 60 32 C 78 32, 90 46, 90 72 C 90 94, 78 106, 60 106 C 42 106, 30 94, 30 72 Z" fill="#eceae6" {...o} />
        <path d="M34 82 C 40 98, 80 98, 86 82 C 84 96, 74 104, 60 104 C 46 104, 36 96, 34 82 Z" fill="#d6d3cd" />
        <circle cx="28" cy="70" r="5" fill="#4a4d57" {...o} /><circle cx="92" cy="70" r="5" fill="#4a4d57" {...o} />
        <rect x="38" y="50" width="44" height="28" rx="13" fill="#3b3e48" {...o} />
        <Eyes>
          <rect x="47" y="58" width="7" height="10" rx="3.5" fill="#5cc8d6" />
          <rect x="66" y="58" width="7" height="10" rx="3.5" fill="#5cc8d6" />
        </Eyes>
        <path d="M54 72 C 57 74, 63 74, 66 72" fill="none" stroke="#5cc8d6" strokeWidth="2" strokeLinecap="round" />
        <circle cx="44" cy="40" r="2.4" fill="#fff" opacity=".8" />
      </>
    ),
  },
  {
    id: 'pip', name: 'Pip', accent: '#c4612f',
    line: 'Adventurous, alert, playful.', does: 'finds a comfy corner and brings back little treasures',
    art: () => (
      <>
        <Shadow />
        <path d="M74 100 C 100 104, 116 80, 106 56 C 102 46, 92 48, 94 58 C 98 76, 90 90, 72 92 Z" fill="#c4612f" {...o} />
        <path d="M106 56 C 102 46, 92 48, 94 58 C 95 62, 96 66, 96 70 C 104 68, 108 62, 106 56 Z" fill="#f3e6d0" stroke={K} strokeWidth="2.2" strokeLinejoin="round" />
        <ellipse cx="58" cy="89" rx="20" ry="20" fill="#c4612f" {...o} />
        <ellipse cx="57" cy="94" rx="10" ry="13" fill="#f3e6d0" />
        <path d="M41 50 L43 22 L57 42 Z M60 42 L74 22 L76 50 Z" fill="#c4612f" {...o} />
        <path d="M43 22 L44 31 L49 30 Z M74 22 L73 31 L68 30 Z" fill="#3a3536" />
        <circle cx="58" cy="57" r="18" fill="#c4612f" {...o} />
        <path d="M44 60 C 40 64, 34 67, 31 68 C 36 72, 48 74, 58 70 C 56 64, 50 60, 44 60 Z" fill="#f3e6d0" stroke={K} strokeWidth="2.2" strokeLinejoin="round" />
        <circle cx="31.5" cy="67.5" r="2.6" fill={K} />
        <Eyes>
          <ellipse cx="51" cy="54" rx="2.8" ry="3.4" fill={K} /><ellipse cx="65" cy="54" rx="2.8" ry="3.4" fill={K} />
        </Eyes>
        <rect x="46" y="100" width="8" height="10" rx="4" fill="#3a3536" {...o} />
        <rect x="62" y="100" width="8" height="10" rx="4" fill="#3a3536" {...o} />
      </>
    ),
  },
  {
    id: 'nori', name: 'Nori', accent: '#5f9e9a',
    line: 'Relaxed, sociable, loves little rituals.', does: 'arranges cushions and lounges on the rug',
    art: () => (
      <>
        <Shadow />
        <path d="M74 100 C 92 104, 102 96, 100 86" fill="none" stroke={K} strokeWidth="11" strokeLinecap="round" />
        <path d="M74 100 C 92 104, 102 96, 100 86" fill="none" stroke="#7a5a44" strokeWidth="6" strokeLinecap="round" />
        <rect x="40" y="46" width="40" height="64" rx="20" fill="#7a5a44" {...o} />
        <ellipse cx="60" cy="86" rx="13" ry="18" fill="#e3d2b4" />
        <circle cx="44" cy="32" r="5" fill="#7a5a44" {...o} /><circle cx="76" cy="32" r="5" fill="#7a5a44" {...o} />
        <ellipse cx="60" cy="44" rx="21" ry="18" fill="#7a5a44" {...o} />
        <ellipse cx="60" cy="52" rx="11" ry="7.5" fill="#e3d2b4" />
        <path d="M42 62 C 52 68, 68 68, 78 62 L78 67 C 68 73, 52 73, 42 67 Z" fill="#5f9e9a" stroke={K} strokeWidth="2" strokeLinejoin="round" />
        <Eyes>
          <circle cx="52" cy="43" r="2.8" fill={K} /><circle cx="68" cy="43" r="2.8" fill={K} />
        </Eyes>
        <ellipse cx="60" cy="49" rx="3.2" ry="2.3" fill={K} />
        <path d="M47 52 L38 50 M47 55 L38 56 M73 52 L82 50 M73 55 L82 56" stroke={K} strokeWidth="1.2" strokeLinecap="round" />
        <ellipse cx="53" cy="78" rx="5" ry="4" fill="#7a5a44" {...o} /><ellipse cx="67" cy="78" rx="5" ry="4" fill="#7a5a44" {...o} />
      </>
    ),
  },
  {
    id: 'luma', name: 'Luma', accent: '#e9d79a',
    line: 'Thoughtful, nocturnal, fascinated by light.', does: 'perches near lamps and opens its wings',
    art: () => (
      <>
        <Shadow />
        <path className="wing-l" d="M58 62 C 40 56, 20 66, 18 90 C 18 104, 34 108, 52 98 Z" fill="#a39e98" {...o} />
        <path className="wing-r" d="M62 62 C 80 56, 100 66, 102 90 C 102 104, 86 108, 68 98 Z" fill="#a39e98" {...o} />
        <circle cx="34" cy="88" r="7" fill="#e9d79a" stroke={K} strokeWidth="1.6" /><circle cx="34" cy="88" r="2.6" fill="#2c3557" />
        <circle cx="86" cy="88" r="7" fill="#e9d79a" stroke={K} strokeWidth="1.6" /><circle cx="86" cy="88" r="2.6" fill="#2c3557" />
        <path d="M24 76 C 30 72, 38 72, 44 74 M76 74 C 82 72, 90 72, 96 76" stroke="#e9d79a" strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="60" cy="82" rx="14" ry="24" fill="#2c3557" {...o} />
        <path d="M50 86 L70 86 M51 94 L69 94 M53 101 L67 101" stroke="#4a5480" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="60" cy="58" rx="16" ry="8" fill="#efe8da" {...o} />
        <circle cx="60" cy="46" r="13" fill="#2c3557" {...o} />
        <path d="M54 35 C 50 26, 44 20, 38 18 M66 35 C 70 26, 76 20, 82 18" fill="none" stroke={K} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M44 22 L41 27 M48 26 L44 30 M76 22 L79 27 M72 26 L76 30" stroke={K} strokeWidth="1.6" strokeLinecap="round" />
        <Eyes>
          <ellipse cx="54" cy="46" rx="4" ry="4.8" fill="#e9d79a" stroke={K} strokeWidth="1.4" /><ellipse cx="66" cy="46" rx="4" ry="4.8" fill="#e9d79a" stroke={K} strokeWidth="1.4" />
          <circle cx="54.5" cy="47" r="1.8" fill={K} /><circle cx="66.5" cy="47" r="1.8" fill={K} />
        </Eyes>
      </>
    ),
  },
  {
    id: 'rook', name: 'Rook', accent: '#b8bcc6',
    line: 'Clever, inquisitive, collects interesting things.', does: 'rearranges trinkets and studies the wall art',
    art: () => (
      <>
        <Shadow />
        <path d="M48 104 L46 112 M44 112 L50 112 M66 104 L66 112 M63 112 L70 112" stroke="#8d929e" strokeWidth="3" strokeLinecap="round" />
        <path d="M38 92 L16 106 L22 96 L14 98 L34 84 Z" fill="#23263a" {...o} />
        <ellipse cx="58" cy="82" rx="25" ry="23" fill="#23263a" {...o} />
        <ellipse cx="62" cy="90" rx="13" ry="12" fill="#3e4460" />
        <path d="M40 74 C 48 70, 60 72, 66 80 C 60 84, 52 92, 42 96 C 36 90, 36 80, 40 74 Z" fill="#4a4f66" {...o} />
        <path d="M44 82 C 50 82, 56 84, 60 86 M44 89 C 48 89, 52 90, 55 91" stroke="#23263a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <circle cx="70" cy="52" r="16" fill="#23263a" {...o} />
        <path d="M84 47 L104 54 L84 60 Z" fill="#b8bcc6" {...o} />
        <path d="M84 54 L101 54" stroke={K} strokeWidth="1.4" />
        <Eyes>
          <circle cx="74" cy="48" r="4.4" fill="#fff" stroke={K} strokeWidth="1.2" /><circle cx="75" cy="48" r="2.3" fill={K} />
        </Eyes>
        <path d="M60 40 C 62 34, 68 32, 72 36" stroke="#4a4f66" strokeWidth="2" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: 'sol', name: 'Sol', accent: '#c9805a',
    line: 'Easygoing, patient, quietly mischievous.', does: 'climbs the perch and suns by the window',
    art: () => (
      <>
        <Shadow />
        <path d="M42 98 C 22 100, 14 84, 22 74 C 30 66, 42 74, 36 82 C 32 87, 26 83, 28 79" fill="none" stroke={K} strokeWidth="13" strokeLinecap="round" />
        <path d="M42 98 C 22 100, 14 84, 22 74 C 30 66, 42 74, 36 82 C 32 87, 26 83, 28 79" fill="none" stroke="#c9805a" strokeWidth="8" strokeLinecap="round" />
        <ellipse cx="62" cy="92" rx="25" ry="16" fill="#c9805a" {...o} />
        <ellipse cx="64" cy="98" rx="15" ry="7" fill="#e8d3a8" />
        <circle cx="52" cy="86" r="3" fill="#7d8a4a" /><circle cx="62" cy="82" r="2.4" fill="#7d8a4a" /><circle cx="72" cy="86" r="3" fill="#7d8a4a" />
        <ellipse cx="76" cy="66" rx="21" ry="16" fill="#c9805a" {...o} />
        <circle cx="66" cy="56" r="7.5" fill="#e8d3a8" {...o} /><circle cx="86" cy="56" r="7.5" fill="#e8d3a8" {...o} />
        <Eyes>
          <ellipse cx="67" cy="57" rx="2.6" ry="3.6" fill={K} /><ellipse cx="87" cy="57" rx="2.6" ry="3.6" fill={K} />
        </Eyes>
        <path d="M68 72 C 74 76, 84 76, 90 70" fill="none" stroke={K} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="44" cy="106" r="4" fill="#e8d3a8" {...o} /><circle cx="80" cy="106" r="4" fill="#e8d3a8" {...o} />
      </>
    ),
  },
]

export const companion = (id: string) => COMPANIONS.find((c) => c.id === id) ?? COMPANIONS[0]

export function Companion({ id, pose = 'idle', className }: { id: string; pose?: Pose; className?: string }) {
  const c = companion(id)
  return (
    <svg viewBox="0 0 120 120" className={'companion ' + (className ?? '')} role="img" aria-label={c.name}>
      <g className={'comp pose-' + pose}>{c.art()}</g>
    </svg>
  )
}

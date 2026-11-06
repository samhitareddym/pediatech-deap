export type Mood = 'happy' | 'thirsty' | 'proud' | 'asking'

// Fern: Maya's companion. Grows a leaf as the habit builds; droops (never dies) when waiting.
export function Fern({ leaves, mood }: { leaves: number; mood: Mood }) {
  const droop = mood === 'thirsty'
  const ls = Array.from({ length: leaves }, (_, i) => {
    const y = 150 - i * 13
    const side = i % 2 ? 1 : -1
    const len = 30 + Math.min(i, 5) * 3
    const rot = side * (droop ? 70 : 35 + (i % 3) * 6)
    return { y, side, len, rot, i }
  })
  return (
    <svg viewBox="0 0 200 230" className={`pet fern ${mood}`} aria-label={`Fern looks ${mood}`}>
      <ellipse cx="100" cy="222" rx="58" ry="6" fill="var(--shadow)" />
      <g className="sway">
        <path d={`M100 175 C 98 ${150 - leaves * 6}, 104 ${120 - leaves * 8}, 100 ${158 - leaves * 13}`} stroke="var(--stem)" strokeWidth="4" fill="none" strokeLinecap="round" />
        {ls.map(({ y, len, rot, i }) => (
          <g key={i} transform={`translate(100 ${y}) rotate(${rot})`} className="leaf" style={{ animationDelay: `${i * 60}ms` }}>
            <path d={`M0 0 C ${len * 0.3} -12, ${len * 0.8} -10, ${len} 0 C ${len * 0.8} 10, ${len * 0.3} 12, 0 0 Z`} fill={i % 2 ? 'var(--leaf)' : 'var(--leaf-2)'} />
            <path d={`M2 0 L ${len - 4} 0`} stroke="var(--leaf-vein)" strokeWidth="1.2" />
          </g>
        ))}
      </g>
      <path d="M58 172 H142 L132 218 Q100 226 68 218 Z" fill="var(--pot)" />
      <rect x="54" y="164" width="92" height="14" rx="5" fill="var(--pot-rim)" />
      <g transform="translate(100 196)">
        {droop ? (
          <>
            <path d="M-14 0 q4 -3 8 0" stroke="var(--face)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            <path d="M6 0 q4 -3 8 0" stroke="var(--face)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="-10" cy="-2" r="3" fill="var(--face)" />
            <circle cx="10" cy="-2" r="3" fill="var(--face)" />
            <path d="M-5 6 q5 5 10 0" stroke="var(--face)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            <circle cx="-19" cy="5" r="4" fill="var(--blush)" />
            <circle cx="19" cy="5" r="4" fill="var(--blush)" />
          </>
        )}
      </g>
      {mood === 'proud' && (
        <g className="sparkles" fill="var(--spark)">
          <path d="M40 60 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" />
          <path d="M160 40 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" />
          <path d="M150 110 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" />
        </g>
      )}
      {droop && <text x="140" y="70" className="zz">z z</text>}
    </svg>
  )
}

// Mochi: Leo's companion. Rounder and sillier for an 8-year-old.
export function Mochi({ mood }: { mood: Mood }) {
  const sleepy = mood === 'thirsty'
  return (
    <svg viewBox="0 0 200 200" className={`pet mochi ${mood}`} aria-label={`Mochi looks ${mood}`}>
      <ellipse cx="100" cy="188" rx="52" ry="7" fill="var(--shadow)" />
      <g className="bob">
        <path d="M100 40 C 160 40, 168 100, 164 140 C 160 176, 40 176, 36 140 C 32 100, 40 40, 100 40 Z" fill="var(--mochi)" />
        <path d="M70 46 q-8 -22 6 -26 q6 14 2 28z" fill="var(--mochi)" />
        <path d="M130 46 q8 -22 -6 -26 q-6 14 -2 28z" fill="var(--mochi)" />
        <ellipse cx="78" cy="78" rx="16" ry="10" fill="#fff" opacity=".35" />
        {sleepy ? (
          <>
            <path d="M70 112 q8 6 16 0" stroke="var(--face)" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M114 112 q8 6 16 0" stroke="var(--face)" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <ellipse cx="78" cy="110" rx="7" ry="9" fill="var(--face)" />
            <ellipse cx="122" cy="110" rx="7" ry="9" fill="var(--face)" />
            <circle cx="80" cy="106" r="2.5" fill="#fff" />
            <circle cx="124" cy="106" r="2.5" fill="#fff" />
          </>
        )}
        <circle cx="62" cy="128" r="8" fill="var(--blush)" />
        <circle cx="138" cy="128" r="8" fill="var(--blush)" />
        <path d={mood === 'asking' ? 'M94 134 q6 -4 12 0' : 'M92 130 q8 10 16 0'} stroke="var(--face)" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      {mood === 'asking' && (
        <g className="bubble">
          <circle cx="166" cy="40" r="20" fill="#fff" />
          <circle cx="146" cy="62" r="5" fill="#fff" />
          <text x="166" y="48" textAnchor="middle" fontSize="24" fontWeight="700" fill="var(--mochi-ink)">?</text>
        </g>
      )}
      {mood === 'proud' && (
        <g className="sparkles" fill="var(--spark)">
          <path d="M30 50 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" />
          <path d="M172 30 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" />
        </g>
      )}
    </svg>
  )
}

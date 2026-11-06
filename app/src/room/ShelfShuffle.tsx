import { useState } from 'react'

// Untimed arrangement puzzle (newdes.md): fit every object on the shelf. Tap an object, then tap a shelf.
// The middle shelf is short, so tall things can't go there. Same reward whatever the "score".

type Piece = { id: string; name: string; w: number; tall: boolean; color: string }
const PIECES: Piece[] = [
  { id: 'tb', name: 'Tall books', w: 2, tall: true, color: '#ff8fb5' },
  { id: 'sb', name: 'Comics', w: 2, tall: false, color: '#7cc6c0' },
  { id: 'vase', name: 'Vase', w: 1, tall: true, color: '#ffd166' },
  { id: 'plant', name: 'Plant', w: 1, tall: true, color: '#6fbf5e' },
  { id: 'clock', name: 'Clock', w: 1, tall: false, color: '#c9b6f2' },
  { id: 'box', name: 'Record box', w: 3, tall: false, color: '#c99a6e' },
  { id: 'shell', name: 'Shell', w: 1, tall: false, color: '#f3e6d0' },
  { id: 'candle', name: 'Candle', w: 1, tall: false, color: '#ffb38a' },
]
const ROWS = [{ name: 'Top shelf', short: false }, { name: 'Middle shelf (short)', short: true }, { name: 'Bottom shelf', short: false }]
const WIDTH = 4

export function ShelfShuffle({ onExit, onComplete, rewardNote }: { onExit: () => void; onComplete: () => string; rewardNote: string }) {
  const [rows, setRows] = useState<string[][]>([[], [], []])
  const [sel, setSel] = useState<string | null>(null)
  const [msg, setMsg] = useState('Tap an object, then tap a shelf.')
  const [done, setDone] = useState<string | null>(null)
  const p = (id: string) => PIECES.find((x) => x.id === id)!
  const used = (r: string[]) => r.reduce((n, id) => n + p(id).w, 0)
  const tray = PIECES.filter((x) => !rows.flat().includes(x.id))

  const place = (ri: number) => {
    if (!sel) return setMsg('Pick an object from the box first.')
    const pc = p(sel)
    if (ROWS[ri].short && pc.tall) return setMsg(`${pc.name} is too tall for the middle shelf.`)
    if (used(rows[ri]) + pc.w > WIDTH) return setMsg(`Not enough room on the ${ROWS[ri].name.split(' (')[0].toLowerCase()}.`)
    const next = rows.map((r, i) => (i === ri ? [...r, sel] : r))
    setRows(next)
    setSel(null)
    if (next.flat().length === PIECES.length) { setDone(onComplete()); setMsg('') }
    else setMsg(`${pc.name} placed.`)
  }
  const unplace = (id: string) => { if (done) return; setRows(rows.map((r) => r.filter((x) => x !== id))); setMsg(`${p(id).name} is back in the box.`) }

  return (
    <div className="game">
      <div className="game-head">
        <div><b>Shelf Shuffle</b><small>Untimed. {rewardNote}</small></div>
        <button className="btn ghost" onClick={onExit}>Exit</button>
      </div>
      <div className="shelf">
        {ROWS.map((r, ri) => (
          <button key={ri} className={'shelf-row' + (r.short ? ' short' : '') + (sel ? ' ready' : '')} onClick={() => place(ri)} aria-label={`${r.name}, ${WIDTH - used(rows[ri])} spaces free`}>
            {rows[ri].map((id) => (
              <span key={id} className={'piece' + (p(id).tall ? ' tall' : '')} style={{ flex: p(id).w, background: p(id).color }} onClick={(e) => { e.stopPropagation(); unplace(id) }}>{p(id).name}</span>
            ))}
            {Array.from({ length: WIDTH - used(rows[ri]) }, (_, k) => <span key={k} className="gap" />)}
          </button>
        ))}
      </div>
      <p className="game-msg" aria-live="polite">{msg}</p>
      {!done && (
        <div className="tray">
          {tray.map((x) => (
            <button key={x.id} className={'piece-btn' + (sel === x.id ? ' on' : '')} onClick={() => setSel(x.id)} aria-pressed={sel === x.id}>
              <span className={'chip' + (x.tall ? ' tall' : '')} style={{ background: x.color, width: 14 * x.w }} />
              {x.name}<small>{x.w} wide{x.tall ? ' · tall' : ''}</small>
            </button>
          ))}
        </div>
      )}
      {done && (
        <div className="game-done">
          <b>Shelf sorted!</b>
          <p>{done}</p>
          <div className="row">
            <button className="btn ghost" onClick={() => { setRows([[], [], []]); setDone(null); setMsg('Tap an object, then tap a shelf.') }}>Play again</button>
            <button className="btn primary" onClick={onExit}>Back to room</button>
          </div>
        </div>
      )}
    </div>
  )
}

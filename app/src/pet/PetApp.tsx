import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { BAT } from '../script'
import { FRIENDS, OLIVE, STARTERS, Sprite, byId, type Mood } from './sprites'
import { COLS, OPEN, ROWS, World, walkable } from './World'
import './pet.css'

/* ---------------- state ---------------- */

type Slot = 'am' | 'pm'
type Log = { day: number; slot: Slot; at: number; late: boolean }
type Stage = 'title' | 'intro' | 'choose' | 'name' | 'times' | 'home'
type Save = {
  stage: Stage
  buddy: string
  name: string
  am: number // minutes after midnight
  pm: number
  day: number
  now: number
  logs: Log[]
  xp: number
  joy: number
  stars: number
  friends: string[]
  told: number[]
}

const KEY = 'tend-pet-v1'
const fresh: Save = { stage: 'title', buddy: 'mochi', name: 'MOCHI', am: 480, pm: 1200, day: 1, now: 485, logs: [], xp: 0, joy: 70, stars: 0, friends: [], told: [] }
const load = (): Save => {
  try { return { ...fresh, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') } } catch { return fresh }
}

const FRIEND_DAYS = [2, 4, 7] // demo pace; real app: 3, 7, 14 days together (not in a row)
const WINDOW = 60 // on time = within an hour of the scheduled dose

const clock = (m: number) => {
  const h = Math.floor(m / 60) % 24
  return `${((h + 11) % 12) + 1}:${String(m % 60).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}
const toInput = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
const fromInput = (v: string) => { const [h, m] = v.split(':').map(Number); return h * 60 + m }

function slotInfo(s: Save, slot: Slot) {
  const sched = slot === 'am' ? s.am : s.pm
  const close = slot === 'am' ? s.pm - WINDOW : 1440
  const log = s.logs.find((l) => l.day === s.day && l.slot === slot)
  const status = log ? (log.late ? 'late' : 'done')
    : s.now >= close ? 'missed'
    : s.now > sched + WINDOW ? 'overdue'
    : s.now >= sched - WINDOW ? 'due' : 'later'
  return { slot, sched, status, open: !log && s.now >= sched - WINDOW && s.now < close }
}
const spawn = (k: string) => { const t = OPEN[(k.length * 7 + k.charCodeAt(0)) % OPEN.length]; return { x: t.x, y: t.y, flip: false } }
const daysTogether = (s: Save) => new Set(s.logs.map((l) => l.day)).size
const level = (xp: number) => Math.floor(xp / 100) + 1

/* ---------------- typewriter dialog ---------------- */

type Dlg = { lines: string[]; i: number; choice?: [string, string]; who?: string }

function useType(text: string) {
  const [n, setN] = useState(0)
  useEffect(() => {
    setN(0)
    const start = performance.now() // time-based so throttled timers can't stall the text
    const id = setInterval(() => {
      const v = Math.min(text.length, Math.floor((performance.now() - start) / 22))
      setN((cur) => Math.max(cur, v))
      if (v >= text.length) clearInterval(id)
    }, 22)
    return () => clearInterval(id)
  }, [text])
  return [text.slice(0, n), n >= text.length, () => setN(text.length)] as const
}

function TextBox({ dlg, onNext, onChoose }: { dlg: Dlg; onNext: () => void; onChoose: (yes: boolean) => void }) {
  const line = dlg.lines[dlg.i]
  const [shown, done, finish] = useType(line)
  const last = dlg.i === dlg.lines.length - 1
  return (
    <div className="textbox" onClick={() => (done ? onNext() : finish())}>
      {dlg.who && <span className="who">{dlg.who}</span>}
      <p>{shown}</p>
      {done && !(last && dlg.choice) && <span className="more">▼</span>}
      {done && last && dlg.choice && (
        <div className="choice" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onChoose(true)}>{dlg.choice[0]}</button>
          <button onClick={() => onChoose(false)}>{dlg.choice[1]}</button>
        </div>
      )}
    </div>
  )
}

/* ---------------- app ---------------- */

export default function PetApp() {
  const [s, setS] = useState<Save>(load)
  const [dlg, setDlg] = useState<Dlg | null>(null)
  const then = useRef<(yes: boolean) => void>(() => {})
  const [anim, setAnim] = useState<'feed' | 'joy' | null>(null)
  const [pos, setPos] = useState<Record<string, { x: number; y: number; flip: boolean }>>({ me: { x: 4, y: 6, flip: false } })
  const [stars, setStars] = useState<{ id: number; x: number; y: number }[]>([])
  const [game, setGame] = useState<{ left: number; got: number } | null>(null)
  const [sheet, setSheet] = useState<'book' | 'talk' | null>(null)
  const [hearts, setHearts] = useState(0)
  const [pick, setPick] = useState<string | null>(null)

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* private mode: fine */ } }, [s])

  const up = (fn: (d: Save) => void) => setS((p) => { const d = structuredClone(p); fn(d); return d })
  const say = useCallback((lines: string[], next?: (yes: boolean) => void, choice?: [string, string], who?: string) => {
    then.current = next ?? (() => {})
    setDlg({ lines, i: 0, choice, who })
  }, [])
  const advance = () => {
    if (!dlg) return
    if (dlg.i < dlg.lines.length - 1) return setDlg({ ...dlg, i: dlg.i + 1 })
    if (dlg.choice) return
    setDlg(null)
    then.current(true)
  }
  const choose = (yes: boolean) => { setDlg(null); then.current(yes) }

  const sp = byId(s.buddy)
  const am = slotInfo(s, 'am')
  const pm = slotInfo(s, 'pm')
  const due = [am, pm].find((x) => x.open)
  const sleepy = [am, pm].some((x) => x.status === 'overdue' || x.status === 'missed')
  const mood: Mood = anim === 'feed' ? 'eat' : anim === 'joy' ? 'joy' : sleepy ? 'sleepy' : 'happy'

  /* buddies wander around the hollow */
  useEffect(() => {
    if (s.stage !== 'home') return
    const id = setInterval(() => {
      setPos((p) => {
        const next = { ...p }
        for (const k of ['me', ...s.friends]) {
          const cur = next[k] ?? spawn(k)
          if ((k === 'me' && (anim || game)) || Math.random() < 0.35) { next[k] = cur; continue }
          const steps = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => walkable(cur.x + dx, cur.y + dy))
          const [dx, dy] = steps[Math.floor(Math.random() * steps.length)] ?? [0, 0]
          next[k] = { x: cur.x + dx, y: cur.y + dy, flip: dx === 0 ? cur.flip : dx < 0 }
        }
        return next
      })
    }, 1300)
    return () => clearInterval(id)
  }, [s.stage, s.friends, anim, game])

  /* star hunt mini-game */
  useEffect(() => {
    if (!game) return
    if (game.left <= 0) {
      setStars([])
      const got = game.got
      setGame(null)
      up((d) => { d.stars += got; d.joy = Math.min(100, d.joy + got * 2) })
      say([got ? `You found ${got} star${got > 1 ? 's' : ''}! ${s.name} is beaming. ★` : `The stars were sneaky today! ${s.name} still had fun.`])
      return
    }
    const id = setTimeout(() => {
      setGame((g) => (g ? { ...g, left: g.left - 1 } : g))
      setStars((st) => {
        const t = OPEN[Math.floor(Math.random() * OPEN.length)]
        return [...st.filter((x) => Date.now() - x.id < 1800), { id: Date.now(), x: t.x, y: t.y }]
      })
    }, 650)
    return () => clearTimeout(id)
  }, [game, s.name, say])

  /* ---------- actions ---------- */

  const feed = () => {
    if (!due) {
      const both = am.status === 'done' || am.status === 'late'
      return say([both && (pm.status === 'done' || pm.status === 'late')
        ? `${s.name} is full! Both snacks done today. 🌙`
        : `${s.name} isn't hungry yet. Next snack at ${clock(am.status === 'later' ? s.am : s.pm)}.`])
    }
    const label = due.slot === 'am' ? 'morning' : 'evening'
    say([`Did you take your ${label} meds?`], (yes) => {
      if (!yes) return say([`No worries. Tap FEED right after you take them.`])
      const late = s.now > due.sched + WINDOW
      const gain = late ? 12 : 20
      const before = level(s.xp)
      const firstToday = !s.logs.some((l) => l.day === s.day)
      const together = daysTogether(s) + (firstToday ? 1 : 0)
      const newFriend = FRIENDS.find((f, i) => FRIEND_DAYS[i] <= together && !s.friends.includes(f.id))
      up((d) => {
        d.logs.push({ day: d.day, slot: due.slot, at: d.now, late })
        d.xp += gain
        d.joy = Math.min(100, d.joy + 15)
        if (newFriend) d.friends.push(newFriend.id)
      })
      setAnim('feed')
      setTimeout(() => {
        setAnim('joy')
        setHearts((h) => h + 1)
        const lines = [`Munch munch! ${s.name} loved that snack.`, late ? `A little late, and it still counts! +${gain} XP` : `Right on time! +${gain} XP`]
        if (level(s.xp + gain) > before) lines.push(`✨ ${s.name} grew to Lv ${level(s.xp + gain)}!`)
        if (newFriend) lines.push(`Look! ${newFriend.name} came to visit Sprout Hollow!`)
        say(lines, () => setAnim(null))
      }, 1300)
    }, ['YES', 'NOT YET'])
  }

  const pat = () => {
    setAnim('joy')
    setHearts((h) => h + 1)
    up((d) => { d.joy = Math.min(100, d.joy + 2) })
    setTimeout(() => setAnim((a) => (a === 'joy' ? null : a)), 900)
  }

  const play = () => say([`Star hunt! Tap the stars before they fade.`], () => setGame({ left: 14, got: 0 }))

  const tell = (id: number | 'person') => {
    setSheet(null)
    if (id === 'person') return say([`Okay. I'll ask your care team to reach out to you today.`, `You did the right thing asking. 💛`])
    up((d) => { if (!d.told.includes(id)) d.told.push(id) })
    say([`Thanks for telling me. That happens to lots of people.`, `I'll let your care team know, and they'll help you find a fix that works for you.`])
  }

  /* presenter controls (outside the phone) */
  const setTime = (now: number) => up((d) => { d.now = now })
  const nextDay = () => {
    const missed = [am, pm].some((x) => x.status !== 'done' && x.status !== 'late')
    up((d) => { d.day += 1; d.now = d.am + 5; d.joy = Math.max(30, d.joy - 10) })
    if (missed && s.stage === 'home') say([`Yawn… ${s.name} took a big nap.`, `New day, fresh start! ☀`])
  }

  /* ---------- screens ---------- */

  let screen
  if (s.stage === 'title')
    screen = (
      <div className="title" onClick={() => { up((d) => { d.stage = 'intro' }); say([`Oh! Hello there!`, `I'm OLIVE. I look after the buddies here in Sprout Hollow.`, `Every buddy needs a friend to take care of it.`, `Want to meet them?`], () => up((d) => { d.stage = 'choose' }), undefined, 'OLIVE') }}>
        <div className="logo">tend<span>.</span></div>
        <div className="sub">SPROUT HOLLOW</div>
        <div className="parade">{STARTERS.map((b, i) => <div key={b.id} className="bob" style={{ animationDelay: `${i * 120}ms` }}><Sprite sp={b} /></div>)}</div>
        <div className="start">TAP TO START</div>
      </div>
    )
  else if (s.stage === 'intro')
    screen = (
      <div className="meadow center-stage">
        <div className="big bob"><Sprite sp={OLIVE} /></div>
      </div>
    )
  else if (s.stage === 'choose')
    screen = (
      <div className="meadow">
        <div className="banner">Choose your buddy</div>
        <div className="pedestals">
          {STARTERS.map((b) => (
            <button key={b.id} className={'pedestal' + (pick === b.id ? ' on' : '')} onClick={() => {
              setPick(b.id)
              say([`${b.name}, the ${b.kind.toLowerCase()}.`, `${b.blurb} Pick ${b.name}?`], (yes) => {
                if (yes) up((d) => { d.buddy = b.id; d.name = b.name; d.stage = 'name' })
                else setPick(null)
              }, ['YES', 'NO'])
            }}>
              <div className="bob"><Sprite sp={b} mood={pick === b.id ? 'joy' : 'happy'} /></div>
              <b>{b.name}</b>
              <small>{b.kind}</small>
            </button>
          ))}
        </div>
      </div>
    )
  else if (s.stage === 'name')
    screen = (
      <div className="meadow center-stage">
        <div className="big bob"><Sprite sp={sp} mood="joy" /></div>
        <div className="form">
          <label>What's your buddy's name?</label>
          <input value={s.name} maxLength={10} onChange={(e) => up((d) => { d.name = e.target.value.toUpperCase() })} />
          <button className="ok" onClick={() => up((d) => { d.name = d.name.trim() || sp.name; d.stage = 'times' })}>OK ▶</button>
        </div>
      </div>
    )
  else if (s.stage === 'times')
    screen = (
      <div className="meadow center-stage">
        <div className="big bob"><Sprite sp={sp} /></div>
        <div className="form">
          <label>When do you take your transplant meds?</label>
          <div className="times">
            <span>☀ Morning <input type="time" value={toInput(s.am)} onChange={(e) => up((d) => { d.am = fromInput(e.target.value) })} /></span>
            <span>☾ Evening <input type="time" value={toInput(s.pm)} onChange={(e) => up((d) => { d.pm = fromInput(e.target.value) })} /></span>
          </div>
          <small className="hint">Usually about 12 hours apart.</small>
          <button className="ok" onClick={() => say([
            `Perfect! Each time you take your meds, tap FEED. ${s.name} gets a snack.`,
            `Your snack log goes to your care team, and only them. It helps them help you.`,
            `If there are no snacks for 2 days, your team will check in. Nobody's in trouble, ever.`,
            `Now go say hi to ${s.name}!`,
          ], () => up((d) => { d.stage = 'home'; d.now = d.am + 5 }), undefined, 'OLIVE')}>OK ▶</button>
        </div>
      </div>
    )
  else
    screen = (
      <div className="home">
        <div className="hud">
          <div className="hud-row">
            <b>{s.name}</b>
            <span className="lv">Lv{level(s.xp)}</span>
          </div>
          <div className="bar"><span>JOY</span><i><em style={{ width: `${s.joy}%` }} /></i></div>
          <div className="bar xp"><span>XP</span><i><em style={{ width: `${s.xp % 100}%` }} /></i></div>
          <div className="doses">
            {[am, pm].map((x) => (
              <span key={x.slot} className={'dose ' + x.status}>
                {x.slot === 'am' ? '☀' : '☾'} {clock(x.sched)}
                <em>{{ done: '✓', late: '✓ late', missed: 'z', overdue: 'waiting', due: 'now!', later: '' }[x.status]}</em>
              </span>
            ))}
          </div>
        </div>

        <div className="map">
          <World />
          {s.friends.map((f) => {
            const p = pos[f] ?? spawn(f)
            return <Walker key={f} x={p.x} y={p.y} flip={p.flip}><Sprite sp={byId(f)} /></Walker>
          })}
          <Walker x={pos.me.x} y={pos.me.y} flip={pos.me.flip} me onClick={pat}>
            {anim === 'feed' && <div className="berry" />}
            {sleepy && !anim && <div className="zz">z<span>z</span></div>}
            <Sprite sp={sp} mood={mood} className={anim === 'joy' ? 'hop' : ''} />
            {hearts > 0 && <div className="hearts" key={hearts}>♥ ♥</div>}
          </Walker>
          {stars.map((st) => (
            <button key={st.id} className="star" style={{ left: `${(st.x / COLS) * 100}%`, top: `${(st.y / ROWS) * 100}%` }}
              onClick={() => { setStars((a) => a.filter((x) => x.id !== st.id)); setGame((g) => (g ? { ...g, got: g.got + 1 } : g)) }}>★</button>
          ))}
          {game && <div className="game-hud">★ {game.got} · {Math.ceil(game.left * 0.65)}s</div>}
          {due && !dlg && !anim && <div className="hungry" key={`${s.day}${due.slot}`}>🍓 {s.name} is getting hungry!</div>}
        </div>

        <div className="footer">
          <span>{daysTogether(s) ? `${daysTogether(s)} day${daysTogether(s) > 1 ? 's' : ''} together` : 'Your first day together!'}</span>
          <span>★ {s.stars}</span>
        </div>

        {!dlg && !game && (
          <div className="menu">
            <p>Hi! What should we do?</p>
            <div className="grid">
              <button className={'feed' + (due ? ' ready' : '')} onClick={feed}><i>🍓</i>FEED</button>
              <button onClick={play}><i>★</i>PLAY</button>
              <button onClick={() => setSheet('book')}><i>📖</i>BOOK</button>
              <button onClick={() => setSheet('talk')}><i>💬</i>TALK</button>
            </div>
          </div>
        )}

        {sheet === 'book' && <Book s={s} onClose={() => setSheet(null)} />}
        {sheet === 'talk' && (
          <div className="sheet">
            <div className="sheet-head"><b>Anything making meds hard lately?</b><button onClick={() => setSheet(null)}>✕</button></div>
            <div className="list">
              {BAT.map((b) => <button key={b.id} onClick={() => tell(b.id)}>▶ {b.text}</button>)}
              <button className="person" onClick={() => tell('person')}>▶ I'd like to talk to a real person</button>
            </div>
          </div>
        )}
      </div>
    )

  return (
    <div className="pet-stage">
      <div className="handheld">
        <div className="notch" />
        <div className="status-bar"><span>{clock(s.now)}</span><span>Day {s.day}</span></div>
        <div className="viewport">
          {screen}
          {dlg && <TextBox dlg={dlg} onNext={advance} onChoose={choose} />}
        </div>
      </div>

      <aside className="presenter">
        <h3>Demo controls</h3>
        <button onClick={() => setTime(s.am + 5)}>☀ {clock(s.am + 5)}<small>morning dose due</small></button>
        <button onClick={() => setTime(s.pm + 40)}>☾ {clock(s.pm + 40)}<small>evening, on time</small></button>
        <button onClick={() => setTime(s.pm + 110)}>☾ {clock(s.pm + 110)}<small>evening, late</small></button>
        <button onClick={nextDay}>⏭ Next day<small>missed doses = a nap</small></button>
        <hr />
        <button onClick={() => { setDlg(null); up((d) => { d.stage = 'home' }) }}>Skip setup</button>
        <button onClick={() => { setDlg(null); setSheet(null); setGame(null); setS(fresh) }}>↺ Reset</button>
        <a href="#demo">Team demo →</a>
      </aside>
    </div>
  )
}

function Walker({ x, y, flip, me, onClick, children }: { x: number; y: number; flip?: boolean; me?: boolean; onClick?: () => void; children: ReactNode }) {
  return (
    <div className={'walker' + (me ? ' me' : '') + (flip ? ' flip' : '')} style={{ left: `${(x / COLS) * 100}%`, top: `${((y - 0.25) / ROWS) * 100}%` }} onClick={onClick}>
      <div className="bob">{children}</div>
    </div>
  )
}

function Book({ s, onClose }: { s: Save; onClose: () => void }) {
  const days = Array.from({ length: 7 }, (_, i) => s.day - 6 + i).filter((d) => d >= 1)
  const cell = (day: number, slot: Slot) => {
    const l = s.logs.find((x) => x.day === day && x.slot === slot)
    if (l) return l.late ? 'late' : 'done'
    return day < s.day || (day === s.day && slotInfo(s, slot).status === 'missed') ? 'missed' : 'later'
  }
  return (
    <div className="sheet">
      <div className="sheet-head"><b>📖 Buddy Book</b><button onClick={onClose}>✕</button></div>
      <div className="book">
        <h4>Friends of Sprout Hollow</h4>
        <div className="cards">
          <div className="card mine"><Sprite sp={byId(s.buddy)} /><b>{s.name}</b><small>your buddy</small></div>
          {FRIENDS.map((f, i) => {
            const met = s.friends.includes(f.id)
            return (
              <div key={f.id} className={'card' + (met ? '' : ' locked')}>
                <Sprite sp={f} silhouette={!met} />
                <b>{met ? f.name : '???'}</b>
                <small>{met ? f.kind : `visits after ${FRIEND_DAYS[i]} days together`}</small>
              </div>
            )
          })}
        </div>
        <h4>Snack log</h4>
        <div className="log">
          <div className="log-row head"><span />{days.map((d) => <span key={d}>D{d}</span>)}</div>
          {(['am', 'pm'] as Slot[]).map((slot) => (
            <div key={slot} className="log-row"><span>{slot === 'am' ? '☀' : '☾'}</span>{days.map((d) => <i key={d} className={cell(d, slot)} />)}</div>
          ))}
        </div>
        <p className="legend"><i className="done" /> on time <i className="late" /> late <i className="missed" /> nap</p>
      </div>
    </div>
  )
}

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { BAT, PLAN_OPTIONS, ROLES, s0, steps, type Card, type Pane, type Role, type S } from './script'
import { Fern, Mochi, type Mood } from './Pets'

const START = new Date(2026, 10, 9)
const dateLabel = (day: number) =>
  new Date(START.getTime() + day * 864e5).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

export default function App() {
  const [hist, setHist] = useState<S[]>([s0])
  const i = hist.length - 1
  const s = hist[i]
  const step = steps[i]

  const next = useCallback(() => {
    const st = steps[hist.length - 1]
    if (!st.apply) return
    setHist((h) => [...h, st.apply!(structuredClone(h[h.length - 1]))])
  }, [hist.length])
  const back = () => setHist((h) => (h.length > 1 ? h.slice(0, -1) : h))
  const restart = () => setHist([s0])
  // free (unscripted) tweaks to the current state: chip toggles, tabs, dismissing banners
  const patch = (fn: (d: S) => void) =>
    setHist((h) => {
      const d = structuredClone(h[h.length - 1])
      fn(d)
      return [...h.slice(0, -1), d]
    })
  const act = (id: string) => {
    if (step.expects === id) next()
  }
  const cue = (id: string) => (step.expects === id ? ' cue' : '')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next() }
      if (e.key === 'ArrowLeft') back()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next])

  const dim = (p: Pane) => (step.focus === 'all' || step.focus === p ? '' : ' dim')
  const p = { s, act, cue, patch }

  return (
    <div className="stage">
      <header className="top">
        <div className="brand">
          <span className="logo">tend</span>
          <span className="tag">KTx-CONNECT · keeping the MAPS loop running between visits</span>
        </div>
        <div className="clock">
          <span className="dot" /> {dateLabel(s.day)} {s.day > 0 && <em>· day {s.day}</em>}
        </div>
      </header>

      <main className="panes">
        <section className={'pane' + dim('maya')}>
          <PaneLabel who="Maya, 15" sub="her phone · transplant at 9" />
          <Phone notif={s.maya.notif} time={s.day >= 70 ? '9:41' : '8:12'} onNotif={() => patch((d) => { d.maya.notif = undefined })} theme="fern">
            <MayaPhone {...p} />
          </Phone>
        </section>

        <section className={'pane' + dim('mom')}>
          <PaneLabel who={s.care.who === 'maya' ? 'Lisa' : 'Ana'} sub={s.care.who === 'maya' ? "Maya's mom · her own phone" : "Leo's mom · Leo is 8"} />
          <Phone notif={s.care.notif} time="8:15" onNotif={() => patch((d) => { d.care.notif = undefined })} theme={s.care.who === 'maya' ? 'parent' : 'mochi'}>
            <CarePhone {...p} />
          </Phone>
        </section>

        <section className={'pane wide' + dim('staff')}>
          <PaneLabel who="Transplant team" sub="one agent per role · humans decide" />
          <Staff {...p} />
        </section>
      </main>

      {s.outro ? <Outro onRestart={restart} /> : <Caption i={i} onNext={next} onBack={back} />}
    </div>
  )
}

type P = { s: S; act: (id: string) => void; cue: (id: string) => string; patch: (fn: (d: S) => void) => void }

function PaneLabel({ who, sub }: { who: string; sub: string }) {
  return (
    <div className="pane-label">
      <strong>{who}</strong> <span>{sub}</span>
    </div>
  )
}

function Phone({ children, notif, time, onNotif, theme }: { children: ReactNode; notif?: string; time: string; onNotif: () => void; theme: string }) {
  return (
    <div className={`phone ${theme}`}>
      <div className="status">
        <span>{time}</span>
        <span className="island" />
        <span className="sig">●●● ▮</span>
      </div>
      {notif && (
        <button className="notif" onClick={onNotif} key={notif}>
          <span className="notif-icon">🌱</span>
          <span>
            <b>Tend</b>
            <small>now</small>
            <br />
            {notif}
          </span>
        </button>
      )}
      <div className="screen">{children}</div>
      <div className="home-bar" />
    </div>
  )
}

/* ---------------- Maya ---------------- */

function MayaPhone({ s, act, cue, patch }: P) {
  const m = s.maya
  const toggle = (id: number) =>
    patch((d) => { d.sel.maya = d.sel.maya.includes(id) ? d.sel.maya.filter((x) => x !== id) : [...d.sel.maya, id] })

  if (m.screen === 'bat')
    return (
      <div className="flow">
        <div className="ask-head">
          <div className="mini-pet"><Fern leaves={4} mood="asking" /></div>
          <div className="bubble-say">Hey Maya. What's made it hard lately? Pick any, or none.</div>
        </div>
        <div className="chips">
          {BAT.map((b) => (
            <button key={b.id} className={'chip' + (s.sel.maya.includes(b.id) ? ' on' : '')} onClick={() => toggle(b.id)}>
              {b.text}
            </button>
          ))}
        </div>
        <p className="lock">🔒 Only your care team sees this. Not your parents.</p>
        <button className={'primary' + cue('maya:bat')} onClick={() => act('maya:bat')}>Send to my team</button>
      </div>
    )

  if (m.screen === 'plans') {
    const self = m.barriers.filter((b) => PLAN_OPTIONS[b])
    const team = m.barriers.filter((b) => !PLAN_OPTIONS[b])
    return (
      <div className="flow">
        <h3 className="serif">Let's pick one thing to try</h3>
        <p className="muted">One idea per thing. You can change it later.</p>
        {self.map((b) => (
          <div key={b} className="plan-group">
            <div className="plan-title">{PLAN_OPTIONS[b].title}</div>
            {PLAN_OPTIONS[b].options.map((o, k) => {
              const on = (s.sel.plans[b] ?? PLAN_OPTIONS[b].options[0]) === o
              return (
                <button key={k} className={'radio' + (on ? ' on' : '')} onClick={() => patch((d) => { d.sel.plans[b] = o })}>
                  <span className="r" /> {o}
                </button>
              )
            })}
          </div>
        ))}
        {team.length > 0 && <p className="muted small">Your team will help with “{BAT[team[0] - 1].text.toLowerCase()}”.</p>}
        <button className={'primary' + cue('maya:plans')} onClick={() => act('maya:plans')}>Send to my team</button>
      </div>
    )
  }

  if (m.screen === 'checkback')
    return (
      <div className="flow center">
        <div className="pet-wrap big"><Fern leaves={m.leaves} mood="proud" /></div>
        <div className="bubble-say center">It's been 2 weeks! Is the <b>8pm after brushing teeth</b> plan working?</div>
        <div className="triple">
          <button className={'big-choice good' + cue('maya:working')} onClick={() => act('maya:working')}>✅<span>Working</span></button>
          <button className="big-choice">🔧<span>Tweak it</span></button>
          <button className="big-choice">❌<span>Not really</span></button>
        </div>
      </div>
    )

  if (m.screen === 'talk')
    return (
      <div className="flow">
        <div className="ask-head">
          <div className="mini-pet"><Fern leaves={m.leaves} mood="asking" /></div>
          <div className="bubble-say">What's going on? No wrong answers. You're not in trouble.</div>
        </div>
        {['I keep forgetting again', 'Side effects are bugging me', "I don't want to take them", 'I just want to talk to someone'].map((t) => {
          const refuse = t.startsWith("I don't")
          return (
            <button key={t} className={'radio' + (refuse ? cue('maya:refuse') : '')} onClick={() => (refuse ? act('maya:refuse') : undefined)}>
              {t}
            </button>
          )
        })}
        <button className="ghost" onClick={() => patch((d) => { d.maya.screen = 'home' })}>Back to Fern</button>
      </div>
    )

  if (m.screen === 'reached')
    return (
      <div className="flow center">
        <div className="pet-wrap"><Fern leaves={m.leaves} mood="happy" /></div>
        <h3 className="serif">Thanks for telling me.</h3>
        <p className="muted">Someone from your team will reach out <b>within 2 days</b>. That's it. Nobody's mad.</p>
        <div className="soft-card">💬 Want to talk sooner? <b>Tap to text the team</b></div>
      </div>
    )

  // home
  const mood: Mood = m.plan === 'working' && s.day < 70 ? 'proud' : m.watered ? 'happy' : 'thirsty'
  const say =
    s.day >= 70 ? "Missed you lately. Everything ok?"
      : m.plan === 'working' ? 'Two weeks! Look how tall I got ✨'
      : m.plan === 'pending' ? 'Your team is looking at your plan…'
      : m.watered ? 'Ahh, thank you 🌿'
      : m.plan === 'active' ? "I'm a little thirsty…"
      : 'Hi Maya!'
  return (
    <div className="home">
      <div className="home-top">
        <div>
          <div className="pet-name serif">Fern</div>
          <div className="streak">🌱 {m.streak} day{m.streak > 1 ? 's' : ''} {m.week.includes('rest') && <span className="rest">❄ 1 rest day used</span>}</div>
        </div>
        <button className="icon-btn" aria-label="settings">⋯</button>
      </div>
      <div className="window">
        <div className="bubble-say float">{say}</div>
        <div className="pet-wrap"><Fern leaves={m.leaves} mood={mood} /></div>
        <div className="sill" />
      </div>
      <Week week={m.week} />
      {m.plans.length > 0 && (
        <div className="goals">
          {m.plans.map((g) => (
            <div key={g} className={'goal' + (m.plan === 'pending' ? ' pending' : '')}>
              <span className="g-dot">{m.plan === 'working' ? '✓' : m.plan === 'pending' ? '…' : '○'}</span> {g}
            </div>
          ))}
        </div>
      )}
      <button
        className={'water' + (m.watered ? ' done' : '') + cue('maya:water')}
        onClick={() => act('maya:water')}
      >
        {m.watered ? 'Fern is happy ✓' : '💧 Water Fern'}
      </button>
      <button className={'link' + cue('maya:refuse')} onClick={() => patch((d) => { d.maya.screen = 'talk' })}>
        Something getting in the way?
      </button>
    </div>
  )
}
function Week({ week }: { week: S['maya']['week'] }) {
  return (
    <div className="week">
      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, k) => (
        <div key={k} className={'day ' + week[k]}>
          <i>{week[k] === 'rest' ? '❄' : week[k] === 'taken' ? '' : ''}</i>
          <span>{d}</span>
        </div>
      ))}
    </div>
  )
}

/* ---------------- Caregiver ---------------- */

function CarePhone({ s, act, cue, patch }: P) {
  const c = s.care
  const es = c.lang === 'es'
  const t = (en: string, sp: string) => (es ? sp : en)
  const toggle = (id: number) =>
    patch((d) => { d.sel.mom = d.sel.mom.includes(id) ? d.sel.mom.filter((x) => x !== id) : [...d.sel.mom, id] })

  if (c.who === 'maya') {
    if (c.screen === 'bat')
      return (
        <div className="flow parent">
          <h3 className="serif">A quick check about Maya's medicine</h3>
          <p className="muted">Which of these sound like Maya? Your answers go to the care team, not to Maya.</p>
          <div className="chips">
            {BAT.map((b) => (
              <button key={b.id} className={'chip' + (s.sel.mom.includes(b.id) ? ' on' : '')} onClick={() => toggle(b.id)}>
                “{b.text}”
              </button>
            ))}
          </div>
          <button className={'primary' + cue('mom:bat')} onClick={() => act('mom:bat')}>Send to the team</button>
        </div>
      )
    const status = c.screen === 'status' ? (s.maya.plan === 'working' ? 'working' : 'track') : c.screen
    return (
      <div className="flow parent">
        <div className="fam-head">
          <span className="avatar">M</span>
          <div><b>Maya</b><br /><small>Kidney transplant · Cincinnati Children's</small></div>
        </div>
        {status === 'idle' && <div className="soft-card">Nothing new. We'll let you know if Maya's team needs you.</div>}
        {status === 'thanks' && <div className="soft-card">✓ Thanks, Lisa. The team has your answers. We'll tell you when Maya has a plan.</div>}
        {(status === 'track' || status === 'working') && (
          <div className="status-card ok">
            <div className="big-check">✓</div>
            <div>
              <b>Maya has a plan</b>
              <p>{status === 'working' ? 'Working well · checked in this week' : 'On track · next check-in in 2 weeks'}</p>
            </div>
          </div>
        )}
        {status === 'help' && (
          <div className="status-card warm">
            <div className="big-check">💛</div>
            <div>
              <b>Maya's team is checking in with her</b>
              <p>You don't need to do anything right now.</p>
            </div>
          </div>
        )}
        <div className="privacy">
          <div className="pv-col"><h4>You see</h4><p>Whether Maya has a plan, and if it's on track</p></div>
          <div className="pv-col"><h4>Maya keeps</h4><p>Her answers, her daily taps, and what she tells the team</p></div>
        </div>
        <div className="handoff">
          <span>Who's in charge of meds</span>
          <div className="slider"><i style={{ left: '62%' }} /></div>
          <div className="slider-labels"><span>Parent</span><span>Shared</span><span>Maya</span></div>
        </div>
      </div>
    )
  }

  // Leo + Ana
  const mood: Mood = c.screen === 'checkback' ? 'asking' : c.screen === 'ready' ? 'proud' : 'happy'
  return (
    <div className="flow mochi-flow">
      <div className="lang">
        {(['en', 'es'] as const).map((l) => (
          <button key={l} className={c.lang === l ? 'on' : ''} onClick={() => patch((d) => { d.care.lang = l })}>{l.toUpperCase()}</button>
        ))}
      </div>
      <div className="pet-wrap"><Mochi mood={mood} /></div>
      <div className="pet-name serif center">Mochi</div>
      {c.screen === 'checkback' && (
        <>
          <div className="bubble-say center">
            {t('Leo’s taste plan: ', 'Plan de sabor de Leo: ')}<b>{t('popsicle before medicine', 'paleta antes de la medicina')}</b>. {t('Is it working?', '¿Está funcionando?')}
          </div>
          <div className="triple two">
            <button className="big-choice good">👍<span>{t('Working', 'Sí funciona')}</span></button>
            <button className={'big-choice bad' + cue('mom:notworking')} onClick={() => act('mom:notworking')}>👎<span>{t('Not working', 'No funciona')}</span></button>
          </div>
        </>
      )}
      {c.screen === 'finding' && (
        <div className="soft-card">{t('Thank you, Ana. Leo’s team is finding another option. No need to call.', 'Gracias, Ana. El equipo de Leo está buscando otra opción. No necesita llamar.')}</div>
      )}
      {c.screen === 'ready' && (
        <div className="status-card ok">
          <div className="big-check">🍓</div>
          <div>
            <b>{t('Good news! New strawberry flavor', '¡Buenas noticias! Nuevo sabor a fresa')}</b>
            <p>{t('Ready at Walgreens on Vine St. after 3pm', 'Listo en Walgreens, calle Vine, después de las 3pm')}</p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------------- Staff ---------------- */

function Staff({ s, act, cue, patch }: P) {
  const tab = s.staffTab
  const cards = s.cards.filter((c) => c.role === tab)
  const open = cards.filter((c) => c.status === 'open')
  const done = cards.filter((c) => c.status !== 'open')
  const decide = (c: Card, ok: boolean) => {
    const id = `approve:${c.id}`
    if (cue(id)) return ok ? act(id) : undefined
    patch((d) => { d.cards.find((x) => x.id === c.id)!.status = ok ? 'approved' : 'declined' })
  }
  return (
    <div className="desk">
      <div className="desk-bar">
        <span className="lights"><i /><i /><i /></span>
        <span className="desk-title">Tend · Team</span>
        <span className="desk-date">{dateLabel(s.day)}</span>
      </div>
      <div className="desk-body">
        <nav className="rail">
          {(Object.keys(ROLES) as Role[]).map((r) => {
            const n = s.cards.filter((c) => c.role === r && c.status === 'open').length
            return (
              <button key={r} className={'rail-item ' + r + (r === tab ? ' on' : '')} onClick={() => patch((d) => { d.staffTab = r })}>
                <span className="agent">✦</span>
                <span className="rail-text"><b>{ROLES[r].label}</b><small>{ROLES[r].person}</small></span>
                {n > 0 && <span className="badge">{n}</span>}
              </button>
            )
          })}
          <div className="rail-foot">
            <b>41</b> patients
            <br />
            <b>{41 - s.cards.filter((c) => c.status === 'open').length}</b> doing fine · hidden
          </div>
        </nav>
        <div className="inbox">
          <div className="inbox-head">
            <h2 className="serif">Today for {ROLES[tab].person}</h2>
            <span className="muted">{open.length ? `${open.length} decision${open.length > 1 ? 's' : ''} · prepped by your agent` : 'Nothing needs you right now'}</span>
          </div>

          {tab === 'coord' && s.closedAuto > 0 && (
            <div className="auto-closed">
              <span>✓</span> <b>{s.closedAuto} plans closed by patients this week</b>. Maya said “working” at her 2-week check. No calls needed.
            </div>
          )}

          {open.map((c) => (
            <article key={c.id} className={'card ' + c.role + (c.urgent ? ' urgent' : '')}>
              <div className="card-top">
                <span className="patient">{c.patient}</span>
                {c.urgent && <span className="pill urgent">Today</span>}
                <span className={'pill role ' + c.role}>{ROLES[c.role].label}</span>
              </div>
              <h3 className="reason">{c.reason}</h3>
              <dl className="ctx">
                {c.context.map(([k, v]) => (
                  <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                ))}
              </dl>
              {c.note && (
                <div className="agent-note"><span className="agent">✦</span><p>{c.note}</p></div>
              )}
              <div className="decide">
                <span className="proposal">{c.action}?</span>
                <div className="decide-btns">
                  <button className="ghost sm">Edit</button>
                  <button className="ghost sm">Reassign</button>
                  <button className="no" onClick={() => decide(c, false)} aria-label="Decline">✕</button>
                  <button className={'yes' + cue(`approve:${c.id}`)} onClick={() => decide(c, true)}>✓ Approve</button>
                </div>
              </div>
            </article>
          ))}

          {!open.length && (
            <div className="empty">
              <div className="empty-art">☕</div>
              <p>Your list is clear. Everyone else is on track, and the agent will bring them back if anything changes.</p>
            </div>
          )}

          {done.length > 0 && (
            <div className="done">
              <h4>Done today</h4>
              {done.map((c) => (
                <div key={c.id} className="done-row">
                  <span className={c.status === 'approved' ? 'ok' : 'x'}>{c.status === 'approved' ? '✓' : '✕'}</span>
                  <b>{c.patient}</b> · {c.action}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------------- Presenter chrome ---------------- */

function Caption({ i, onNext, onBack }: { i: number; onNext: () => void; onBack: () => void }) {
  const st = steps[i]
  const total = steps.length - 1
  return (
    <footer className="caption" key={i}>
      <div className="cap-progress"><i style={{ width: `${(i / total) * 100}%` }} /></div>
      <div className="cap-body">
        <span className="cap-num">{String(i + 1).padStart(2, '0')}</span>
        <div className="cap-text">
          <h2 className="serif">{st.title}</h2>
          <p>{st.say}</p>
        </div>
        <div className="cap-nav">
          <button className="ghost" onClick={onBack} disabled={i === 0} aria-label="Back">←</button>
          <button className="cap-next" onClick={onNext}>{st.cta} <kbd>→</kbd></button>
        </div>
      </div>
    </footer>
  )
}

function Outro({ onRestart }: { onRestart: () => void }) {
  const keep = [
    ['Ask about barriers, structured', 'Fern asks the 14-item checklist in her voice'],
    ['Patient and caregiver separately', 'Own phones · disagreement goes on the card'],
    ['Every barrier has a named owner', 'One agent per role, routed by the MAPS table'],
    ['One plan per barrier, made together', 'Maya picks it · the nurse approves'],
    ['Close the loop', 'The pet asks at 2 weeks · “working” closes it itself'],
    ['Use chart risk signals', 'Drug-level swing started the whole story'],
  ]
  const stats = [
    ['4', 'decisions made by staff'],
    ['~2 min', 'of staff time, total'],
    ['0', 'callbacks to schedule'],
    ['< 1 day', 'from “I refuse” to a human'],
  ]
  return (
    <div className="outro">
      <div className="outro-card">
        <p className="eyebrow">Tend · KTx-CONNECT</p>
        <h1 className="serif">The MAPS loop, kept whole.<br /><em>Quiet when it's working.</em></h1>
        <div className="stats">
          {stats.map(([n, l]) => (
            <div key={l}><b className="serif">{n}</b><span>{l}</span></div>
          ))}
        </div>
        <ul className="keep">
          {keep.map(([a, b]) => (
            <li key={a}><span>✓</span><div><b>{a}</b><small>{b}</small></div></li>
          ))}
        </ul>
        <p className="measure">We'd measure: barriers resolved · check-backs closed within 14 days · staff minutes per patient · tacrolimus variability</p>
        <button className="cap-next" onClick={onRestart}>Restart demo ↺</button>
      </div>
    </div>
  )
}

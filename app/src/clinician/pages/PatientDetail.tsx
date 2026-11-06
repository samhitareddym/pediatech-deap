// Patient chart: the MAPS loop, barriers with owners and plans, and the context around them.

import { useClin } from '../context';
import { LANG } from '../data';
import {
  B, RIDX, RSTEPS, ago, ageOf, allBarriers, dayOf, dobFmt, fmt, isPlanOwner, isReferralOwner,
  nameOf, openRefs, ownerOf, ownerShort, planFor, refFor, refillState, reporter, riskFlags, runOutLabel, lcFirst, statusOf, tacSD, REFILL_CHIP,
} from '../logic';
import MedsPanel from '../components/MedsPanel';
import type { Patient } from '../types';
import { Alert, BackIcon, Button, Chip, GlobeIcon, LockIcon, StatusPill, UserIcon } from '../components/ui';
import RespondentChip from '../components/RespondentChip';

export default function PatientDetail() {
  const { S, ui, go, setUi } = useClin();
  const p = S.patients.find(x => x.id === ui.pid);
  if (!p) return null;
  const coord = ui.user?.role === 'coord';
  const bs = allBarriers(p);
  const nextCheck = p.plans.filter(x => x.outcome === null).map(x => 14 - x.created).sort((a, b) => a - b)[0];
  const refs = openRefs(S, p);
  const anyRefBarrier = bs.find(b => isReferralOwner(ownerOf(S, b))) ?? null;
  const refillAlerts = p.meds.filter(rx => ['out', 'due'].includes(refillState(rx))).length;

  const steps = [
    { n: '1 · Barriers', v: p.bat ? `${bs.length} found` : 'Waiting', s: p.bat ? `BAT ${fmt(dayOf(p.bat.days))}` : `Link sent ${fmt(dayOf(p.linkSent ?? 0))}`, st: p.bat ? 'done' : 'now' },
    { n: '2 · Plan', v: p.bat ? `${p.plans.length} of ${bs.filter(b => isPlanOwner(ownerOf(S, b))).length} plans` : '—',
      s: bs.some(b => isReferralOwner(ownerOf(S, b))) ? `${refs.length} referral${refs.length === 1 ? '' : 's'} open` : 'One solution per barrier',
      st: !p.bat ? '' : bs.some(b => isPlanOwner(ownerOf(S, b)) && !planFor(p, b)) ? 'now' : 'done' },
    { n: '3 · Check-back', v: nextCheck == null ? (p.plans.length ? 'Done' : '—') : nextCheck <= 0 ? (nextCheck === 0 ? 'Due today' : `${-nextCheck} day${nextCheck === -1 ? '' : 's'} overdue`) : `Due ${fmt(dayOf(-nextCheck))}`,
      s: 'Within 2 weeks of a plan', st: nextCheck == null ? (p.plans.length ? 'done' : '') : nextCheck <= 7 ? 'now' : '' },
    { n: '4 · Durability', v: p.plans.some(x => x.durability) ? 'Holding' : p.plans.some(x => x.outcome === 'working') ? 'Started' : '—', s: 'Monthly check-ins in the app', st: p.plans.some(x => x.durability) ? 'done' : '' },
    { n: '5 · Repeat BAT', v: p.bat ? fmt(dayOf(p.bat.days - 180)) : '—', s: 'Every 6 months, or sooner', st: '' },
  ];

  return (
    <div className="page">
      <button type="button" className="back" onClick={() => go(coord ? 'patients' : 'inbox')}><BackIcon /> {coord ? 'All patients' : 'Referral inbox'}</button>
      <section className="card">
        <div className="phead">
          <div>
            <h1>{nameOf(p)}</h1>
            <p className="meta">{ageOf(p.dob)} yrs · DOB {dobFmt(p.dob)} · {p.phone}</p>
            <div className="chips">
              <StatusPill status={statusOf(S, p)} />
              <RespondentChip p={p} />
              <Chip tone="blue"><GlobeIcon />{LANG[p.lang]}{p.interpreter ? ' · interpreter' : ''}</Chip>
              {p.transition && <Chip tone="violet">Moving to adult care</Chip>}
            </div>
          </div>
          {coord && p.bat && (
            <div className="chips">
              <Button variant="outlined" size="sm" disabled={!p.plans.length} onClick={() => setUi({ modal: { type: 'check', pid: p.id } })}>Log check-back</Button>
              <Button size="sm" onClick={() => setUi({ modal: { type: 'refer', pid: p.id, bid: anyRefBarrier } })}>Refer with context</Button>
            </div>
          )}
        </div>
        <div className="loop" aria-label="MAPS loop">
          {steps.map(s => <div key={s.n} className={`step ${s.st}`}><span className="sn">{s.n}</span><span className="sv">{s.v}</span><span className="ss">{s.s}</span></div>)}
        </div>
      </section>

      {p.transition && <Alert severity="neutral" icon={<UserIcon />}>{p.transition}</Alert>}

      <div className="tabs" role="tablist" aria-label="Patient sections">
        {([['overview', 'Overview'], ['meds', `Medications & pharmacy${refillAlerts ? ` (${refillAlerts})` : ''}`], ['history', 'History']] as const).map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={ui.ptab === k} className={ui.ptab === k ? 'on' : ''} onClick={() => setUi({ ptab: k })}>{l}</button>
        ))}
      </div>

      {ui.ptab === 'meds' && <MedsPanel p={p} />}

      {ui.ptab === 'history' && (
        <div className="pgrid">
          <div className="col">
            <section className="card panel">
              <h2>What's been tried</h2>
              {p.tried.length ? (
                <ul className="timeline">{[...p.tried].sort((x, y) => x.days - y.days).map((t, i) => (
                  <li key={i}><span className="when">{fmt(dayOf(t.days))}</span>
                    <span><b>{t.what}</b><br /><span className="res">{t.result} · {t.by}</span></span></li>
                ))}</ul>
              ) : <p className="muted">Nothing tried yet.</p>}
            </section>
            {p.respondent === 'both' && bs.length > 0 && <CompareTable p={p} />}
          </div>
          <div className="col">
            <section className="card panel">
              <h2>Check-ins from the app</h2>
              {p.checkins.length ? (
                <ul className="timeline">{p.checkins.map((c, i) => (
                  <li key={i}><span className="when">{fmt(dayOf(c.days))}</span>
                    <span>{c.missed > 0 && <><b style={{ color: 'var(--error)' }}>{c.missed} missed</b> · </>}{c.note}</span></li>
                ))}</ul>
              ) : <p className="muted">No check-ins yet.</p>}
            </section>
            {p.respondent !== 'patient' && p.caregiver && <PrivacyPanel p={p} />}
          </div>
        </div>
      )}

      {ui.ptab === 'overview' && (!p.bat ? (
        <div className="card panel">
          <h2>Waiting on the Barriers Assessment</h2>
          <p className="muted">
            Secure links went out {ago(p.linkSent ?? 0).toLowerCase()} by SMS to{' '}
            {p.respondent === 'both' ? `${p.first} and ${p.caregiver?.name}, each with their own link` : p.respondent === 'caregiver' ? p.caregiver?.name : 'the patient'}.
            Links expire after 72 hours; an automatic reminder goes out at 48 hours, so nobody needs to call yet.
          </p>
        </div>
      ) : (
        <div className="pgrid">
          <div className="col">
            {p.bat.words && (
              <section className="card words">
                <div className="eyebrow">In {p.respondent === 'caregiver' ? `${p.caregiver?.name}\u2019s` : `${p.first}\u2019s`} words · BAT {fmt(dayOf(p.bat.days))}</div>
                <blockquote>{'\u201c'}{p.bat.words}{'\u201d'}</blockquote>
                {p.bat.orig && <>
                  <p className="orig" dir={p.lang === 'ar' ? 'rtl' : undefined} lang={p.lang}>{p.bat.orig}</p>
                  <p className="help">Translated from {LANG[p.lang]}</p>
                </>}
              </section>
            )}
            <section className="card">
              <div className="panel" style={{ paddingBottom: 0 }}>
                <div className="section-title" style={{ margin: 0 }}><h2>Barriers and plans</h2>{bs.length > 0 && <span className="help">Each barrier has one owner and one plan</span>}</div>
              </div>
              {bs.length ? bs.map(bid => <BarrierCard key={bid} p={p} bid={bid} />)
                : <div className="bcard"><p className="muted">No barriers on the last BAT. Monthly check-ins continue in the app.</p></div>}
            </section>
          </div>
          <div className="col">
            <MedsSummary p={p} />
            <RiskPanel p={p} />
          </div>
        </div>
      ))}
    </div>
  );
}

function BarrierCard({ p, bid }: { p: Patient; bid: number }) {
  const { S, ui, setUi } = useClin();
  const coord = ui.user?.role === 'coord';
  const b = B(bid), o = ownerOf(S, bid), pl = planFor(p, bid), ref = refFor(S, p, bid);
  const rep = reporter(p, bid);
  const cg = p.caregiver;
  const repTxt = p.respondent === 'both'
    ? (rep === 'both' ? 'Patient and caregiver both reported' : rep === 'patient' ? `Only ${p.first} reported this` : `Only ${cg?.name} (${cg?.rel.toLowerCase()}) reported this`)
    : rep === 'caregiver' ? `Reported by ${cg?.name}` : `Reported by ${p.first}`;
  const priv = !!p.bat?.private.includes(bid);
  const respondentName = p.respondent === 'caregiver' ? cg?.name : p.first;

  let body;
  if (isReferralOwner(o)) {
    body = ref ? (
      <div className="plan">
        <span className="sol">Referred to {ownerShort(ref.to).toLowerCase()} · {RSTEPS[RIDX[ref.status]]}</span>
        {ref.plan && <span>{ref.plan}</span>}
        <span className="help">Sent {fmt(dayOf(ref.days))} by {ref.from}</span>
      </div>
    ) : coord ? (
      <div><Button size="sm" onClick={() => setUi({ modal: { type: 'refer', pid: p.id, bid } })}>Refer to {ownerShort(o).toLowerCase()} with context</Button></div>
    ) : <p className="help">Not referred yet.</p>;
  } else if (pl) {
    const chip = pl.outcome === 'working' ? <Chip tone="ok">Working{pl.durability ? ' · durability' : ''}</Chip>
      : pl.outcome === 'not' ? <Chip tone="neg">Not working</Chip>
      : <Chip tone="warn">{14 - pl.created <= 0 ? 'Check-back due' : `Check-back ${fmt(dayOf(pl.created - 14))}`}</Chip>;
    body = <>
      <div className="plan">
        <div className="btop"><span className="sol">{pl.solution}</span>{chip}</div>
        <dl className="kv">
          <div><dt>Who</dt><dd>{pl.who}</dd></div><div><dt>When</dt><dd>{pl.when}</dd></div>
          <div><dt>Where</dt><dd>{pl.where}</dd></div><div><dt>How</dt><dd>{pl.how}</dd></div>
        </dl>
        <span className="help">Agreed {fmt(dayOf(pl.created))}{pl.adjusted ? ' (adjusted)' : ''}{pl.checked != null ? ` · last checked ${fmt(dayOf(pl.checked))}` : ''}</span>
      </div>
      {pl.outcome === 'not' && coord && <div><Button size="sm" onClick={() => setUi({ modal: { type: 'plan', pid: p.id, bid } })}>Make a new plan</Button></div>}
    </>;
  } else {
    body = coord ? (
      <div className="chips">
        <Button size="sm" onClick={() => setUi({ modal: { type: 'plan', pid: p.id, bid } })}>Make plan with {respondentName}</Button>
        {b.self && <Chip tone="ok">Self-help tips already in the app</Chip>}
      </div>
    ) : <p className="help">No plan yet.</p>;
  }

  return (
    <div className="bcard">
      <div className="btop">
        <div><h3>{b.label}</h3><p className="help">{repTxt}</p></div>
        <Chip tone={isReferralOwner(o) ? 'violet' : 'neutral'}>Owner: {ownerShort(o)}</Chip>
      </div>
      {priv && <div className="alert neutral"><LockIcon /><span>{p.first} marked this private. {cg?.name} can't see it. Raise it with {p.first} alone.</span></div>}
      {body}
    </div>
  );
}

function CompareTable({ p }: { p: Patient }) {
  return (
    <section className="card panel">
      <h2>Patient and caregiver, answered separately</h2>
      <p className="help">Differences are a signal about the family, not an error. Highlighted rows don't match.</p>
      <div className="scroll">
        <table className="compare">
          <thead><tr><th>Barrier</th><th className="c">{p.first}</th><th className="c">{p.caregiver?.name}</th></tr></thead>
          <tbody>{allBarriers(p).map(bid => {
            const a = !!p.bat?.patient.includes(bid), c = !!p.bat?.caregiver.includes(bid), priv = !!p.bat?.private.includes(bid);
            return (
              <tr key={bid} className={a !== c ? 'mismatch' : ''}>
                <td>{B(bid).short}{priv && <> <span className="chip violet"><LockIcon />private</span></>}</td>
                <td className={`c ${a ? 'yes' : 'no'}`}>{a ? 'Yes' : 'No'}</td>
                <td className={`c ${c ? 'yes' : 'no'}`}>{c ? 'Yes' : 'No'}</td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    </section>
  );
}

function RiskPanel({ p }: { p: Patient }) {
  const t = p.risk.tac, s = tacSD(p), flag = s > 2;
  const mn = Math.min(...t) - 1, mx = Math.max(...t) + 1, W = 150, H = 40;
  const x = (i: number) => 6 + i * (W - 12) / (t.length - 1);
  const y = (v: number) => H - 6 - (v - mn) / (mx - mn) * (H - 12);
  const stroke = flag ? 'var(--error)' : 'var(--content-tertiary)';
  return (
    <section className="card panel">
      <h2>Risk signals from the chart</h2>
      <div className="sig">
        <div><b>Tacrolimus variability</b><div className="help">SD across last 4 draws · flag above 2.0</div></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Last 4 tacrolimus levels: ${t.join(', ')} ng/mL`}>
            <polyline points={t.map((v, i) => `${x(i)},${y(v)}`).join(' ')} fill="none" stroke={stroke} strokeWidth="1.6" />
            {t.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={i === t.length - 1 ? 3.5 : 2.5} fill={stroke} />)}
          </svg>
          <Chip tone={flag ? 'neg' : 'ok'}>SD {s.toFixed(1)}</Chip>
        </div>
      </div>
      <div className="sig"><span>Last labs</span><Chip tone={p.risk.labs > 42 ? 'neg' : 'neutral'}>{ago(p.risk.labs)}</Chip></div>
      <div className="sig"><span>Last clinic visit</span><Chip tone={p.risk.visit > 120 ? 'neg' : 'neutral'}>{ago(p.risk.visit)}</Chip></div>
      <p className="help">{riskFlags(p).length ? '' : 'No risk signals. '}Levels in ng/mL: {t.map(v => v.toFixed(1)).join(' · ')} (sample values).</p>
    </section>
  );
}

function PrivacyPanel({ p }: { p: Patient }) {
  const cg = p.caregiver!;
  const teen = ageOf(p.dob) >= 10 && p.respondent === 'both';
  return (
    <section className="card panel">
      <h2>What {cg.name} can see</h2>
      <ul className="timeline" style={{ gap: 8 }}>
        <li><span className="when">Sees</span><span>{teen ? `Their own BAT answers, reminders they help with, and plans ${p.first} chooses to share` : `Everything for ${p.first}: ${cg.name} is the respondent`}</span></li>
        {teen && <li><span className="when">Doesn't</span><span>{p.first}'s answers, private barriers and check-in notes</span></li>}
      </ul>
      {teen && <p className="help">Patients 10+ answer on their own phone. Responsibility shifts to {p.first} over time; at 18 caregiver access ends unless {p.first} keeps it.</p>}
    </section>
  );
}

/** Compact medication view on the Overview tab; the full record is on the Medications tab. */
function MedsSummary({ p }: { p: Patient }) {
  const { setUi } = useClin();
  if (!p.meds.length) return null;
  return (
    <section className="card panel">
      <div className="section-title" style={{ margin: 0 }}>
        <h2>Medications</h2>
        <button type="button" className="link" onClick={() => setUi({ ptab: 'meds' })}>Open full record</button>
      </div>
      {p.meds.map(rx => {
        const st = refillState(rx);
        return (
          <div key={rx.id} className="sig">
            <div><b>{rx.drug}</b><div className="help">{rx.dose} · {lcFirst(runOutLabel(rx))}</div></div>
            <Chip tone={REFILL_CHIP[st][0]}>{REFILL_CHIP[st][1]}</Chip>
          </div>
        );
      })}
    </section>
  );
}

// Coordinator landing: a short weekly to-do list instead of an alert stream.

import { useClin } from '../context';
import { LANG } from '../data';
import {
  B, RIDX, RSTEPS, TODAY, ageOf, allBarriers, dayOf, fmt, isPlanOwner, isReferralOwner,
  nameOf, ownerOf, ownerShort, planFor, quietWhy, refFor, refillState, refillsNeedingAction, statusOf, tasksAll,
} from '../logic';
import type { Task } from '../logic';
import { Accordion, Button, GlobeIcon, Indicator, StatusPill } from '../components/ui';

export default function ThisWeek() {
  const { S, go, update } = useClin();
  const tasks = tasksAll(S);
  const busy = new Set(tasks.map(t => t.p.id));
  const snoozed = S.patients.filter(p => p.snoozed);
  const quiet = S.patients.filter(p => !busy.has(p.id) && !p.snoozed);
  const openR = S.referrals.filter(r => r.status !== 'closed');
  const start = dayOf(TODAY.getDay() - 1), end = dayOf(TODAY.getDay() - 7);

  return (
    <div className="page">
      <div className="head">
        <div>
          <div className="eyebrow">Week of {fmt(start)} – {fmt(end)}</div>
          <h1 style={{ marginTop: 6 }}>This week</h1>
          <p className="lead">
            {tasks.length
              ? `${tasks.length} patient${tasks.length > 1 ? 's' : ''} need you this week. Everyone else is covered by a working plan, the patient app, or a referral.`
              : 'Nobody needs you right now.'}
          </p>
        </div>
        <Button onClick={() => go('enroll')}>+ Enroll Patient</Button>
      </div>

      <div className="indicators">
        <Indicator type={tasks.length ? 'negative' : 'positive'} value={tasks.length} label="Need you this week" />
        <Indicator type="positive" value={quiet.length} label="No action needed" />
        <Indicator type="heart-primary" value={openR.length} label="Referrals open with SW or psychology" />
        <Indicator type="head-primary" value={S.patients.filter(p => !p.bat).length} label="Waiting on a BAT" />
      </div>

      <div className="week">
        <section className="tasks" aria-label="To-do">
          {tasks.length ? tasks.map(t => <TaskCard key={t.p.id} t={t} />) : (
            <div className="card donebox"><div className="big">That's everyone for this week.</div><p className="muted">New items show up here only when a person needs to act.</p></div>
          )}
          {snoozed.length > 0 && (
            <p className="help">
              {snoozed.length} snoozed until next week:{' '}
              {snoozed.map(p => (
                <span key={p.id}>{nameOf(p)}{' '}
                  <button type="button" className="link" onClick={() => update(d => { d.patients.find(x => x.id === p.id)!.snoozed = false; })}>Undo</button>{' '}
                </span>
              ))}
            </p>
          )}
        </section>
        <aside className="aside">
          <Accordion title="No action needed" summary="already covered" defaultOpen>
            <p className="help acc-note">These patients don’t need a call this week. Each line says what’s covering them.</p>
            <ul className="quiet">{quiet.map(p => (
              <li key={p.id}><button type="button" className="qn" onClick={() => go('patient', p.id)}>{nameOf(p)}</button><span className="qw">{quietWhy(S, p)}</span></li>
            ))}</ul>
          </Accordion>
          <Accordion title="Referrals you sent" summary={`${openR.length} open`} defaultOpen>
            <ul className="quiet">{openR.length ? openR.map(r => (
              <li key={r.id}><button type="button" className="qn" onClick={() => go('patient', r.pid)}>{nameOf(S.patients.find(p => p.id === r.pid)!)}</button>
                <span className="qw">{ownerShort(r.to)} · {RSTEPS[RIDX[r.status]]}</span></li>
            )) : <li><span className="qw">None open</span></li>}</ul>
          </Accordion>
          <Accordion title="How this list works">
            <p className="help">One weekly list, no per-event alerts. A patient shows up only for a due check-back, a new barrier without a plan, an unrouted referral barrier, a refill that’s due or missed, a risk signal from the chart, or a closed referral. Refusal and safety items route the same day.</p>
          </Accordion>
        </aside>
      </div>
    </div>
  );
}

function TaskCard({ t }: { t: Task }) {
  const { S, go, setUi, update, toast } = useClin();
  const p = t.p;
  const sev = t.score >= 5 ? 'p3' : t.score >= 2 ? 'p2' : 'p1';
  const kinds = new Set(t.R.map(r => r.k));
  const bs = allBarriers(p);
  const needPlan = bs.find(b => isPlanOwner(ownerOf(S, b)) && !planFor(p, b)) ?? p.plans.find(x => x.outcome === 'not')?.bid;
  const needRef = bs.find(b => isReferralOwner(ownerOf(S, b)) && !refFor(S, p, b));
  const loop = t.R.find(r => r.k === 'loop');
  let primaryUsed = false;
  const variant = () => { const v = primaryUsed ? 'outlined' : 'filled'; primaryUsed = true; return v as 'outlined' | 'filled'; };

  return (
    <article className={`card task ${sev}`}>
      <div className="sev" aria-hidden="true" />
      <div className="body">
        <div className="row1">
          <button type="button" className="nm" onClick={() => go('patient', p.id)}>{nameOf(p)}</button>
          <span className="muted">{ageOf(p.dob)} yrs</span>
          <StatusPill status={statusOf(S, p)} />
          {p.lang !== 'en' && <span className="chip blue"><GlobeIcon />{LANG[p.lang]}</span>}
        </div>
        <ul className="reasons">
          {t.R.map((r, i) => <li key={i} className={`r-${r.k}`}><span className="dot" aria-hidden="true" /><span>{r.t}</span></li>)}
        </ul>
        <div className="acts">
          {kinds.has('refill') && <Button size="sm" variant={variant()} onClick={() => { update(d => { refillsNeedingAction(d.patients.find(x => x.id === p.id)!).forEach(rx => { rx.reminded = true; }); }); toast(`Refill reminder sent to ${nameOf(p)} and the pharmacy`); }}>Send refill reminder</Button>}
          {p.meds.some(rx => refillState(rx) === 'out') && <Button size="sm" variant={variant()} onClick={() => { go('patient', p.id); setUi({ ptab: 'meds' }); }}>View medications</Button>}
          {kinds.has('check') && <Button size="sm" variant={variant()} onClick={() => setUi({ modal: { type: 'check', pid: p.id } })}>Log check-back</Button>}
          {needPlan != null && <Button size="sm" variant={variant()} onClick={() => setUi({ modal: { type: 'plan', pid: p.id, bid: needPlan } })}>Make plan: {B(needPlan).short}</Button>}
          {needRef != null && <Button size="sm" variant={variant()} onClick={() => setUi({ modal: { type: 'refer', pid: p.id, bid: needRef } })}>Refer to {ownerShort(ownerOf(S, needRef)).toLowerCase()}</Button>}
          {loop?.rid && (
            <Button size="sm" variant={variant()} onClick={() => { update(d => { const r = d.referrals.find(x => x.id === loop.rid)!; r.ack = true; r.seen = true; }); toast('Loop closed'); }}>
              {loop.seen ? 'Got it' : 'Review & close loop'}
            </Button>
          )}
          <button type="button" className="link" onClick={() => go('patient', p.id)}>Open chart</button>
          <button type="button" className="link snz" onClick={() => { update(d => { d.patients.find(x => x.id === p.id)!.snoozed = true; }); toast(`${nameOf(p)} snoozed to next week`); }}>Snooze to next week</button>
        </div>
      </div>
    </article>
  );
}

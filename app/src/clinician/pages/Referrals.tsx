// Referral inbox (social work / psychology) and "Referrals sent" (coordinator).
// Each card shows the essentials; the full context sits behind "Show details".

import { useState } from 'react';
import type { ReactNode } from 'react';
import { useClin } from '../context';
import { LANG, ROLE_LABEL } from '../data';
import { B, RIDX, RSTEPS, ageOf, dayOf, disagreements, fmt, nameOf, riskFlags } from '../logic';
import type { Referral, Urgency } from '../types';
import { Button, Chip, ChevronIcon } from '../components/ui';

const URG: Record<Urgency, ['neg' | 'warn' | 'neutral', string]> = { urgent: ['neg', 'Same day'], week: ['warn', 'This week'], routine: ['neutral', 'Routine'] };
const URG_ORDER: Record<Urgency, number> = { urgent: 0, week: 1, routine: 2 };

export default function Referrals({ inbox }: { inbox: boolean }) {
  const { S, ui } = useClin();
  const list = inbox ? S.referrals.filter(r => r.to === ui.user?.role) : S.referrals;
  const open = list.filter(r => r.status !== 'closed').sort((a, b) => URG_ORDER[a.urgency] - URG_ORDER[b.urgency] || a.days - b.days);
  const closed = list.filter(r => r.status === 'closed');
  return (
    <div className="page">
      <div className="head"><div>
        <h1>{inbox ? 'Referral inbox' : 'Referrals sent'}</h1>
        <p className="lead">{inbox ? 'Most urgent first.' : 'Open until the owner closes it and sends a note back.'}</p>
      </div></div>
      <div className="rlist">
        {open.length ? open.map(r => <RefCard key={r.id} r={r} inbox={inbox} />) : <div className="card donebox"><div className="big">No open referrals.</div></div>}
      </div>
      {closed.length > 0 && <>
        <div className="section-title"><h2>Closed</h2></div>
        <div className="rlist">{closed.map(r => <RefCard key={r.id} r={r} inbox={inbox} />)}</div>
      </>}
    </div>
  );
}

function RefCard({ r, inbox }: { r: Referral; inbox: boolean }) {
  const { S, ui, go, update, toast } = useClin();
  const [text, setText] = useState('');
  const p = S.patients.find(x => x.id === r.pid)!;
  const me = ui.user!;
  const i = RIDX[r.status];
  const cg = p.caregiver;
  const tried = p.tried.filter(t => !/^Referred to/.test(t.what));

  const care: ReactNode[] = [];
  if (p.bat && r.bid != null && p.bat.private.includes(r.bid)) care.push(<>Private: {p.first} hasn't shared this with {cg?.name}</>);
  if (p.interpreter) care.push(<>{LANG[p.lang]} interpreter needed</>);
  if (p.respondent === 'caregiver') care.push(<>{cg?.name} ({cg?.rel.toLowerCase()}) answers for {p.first}</>);
  if (p.transition) care.push(<>Moving to adult care; patient now owns refills</>);
  riskFlags(p).forEach(f => care.push(<>{f}</>));
  const dis = disagreements(p);
  if (dis.length) care.push(<>Patient and caregiver differ on {dis.map(x => B(x).short.toLowerCase()).join(', ')}</>);

  const mutate = (fn: (x: Referral) => void) => update(d => { fn(d.referrals.find(x => x.id === r.id)!); });
  const advance = () => {
    const next = r.status === 'new' ? 'accepted' : 'contacted';
    mutate(x => { x.status = next; x.log.push({ days: 0, text: next === 'accepted' ? `Accepted by ${me.name.toLowerCase()}` : `First contact by ${me.name.toLowerCase()}` }); });
    toast(next === 'accepted' ? 'Accepted. The coordinator can see it.' : 'First contact logged');
  };
  const savePlan = () => {
    const v = text.trim();
    if (!v) { toast('Write the one solution first'); return; }
    update(d => {
      const x = d.referrals.find(y => y.id === r.id)!; x.plan = v; x.status = 'plan';
      d.patients.find(y => y.id === r.pid)!.tried.push({ days: 0, by: me.name, what: v, result: 'Plan agreed' });
    });
    setText(''); toast('Plan saved');
  };
  const close = () => {
    const v = text.trim();
    if (!v) { toast('Add a closing note for the coordinator'); return; }
    mutate(x => { x.closeNote = v; x.status = 'closed'; x.ack = false; });
    setText(''); toast('Closed and sent back to the coordinator');
  };

  let action: ReactNode = null;
  if (inbox) {
    if (r.status === 'new') action = <Button size="sm" onClick={advance}>Accept referral</Button>;
    else if (r.status === 'accepted') action = <Button size="sm" onClick={advance}>Log first contact</Button>;
    else if (r.status === 'contacted') action = <><input value={text} onChange={e => setText(e.target.value)} placeholder="One solution to try (who, what, when)" aria-label="Agreed plan" /><Button size="sm" onClick={savePlan}>Save plan</Button></>;
    else if (r.status === 'plan') action = <><input value={text} onChange={e => setText(e.target.value)} placeholder="Closing note for the coordinator" aria-label="Closing note" /><Button size="sm" onClick={close}>Close and send back</Button></>;
  } else if (r.status === 'closed' && !r.ack) {
    action = <Button size="sm" onClick={() => { mutate(x => { x.ack = true; x.seen = true; }); toast('Loop closed'); }}>Got it, close the loop</Button>;
  }

  return (
    <article className="card rc">
      <div className="rc-top">
        <div className="rc-who">
          <button type="button" className="rc-name" onClick={() => go('patient', p.id)}>{nameOf(p)}</button>
          <span className="muted">{ageOf(p.dob)} yrs</span>
          <Chip tone={URG[r.urgency][0]}>{URG[r.urgency][1]}</Chip>
        </div>
        <span className="rc-meta">{inbox ? `From ${r.from.toLowerCase()}` : `To ${ROLE_LABEL[r.to].label.toLowerCase()}`} · {fmt(dayOf(r.days))}</span>
      </div>

      <div className="rc-why">
        <b>{r.bid != null ? B(r.bid).label : r.flag}</b>
        {p.bat?.words
          ? <span className="rc-quote">{'“'}{p.bat.words}{'”'}</span>
          : <span className="rc-quote">{r.note}</span>}
      </div>

      <div className="rc-progress" aria-label={`Step ${i + 1} of 5: ${RSTEPS[i]}`}>
        <div className="rc-bar"><i style={{ width: `${(r.status === 'closed' ? 5 : i + 1) * 20}%` }} /></div>
        <span>{r.status === 'closed' ? 'Closed' : `${RSTEPS[i]} · step ${i + 1} of 5`}</span>
      </div>

      {(r.plan || r.closeNote) && (
        <div className="rc-plan">
          {r.plan && <p><span className="faint">Plan</span> {r.plan}</p>}
          {r.closeNote && <p><span className="faint">Closing note</span> {r.closeNote}</p>}
        </div>
      )}

      <details className="rc-more">
        <summary>Show details <ChevronIcon /></summary>
        <div className="rc-cols">
          <div><h4>Coordinator's note</h4><p>{r.note}</p></div>
          <div><h4>Already tried</h4>
            {tried.length ? <ul>{tried.map((t, k) => <li key={k}>{t.what} · <span className="faint">{t.result}</span></li>)}</ul> : <p className="faint">Nothing yet.</p>}
          </div>
          <div><h4>Handle with care</h4>
            {care.length ? <ul>{care.map((n, k) => <li key={k}>{n}</li>)}</ul> : <p className="faint">Nothing flagged.</p>}
          </div>
        </div>
      </details>

      {action && <div className="ract">{action}</div>}
    </article>
  );
}

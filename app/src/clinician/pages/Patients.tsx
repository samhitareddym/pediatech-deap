// Active Patients table (Table 15 + Search Bar 19 + filter chips 08).

import { useClin } from '../context';
import { LANG } from '../data';
import { B, ago, ageOf, allBarriers, dobFmt, isReferralOwner, nameOf, openRefs, ownerOf, ownerShort, refillState, statusOf } from '../logic';
import type { Patient, Status } from '../types';
import { Button, RefPill, SearchIcon, StatusPill } from '../components/ui';
import RespondentChip from '../components/RespondentChip';

const FILTERS: ['all' | Status, string][] = [
  ['all', 'All'], ['attention', 'Needs Attention'], ['followup', 'Follow-up Due'], ['ontrack', 'On Track'], ['awaiting', 'Awaiting BAT'],
];
const ORDER: Record<Status, number> = { attention: 0, followup: 1, awaiting: 2, ontrack: 3 };

export default function Patients() {
  const { S, ui, setUi, go } = useClin();
  const coord = ui.user?.role === 'coord';
  let list: Patient[] = S.patients;
  if (!coord) { const ids = new Set(S.referrals.filter(r => r.to === ui.user?.role).map(r => r.pid)); list = list.filter(p => ids.has(p.id)); }
  if (ui.filter !== 'all') list = list.filter(p => statusOf(S, p) === ui.filter);
  if (ui.q) list = list.filter(p => `${p.first} ${p.last}`.toLowerCase().includes(ui.q.toLowerCase()));
  list = [...list].sort((a, b) => ORDER[statusOf(S, a)] - ORDER[statusOf(S, b)]);

  return (
    <div className="page">
      <div className="head">
        <div>
          <h1>{coord ? 'Active Patients' : 'My Patients'}</h1>
          <p className="lead">{coord ? 'Sorted so the patients who need a person come first.' : 'Only patients with a referral to you. Answers and history come with the referral.'}</p>
        </div>
        {coord && <Button onClick={() => go('enroll')}>+ Enroll Patient</Button>}
      </div>
      <div className="filters">
        <div className="seg" role="group" aria-label="Filter by status">
          {FILTERS.map(([k, l]) => <button key={k} type="button" aria-pressed={ui.filter === k} onClick={() => setUi({ filter: k })}>{l}</button>)}
        </div>
        <div className="searchbox"><SearchIcon />
          <input className="search" type="search" placeholder="Search by name" aria-label="Search patients" value={ui.q} onChange={e => setUi({ q: e.target.value })} />
        </div>
      </div>
      <div className="card ptable" role="table">
        <div className="prow hd" role="row"><span>Patient</span><span>Primary barrier, in their words</span><span>Owner</span><span>Last check-in</span><span>Status</span></div>
        {list.length === 0 && <p className="help" style={{ padding: 22 }}>No patients match.</p>}
        {list.map(p => {
          const bs = allBarriers(p);
          const owners = [...new Set(bs.map(b => ownerOf(S, b)))];
          const refs = openRefs(S, p);
          return (
            <button key={p.id} type="button" className="prow" role="row" onClick={() => go('patient', p.id)}>
              <span className="cellstack"><span className="pn">{nameOf(p)}</span><span className="pd">{ageOf(p.dob)} yrs · DOB {dobFmt(p.dob)}</span></span>
              <span className="cellstack">
                {p.bat?.words ? <span className="quote">{'“'}{p.bat.words}{'”'}</span> : <span className="quote empty">{p.bat ? 'No barriers reported' : '—'}</span>}
                <span className="chips">
                  {bs.map(b => <span key={b} className="chip">{B(b).short}</span>)}
                  <RespondentChip p={p} />
                  {p.lang !== 'en' && <span className="chip blue">{LANG[p.lang]}</span>}
                </span>
              </span>
              <span className="cellstack">
                {owners.length ? owners.map(o => <span key={o} className={`chip${isReferralOwner(o) ? ' violet' : ''}`}>{ownerShort(o)}</span>) : <span className="faint">{'—'}</span>}
              </span>
              <span className="num">{p.checkins.length ? ago(p.checkins[0].days) : '—'}</span>
              <span className="cellstack">
                <StatusPill status={statusOf(S, p)} />
                {p.meds.some(rx => ['out', 'due'].includes(refillState(rx))) && <span className="chip warn">Refill due</span>}
                {refs.length > 0 && <RefPill>With {refs.map(r => ownerShort(r.to).toLowerCase()).join(' & ')}</RefPill>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

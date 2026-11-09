// Is the loop closing? Indicator cards (21) plus simple bars, computed from the demo data.

import { useClin } from '../context';
import { B, allBarriers, isReferralOwner, ownerOf, planFor, refFor, tacSD } from '../logic';
import { Indicator } from '../components/ui';

export default function Reports() {
  const { S } = useClin();
  const pats = S.patients.filter(p => p.bat);
  const counts: Record<number, number> = {};
  pats.forEach(p => allBarriers(p).forEach(b => { counts[b] = (counts[b] ?? 0) + 1; }));
  const withBarrier = pats.filter(p => allBarriers(p).length).length;
  const totalB = Object.values(counts).reduce((s, x) => s + x, 0);
  const owned = pats.reduce((s, p) => s + allBarriers(p).filter(b => planFor(p, b) || refFor(S, p, b)).length, 0);
  const plans = S.patients.flatMap(p => p.plans);
  const due = plans.filter(x => x.created >= 14 || x.outcome);
  const checked = due.filter(x => x.outcome);
  const max = Math.max(1, ...Object.values(counts));
  const outcomes = { working: plans.filter(x => x.outcome === 'working').length, pending: plans.filter(x => x.outcome === null).length, not: plans.filter(x => x.outcome === 'not').length };
  const flagged = pats.filter(p => tacSD(p) > 2).length;
  const pct = (a: number, b: number) => (b ? Math.round(a / b * 100) : 0);

  return (
    <div className="page">
      <div className="head"><div>
        <h1>Reports</h1>
        <p className="lead">Is the loop closing? Computed live from the demo data, so it changes as you work.</p>
      </div></div>
      <div className="indicators">
        <Indicator type="head-primary" value={withBarrier} total={pats.length} label="Patients reporting at least one barrier" />
        <Indicator type="positive" value={`${pct(owned, totalB)}%`} label={`Barriers with a plan or referral (${owned} of ${totalB})`} />
        <Indicator type="warning" value={`${pct(checked.length, due.length)}%`} label={`Plans checked back by 2 weeks (${checked.length} of ${due.length})`} />
        <Indicator type="heart-primary" value={S.referrals.filter(r => r.status === 'closed').length} total={S.referrals.length} label="Referrals closed back to the coordinator" />
      </div>
      <div className="rgrid">
        <section className="card panel">
          <h2>Barriers reported, by owner</h2>
          <div className="bars">
            {Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([bid, n]) => (
              <div key={bid} className="bar"><span>{B(+bid).short}</span>
                <span className="track"><span className={`fill ${isReferralOwner(ownerOf(S, +bid)) ? 'sw' : ''}`} style={{ width: `${n / max * 100}%`, display: 'block' }} /></span>
                <span className="n">{n}</span></div>
            ))}
          </div>
          <p className="help"><span className="chip blue">Teal</span> coordinator or prescriber · <span className="chip violet">Magenta</span> social work or psychology</p>
        </section>
        <section className="card panel">
          <h2>Plan outcomes</h2>
          <div className="bars">
            {([['Working', outcomes.working, 'var(--head-secondary)'], ['Waiting on check-back', outcomes.pending, 'var(--warning)'], ['Not working', outcomes.not, 'var(--error)']] as const).map(([l, n, c]) => (
              <div key={l} className="bar"><span>{l}</span>
                <span className="track"><span className="fill" style={{ width: `${n / Math.max(1, plans.length) * 100}%`, display: 'block', background: c }} /></span>
                <span className="n">{n}</span></div>
            ))}
          </div>
          <h2 style={{ marginTop: 12 }}>Risk signals</h2>
          <div className="bars">
            <div className="bar"><span>Tacrolimus SD above 2</span>
              <span className="track"><span className="fill" style={{ width: `${flagged / Math.max(1, pats.length) * 100}%`, display: 'block', background: 'var(--error)' }} /></span>
              <span className="n">{flagged}</span></div>
          </div>
          <p className="help">What would show it works over months: barriers resolved, check-backs on time, steadier tacrolimus levels, fewer late rejections.</p>
        </section>
      </div>
    </div>
  );
}

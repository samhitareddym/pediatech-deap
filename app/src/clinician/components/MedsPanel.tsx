// Prescriptions on a patient's profile: dose, pharmacy, fill history, run-out date,
// dose changes and the attached prescription. Refill alerts come from the run-out date.

import { useClin } from '../context';
import { REFILL_CHIP, dayOf, daysLeft, fmt, refillState, runOutLabel, supplyDays } from '../logic';
import type { Patient, Prescription } from '../types';
import { Button, Chip } from './ui';


export default function MedsPanel({ p }: { p: Patient }) {
  if (!p.meds.length) {
    return (
      <section className="card panel">
        <h2>Medications</h2>
        <p className="muted">No prescriptions on file yet. They appear here once the pharmacy record syncs or the team adds one.</p>
      </section>
    );
  }
  return (
    <div className="col">
      {p.meds.map(rx => <RxCard key={rx.id} p={p} rx={rx} />)}
      <p className="help">Sample prescriptions and doses for the demo, not clinical guidance.</p>
    </div>
  );
}

function RxCard({ p, rx }: { p: Patient; rx: Prescription }) {
  const { ui, setUi, update, toast } = useClin();
  const coord = ui.user?.role === 'coord';
  const st = refillState(rx);
  const left = daysLeft(rx);
  const fill = rx.fills[0];
  const mutate = (fn: (x: Prescription) => void) =>
    update(d => { fn(d.patients.find(x => x.id === p.id)!.meds.find(m => m.id === rx.id)!); });

  const attach = (file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    mutate(x => { x.attachment = { name: file.name, days: 0, url }; });
    toast(`${file.name} attached to ${rx.drug}`);
  };

  return (
    <section className={`card rx rx-${st}`}>
      <div className="rx-head">
        <div>
          <h3>{rx.drug} <span className="faint">{rx.form}</span></h3>
          <p className="rx-dose">{rx.dose}</p>
        </div>
        <Chip tone={REFILL_CHIP[st][0]}>{REFILL_CHIP[st][1]}</Chip>
      </div>

      <dl className="rx-facts">
        <div><dt>Supply</dt><dd>{runOutLabel(rx)}</dd></div>
        <div><dt>Last fill</dt><dd>{fill ? `${fmt(dayOf(fill.days))} · ${fill.qty} ${rx.unit} (${supplyDays(rx)} days)` : '—'}</dd></div>
        <div><dt>Pharmacy</dt><dd>{rx.pharmacy.name}<br /><span className="faint">{rx.pharmacy.phone}</span></dd></div>
        <div><dt>Refills left</dt><dd className={rx.refillsLeft === 0 ? 'err' : ''}>{rx.refillsLeft}{rx.refillsLeft === 0 ? ' · needs a new prescription' : ''}</dd></div>
        <div><dt>Prescriber</dt><dd>{rx.prescriber}</dd></div>
        <div><dt>Daily use</dt><dd>{rx.perDay} {rx.unit} a day</dd></div>
      </dl>

      {left != null && (
        <div className="rx-meter" aria-hidden="true">
          <i style={{ width: `${Math.max(0, Math.min(100, (left / Math.max(1, supplyDays(rx))) * 100))}%` }} />
        </div>
      )}

      <div className="rx-grid">
        <div>
          <h4>Fill history</h4>
          <table className="mini-table">
            <thead><tr><th>Date</th><th>Quantity</th><th>Pharmacy</th></tr></thead>
            <tbody>{rx.fills.map((f, k) => (
              <tr key={k}><td>{fmt(dayOf(f.days))}</td><td className="num">{f.qty} {rx.unit}</td><td>{f.pharmacy}</td></tr>
            ))}</tbody>
          </table>
        </div>
        <div>
          <h4>Dose changes</h4>
          {rx.doseHistory.length ? (
            <ul className="dose-list">{rx.doseHistory.map((c, k) => (
              <li key={k}><span className="faint">{fmt(dayOf(c.days))}</span> {c.from} {'→'} <b>{c.to}</b><br /><span className="faint">{c.reason} · {c.by}</span></li>
            ))}</ul>
          ) : <p className="faint">No changes since this prescription started.</p>}
        </div>
      </div>

      <div className="rx-attach">
        <span className="file-ic" aria-hidden="true">PDF</span>
        {rx.attachment ? (
          <span>
            {rx.attachment.url
              ? <a href={rx.attachment.url} target="_blank" rel="noreferrer">{rx.attachment.name}</a>
              : <b>{rx.attachment.name}</b>}
            <span className="faint"> · added {fmt(dayOf(rx.attachment.days))}</span>
          </span>
        ) : <span className="faint">No prescription attached</span>}
        {coord && (
          <label className="link attach-btn">
            {rx.attachment ? 'Replace' : 'Attach prescription'}
            <input type="file" accept=".pdf,image/*" hidden onChange={e => attach(e.target.files?.[0])} />
          </label>
        )}
      </div>

      <div className="ract">
        {(st === 'due' || st === 'out' || st === 'soon') && (
          rx.reminded ? <Chip tone="ok">Reminder sent to patient and pharmacy</Chip>
            : <Button size="sm" onClick={() => { mutate(x => { x.reminded = true; }); toast(`Refill reminder sent to ${p.first} and ${rx.pharmacy.name}`); }}>Send refill reminder</Button>
        )}
        {coord && <Button size="sm" variant="outlined" onClick={() => setUi({ modal: { type: 'fill', pid: p.id, rxId: rx.id } })}>Log a fill</Button>}
        {coord && <Button size="sm" variant="outlined" onClick={() => setUi({ modal: { type: 'dose', pid: p.id, rxId: rx.id } })}>Record dose change</Button>}
      </div>
    </section>
  );
}

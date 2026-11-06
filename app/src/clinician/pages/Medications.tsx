// Every active prescription across the panel, sorted by who runs out first.

import { useClin } from '../context';
import { REFILL_CHIP, dayOf, daysLeft, fmt, nameOf, refillState, runOutLabel } from '../logic';
import type { Patient, Prescription } from '../types';
import { Button, Chip, Indicator } from '../components/ui';

export default function Medications() {
  const { S, go, setUi, update, toast } = useClin();
  const rows: { p: Patient; rx: Prescription; left: number }[] = [];
  S.patients.forEach(p => p.meds.forEach(rx => rows.push({ p, rx, left: daysLeft(rx) ?? 999 })));
  rows.sort((a, b) => a.left - b.left);
  const out = rows.filter(r => refillState(r.rx) === 'out').length;
  const due = rows.filter(r => refillState(r.rx) === 'due').length;
  const noRefills = rows.filter(r => r.rx.refillsLeft === 0).length;

  const remind = (p: Patient, rx: Prescription) => {
    update(d => { d.patients.find(x => x.id === p.id)!.meds.find(m => m.id === rx.id)!.reminded = true; });
    toast(`Refill reminder sent to ${p.first} and ${rx.pharmacy.name}`);
  };

  return (
    <div className="page">
      <div className="head"><div>
        <h1>Medications</h1>
        <p className="lead">Run-out dates come from each pharmacy fill and the current dose. A dose change moves the date automatically.</p>
      </div></div>
      <div className="indicators">
        <Indicator type={out ? 'negative' : 'positive'} value={out} label="Out of medicine now" />
        <Indicator type="warning" value={due} label="Run out within 5 days" />
        <Indicator type="heart-primary" value={noRefills} label="No refills left on the prescription" />
        <Indicator type="head-primary" value={rows.length} label="Active prescriptions" />
      </div>
      <div className="card scroll">
        <table className="route meds-table">
          <thead><tr><th>Patient</th><th>Medication and dose</th><th>Supply</th><th>Last fill</th><th>Pharmacy</th><th>Refills</th><th /></tr></thead>
          <tbody>{rows.map(({ p, rx }) => {
            const st = refillState(rx);
            return (
              <tr key={rx.id}>
                <td><button type="button" className="qn" onClick={() => { go('patient', p.id); setUi({ ptab: 'meds' }); }}>{nameOf(p)}</button></td>
                <td><b>{rx.drug}</b><br /><span className="faint">{rx.dose}</span></td>
                <td><Chip tone={REFILL_CHIP[st][0]}>{REFILL_CHIP[st][1]}</Chip><br /><span className="faint">{runOutLabel(rx)}</span></td>
                <td>{rx.fills[0] ? fmt(dayOf(rx.fills[0].days)) : '—'}</td>
                <td>{rx.pharmacy.name}</td>
                <td className={`num${rx.refillsLeft === 0 ? ' err' : ''}`}>{rx.refillsLeft}</td>
                <td>{(st === 'out' || st === 'due') && (rx.reminded
                  ? <span className="faint">Reminder sent</span>
                  : <Button size="sm" variant="outlined" onClick={() => remind(p, rx)}>Send reminder</Button>)}</td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    </div>
  );
}

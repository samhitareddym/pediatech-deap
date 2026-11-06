// Check-back, plan and referral dialogs. ModalHost renders whichever one ui.modal names.

import { useState } from 'react';
import { useClin } from '../context';
import { LANG, MI_STARTERS, PLAN_OPTIONS, ROLE_LABEL } from '../data';
import { sendHandoff } from '../../handoff';
import { B, allBarriers, dayOf, daysLeft, fmt, fmtDow, isReferralOwner, nameOf, ownerOf, riskFlags, runOutLabel, lcFirst } from '../logic';
import type { Patient, Prescription, ReferralRole, Urgency } from '../types';
import { Button, Modal } from './ui';

export default function ModalHost() {
  const { S, ui, setUi } = useClin();
  const m = ui.modal;
  if (!m) return null;
  const p = S.patients.find(x => x.id === m.pid);
  if (!p) return null;
  const close = () => setUi({ modal: null });
  if (m.type === 'check') return <CheckBackModal p={p} onClose={close} />;
  if (m.type === 'plan') return <PlanModal p={p} bid={m.bid} onClose={close} />;
  if (m.type === 'dose' || m.type === 'fill') {
    const rx = p.meds.find(x => x.id === m.rxId);
    if (!rx) return null;
    return m.type === 'dose' ? <DoseModal p={p} rx={rx} onClose={close} /> : <FillModal p={p} rx={rx} onClose={close} />;
  }
  return <ReferModal p={p} bid={m.bid} onClose={close} />;
}

type Choice = 'working' | 'adjust' | 'not' | '';

function CheckBackModal({ p, onClose }: { p: Patient; onClose: () => void }) {
  const { ui, update, toast } = useClin();
  const [choice, setChoice] = useState<Choice[]>(p.plans.map(pl => (pl.outcome === 'working' ? 'working' : '')));
  const [adj, setAdj] = useState<string[]>(p.plans.map(() => ''));
  const me = ui.user!.name;

  const save = () => {
    if (!choice.some(c => c)) { toast('Pick an outcome for at least one plan'); return; }
    update(d => {
      const dp = d.patients.find(x => x.id === p.id)!;
      dp.plans.forEach((pl, k) => {
        const c = choice[k];
        if (c === 'working') { pl.outcome = 'working'; pl.checked = 0; dp.tried.push({ days: 0, by: me, what: pl.solution, result: 'Check-back: working' }); }
        if (c === 'not') { pl.outcome = 'not'; dp.tried.push({ days: 0, by: me, what: pl.solution, result: 'Check-back: not working' }); }
        if (c === 'adjust') {
          const nv = adj[k].trim();
          dp.tried.push({ days: 0, by: me, what: pl.solution, result: `Adjusted${nv ? ': ' + nv : ''}` });
          if (nv) pl.solution = nv;
          pl.created = 0; pl.outcome = null; pl.adjusted = true;
        }
      });
    });
    onClose(); toast('Check-back saved');
  };

  return (
    <Modal title={`Check-back · ${nameOf(p)}`} onClose={onClose} onSubmit={save}
      footer={<><Button variant="outlined" onClick={onClose}>Cancel</Button><Button type="submit">Save check-back</Button></>}>
      <p className="help">Ask how each plan is going: working, not working, or adjust it.{p.interpreter ? ` Use an ${LANG[p.lang]} interpreter.` : ''}</p>
      {p.plans.map((pl, k) => (
        <div key={pl.bid} className="field">
          <span className="flabel">{B(pl.bid).short} · {pl.solution}</span>
          <div className="radios">
            {([['working', 'Working', 'move to monthly durability checks in the app'], ['adjust', 'Adjust it', ''], ['not', 'Not working', 'stays on your list for a new plan or a referral']] as const).map(([v, l, d]) => (
              <label key={v} className="radio">
                <input type="radio" name={`o${k}`} checked={choice[k] === v} onChange={() => setChoice(cs => cs.map((c, j) => (j === k ? v : c)))} />
                <span><b>{l}</b>{d && ` · ${d}`}
                  {v === 'adjust' && <input className="tf" style={{ marginTop: 6, padding: '8px 12px', fontSize: 14 }} placeholder="What changes?" value={adj[k]}
                    onChange={e => { const val = e.target.value; setAdj(a => a.map((x, j) => (j === k ? val : x))); setChoice(cs => cs.map((c, j) => (j === k ? 'adjust' : c))); }} />}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </Modal>
  );
}

function PlanModal({ p, bid, onClose }: { p: Patient; bid: number; onClose: () => void }) {
  const { ui, update, toast } = useClin();
  const b = B(bid);
  const opts = PLAN_OPTIONS[b.kind] ?? [];
  const prefs = p.prefs[bid] ?? [];
  const who = (p.respondent === 'caregiver' ? p.caregiver?.name : p.first) ?? p.first;
  const [f, setF] = useState({ sol: '', who, when: '', where: '', how: '' });
  const set = (k: keyof typeof f, v: string) => setF(prev => ({ ...prev, [k]: v }));

  const save = () => {
    if (!f.sol.trim()) { toast('Pick or write one solution'); return; }
    update(d => {
      const dp = d.patients.find(x => x.id === p.id)!;
      dp.plans = dp.plans.filter(x => x.bid !== bid);
      dp.plans.push({ bid, solution: f.sol.trim(), who: f.who || '—', when: f.when || '—', where: f.where || '—', how: f.how || '—', created: 0, outcome: null });
      dp.tried.push({ days: 0, by: ui.user!.name, what: f.sol.trim(), result: 'Plan agreed; check-back in 2 weeks' });
    });
    if (p.id === 'anna') sendHandoff({ reply: { at: Date.now(), by: `Your ${ui.user!.name.toLowerCase()}`, text: `Thanks for telling us the taste is hard. Let's try: ${f.sol.trim()}${f.when ? ` (${f.when})` : ''}. Reply anytime if it doesn't help.` } });
    onClose(); toast(p.id === 'anna' ? `Plan saved and sent to ${p.first}'s app.` : `Plan saved. Check-back ${fmt(dayOf(-14))}.`);
  };

  return (
    <Modal title={`Plan for ${b.short.toLowerCase()} · ${nameOf(p)}`} onClose={onClose} onSubmit={save}
      footer={<><Button variant="outlined" onClick={onClose}>Cancel</Button><Button type="submit">Save plan</Button></>}>
      {p.bat?.words && <div className="why" style={{ margin: 0 }}><span className="eyebrow">In their words</span><span className="q">{'“'}{p.bat.words}{'”'}</span></div>}
      <div className="mi"><b>Conversation starters</b> <span className="faint">(prepares the talk; it doesn't replace it)</span>
        <ul>{(MI_STARTERS[b.kind] ?? []).map(q => <li key={q}>{q}</li>)}</ul></div>
      <div className="field">
        <span className="flabel">Options from the action plan{prefs.length > 0 && <span style={{ color: 'var(--head-secondary)' }}> · green = {who} flagged it as doable in the app</span>}</span>
        <div className="opts">{opts.map(o => (
          <button key={o} type="button" className={`opt${prefs.includes(o) ? ' pref' : ''}`} onClick={() => set('sol', o)}>{prefs.includes(o) ? '✓ ' : ''}{o}</button>
        ))}</div>
      </div>
      <div className="field"><label htmlFor="pl-sol">The one solution {who} agreed to try</label>
        <input id="pl-sol" value={f.sol} onChange={e => set('sol', e.target.value)} placeholder="Pick an option above or write your own" /></div>
      <div className="f2">
        <div className="field"><label htmlFor="pl-who">Who</label><input id="pl-who" value={f.who} onChange={e => set('who', e.target.value)} /></div>
        <div className="field"><label htmlFor="pl-when">When</label><input id="pl-when" value={f.when} onChange={e => set('when', e.target.value)} placeholder="e.g. 8:00 pm, after dinner" /></div>
        <div className="field"><label htmlFor="pl-where">Where</label><input id="pl-where" value={f.where} onChange={e => set('where', e.target.value)} placeholder="e.g. Home, backpack" /></div>
        <div className="field"><label htmlFor="pl-how">How</label><input id="pl-how" value={f.how} onChange={e => set('how', e.target.value)} placeholder="e.g. Reminder labeled 'vitamins'" /></div>
      </div>
      <p className="help">Check-back goes on your list for {fmtDow(dayOf(-14))}. The app sends {who} the plan in {LANG[p.lang]}.</p>
    </Modal>
  );
}

function ReferModal({ p, bid, onClose }: { p: Patient; bid: number | null; onClose: () => void }) {
  const { S, ui, update, toast } = useClin();
  const options = allBarriers(p).filter(b => isReferralOwner(ownerOf(S, b)));
  const initial = bid ?? options[0] ?? null;
  const ownerTo = (b: number | null): ReferralRole => (b != null && ownerOf(S, b) === 'psych' ? 'psych' : 'sw');
  const [sel, setSel] = useState<number | null>(initial);
  const [to, setTo] = useState<ReferralRole>(ownerTo(initial));
  const [urgency, setUrgency] = useState<Urgency>(initial != null && B(initial).urgent ? 'urgent' : 'week');
  const [note, setNote] = useState('');
  const tried = p.tried.map(t => `${t.what}: ${t.result}`);
  const flags = riskFlags(p);

  const send = () => {
    const me = ui.user!.name;
    update(d => {
      d.referrals.push({ id: 'r' + Date.now(), pid: p.id, bid: sel, flag: sel == null ? 'Team flag' : null, to, urgency, status: 'new', days: 0,
        from: me, note: note.trim() || 'See BAT answers and history.', plan: '', closeNote: '', ack: false, log: [{ days: 0, text: `Sent by ${me}` }] });
      d.patients.find(x => x.id === p.id)!.tried.push({ days: 0, by: me, what: `Referred to ${ROLE_LABEL[to].short.toLowerCase()}`, result: 'Waiting for the owner to accept' });
    });
    onClose(); toast(`Sent to ${ROLE_LABEL[to].short.toLowerCase()} with BAT answers and history`);
  };

  return (
    <Modal title={`Refer ${nameOf(p)} with context`} onClose={onClose} onSubmit={send}
      footer={<><Button variant="outlined" onClick={onClose}>Cancel</Button><Button type="submit">Send referral</Button></>}>
      <div className="f2">
        <div className="field"><label htmlFor="rf-b">Barrier</label>
          <select id="rf-b" value={sel ?? ''} onChange={e => { const v = e.target.value ? +e.target.value : null; setSel(v); setTo(ownerTo(v)); if (v != null && B(v).urgent) setUrgency('urgent'); }}>
            {options.map(b => <option key={b} value={b}>{B(b).label}</option>)}
            <option value="">Team flag (not on the BAT)</option>
          </select></div>
        <div className="field"><label htmlFor="rf-to">Send to</label>
          <select id="rf-to" value={to} onChange={e => setTo(e.target.value as ReferralRole)}>
            <option value="sw">{ROLE_LABEL.sw.label}</option><option value="psych">{ROLE_LABEL.psych.label}</option>
          </select></div>
      </div>
      <div className="field"><label htmlFor="rf-u">How soon</label>
        <select id="rf-u" value={urgency} onChange={e => setUrgency(e.target.value as Urgency)}>
          <option value="week">This week</option><option value="routine">Routine</option><option value="urgent">Same day</option>
        </select></div>
      <div className="field"><label htmlFor="rf-note">The why, in a sentence or two</label>
        <textarea id="rf-note" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Night shifts break any fixed-time plan. Wants something tied to the end of a shift." /></div>
      <div className="field"><span className="flabel">Travels with the referral automatically</span>
        <ul className="help" style={{ margin: 0, paddingLeft: 18 }}>
          <li>BAT answers from {p.respondent === 'both' ? 'patient and caregiver, side by side' : 'the respondent'}</li>
          <li>What's been tried: {tried.length ? tried.join('; ') : 'nothing yet'}</li>
          <li>Risk signals: {flags.length ? flags.join('; ') : 'none flagged'}</li>
          {p.interpreter && <li>{LANG[p.lang]} interpreter needed</li>}
          {(p.bat?.private.length ?? 0) > 0 && <li>Which answers are private from the caregiver</li>}
        </ul></div>
    </Modal>
  );
}

/** A prescriber changed the dose. Updates daily use, so the run-out date moves with it. */
function DoseModal({ p, rx, onClose }: { p: Patient; rx: Prescription; onClose: () => void }) {
  const { update, toast } = useClin();
  const [dose, setDose] = useState('');
  const [perDay, setPerDay] = useState(String(rx.perDay));
  const [reason, setReason] = useState('');
  const [by, setBy] = useState('Nephrology');
  const per = Number(perDay);
  const preview: Prescription = { ...rx, perDay: per > 0 ? per : rx.perDay };

  const save = () => {
    if (!dose.trim()) { toast('Enter the new dose'); return; }
    if (!(per > 0)) { toast(`Enter how many ${rx.unit} a day`); return; }
    update(d => {
      const x = d.patients.find(y => y.id === p.id)!.meds.find(m => m.id === rx.id)!;
      x.doseHistory.unshift({ days: 0, from: x.dose, to: dose.trim(), by, reason: reason.trim() || 'Dose adjusted' });
      x.dose = dose.trim(); x.perDay = per; x.reminded = false;
    });
    onClose();
    const left = daysLeft(preview);
    toast(`Dose updated. ${p.first}'s app and ${rx.pharmacy.name} are notified${left != null && left <= 5 ? '; a refill is now due' : ''}.`);
  };

  return (
    <Modal title={`Dose change · ${rx.drug}`} onClose={onClose} onSubmit={save}
      footer={<><Button variant="outlined" onClick={onClose}>Cancel</Button><Button type="submit">Save dose change</Button></>}>
      <p className="help">{nameOf(p)} · current dose <b>{rx.dose}</b> ({rx.perDay} {rx.unit} a day)</p>
      <div className="f2">
        <div className="field"><label htmlFor="d-dose">New dose</label><input id="d-dose" value={dose} onChange={e => setDose(e.target.value)} placeholder="e.g. 3 mg twice daily" /></div>
        <div className="field"><label htmlFor="d-per">{rx.unit[0].toUpperCase() + rx.unit.slice(1)} per day</label><input id="d-per" inputMode="decimal" value={perDay} onChange={e => setPerDay(e.target.value)} /></div>
      </div>
      <div className="f2">
        <div className="field"><label htmlFor="d-by">Ordered by</label>
          <select id="d-by" value={by} onChange={e => setBy(e.target.value)}>
            <option>Nephrology</option><option>Nurse practitioner</option><option>Transplant pharmacist</option>
          </select></div>
        <div className="field"><label htmlFor="d-why">Reason</label><input id="d-why" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Trough level above target" /></div>
      </div>
      <div className="alert info"><span>New supply estimate: {lcFirst(runOutLabel(preview))}. The patient app shows the new dose and the pharmacy gets the change.</span></div>
    </Modal>
  );
}

/** The pharmacy dispensed medicine: date, quantity and where. Resets the run-out date. */
function FillModal({ p, rx, onClose }: { p: Patient; rx: Prescription; onClose: () => void }) {
  const { update, toast } = useClin();
  const [qty, setQty] = useState(String(rx.fills[0]?.qty ?? rx.perDay * 30));
  const [ago, setAgo] = useState('0');
  const [pharmacy, setPharmacy] = useState(rx.pharmacy.name);
  const q = Number(qty), a = Math.max(0, Math.round(Number(ago) || 0));

  const save = () => {
    if (!(q > 0)) { toast('Enter the quantity dispensed'); return; }
    update(d => {
      const x = d.patients.find(y => y.id === p.id)!.meds.find(m => m.id === rx.id)!;
      x.fills.unshift({ days: a, qty: q, pharmacy: pharmacy.trim() || rx.pharmacy.name });
      x.refillsLeft = Math.max(0, x.refillsLeft - 1); x.reminded = false;
    });
    onClose(); toast(`Fill logged. ${Math.floor(q / rx.perDay)}-day supply.`);
  };

  return (
    <Modal title={`Log a fill · ${rx.drug}`} onClose={onClose} onSubmit={save}
      footer={<><Button variant="outlined" onClick={onClose}>Cancel</Button><Button type="submit">Save fill</Button></>}>
      <p className="help">{nameOf(p)} · {rx.dose} · last fill {rx.fills[0] ? fmt(dayOf(rx.fills[0].days)) : 'none'}</p>
      <div className="f2">
        <div className="field"><label htmlFor="f-qty">Quantity ({rx.unit})</label><input id="f-qty" inputMode="decimal" value={qty} onChange={e => setQty(e.target.value)} /></div>
        <div className="field"><label htmlFor="f-ago">Filled</label>
          <select id="f-ago" value={ago} onChange={e => setAgo(e.target.value)}>
            <option value="0">Today ({fmt(dayOf(0))})</option><option value="1">Yesterday ({fmt(dayOf(1))})</option><option value="2">{fmt(dayOf(2))}</option><option value="3">{fmt(dayOf(3))}</option>
          </select></div>
      </div>
      <div className="field"><label htmlFor="f-ph">Pharmacy</label><input id="f-ph" value={pharmacy} onChange={e => setPharmacy(e.target.value)} /></div>
      {q > 0 && <p className="help">Lasts {Math.floor(q / rx.perDay)} days at {rx.perDay} {rx.unit} a day. Refills left after this: {Math.max(0, rx.refillsLeft - 1)}.</p>}
    </Modal>
  );
}

// Enroll a patient and send each respondent their own secure BAT link by SMS.

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useClin } from '../context';
import { ageOf, nameOf, respondentFor, smsText } from '../logic';
import type { Lang, Patient } from '../types';
import { Alert, ArrowIcon, Button, CheckIcon, UserIcon } from '../components/ui';

const today = new Date().toISOString().slice(0, 10);

export default function Enroll() {
  const { S, ui, update, setUi, go } = useClin();
  const [f, setF] = useState({ first: '', init: '', dob: '', lang: 'en' as Lang, pphone: '', cname: '', cphone: '', interp: false });
  const [err, setErr] = useState('');
  const set = (k: keyof typeof f, v: string | boolean) => setF(prev => ({ ...prev, [k]: v }));

  const enrolled = ui.enrolledId ? S.patients.find(p => p.id === ui.enrolledId) : undefined;
  if (enrolled) return <Enrolled p={enrolled} onAgain={() => setUi({ enrolledId: null })} onOpen={() => go('patient', enrolled.id)} />;

  const age = f.dob ? ageOf(f.dob) : null;
  const resp = age == null ? null : respondentFor(age);
  const hint = age == null || resp == null ? 'Enter a date of birth to see who answers the BAT.'
    : resp === 'caregiver' ? `Age ${age}: the caregiver answers for the patient. Only a caregiver link is sent.`
    : resp === 'both' ? `Age ${age}: patient and caregiver each get their own link and answer separately. The patient's answers stay private from the caregiver.`
    : `Age ${age}: the patient answers and owns the plan. Caregiver access only if the patient wants it.`;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!f.first.trim() || !f.init.trim() || !f.dob || age == null || resp == null) { setErr('Add a first name, last initial and date of birth.'); return; }
    if (resp !== 'patient' && !f.cname.trim()) { setErr(`Add the caregiver's name. At age ${age} the caregiver ${resp === 'caregiver' ? 'answers for the patient' : 'answers too'}.`); return; }
    const np: Patient = {
      id: 'p' + Date.now(), first: f.first.trim(), last: f.init.replace('.', '').trim().toUpperCase(), dob: f.dob, lang: f.lang, interpreter: f.interp,
      respondent: resp, phone: f.pphone || '(555) 000-0001',
      caregiver: resp !== 'patient' ? { name: f.cname.trim(), rel: 'Caregiver', phone: f.cphone || '(555) 000-0002' } : null,
      bat: null, linkSent: 0, prefs: {}, plans: [], risk: { tac: [7.0, 7.2, 6.9, 7.1], labs: 14, visit: 14 }, checkins: [], tried: [], meds: [],
    };
    update(d => { d.patients.push(np); });
    setUi({ enrolledId: np.id });
    window.scrollTo(0, 0);
  };

  return (
    <div className="page">
      <div className="head"><div>
        <h1>Enroll New Patient</h1>
        <p className="lead">Each person gets their own secure BAT link by text. No app or account needed; about 60 seconds at a 5th-grade reading level.</p>
      </div></div>
      <form className="card form" onSubmit={submit} noValidate>
        <div className="f2">
          <div className="field"><label htmlFor="e-first">First name</label><input id="e-first" value={f.first} onChange={e => set('first', e.target.value)} placeholder="Jordan" /></div>
          <div className="field"><label htmlFor="e-init">Last initial</label><input id="e-init" value={f.init} onChange={e => set('init', e.target.value)} maxLength={2} placeholder="M" /></div>
        </div>
        <div className="f2">
          <div className="field"><label htmlFor="e-dob">Date of birth</label><input id="e-dob" type="date" max={today} value={f.dob} onChange={e => set('dob', e.target.value)} /></div>
          <div className="field"><label htmlFor="e-lang">Preferred language</label>
            <select id="e-lang" value={f.lang} onChange={e => set('lang', e.target.value)}>
              <option value="en">English</option><option value="es">Spanish · Español</option><option value="ar">Arabic · العربية</option>
            </select>
          </div>
        </div>
        <Alert severity="info" icon={<UserIcon />}>{hint}</Alert>
        {resp !== 'caregiver' && (
          <div className="field"><label htmlFor="e-pphone">Patient mobile</label><input id="e-pphone" inputMode="tel" value={f.pphone} onChange={e => set('pphone', e.target.value)} placeholder="(555) 000-0001 · demo number" /></div>
        )}
        {resp !== 'patient' && (
          <div className="f2">
            <div className="field"><label htmlFor="e-cname">Caregiver first name</label><input id="e-cname" value={f.cname} onChange={e => set('cname', e.target.value)} placeholder="Denise" /></div>
            <div className="field"><label htmlFor="e-cphone">Caregiver mobile</label><input id="e-cphone" inputMode="tel" value={f.cphone} onChange={e => set('cphone', e.target.value)} placeholder="(555) 000-0002 · demo number" /></div>
          </div>
        )}
        <label className="radio"><input type="checkbox" checked={f.interp} onChange={e => set('interp', e.target.checked)} />
          <span><b>Needs an interpreter for calls</b><br /><span className="help">Shows on the coordinator's list and on every referral.</span></span></label>
        {err && <p className="help err" role="alert">{err}</p>}
        <Button type="submit" size="lg">Enroll &amp; send BAT links <ArrowIcon /></Button>
      </form>
    </div>
  );
}

function Enrolled({ p, onAgain, onOpen }: { p: Patient; onAgain: () => void; onOpen: () => void }) {
  const msgs: { to: string; phone: string; cg: boolean }[] = [];
  if (p.respondent !== 'caregiver') msgs.push({ to: p.first, phone: p.phone, cg: false });
  if (p.respondent !== 'patient' && p.caregiver) msgs.push({ to: p.caregiver.name, phone: p.caregiver.phone ?? '', cg: true });
  const link = `ktx.link/${p.id.slice(-6)}`;
  return (
    <div className="page">
      <div className="head"><div>
        <h1>{nameOf(p)} is enrolled</h1>
        <p className="lead">Status is Awaiting BAT. {p.first} won't appear on your weekly list unless the links expire unanswered.</p>
      </div></div>
      <div className="card form" style={{ maxWidth: 760 }}>
        <Alert severity="success" filled icon={<CheckIcon />}>Secure BAT link{msgs.length > 1 ? 's' : ''} sent by SMS · expire{msgs.length > 1 ? '' : 's'} in 72 hours · reminder at 48 hours</Alert>
        {msgs.map(m => {
          const [before, after] = smsText(p.lang, m.to, p.first, m.cg).split('{LINK}');
          return (
            <div key={m.to} className="sms">
              <span className="flabel">To {m.to}{m.cg ? ' (caregiver)' : ''} · {m.phone || 'demo number'}</span>
              <div className="bubble" dir={p.lang === 'ar' ? 'rtl' : undefined} lang={p.lang}>{before}<a>{link}</a>{after}</div>
            </div>
          );
        })}
        {p.lang !== 'en' && <p className="help">Message translations are drafts for clinical and interpreter review before real use.</p>}
        <div className="chips"><Button onClick={onOpen}>Open {p.first}'s chart</Button><Button variant="outlined" onClick={onAgain}>Enroll another patient</Button></div>
      </div>
    </div>
  );
}

// Pure helpers: dates, status rules and the coordinator's weekly worklist.

import { BARRIERS, ROLE_LABEL } from './data';
import type { Barrier, DemoState, Lang, Owner, Patient, Plan, Prescription, Referral, RefStatus, Respondent, Status } from './types';

/* ---------- dates ---------- */
export const TODAY: Date = (() => { const d = new Date(); d.setHours(12, 0, 0, 0); return d; })();
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Date `n` days ago (negative = in the future). */
export const dayOf = (n: number): Date => new Date(TODAY.getTime() - n * 864e5);
export const fmt = (d: Date): string => `${MON[d.getMonth()]} ${d.getDate()}`;
export const fmtDow = (d: Date): string => `${DOW[d.getDay()]}, ${fmt(d)}`;
export const ago = (n?: number | null): string =>
  n == null ? '—' : n === 0 ? 'Today' : n === 1 ? 'Yesterday' : `${n} days ago`;

export function ageOf(dob: string): number {
  const b = new Date(dob + 'T12:00:00');
  let a = TODAY.getFullYear() - b.getFullYear();
  const m = TODAY.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && TODAY.getDate() < b.getDate())) a--;
  return a;
}
export const dobFmt = (dob: string): string => { const [y, m, d] = dob.split('-'); return `${m}/${d}/${y}`; };

export function sd(a: number[]): number {
  if (a.length < 2) return 0;
  const m = a.reduce((s, x) => s + x, 0) / a.length;
  return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1));
}

/* ---------- lookups ---------- */
export const B = (id: number): Barrier => BARRIERS.find(b => b.id === id) as Barrier;
export const nameOf = (p: Patient): string => `${p.first} ${p.last}.`;
export const ownerOf = (S: DemoState, bid: number): Owner => S.routing[bid];
export const ownerShort = (o: Owner): string => ROLE_LABEL[o].short;
export const isPlanOwner = (o: Owner): boolean => o === 'coord' || o === 'prescriber';
export const isReferralOwner = (o: Owner): boolean => o === 'sw' || o === 'psych' || o === 'community';

export const allBarriers = (p: Patient): number[] =>
  p.bat ? [...new Set([...p.bat.patient, ...p.bat.caregiver])].sort((a, b) => a - b) : [];
export const planFor = (p: Patient, bid: number): Plan | undefined => p.plans.find(x => x.bid === bid);
export const refFor = (S: DemoState, p: Patient, bid: number): Referral | undefined =>
  S.referrals.find(r => r.pid === p.id && r.bid === bid);
export const openRefs = (S: DemoState, p: Patient): Referral[] =>
  S.referrals.filter(r => r.pid === p.id && r.status !== 'closed');
export const tacSD = (p: Patient): number => sd(p.risk.tac);

export function reporter(p: Patient, bid: number): Respondent {
  if (!p.bat) return 'patient';
  const a = p.bat.patient.includes(bid), c = p.bat.caregiver.includes(bid);
  return a && c ? 'both' : a ? 'patient' : 'caregiver';
}
export function disagreements(p: Patient): number[] {
  if (!p.bat || p.respondent !== 'both') return [];
  return allBarriers(p).filter(b => reporter(p, b) !== 'both');
}

/** Risk signals already in the chart (builder packet, must-keep #6). */
export function riskFlags(p: Patient): string[] {
  const f: string[] = [];
  const s = tacSD(p);
  if (s > 2) f.push(`Tacrolimus swinging: SD ${s.toFixed(1)} across last 4 draws (flag above 2.0)`);
  if (p.risk.labs > 42) f.push(`No labs in ${Math.round(p.risk.labs / 7)} weeks (flag after 6)`);
  if (p.risk.visit > 120) f.push(`No clinic visit in ${Math.round(p.risk.visit / 30)} months (flag after 4)`);
  return f;
}

/* ---------- medications + refills ---------- */
/** Days the last fill lasts at the current daily dose. */
export const supplyDays = (rx: Prescription): number => (rx.fills[0] ? Math.floor(rx.fills[0].qty / rx.perDay) : 0);
/** Days until the current supply runs out (negative = already out). null when never filled. */
export const daysLeft = (rx: Prescription): number | null => (rx.fills[0] ? supplyDays(rx) - rx.fills[0].days : null);
export type RefillState = 'out' | 'due' | 'soon' | 'ok' | 'none';
export function refillState(rx: Prescription): RefillState {
  const d = daysLeft(rx);
  if (d == null) return 'none';
  if (d < 0) return 'out';
  if (d <= 5) return 'due';
  if (d <= 10) return 'soon';
  return 'ok';
}
export const REFILL_CHIP: Record<RefillState, ['neg' | 'warn' | 'ok' | 'neutral', string]> = {
  out: ['neg', 'Out of medicine'], due: ['warn', 'Refill due'], soon: ['neutral', 'Refill soon'], ok: ['ok', 'Supply OK'], none: ['neutral', 'No fills'],
};
/** Lowercase only the first letter, so month names keep their capital. */
export const lcFirst = (t: string): string => t.charAt(0).toLowerCase() + t.slice(1);
export function runOutLabel(rx: Prescription): string {
  const d = daysLeft(rx);
  if (d == null) return 'No fills on record';
  if (d < 0) return `Ran out ${fmt(dayOf(-d))} (${-d} day${d === -1 ? '' : 's'} ago)`;
  if (d === 0) return 'Runs out today';
  return `Runs out ${fmtDow(dayOf(-d))} (in ${d} day${d === 1 ? '' : 's'})`;
}
/** Refills that need a person: out of medicine, or due within 5 days with no reminder sent yet. */
export const refillsNeedingAction = (p: Patient): Prescription[] =>
  p.meds.filter(rx => { const st = refillState(rx); return st === 'out' || (st === 'due' && !rx.reminded); });

/* ---------- weekly worklist ---------- */
export type ReasonKind = 'risk' | 'refill' | 'check' | 'plan' | 'refer' | 'loop' | 'info';
export interface Reason { k: ReasonKind; t: string; rid?: string; seen?: boolean }
export interface Task { p: Patient; R: Reason[]; score: number }

/** Only things that need a person this week. Everything else stays off the list. */
export function tasksFor(S: DemoState, p: Patient): Task | null {
  const R: Reason[] = [];
  let score = 0;
  refillsNeedingAction(p).forEach(rx => {
    const out = refillState(rx) === 'out';
    R.push({ k: out ? 'risk' : 'refill', t: `${rx.drug}: ${lcFirst(runOutLabel(rx))} \u00b7 ${rx.pharmacy.name}${rx.refillsLeft === 0 ? ' \u00b7 no refills left' : ''}` });
    score += out ? 3 : 2;
  });
  if (!p.bat) return R.length ? { p, R, score } : null;
  riskFlags(p).forEach(t => { R.push({ k: 'risk', t }); score += 3; });
  const lastC = p.checkins[0];
  if (lastC && lastC.missed >= 2) { R.push({ k: 'risk', t: `Check-in ${ago(lastC.days).toLowerCase()}: ${lastC.note.toLowerCase()}` }); score += 2; }
  p.plans.forEach(pl => {
    const b = B(pl.bid);
    if (pl.outcome === 'not') { R.push({ k: 'plan', t: `${b.short} plan isn't working. Pick a new plan or refer.` }); score += 3; return; }
    if (pl.outcome === null) {
      const due = 14 - pl.created;
      if (due <= 0) { R.push({ k: 'check', t: `2-week check-back on ${b.short.toLowerCase()} plan ${due === 0 ? 'is due today' : `is ${-due} day${-due > 1 ? 's' : ''} overdue`}` }); score += 2; }
      else if (due <= 7) { R.push({ k: 'check', t: `Check-back on ${b.short.toLowerCase()} plan due ${fmtDow(dayOf(-due))}` }); score += 1; }
    } else if (pl.outcome === 'working' && (pl.checked ?? 0) >= 28) {
      R.push({ k: 'check', t: `Durability check on ${b.short.toLowerCase()} plan (last checked ${pl.checked} days ago)` }); score += 1;
    }
  });
  allBarriers(p).forEach(bid => {
    const o = ownerOf(S, bid), b = B(bid);
    if (isPlanOwner(o) && !planFor(p, bid)) {
      R.push({ k: 'plan', t: `New barrier needs a plan: ${b.label.toLowerCase()}${o === 'prescriber' ? ' (add to prescriber’s visit agenda)' : ''}` }); score += 2;
    }
    if (isReferralOwner(o) && !refFor(S, p, bid)) {
      R.push({ k: 'refer', t: `Not routed yet: ${b.label.toLowerCase()} → ${ownerShort(o).toLowerCase()}` }); score += b.urgent ? 4 : 2;
    }
  });
  S.referrals.filter(r => r.pid === p.id && r.status === 'closed' && !r.ack).forEach(r => {
    R.push({ k: 'loop', t: `${ownerShort(r.to)} closed the referral: “${r.closeNote}”`, rid: r.id }); score += 1;
  });
  S.referrals.filter(r => r.pid === p.id && r.auto && !r.seen).forEach(r => {
    R.push({ k: 'loop', t: `Auto-routed today: ${r.bid ? B(r.bid).short.toLowerCase() : 'flag'} → ${ownerShort(r.to).toLowerCase()} (same day)`, rid: r.id, seen: true }); score += 3;
  });
  if (!R.length) return null;
  const dis = disagreements(p);
  if (dis.length) R.push({ k: 'info', t: `Patient and caregiver answered differently on ${dis.map(b => B(b).short.toLowerCase()).join(', ')}` });
  if (p.interpreter) R.push({ k: 'info', t: 'Book an interpreter for calls' });
  return { p, R, score };
}

export const tasksAll = (S: DemoState): Task[] =>
  S.patients.map(p => tasksFor(S, p)).filter((t): t is Task => !!t && !t.p.snoozed).sort((a, b) => b.score - a.score);

export function statusOf(S: DemoState, p: Patient): Status {
  if (!p.bat) return 'awaiting';
  const urgentRef = openRefs(S, p).some(r => r.urgency === 'urgent');
  if (riskFlags(p).length || p.plans.some(x => x.outcome === 'not') || urgentRef || (p.checkins[0] && p.checkins[0].missed >= 2) || p.meds.some(rx => refillState(rx) === 'out')) return 'attention';
  const t = tasksFor(S, p);
  if (t && t.R.some(r => r.k !== 'info')) return 'followup';
  return 'ontrack';
}

export function quietWhy(S: DemoState, p: Patient): string {
  if (!p.bat) return `Assessment link sent ${ago(p.linkSent ?? 0).toLowerCase()}; app reminds them at 48 h`;
  const refs = openRefs(S, p);
  if (refs.length) return `${refs.map(r => ownerShort(r.to)).join(' & ')} is working with them`;
  if (!allBarriers(p).length) return 'No barriers · next BAT ' + fmt(dayOf(p.bat.days - 180));
  if (p.plans.some(x => x.durability)) return 'Plan holding; monthly check-ins in the app';
  if (p.plans.length && p.plans.every(x => x.outcome === 'working')) return 'Plans working';
  if (p.meds.some(rx => rx.reminded)) return 'Refill reminder sent';
  return 'On track';
}

/* ---------- referrals ---------- */
export const RSTEPS = ['Received', 'Accepted', 'Contacted', 'Plan agreed', 'Closed'];
export const RIDX: Record<RefStatus, number> = { new: 0, accepted: 1, contacted: 2, plan: 3, closed: 4 };

/* ---------- enrollment ---------- */
export const respondentFor = (age: number): Respondent => (age < 10 ? 'caregiver' : age >= 18 ? 'patient' : 'both');

/** BAT invitation text. `{LINK}` marks where the secure link goes. Translations are drafts for review. */
export function smsText(lang: Lang, to: string, child: string, isCaregiver: boolean): string {
  if (lang === 'es') return isCaregiver
    ? `Hola ${to}: el equipo de trasplante de ${child} quiere saber qué hace difícil darle sus medicinas. Toma 1 minuto. {LINK} El enlace vence en 72 horas.`
    : `Hola ${to}: tu equipo de trasplante quiere saber qué te hace difícil tomar tus medicinas. Toma 1 minuto. Tus respuestas son privadas. {LINK} El enlace vence en 72 horas.`;
  if (lang === 'ar') return isCaregiver
    ? `مرحباً ${to}، يريد فريق زراعة الكلى أن يعرف ما الذي يصعّب على ${child} تناول دوائه. يستغرق دقيقة واحدة. {LINK} ينتهي الرابط بعد ٧٢ ساعة.`
    : `مرحباً ${to}، يريد فريق زراعة الكلى أن يعرف ما الذي يصعّب عليك تناول دوائك. يستغرق دقيقة واحدة. إجاباتك خاصة. {LINK} ينتهي الرابط بعد ٧٢ ساعة.`;
  return isCaregiver
    ? `Hi ${to}, ${child}'s transplant team wants to know what makes giving medicine hard. It takes about 1 minute. {LINK} Link expires in 72 hours.`
    : `Hi ${to}, your transplant team wants to know what makes taking your medicine hard. It takes about 1 minute. Your answers are private. {LINK} Link expires in 72 hours.`;
}

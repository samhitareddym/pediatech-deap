// Demo-only events that stand in for data the patient app (your teammate's layer) would send.
// Swap these for real calls once the two layers share a backend or store.

import type { DemoState } from './types';

export function simTaylorRefusal(d: DemoState): void {
  const t = d.patients.find(p => p.id === 'taylor');
  if (!t || t.bat) return;
  t.bat = { days: 0, patient: [13, 5], caregiver: [], private: [5], words: 'I’m done taking them. Nobody at school knows and I want to keep it that way.' };
  const owner = d.routing[13];
  d.referrals.push({
    id: 'r' + Date.now(), pid: 'taylor', bid: 13, to: owner === 'psych' ? 'psych' : 'sw', urgency: 'urgent', status: 'new', days: 0,
    from: 'Automatic routing', auto: true, seen: false,
    note: 'Refusal on today’s BAT. Mom reported no barriers. Same-day routing per protocol; coordinator notified.',
    plan: '', closeNote: '', ack: false, log: [{ days: 0, text: 'Auto-routed on BAT submission' }],
  });
}

export function simMayaCheckIn(d: DemoState): void {
  const m = d.patients.find(p => p.id === 'maya');
  const pl = m?.plans.find(x => x.bid === 1);
  if (!m || !pl) return;
  pl.outcome = 'working'; pl.checked = 0;
  m.checkins.unshift({ days: 0, missed: 0, note: 'Weekend reminder worked. All doses taken.' });
  m.tried.push({ days: 0, by: 'Maya (app check-in)', what: 'Weekend reminder labeled "vitamins"', result: 'Working' });
}

/** Live event from the patient app (see src/handoff.ts): Anna tapped "I hate the taste". */
export function simAnnaTaste(d: DemoState, words: string): void {
  const a = d.patients.find(p => p.id === 'anna');
  if (!a) return;
  a.bat = { days: 0, patient: [2], caregiver: [], private: [], words };
  a.prefs = { 2: ['Popsicle first to numb taste buds', 'Pharmacist adds flavoring'] };
  a.plans = a.plans.filter(p => p.bid !== 2);
  a.checkins.unshift({ days: 0, missed: 0, note: 'Told the team the taste is hard (from the app)' });
}

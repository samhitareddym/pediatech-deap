// Constants and fictional demo data for the clinician layer.
// Day counts are "days ago" relative to today, so the demo stays current whenever it runs.

import type { Barrier, BarrierKind, DemoState, Lang, Owner, Patient, Prescription, Referral, Role, User } from './types';

export const ROLE_LABEL: Record<Owner, { label: string; short: string }> = {
  coord: { label: 'Transplant coordinator', short: 'Coordinator' },
  prescriber: { label: 'Nephrologist / NP / pharmacist', short: 'Prescriber' },
  sw: { label: 'Social worker', short: 'Social worker' },
  psych: { label: 'Psychologist', short: 'Psychologist' },
  community: { label: 'Community referral', short: 'Community' },
};

export const USERS: Record<Role, User> = {
  coord: { id: 'coord', name: 'Transplant coordinator', initials: 'TC', role: 'coord', title: 'Transplant coordinator', lands: 'This week',
    blurb: 'Nurse who owns action plans, check-backs and refills' },
  sw: { id: 'sw', name: 'Social worker', initials: 'SW', role: 'sw', title: 'Social worker', lands: 'Referral inbox',
    blurb: 'Referrals for running out, cost and access' },
  psych: { id: 'psych', name: 'Psychologist', initials: 'PS', role: 'psych', title: 'Psychologist', lands: 'Referral inbox',
    blurb: 'Referrals for refusal, routines and mood' },
};

export const LANG: Record<Lang, string> = { en: 'English', es: 'Spanish', ar: 'Arabic' };

/** The 14-item Barriers Assessment Tool and its default owners (builder packet, section 5). */
export const BARRIERS: Barrier[] = [
  { id: 1, label: 'Forgetting to take them or bring them', short: 'Forgetting', owner: 'coord', kind: 'forgetting', self: true },
  { id: 2, label: 'Hate the taste', short: 'Taste', owner: 'coord', kind: 'taste', self: true },
  { id: 3, label: 'Hard to swallow pills', short: 'Pill swallowing', owner: 'coord', kind: 'swallow', self: true },
  { id: 4, label: 'Side effects', short: 'Side effects', owner: 'coord', kind: 'side' },
  { id: 5, label: "Don't want others to know I take medicine", short: 'Embarrassment', owner: 'coord', kind: 'embarrass', self: true },
  { id: 6, label: "I don't need the medicine", short: "Doesn't see the need", owner: 'coord', kind: 'education' },
  { id: 7, label: 'Too many medicines or too many times a day', short: 'Regimen burden', owner: 'prescriber', kind: 'discussion' },
  { id: 8, label: 'The medicine does not work', short: 'Doubts it works', owner: 'prescriber', kind: 'discussion' },
  { id: 9, label: 'Hard to understand medication instructions', short: 'Instructions unclear', owner: 'prescriber', kind: 'discussion' },
  { id: 10, label: 'Ran out of medicine', short: 'Ran out', owner: 'sw', kind: 'referral' },
  { id: 11, label: "Can't afford the medicine", short: 'Cost', owner: 'sw', kind: 'referral' },
  { id: 12, label: 'Gets in the way of other activities', short: 'Gets in the way', owner: 'psych', kind: 'referral' },
  { id: 13, label: 'Refuse to take them', short: 'Refusal', owner: 'psych', kind: 'referral', urgent: true },
  { id: 14, label: 'Inconvenient', short: 'Inconvenient', owner: 'psych', kind: 'referral' },
];

export const PLAN_OPTIONS: Partial<Record<BarrierKind, string[]>> = {
  forgetting: ['Phone reminder at a time they pick', 'Pair doses with a daily routine (brushing teeth)', 'Backup doses in backpack or bag', 'Pill case labeled by day'],
  taste: ['Pharmacist adds flavoring', 'Popsicle first to numb taste buds', 'Mix with an allowed food', 'Ask about coated or syrup form'],
  swallow: ['Practice with small candies', 'Change head position (chin tuck)', 'Pill-coating gel or spray'],
  embarrass: ['Take doses discreetly before leaving', 'Discreet pill case', 'A short script for explaining to friends'],
  side: ['Review dose timing with prescriber', 'Clinician guide: change, add or adjust a medicine'],
  education: ['Teach-back: why each medicine matters'],
  discussion: ['Simplify the regimen (fewer doses a day)', 'Teach-back on instructions at next visit', 'Pharmacist consult'],
};

/** Motivational-interviewing style openers. They prepare the conversation; they don't replace it. */
export const MI_STARTERS: Partial<Record<BarrierKind, string[]>> = {
  forgetting: ['What usually happens on the days a dose gets missed?', 'What do you already do every day that a dose could ride along with?'],
  taste: ['What have you tried so far to make it go down easier?', 'Which of these sounds worth a try this week?'],
  swallow: ['What size of pill feels okay right now?', 'How would you like to practice?'],
  embarrass: ['Who knows about your medicine, and who would you rather didn’t?', 'Where would taking it feel private enough?'],
  side: ['When do you notice it most?', 'How much does it get in the way of your day?'],
  education: ['What have you heard about what happens when doses get missed?'],
  discussion: ['Which part of the routine feels like the most work?'],
};

export const PERMISSIONS: [string, string, Role[]][] = [
  ['See the full patient panel', 'Weekly list and every chart', ['coord']],
  ['See referred patients', 'Chart, BAT answers and history', ['coord', 'sw', 'psych']],
  ['See answers a teen marked private', 'Never shown to the caregiver', ['coord', 'sw', 'psych']],
  ['Make and check back on action plans', 'Barriers 1–9', ['coord']],
  ['Send referrals with context', 'Carries barrier, words, history', ['coord']],
  ['Accept, plan and close referrals', 'Sends the closing note back', ['sw', 'psych']],
  ['Enroll patients and send BAT links', 'SMS link, 72-hour expiry', ['coord']],
  ['Change barrier routing', 'Site setup', ['coord']],
];

function patients(): Patient[] {
  const list: Omit<Patient, 'meds'>[] = [
    { id: 'morgan', first: 'Morgan', last: 'L', dob: '2007-09-22', lang: 'en', respondent: 'patient', phone: '(555) 000-0101',
      bat: { days: 20, patient: [1, 12], caregiver: [], private: [], words: 'When my schedule changes, everything falls apart. I work nights at a warehouse now.' },
      prefs: { 1: ['Phone reminder at a time they pick'] },
      plans: [{ bid: 1, solution: 'Fixed phone alarm at 7:00 am', who: 'Morgan', when: '7:00 am daily', where: 'Home', how: 'Alarm labeled "meds"', created: 18, outcome: null }],
      risk: { tac: [6.1, 9.8, 4.2, 10.5], labs: 12, visit: 60 },
      checkins: [{ days: 2, missed: 2, note: 'Missed 2 doses after night shifts' }, { days: 9, missed: 0, note: 'All doses taken' }],
      tried: [{ days: 18, by: 'Transplant coordinator', what: 'Fixed 7:00 am phone alarm', result: 'Check-back pending' }] },
    { id: 'alex', first: 'Alex', last: 'R', dob: '2010-06-05', lang: 'en', respondent: 'both', caregiver: { name: 'Marcus', rel: 'Dad' }, phone: '(555) 000-0102',
      bat: { days: 9, patient: [2], caregiver: [2, 4], private: [], words: 'I hate the taste of the medicine.' },
      prefs: { 2: ['Popsicle first to numb taste buds', 'Pharmacist adds flavoring'] },
      plans: [], risk: { tac: [7.2, 7.8, 6.9, 7.5], labs: 20, visit: 40 }, checkins: [], tried: [] },
    { id: 'jordan', first: 'Jordan', last: 'M', dob: '2008-03-14', lang: 'en', respondent: 'patient', phone: '(555) 000-0001',
      transition: 'Turned 18 in March. Mom (Denise) no longer answers the BAT; Jordan re-consented and now owns refills and insurance.',
      bat: { days: 30, patient: [1, 10], caregiver: [], private: [], words: 'I ran out before my refill came. Mom used to do the pharmacy calls.' },
      prefs: { 1: ['Phone reminder at a time they pick'] },
      plans: [{ bid: 1, solution: 'Reminder at 11:00 am, after first class', who: 'Jordan', when: '11:00 am', where: 'Campus', how: 'Phone reminder + backup dose in backpack', created: 28, outcome: 'working', checked: 14 }],
      risk: { tac: [8.0, 7.1, 7.6, 8.3], labs: 10, visit: 30 },
      checkins: [{ days: 6, missed: 0, note: 'All doses taken' }],
      tried: [{ days: 27, by: 'Transplant coordinator', what: 'Called pharmacy for an early fill', result: 'Bridged one week; will happen again' },
        { days: 14, by: 'Transplant coordinator', what: '2-week check-back on reminder plan', result: 'Working' }] },
    { id: 'taylor', first: 'Taylor', last: 'B', dob: '2009-02-17', lang: 'en', respondent: 'both', caregiver: { name: 'Keisha', rel: 'Mom' }, phone: '(555) 000-0104',
      bat: null, linkSent: 1, prefs: {}, plans: [], risk: { tac: [7.4, 6.9, 7.1, 7.8], labs: 18, visit: 45 }, checkins: [], tried: [] },
    { id: 'maya', first: 'Maya', last: 'S', dob: '2011-05-02', lang: 'en', respondent: 'both', caregiver: { name: 'Linda', rel: 'Mom' }, phone: '(555) 000-0105',
      bat: { days: 16, patient: [1, 5], caregiver: [], private: [5], words: 'I forget on weekends, especially at sleepovers. I don’t want my friends to see.' },
      prefs: { 1: ['Phone reminder at a time they pick'], 5: ['Discreet pill case'] },
      plans: [
        { bid: 1, solution: 'Weekend reminder at 9:30 am, labeled "vitamins"', who: 'Maya', when: 'Sat and Sun, 9:30 am', where: 'Wherever she wakes up', how: 'Discreet label on phone reminder', created: 15, outcome: null },
        { bid: 5, solution: 'Discreet pill case that fits her phone pouch', who: 'Maya', when: 'Packed Friday night', where: 'Sleepovers', how: 'Takes dose in the bathroom', created: 15, outcome: null },
      ],
      risk: { tac: [6.8, 7.4, 6.1, 7.0], labs: 25, visit: 70 },
      checkins: [{ days: 1, missed: 1, note: 'Missed Saturday dose' }],
      tried: [{ days: 15, by: 'Transplant coordinator', what: 'Agreed on 2 plans at clinic visit', result: 'Check-back pending' }] },
    { id: 'anna', first: 'Anna', last: 'K', dob: '2012-08-11', lang: 'en', respondent: 'patient', phone: '(555) 000-0107',
      bat: null, linkSent: 2, prefs: {}, plans: [], risk: { tac: [7.0, 7.3, 6.8, 7.1], labs: 14, visit: 50 },
      checkins: [{ days: 3, missed: 0, note: 'All doses taken' }], tried: [] },
    { id: 'leo', first: 'Leo', last: 'A', dob: '2018-01-20', lang: 'ar', interpreter: true, respondent: 'caregiver', caregiver: { name: 'Rana', rel: 'Mom' }, phone: '(555) 000-0106',
      bat: { days: 22, patient: [], caregiver: [2, 3, 11], private: [], words: 'He spits out the liquid. The medicine costs too much this month.',
        orig: 'يبصق الدواء السائل. الدواء غالٍ هذا الشهر.' },
      prefs: {},
      plans: [
        { bid: 2, solution: 'Pharmacist adds cherry flavoring', who: 'Rana + clinic pharmacy', when: 'Each refill', where: 'Clinic pharmacy', how: 'Flavoring added at fill', created: 21, outcome: 'working', checked: 7 },
        { bid: 3, solution: 'Practice swallowing with small candies after dinner', who: 'Rana and Leo', when: 'After dinner, 5 minutes', where: 'Home', how: 'Start with sprinkles, then mini candies', created: 8, outcome: null, adjusted: true },
      ],
      risk: { tac: [5.9, 6.4, 6.0, 6.6], labs: 30, visit: 22 },
      checkins: [{ days: 3, missed: 0, note: 'All doses, liquid form' }],
      tried: [{ days: 21, by: 'Transplant coordinator (with interpreter)', what: 'Pharmacist flavoring', result: 'Working' },
        { days: 8, by: 'Transplant coordinator (with interpreter)', what: 'Pill practice with applesauce', result: 'Not working; switched to candy practice' }] },
    { id: 'sam', first: 'Sam', last: 'K', dob: '2010-09-30', lang: 'en', respondent: 'both', caregiver: { name: 'Paul', rel: 'Dad' }, phone: '(555) 000-0107',
      bat: { days: 10, patient: [12], caregiver: [12], private: [], words: 'Soccer travel weekends throw everything off.' },
      prefs: {}, plans: [], risk: { tac: [7.0, 6.5, 7.9, 7.2], labs: 15, visit: 35 },
      checkins: [{ days: 4, missed: 1, note: 'Missed Sunday dose at a tournament' }],
      tried: [{ days: 10, by: 'Transplant coordinator', what: 'Referred to psychology with travel-weekend details', result: 'Psychologist in contact' }] },
    { id: 'priya', first: 'Priya', last: 'N', dob: '2013-07-11', lang: 'en', respondent: 'both', caregiver: { name: 'Meera', rel: 'Mom' }, phone: '(555) 000-0108',
      bat: { days: 70, patient: [1], caregiver: [1], private: [], words: 'Sometimes I forget in the morning rush.' },
      prefs: {}, plans: [{ bid: 1, solution: 'Pill case next to her toothbrush', who: 'Priya', when: 'Before brushing teeth', where: 'Bathroom', how: 'Pill case by the sink', created: 68, outcome: 'working', checked: 20, durability: true }],
      risk: { tac: [7.1, 7.4, 6.8, 7.2], labs: 21, visit: 48 }, checkins: [{ days: 3, missed: 0, note: 'All doses taken' }],
      tried: [{ days: 68, by: 'Transplant coordinator', what: 'Pill case by the toothbrush', result: 'Working at 2 weeks and 6 weeks' }] },
    { id: 'diego', first: 'Diego', last: 'V', dob: '2015-03-03', lang: 'es', respondent: 'both', caregiver: { name: 'Ana', rel: 'Mom' }, phone: '(555) 000-0109',
      bat: { days: 40, patient: [], caregiver: [4], private: [], words: 'His stomach hurts after the medicine.', orig: 'Le duele el estómago después de la medicina.' },
      prefs: {}, plans: [{ bid: 4, solution: 'Morning dose with breakfast; prescriber reviewed timing', who: 'Ana', when: 'With breakfast', where: 'Home', how: 'Timing changed at visit', created: 38, outcome: 'working', checked: 24 }],
      risk: { tac: [6.6, 7.0, 6.4, 6.9], labs: 28, visit: 40 }, checkins: [{ days: 5, missed: 0, note: 'Todas las dosis (all doses)' }],
      tried: [{ days: 38, by: 'Nephrology', what: 'Moved dose to breakfast', result: 'Working' }] },
    { id: 'nadia', first: 'Nadia', last: 'F', dob: '2012-12-01', lang: 'en', respondent: 'both', caregiver: { name: 'Sara', rel: 'Mom' }, phone: '(555) 000-0110',
      bat: { days: 50, patient: [], caregiver: [], private: [], words: '' },
      prefs: {}, plans: [], risk: { tac: [7.3, 7.0, 7.6, 7.1], labs: 14, visit: 9 }, checkins: [{ days: 4, missed: 0, note: 'All doses taken' }], tried: [] },
  ];
  return list.map(p => ({ ...p, meds: meds(p.id) }));
}

/* ---------- prescriptions + pharmacy fills (sample values, not clinical guidance) ---------- */
const PHARM = {
  north: { name: 'Northside Pharmacy', phone: '(555) 010-2200' },
  campus: { name: 'University Health Pharmacy', phone: '(555) 010-3300' },
  hospital: { name: 'Hospital Outpatient Pharmacy', phone: '(555) 010-4400' },
  main: { name: 'Main Street Pharmacy', phone: '(555) 010-5500' },
};
type PharmKey = keyof typeof PHARM;
function tac(id: string, dose: string, perDay: number, fillDays: number, ph: PharmKey, refills: number, extra: Partial<Prescription> = {}): Prescription {
  return { id: id + '-tac', drug: 'Tacrolimus', form: '1 mg capsule', dose, perDay, unit: 'capsules', prescriber: 'Nephrology',
    pharmacy: PHARM[ph], refillsLeft: refills,
    fills: [{ days: fillDays, qty: perDay * 30, pharmacy: PHARM[ph].name }, { days: fillDays + 30, qty: perDay * 30, pharmacy: PHARM[ph].name }],
    doseHistory: [], attachment: { name: 'Tacrolimus prescription.pdf', days: fillDays + 30 }, ...extra };
}
function mmf(id: string, dose: string, perDay: number, fillDays: number, ph: PharmKey, refills: number, extra: Partial<Prescription> = {}): Prescription {
  return { id: id + '-mmf', drug: 'Mycophenolate mofetil', form: '250 mg capsule', dose, perDay, unit: 'capsules', prescriber: 'Nephrology',
    pharmacy: PHARM[ph], refillsLeft: refills,
    fills: [{ days: fillDays, qty: perDay * 30, pharmacy: PHARM[ph].name }],
    doseHistory: [], attachment: { name: 'Mycophenolate prescription.pdf', days: fillDays + 60 }, ...extra };
}
function meds(pid: string): Prescription[] {
  switch (pid) {
    case 'morgan': return [
      tac(pid, '4 mg twice daily', 8, 34, 'north', 3, { doseHistory: [{ days: 45, from: '3 mg twice daily', to: '4 mg twice daily', by: 'Nephrology', reason: 'Trough level below target' }] }),
      mmf(pid, '500 mg twice daily', 4, 20, 'north', 4)];
    case 'alex': return [tac(pid, '2 mg twice daily', 4, 12, 'main', 5), mmf(pid, '500 mg twice daily', 4, 12, 'main', 5)];
    case 'jordan': return [tac(pid, '3 mg twice daily', 6, 26, 'campus', 1), mmf(pid, '500 mg twice daily', 4, 26, 'campus', 1)];
    case 'anna': return [tac(pid, '2 mg twice daily', 4, 12, 'main', 4)];
    case 'taylor': return [tac(pid, '3 mg twice daily', 6, 10, 'main', 4)];
    case 'maya': return [tac(pid, '2 mg twice daily', 4, 15, 'north', 3),
      { id: 'maya-pred', drug: 'Prednisone', form: '5 mg tablet', dose: '5 mg once daily', perDay: 1, unit: 'tablets', prescriber: 'Nephrology',
        pharmacy: PHARM.north, refillsLeft: 2, fills: [{ days: 15, qty: 30, pharmacy: PHARM.north.name }], doseHistory: [] }];
    case 'leo': return [
      { id: 'leo-tac', drug: 'Tacrolimus', form: '0.5 mg/mL oral suspension', dose: '1.5 mg (3 mL) twice daily', perDay: 6, unit: 'mL', prescriber: 'Nephrology',
        pharmacy: PHARM.hospital, refillsLeft: 3, fills: [{ days: 21, qty: 180, pharmacy: PHARM.hospital.name }],
        doseHistory: [{ days: 21, from: 'Capsules', to: 'Oral suspension, cherry flavor', by: 'Nephrology', reason: 'Trouble swallowing capsules' }],
        attachment: { name: 'Tacrolimus suspension prescription.pdf', days: 21 } },
      { id: 'leo-mmf', drug: 'Mycophenolate mofetil', form: '200 mg/mL oral suspension', dose: '250 mg (1.25 mL) twice daily', perDay: 2.5, unit: 'mL', prescriber: 'Nephrology',
        pharmacy: PHARM.hospital, refillsLeft: 3, fills: [{ days: 21, qty: 75, pharmacy: PHARM.hospital.name }], doseHistory: [] }];
    case 'sam': return [tac(pid, '3 mg twice daily', 6, 28, 'main', 2), mmf(pid, '500 mg twice daily', 4, 14, 'main', 3)];
    case 'priya': return [tac(pid, '2 mg twice daily', 4, 5, 'north', 5)];
    case 'diego': return [tac(pid, '1 mg twice daily', 2, 20, 'main', 4),
      mmf(pid, '250 mg twice daily', 2, 20, 'main', 4, { doseHistory: [{ days: 38, from: '500 mg twice daily', to: '250 mg twice daily', by: 'Nephrology', reason: 'Stomach pain after doses' }] })];
    case 'nadia': return [tac(pid, '2 mg twice daily', 4, 18, 'north', 4)];
    default: return [];
  }
}

function referrals(): Referral[] {
  return [
    { id: 'r1', pid: 'jordan', bid: 10, to: 'sw', urgency: 'week', status: 'new', days: 1, from: 'Transplant coordinator',
      note: 'Needs his own pharmacy account and refill sync before the next run-out (about two weeks out). Mom used to handle refills and insurance; he has never called the pharmacy himself.',
      plan: '', closeNote: '', ack: false, log: [{ days: 1, text: 'Sent by transplant coordinator' }] },
    { id: 'r2', pid: 'sam', bid: 12, to: 'psych', urgency: 'routine', status: 'contacted', days: 10, from: 'Transplant coordinator',
      note: 'Misses doses on soccer travel weekends. Sam and Dad both named it. Interested in a plan that does not single him out in front of the team.',
      plan: '', closeNote: '', ack: false, log: [{ days: 10, text: 'Sent by transplant coordinator' }, { days: 9, text: 'Accepted by psychologist' }, { days: 6, text: 'First call with Sam and Dad' }] },
    { id: 'r3', pid: 'leo', bid: 11, to: 'sw', urgency: 'week', status: 'plan', days: 12, from: 'Transplant coordinator',
      note: 'Mom says the medicine costs too much this month. Arabic speaker; please book an interpreter.',
      plan: 'Enrolled in manufacturer copay program; financial counselor call with Arabic interpreter booked.', closeNote: '', ack: false,
      log: [{ days: 12, text: 'Sent by transplant coordinator' }, { days: 11, text: 'Accepted by social worker' }, { days: 9, text: 'Called Rana with interpreter' }, { days: 5, text: 'Plan agreed: copay program' }] },
    { id: 'r4', pid: 'nadia', bid: null, flag: 'Team flag: caregiver may be depressed', to: 'psych', urgency: 'week', status: 'new', days: 2, from: 'Transplant coordinator',
      note: 'No BAT barriers, but at the visit Mom said she “can’t keep up” since a job loss and was tearful. Nadia’s doses run through Mom right now.',
      plan: '', closeNote: '', ack: false, log: [{ days: 2, text: 'Sent by transplant coordinator' }] },
  ];
}

export function seed(): DemoState {
  const routing: Record<number, Owner> = {};
  BARRIERS.forEach(b => { routing[b.id] = b.owner; });
  return { patients: patients(), referrals: referrals(), routing, hasPsych: true, digest: true };
}

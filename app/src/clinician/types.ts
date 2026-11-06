// Shared types for the KTx-CONNECT clinician layer.

export type Role = 'coord' | 'sw' | 'psych';
export type ReferralRole = 'sw' | 'psych';
export type Owner = Role | 'prescriber' | 'community';
export type Lang = 'en' | 'es' | 'ar';
export type Respondent = 'patient' | 'caregiver' | 'both';
export type Outcome = 'working' | 'not' | null;
export type Status = 'attention' | 'followup' | 'ontrack' | 'awaiting';
export type RefStatus = 'new' | 'accepted' | 'contacted' | 'plan' | 'closed';
export type Urgency = 'urgent' | 'week' | 'routine';
export type BarrierKind =
  | 'forgetting' | 'taste' | 'swallow' | 'side' | 'embarrass'
  | 'education' | 'discussion' | 'referral';

export type View =
  | 'week' | 'patients' | 'patient' | 'enroll' | 'meds'
  | 'referrals' | 'inbox' | 'reports' | 'settings';

export interface Barrier {
  id: number;
  label: string;
  short: string;
  owner: Owner;
  kind: BarrierKind;
  self?: boolean;   // self-help tips exist in the patient app
  urgent?: boolean; // routes same day
}

export interface User {
  id: Role;
  name: string;      // role title shown in logs ("Transplant coordinator") — no personal names
  initials: string;
  blurb: string;     // what this role does in the portal (sign-in screen)
  role: Role;
  title: string;
  lands: string;
}

export interface Caregiver { name: string; rel: string; phone?: string }

/** Barriers Assessment Tool result. `days` = days ago. */
export interface Bat {
  days: number;
  patient: number[];
  caregiver: number[];
  private: number[]; // barrier ids the teen hid from the caregiver
  words: string;
  orig?: string;     // original-language text when translated
}

export interface Plan {
  bid: number;
  solution: string;
  who: string;
  when: string;
  where: string;
  how: string;
  created: number;   // days ago
  outcome: Outcome;
  checked?: number;  // days since last check-back
  adjusted?: boolean;
  durability?: boolean;
}

export interface CheckIn { days: number; missed: number; note: string }
export interface Tried { days: number; by: string; what: string; result: string }

/** One pharmacy dispense. `days` = days ago; `qty` in the prescription's unit. */
export interface Fill { days: number; qty: number; pharmacy: string }
export interface DoseChange { days: number; from: string; to: string; by: string; reason: string }
export interface Attachment { name: string; days: number; url?: string }

export interface Prescription {
  id: string;
  drug: string;
  form: string;          // e.g. "1 mg capsule", "0.5 mg/mL oral suspension"
  dose: string;          // e.g. "4 mg twice daily"
  perDay: number;        // units used per day (capsules, mL...) — drives the run-out date
  unit: string;          // capsules, tablets, mL
  prescriber: string;    // role/service, never a person's name
  pharmacy: { name: string; phone: string };
  refillsLeft: number;
  fills: Fill[];         // newest first
  doseHistory: DoseChange[];
  attachment?: Attachment;
  reminded?: boolean;    // refill reminder already sent for the current fill
}

export interface Patient {
  id: string;
  first: string;
  last: string;
  dob: string; // YYYY-MM-DD
  lang: Lang;
  interpreter?: boolean;
  respondent: Respondent;
  caregiver?: Caregiver | null;
  phone: string;
  transition?: string;
  bat: Bat | null;
  linkSent?: number;
  prefs: Record<number, string[]>; // options the patient flagged as doable in the app
  plans: Plan[];
  risk: { tac: number[]; labs: number; visit: number };
  checkins: CheckIn[];
  tried: Tried[];
  meds: Prescription[];
  snoozed?: boolean;
}

export interface Referral {
  id: string;
  pid: string;
  bid: number | null;
  flag?: string | null;
  to: ReferralRole;
  urgency: Urgency;
  status: RefStatus;
  days: number;
  from: string;
  note: string;
  plan: string;
  closeNote: string;
  ack: boolean;
  auto?: boolean;
  seen?: boolean;
  log: { days: number; text: string }[];
}

export interface DemoState {
  patients: Patient[];
  referrals: Referral[];
  routing: Record<number, Owner>;
  hasPsych: boolean;
  digest: boolean;
}

export type ModalState =
  | { type: 'check'; pid: string }
  | { type: 'plan'; pid: string; bid: number }
  | { type: 'refer'; pid: string; bid: number | null }
  | { type: 'dose'; pid: string; rxId: string }
  | { type: 'fill'; pid: string; rxId: string };

export interface UiState {
  user: User | null;
  view: View;
  pid: string | null;
  filter: 'all' | Status;
  q: string;
  menuOpen: boolean;
  enrolledId: string | null;
  modal: ModalState | null;
  ptab: 'overview' | 'meds' | 'history';
}

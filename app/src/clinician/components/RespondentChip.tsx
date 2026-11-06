import { disagreements } from '../logic';
import type { Patient } from '../types';
import { UserIcon } from './ui';

/** Who answers the BAT; turns amber when patient and caregiver disagree. */
export default function RespondentChip({ p }: { p: Patient }) {
  const differ = disagreements(p).length > 0;
  const label = p.respondent === 'patient' ? 'Patient answers'
    : p.respondent === 'caregiver' ? `${p.caregiver?.rel ?? 'Caregiver'} answers`
    : 'Patient + caregiver';
  return <span className={`chip${differ ? ' warn' : ''}`}><UserIcon />{label}{differ ? ' · differ' : ''}</span>;
}

// App Bar (CCHMC component 02: color=head-primary, nav=yes, avatar=yes, App name=yes)
// plus the User profile popup (component 22) holding demo controls and sign out.

import { useEffect, useRef } from 'react';
import { useClin } from '../context';
import { refillsNeedingAction, tasksAll } from '../logic';
import type { View } from '../types';
import { simMayaCheckIn, simTaylorRefusal } from '../demo';

type NavItem = { view: View; label: string; count?: number; calm?: boolean };

export default function AppBar() {
  const { S, ui, setUi, go, update, toast, reset } = useClin();
  const user = ui.user!;
  const slot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ui.menuOpen) return;
    const close = (e: MouseEvent) => { if (slot.current && !slot.current.contains(e.target as Node)) setUi({ menuOpen: false }); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [ui.menuOpen, setUi]);

  const openRefs = S.referrals.filter(r => r.status !== 'closed');
  const refillCount = S.patients.reduce((n, p) => n + refillsNeedingAction(p).length, 0);
  const items: NavItem[] = user.role === 'coord'
    ? [
        { view: 'week', label: 'This week', count: tasksAll(S).length },
        { view: 'patients', label: 'Patients' },
        { view: 'meds', label: 'Medications', count: refillCount, calm: false },
        { view: 'referrals', label: 'Referrals sent', count: openRefs.length, calm: true },
        { view: 'enroll', label: 'Enroll patient' },
        { view: 'reports', label: 'Reports' },
        { view: 'settings', label: 'Settings' },
      ]
    : [
        { view: 'inbox', label: 'Referral inbox', count: openRefs.filter(r => r.to === user.role).length },
        { view: 'patients', label: 'My patients' },
        { view: 'reports', label: 'Reports' },
      ];
  const taylorDone = !!S.patients.find(p => p.id === 'taylor')?.bat;
  const mayaDone = S.patients.find(p => p.id === 'maya')?.plans.every(x => x.outcome) ?? true;

  return (
    <header className="top">
      <div className="appname"><b>Clinician Portal</b></div>
      <nav className="menu" aria-label="Main">
        {items.map(it => (
          <button key={it.view} type="button" onClick={() => go(it.view)}
            aria-current={ui.view === it.view || (ui.view === 'patient' && it.view === 'patients') ? 'page' : undefined}>
            <span>{it.label}</span>
            {!!it.count && <span className={`count${it.calm ? ' calm' : ''}`}>{it.count}</span>}
          </button>
        ))}
      </nav>
      <div className="acct-slot" ref={slot}>
        <button type="button" className="avatar" aria-expanded={ui.menuOpen} aria-label={`Account and demo controls (${user.title})`}
          onClick={() => setUi({ menuOpen: !ui.menuOpen })}>{user.initials}</button>
        {ui.menuOpen && (
          <div className="profile" role="menu">
            <div className="ph"><div className="avatar">{user.initials}</div><div><b>{user.title}</b><span>Signed in with hospital SSO</span></div></div>
            <div className="grp">
              <div className="lbl">Demo: simulate what the patient app sends</div>
              <button type="button" className="mi" disabled={taylorDone}
                onClick={() => { update(simTaylorRefusal); setUi({ menuOpen: false }); toast('Taylor’s BAT arrived: refusal routed to psychology same day'); }}>
                Taylor (17) finishes the BAT and says "I refuse"
              </button>
              <button type="button" className="mi" disabled={mayaDone}
                onClick={() => { update(simMayaCheckIn); setUi({ menuOpen: false }); toast('Maya checked in: weekend plan working'); }}>
                Maya checks in: weekend reminder is working
              </button>
              <button type="button" className="mi" onClick={() => { reset(); setUi({ menuOpen: false, enrolledId: null }); toast('Demo data reset'); }}>Reset demo data</button>
            </div>
            <div className="grp"><button type="button" className="mi" onClick={() => setUi({ user: null, menuOpen: false })}>Sign out</button></div>
          </div>
        )}
      </div>
    </header>
  );
}

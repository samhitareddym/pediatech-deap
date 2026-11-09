// Sign-in: pick a role, then continue through hospital single sign-on (simulated for the demo).

import { useState } from 'react';
import type { ReactNode } from 'react';
import { useClin } from '../context';
import { USERS } from '../data';
import type { Role } from '../types';
import { ArrowIcon, Button } from '../components/ui';

const ROLE_ICON: Record<Role, ReactNode> = {
  coord: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1M9 10h6M12 7v6M9 16h6" /></svg>,
  sw: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.4" /><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5M14.5 14.6c.8-.4 1.6-.6 2.5-.6 2.2 0 3.8 1.5 4.2 4" /></svg>,
  psych: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M4 11a8 8 0 1116 0c0 3-1.6 5-4 6.3V21h-6v-3.7C7.6 16 4 14 4 11z" /><path d="M9.5 10.5c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5S13.4 13 12 13" /></svg>,
};

export default function Login() {
  const { setUi } = useClin();
  const [role, setRole] = useState<Role | null>(null);
  const [signing, setSigning] = useState(false);

  const continueSSO = () => {
    if (!role) return;
    setSigning(true);
    window.setTimeout(() => {
      setUi({ user: USERS[role], view: role === 'coord' ? 'week' : 'inbox', filter: 'all', q: '', pid: null });
    }, 900);
  };

  return (
    <div className="login">
      <div className="login-card card">
        <div className="login-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
        </div>
        <h1>Welcome to the Clinician Portal</h1>
        <p className="login-sub">{signing ? 'Signing you in…' : 'Select your role to continue.'}</p>

        {signing ? (
          <div className="progress" aria-label="Signing in"><i /></div>
        ) : (
          <>
            <div className="roles" role="radiogroup" aria-label="Your role">
              {(Object.keys(USERS) as Role[]).map(k => (
                <button key={k} type="button" role="radio" aria-checked={role === k}
                  className={`role${role === k ? ' on' : ''}`} onClick={() => setRole(k)}>
                  <span className={`role-ic ic-${k}`}>{ROLE_ICON[k]}</span>
                  <span className="role-txt"><b>{USERS[k].title}</b><span>{USERS[k].blurb}</span></span>
                  <span className="role-dot" aria-hidden="true" />
                </button>
              ))}
            </div>
            <Button size="lg" className="sso-btn" disabled={!role} onClick={continueSSO}>
              Continue with SSO <ArrowIcon />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

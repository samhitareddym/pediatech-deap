// Entry point for the clinician layer. Mount <ClinicianApp /> anywhere; styles are scoped under .clin
// so they don't touch the patient (pet) layer.

import { useEffect } from 'react';
import './clinician.css';
import ClinicianProvider from './ClinicianProvider';
import { useClin } from './context';
import AppBar from './components/AppBar';
import ModalHost from './components/Modals';
import Login from './pages/Login';
import ThisWeek from './pages/ThisWeek';
import Patients from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
import Referrals from './pages/Referrals';
import Enroll from './pages/Enroll';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Medications from './pages/Medications';

export default function ClinicianApp() {
  return (
    <ClinicianProvider>
      <Shell />
    </ClinicianProvider>
  );
}

function Shell() {
  const { ui, toastMsg } = useClin();
  // Undo page-level layout from the patient layer (centred body, padded #root) while the portal is open.
  useEffect(() => {
    document.body.classList.add('clin-body');
    return () => document.body.classList.remove('clin-body');
  }, []);
  return (
    <div className="clin">
      {ui.user ? (
        <>
          <AppBar />
          <main><Page /></main>
        </>
      ) : <Login />}
      <ModalHost />
      {toastMsg && <div className="toast" role="status" aria-live="polite">{toastMsg}</div>}
    </div>
  );
}

function Page() {
  const { ui } = useClin();
  switch (ui.view) {
    case 'week': return <ThisWeek />;
    case 'patients': return <Patients />;
    case 'patient': return <PatientDetail />;
    case 'enroll': return <Enroll />;
    case 'meds': return <Medications />;
    case 'referrals': return <Referrals inbox={false} />;
    case 'inbox': return <Referrals inbox />;
    case 'reports': return <Reports />;
    case 'settings': return <Settings />;
  }
}

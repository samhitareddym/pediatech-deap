// Standalone entry for the clinician layer, loaded by /clinician.html.
// Keeps the patient layer's main.tsx and App.tsx untouched.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ClinicianApp from './ClinicianApp';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClinicianApp />
  </StrictMode>,
);

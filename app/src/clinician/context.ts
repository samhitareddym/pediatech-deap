import { createContext, useContext } from 'react';
import type { DemoState, UiState, View } from './types';

export interface ClinicianCtx {
  S: DemoState;
  ui: UiState;
  /** Mutate a copy of the demo data; the copy replaces the state. */
  update: (fn: (draft: DemoState) => void) => void;
  setUi: (patch: Partial<UiState>) => void;
  go: (view: View, pid?: string) => void;
  toast: (msg: string) => void;
  toastMsg: string | null;
  reset: () => void;
}

export const ClinicianContext = createContext<ClinicianCtx | null>(null);

export function useClin(): ClinicianCtx {
  const c = useContext(ClinicianContext);
  if (!c) throw new Error('useClin must be used inside <ClinicianProvider>');
  return c;
}

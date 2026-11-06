import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHandoff } from '../handoff';
import { simAnnaTaste } from './demo';
import type { ReactNode } from 'react';
import { ClinicianContext } from './context';
import type { ClinicianCtx } from './context';
import { seed } from './data';
import type { DemoState, UiState, View } from './types';

const INITIAL_UI: UiState = {
  user: null, view: 'week', pid: null, filter: 'all', q: '',
  menuOpen: false, enrolledId: null, modal: null, ptab: 'overview',
};

export default function ClinicianProvider({ children }: { children: ReactNode }) {
  const [S, setS] = useState<DemoState>(seed);
  const [ui, setUiState] = useState<UiState>(INITIAL_UI);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const update = useCallback((fn: (d: DemoState) => void) => {
    setS(prev => { const d = structuredClone(prev); fn(d); return d; });
  }, []);
  const setUi = useCallback((patch: Partial<UiState>) => setUiState(prev => ({ ...prev, ...patch })), []);
  const go = useCallback((view: View, pid?: string) => {
    setUiState(prev => ({ ...prev, view, pid: pid ?? prev.pid, menuOpen: false, enrolledId: null, ptab: view === 'patient' && pid !== prev.pid ? 'overview' : prev.ptab }));
    window.scrollTo(0, 0);
  }, []);
  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToastMsg(null), 2800);
  }, []);
  const reset = useCallback(() => setS(seed()), []);

  // Patient app -> portal: a new barrier report lands on Anna's chart.
  const { report } = useHandoff();
  useEffect(() => {
    if (!report) return;
    update(d => simAnnaTaste(d, report.words));
    toast(`New from ${report.name}'s app: "${report.words}"`);
  }, [report?.at]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo<ClinicianCtx>(
    () => ({ S, ui, update, setUi, go, toast, toastMsg, reset }),
    [S, ui, update, setUi, go, toast, toastMsg, reset],
  );
  return <ClinicianContext.Provider value={value}>{children}</ClinicianContext.Provider>;
}

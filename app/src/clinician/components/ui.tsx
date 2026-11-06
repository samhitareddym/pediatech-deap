// Small building blocks mapped to CCHMC components in the Figma design system
// (Button 01, Accordion 03, Alerts 04, Chip 08, Toggle-Switch 12, Indicator-card 21).

import { useEffect } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { Status } from '../types';

/* ---------- icons ---------- */
type IconProps = { className?: string };
export const LockIcon = ({ className = 'i' }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="1.5" /><path d="M5.5 7V5a2.5 2.5 0 015 0v2" /></svg>
);
export const GlobeIcon = ({ className = 'i' }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="8" cy="8" r="6" /><path d="M2 8h12M8 2c2 2 2 10 0 12M8 2c-2 2-2 10 0 12" /></svg>
);
export const CheckIcon = ({ className = 'i' }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg>
);
export const ArrowIcon = ({ className = 'i' }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
);
export const BackIcon = ({ className = 'i' }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M13 8H3M7 4L3 8l4 4" /></svg>
);
export const UserIcon = ({ className = 'i' }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="8" cy="5.5" r="2.8" /><path d="M2.5 14c.8-3 3-4.5 5.5-4.5s4.7 1.5 5.5 4.5" /></svg>
);
export const ChevronIcon = ({ className = 'i' }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 6l4 4 4-4" /></svg>
);
export const SearchIcon = ({ className = '' }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L14 14" /></svg>
);

/* ---------- Button (01) ---------- */
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'filled' | 'outlined'; size?: 'sm' | 'md' | 'lg' };
export function Button({ variant = 'filled', size = 'md', className = '', type = 'button', ...rest }: BtnProps) {
  const cls = ['btn', variant === 'outlined' ? 'sec' : '', size !== 'md' ? size : '', className].filter(Boolean).join(' ');
  return <button type={type} className={cls} {...rest} />;
}

/* ---------- Chips (08) ---------- */
const STATUS_LABEL: Record<Status, string> = {
  attention: 'Needs Attention', followup: 'Follow-up Due', ontrack: 'On Track', awaiting: 'Awaiting BAT',
};
export const StatusPill = ({ status }: { status: Status }) => <span className={`pill ${status}`}>{STATUS_LABEL[status]}</span>;
export const RefPill = ({ children }: { children: ReactNode }) => <span className="pill ref">{children}</span>;

type ChipTone = 'neutral' | 'warn' | 'neg' | 'ok' | 'blue' | 'violet';
export function Chip({ tone = 'neutral', children }: { tone?: ChipTone; children: ReactNode }) {
  return <span className={`chip${tone === 'neutral' ? '' : ' ' + tone}`}>{children}</span>;
}

/* ---------- Alert (04) ---------- */
type Severity = 'info' | 'success' | 'warning' | 'error' | 'neutral';
export function Alert({ severity, filled = false, icon, children }: { severity: Severity; filled?: boolean; icon?: ReactNode; children: ReactNode }) {
  return <div className={`alert ${severity}${filled ? ' filled' : ''}`} role="status">{icon}<span>{children}</span></div>;
}

/* ---------- Indicator card (21) ---------- */
export type IndicatorType = 'warning' | 'negative' | 'positive' | 'head-primary' | 'head-secondary' | 'heart-primary' | 'neutral';
export function Indicator({ type, value, total, label }: { type: IndicatorType; value: ReactNode; total?: ReactNode; label: string }) {
  return (
    <div className={`ind ${type}`}>
      <span className="v">{value}{total != null && <small> / {total}</small>}</span>
      <span className="l">{label}</span>
    </div>
  );
}

/* ---------- Accordion (03) ---------- */
export function Accordion({ title, summary, defaultOpen = false, children }: { title: string; summary?: string; defaultOpen?: boolean; children: ReactNode }) {
  return (
    <details className="acc" open={defaultOpen}>
      <summary><span>{title}{summary && <span className="sum"> · {summary}</span>}</span><ChevronIcon /></summary>
      <div className="accb">{children}</div>
    </details>
  );
}

/* ---------- Toggle switch (12, Brand = Head Primary) ---------- */
export function Switch({ id, checked, onChange, title, help }: { id: string; checked: boolean; onChange: (v: boolean) => void; title: string; help: string }) {
  return (
    <label className="toggle" htmlFor={id}>
      <input id={id} type="checkbox" role="switch" className="switch" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span><b>{title}</b><br /><span className="help">{help}</span></span>
    </label>
  );
}

/* ---------- Modal ---------- */
export function Modal({ title, onClose, children, footer, onSubmit }: {
  title: string; onClose: () => void; children: ReactNode; footer: ReactNode; onSubmit: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-bg" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="mh"><h2>{title}</h2><button type="button" className="x" onClick={onClose} aria-label="Close">×</button></div>
        <form onSubmit={e => { e.preventDefault(); onSubmit(); }}>
          <div className="mb">{children}</div>
          <div className="mf">{footer}</div>
        </form>
      </div>
    </div>
  );
}

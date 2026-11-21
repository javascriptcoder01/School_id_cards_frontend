// LhBits.jsx — letterhead print (rates / orders) ke chhote shared UI pieces.
import React from 'react';
import { X } from 'lucide-react';

const TONES = {
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  blue: 'bg-sky-50 text-sky-700 ring-sky-200',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  red: 'bg-rose-50 text-rose-700 ring-rose-200',
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
  teal: 'bg-teal-50 text-teal-700 ring-teal-200',
};

export const Chip = ({ tone = 'slate', children, className = '' }) => (
  <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${TONES[tone] || TONES.slate} ${className}`}>{children}</span>
);

/** Bottom sheet (mobile) / centre modal (desktop) */
export const Modal = ({ title, subtitle, onClose, children, footer, wide = false, busy = false }) => (
  <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
    <div className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl ${wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'}`}>
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="truncate text-xs text-slate-500">{subtitle}</p>}
        </div>
        <button type="button" onClick={onClose} disabled={busy} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-50" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="overflow-y-auto px-4 py-3">{children}</div>
      {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-4 py-3">{footer}</div>}
    </div>
  </div>
);

export const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100 disabled:bg-slate-50';

export const Field = ({ label, hint, error, children, htmlFor }) => (
  <div className="min-w-0">
    {label && (
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-bold text-slate-700">
        {label}
      </label>
    )}
    {children}
    {error ? <p className="mt-1 text-[11px] font-semibold text-rose-600">{error}</p> : hint ? <p className="mt-1 text-[11px] text-slate-500">{hint}</p> : null}
  </div>
);

export const RupeeInput = ({ id, value, onChange, placeholder = '0.00' }) => (
  <div className="relative">
    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-semibold text-slate-400">₹</span>
    <input id={id} inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${inputCls} pl-7`} />
  </div>
);

export const PrimaryButton = ({ children, className = '', ...props }) => (
  <button
    type="button"
    {...props}
    className={`inline-flex items-center justify-center gap-1.5 rounded-xl bg-linear-to-r from-teal-600 to-cyan-600 px-3.5 py-2 text-sm font-bold text-white shadow-md shadow-teal-500/25 hover:shadow-lg disabled:opacity-50 ${className}`}
  >
    {children}
  </button>
);

export const GhostButton = ({ children, className = '', ...props }) => (
  <button type="button" {...props} className={`inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-50 ${className}`}>
    {children}
  </button>
);

export default Chip;

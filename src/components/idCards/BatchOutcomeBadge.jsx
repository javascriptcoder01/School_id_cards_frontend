// BatchOutcomeBadge.jsx — batch ka outcome: COMPLETED (green), PARTIAL (amber), FAILED (red)
import React from 'react';

const STYLES = {
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PARTIAL: 'bg-amber-50 text-amber-700 border-amber-200',
  FAILED: 'bg-rose-50 text-rose-700 border-rose-200',
};

const LABELS = {
  COMPLETED: 'Completed',
  PARTIAL: 'Partial',
  FAILED: 'Failed',
};

export const BatchOutcomeBadge = ({ outcome }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-bold uppercase tracking-wide ${STYLES[outcome] || 'bg-slate-50 text-slate-600 border-slate-200'}`}
  >
    {LABELS[outcome] || outcome || '—'}
  </span>
);

export default BatchOutcomeBadge;

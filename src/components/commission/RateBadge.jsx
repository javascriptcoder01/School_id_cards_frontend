// RateBadge.jsx — "₹60 / card · School rate" ya "₹50 / card · Default"; rate nahi to "Rate not set"
import React from 'react';
import { formatInrShort } from '../../utils/money.js';

const SCOPE_LABELS = { COLLEGE: 'School rate', GLOBAL: 'Default' };

/**
 * @param {object} props
 * @param {number|null} [props.rate] - rupees
 * @param {'GLOBAL'|'COLLEGE'|null} [props.scope]
 * @param {string} [props.className]
 */
export const RateBadge = ({ rate = null, scope = null, className = '' }) => {
  if (rate === null || rate === undefined) {
    return (
      <span className={`inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 whitespace-nowrap ${className}`}>
        Rate not set
      </span>
    );
  }

  const isSchool = scope === 'COLLEGE';
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${isSchool ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-slate-50 text-slate-700'} ${className}`}>
      {formatInrShort(rate)} / card{SCOPE_LABELS[scope] ? ` · ${SCOPE_LABELS[scope]}` : ''}
    </span>
  );
};

export default RateBadge;

// PrintCheckChip.jsx — Theme Builder "Print check": chhota chip + list (sirf jaankari, save / approve nahi rokta).
// Designer aur Super Admin Print Center dono yahi dikhate hain.
import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown } from 'lucide-react';

/**
 * @param {object} props
 * @param {Array<{ code: string, message: string, side?: string }>} props.warnings
 * @param {string} [props.className]
 */
export const PrintCheckChip = ({ warnings = [], className = '' }) => {
  const [open, setOpen] = useState(false);
  if (warnings.length === 0) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200 ${className}`}>
        <CheckCircle2 className="h-3 w-3" /> Print check OK
      </span>
    );
  }
  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100"
      >
        <AlertTriangle className="h-3 w-3" /> Print check ({warnings.length})
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul className="mt-1.5 space-y-1 rounded-xl bg-amber-50/70 px-3 py-2 text-[11px] text-amber-900 ring-1 ring-amber-100">
          {warnings.map((w, i) => (
            <li key={`${w.code}-${w.side || ''}-${i}`} className="flex gap-1.5">
              <span aria-hidden="true">•</span>
              <span>
                {w.side ? <strong className="capitalize">{w.side}: </strong> : null}
                {w.message}
              </span>
            </li>
          ))}
          <li className="pt-0.5 text-amber-700/80">These are warnings only — saving and printing still work.</li>
        </ul>
      )}
    </div>
  );
};

export default PrintCheckChip;

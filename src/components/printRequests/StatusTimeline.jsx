// StatusTimeline.jsx — statusHistory (naya sabse upar): label, kisne (role), kab, reason
import React from 'react';
import { formatDateTime } from '../../utils/idCardFormat.js';
import { toneClasses, ROLE_LABELS } from './requestTones.js';

export const StatusTimeline = ({ history = [], className = '' }) => {
  const entries = [...history].reverse();

  if (entries.length === 0) {
    return <p className={`text-sm text-slate-500 ${className}`}>No activity yet.</p>;
  }

  return (
    <ol className={`relative space-y-5 ${className}`} aria-label="Request history">
      {entries.map((entry, index) => {
        const tone = toneClasses(entry.statusView?.tone);
        const isLast = index === entries.length - 1;
        return (
          <li key={`${entry.at}-${index}`} className="relative flex gap-3">
            {!isLast && <span className="absolute left-[5px] top-4 h-[calc(100%+0.75rem)] w-px bg-slate-200" aria-hidden="true" />}
            <span className={`relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full ring-4 ring-white ${tone.dot}`} aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">
                {entry.statusView?.label || entry.to}
              </p>
              <p className="text-xs text-slate-500">
                {ROLE_LABELS[entry.byRole] || entry.byRole || '—'} · {formatDateTime(entry.at)}
              </p>
              {entry.reason && (
                <p className="mt-1 rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700">
                  {entry.reason}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default StatusTimeline;

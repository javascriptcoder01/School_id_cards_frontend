// ImportStepper.jsx — Bulk import ke 3 steps (Upload → Preview → Import). Mobile par bhi ek line, compact.
import React from 'react';
import { Check } from 'lucide-react';

const STEPS = [
  { key: 'UPLOAD', label: 'Upload' },
  { key: 'PREVIEW', label: 'Preview' },
  { key: 'IMPORT', label: 'Import' },
];

const indexOf = (step) => (step === 'UPLOAD' ? 0 : step === 'PREVIEW' ? 1 : 2);

/** @param {{ step: 'UPLOAD'|'PREVIEW'|'IMPORTING'|'DONE' }} props */
export const ImportStepper = ({ step }) => {
  const current = indexOf(step);
  const done = step === 'DONE';
  return (
    <ol className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-xs" aria-label="Import steps">
      {STEPS.map((s, i) => {
        const complete = done || i < current;
        const active = !done && i === current;
        return (
          <li key={s.key} className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                complete
                  ? 'bg-linear-to-br from-emerald-500 to-teal-500 text-white'
                  : active
                    ? 'bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30'
                    : 'bg-slate-100 text-slate-400'
              }`}
              aria-current={active ? 'step' : undefined}
            >
              {complete ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className={`truncate text-xs font-bold ${active ? 'text-indigo-700' : complete ? 'text-slate-700' : 'text-slate-400'}`}>{s.label}</span>
            {i < STEPS.length - 1 && <span className={`hidden h-0.5 flex-1 rounded sm:block ${complete ? 'bg-emerald-400' : 'bg-slate-200'}`} aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
};

export default ImportStepper;

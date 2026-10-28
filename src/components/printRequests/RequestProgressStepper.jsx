// RequestProgressStepper.jsx — Created → Admin Approval → Print Center → Printing → Completed
// REJECTED / DECLINED / CANCELLED: jis step par ruka wahan laal stop + reason.
import React from 'react';
import { Check, X } from 'lucide-react';

const STEPS = ['Created', 'Admin Approval', 'Print Center', 'Printing', 'Completed'];

/**
 * Status (raw code) → { current: index, stopped: boolean, reason }
 * Steps ka matlab workflow ka hissa hai (label nahi) — label badge par API se aata hai.
 */
const resolveProgress = (request) => {
  switch (request?.status) {
    case 'DRAFT':
      return { current: 0 };
    case 'PENDING_APPROVAL':
      return { current: 1 };
    case 'REJECTED_BY_ADMIN':
      return { current: 1, stopped: true, reason: request.rejectionReason, stopLabel: 'Rejected' };
    case 'CANCELLED':
      return { current: request.submittedAt ? 1 : 0, stopped: true, stopLabel: 'Cancelled' };
    case 'APPROVED':
      return { current: 2 };
    case 'DECLINED':
      return { current: 2, stopped: true, reason: request.declineReason, stopLabel: 'Declined' };
    case 'PRINTING':
      return { current: 3 };
    case 'COMPLETED':
      return { current: 4, done: true };
    default:
      return { current: 0 };
  }
};

export const RequestProgressStepper = ({ request, className = '' }) => {
  const { current, stopped = false, done = false, reason = null, stopLabel = null } = resolveProgress(request);

  return (
    <div className={className}>
      <ol className="flex items-start" aria-label="Request progress">
        {STEPS.map((label, index) => {
          const isComplete = done || index < current;
          const isCurrent = !done && index === current;
          const isStop = stopped && isCurrent;
          const circle = isStop
            ? 'bg-rose-600 text-white ring-4 ring-rose-100'
            : isComplete
              ? 'bg-emerald-600 text-white'
              : isCurrent
                ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                : 'bg-white text-slate-400 border border-slate-300';
          const line = index < current || done ? 'bg-emerald-500' : 'bg-slate-200';

          return (
            <li key={label} className="relative flex-1 flex flex-col items-center text-center min-w-0">
              {index > 0 && (
                <span className={`absolute top-3.5 right-1/2 w-full h-0.5 -z-0 ${line}`} aria-hidden="true" />
              )}
              <span className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${circle}`}>
                {isStop ? <X className="h-4 w-4" /> : isComplete ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <span
                className={`mt-2 px-1 text-[11px] sm:text-xs font-semibold leading-tight ${isStop ? 'text-rose-700' : isCurrent ? 'text-indigo-700' : isComplete ? 'text-slate-700' : 'text-slate-400'}`}
              >
                {isStop && stopLabel ? stopLabel : label}
              </span>
            </li>
          );
        })}
      </ol>

      {stopped && reason && (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-800">
          <span className="font-semibold">Reason: </span>
          {reason}
        </p>
      )}
    </div>
  );
};

export default RequestProgressStepper;

// DeclinedRequestBanner.jsx — DECLINED request: laal banner (reason + revision + flagged count).
// School ko "Fix & Resubmit", Super Admin ko "waiting for school".
import React from 'react';
import { AlertOctagon, Flag } from 'lucide-react';
import { formatDateTime } from '../../utils/idCardFormat.js';

/**
 * @param {{ request: object, forSchool: boolean }} props
 */
export const DeclinedRequestBanner = ({ request, forSchool }) => {
  const flagged = request.declinedItems?.length || 0;
  const revision = request.revision || 1;
  return (
    <div className="overflow-hidden rounded-2xl border border-rose-200 bg-linear-to-r from-rose-50 via-white to-pink-50 shadow-xs" role="alert">
      <div className="h-1 bg-linear-to-r from-red-500 via-rose-500 to-pink-500" />
      <div className="flex items-start gap-3 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-red-500 to-rose-600 text-white shadow-md shadow-rose-500/30">
          <AlertOctagon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-extrabold text-rose-900">
              {forSchool ? 'Declined by the Print Center — fix and resubmit' : 'Declined — waiting for the school'}
            </p>
            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-rose-700 ring-1 ring-rose-200">Rev {revision}</span>
            {flagged > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-2 py-0.5 text-[11px] font-bold text-white">
                <Flag className="h-3 w-3" /> {flagged} student{flagged === 1 ? '' : 's'} flagged
              </span>
            )}
          </div>
          {request.declineReason && <p className="text-sm text-rose-900"><span className="font-semibold">Reason: </span>{request.declineReason}</p>}
          <p className="text-[11px] text-rose-700/80">
            {request.declinedAt ? `Declined ${formatDateTime(request.declinedAt)}. ` : ''}
            {forSchool ? 'Edit or remove the flagged students, then press Resubmit. The request keeps its number.' : 'Nothing is charged for this request.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeclinedRequestBanner;

// FlaggedStudentsList.jsx — DECLINED request: flagged students upar (issue chips + note), har row par
// "Edit student" (existing student edit / photo page, wapas isi request par) aur "Remove from request".
// Baaki students neeche (khol kar) — unhe bhi edit / remove kar sakte hain.
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Flag, ImageOff, Pencil, Trash2, UserRound } from 'lucide-react';
import DeclineIssueChips from './DeclineIssueChips.jsx';
import ConfirmActionModal from './ConfirmActionModal.jsx';
import { ROLES } from '../../constants/roles.js';
import { getOperatorStudentEditRoute, getStudentEditRoute } from '../../constants/routes.js';

/**
 * @param {object} props
 * @param {object[]} props.students - detail students ({ id, name, studentId, rollNumber, photoUrl, hasPhoto })
 * @param {Array<{ studentId: string, issues: string[], note?: string|null }>} props.declinedItems
 * @param {boolean} props.canFix - school (operator / admin) jiske paas RESUBMIT hai
 * @param {string} props.role
 * @param {string} props.returnTo - edit ke baad wapas yahan
 * @param {boolean} [props.saving]
 * @param {(student: object) => void} props.onRemove
 */
export const FlaggedStudentsList = ({ students = [], declinedItems = [], canFix, role, returnTo, saving = false, onRemove }) => {
  const [showOthers, setShowOthers] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);

  const flagById = new Map(declinedItems.map((item) => [item.studentId, item]));
  const flagged = students.filter((s) => flagById.has(s.id));
  const others = students.filter((s) => !flagById.has(s.id));
  const canRemove = canFix && students.length > 1;
  const editRoute = (id) => (role === ROLES.OPERATOR ? getOperatorStudentEditRoute(id) : getStudentEditRoute(id));

  const row = (s) => {
    const flag = flagById.get(s.id);
    return (
      <li key={s.id} className={`flex flex-col gap-2 rounded-xl border p-2.5 sm:flex-row sm:items-center ${flag ? 'border-rose-200 bg-rose-50/40' : 'border-slate-200 bg-white'}`}>
        <div className="flex min-w-0 flex-1 items-start gap-2.5">
          {s.photoUrl ? (
            <img src={s.photoUrl} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover ring-1 ring-slate-200" />
          ) : (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100"><UserRound className="h-5 w-5 text-slate-400" /></span>
          )}
          <div className="min-w-0 flex-1 space-y-1">
            <p className="truncate text-sm font-semibold text-slate-800">
              {s.name || 'Unnamed student'}
              <span className="ml-1.5 text-[11px] font-normal text-slate-500">
                {[s.studentId, s.rollNumber ? `Roll ${s.rollNumber}` : null].filter(Boolean).join(' · ')}
              </span>
            </p>
            {flag && <DeclineIssueChips issues={flag.issues} />}
            {!s.hasPhoto && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800"><ImageOff className="h-3 w-3" /> No photo</span>
            )}
            {flag?.note && <p className="text-xs text-rose-800">{flag.note}</p>}
          </div>
        </div>
        {canFix && (
          <div className="flex shrink-0 gap-1.5 pl-13 sm:pl-0">
            <Link
              to={editRoute(s.id)}
              state={{ returnTo }}
              className="inline-flex items-center gap-1 rounded-lg bg-linear-to-r from-indigo-600 to-violet-600 px-2.5 py-1.5 text-xs font-bold text-white shadow-sm shadow-indigo-500/25"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit student
            </Link>
            {canRemove && (
              <button
                type="button"
                onClick={() => setRemoveTarget(s)}
                disabled={saving}
                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            )}
          </div>
        )}
      </li>
    );
  };

  return (
    <div className="space-y-3 rounded-2xl border border-rose-100 bg-white p-4 shadow-xs sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
          <Flag className="h-4 w-4 text-rose-500" /> {flagged.length > 0 ? `Flagged students (${flagged.length})` : 'No students were flagged'}
        </h2>
        {canFix && !canRemove && students.length === 1 && <span className="text-[11px] text-slate-500">A request needs at least one student.</span>}
      </div>
      {flagged.length > 0 ? (
        <ul className="space-y-2">{flagged.map(row)}</ul>
      ) : (
        <p className="text-xs text-slate-500">Read the reason above and fix the students it mentions.</p>
      )}

      {others.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowOthers((v) => !v)}
            aria-expanded={showOthers}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:text-indigo-800"
          >
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showOthers ? 'rotate-180' : ''}`} />
            {showOthers ? 'Hide' : 'Show'} other students ({others.length})
          </button>
          {showOthers && <ul className="mt-2 space-y-2">{others.map(row)}</ul>}
        </div>
      )}

      <ConfirmActionModal
        open={Boolean(removeTarget)}
        title={`Remove ${removeTarget?.name || 'this student'}?`}
        message="Their card will not be part of this request. You can add them to a new request later."
        confirmLabel="Remove from request"
        tone="danger"
        loading={saving}
        onConfirm={() => {
          onRemove?.(removeTarget, () => setRemoveTarget(null));
        }}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
};

export default FlaggedStudentsList;

// DeclineRequestModal.jsx — Super Admin (Print Center detail): decline reason (min 5) + optional "Flag students"
// (search / select, issue chips, note per student). School inhi ko theek karke resubmit karta hai.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Flag, Loader2, Search, UserRound, X } from 'lucide-react';
import DeclineIssueChips from './DeclineIssueChips.jsx';
import { DECLINE_ITEM_NOTE_MAX, DECLINE_REASON_MAX, DECLINE_REASON_MIN } from '../../constants/printRequestDecline.js';

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {object} props.request - { requestNumber, studentCount }
 * @param {Array<{ id: string, name?: string, studentId?: string, rollNumber?: string, photoUrl?: string }>} props.students
 * @param {boolean} [props.loading]
 * @param {(body: { reason: string, declinedItems: Array<{ studentId: string, issues: string[], note: string|null }> }) => void} props.onConfirm
 * @param {() => void} props.onCancel
 */
export const DeclineRequestModal = ({ open = false, ...props }) => (open ? <DeclineDialog {...props} /> : null);

const DeclineDialog = ({ request, students = [], loading = false, onConfirm, onCancel }) => {
  const [reason, setReason] = useState('');
  const [query, setQuery] = useState('');
  const [flags, setFlags] = useState({}); // studentId → { issues: [], note: '' }
  const [touched, setTouched] = useState(false);
  const reasonRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => reasonRef.current?.focus(), 30);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !loading && onCancel?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [loading, onCancel]);

  const trimmed = reason.trim();
  const reasonError = trimmed.length < DECLINE_REASON_MIN ? `Write at least ${DECLINE_REASON_MIN} characters.` : null;
  const flaggedIds = Object.keys(flags);
  const missingIssues = flaggedIds.filter((id) => flags[id].issues.length === 0);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) =>
      [s.name, s.studentId, s.rollNumber].some((v) => String(v || '').toLowerCase().includes(q))
    );
  }, [students, query]);

  const toggleStudent = (id) =>
    setFlags((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = { issues: [], note: '' };
      return next;
    });

  const toggleIssue = (id, value) =>
    setFlags((prev) => {
      const current = prev[id];
      const issues = current.issues.includes(value) ? current.issues.filter((v) => v !== value) : [...current.issues, value];
      return { ...prev, [id]: { ...current, issues } };
    });

  const setNote = (id, note) => setFlags((prev) => ({ ...prev, [id]: { ...prev[id], note } }));

  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (loading || reasonError || missingIssues.length > 0) return;
    onConfirm?.({
      reason: trimmed,
      declinedItems: flaggedIds.map((studentId) => ({
        studentId,
        issues: flags[studentId].issues,
        note: flags[studentId].note.trim() || null,
      })),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="decline-title">
      <form onSubmit={submit} noValidate className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl">
        <div className="h-1 bg-linear-to-r from-red-500 via-rose-500 to-pink-500" />
        <div className="flex items-start gap-3 border-b border-slate-100 p-4 sm:p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="decline-title" className="text-base font-bold text-slate-900">Decline {request?.requestNumber || 'this request'}?</h2>
            <p className="mt-0.5 text-sm text-slate-600">It goes back to the school to fix and resubmit. The locked cards are revoked and nothing is charged.</p>
          </div>
          <button type="button" onClick={onCancel} disabled={loading} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          <div>
            <label htmlFor="decline-reason" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="decline-reason"
              ref={reasonRef}
              rows={3}
              maxLength={DECLINE_REASON_MAX}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onBlur={() => setTouched(true)}
              disabled={loading}
              placeholder="e.g. 3 photos are blurry, please re-upload"
              aria-invalid={touched && Boolean(reasonError)}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
            <div className="mt-1 flex justify-between text-[11px]">
              <span className="text-rose-600">{touched && reasonError}</span>
              <span className="text-slate-400">{reason.length}/{DECLINE_REASON_MAX}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                <Flag className="h-4 w-4 text-rose-500" /> Flag students <span className="text-xs font-normal text-slate-500">(optional)</span>
              </p>
              {flaggedIds.length > 0 && (
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">{flaggedIds.length} flagged</span>
              )}
            </div>
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, ID or roll no."
                aria-label="Search students"
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <ul className="max-h-72 space-y-1.5 overflow-y-auto pr-0.5">
              {visible.length === 0 && <li className="py-3 text-center text-xs text-slate-500">No students match.</li>}
              {visible.map((s) => {
                const flag = flags[s.id];
                return (
                  <li key={s.id} className={`rounded-xl border bg-white p-2 ${flag ? 'border-rose-200 shadow-xs' : 'border-slate-200'}`}>
                    <label className="flex cursor-pointer items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={Boolean(flag)}
                        onChange={() => toggleStudent(s.id)}
                        className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                      />
                      {s.photoUrl ? (
                        <img src={s.photoUrl} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover ring-1 ring-slate-200" />
                      ) : (
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100"><UserRound className="h-4 w-4 text-slate-400" /></span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-800">{s.name || 'Unnamed student'}</span>
                        <span className="block truncate text-[11px] text-slate-500">
                          {[s.studentId, s.rollNumber ? `Roll ${s.rollNumber}` : null].filter(Boolean).join(' · ') || '—'}
                        </span>
                      </span>
                    </label>
                    {flag && (
                      <div className="mt-2 space-y-2 pl-7">
                        <DeclineIssueChips issues={flag.issues} onToggle={(value) => toggleIssue(s.id, value)} idPrefix={`issue-${s.id}`} />
                        {touched && flag.issues.length === 0 && <p className="text-[11px] text-rose-600">Pick at least one issue.</p>}
                        <input
                          type="text"
                          value={flag.note}
                          maxLength={DECLINE_ITEM_NOTE_MAX}
                          onChange={(e) => setNote(s.id, e.target.value)}
                          placeholder="Note for the school (optional)"
                          aria-label={`Note for ${s.name || 'student'}`}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 p-4 sm:p-5">
          <button type="button" onClick={onCancel} disabled={loading} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || (touched && (Boolean(reasonError) || missingIssues.length > 0))}
            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-red-600 to-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-500/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Decline{flaggedIds.length ? ` · ${flaggedIds.length} flagged` : ''}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeclineRequestModal;

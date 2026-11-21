// ResubmitBar.jsx — DECLINED (school): neeche chipka bar. Badlav ki ginti + optional note + "No change needed"
// → Resubmit (confirm). Band jab tak kam se kam ek badlav na ho ya "No change needed" (note ke saath) na chuna ho.
import React, { useState } from 'react';
import { CheckCircle2, ImageUp, Loader2, PencilLine, RotateCcw, UserMinus, UserPlus } from 'lucide-react';
import ConfirmActionModal from './ConfirmActionModal.jsx';
import { RESUBMIT_NOTE_MAX, totalChanges } from '../../constants/printRequestDecline.js';

const Stat = ({ icon: Icon, label, value }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${value > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
    <Icon className="h-3 w-3" /> {value} {label}
  </span>
);

/**
 * @param {object} props
 * @param {{ edited: number, photosChanged: number, removed: number, added: number }|null} props.summary
 * @param {boolean} props.isAdmin - School Admin ka resubmit seedha approve bhi karta hai
 * @param {number} props.nextRevision
 * @param {boolean} props.loading
 * @param {(body: { note?: string, noChangeNeeded: boolean }) => void} props.onResubmit
 */
export const ResubmitBar = ({ summary, isAdmin, nextRevision, loading, onResubmit }) => {
  const [note, setNote] = useState('');
  const [noChange, setNoChange] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const changes = totalChanges(summary);
  const trimmed = note.trim();
  const needsNote = changes === 0 && noChange && !trimmed;
  const canResubmit = !loading && (changes > 0 || (noChange && Boolean(trimmed)));

  const body = { noChangeNeeded: changes === 0 && noChange, ...(trimmed ? { note: trimmed } : {}) };

  return (
    <>
      <div className="sticky bottom-2 z-30 rounded-2xl border border-indigo-200 bg-white/95 px-3 py-3 shadow-[0_-8px_24px_-12px_rgba(79,70,229,0.45)] backdrop-blur sm:px-4">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 inline-flex items-center gap-1 text-xs font-extrabold text-slate-800"><RotateCcw className="h-3.5 w-3.5 text-indigo-600" /> Fix &amp; Resubmit</span>
              <Stat icon={PencilLine} label="edited" value={summary?.edited || 0} />
              <Stat icon={ImageUp} label="photos changed" value={summary?.photosChanged || 0} />
              <Stat icon={UserMinus} label="removed" value={summary?.removed || 0} />
              {summary?.added > 0 && <Stat icon={UserPlus} label="added" value={summary.added} />}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="text"
                value={note}
                maxLength={RESUBMIT_NOTE_MAX}
                onChange={(e) => setNote(e.target.value)}
                placeholder={changes === 0 && noChange ? 'Why is no change needed? (required)' : 'Note for the Print Center (optional)'}
                aria-label="Resubmit note"
                aria-invalid={needsNote}
                className={`min-w-0 flex-1 rounded-xl border bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${needsNote ? 'border-amber-300' : 'border-slate-200'}`}
              />
              {changes === 0 && (
                <label className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <input type="checkbox" checked={noChange} onChange={(e) => setNoChange(e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  No change needed
                </label>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={!canResubmit}
            title={canResubmit ? undefined : 'Make at least one change, or tick "No change needed" and add a note'}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-linear-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-500/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {isAdmin ? 'Resubmit & Approve' : 'Resubmit'}
          </button>
        </div>
      </div>

      <ConfirmActionModal
        open={confirmOpen}
        title={`Resubmit as revision ${nextRevision}?`}
        message={
          isAdmin
            ? 'Your resubmit also approves it: cards are made again from the current photos and details, the amount is locked, and it goes back to the Print Center.'
            : 'It goes to the school admin for approval again, with the same request number.'
        }
        confirmLabel={isAdmin ? 'Resubmit & Approve' : 'Resubmit'}
        loading={loading}
        onConfirm={() => onResubmit?.(body, () => setConfirmOpen(false))}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
};

export default ResubmitBar;

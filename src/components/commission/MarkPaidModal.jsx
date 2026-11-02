// MarkPaidModal.jsx — chuni hui pending requests ka summary (read-only) + mode, reference, date, note.
// Total sirf dikhane ke liye; asli amount server locked pricing se jodta hai.
import React, { useEffect, useRef, useState } from 'react';
import { BadgeIndianRupee, Loader2, X } from 'lucide-react';
import { PAYMENT_MODE_OPTIONS, PAYMENT_NOTE_MAX, PAYMENT_REFERENCE_MAX } from '../../constants/commission.js';
import { formatInr } from '../../utils/money.js';
import { toLocalDateInput, toPaidAtIso } from '../../utils/commissionForm.js';

const inputClass =
  'w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white';
const labelClass = 'block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5';

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {Array<{ id: string, requestNumber?: string, cardCount: number, amountPaise: number }>} props.requests - chuni hui
 * @param {string} [props.collegeName]
 * @param {boolean} [props.loading]
 * @param {string|null} [props.error] - API error
 * @param {(body: { requestIds: string[], mode: string, referenceNo: string, paidAt: string, note: string }) => void} props.onConfirm
 * @param {() => void} props.onCancel
 */
export const MarkPaidModal = ({ open = false, ...props }) => (open ? <MarkPaidDialog {...props} /> : null);

const MarkPaidDialog = ({ requests = [], collegeName = '', loading = false, error = null, onConfirm, onCancel }) => {
  const today = toLocalDateInput();
  const [mode, setMode] = useState(PAYMENT_MODE_OPTIONS[0].value);
  const [referenceNo, setReferenceNo] = useState('');
  const [paidDate, setPaidDate] = useState(today);
  const [note, setNote] = useState('');
  const selectRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => selectRef.current?.focus(), 30);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !loading) onCancel?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [loading, onCancel]);

  const cards = requests.reduce((sum, request) => sum + (request.cardCount || 0), 0);
  const totalPaise = requests.reduce((sum, request) => sum + (request.amountPaise || 0), 0);
  const total = formatInr(totalPaise / 100);
  const dateInvalid = !paidDate || paidDate > today;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading || dateInvalid || requests.length === 0) return;
    onConfirm?.({
      requestIds: requests.map((request) => request.id),
      mode,
      referenceNo: referenceNo.trim(),
      paidAt: toPaidAtIso(paidDate),
      note: note.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="mark-paid-title">
      <form onSubmit={handleSubmit} noValidate className="w-full max-w-md max-h-full overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200">
        <div className="flex items-start gap-3 p-5 border-b border-slate-100">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <BadgeIndianRupee className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="mark-paid-title" className="text-base font-bold text-slate-900">Record payment</h2>
            {collegeName && <p className="mt-1 text-sm text-slate-600">{collegeName}</p>}
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <dl className="grid grid-cols-3 gap-3 rounded-xl bg-slate-50 p-3 text-sm">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Requests</dt>
              <dd className="mt-0.5 font-bold text-slate-900 tabular-nums">{requests.length}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Cards</dt>
              <dd className="mt-0.5 font-bold text-slate-900 tabular-nums">{cards}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total</dt>
              <dd className="mt-0.5 font-bold text-slate-900 tabular-nums break-words">{total}</dd>
            </div>
          </dl>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="mark-paid-mode" className={labelClass}>Mode <span className="text-rose-500">*</span></label>
              <select
                id="mark-paid-mode"
                ref={selectRef}
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                disabled={loading}
                className={inputClass}
              >
                {PAYMENT_MODE_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="mark-paid-date" className={labelClass}>Paid date <span className="text-rose-500">*</span></label>
              <input
                id="mark-paid-date"
                type="date"
                max={today}
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
                disabled={loading}
                aria-invalid={dateInvalid}
                className={inputClass}
              />
              {dateInvalid && <p className="mt-1 text-xs text-rose-600">Choose today or an earlier date.</p>}
            </div>
          </div>

          <div>
            <label htmlFor="mark-paid-reference" className={labelClass}>
              Reference no. <span className="text-slate-400 normal-case font-normal">(optional)</span>
            </label>
            <input
              id="mark-paid-reference"
              type="text"
              maxLength={PAYMENT_REFERENCE_MAX}
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              disabled={loading}
              placeholder="UTR, cheque no. or receipt no."
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="mark-paid-note" className={labelClass}>
              Note <span className="text-slate-400 normal-case font-normal">(optional)</span>
            </label>
            <textarea
              id="mark-paid-note"
              rows={2}
              maxLength={PAYMENT_NOTE_MAX}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={loading}
              className={`${inputClass} resize-none`}
            />
          </div>

          {error && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 p-5 pt-0">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || dateInvalid || requests.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Mark {total} as paid
          </button>
        </div>
      </form>
    </div>
  );
};

export default MarkPaidModal;

// SetRateModal.jsx — default ya school rate: ₹ (1–1000, 2 decimals tak) + note; current aur last rate dikhata hai
import React, { useEffect, useRef, useState } from 'react';
import { IndianRupee, Loader2, X } from 'lucide-react';
import { RATE_MAX, RATE_MIN, RATE_NOTE_MAX } from '../../constants/commission.js';
import { formatInrShort } from '../../utils/money.js';
import { validateRateInput } from '../../utils/commissionForm.js';

const inputClass =
  'w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white';

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {number|null} [props.currentRate] - rupees
 * @param {number|null} [props.lastRate] - rupees
 * @param {boolean} [props.loading]
 * @param {string|null} [props.error] - API error
 * @param {(data: { rate: number, note: string }) => void} props.onConfirm
 * @param {() => void} props.onCancel
 */
export const SetRateModal = ({ open = false, ...props }) => (open ? <SetRateDialog {...props} /> : null);

const SetRateDialog = ({
  title,
  description = '',
  currentRate = null,
  lastRate = null,
  loading = false,
  error = null,
  onConfirm,
  onCancel,
}) => {
  const [rate, setRate] = useState('');
  const [note, setNote] = useState('');
  const [touched, setTouched] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !loading) onCancel?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [loading, onCancel]);

  const rateError = validateRateInput(rate);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (loading || rateError) return;
    onConfirm?.({ rate: Number(rate.trim()), note: note.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="set-rate-title">
      <form onSubmit={handleSubmit} noValidate className="w-full max-w-md max-h-full overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200">
        <div className="flex items-start gap-3 p-5 border-b border-slate-100">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <IndianRupee className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="set-rate-title" className="text-base font-bold text-slate-900">{title}</h2>
            {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
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
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Current rate</dt>
              <dd className="mt-0.5 font-bold text-slate-900">{currentRate === null ? 'Not set' : `${formatInrShort(currentRate)} / card`}</dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Last rate</dt>
              <dd className="mt-0.5 font-bold text-slate-900">{lastRate === null ? '—' : `${formatInrShort(lastRate)} / card`}</dd>
            </div>
          </dl>

          <div>
            <label htmlFor="set-rate-value" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              New rate per card (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              id="set-rate-value"
              ref={inputRef}
              type="number"
              inputMode="decimal"
              min={RATE_MIN}
              max={RATE_MAX}
              step="0.01"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              onBlur={() => setTouched(true)}
              disabled={loading}
              placeholder="50"
              aria-invalid={Boolean(touched && rateError)}
              className={inputClass}
            />
            {touched && rateError && <p className="mt-1 text-xs text-rose-600">{rateError}</p>}
          </div>

          <div>
            <label htmlFor="set-rate-note" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Note <span className="text-slate-400 normal-case font-normal">(optional)</span>
            </label>
            <textarea
              id="set-rate-note"
              rows={2}
              maxLength={RATE_NOTE_MAX}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={loading}
              placeholder="Why is the rate changing?"
              className={`${inputClass} resize-none`}
            />
          </div>

          <p className="text-xs text-slate-500">Requests already approved keep their locked amount.</p>

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
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save rate
          </button>
        </div>
      </form>
    </div>
  );
};

export default SetRateModal;

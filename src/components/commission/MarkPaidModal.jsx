// MarkPaidModal.jsx — chuni hui pending requests ka summary + mode (UPI QR default), reference (UTR), date,
// asal mein mila amount (kam ho to "short" warning), payment proof (screenshot / PDF), note.
// Total sirf dikhane ke liye; asli due amount server locked pricing se jodta hai.
import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, BadgeIndianRupee, FileText, Loader2, Paperclip, Trash2, X } from 'lucide-react';
import {
  MARK_PAID_MODE_OPTIONS,
  PAYMENT_NOTE_MAX,
  PAYMENT_PROOF_ACCEPT,
  PAYMENT_PROOF_MAX_BYTES,
  PAYMENT_REFERENCE_MAX,
  PAYMENT_REFERENCE_REQUIRED_MODES,
} from '../../constants/commission.js';
import { uploadPaymentProof } from '../../features/commission/commissionApi.js';
import { formatInr } from '../../utils/money.js';
import { toLocalDateInput, toPaidAtIso } from '../../utils/commissionForm.js';

const inputClass =
  'w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white';
const labelClass = 'block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5';

// "1,234.50" → paise (int) ya null
const rupeesToPaise = (text) => {
  const clean = String(text ?? '').replace(/[,\s₹]/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return null;
  return Math.round(Number(clean) * 100);
};

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {Array<{ id: string, requestNumber?: string, cardCount: number, amountPaise: number }>} props.requests - chuni hui
 * @param {string} [props.collegeName]
 * @param {string} [props.collegeId] - proof upload ke liye (na ho to proof upload chhupa)
 * @param {boolean} [props.loading]
 * @param {string|null} [props.error] - API error
 * @param {(body: object) => void} props.onConfirm
 * @param {() => void} props.onCancel
 */
export const MarkPaidModal = ({ open = false, ...props }) => (open ? <MarkPaidDialog {...props} /> : null);

const MarkPaidDialog = ({ requests = [], collegeName = '', collegeId = null, loading = false, error = null, onConfirm, onCancel }) => {
  const today = toLocalDateInput();
  const totalPaise = requests.reduce((sum, request) => sum + (request.amountPaise || 0), 0);
  const [mode, setMode] = useState(MARK_PAID_MODE_OPTIONS[0].value);
  const [referenceNo, setReferenceNo] = useState('');
  const [paidDate, setPaidDate] = useState(today);
  const [received, setReceived] = useState((totalPaise / 100).toFixed(2));
  const [note, setNote] = useState('');
  const [proof, setProof] = useState(null); // { url, publicId, mimeType, name, preview }
  const [proofBusy, setProofBusy] = useState(false);
  const [proofError, setProofError] = useState(null);
  const [touched, setTouched] = useState(false);
  const selectRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => selectRef.current?.focus(), 30);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !loading && !proofBusy) onCancel?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [loading, proofBusy, onCancel]);

  // Local preview URL free
  useEffect(() => () => proof?.preview && URL.revokeObjectURL(proof.preview), [proof]);

  const cards = requests.reduce((sum, request) => sum + (request.cardCount || 0), 0);
  const total = formatInr(totalPaise / 100);
  const receivedPaise = rupeesToPaise(received);
  const shortPaise = receivedPaise !== null ? Math.max(0, totalPaise - receivedPaise) : 0;
  const dateInvalid = !paidDate || paidDate > today;
  const referenceRequired = PAYMENT_REFERENCE_REQUIRED_MODES.includes(mode);
  const referenceInvalid = referenceRequired && referenceNo.trim().length < 3;
  const receivedInvalid = receivedPaise === null;
  const blocked = loading || proofBusy || dateInvalid || referenceInvalid || receivedInvalid || requests.length === 0;

  const pickProof = async (file) => {
    setProofError(null);
    if (!file) return;
    if (!/^(image\/(png|jpeg|webp)|application\/pdf)$/.test(file.type)) {
      setProofError('Choose a PNG, JPEG, WEBP image or a PDF.');
      return;
    }
    if (file.size > PAYMENT_PROOF_MAX_BYTES) {
      setProofError('File size cannot exceed 5 MB.');
      return;
    }
    setProofBusy(true);
    try {
      const response = await uploadPaymentProof(collegeId, file);
      const uploaded = (response?.data ?? response)?.proof;
      if (!uploaded?.url) throw new Error('Upload failed');
      setProof({ ...uploaded, name: file.name, preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null });
    } catch (uploadError) {
      setProofError(uploadError?.message || 'Proof upload failed. Please try again.');
    } finally {
      setProofBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (blocked) return;
    onConfirm?.({
      requestIds: requests.map((request) => request.id),
      mode,
      referenceNo: referenceNo.trim(),
      paidAt: toPaidAtIso(paidDate),
      note: note.trim(),
      receivedAmountPaise: receivedPaise,
      ...(proof ? { proof: { url: proof.url, publicId: proof.publicId, mimeType: proof.mimeType } } : {}),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="mark-paid-title">
      <form onSubmit={handleSubmit} noValidate className="w-full max-w-md max-h-full overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200">
        <div className="flex items-start gap-3 p-5 border-b border-slate-100">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30">
            <BadgeIndianRupee className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="mark-paid-title" className="text-base font-bold text-slate-900">Mark as paid</h2>
            {collegeName && <p className="mt-1 text-sm text-slate-600">{collegeName}</p>}
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading || proofBusy}
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
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Due</dt>
              <dd className="mt-0.5 font-bold text-slate-900 tabular-nums break-words">{total}</dd>
            </div>
          </dl>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="mark-paid-mode" className={labelClass}>Method <span className="text-rose-500">*</span></label>
              <select id="mark-paid-mode" ref={selectRef} value={mode} onChange={(e) => setMode(e.target.value)} disabled={loading} className={inputClass}>
                {MARK_PAID_MODE_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="mark-paid-date" className={labelClass}>Paid on <span className="text-rose-500">*</span></label>
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
              Reference no.{' '}
              {referenceRequired ? <span className="text-rose-500">*</span> : <span className="text-slate-400 normal-case font-normal">(optional)</span>}
            </label>
            <input
              id="mark-paid-reference"
              type="text"
              maxLength={PAYMENT_REFERENCE_MAX}
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              disabled={loading}
              aria-invalid={touched && referenceInvalid}
              placeholder={referenceRequired ? 'UTR / transaction ID' : 'Cheque no. or receipt no.'}
              className={inputClass}
            />
            {touched && referenceInvalid && <p className="mt-1 text-xs text-rose-600">Enter the UTR / transaction ID (at least 3 characters).</p>}
          </div>

          <div>
            <label htmlFor="mark-paid-received" className={labelClass}>Amount received (₹) <span className="text-rose-500">*</span></label>
            <input
              id="mark-paid-received"
              type="text"
              inputMode="decimal"
              value={received}
              onChange={(e) => setReceived(e.target.value)}
              disabled={loading}
              aria-invalid={receivedInvalid}
              className={`${inputClass} tabular-nums`}
            />
            <p className="mt-1 text-xs text-slate-600">
              Due <span className="font-bold">{total}</span> · Received <span className="font-bold">{receivedPaise !== null ? formatInr(receivedPaise / 100) : '—'}</span>
            </p>
            {receivedInvalid && <p className="mt-1 text-xs text-rose-600">Enter an amount like 1200 or 1200.50.</p>}
            {shortPaise > 0 && (
              <p className="mt-1.5 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-800">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Short by {formatInr(shortPaise / 100)}. The selected requests will still be marked paid, and the receipt will show the shortfall.
              </p>
            )}
          </div>

          {collegeId && (
            <div>
              <span className={labelClass}>
                Payment proof <span className="text-slate-400 normal-case font-normal">(optional, image or PDF up to 5 MB)</span>
              </span>
              {proof ? (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-2">
                  {proof.preview ? (
                    <img src={proof.preview} alt="Payment proof preview" className="h-14 w-14 rounded-lg object-cover ring-1 ring-emerald-200" />
                  ) : (
                    <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-white ring-1 ring-emerald-200"><FileText className="h-6 w-6 text-emerald-700" /></span>
                  )}
                  <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-700">{proof.name}</span>
                  <button type="button" onClick={() => setProof(null)} disabled={loading} className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50" aria-label="Remove proof">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 px-3 py-3 text-xs font-semibold text-slate-600 hover:border-indigo-300 hover:text-indigo-700 ${proofBusy ? 'pointer-events-none opacity-60' : ''}`}>
                  {proofBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                  {proofBusy ? 'Uploading…' : 'Attach screenshot or PDF'}
                  <input ref={fileRef} type="file" accept={PAYMENT_PROOF_ACCEPT} className="sr-only" disabled={loading || proofBusy} onChange={(e) => pickProof(e.target.files?.[0] || null)} />
                </label>
              )}
              {proofError && <p className="mt-1 text-xs text-rose-600" role="alert">{proofError}</p>}
            </div>
          )}

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
            disabled={loading || proofBusy}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || proofBusy || requests.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirm — {receivedPaise !== null ? formatInr(receivedPaise / 100) : total} received
          </button>
        </div>
      </form>
    </div>
  );
};

export default MarkPaidModal;

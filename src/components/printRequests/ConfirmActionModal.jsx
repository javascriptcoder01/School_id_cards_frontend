// ConfirmActionModal.jsx — har status action ka confirm (reason: none / optional / required, max 500)
import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-react';

const REASON_MAX = 500;

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {string} props.title
 * @param {string} [props.message]
 * @param {string} [props.confirmLabel]
 * @param {'primary'|'danger'} [props.tone]
 * @param {'none'|'optional'|'required'} [props.reasonMode]
 * @param {string} [props.reasonLabel]
 * @param {string} [props.reasonPlaceholder]
 * @param {boolean} [props.loading]
 * @param {(reason: string) => void} props.onConfirm
 * @param {() => void} props.onCancel
 */
export const ConfirmActionModal = ({ open = false, ...props }) =>
  // Sirf khula ho tab mount — har baar khulne par reason apne aap khaali
  open ? <ConfirmActionDialog {...props} /> : null;

const ConfirmActionDialog = ({
  title,
  message = '',
  confirmLabel = 'Confirm',
  tone = 'primary',
  reasonMode = 'none',
  reasonLabel = 'Reason',
  reasonPlaceholder = 'Write a short reason…',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const [reason, setReason] = useState('');
  const textareaRef = useRef(null);
  const confirmRef = useRef(null);

  // Khulte hi focus (reason box, warna confirm button)
  useEffect(() => {
    const timer = setTimeout(() => (textareaRef.current || confirmRef.current)?.focus(), 30);
    return () => clearTimeout(timer);
  }, []);

  // Escape = cancel (chalte action mein nahi)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !loading) onCancel?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [loading, onCancel]);

  const trimmed = reason.trim();
  const reasonMissing = reasonMode === 'required' && trimmed.length === 0;
  const isDanger = tone === 'danger';
  const Icon = isDanger ? AlertTriangle : CheckCircle2;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading || reasonMissing) return;
    onConfirm?.(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="confirm-action-title">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200">
        <div className="flex items-start gap-3 p-5 border-b border-slate-100">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isDanger ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="confirm-action-title" className="text-base font-bold text-slate-900">{title}</h2>
            {message && <p className="mt-1 text-sm text-slate-600">{message}</p>}
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

        {reasonMode !== 'none' && (
          <div className="p-5 pb-0">
            <label htmlFor="confirm-action-reason" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              {reasonLabel}
              {reasonMode === 'required' ? <span className="text-rose-500"> *</span> : <span className="text-slate-400 normal-case font-normal"> (optional)</span>}
            </label>
            <textarea
              id="confirm-action-reason"
              ref={textareaRef}
              rows={4}
              maxLength={REASON_MAX}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
              placeholder={reasonPlaceholder}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
            />
            <p className={`mt-1 text-right text-[11px] ${reason.length >= REASON_MAX ? 'text-rose-600' : 'text-slate-400'}`}>
              {reason.length}/{REASON_MAX}
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 p-5">
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
            ref={confirmRef}
            disabled={loading || reasonMissing}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${isDanger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfirmActionModal;

import React, { useEffect, useRef } from 'react';
import { AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';

export const ConfirmDialog = ({
  open = false,
  title = 'Are you sure?',
  message = 'Please confirm this action to proceed.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isConfirming = false,
  variant = 'danger', // 'danger' | 'primary' | 'warning'
  onConfirm,
  onCancel,
}) => {
  const confirmButtonRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    // Handle Escape key press
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isConfirming && onCancel) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, isConfirming, onCancel]);

  if (!open) return null;

  const variantStyles = {
    danger: {
      icon: AlertCircle,
      iconClass: 'bg-rose-100 text-rose-600 border-rose-200',
      confirmClass: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500 text-white',
    },
    warning: {
      icon: AlertTriangle,
      iconClass: 'bg-amber-100 text-amber-600 border-amber-200',
      confirmClass: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 text-white',
    },
    primary: {
      icon: Info,
      iconClass: 'bg-indigo-100 text-indigo-600 border-indigo-200',
      confirmClass: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 text-white',
    },
  };

  const style = variantStyles[variant] || variantStyles.danger;
  const Icon = style.icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl ${style.iconClass} border flex items-center justify-center shrink-0 shadow-inner`}
          >
            <Icon className="w-6 h-6" aria-hidden="true" />
          </div>

          <div className="space-y-1">
            <h3 id="confirm-dialog-title" className="text-base font-bold text-slate-900">
              {title}
            </h3>
            <p id="confirm-dialog-desc" className="text-xs text-slate-500 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={isConfirming}
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors disabled:opacity-50 focus:outline-hidden focus:ring-2 focus:ring-slate-300"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            ref={confirmButtonRef}
            disabled={isConfirming}
            onClick={onConfirm}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-hidden focus:ring-2 focus:ring-offset-2 ${style.confirmClass}`}
          >
            {isConfirming && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isConfirming ? 'Processing...' : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;


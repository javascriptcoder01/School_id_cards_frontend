// PaymentDetailDrawer.jsx — ek payment ka receipt jaisa detail + uski requests (daayein se drawer)
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Undo2, X } from 'lucide-react';
import ErrorMessage from '../common/ErrorMessage.jsx';
import InlineLoader from '../common/InlineLoader.jsx';
import PaymentReceiptDetails from './PaymentReceiptDetails.jsx';
import { getPrintCenterDetailRoute } from '../../constants/routes.js';
import { cardsLabel } from '../../utils/commissionForm.js';
import { formatInr, formatInrShort } from '../../utils/money.js';

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {object|null} [props.payment]
 * @param {object[]} [props.requests]
 * @param {boolean} [props.loading]
 * @param {string|null} [props.error]
 * @param {() => void} props.onClose
 * @param {((payment: object) => void)|null} [props.onUndo] - Super Admin: undo (reason modal parent kholta hai)
 */
export const PaymentDetailDrawer = ({ open = false, ...props }) => (open ? <Drawer {...props} /> : null);

const Drawer = ({ payment = null, requests = [], loading = false, error = null, onClose, onUndo = null }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="payment-detail-title" onClick={onClose}>
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 p-5 border-b border-slate-100">
          <div className="min-w-0">
            <h2 id="payment-detail-title" className="font-mono text-base font-bold text-slate-900 break-words">
              {payment?.paymentNumber || 'Payment'}
            </h2>
            {payment?.college?.name && <p className="mt-0.5 text-sm text-slate-600">{payment.college.name}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {error && <ErrorMessage message={error} title="Couldn't load this payment" />}
          {loading && !payment && <InlineLoader text="Loading payment…" />}

          {payment && (
            <>
              <PaymentReceiptDetails payment={payment} />
              {onUndo && !payment.isReversed && (
                <button
                  type="button"
                  onClick={() => onUndo(payment)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50"
                >
                  <Undo2 className="h-3.5 w-3.5" /> Undo payment
                </button>
              )}

              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-2">Requests ({requests.length})</h3>
                <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                  {requests.map((request) => (
                    <li key={request.id} className="flex items-start justify-between gap-3 p-3 text-sm">
                      <div className="min-w-0">
                        <Link to={getPrintCenterDetailRoute(request.id)} className="font-mono text-xs font-semibold text-indigo-700 hover:underline">
                          {request.requestNumber || '—'}
                        </Link>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {request.className ? `${request.className}${request.section ? ` - ${request.section}` : ''}` : '—'} · {cardsLabel(request.cardCount)} × {formatInrShort(request.rate)}
                        </p>
                      </div>
                      <span className="shrink-0 font-semibold text-slate-900 tabular-nums">{formatInr(request.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailDrawer;

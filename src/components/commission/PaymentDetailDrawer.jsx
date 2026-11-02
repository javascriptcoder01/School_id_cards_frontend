// PaymentDetailDrawer.jsx — ek payment ka receipt jaisa detail + uski requests (daayein se drawer)
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import ErrorMessage from '../common/ErrorMessage.jsx';
import InlineLoader from '../common/InlineLoader.jsx';
import { PAYMENT_MODE_LABELS } from '../../constants/commission.js';
import { getPrintCenterDetailRoute } from '../../constants/routes.js';
import { cardsLabel } from '../../utils/commissionForm.js';
import { formatDateTime } from '../../utils/idCardFormat.js';
import { formatInr, formatInrShort } from '../../utils/money.js';

const Row = ({ label, children }) => (
  <div className="flex justify-between gap-3 py-1.5">
    <dt className="text-slate-500">{label}</dt>
    <dd className="font-semibold text-slate-800 text-right min-w-0 break-words">{children}</dd>
  </div>
);

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {object|null} [props.payment]
 * @param {object[]} [props.requests]
 * @param {boolean} [props.loading]
 * @param {string|null} [props.error]
 * @param {() => void} props.onClose
 */
export const PaymentDetailDrawer = ({ open = false, ...props }) => (open ? <Drawer {...props} /> : null);

const Drawer = ({ payment = null, requests = [], loading = false, error = null, onClose }) => {
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
              <dl className="text-sm divide-y divide-slate-100">
                <Row label="Amount">{formatInr(payment.amount)}</Row>
                <Row label="Cards">{payment.cardCount}</Row>
                <Row label="Mode">{PAYMENT_MODE_LABELS[payment.mode] || payment.mode}</Row>
                <Row label="Reference">{payment.referenceNo || '—'}</Row>
                <Row label="Paid on">{formatDateTime(payment.paidAt)}</Row>
                <Row label="Recorded by">{payment.recordedBy?.name || '—'}</Row>
                {payment.note && <Row label="Note">{payment.note}</Row>}
              </dl>

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

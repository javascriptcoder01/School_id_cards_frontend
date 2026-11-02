// RecentPaymentsList.jsx — School Admin dashboard: aakhri payments
import React from 'react';
import { ReceiptIndianRupee } from 'lucide-react';
import EmptyState from '../common/EmptyState.jsx';
import { PAYMENT_MODE_LABELS } from '../../constants/commission.js';
import { cardsLabel } from '../../utils/commissionForm.js';
import { formatDateTime } from '../../utils/idCardFormat.js';
import { formatInr } from '../../utils/money.js';

/**
 * @param {object} props
 * @param {object[]} [props.payments] - overview.recentPayments
 */
export const RecentPaymentsList = ({ payments = [] }) => {
  if (payments.length === 0) {
    return <EmptyState title="No payments yet" description="Payments recorded by the Super Admin appear here." icon={ReceiptIndianRupee} />;
  }

  return (
    <ul className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100">
      {payments.map((payment) => (
        <li key={payment.paymentNumber} className="flex items-start justify-between gap-3 px-4 sm:px-6 py-3.5 text-sm">
          <div className="min-w-0">
            <p className="font-mono text-xs font-semibold text-slate-800 break-words">{payment.paymentNumber}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {cardsLabel(payment.cards)} · {PAYMENT_MODE_LABELS[payment.mode] || payment.mode} · {formatDateTime(payment.paidAt)}
            </p>
          </div>
          <span className="shrink-0 font-semibold text-slate-900 tabular-nums">{formatInr(payment.amount)}</span>
        </li>
      ))}
    </ul>
  );
};

export default RecentPaymentsList;

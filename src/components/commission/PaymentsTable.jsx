// PaymentsTable.jsx — payment history. onSelect ho to payment number par click se detail.
import React from 'react';
import { ReceiptIndianRupee } from 'lucide-react';
import EmptyState from '../common/EmptyState.jsx';
import { PAYMENT_MODE_LABELS } from '../../constants/commission.js';
import { formatDateTime } from '../../utils/idCardFormat.js';
import { formatInr } from '../../utils/money.js';

/**
 * @param {object} props
 * @param {object[]} [props.payments] - API ke toSafePayment
 * @param {boolean} [props.loading]
 * @param {boolean} [props.showCollege] - school ke ledger par school column nahi chahiye
 * @param {(payment: object) => void} [props.onSelect]
 */
export const PaymentsTable = ({ payments = [], loading = false, showCollege = true, onSelect }) => {
  if (!loading && payments.length === 0) {
    return <EmptyState title="No payments yet" description="Recorded payments appear here." icon={ReceiptIndianRupee} />;
  }

  const columnCount = showCollege ? 9 : 8;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm" aria-label="Payments">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 sm:px-6 py-3">Payment</th>
              {showCollege && <th className="px-4 py-3">School</th>}
              <th className="px-4 py-3 text-center">Requests</th>
              <th className="px-4 py-3 text-center">Cards</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Mode</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Paid on</th>
              <th className="px-4 sm:px-6 py-3">Recorded by</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && payments.length === 0
              ? Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: columnCount }).map((__, j) => (
                    <td key={j} className="px-4 py-4"><span className="block h-4 rounded bg-slate-100" /></td>
                  ))}
                </tr>
              ))
              : payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50/70">
                  <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                    {onSelect ? (
                      <button
                        type="button"
                        onClick={() => onSelect(payment)}
                        className="font-mono text-xs font-semibold text-indigo-700 hover:underline"
                      >
                        {payment.paymentNumber}
                      </button>
                    ) : (
                      <span className="font-mono text-xs font-semibold text-slate-800">{payment.paymentNumber}</span>
                    )}
                  </td>
                  {showCollege && <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">{payment.college?.name || '—'}</td>}
                  <td className="px-4 py-3.5 text-center tabular-nums">{payment.requestCount}</td>
                  <td className="px-4 py-3.5 text-center tabular-nums">{payment.cardCount}</td>
                  <td className="px-4 py-3.5 text-right font-semibold text-slate-900 whitespace-nowrap tabular-nums">{formatInr(payment.amount)}</td>
                  <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">{PAYMENT_MODE_LABELS[payment.mode] || payment.mode}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">{payment.referenceNo || '—'}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">{formatDateTime(payment.paidAt)}</td>
                  <td className="px-4 sm:px-6 py-3.5 text-slate-700 whitespace-nowrap">{payment.recordedBy?.name || '—'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentsTable;

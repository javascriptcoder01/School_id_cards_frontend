// PaymentStatusBadge.jsx — API ke payment.statusView se badge. Payment nahi (operator) → kuch nahi.
// PAID: chhota ✓ + tooltip (paid date + UTR / reference).
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import RequestStatusBadge from '../printRequests/RequestStatusBadge.jsx';
import { formatDateTime } from '../../utils/idCardFormat.js';

/**
 * @param {object} props
 * @param {{ status?: string, statusView?: { label: string, tone: string }, paidAt?: string, referenceNo?: string }} [props.payment]
 * @param {'sm'|'md'} [props.size]
 * @param {string} [props.className]
 */
export const PaymentStatusBadge = ({ payment, size = 'sm', className = '' }) => {
  if (payment?.status !== 'PAID') {
    return <RequestStatusBadge statusView={payment?.statusView} size={size} className={className} />;
  }
  const tip = [payment.paidAt ? `Paid on ${formatDateTime(payment.paidAt)}` : 'Paid', payment.referenceNo ? `Ref ${payment.referenceNo}` : null]
    .filter(Boolean)
    .join(' · ');
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} title={tip}>
      <RequestStatusBadge statusView={payment.statusView} size={size} />
      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-label={tip} />
    </span>
  );
};

export default PaymentStatusBadge;

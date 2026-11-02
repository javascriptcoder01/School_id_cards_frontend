// PaymentStatusBadge.jsx — API ke payment.statusView se badge. Payment nahi (operator) → kuch nahi.
import React from 'react';
import RequestStatusBadge from '../printRequests/RequestStatusBadge.jsx';

/**
 * @param {object} props
 * @param {{ statusView?: { label: string, tone: string } }} [props.payment]
 * @param {'sm'|'md'} [props.size]
 * @param {string} [props.className]
 */
export const PaymentStatusBadge = ({ payment, size = 'sm', className = '' }) => (
  <RequestStatusBadge statusView={payment?.statusView} size={size} className={className} />
);

export default PaymentStatusBadge;

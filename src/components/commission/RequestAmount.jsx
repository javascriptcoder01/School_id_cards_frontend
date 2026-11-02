// RequestAmount.jsx — request ka amount: approve se pehle grey italic "Est.", approve ke baad locked.
// Decline (Not charged) par ₹0. Pricing / estimate keys nahi aati (operator) → kuch nahi.
import React from 'react';
import { formatInr } from '../../utils/money.js';

/**
 * @param {object} props
 * @param {object} props.request - API print request
 * @param {string} [props.className]
 */
export const RequestAmount = ({ request, className = '' }) => {
  if (!request?.payment) return null;

  if (request.payment.status === 'VOID') {
    return <span className={`font-semibold text-slate-500 tabular-nums ${className}`}>{formatInr(0)}</span>;
  }
  if (request.pricing) {
    return <span className={`font-semibold text-slate-900 tabular-nums ${className}`}>{formatInr(request.pricing.amount)}</span>;
  }
  if (request.estimate) {
    return (
      <span className={`italic text-slate-400 tabular-nums ${className}`}>
        {formatInr(request.estimate.amount)} <span className="text-[11px]">Est.</span>
      </span>
    );
  }
  return <span className={`text-slate-400 ${className}`}>—</span>;
};

export default RequestAmount;

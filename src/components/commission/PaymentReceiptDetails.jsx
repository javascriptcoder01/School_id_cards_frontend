// PaymentReceiptDetails.jsx — receipt ki lines (due / received / short, method, reference, date, proof, undo info).
// Drawer aur request detail ka receipt card dono yahi dikhate hain.
import React from 'react';
import ProofButton from './ProofButton.jsx';
import { AlertTriangle, Undo2 } from 'lucide-react';
import { PAYMENT_MODE_LABELS } from '../../constants/commission.js';
import { formatDateTime } from '../../utils/idCardFormat.js';
import { formatInr } from '../../utils/money.js';

const Row = ({ label, children }) => (
  <div className="flex justify-between gap-3 py-1.5">
    <dt className="text-slate-500">{label}</dt>
    <dd className="font-semibold text-slate-800 text-right min-w-0 break-words">{children}</dd>
  </div>
);

/**
 * @param {{ payment: object }} props - toSafePayment shape
 */
export const PaymentReceiptDetails = ({ payment }) => {
  const isPdf = payment.proof?.mimeType === 'application/pdf';
  return (
    <div className="space-y-3">
      {payment.isReversed && payment.reversed && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800" role="status">
          <Undo2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            <strong>Undone</strong> {formatDateTime(payment.reversed.at)}
            {payment.reversed.by?.name ? ` by ${payment.reversed.by.name}` : ''} — {payment.reversed.reason}
          </span>
        </div>
      )}
      <dl className="text-sm divide-y divide-slate-100">
        <Row label="Due">{formatInr(payment.amount)}</Row>
        <Row label="Received">{payment.receivedAmountFormatted || formatInr(payment.amount)}</Row>
        {payment.shortByPaise > 0 && (
          <Row label="Short by">
            <span className="inline-flex items-center gap-1 text-amber-700">
              <AlertTriangle className="h-3.5 w-3.5" /> {payment.shortByFormatted}
            </span>
          </Row>
        )}
        <Row label="Cards">{payment.cardCount}</Row>
        <Row label="Method">{PAYMENT_MODE_LABELS[payment.mode] || payment.mode}</Row>
        <Row label="Reference">{payment.referenceNo || '—'}</Row>
        <Row label="Paid on">{formatDateTime(payment.paidAt)}</Row>
        <Row label="Recorded by">{payment.recordedBy?.name || '—'}</Row>
        {payment.proof?.url && (
          <Row label="Proof">
            {/* PDF ka public link Cloudinary par block hai — server se (signed) laao */}
            <ProofButton path={`/commission/payments/${payment.id}/proof`} isPdf={isPdf} />
          </Row>
        )}
        {payment.note && <Row label="Note">{payment.note}</Row>}
      </dl>
    </div>
  );
};

export default PaymentReceiptDetails;

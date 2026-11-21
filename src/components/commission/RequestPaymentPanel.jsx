// RequestPaymentPanel.jsx — Super Admin, ek request ka payment: PENDING → "Mark as Paid";
// PAID → receipt card (method, reference, date, proof, recorded by) + "Undo payment".
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BadgeIndianRupee, ReceiptIndianRupee, Undo2 } from 'lucide-react';
import MarkPaidModal from './MarkPaidModal.jsx';
import PaymentReceiptDetails from './PaymentReceiptDetails.jsx';
import UndoPaymentDialog from './UndoPaymentDialog.jsx';
import InlineLoader from '../common/InlineLoader.jsx';
import { clearMarkPaidError, fetchPaymentRequested, markPaidRequested } from '../../features/commission/commissionSlice.js';
import {
  selectMarkPaidError,
  selectMarkPaidSaving,
  selectPaymentDetail,
  selectPaymentDetailLoading,
} from '../../features/commission/commissionSelectors.js';

/**
 * @param {object} props
 * @param {object} props.request - print request (Super Admin view: payment + pricing + college)
 * @param {() => void} props.onChanged - mark paid / undo ke baad request dobara lao
 */
export const RequestPaymentPanel = ({ request, onChanged }) => {
  const dispatch = useDispatch();
  const saving = useSelector(selectMarkPaidSaving);
  const error = useSelector(selectMarkPaidError);
  const receipt = useSelector(selectPaymentDetail);
  const receiptLoading = useSelector(selectPaymentDetailLoading);
  const [modalOpen, setModalOpen] = useState(false);
  const [undoTarget, setUndoTarget] = useState(null);

  const status = request?.payment?.status;
  const paymentId = request?.payment?.paymentId || null;

  useEffect(() => {
    if (status === 'PAID' && paymentId) dispatch(fetchPaymentRequested({ paymentId }));
  }, [dispatch, status, paymentId]);

  if (!request?.payment || (status !== 'PENDING' && status !== 'PAID')) return null;

  if (status === 'PENDING') {
    if (!request.pricing) return null;
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-linear-to-r from-amber-50 to-orange-50 p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-amber-900">
          <strong>Payment pending.</strong> Record it once the school has paid.
        </p>
        <button
          type="button"
          onClick={() => {
            dispatch(clearMarkPaidError());
            setModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/25"
        >
          <BadgeIndianRupee className="h-3.5 w-3.5" /> Mark as Paid
        </button>
        <MarkPaidModal
          open={modalOpen}
          requests={[{ id: request.id, requestNumber: request.requestNumber, cardCount: request.pricing.cardCount, amountPaise: request.pricing.amountPaise }]}
          collegeName={request.college?.name || ''}
          collegeId={request.college?.id || null}
          loading={saving}
          error={error}
          onConfirm={(body) =>
            dispatch(
              markPaidRequested({
                collegeId: request.college?.id,
                body,
                onSuccess: () => {
                  setModalOpen(false);
                  onChanged?.();
                },
              })
            )
          }
          onCancel={() => setModalOpen(false)}
        />
      </div>
    );
  }

  // PAID: receipt card
  const shown = receipt && receipt.id === paymentId ? receipt : null;
  return (
    <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-xs">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
          <ReceiptIndianRupee className="h-4 w-4 text-emerald-600" /> Payment receipt {shown ? <span className="font-mono text-xs text-slate-500">{shown.paymentNumber}</span> : null}
        </h2>
        {shown && !shown.isReversed && (
          <button
            type="button"
            onClick={() => setUndoTarget(shown)}
            className="inline-flex items-center gap-1 rounded-xl border border-rose-200 px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50"
          >
            <Undo2 className="h-3.5 w-3.5" /> Undo payment
          </button>
        )}
      </div>
      {receiptLoading && !shown ? <InlineLoader text="Loading receipt…" /> : shown ? <PaymentReceiptDetails payment={shown} /> : null}
      <UndoPaymentDialog payment={undoTarget} onClose={() => setUndoTarget(null)} onDone={() => onChanged?.()} />
    </div>
  );
};

export default RequestPaymentPanel;

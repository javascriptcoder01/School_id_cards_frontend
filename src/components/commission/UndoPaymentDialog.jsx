// UndoPaymentDialog.jsx — Super Admin: payment undo (reason zaroori). Requests wapas PENDING, receipt "undone".
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ConfirmActionModal from '../printRequests/ConfirmActionModal.jsx';
import { clearReverseError, reversePaymentRequested } from '../../features/commission/commissionSlice.js';
import { selectReverseError, selectReverseSaving } from '../../features/commission/commissionSelectors.js';
import { PAYMENT_REVERSE_REASON_MIN } from '../../constants/commission.js';

/**
 * @param {object} props
 * @param {{ id: string, paymentNumber?: string, college?: { id: string } }|null} props.payment - null = band
 * @param {() => void} props.onClose
 * @param {(payment: object) => void} [props.onDone]
 */
export const UndoPaymentDialog = ({ payment, onClose, onDone }) => {
  const dispatch = useDispatch();
  const saving = useSelector(selectReverseSaving);
  const error = useSelector(selectReverseError);

  const close = () => {
    dispatch(clearReverseError());
    onClose();
  };

  return (
    <ConfirmActionModal
      open={Boolean(payment)}
      title={payment ? `Undo payment ${payment.paymentNumber || ''}?` : ''}
      message={
        error ||
        'Its requests go back to Pending Payment and the receipt stays in history as "Undone". Nothing is deleted.'
      }
      confirmLabel="Undo payment"
      tone="danger"
      reasonMode="required"
      reasonLabel={`Reason (at least ${PAYMENT_REVERSE_REASON_MIN} characters)`}
      reasonPlaceholder="e.g. Entered for the wrong school"
      loading={saving}
      onConfirm={(reason) =>
        dispatch(
          reversePaymentRequested({
            paymentId: payment.id,
            reason,
            collegeId: payment.college?.id,
            onSuccess: (updated) => {
              close();
              onDone?.(updated);
            },
          })
        )
      }
      onCancel={close}
    />
  );
};

export default UndoPaymentDialog;

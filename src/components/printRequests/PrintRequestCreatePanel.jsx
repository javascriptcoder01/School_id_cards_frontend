import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Printer, Shield, Check, AlertTriangle, Layers, User } from 'lucide-react';
import { createPrintRequestRequested } from '../../features/printRequests/printRequestSlice.js';
import { selectIsPrintRequestActionLoading } from '../../features/printRequests/printRequestSelectors.js';
import { selectCurrentUser } from '../../features/auth/authSelectors.js';
import { PRINT_REQUEST_TYPES } from '../../constants/printRequest.js';
import ConfirmDialog from '../common/ConfirmDialog.jsx';

/**
 * PrintRequestCreatePanel Component
 * Allows Operators to create Single or Bulk print requests for generated student cards
 */
export const PrintRequestCreatePanel = ({
  generationId,
  selectedStudentIds = [],
  totalAvailable = 0,
  onSuccess,
  className = '',
}) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const isLoading = useSelector(selectIsPrintRequestActionLoading);

  const [showConfirm, setShowConfirm] = useState(false);

  const count = selectedStudentIds.length;
  const isBulk = count > 1;
  const requestType = isBulk ? PRINT_REQUEST_TYPES.BULK : PRINT_REQUEST_TYPES.SINGLE;

  const handleOpenConfirm = () => {
    if (count === 0 || isLoading) return;
    setShowConfirm(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirm(false);
    dispatch(
      createPrintRequestRequested({
        generationId,
        studentIds: selectedStudentIds,
        requestType,
      })
    );
    if (onSuccess) onSuccess();
  };

  return (
    <div className={`bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
            <Printer className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Submit ID Cards for Printing</h2>
            <p className="text-xs text-slate-500">
              Send generated ID cards through the multi-tier approval and printing pipeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Type: {requestType}</span>
          </span>
        </div>
      </div>

      {/* Operator Scope Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div>
          <span className="text-slate-400 font-semibold uppercase block">Operator</span>
          <span className="font-bold text-slate-800 text-sm">{currentUser?.name || 'Operator'}</span>
        </div>
        <div>
          <span className="text-slate-400 font-semibold uppercase block">Assigned Class / Section</span>
          <span className="font-bold text-slate-800 text-sm">
            {currentUser?.className || 'N/A'} {currentUser?.sectionName ? `(Sec ${currentUser.sectionName})` : ''}
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-semibold uppercase block">Selected Cards</span>
          <span className="font-bold text-indigo-600 text-sm">
            {count} / {totalAvailable} cards
          </span>
        </div>
      </div>

      {/* Submission Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <p className="text-xs text-slate-500">
          Request will be submitted to <span className="font-semibold text-slate-700">College Admin</span> for initial review.
        </p>

        <button
          type="button"
          disabled={count === 0 || isLoading}
          onClick={handleOpenConfirm}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Submitting Request...</span>
            </>
          ) : (
            <>
              <Printer className="w-4 h-4" />
              <span>Submit {count > 0 ? `(${count} Cards)` : ''} for Printing</span>
            </>
          )}
        </button>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Confirm Print Request Submission"
        message={`Are you sure you want to submit ${count} ID card(s) (${requestType} request) to College Admin for print approval?`}
        confirmLabel="Confirm & Submit"
        cancelLabel="Cancel"
        variant="primary"
        isLoading={isLoading}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default PrintRequestCreatePanel;


import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Printer,
  Check,
  X,
  Download,
  CheckCircle2,
  Building,
  Calendar,
  AlertTriangle,
  Eye,
  Layers,
  FileText,
} from 'lucide-react';
import {
  approveAdminPrintRequestRequested,
  rejectAdminPrintRequestRequested,
  markAdminPrintingRequested,
  dispatchAdminPrintRequested,
  markAdminCompleteRequested,
  downloadAdminPrintAssetsRequested,
  downloadAdminPrintPdfRequested,
} from '../../features/printRequests/printRequestSlice.js';
import {
  selectIsPrintRequestActionLoading,
  selectIsPrintRequestDownloadLoading,
} from '../../features/printRequests/printRequestSelectors.js';
import { PRINT_REQUEST_STATUS } from '../../constants/printRequest.js';
import { getPrintRequestDetailRoute } from '../../constants/routes.js';
import PrintRequestStatusBadge from './PrintRequestStatusBadge.jsx';
import PrintDispatchModal from './PrintDispatchModal.jsx';
import ConfirmDialog from '../common/ConfirmDialog.jsx';
import EmptyState from '../common/EmptyState.jsx';
import Loader from '../common/Loader.jsx';

/**
 * SuperAdminPrintQueueTable Component
 * Global multi-tenant print center queue for SUPER_ADMIN
 */
export const SuperAdminPrintQueueTable = ({
  requests = [],
  isLoading = false,
  className = '',
}) => {
  const dispatch = useDispatch();
  const isActionLoading = useSelector(selectIsPrintRequestActionLoading);
  const isDownloadLoading = useSelector(selectIsPrintRequestDownloadLoading);

  const [activeDownloadId, setActiveDownloadId] = useState(null);
  const [activePdfDownloadId, setActivePdfDownloadId] = useState(null);

  const [dispatchModal, setDispatchModal] = useState({
    isOpen: false,
    requestId: null,
    collegeName: '',
    totalCards: 0,
  });

  const [rejectDialog, setRejectDialog] = useState({
    isOpen: false,
    requestId: null,
    reason: '',
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    requestId: null,
    actionType: null,
    title: '',
    message: '',
    confirmLabel: '',
  });

  if (isLoading) {
    return <Loader message="Fetching central print queue..." />;
  }

  if (!requests || requests.length === 0) {
    return (
      <EmptyState
        title="No Print Requests in Central Queue"
        description="There are currently no ID card print requests in the central Super Admin queue."
        icon={Printer}
      />
    );
  }

  // 1. Approve (SENT_TO_SUPER_ADMIN -> SUPER_ADMIN_APPROVED)
  const handleApprove = (requestId) => {
    setConfirmModal({
      isOpen: true,
      requestId,
      actionType: 'APPROVE',
      title: 'Approve for Production Printing',
      message: 'Are you sure you want to approve this ID card print request for production printing?',
      confirmLabel: 'Approve Request',
    });
  };

  // 2. Reject
  const handleOpenReject = (requestId) => {
    setRejectDialog({ isOpen: true, requestId, reason: '' });
  };

  const handleConfirmReject = () => {
    if (rejectDialog.requestId && rejectDialog.reason.trim()) {
      dispatch(
        rejectAdminPrintRequestRequested({
          requestId: rejectDialog.requestId,
          reason: rejectDialog.reason.trim(),
        })
      );
      setRejectDialog({ isOpen: false, requestId: null, reason: '' });
    }
  };

  // 3. Dispatch Print Production (SUPER_ADMIN_APPROVED -> PRINTING with mode)
  const handleOpenDispatchModal = (request) => {
    const reqId = request.id || request._id;
    const colName =
      request.collegeId && typeof request.collegeId === 'object'
        ? request.collegeId.name
        : 'Institution';
    const total =
      request.totalCards || (Array.isArray(request.studentIds) ? request.studentIds.length : 1);

    setDispatchModal({
      isOpen: true,
      requestId: reqId,
      collegeName: colName,
      totalCards: total,
    });
  };

  const handleConfirmDispatch = ({ printMode, notes }) => {
    if (!dispatchModal.requestId) return;
    dispatch(
      dispatchAdminPrintRequested({
        requestId: dispatchModal.requestId,
        printMode,
        notes,
      })
    );
    setDispatchModal({ isOpen: false, requestId: null, collegeName: '', totalCards: 0 });
  };

  // 4. Mark Printing (SUPER_ADMIN_APPROVED -> PRINTING)
  const handleMarkPrinting = (requestId) => {
    setConfirmModal({
      isOpen: true,
      requestId,
      actionType: 'PRINTING',
      title: 'Mark as Printing in Progress',
      message: 'Are you ready to send this ID card batch to physical printing production?',
      confirmLabel: 'Start Printing',
    });
  };

  // 5. Mark Complete (PRINTING -> COMPLETED)
  const handleMarkComplete = (requestId) => {
    setConfirmModal({
      isOpen: true,
      requestId,
      actionType: 'COMPLETE',
      title: 'Mark Print Job as Completed',
      message: 'Have all ID cards in this batch been successfully printed, verified, and packaged?',
      confirmLabel: 'Mark Completed',
    });
  };

  // 6. Download ZIP
  const handleDownloadZip = (requestId) => {
    setActiveDownloadId(requestId);
    dispatch(
      downloadAdminPrintAssetsRequested({
        requestId,
        fileName: `print-request-${requestId}.zip`,
      })
    );
  };

  // 7. Download PDF
  const handleDownloadPdf = (requestId) => {
    setActivePdfDownloadId(requestId);
    dispatch(
      downloadAdminPrintPdfRequested({
        requestId,
        fileName: `print-request-${requestId}.pdf`,
      })
    );
  };

  // Execute Action from Confirm Modal
  const handleExecuteModalAction = () => {
    const { requestId, actionType } = confirmModal;
    if (!requestId) return;

    if (actionType === 'APPROVE') {
      dispatch(approveAdminPrintRequestRequested(requestId));
    } else if (actionType === 'PRINTING') {
      dispatch(markAdminPrintingRequested(requestId));
    } else if (actionType === 'COMPLETE') {
      dispatch(markAdminCompleteRequested(requestId));
    }

    setConfirmModal({ isOpen: false, requestId: null, actionType: null, title: '', message: '', confirmLabel: '' });
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" aria-label="Super Admin Central Print Queue">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Institution / College</th>
              <th className="py-3.5 px-4">Request ID</th>
              <th className="py-3.5 px-4">Requested By</th>
              <th className="py-3.5 px-4">Scope / Cards</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Workflow Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {requests.map((request) => {
              const requestId = request.id || request._id;
              const college =
                request.collegeId && typeof request.collegeId === 'object'
                  ? request.collegeId
                  : { name: 'Institution', code: '' };
              const operator =
                request.requestedBy && typeof request.requestedBy === 'object'
                  ? request.requestedBy
                  : { name: 'Operator' };

              const dateStr = request.createdAt
                ? new Date(request.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })
                : '--';

              const isSentToSuperAdmin =
                request.status === PRINT_REQUEST_STATUS.SENT_TO_SUPER_ADMIN;
              const isSuperAdminApproved =
                request.status === PRINT_REQUEST_STATUS.SUPER_ADMIN_APPROVED;
              const isPrinting = request.status === PRINT_REQUEST_STATUS.PRINTING;
              const isDownloadingThis = isDownloadLoading && activeDownloadId === requestId;

              return (
                <tr key={requestId} className="hover:bg-slate-50/80 transition-colors group">
                  {/* College Name */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{college.name}</div>
                        {college.code && (
                          <div className="text-[11px] font-mono text-slate-400">{college.code}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Request Reference */}
                  <td className="py-4 px-4">
                    <Link
                      to={getPrintRequestDetailRoute(requestId)}
                      className="font-mono font-semibold text-slate-900 hover:text-indigo-600 transition-colors text-xs"
                    >
                      #{String(requestId).slice(-8).toUpperCase()}
                    </Link>
                  </td>

                  {/* Requested By */}
                  <td className="py-4 px-4 text-xs">
                    <div className="font-medium text-slate-800">{operator.name || 'Operator'}</div>
                    {operator.subjectName && (
                      <div className="text-[11px] text-indigo-600 font-medium">{operator.subjectName}</div>
                    )}
                  </td>

                  {/* Scope / Cards */}
                  <td className="py-4 px-4 text-xs">
                    <div className="font-bold text-slate-800">
                      {request.totalCards || (Array.isArray(request.studentIds) ? request.studentIds.length : 1)} Cards
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {operator.className ? `Class ${operator.className}` : ''} {operator.sectionName ? `(${operator.sectionName})` : ''}
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-4 px-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {dateStr}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    <PrintRequestStatusBadge status={request.status} />
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      {/* 1. SENT_TO_SUPER_ADMIN: Approve / Reject */}
                      {isSentToSuperAdmin && (
                        <>
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => handleApprove(requestId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs disabled:opacity-50 transition-all"
                            title="Approve for print production"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>

                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => handleOpenReject(requestId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg disabled:opacity-50 transition-all"
                            title="Reject request"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      {/* 2. SUPER_ADMIN_APPROVED: Dispatch Print or Mark Printing */}
                      {isSuperAdminApproved && (
                        <>
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => handleOpenDispatchModal(request)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs shadow-indigo-600/30 disabled:opacity-50 transition-all cursor-pointer"
                            title="Dispatch controlled print production"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Dispatch Print</span>
                          </button>

                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => handleMarkPrinting(requestId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg disabled:opacity-50 transition-all cursor-pointer"
                            title="Mark batch as actively printing"
                          >
                            <span>Mark Printing</span>
                          </button>
                        </>
                      )}

                      {/* 3. PRINTING / COMPLETED: Download PDF & Download ZIP */}
                      {(isPrinting || request.status === PRINT_REQUEST_STATUS.COMPLETED) && (
                        <>
                          <button
                            type="button"
                            disabled={isDownloadLoading && activePdfDownloadId === requestId}
                            onClick={() => handleDownloadPdf(requestId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg disabled:opacity-50 transition-all cursor-pointer"
                            title="Download printable A4 PDF package"
                          >
                            {isDownloadLoading && activePdfDownloadId === requestId ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
                                <span>PDF...</span>
                              </>
                            ) : (
                              <>
                                <FileText className="w-3.5 h-3.5" />
                                <span>PDF</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            disabled={isDownloadingThis}
                            onClick={() => handleDownloadZip(requestId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg disabled:opacity-50 transition-all cursor-pointer"
                            title="Download ID cards ZIP archive for printing"
                          >
                            {isDownloadingThis ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                                <span>ZIP...</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-3.5 h-3.5" />
                                <span>ZIP</span>
                              </>
                            )}
                          </button>
                        </>
                      )}

                      {/* Complete Action for PRINTING */}
                      {isPrinting && (
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleMarkComplete(requestId)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                          title="Mark print job as completed"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Complete</span>
                        </button>
                      )}

                      {/* View Details Link */}
                      <Link
                        to={getPrintRequestDetailRoute(requestId)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="View request details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Print Dispatch Modal */}
      <PrintDispatchModal
        isOpen={dispatchModal.isOpen}
        requestId={dispatchModal.requestId}
        collegeName={dispatchModal.collegeName}
        totalCards={dispatchModal.totalCards}
        isLoading={isActionLoading}
        onConfirm={handleConfirmDispatch}
        onClose={() =>
          setDispatchModal({ isOpen: false, requestId: null, collegeName: '', totalCards: 0 })
        }
      />

      {/* Reusable Action Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        cancelLabel="Cancel"
        variant="primary"
        isLoading={isActionLoading}
        onConfirm={handleExecuteModalAction}
        onCancel={() =>
          setConfirmModal({
            isOpen: false,
            requestId: null,
            actionType: null,
            title: '',
            message: '',
            confirmLabel: '',
          })
        }
      />

      {/* Reject Reason Modal Dialog */}
      {rejectDialog.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="superadmin-reject-dialog-title"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 id="superadmin-reject-dialog-title" className="text-base font-bold text-slate-900">
                  Reject Print Request
                </h3>
                <p className="text-xs text-slate-500">Provide rejection reason for college</p>
              </div>
            </div>

            <div>
              <label
                htmlFor="sa-rejection-reason"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
              >
                Rejection Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="sa-rejection-reason"
                rows={3}
                value={rejectDialog.reason}
                onChange={(e) =>
                  setRejectDialog((prev) => ({ ...prev, reason: e.target.value }))
                }
                placeholder="e.g. Printer resolution mismatch or invalid layout configuration..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isActionLoading}
                onClick={() =>
                  setRejectDialog({ isOpen: false, requestId: null, reason: '' })
                }
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-100 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isActionLoading || !rejectDialog.reason.trim()}
                onClick={handleConfirmReject}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isActionLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Rejecting...</span>
                  </>
                ) : (
                  <span>Confirm Rejection</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminPrintQueueTable;


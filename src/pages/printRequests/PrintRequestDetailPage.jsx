import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Printer,
  ArrowLeft,
  Calendar,
  Building,
  User,
  CheckCircle,
  Clock,
  Send,
  AlertTriangle,
  Download,
  Layers,
  Check,
  X,
  FileText,
} from 'lucide-react';
import {
  fetchPrintRequestByIdRequested,
  clearSelectedPrintRequest,
  approveCollegePrintRequestRequested,
  rejectCollegePrintRequestRequested,
  forwardToSuperAdminRequested,
  approveAdminPrintRequestRequested,
  rejectAdminPrintRequestRequested,
  markAdminPrintingRequested,
  dispatchAdminPrintRequested,
  markAdminCompleteRequested,
  downloadAdminPrintAssetsRequested,
  downloadAdminPrintPdfRequested,
} from '../../features/printRequests/printRequestSlice.js';
import {
  selectSelectedPrintRequest,
  selectIsPrintRequestLoading,
  selectIsPrintRequestActionLoading,
  selectIsPrintRequestDownloadLoading,
  selectPrintRequestError,
} from '../../features/printRequests/printRequestSelectors.js';
import { selectUserRole } from '../../features/auth/authSelectors.js';
import { ROLES } from '../../constants/roles.js';
import { PRINT_REQUEST_STATUS, PRINT_REQUEST_STATUS_META } from '../../constants/printRequest.js';
import { ROUTES } from '../../constants/routes.js';
import PrintRequestStatusBadge from '../../components/printRequests/PrintRequestStatusBadge.jsx';
import PrintDispatchModal from '../../components/printRequests/PrintDispatchModal.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import Loader from '../../components/common/Loader.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';

export const PrintRequestDetailPage = () => {
  const { requestId } = useParams();
  const dispatch = useDispatch();

  const userRole = useSelector(selectUserRole);
  const request = useSelector(selectSelectedPrintRequest);
  const isLoading = useSelector(selectIsPrintRequestLoading);
  const isActionLoading = useSelector(selectIsPrintRequestActionLoading);
  const isDownloadLoading = useSelector(selectIsPrintRequestDownloadLoading);
  const error = useSelector(selectPrintRequestError);

  const isOperator = userRole === ROLES.OPERATOR;
  const isCollegeAdmin = userRole === ROLES.COLLEGE_ADMIN;
  const isSuperAdmin = userRole === ROLES.SUPER_ADMIN;

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    actionType: null,
    title: '',
    message: '',
    confirmLabel: '',
  });

  const [rejectDialog, setRejectDialog] = useState({
    isOpen: false,
    reason: '',
  });

  useEffect(() => {
    if (requestId) {
      dispatch(fetchPrintRequestByIdRequested(requestId));
    }
    return () => {
      dispatch(clearSelectedPrintRequest());
    };
  }, [dispatch, requestId]);

  if (isLoading && !request) {
    return <Loader message="Loading print request details..." />;
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Link
          to={isSuperAdmin ? ROUTES.ADMIN_PRINT_REQUESTS : ROUTES.PRINT_REQUESTS}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Print Queue</span>
        </Link>
        <ErrorMessage message={error} title="Print Request Not Found or Inaccessible" />
      </div>
    );
  }

  if (!request) return null;

  const reqId = request.id || request._id;
  const college =
    request.collegeId && typeof request.collegeId === 'object'
      ? request.collegeId
      : { name: 'Institution Scope', code: '' };
  const operator =
    request.requestedBy && typeof request.requestedBy === 'object'
      ? request.requestedBy
      : { name: 'Operator', email: '' };

  const status = request.status;

  // Lifecycle Steps Definition
  const steps = [
    {
      id: 'CREATION',
      label: 'Submitted by Operator',
      done: true,
      timestamp: request.createdAt,
    },
    {
      id: 'COLLEGE',
      label: 'College Review',
      done:
        status !== PRINT_REQUEST_STATUS.PENDING_COLLEGE_APPROVAL &&
        status !== PRINT_REQUEST_STATUS.CANCELLED,
      isRejected: status === PRINT_REQUEST_STATUS.COLLEGE_REJECTED,
      timestamp: request.collegeReviewedAt,
    },
    {
      id: 'FORWARDED',
      label: 'Forwarded to Super Admin',
      done: [
        PRINT_REQUEST_STATUS.SENT_TO_SUPER_ADMIN,
        PRINT_REQUEST_STATUS.SUPER_ADMIN_APPROVED,
        PRINT_REQUEST_STATUS.SUPER_ADMIN_REJECTED,
        PRINT_REQUEST_STATUS.PRINTING,
        PRINT_REQUEST_STATUS.COMPLETED,
      ].includes(status),
      timestamp: request.superAdminForwardedAt,
    },
    {
      id: 'SUPER_ADMIN',
      label: 'Super Admin Approval',
      done: [
        PRINT_REQUEST_STATUS.SUPER_ADMIN_APPROVED,
        PRINT_REQUEST_STATUS.PRINTING,
        PRINT_REQUEST_STATUS.COMPLETED,
      ].includes(status),
      isRejected: status === PRINT_REQUEST_STATUS.SUPER_ADMIN_REJECTED,
      timestamp: request.superAdminReviewedAt,
    },
    {
      id: 'PRINTING',
      label: 'Printing in Progress',
      done: [PRINT_REQUEST_STATUS.PRINTING, PRINT_REQUEST_STATUS.COMPLETED].includes(status),
    },
    {
      id: 'COMPLETED',
      label: 'Completed',
      done: status === PRINT_REQUEST_STATUS.COMPLETED,
    },
  ];

  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);

  // Actions
  const handleExecuteModalAction = () => {
    const { actionType } = confirmModal;
    if (actionType === 'CA_APPROVE') {
      dispatch(approveCollegePrintRequestRequested(reqId));
    } else if (actionType === 'FORWARD') {
      dispatch(forwardToSuperAdminRequested(reqId));
    } else if (actionType === 'SA_APPROVE') {
      dispatch(approveAdminPrintRequestRequested(reqId));
    } else if (actionType === 'PRINTING') {
      dispatch(markAdminPrintingRequested(reqId));
    } else if (actionType === 'COMPLETE') {
      dispatch(markAdminCompleteRequested(reqId));
    }

    setConfirmModal({ isOpen: false, actionType: null, title: '', message: '', confirmLabel: '' });
  };

  const handleConfirmReject = () => {
    if (rejectDialog.reason.trim()) {
      if (isCollegeAdmin) {
        dispatch(rejectCollegePrintRequestRequested({ requestId: reqId, reason: rejectDialog.reason.trim() }));
      } else if (isSuperAdmin) {
        dispatch(rejectAdminPrintRequestRequested({ requestId: reqId, reason: rejectDialog.reason.trim() }));
      }
      setRejectDialog({ isOpen: false, reason: '' });
    }
  };

  const handleConfirmDispatch = ({ printMode, notes }) => {
    dispatch(
      dispatchAdminPrintRequested({
        requestId: reqId,
        printMode,
        notes,
      })
    );
    setDispatchModalOpen(false);
  };

  const handleDownloadZip = () => {
    dispatch(downloadAdminPrintAssetsRequested({ requestId: reqId, fileName: `print-request-${reqId}.zip` }));
  };

  const handleDownloadPdf = () => {
    dispatch(downloadAdminPrintPdfRequested({ requestId: reqId, fileName: `print-request-${reqId}.pdf` }));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to={isSuperAdmin ? ROUTES.ADMIN_PRINT_REQUESTS : ROUTES.PRINT_REQUESTS}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Print Queue</span>
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-indigo-500/20 shrink-0">
            <Printer className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Print Request #{String(reqId).slice(-8).toUpperCase()}
              </h1>
              <PrintRequestStatusBadge status={status} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Created on {new Date(request.createdAt).toLocaleString()} · Type: <span className="font-semibold text-slate-700">{request.requestType}</span>
            </p>
          </div>
        </div>

        {/* Role-Specific Actions in Header */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* College Admin Actions */}
          {isCollegeAdmin && status === PRINT_REQUEST_STATUS.PENDING_COLLEGE_APPROVAL && (
            <>
              <button
                type="button"
                disabled={isActionLoading}
                onClick={() =>
                  setConfirmModal({
                    isOpen: true,
                    actionType: 'CA_APPROVE',
                    title: 'Approve Print Request',
                    message: 'Are you sure you want to approve this ID card print request for college processing?',
                    confirmLabel: 'Approve Request',
                  })
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs disabled:opacity-50 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Approve</span>
              </button>

              <button
                type="button"
                disabled={isActionLoading}
                onClick={() => setRejectDialog({ isOpen: true, reason: '' })}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-semibold text-xs rounded-xl disabled:opacity-50 transition-all"
              >
                <X className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </>
          )}

          {isCollegeAdmin && status === PRINT_REQUEST_STATUS.COLLEGE_APPROVED && (
            <button
              type="button"
              disabled={isActionLoading}
              onClick={() =>
                setConfirmModal({
                  isOpen: true,
                  actionType: 'FORWARD',
                  title: 'Forward to Super Admin',
                  message: 'Are you sure you want to forward this approved ID card print request to the Super Admin Central Print Center?',
                  confirmLabel: 'Forward Request',
                })
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/30 disabled:opacity-50 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Send to Super Admin</span>
            </button>
          )}

          {/* Super Admin Actions */}
          {isSuperAdmin && status === PRINT_REQUEST_STATUS.SENT_TO_SUPER_ADMIN && (
            <>
              <button
                type="button"
                disabled={isActionLoading}
                onClick={() =>
                  setConfirmModal({
                    isOpen: true,
                    actionType: 'SA_APPROVE',
                    title: 'Approve Print Request',
                    message: 'Are you sure you want to approve this request for production printing?',
                    confirmLabel: 'Approve Request',
                  })
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs disabled:opacity-50 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Approve</span>
              </button>

              <button
                type="button"
                disabled={isActionLoading}
                onClick={() => setRejectDialog({ isOpen: true, reason: '' })}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-semibold text-xs rounded-xl disabled:opacity-50 transition-all"
              >
                <X className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </>
          )}

          {/* Super Admin Approved Actions */}
          {isSuperAdmin && status === PRINT_REQUEST_STATUS.SUPER_ADMIN_APPROVED && (
            <>
              <button
                type="button"
                disabled={isActionLoading}
                onClick={() => setDispatchModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/30 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Dispatch Print</span>
              </button>

              <button
                type="button"
                disabled={isActionLoading}
                onClick={() =>
                  setConfirmModal({
                    isOpen: true,
                    actionType: 'PRINTING',
                    title: 'Start Printing Production',
                    message: 'Are you ready to mark this ID card batch as actively printing?',
                    confirmLabel: 'Mark Printing',
                  })
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-amber-600/30 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Mark Printing</span>
              </button>
            </>
          )}

          {/* Super Admin Printing / Completed Actions */}
          {isSuperAdmin && (status === PRINT_REQUEST_STATUS.PRINTING || status === PRINT_REQUEST_STATUS.COMPLETED) && (
            <>
              <button
                type="button"
                disabled={isDownloadLoading}
                onClick={handleDownloadPdf}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold text-xs rounded-xl disabled:opacity-50 transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Download PDF</span>
              </button>

              <button
                type="button"
                disabled={isDownloadLoading}
                onClick={handleDownloadZip}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold text-xs rounded-xl disabled:opacity-50 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download ZIP</span>
              </button>

              {status === PRINT_REQUEST_STATUS.PRINTING && (
                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={() =>
                    setConfirmModal({
                      isOpen: true,
                      actionType: 'COMPLETE',
                      title: 'Complete Print Job',
                      message: 'Have all cards been successfully printed and verified for dispatch?',
                      confirmLabel: 'Mark Completed',
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark Completed</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Rejection Alert Banner (if rejected) */}
      {request.rejectionReason && (
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-3xl flex items-start gap-3.5 text-rose-900">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800">
              Print Request Rejected
            </h3>
            <p className="text-sm font-medium mt-1">{request.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* Lifecycle Progress Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
          <Clock className="w-5 h-5 text-indigo-600" />
          Multi-Tier Request Lifecycle Timeline
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className={`p-4 rounded-2xl border transition-all ${step.isRejected
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : step.done
                    ? 'bg-indigo-50/60 border-indigo-200 text-indigo-900'
                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Step 0{idx + 1}
                </span>
                {step.isRejected ? (
                  <X className="w-4 h-4 text-rose-600" />
                ) : step.done ? (
                  <CheckCircle className="w-4 h-4 text-indigo-600" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-300" />
                )}
              </div>
              <p className="font-bold text-xs">{step.label}</p>
              {step.timestamp && (
                <p className="text-[10px] text-slate-500 mt-1">
                  {new Date(step.timestamp).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Request Details Grid */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
          <Layers className="w-5 h-5 text-indigo-600" />
          Batch & Ownership Specifications
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
          <div className="flex flex-col gap-1 py-1 border-b border-slate-50 pb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase">Institution / College</span>
            <span className="font-medium text-slate-900">{college.name}</span>
          </div>

          <div className="flex flex-col gap-1 py-1 border-b border-slate-50 pb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase">Operator (Requester)</span>
            <span className="font-medium text-slate-900">{operator.name || 'Operator'}</span>
          </div>

          <div className="flex flex-col gap-1 py-1 border-b border-slate-50 pb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase">Assigned Subject</span>
            <span className="font-medium text-slate-900">
              {operator.subjectName || <span className="text-slate-400 italic">None</span>}
            </span>
          </div>

          <div className="flex flex-col gap-1 py-1 border-b border-slate-50 pb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase">Class Scope</span>
            <span className="font-medium text-slate-900">
              {operator.className ? `Class ${operator.className}` : <span className="text-slate-400 italic">None</span>}
            </span>
          </div>

          <div className="flex flex-col gap-1 py-1 border-b border-slate-50 pb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase">Section Scope</span>
            <span className="font-medium text-slate-900">
              {operator.sectionName ? `Section ${operator.sectionName}` : <span className="text-slate-400 italic">None</span>}
            </span>
          </div>

          <div className="flex flex-col gap-1 py-1 border-b border-slate-50 pb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase">Total ID Cards</span>
            <span className="font-bold text-indigo-600">{request.totalCards} Cards</span>
          </div>
        </div>
      </div>

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
        onCancel={() => setConfirmModal({ isOpen: false, actionType: null, title: '', message: '', confirmLabel: '' })}
      />

      {/* Reject Modal */}
      {rejectDialog.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reject Print Request</h3>
                <p className="text-xs text-slate-500">State reason for rejection</p>
              </div>
            </div>

            <div>
              <label htmlFor="detail-reject-reason" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Rejection Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="detail-reject-reason"
                rows={3}
                value={rejectDialog.reason}
                onChange={(e) => setRejectDialog((prev) => ({ ...prev, reason: e.target.value }))}
                placeholder="Reason for rejecting this request..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isActionLoading}
                onClick={() => setRejectDialog({ isOpen: false, reason: '' })}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isActionLoading || !rejectDialog.reason.trim()}
                onClick={handleConfirmReject}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md disabled:opacity-50"
              >
                {isActionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Dispatch Modal */}
      <PrintDispatchModal
        isOpen={dispatchModalOpen}
        requestId={reqId}
        collegeName={college.name}
        totalCards={request.totalCards || (Array.isArray(request.studentIds) ? request.studentIds.length : 1)}
        isLoading={isActionLoading}
        onConfirm={handleConfirmDispatch}
        onClose={() => setDispatchModalOpen(false)}
      />
    </div>
  );
};

export default PrintRequestDetailPage;


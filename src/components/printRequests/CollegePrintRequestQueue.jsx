import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Printer,
  Check,
  X,
  Send,
  Eye,
  User,
  Calendar,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import {
  approveCollegePrintRequestRequested,
  rejectCollegePrintRequestRequested,
  forwardToSuperAdminRequested,
} from '../../features/printRequests/printRequestSlice.js';
import { selectIsPrintRequestActionLoading } from '../../features/printRequests/printRequestSelectors.js';
import { PRINT_REQUEST_STATUS } from '../../constants/printRequest.js';
import { getPrintRequestDetailRoute } from '../../constants/routes.js';
import PrintRequestStatusBadge from './PrintRequestStatusBadge.jsx';
import ConfirmDialog from '../common/ConfirmDialog.jsx';
import EmptyState from '../common/EmptyState.jsx';
import Loader from '../common/Loader.jsx';

/**
 * CollegePrintRequestQueue Component
 * Renders the college-scoped print request queue for COLLEGE_ADMIN
 */
export const CollegePrintRequestQueue = ({
  requests = [],
  isLoading = false,
  className = '',
}) => {
  const dispatch = useDispatch();
  const isActionLoading = useSelector(selectIsPrintRequestActionLoading);

  const [rejectDialog, setRejectDialog] = useState({
    isOpen: false,
    requestId: null,
    reason: '',
  });

  const [confirmForward, setConfirmForward] = useState({
    isOpen: false,
    requestId: null,
  });

  const [confirmApprove, setConfirmApprove] = useState({
    isOpen: false,
    requestId: null,
  });

  if (isLoading) {
    return <Loader message="Fetching college print requests queue..." />;
  }

  if (!requests || requests.length === 0) {
    return (
      <EmptyState
        title="No Print Requests in Queue"
        description="There are currently no ID card print requests submitted by operators in your college."
        icon={Printer}
      />
    );
  }

  // Handle Approve
  const handleApprove = (requestId) => {
    setConfirmApprove({ isOpen: true, requestId });
  };

  const handleConfirmApprove = () => {
    if (confirmApprove.requestId) {
      dispatch(approveCollegePrintRequestRequested(confirmApprove.requestId));
    }
    setConfirmApprove({ isOpen: false, requestId: null });
  };

  // Handle Reject
  const handleOpenReject = (requestId) => {
    setRejectDialog({ isOpen: true, requestId, reason: '' });
  };

  const handleConfirmReject = () => {
    if (rejectDialog.requestId && rejectDialog.reason.trim()) {
      dispatch(
        rejectCollegePrintRequestRequested({
          requestId: rejectDialog.requestId,
          reason: rejectDialog.reason.trim(),
        })
      );
      setRejectDialog({ isOpen: false, requestId: null, reason: '' });
    }
  };

  // Handle Forward to Super Admin
  const handleForward = (requestId) => {
    setConfirmForward({ isOpen: true, requestId });
  };

  const handleConfirmForward = () => {
    if (confirmForward.requestId) {
      dispatch(forwardToSuperAdminRequested(confirmForward.requestId));
    }
    setConfirmForward({ isOpen: false, requestId: null });
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" aria-label="College Print Requests Queue">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Request ID</th>
              <th className="py-3.5 px-4">Operator</th>
              <th className="py-3.5 px-4">Class & Section</th>
              <th className="py-3.5 px-4">Cards / Type</th>
              <th className="py-3.5 px-4">Submitted</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {requests.map((request) => {
              const requestId = request.id || request._id;
              const operator =
                request.requestedBy && typeof request.requestedBy === 'object'
                  ? request.requestedBy
                  : { name: 'Operator', email: '' };

              const dateStr = request.createdAt
                ? new Date(request.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })
                : '--';

              const isPendingApproval =
                request.status === PRINT_REQUEST_STATUS.PENDING_COLLEGE_APPROVAL;
              const isCollegeApproved =
                request.status === PRINT_REQUEST_STATUS.COLLEGE_APPROVED;

              return (
                <tr key={requestId} className="hover:bg-slate-50/80 transition-colors group">
                  {/* Request ID */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                        <Printer className="w-4 h-4" />
                      </div>
                      <Link
                        to={getPrintRequestDetailRoute(requestId)}
                        className="font-mono font-semibold text-slate-900 hover:text-indigo-600 transition-colors text-xs"
                      >
                        #{String(requestId).slice(-8).toUpperCase()}
                      </Link>
                    </div>
                  </td>

                  {/* Operator Info */}
                  <td className="py-4 px-4 text-xs">
                    <div className="font-semibold text-slate-800">{operator.name || 'Operator'}</div>
                    {operator.subjectName && (
                      <div className="text-[11px] text-indigo-600 font-medium">{operator.subjectName}</div>
                    )}
                  </td>

                  {/* Class & Section */}
                  <td className="py-4 px-4 text-xs font-medium text-slate-700">
                    <div>
                      {operator.className ? (
                        <span>
                          {operator.className} {operator.sectionName ? `(Sec ${operator.sectionName})` : ''}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">--</span>
                      )}
                    </div>
                  </td>

                  {/* Cards / Type */}
                  <td className="py-4 px-4 text-xs">
                    <span className="font-bold text-slate-800">
                      {request.totalCards || (Array.isArray(request.studentIds) ? request.studentIds.length : 1)} Cards
                    </span>
                    <span className="ml-1.5 px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                      {request.requestType || 'SINGLE'}
                    </span>
                  </td>

                  {/* Submitted Date */}
                  <td className="py-4 px-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {dateStr}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4">
                    <PrintRequestStatusBadge status={request.status} />
                  </td>

                  {/* Action Buttons */}
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <div className="inline-flex items-center gap-2 justify-end">
                      {/* PENDING_COLLEGE_APPROVAL Actions */}
                      {isPendingApproval && (
                        <>
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => handleApprove(requestId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs disabled:opacity-50 transition-all"
                            title="Approve print request"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>

                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => handleOpenReject(requestId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg disabled:opacity-50 transition-all"
                            title="Reject print request"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      {/* COLLEGE_APPROVED Actions */}
                      {isCollegeApproved && (
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleForward(requestId)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs shadow-indigo-600/30 disabled:opacity-50 transition-all"
                          title="Forward approved request to Super Admin central print center"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Forward to Super Admin</span>
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

      {/* Approve Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmApprove.isOpen}
        title="Approve Print Request"
        message="Are you sure you want to approve this ID card print request for college processing?"
        confirmLabel="Approve Request"
        cancelLabel="Cancel"
        variant="primary"
        isLoading={isActionLoading}
        onConfirm={handleConfirmApprove}
        onCancel={() => setConfirmApprove({ isOpen: false, requestId: null })}
      />

      {/* Forward Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmForward.isOpen}
        title="Forward to Super Admin"
        message="Are you sure you want to forward this approved ID card print request to the Super Admin Central Print Center?"
        confirmLabel="Forward Request"
        cancelLabel="Cancel"
        variant="primary"
        isLoading={isActionLoading}
        onConfirm={handleConfirmForward}
        onCancel={() => setConfirmForward({ isOpen: false, requestId: null })}
      />

      {/* Reject Reason Modal Dialog */}
      {rejectDialog.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-dialog-title"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 id="reject-dialog-title" className="text-base font-bold text-slate-900">
                  Reject Print Request
                </h3>
                <p className="text-xs text-slate-500">Provide a reason for the operator</p>
              </div>
            </div>

            <div>
              <label
                htmlFor="rejection-reason"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
              >
                Rejection Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="rejection-reason"
                rows={3}
                value={rejectDialog.reason}
                onChange={(e) =>
                  setRejectDialog((prev) => ({ ...prev, reason: e.target.value }))
                }
                placeholder="e.g. Incomplete student photos or outdated class roster..."
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

export default CollegePrintRequestQueue;


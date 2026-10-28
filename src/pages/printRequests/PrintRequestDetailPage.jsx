// PrintRequestDetailPage.jsx — Print request detail (Class Teacher / School Admin / Print Center).
// Kaun se buttons dikhenge ye backend ka `availableActions` batata hai; status label `statusView` se.
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, FileArchive, Loader2, Pencil, AlertTriangle, StickyNote, Printer } from 'lucide-react';
import {
  fetchRequestRequested,
  clearRequestDetail,
  requestActionRequested,
  downloadFileRequested,
  fetchPreviewsRequested,
  startPrintRequestPolling,
  stopPrintRequestPolling,
} from '../../features/printRequestWorkflow/printRequestWorkflowSlice.js';
import {
  selectPrintRequestDetail,
  selectPrintRequestStudents,
  selectPrintRequestDetailLoading,
  selectPrintRequestDetailError,
  selectPrintRequestLoadingAction,
  selectPrintRequestDownloadKey,
  selectCardPreviews,
  selectCardPreviewsLoading,
} from '../../features/printRequestWorkflow/printRequestWorkflowSelectors.js';
import IdCardPreview from '../../components/idCards/IdCardPreview.jsx';
import { selectUserRole } from '../../features/auth/authSelectors.js';
import { ROLES } from '../../constants/roles.js';
import { ROUTES, getPrintRequestEditRoute } from '../../constants/routes.js';
import Loader from '../../components/common/Loader.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import RequestStatusBadge from '../../components/printRequests/RequestStatusBadge.jsx';
import RequestProgressStepper from '../../components/printRequests/RequestProgressStepper.jsx';
import StatusTimeline from '../../components/printRequests/StatusTimeline.jsx';
import StudentPickerTable from '../../components/printRequests/StudentPickerTable.jsx';
import ConfirmActionModal from '../../components/printRequests/ConfirmActionModal.jsx';
import { REQUEST_ACTION_CONFIG, sortActions } from '../../components/printRequests/requestActionConfig.js';
import { formatDateTime } from '../../utils/idCardFormat.js';

// Print files sirf in statuses mein (backend bhi yahi check karta hai — 409 warna)
const PRINT_FILE_STATUSES = ['PRINTING', 'COMPLETED'];
const PREVIEW_COUNT = 3;

const SummaryRow = ({ label, children }) => (
  <div className="flex justify-between gap-3 py-1.5">
    <dt className="text-slate-500">{label}</dt>
    <dd className="font-semibold text-slate-800 text-right">{children}</dd>
  </div>
);

export const PrintRequestDetailPage = () => {
  const { requestId } = useParams();
  const dispatch = useDispatch();

  const role = useSelector(selectUserRole);
  const request = useSelector(selectPrintRequestDetail);
  const students = useSelector(selectPrintRequestStudents);
  const loading = useSelector(selectPrintRequestDetailLoading);
  const error = useSelector(selectPrintRequestDetailError);
  const loadingAction = useSelector(selectPrintRequestLoadingAction);
  const downloadKey = useSelector(selectPrintRequestDownloadKey);

  const previews = useSelector(selectCardPreviews);
  const previewsLoading = useSelector(selectCardPreviewsLoading);

  const [modalAction, setModalAction] = useState(null);

  // Load + live refresh (30 s / tab focus); jaate waqt band
  useEffect(() => {
    dispatch(fetchRequestRequested({ requestId }));
    dispatch(startPrintRequestPolling({ detailId: requestId }));
    return () => {
      dispatch(stopPrintRequestPolling());
      dispatch(clearRequestDetail());
    };
  }, [dispatch, requestId]);

  // School Admin approve karne se pehle kuch cards dekh le (approve par yahi data lock hota hai)
  const showPreviews = role === ROLES.COLLEGE_ADMIN && Boolean(request?.availableActions?.includes('APPROVE'));
  const previewStudentKey = students.slice(0, PREVIEW_COUNT).map((s) => s.id).join(',');
  const templateId = request?.template?.id;
  useEffect(() => {
    if (showPreviews && templateId && previewStudentKey) {
      dispatch(fetchPreviewsRequested({ templateId, studentIds: previewStudentKey.split(',') }));
    }
  }, [dispatch, showPreviews, templateId, previewStudentKey]);

  const backTo = role === ROLES.SUPER_ADMIN ? ROUTES.PRINT_CENTER : ROUTES.PRINT_REQUESTS;
  const backLabel = role === ROLES.SUPER_ADMIN ? 'Print Center' : 'Print Requests';

  if (error && !request) {
    return (
      <div className="space-y-4">
        <Link to={backTo} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600">
          <ArrowLeft className="h-4 w-4" /> Back to {backLabel}
        </Link>
        <ErrorMessage message={error} title="Couldn't load this request" />
      </div>
    );
  }

  if (!request || request.id !== requestId) {
    return loading || !request ? <Loader message="Loading request…" /> : null;
  }

  const actions = sortActions(request.availableActions || []);
  const canEdit = role === ROLES.OPERATOR && actions.includes('SUBMIT');
  const canDownload = role === ROLES.SUPER_ADMIN && PRINT_FILE_STATUSES.includes(request.status);
  const modalConfig = modalAction ? REQUEST_ACTION_CONFIG[modalAction] : null;
  const classLabel = request.className ? `${request.className}${request.section ? ` - ${request.section}` : ''}` : '—';

  const confirmAction = (reason) => {
    dispatch(
      requestActionRequested({
        requestId: request.id,
        action: modalAction,
        reason,
        onSuccess: () => setModalAction(null),
      })
    );
  };

  const downloadButton = (kind, Icon, label) => {
    const busy = downloadKey === `${request.id}:${kind}`;
    return (
      <button
        type="button"
        onClick={() => dispatch(downloadFileRequested({ id: request.id, kind, requestNumber: request.requestNumber }))}
        disabled={busy}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4 text-indigo-600" />}
        {label}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <Link to={backTo} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600">
          <ArrowLeft className="h-4 w-4" /> Back to {backLabel}
        </Link>
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-mono">{request.requestNumber || 'Print Request'}</h1>
              <RequestStatusBadge statusView={request.statusView} size="md" />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {request.college?.name ? `${request.college.name} · ` : ''}Class {classLabel} · Created by {request.createdBy?.name || '—'} on {formatDateTime(request.createdAt)}
            </p>
          </div>

          {/* Action bar */}
          <div className="flex flex-wrap items-center gap-2">
            {canDownload && downloadButton('print', Printer, 'Print Cards')}
            {canDownload && downloadButton('pdf', Download, 'Download PDF')}
            {canDownload && downloadButton('zip', FileArchive, 'Download ZIP')}
            {canEdit && (
              <Link
                to={getPrintRequestEditRoute(request.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Pencil className="h-4 w-4" /> Edit
              </Link>
            )}
            {actions.map((action) => {
              const config = REQUEST_ACTION_CONFIG[action];
              if (!config) return null;
              const busy = loadingAction === action;
              const danger = config.tone === 'danger';
              return (
                <button
                  key={action}
                  type="button"
                  onClick={() => setModalAction(action)}
                  disabled={Boolean(loadingAction)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold disabled:opacity-60 ${danger ? 'border border-rose-200 bg-white text-rose-700 hover:bg-rose-50' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'}`}
                >
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
        <RequestProgressStepper request={request} />
      </div>

      {/* Reject reason (editable request par operator ko dikhe) */}
      {request.rejectionReason && request.status === 'REJECTED_BY_ADMIN' && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
          <div>
            <p className="font-semibold">Rejected by the school admin</p>
            <p className="mt-0.5">{request.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* School Admin: approve se pehle card preview */}
      {showPreviews && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-800">
              Preview cards <span className="font-normal text-slate-500">(first {Math.min(PREVIEW_COUNT, students.length)} of {students.length})</span>
            </h2>
            <p className="text-xs text-slate-500">Approving locks these photos and this template for printing.</p>
          </div>
          {previewsLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading previews…
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap gap-5">
              {students.slice(0, PREVIEW_COUNT).map((student) => (
                <div key={student.id} className="space-y-1.5">
                  {previews[student.id] ? (
                    <IdCardPreview renderData={previews[student.id]} width={260} className="rounded-xl overflow-hidden" />
                  ) : (
                    <div className="flex h-40 w-64 items-center justify-center rounded-xl border border-dashed border-slate-300 text-xs text-slate-400">Preview not available</div>
                  )}
                  <p className="text-xs font-semibold text-slate-600">{student.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Students */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-bold text-slate-800">Students ({students.length})</h2>
          <StudentPickerTable students={students} selectedIds={[]} readOnly />
        </div>

        {/* Summary + timeline */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-800 mb-2">Summary</h2>
            <dl className="text-sm divide-y divide-slate-100">
              <SummaryRow label="Template">
                {request.template?.name || '—'}
                {request.template?.version ? <span className="text-slate-400 font-normal"> · v{request.template.version}</span> : null}
              </SummaryRow>
              <SummaryRow label="Class">{classLabel}</SummaryRow>
              <SummaryRow label="Students">{request.studentCount}</SummaryRow>
              {request.submittedAt && <SummaryRow label="Sent">{formatDateTime(request.submittedAt)}</SummaryRow>}
              {request.approvedAt && <SummaryRow label="Approved">{formatDateTime(request.approvedAt)}</SummaryRow>}
              {request.acceptedAt && <SummaryRow label="Accepted">{formatDateTime(request.acceptedAt)}</SummaryRow>}
              {request.completedAt && <SummaryRow label="Completed">{formatDateTime(request.completedAt)}</SummaryRow>}
              {request.declinedAt && <SummaryRow label="Declined">{formatDateTime(request.declinedAt)}</SummaryRow>}
              {request.cancelledAt && <SummaryRow label="Cancelled">{formatDateTime(request.cancelledAt)}</SummaryRow>}
              {role === ROLES.SUPER_ADMIN && (
                <SummaryRow label="Downloads">
                  {request.downloadCount}
                  {request.lastDownloadedAt ? <span className="block text-[11px] font-normal text-slate-400">{formatDateTime(request.lastDownloadedAt)}</span> : null}
                </SummaryRow>
              )}
            </dl>
          </div>

          {request.note && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <h2 className="flex items-center gap-1.5 text-sm font-bold text-slate-800"><StickyNote className="h-4 w-4 text-slate-400" /> Note from class teacher</h2>
              <p className="mt-1.5 text-sm text-slate-700 whitespace-pre-line">{request.note}</p>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Activity</h2>
            <StatusTimeline history={request.statusHistory} />
          </div>
        </div>
      </div>

      <ConfirmActionModal
        open={Boolean(modalConfig)}
        title={modalConfig?.title}
        message={modalConfig?.message}
        confirmLabel={modalConfig?.confirmLabel}
        tone={modalConfig?.tone}
        reasonMode={modalConfig?.reasonMode}
        reasonLabel={modalConfig?.reasonLabel}
        loading={Boolean(loadingAction)}
        onConfirm={confirmAction}
        onCancel={() => setModalAction(null)}
      />
    </div>
  );
};

export default PrintRequestDetailPage;

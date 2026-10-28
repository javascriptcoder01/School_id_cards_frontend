// OperatorPrintRequestsPage.jsx — Class Teacher: apni class ki ID card print requests
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Printer, RefreshCw, Eye, Pencil, GraduationCap } from 'lucide-react';
import {
  fetchRequestsRequested,
  fetchSummaryRequested,
  startPrintRequestPolling,
  stopPrintRequestPolling,
} from '../../features/printRequestWorkflow/printRequestWorkflowSlice.js';
import {
  selectPrintRequests,
  selectPrintRequestPagination,
  selectPrintRequestsLoading,
  selectPrintRequestsError,
  selectPrintRequestCounts,
} from '../../features/printRequestWorkflow/printRequestWorkflowSelectors.js';
import { selectCurrentUser } from '../../features/auth/authSelectors.js';
import { ROUTES, getPrintRequestDetailRoute, getPrintRequestEditRoute } from '../../constants/routes.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import StudentPagination from '../../components/students/StudentPagination.jsx';
import RequestTabs from '../../components/printRequests/RequestTabs.jsx';
import RequestStatusBadge from '../../components/printRequests/RequestStatusBadge.jsx';
import { formatDateTime } from '../../utils/idCardFormat.js';

// Tab → kaun se statuses (tab ka naam hai, status ka label API deta hai)
const TABS = [
  { key: 'ALL', label: 'All', statuses: [] },
  { key: 'DRAFT', label: 'Draft', statuses: ['DRAFT'] },
  { key: 'PENDING', label: 'Sent for Approval', statuses: ['PENDING_APPROVAL'] },
  { key: 'APPROVED', label: 'Approved', statuses: ['APPROVED'] },
  { key: 'PRINTING', label: 'Printing', statuses: ['PRINTING'] },
  { key: 'COMPLETED', label: 'Completed', statuses: ['COMPLETED'] },
  { key: 'CLOSED', label: 'Rejected / Declined', statuses: ['REJECTED_BY_ADMIN', 'DECLINED', 'CANCELLED'] },
];

const PAGE_SIZE = 10;

export const OperatorPrintRequestsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const requests = useSelector(selectPrintRequests);
  const pagination = useSelector(selectPrintRequestPagination);
  const loading = useSelector(selectPrintRequestsLoading);
  const error = useSelector(selectPrintRequestsError);
  const counts = useSelector(selectPrintRequestCounts);

  const [activeTab, setActiveTab] = useState('ALL');
  const [page, setPage] = useState(1);

  const tab = TABS.find((t) => t.key === activeTab) || TABS[0];

  const tabsWithCounts = useMemo(
    () =>
      TABS.map((t) => ({
        ...t,
        count: t.statuses.length === 0
          ? Object.values(counts).reduce((sum, n) => sum + n, 0)
          : t.statuses.reduce((sum, status) => sum + (counts[status] || 0), 0),
      })),
    [counts]
  );

  // List (tab / page badalne par)
  useEffect(() => {
    dispatch(fetchRequestsRequested({ params: { status: tab.statuses, page, limit: PAGE_SIZE } }));
  }, [dispatch, tab, page]);

  // Counts + live refresh (30 s / tab focus)
  useEffect(() => {
    dispatch(fetchSummaryRequested());
    dispatch(startPrintRequestPolling());
    return () => {
      dispatch(stopPrintRequestPolling());
    };
  }, [dispatch]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(1);
  };

  const classLabel = currentUser?.className
    ? `${currentUser.className}${currentUser.sectionName ? ` - ${currentUser.sectionName}` : ''}`
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="ID Card Print Requests"
        description="Choose students of your class, send them for approval, and track printing."
        actions={
          <div className="flex items-center gap-2">
            {classLabel && (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                <GraduationCap className="h-3.5 w-3.5" /> Class {classLabel}
              </span>
            )}
            <button
              type="button"
              onClick={() => dispatch(fetchRequestsRequested({ params: { status: tab.statuses, page, limit: PAGE_SIZE } }))}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-xs"
              aria-label="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to={ROUTES.PRINT_REQUEST_NEW}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/30"
            >
              <Plus className="h-4 w-4" /> New Request
            </Link>
          </div>
        }
      />

      <RequestTabs tabs={tabsWithCounts} active={activeTab} onChange={handleTabChange} />

      {error && <ErrorMessage message={error} title="Couldn't load requests" />}

      {!loading && requests.length === 0 ? (
        <EmptyState
          title={activeTab === 'ALL' ? 'No print requests yet' : 'Nothing here'}
          description={activeTab === 'ALL' ? 'Create a request to send your class ID cards for printing.' : 'No requests in this tab.'}
          icon={Printer}
          actionLabel={activeTab === 'ALL' ? 'New Request' : null}
          onAction={activeTab === 'ALL' ? () => navigate(ROUTES.PRINT_REQUEST_NEW) : null}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" aria-label="Print requests">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 sm:px-6 py-3">Request</th>
                  <th className="px-4 py-3">Template</th>
                  <th className="px-4 py-3 text-center">Students</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Updated</th>
                  <th className="px-4 sm:px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && requests.length === 0
                  ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-4 py-4"><span className="block h-4 rounded bg-slate-100" /></td>
                      ))}
                    </tr>
                  ))
                  : requests.map((request) => {
                    // Edit sirf jab request bhej sakte ho (DRAFT / REJECTED) — backend ke actions se
                    const canEdit = request.availableActions?.includes('SUBMIT');
                    return (
                      <tr key={request.id} className="hover:bg-slate-50/70">
                        <td className="px-4 sm:px-6 py-3.5">
                          <Link to={getPrintRequestDetailRoute(request.id)} className="font-mono text-xs font-semibold text-indigo-700 hover:underline">
                            {request.requestNumber || '—'}
                          </Link>
                          <p className="text-[11px] text-slate-400">{formatDateTime(request.createdAt)}</p>
                        </td>
                        <td className="px-4 py-3.5 text-slate-700">{request.template?.name || '—'}</td>
                        <td className="px-4 py-3.5 text-center font-semibold tabular-nums text-slate-800">{request.studentCount}</td>
                        <td className="px-4 py-3.5"><RequestStatusBadge statusView={request.statusView} /></td>
                        <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">{formatDateTime(request.updatedAt)}</td>
                        <td className="px-4 sm:px-6 py-3.5">
                          <div className="flex justify-end gap-2">
                            {canEdit && (
                              <Link
                                to={getPrintRequestEditRoute(request.id)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                <Pencil className="h-3.5 w-3.5" /> Edit
                              </Link>
                            )}
                            <Link
                              to={getPrintRequestDetailRoute(request.id)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              <Eye className="h-3.5 w-3.5 text-indigo-600" /> View
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <StudentPagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
};

export default OperatorPrintRequestsPage;

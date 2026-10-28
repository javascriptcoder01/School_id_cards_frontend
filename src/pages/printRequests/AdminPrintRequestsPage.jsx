// AdminPrintRequestsPage.jsx — School Admin: class teachers ki print requests approve / reject, aur printing track karo
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Hourglass,
  Printer,
  Send,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
  Filter,
  X,
  LayoutTemplate,
  ClipboardList,
} from 'lucide-react';
import {
  fetchRequestsRequested,
  fetchSummaryRequested,
  fetchWizardTemplatesRequested,
  requestActionRequested,
  startPrintRequestPolling,
  stopPrintRequestPolling,
} from '../../features/printRequestWorkflow/printRequestWorkflowSlice.js';
import {
  selectPrintRequests,
  selectPrintRequestPagination,
  selectPrintRequestsLoading,
  selectPrintRequestsError,
  selectPrintRequestCounts,
  selectPrintRequestSummaryLoading,
  selectPrintRequestLoadingAction,
  selectWizardTemplates,
  selectWizardTemplatesLoading,
} from '../../features/printRequestWorkflow/printRequestWorkflowSelectors.js';
import { ROUTES, getPrintRequestDetailRoute } from '../../constants/routes.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import StudentPagination from '../../components/students/StudentPagination.jsx';
import RequestTabs from '../../components/printRequests/RequestTabs.jsx';
import RequestSummaryCards from '../../components/printRequests/RequestSummaryCards.jsx';
import RequestStatusBadge from '../../components/printRequests/RequestStatusBadge.jsx';
import ConfirmActionModal from '../../components/printRequests/ConfirmActionModal.jsx';
import { REQUEST_ACTION_CONFIG } from '../../components/printRequests/requestActionConfig.js';
import { formatDateTime } from '../../utils/idCardFormat.js';

// Tab → statuses (default: Pending Approval)
const TABS = [
  { key: 'PENDING', label: 'Pending Approval', statuses: ['PENDING_APPROVAL'] },
  { key: 'APPROVED', label: 'Pending for Printing', statuses: ['APPROVED'] },
  { key: 'PRINTING', label: 'Printing in Progress', statuses: ['PRINTING'] },
  { key: 'COMPLETED', label: 'Completed', statuses: ['COMPLETED'] },
  { key: 'REJECTED', label: 'Rejected', statuses: ['REJECTED_BY_ADMIN'] },
  { key: 'DECLINED', label: 'Declined', statuses: ['DECLINED'] },
  { key: 'ALL', label: 'All', statuses: [] },
];

const PAGE_SIZE = 10;
const EMPTY_FILTERS = { className: '', section: '', search: '', from: '', to: '' };

const inputClass =
  'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white';

const sumCounts = (counts, statuses) => statuses.reduce((sum, status) => sum + (counts[status] || 0), 0);

export const AdminPrintRequestsPage = () => {
  const dispatch = useDispatch();
  const requests = useSelector(selectPrintRequests);
  const pagination = useSelector(selectPrintRequestPagination);
  const loading = useSelector(selectPrintRequestsLoading);
  const error = useSelector(selectPrintRequestsError);
  const counts = useSelector(selectPrintRequestCounts);
  const summaryLoading = useSelector(selectPrintRequestSummaryLoading);
  const loadingAction = useSelector(selectPrintRequestLoadingAction);
  const templates = useSelector(selectWizardTemplates);
  const templatesLoading = useSelector(selectWizardTemplatesLoading);

  const [activeTab, setActiveTab] = useState('PENDING');
  const [page, setPage] = useState(1);
  const [filterInput, setFilterInput] = useState(EMPTY_FILTERS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [quickAction, setQuickAction] = useState(null); // { action, request }

  const tab = TABS.find((t) => t.key === activeTab) || TABS[0];
  const hasFilters = Object.values(filters).some(Boolean);

  const listParams = useMemo(
    () => ({
      status: tab.statuses,
      page,
      limit: PAGE_SIZE,
      ...filters,
      // "To" date poora din shaamil kare
      to: filters.to ? `${filters.to}T23:59:59.999Z` : '',
    }),
    [tab, page, filters]
  );

  useEffect(() => {
    dispatch(fetchRequestsRequested({ params: listParams }));
  }, [dispatch, listParams]);

  useEffect(() => {
    dispatch(fetchSummaryRequested());
    dispatch(fetchWizardTemplatesRequested({ isOperator: false }));
    dispatch(startPrintRequestPolling());
    return () => {
      dispatch(stopPrintRequestPolling());
    };
  }, [dispatch]);

  const tabsWithCounts = TABS.map((t) => ({
    ...t,
    count: t.statuses.length === 0 ? Object.values(counts).reduce((s, n) => s + n, 0) : sumCounts(counts, t.statuses),
  }));

  const cards = [
    { key: 'PENDING', label: 'Pending Approval', count: sumCounts(counts, ['PENDING_APPROVAL']), icon: Hourglass, tone: 'amber' },
    { key: 'APPROVED', label: 'Pending for Printing', count: sumCounts(counts, ['APPROVED']), icon: Send, tone: 'blue' },
    { key: 'PRINTING', label: 'Printing in Progress', count: sumCounts(counts, ['PRINTING']), icon: Printer, tone: 'violet' },
    { key: 'COMPLETED', label: 'Completed', count: sumCounts(counts, ['COMPLETED']), icon: CheckCircle2, tone: 'emerald', hint: 'All time' },
    { key: 'REJECTED', label: 'Rejected / Declined', count: sumCounts(counts, ['REJECTED_BY_ADMIN', 'DECLINED']), icon: XCircle, tone: 'rose' },
  ];

  const selectTab = (key) => {
    setActiveTab(key);
    setPage(1);
  };

  const applyFilters = (e) => {
    e.preventDefault();
    setFilters({ ...filterInput });
    setPage(1);
  };

  const clearFilters = () => {
    setFilterInput(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const quickConfig = quickAction ? REQUEST_ACTION_CONFIG[quickAction.action] : null;
  const noActiveTemplate = !templatesLoading && templates.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="ID Card Print Requests"
        description="Review requests from class teachers. Approved requests are sent to the Print Center."
        actions={
          <button
            type="button"
            onClick={() => {
              dispatch(fetchRequestsRequested({ params: listParams }));
              dispatch(fetchSummaryRequested());
            }}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-xs"
            aria-label="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      {/* Koi active template nahi → class teachers request nahi bana sakte */}
      {noActiveTemplate && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="flex items-center gap-2 text-sm text-amber-900">
            <LayoutTemplate className="h-5 w-5 shrink-0" />
            No active ID card template. Class teachers can't create print requests until you create one.
          </p>
          <Link to={ROUTES.TEMPLATES_NEW} className="shrink-0 inline-flex items-center justify-center px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold">
            Create Template
          </Link>
        </div>
      )}

      <RequestSummaryCards cards={cards} activeKey={activeTab} onSelect={selectTab} loading={summaryLoading && Object.keys(counts).length === 0} />

      <RequestTabs tabs={tabsWithCounts} active={activeTab} onChange={selectTab} />

      {/* Filters */}
      <form onSubmit={applyFilters} className="grid grid-cols-2 md:grid-cols-6 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <input aria-label="Search request number" placeholder="Request no. (PR-…)" value={filterInput.search} onChange={(e) => setFilterInput((f) => ({ ...f, search: e.target.value }))} className={`${inputClass} col-span-2`} />
        <input aria-label="Class" placeholder="Class" value={filterInput.className} onChange={(e) => setFilterInput((f) => ({ ...f, className: e.target.value }))} className={inputClass} />
        <input aria-label="Section" placeholder="Section" value={filterInput.section} onChange={(e) => setFilterInput((f) => ({ ...f, section: e.target.value }))} className={inputClass} />
        <input aria-label="From date" type="date" value={filterInput.from} onChange={(e) => setFilterInput((f) => ({ ...f, from: e.target.value }))} className={inputClass} />
        <input aria-label="To date" type="date" value={filterInput.to} min={filterInput.from || undefined} onChange={(e) => setFilterInput((f) => ({ ...f, to: e.target.value }))} className={inputClass} />
        <div className="col-span-2 md:col-span-6 flex justify-end gap-2">
          {hasFilters && (
            <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50">
              <X className="h-4 w-4" /> Clear
            </button>
          )}
          <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold">
            <Filter className="h-4 w-4" /> Apply
          </button>
        </div>
      </form>

      {error && <ErrorMessage message={error} title="Couldn't load requests" />}

      {!loading && requests.length === 0 ? (
        <EmptyState
          title={hasFilters ? 'No matching requests' : 'Nothing here'}
          description={activeTab === 'PENDING' && !hasFilters ? 'No requests are waiting for your approval.' : 'No requests in this view.'}
          icon={ClipboardList}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" aria-label="Print requests">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 sm:px-6 py-3">Request</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Class Teacher</th>
                  <th className="px-4 py-3">Template</th>
                  <th className="px-4 py-3 text-center">Students</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && requests.length === 0
                  ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 8 }).map((__, j) => (
                        <td key={j} className="px-4 py-4"><span className="block h-4 rounded bg-slate-100" /></td>
                      ))}
                    </tr>
                  ))
                  : requests.map((request) => {
                    const actions = request.availableActions || [];
                    return (
                      <tr key={request.id} className="hover:bg-slate-50/70">
                        <td className="px-4 sm:px-6 py-3.5">
                          <Link to={getPrintRequestDetailRoute(request.id)} className="font-mono text-xs font-semibold text-indigo-700 hover:underline">
                            {request.requestNumber || '—'}
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">
                          {request.className ? `${request.className}${request.section ? ` - ${request.section}` : ''}` : '—'}
                        </td>
                        <td className="px-4 py-3.5 text-slate-700">{request.createdBy?.name || '—'}</td>
                        <td className="px-4 py-3.5 text-slate-700">{request.template?.name || '—'}</td>
                        <td className="px-4 py-3.5 text-center font-semibold tabular-nums">{request.studentCount}</td>
                        <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">{formatDateTime(request.submittedAt)}</td>
                        <td className="px-4 py-3.5"><RequestStatusBadge statusView={request.statusView} /></td>
                        <td className="px-4 sm:px-6 py-3.5">
                          <div className="flex justify-end gap-2">
                            {actions.includes('APPROVE') && (
                              <button
                                type="button"
                                onClick={() => setQuickAction({ action: 'APPROVE', request })}
                                disabled={Boolean(loadingAction)}
                                className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold disabled:opacity-60"
                              >
                                Approve
                              </button>
                            )}
                            {actions.includes('REJECT') && (
                              <button
                                type="button"
                                onClick={() => setQuickAction({ action: 'REJECT', request })}
                                disabled={Boolean(loadingAction)}
                                className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-white text-rose-700 hover:bg-rose-50 text-xs font-semibold disabled:opacity-60"
                              >
                                Reject
                              </button>
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

      <ConfirmActionModal
        open={Boolean(quickConfig)}
        title={quickConfig ? `${quickConfig.title.replace('?', '')} ${quickAction.request.requestNumber || ''}?`.trim() : ''}
        message={quickConfig ? `${quickAction.request.studentCount} student(s), class ${quickAction.request.className || '—'}${quickAction.request.section ? ` - ${quickAction.request.section}` : ''}. ${quickConfig.message}` : ''}
        confirmLabel={quickConfig?.confirmLabel}
        tone={quickConfig?.tone}
        reasonMode={quickConfig?.reasonMode}
        reasonLabel={quickConfig?.reasonLabel}
        loading={Boolean(loadingAction)}
        onConfirm={(reason) =>
          dispatch(
            requestActionRequested({
              requestId: quickAction.request.id,
              action: quickAction.action,
              reason,
              onSuccess: () => setQuickAction(null),
            })
          )
        }
        onCancel={() => setQuickAction(null)}
      />
    </div>
  );
};

export default AdminPrintRequestsPage;

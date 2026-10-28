// PrintCenterPage.jsx — Super Admin Print Center: sab schools ki approved ID card print requests
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  Inbox,
  Printer,
  CheckCircle2,
  XCircle,
  CreditCard,
  RefreshCw,
  Download,
  FileArchive,
  Loader2,
  Filter,
  X,
  Layers,
  Eye,
  Building2,
} from 'lucide-react';
import {
  fetchRequestsRequested,
  fetchSummaryRequested,
  requestActionRequested,
  downloadFileRequested,
  startPrintRequestPolling,
  stopPrintRequestPolling,
} from '../../features/printRequestWorkflow/printRequestWorkflowSlice.js';
import {
  selectPrintRequests,
  selectPrintRequestPagination,
  selectPrintRequestsLoading,
  selectPrintRequestsError,
  selectPrintRequestCounts,
  selectPrintRequestCardCounts,
  selectPrintRequestSummaryLoading,
  selectPrintRequestLoadingAction,
  selectPrintRequestDownloadKey,
} from '../../features/printRequestWorkflow/printRequestWorkflowSelectors.js';
import { fetchCollegesRequested } from '../../features/colleges/collegeSlice.js';
import { selectCollegesList } from '../../features/colleges/collegeSelectors.js';
import { getPrintCenterDetailRoute } from '../../constants/routes.js';
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

const TABS = [
  { key: 'NEW', label: 'New Requests', statuses: ['APPROVED'] },
  { key: 'PRINTING', label: 'In Print', statuses: ['PRINTING'] },
  { key: 'COMPLETED', label: 'Completed', statuses: ['COMPLETED'] },
  { key: 'DECLINED', label: 'Declined', statuses: ['DECLINED'] },
];

// Print files sirf in statuses mein (backend bhi check karta hai)
const PRINT_FILE_STATUSES = ['PRINTING', 'COMPLETED'];
// Bulk print: in tabs mein rows select hoti hain; ek PDF mein max itni requests (backend limit)
const BULK_PRINT_TABS = ['PRINTING', 'COMPLETED'];
const BULK_PRINT_MAX = 20;
const BULK_PRINT_KEY = 'bulk:print';
const PAGE_SIZE = 20;
const EMPTY_FILTERS = { collegeId: '', search: '', from: '', to: '' };

const inputClass =
  'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white';

const classOf = (request) =>
  request.className ? `${request.className}${request.section ? ` - ${request.section}` : ''}` : '—';

export const PrintCenterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const requests = useSelector(selectPrintRequests);
  const pagination = useSelector(selectPrintRequestPagination);
  const loading = useSelector(selectPrintRequestsLoading);
  const error = useSelector(selectPrintRequestsError);
  const counts = useSelector(selectPrintRequestCounts);
  const cardCounts = useSelector(selectPrintRequestCardCounts);
  const summaryLoading = useSelector(selectPrintRequestSummaryLoading);
  const loadingAction = useSelector(selectPrintRequestLoadingAction);
  const downloadKey = useSelector(selectPrintRequestDownloadKey);
  const colleges = useSelector(selectCollegesList);

  const [activeTab, setActiveTab] = useState('NEW');
  const [page, setPage] = useState(1);
  const [filterInput, setFilterInput] = useState(EMPTY_FILTERS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [groupBySchool, setGroupBySchool] = useState(false);
  const [quickAction, setQuickAction] = useState(null); // { action, request }
  const [selectedIds, setSelectedIds] = useState([]); // bulk print

  const tab = TABS.find((t) => t.key === activeTab) || TABS[0];
  const hasFilters = Object.values(filters).some(Boolean);

  const listParams = useMemo(
    () => ({
      status: tab.statuses,
      page,
      limit: PAGE_SIZE,
      ...filters,
      to: filters.to ? `${filters.to}T23:59:59.999Z` : '',
    }),
    [tab, page, filters]
  );

  useEffect(() => {
    dispatch(fetchRequestsRequested({ params: listParams }));
  }, [dispatch, listParams]);

  // KPI school filter ke saath
  useEffect(() => {
    dispatch(fetchSummaryRequested({ params: { collegeId: filters.collegeId } }));
  }, [dispatch, filters.collegeId]);

  useEffect(() => {
    dispatch(fetchCollegesRequested({ page: 1, limit: 100 }));
    dispatch(startPrintRequestPolling());
    return () => {
      dispatch(stopPrintRequestPolling());
    };
  }, [dispatch]);

  const tabsWithCounts = TABS.map((t) => ({ ...t, count: t.statuses.reduce((s, status) => s + (counts[status] || 0), 0) }));

  const cards = [
    { key: 'NEW', label: 'New Requests', count: counts.APPROVED || 0, icon: Inbox, tone: 'blue' },
    { key: 'PRINTING', label: 'In Print', count: counts.PRINTING || 0, icon: Printer, tone: 'violet' },
    { key: 'COMPLETED', label: 'Completed', count: counts.COMPLETED || 0, icon: CheckCircle2, tone: 'emerald', hint: 'All time' },
    { key: 'DECLINED', label: 'Declined', count: counts.DECLINED || 0, icon: XCircle, tone: 'rose' },
    { key: 'CARDS', label: 'Cards in Print', count: cardCounts.PRINTING || 0, icon: CreditCard, tone: 'indigo', hint: 'Students in accepted requests' },
  ];

  // School-wise groups (sirf is page ki rows; har group mein count)
  const groups = useMemo(() => {
    const map = new Map();
    requests.forEach((request) => {
      const key = request.college?.id || 'unknown';
      if (!map.has(key)) map.set(key, { college: request.college, requests: [], cards: 0 });
      const group = map.get(key);
      group.requests.push(request);
      group.cards += request.studentCount || 0;
    });
    return [...map.values()].sort((a, b) => String(a.college?.name || '').localeCompare(String(b.college?.name || '')));
  }, [requests]);

  const selectTab = (key) => {
    if (key === 'CARDS') key = 'PRINTING';
    setActiveTab(key);
    setPage(1);
    setSelectedIds([]);
  };

  // Bulk print selection: sirf is page ki printable rows (page / filter badle to purane apne aap hat jaate)
  const canBulkSelect = BULK_PRINT_TABS.includes(activeTab);
  const selectableIds = canBulkSelect
    ? requests.filter((r) => PRINT_FILE_STATUSES.includes(r.status)).map((r) => r.id)
    : [];
  const visibleSelectedIds = selectedIds.filter((id) => selectableIds.includes(id));
  const allSelected = selectableIds.length > 0 && visibleSelectedIds.length === selectableIds.length;
  const selectedCards = requests
    .filter((r) => visibleSelectedIds.includes(r.id))
    .reduce((sum, r) => sum + (r.studentCount || 0), 0);
  const bulkBusy = downloadKey === BULK_PRINT_KEY;
  const bulkTooMany = visibleSelectedIds.length > BULK_PRINT_MAX;

  const toggleSelected = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAll = (checked) => setSelectedIds(checked ? selectableIds : []);

  const bulkPrint = () => {
    if (visibleSelectedIds.length === 0 || bulkTooMany || bulkBusy) return;
    dispatch(downloadFileRequested({ id: 'bulk', kind: 'print', requestIds: visibleSelectedIds }));
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

  const download = (request, kind) =>
    dispatch(downloadFileRequested({ id: request.id, kind, requestNumber: request.requestNumber }));

  const downloadButton = (request, kind, Icon, label) => {
    const busy = downloadKey === `${request.id}:${kind}`;
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          download(request, kind);
        }}
        disabled={busy}
        title={kind === 'print' ? 'Print cards' : `Download ${label}`}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5 text-indigo-600" />}
        {label}
      </button>
    );
  };

  const actionButton = (request, action, primary) => (
    <button
      key={action}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setQuickAction({ action, request });
      }}
      disabled={Boolean(loadingAction)}
      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60 ${primary ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'border border-rose-200 bg-white text-rose-700 hover:bg-rose-50'}`}
    >
      {REQUEST_ACTION_CONFIG[action].label}
    </button>
  );

  const renderRow = (request) => {
    const actions = request.availableActions || [];
    const canDownload = PRINT_FILE_STATUSES.includes(request.status);
    return (
      <tr
        key={request.id}
        onClick={() => navigate(getPrintCenterDetailRoute(request.id))}
        className={`cursor-pointer ${visibleSelectedIds.includes(request.id) ? 'bg-indigo-50/60' : 'hover:bg-slate-50/70'}`}
      >
        {canBulkSelect && (
          <td className="pl-4 sm:pl-6 py-3.5 w-10" onClick={(e) => e.stopPropagation()}>
            {canDownload && (
              <input
                type="checkbox"
                checked={visibleSelectedIds.includes(request.id)}
                onChange={() => toggleSelected(request.id)}
                aria-label={`Select ${request.requestNumber || 'request'} for bulk print`}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            )}
          </td>
        )}
        <td className="px-4 sm:px-6 py-3.5">
          <Link
            to={getPrintCenterDetailRoute(request.id)}
            onClick={(e) => e.stopPropagation()}
            className="font-mono text-xs font-semibold text-indigo-700 hover:underline"
          >
            {request.requestNumber || '—'}
          </Link>
        </td>
        {!groupBySchool && (
          <td className="px-4 py-3.5">
            <p className="font-semibold text-slate-800">{request.college?.name || '—'}</p>
            <p className="text-[11px] font-mono text-slate-400">{request.college?.code || ''}</p>
          </td>
        )}
        <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">{classOf(request)}</td>
        <td className="px-4 py-3.5 text-center font-semibold tabular-nums">{request.studentCount}</td>
        <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">{formatDateTime(request.approvedAt)}</td>
        <td className="px-4 py-3.5"><RequestStatusBadge statusView={request.statusView} /></td>
        <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
          <span className="font-semibold text-slate-700">{request.downloadCount || 0}</span>
          {request.lastDownloadedAt && <span className="block text-[11px]">{formatDateTime(request.lastDownloadedAt)}</span>}
        </td>
        <td className="px-4 sm:px-6 py-3.5">
          <div className="flex flex-wrap justify-end gap-1.5">
            {actions.includes('ACCEPT') && actionButton(request, 'ACCEPT', true)}
            {actions.includes('DECLINE') && actionButton(request, 'DECLINE', false)}
            {canDownload && downloadButton(request, 'print', Printer, 'Print')}
            {canDownload && downloadButton(request, 'pdf', Download, 'PDF')}
            {canDownload && downloadButton(request, 'zip', FileArchive, 'ZIP')}
            {actions.includes('COMPLETE') && actionButton(request, 'COMPLETE', true)}
            <Link
              to={getPrintCenterDetailRoute(request.id)}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              aria-label="View request"
            >
              <Eye className="h-3.5 w-3.5" />
            </Link>
          </div>
        </td>
      </tr>
    );
  };

  const columnCount = (groupBySchool ? 7 : 8) + (canBulkSelect ? 1 : 0);
  const quickConfig = quickAction ? REQUEST_ACTION_CONFIG[quickAction.action] : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Print Center"
        description="ID card print requests from all schools."
        actions={
          <button
            type="button"
            onClick={() => {
              dispatch(fetchRequestsRequested({ params: listParams }));
              dispatch(fetchSummaryRequested({ params: { collegeId: filters.collegeId } }));
            }}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-xs"
            aria-label="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      <RequestSummaryCards cards={cards} activeKey={activeTab} onSelect={selectTab} loading={summaryLoading && Object.keys(counts).length === 0} />

      <RequestTabs tabs={tabsWithCounts} active={activeTab} onChange={selectTab} />

      {/* Filters */}
      <form onSubmit={applyFilters} className="grid grid-cols-2 md:grid-cols-6 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <select
          aria-label="School"
          value={filterInput.collegeId}
          onChange={(e) => setFilterInput((f) => ({ ...f, collegeId: e.target.value }))}
          className={`${inputClass} col-span-2 cursor-pointer`}
        >
          <option value="">All schools</option>
          {colleges.map((college) => (
            <option key={college.id || college._id} value={college.id || college._id}>
              {college.name}{college.code ? ` (${college.code})` : ''}
            </option>
          ))}
        </select>
        <input aria-label="Search request number" placeholder="Request no. (PR-…)" value={filterInput.search} onChange={(e) => setFilterInput((f) => ({ ...f, search: e.target.value }))} className={`${inputClass} col-span-2`} />
        <input aria-label="Approved from" type="date" value={filterInput.from} onChange={(e) => setFilterInput((f) => ({ ...f, from: e.target.value }))} className={inputClass} title="Approved from" />
        <input aria-label="Approved to" type="date" value={filterInput.to} min={filterInput.from || undefined} onChange={(e) => setFilterInput((f) => ({ ...f, to: e.target.value }))} className={inputClass} title="Approved to" />
        <div className="col-span-2 md:col-span-6 flex flex-wrap items-center justify-between gap-2">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
            <input type="checkbox" checked={groupBySchool} onChange={(e) => setGroupBySchool(e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
            <Layers className="h-4 w-4 text-slate-400" /> Group by school
          </label>
          <div className="flex gap-2">
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50">
                <X className="h-4 w-4" /> Clear
              </button>
            )}
            <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold">
              <Filter className="h-4 w-4" /> Apply
            </button>
          </div>
        </div>
      </form>

      {error && <ErrorMessage message={error} title="Couldn't load print requests" />}

      {!loading && requests.length === 0 ? (
        <EmptyState
          title={hasFilters ? 'No matching requests' : 'Nothing here'}
          description={activeTab === 'NEW' && !hasFilters ? 'No new print requests from schools right now.' : 'No requests in this view.'}
          icon={Printer}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Bulk print bar */}
          {canBulkSelect && selectableIds.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-3 border-b border-slate-200 bg-indigo-50/50">
              <p className="text-sm text-slate-700">
                {visibleSelectedIds.length > 0 ? (
                  <>
                    <span className="font-semibold">{visibleSelectedIds.length}</span> request(s) selected ·{' '}
                    <span className="font-semibold">{selectedCards}</span> card(s)
                    {bulkTooMany && <span className="block text-xs text-rose-600">Select at most {BULK_PRINT_MAX} requests at once.</span>}
                  </>
                ) : (
                  <span className="text-slate-500">Select requests to print all their cards together.</span>
                )}
              </p>
              <div className="flex gap-2">
                {visibleSelectedIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={bulkPrint}
                  disabled={visibleSelectedIds.length === 0 || bulkTooMany || bulkBusy}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bulkBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                  {bulkBusy ? 'Preparing…' : `Print Selected (${visibleSelectedIds.length})`}
                </button>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" aria-label="Print Center requests">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  {canBulkSelect && (
                    <th className="pl-4 sm:pl-6 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(e) => toggleAll(e.target.checked)}
                        disabled={selectableIds.length === 0}
                        aria-label="Select all requests on this page"
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </th>
                  )}
                  <th className="px-4 sm:px-6 py-3">Request</th>
                  {!groupBySchool && <th className="px-4 py-3">School</th>}
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3 text-center">Students</th>
                  <th className="px-4 py-3">Approved</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Downloads</th>
                  <th className="px-4 sm:px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && requests.length === 0
                  ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: columnCount }).map((__, j) => (
                        <td key={j} className="px-4 py-4"><span className="block h-4 rounded bg-slate-100" /></td>
                      ))}
                    </tr>
                  ))
                  : groupBySchool
                    ? groups.map((group) => (
                      <React.Fragment key={group.college?.id || 'unknown'}>
                        <tr className="bg-slate-50/80">
                          <td colSpan={columnCount} className="px-4 sm:px-6 py-2.5">
                            <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-800">
                              <Building2 className="h-4 w-4 text-slate-400" />
                              {group.college?.name || 'Unknown school'}
                              {group.college?.code && <span className="font-mono text-xs font-normal text-slate-400">{group.college.code}</span>}
                            </span>
                            <span className="ml-3 text-xs text-slate-500">
                              {group.requests.length} request(s) · {group.cards} card(s)
                            </span>
                          </td>
                        </tr>
                        {group.requests.map(renderRow)}
                      </React.Fragment>
                    ))
                    : requests.map(renderRow)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <StudentPagination pagination={pagination} onPageChange={setPage} />

      <ConfirmActionModal
        open={Boolean(quickConfig)}
        title={quickConfig ? `${quickConfig.title.replace('?', '')} ${quickAction.request.requestNumber || ''}?`.trim() : ''}
        message={quickConfig ? `${quickAction.request.college?.name || 'School'} · class ${classOf(quickAction.request)} · ${quickAction.request.studentCount} card(s). ${quickConfig.message}` : ''}
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

export default PrintCenterPage;

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
  Search,
  CalendarDays,
  Wallet,
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
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import StudentPagination from '../../components/students/StudentPagination.jsx';
import RequestStatusBadge from '../../components/printRequests/RequestStatusBadge.jsx';
import ConfirmActionModal from '../../components/printRequests/ConfirmActionModal.jsx';
import { REQUEST_ACTION_CONFIG } from '../../components/printRequests/requestActionConfig.js';
import PaymentStatusBadge from '../../components/commission/PaymentStatusBadge.jsx';
import RequestAmount from '../../components/commission/RequestAmount.jsx';
import { PAYMENT_STATUS_OPTIONS } from '../../constants/commission.js';
import { formatDateTime } from '../../utils/idCardFormat.js';
import GradientRequestTabs from '../printRequests/GradientRequestTabs.jsx';

const TABS = [
  { key: 'NEW', label: 'New Requests', statuses: ['APPROVED'], tone: 'blue' },
  { key: 'PRINTING', label: 'In Print', statuses: ['PRINTING'], tone: 'violet' },
  { key: 'COMPLETED', label: 'Completed', statuses: ['COMPLETED'], tone: 'emerald' },
  { key: 'DECLINED', label: 'Declined', statuses: ['DECLINED'], tone: 'rose' },
];

// Print files sirf in statuses mein (backend bhi check karta hai)
const PRINT_FILE_STATUSES = ['PRINTING', 'COMPLETED'];
// Bulk print: in tabs mein rows select hoti hain; ek PDF mein max itni requests (backend limit)
const BULK_PRINT_TABS = ['PRINTING', 'COMPLETED'];
const BULK_PRINT_MAX = 20;
const BULK_PRINT_KEY = 'bulk:print';
const PAGE_SIZE = 20;
const EMPTY_FILTERS = { collegeId: '', search: '', from: '', to: '', paymentStatus: '' };

const inputClass =
  'w-full h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500';

const classOf = (request) =>
  request.className ? `${request.className}${request.section ? ` - ${request.section}` : ''}` : '—';

/* ------------------------------------------------------------------ */
/* Small pieces (sirf is page ke liye)                                 */
/* ------------------------------------------------------------------ */

const KPI_TONES = {
  blue: 'from-sky-500 via-blue-500 to-indigo-600 shadow-blue-500/25 ring-blue-400',
  violet: 'from-violet-500 via-purple-500 to-fuchsia-500 shadow-violet-500/25 ring-violet-400',
  emerald: 'from-emerald-400 via-teal-500 to-cyan-600 shadow-teal-500/25 ring-teal-400',
  rose: 'from-rose-400 via-rose-500 to-pink-600 shadow-rose-500/25 ring-rose-400',
  indigo: 'from-indigo-500 via-indigo-600 to-violet-700 shadow-indigo-500/25 ring-indigo-400',
};

/** Rangeen KPI tile — click karne par wo tab khulta hai */
const KpiTile = ({ card, active, loading, onSelect, className = '' }) => {
  const Icon = card.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(card.key)}
      aria-pressed={active}
      title={card.hint || card.label}
      className={`group relative overflow-hidden rounded-2xl bg-linear-to-br p-3 text-left text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-3.5 ${className} ${KPI_TONES[card.tone]} ${active ? 'ring-2 ring-offset-2 ring-offset-slate-50' : 'opacity-90 hover:opacity-100'
        }`}
    >
      <span className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/15 transition-transform duration-500 group-hover:scale-125 motion-reduce:transition-none" />
      <span className="relative flex items-center justify-between gap-2">
        <span className="truncate text-[11px] font-semibold uppercase tracking-wider text-white/85">{card.label}</span>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/20 ring-1 ring-white/30">
          <Icon className="h-3.5 w-3.5" />
        </span>
      </span>
      <span className="relative mt-1 block">
        {loading ? (
          <span className="block h-7 w-12 animate-pulse rounded-lg bg-white/25" />
        ) : (
          <span className="block text-2xl font-black tabular-nums tracking-tight">
            {Number(card.count || 0).toLocaleString('en-IN')}
          </span>
        )}
        {card.hint && <span className="block truncate text-[10px] font-medium text-white/75">{card.hint}</span>}
      </span>
    </button>
  );
};

/** Input ke saath chhota icon */
const IconField = ({ icon: Icon, className = '', children }) => (
  <div className={`relative ${className}`}>
    <Icon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
    {children}
  </div>
);

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

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

  const refresh = () => {
    dispatch(fetchRequestsRequested({ params: listParams }));
    dispatch(fetchSummaryRequested({ params: { collegeId: filters.collegeId } }));
  };

  const download = (request, kind) =>
    dispatch(downloadFileRequested({ id: request.id, kind, requestNumber: request.requestNumber }));

  // Print = violet, PDF = blue, ZIP = amber — ek nazar mein pehchaan
  const DOWNLOAD_TONES = {
    print: 'text-violet-700 bg-violet-50 ring-violet-200 hover:bg-violet-100',
    pdf: 'text-blue-700 bg-blue-50 ring-blue-200 hover:bg-blue-100',
    zip: 'text-amber-700 bg-amber-50 ring-amber-200 hover:bg-amber-100',
  };

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
        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold ring-1 transition-colors disabled:opacity-60 ${DOWNLOAD_TONES[kind]}`}
      >
        {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Icon className="h-3 w-3" />}
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
      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all disabled:opacity-60 ${primary
        ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/30 hover:shadow-md'
        : 'bg-white text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50'
        }`}
    >
      {REQUEST_ACTION_CONFIG[action].label}
    </button>
  );

  const renderRow = (request) => {
    const actions = request.availableActions || [];
    const canDownload = PRINT_FILE_STATUSES.includes(request.status);
    const isSelected = visibleSelectedIds.includes(request.id);
    return (
      <tr
        key={request.id}
        onClick={() => navigate(getPrintCenterDetailRoute(request.id))}
        className={`cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50/70' : 'hover:bg-slate-50/80'}`}
      >
        {canBulkSelect && (
          <td className="w-9 py-2.5 pl-4" onClick={(e) => e.stopPropagation()}>
            {canDownload && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelected(request.id)}
                aria-label={`Select ${request.requestNumber || 'request'} for bulk print`}
                className="cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            )}
          </td>
        )}
        <td className="px-4 py-2.5">
          <Link
            to={getPrintCenterDetailRoute(request.id)}
            onClick={(e) => e.stopPropagation()}
            className="whitespace-nowrap rounded-md bg-indigo-50 px-1.5 py-0.5 font-mono text-[11px] font-bold text-indigo-700 ring-1 ring-indigo-100 hover:bg-indigo-100"
          >
            {request.requestNumber || '—'}
          </Link>
        </td>
        {!groupBySchool && (
          <td className="px-3 py-2.5">
            <p className="max-w-[200px] truncate font-semibold text-slate-800" title={request.college?.name || ''}>
              {request.college?.name || '—'}
            </p>
            <p className="font-mono text-[10px] text-slate-400">{request.college?.code || ''}</p>
          </td>
        )}
        <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">{classOf(request)}</td>
        <td className="px-3 py-2.5 text-center">
          <span className="inline-flex min-w-7 justify-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold tabular-nums text-slate-700">
            {request.studentCount}
          </span>
        </td>
        <td className="whitespace-nowrap px-3 py-2.5 text-right"><RequestAmount request={request} /></td>
        <td className="px-3 py-2.5"><PaymentStatusBadge payment={request.payment} /></td>
        <td className="whitespace-nowrap px-3 py-2.5 text-xs text-slate-500">{formatDateTime(request.approvedAt)}</td>
        <td className="px-3 py-2.5"><RequestStatusBadge statusView={request.statusView} /></td>
        <td className="whitespace-nowrap px-3 py-2.5 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 font-bold text-slate-700">
            <Download className="h-3 w-3 text-slate-400" />
            {request.downloadCount || 0}
          </span>
          {request.lastDownloadedAt && <span className="block text-[10px]">{formatDateTime(request.lastDownloadedAt)}</span>}
        </td>
        <td className="px-4 py-2.5">
          <div className="flex justify-end gap-1 whitespace-nowrap">
            {actions.includes('ACCEPT') && actionButton(request, 'ACCEPT', true)}
            {actions.includes('DECLINE') && actionButton(request, 'DECLINE', false)}
            {canDownload && downloadButton(request, 'print', Printer, 'Print')}
            {canDownload && downloadButton(request, 'pdf', Download, 'PDF')}
            {canDownload && downloadButton(request, 'zip', FileArchive, 'ZIP')}
            {actions.includes('COMPLETE') && actionButton(request, 'COMPLETE', true)}
            <Link
              to={getPrintCenterDetailRoute(request.id)}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center rounded-lg bg-white px-1.5 py-1 text-slate-500 ring-1 ring-slate-200 transition-colors hover:bg-slate-50 hover:text-indigo-600"
              aria-label="View request"
            >
              <Eye className="h-3.5 w-3.5" />
            </Link>
          </div>
        </td>
      </tr>
    );
  };

  const columnCount = (groupBySchool ? 9 : 10) + (canBulkSelect ? 1 : 0);
  const quickConfig = quickAction ? REQUEST_ACTION_CONFIG[quickAction.action] : null;
  const kpiLoading = summaryLoading && Object.keys(counts).length === 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-indigo-900 to-violet-800 px-4 py-3.5 text-white shadow-xl sm:px-5">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-400 via-violet-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/30 ring-1 ring-white/30">
              <Printer className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-black tracking-tight sm:text-2xl">Print Center</h1>
              <p className="truncate text-xs font-medium text-indigo-200">Approved ID card requests from all schools</p>
            </div>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            aria-label="Refresh"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold ring-1 ring-white/20 backdrop-blur-sm transition-colors hover:bg-white/20 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white disabled:cursor-wait disabled:opacity-70"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin motion-reduce:animate-none' : ''}`} />
            <span className="hidden sm:inline">{loading ? 'Updating…' : 'Refresh'}</span>
          </button>
        </div>
      </section>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5 sm:gap-3">
        {cards.map((card, index) => (
          <KpiTile
            className={index === cards.length - 1 ? 'col-span-2 sm:col-span-1' : ''}
            key={card.key}
            card={card}
            active={card.key === activeTab}
            loading={kpiLoading}
            onSelect={selectTab}
          />
        ))}
      </div>

      <GradientRequestTabs tabs={tabsWithCounts} active={activeTab} onChange={selectTab} ariaLabel="Print Center status" />

      {/* Filters */}
      <form
        onSubmit={applyFilters}
        className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-xs md:grid-cols-12"
      >
        <IconField icon={Building2} className="col-span-2 md:col-span-3">
          <select
            aria-label="School"
            value={filterInput.collegeId}
            onChange={(e) => setFilterInput((f) => ({ ...f, collegeId: e.target.value }))}
            className={`${inputClass} cursor-pointer pl-8`}
          >
            <option value="">All schools</option>
            {colleges.map((college) => (
              <option key={college.id || college._id} value={college.id || college._id}>
                {college.name}{college.code ? ` (${college.code})` : ''}
              </option>
            ))}
          </select>
        </IconField>
        <IconField icon={Search} className="col-span-2 md:col-span-3">
          <input
            aria-label="Search request number"
            placeholder="Request no. (PR-…)"
            value={filterInput.search}
            onChange={(e) => setFilterInput((f) => ({ ...f, search: e.target.value }))}
            className={`${inputClass} pl-8`}
          />
        </IconField>
        <IconField icon={CalendarDays} className="md:col-span-2">
          <input
            aria-label="Approved from"
            type="date"
            value={filterInput.from}
            onChange={(e) => setFilterInput((f) => ({ ...f, from: e.target.value }))}
            className={`${inputClass} pl-8`}
            title="Approved from"
          />
        </IconField>
        <IconField icon={CalendarDays} className="md:col-span-2">
          <input
            aria-label="Approved to"
            type="date"
            value={filterInput.to}
            min={filterInput.from || undefined}
            onChange={(e) => setFilterInput((f) => ({ ...f, to: e.target.value }))}
            className={`${inputClass} pl-8`}
            title="Approved to"
          />
        </IconField>
        <IconField icon={Wallet} className="col-span-2 md:col-span-2">
          <select
            aria-label="Payment status"
            value={filterInput.paymentStatus}
            onChange={(e) => setFilterInput((f) => ({ ...f, paymentStatus: e.target.value }))}
            className={`${inputClass} cursor-pointer pl-8`}
          >
            <option value="">All payments</option>
            {PAYMENT_STATUS_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </IconField>

        <div className="col-span-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 md:col-span-12">
          {/* Group by school: switch */}
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={groupBySchool}
              onChange={(e) => setGroupBySchool(e.target.checked)}
              className="peer sr-only"
            />
            <span className="relative h-5 w-9 rounded-full bg-slate-200 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:bg-linear-to-r peer-checked:from-indigo-500 peer-checked:to-violet-600 peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 peer-focus-visible:ring-offset-1 motion-reduce:after:transition-none" />
            <Layers className="h-3.5 w-3.5 text-slate-400" /> Group by school
          </label>
          <div className="flex gap-2">
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-8 items-center gap-1 rounded-xl bg-white px-3 text-xs font-bold text-slate-600 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
            <button
              type="submit"
              className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-3.5 text-xs font-bold text-white shadow-md shadow-indigo-500/25 transition-shadow hover:shadow-lg focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              <Filter className="h-3.5 w-3.5" /> Apply
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
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          {/* Bulk print bar */}
          {canBulkSelect && selectableIds.length > 0 && (
            <div className="flex flex-col gap-2 border-b border-indigo-100 bg-linear-to-r from-indigo-50 via-violet-50 to-fuchsia-50 px-4 py-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-700">
                {visibleSelectedIds.length > 0 ? (
                  <>
                    <span className="font-bold text-indigo-700">{visibleSelectedIds.length}</span> request(s) selected ·{' '}
                    <span className="font-bold text-indigo-700">{selectedCards}</span> card(s)
                    {bulkTooMany && <span className="block font-semibold text-rose-600">Select at most {BULK_PRINT_MAX} requests at once.</span>}
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
                    className="h-8 rounded-xl bg-white px-3 text-xs font-bold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={bulkPrint}
                  disabled={visibleSelectedIds.length === 0 || bulkTooMany || bulkBusy}
                  className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-linear-to-r from-violet-600 to-fuchsia-600 px-3.5 text-xs font-bold text-white shadow-md shadow-violet-500/25 transition-shadow hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                >
                  {bulkBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Printer className="h-3.5 w-3.5" />}
                  {bulkBusy ? 'Preparing…' : `Print Selected (${visibleSelectedIds.length})`}
                </button>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" aria-label="Print Center requests">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  {canBulkSelect && (
                    <th className="w-9 py-2.5 pl-4">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(e) => toggleAll(e.target.checked)}
                        disabled={selectableIds.length === 0}
                        aria-label="Select all requests on this page"
                        className="cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                  )}
                  <th className="px-4 py-2.5">Request</th>
                  {!groupBySchool && <th className="px-3 py-2.5">School</th>}
                  <th className="px-3 py-2.5">Class</th>
                  <th className="px-3 py-2.5 text-center">Students</th>
                  <th className="px-3 py-2.5 text-right">Amount</th>
                  <th className="px-3 py-2.5">Payment</th>
                  <th className="px-3 py-2.5">Approved</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Downloads</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && requests.length === 0
                  ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: columnCount }).map((__, j) => (
                        <td key={j} className="px-3 py-3"><span className="block h-3.5 rounded bg-slate-100" /></td>
                      ))}
                    </tr>
                  ))
                  : groupBySchool
                    ? groups.map((group) => (
                      <React.Fragment key={group.college?.id || 'unknown'}>
                        <tr className="bg-linear-to-r from-indigo-50/80 via-violet-50/60 to-transparent">
                          <td colSpan={columnCount} className="px-4 py-2">
                            <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-800">
                              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
                                <Building2 className="h-3.5 w-3.5" />
                              </span>
                              {group.college?.name || 'Unknown school'}
                              {group.college?.code && <span className="font-mono text-[11px] font-normal text-slate-400">{group.college.code}</span>}
                            </span>
                            <span className="ml-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                              <span className="rounded-full bg-white px-2 py-0.5 ring-1 ring-slate-200">{group.requests.length} request(s)</span>
                              <span className="rounded-full bg-white px-2 py-0.5 ring-1 ring-slate-200">{group.cards} card(s)</span>
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
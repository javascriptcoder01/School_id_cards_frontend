// CommissionCollegeLedgerPage.jsx — ek school: pending payment requests chuno, Mark as Paid; neeche paid history
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { BadgeIndianRupee, CheckCircle2, IndianRupee, ReceiptIndianRupee } from 'lucide-react';
import {
  fetchPendingRequested,
  fetchPaymentsRequested,
  fetchPaymentRequested,
  clearPaymentDetail,
  markPaidRequested,
  clearMarkPaidError,
} from '../../features/commission/commissionSlice.js';
import {
  selectPendingCollege,
  selectPendingCollegeId,
  selectPendingRequests,
  selectPendingTotals,
  selectPendingLoading,
  selectPendingError,
  selectMarkPaidSaving,
  selectMarkPaidError,
  selectPayments,
  selectPaymentsPagination,
  selectPaymentsLoading,
  selectPaymentsError,
  selectPaymentDetail,
  selectPaymentDetailRequests,
  selectPaymentDetailLoading,
  selectPaymentDetailError,
} from '../../features/commission/commissionSelectors.js';
import { fetchSuperAdminOverviewRequested } from '../../features/dashboard/dashboardOverviewSlice.js';
import { selectSuperAdminOverview } from '../../features/dashboard/dashboardOverviewSelectors.js';
import { ROUTES, getPrintCenterDetailRoute } from '../../constants/routes.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import StudentPagination from '../../components/students/StudentPagination.jsx';
import DashboardStatCard from '../../components/dashboard/DashboardStatCard.jsx';
import RequestStatusBadge from '../../components/printRequests/RequestStatusBadge.jsx';
import MarkPaidModal from '../../components/commission/MarkPaidModal.jsx';
import PaymentsTable from '../../components/commission/PaymentsTable.jsx';
import PaymentDetailDrawer from '../../components/commission/PaymentDetailDrawer.jsx';
import { cardsLabel, toPaginationProps } from '../../utils/commissionForm.js';
import { formatDateTime } from '../../utils/idCardFormat.js';
import { formatInr, formatInrShort } from '../../utils/money.js';

const PAGE_SIZE = 10;
const AMOUNT_VALUE_CLASS = 'text-lg sm:text-2xl wrap-anywhere';

const classOf = (request) =>
  (request.className ? `${request.className}${request.section ? ` - ${request.section}` : ''}` : '—');

export const CommissionCollegeLedgerPage = () => {
  const { collegeId } = useParams();
  const dispatch = useDispatch();

  const college = useSelector(selectPendingCollege);
  const pendingCollegeId = useSelector(selectPendingCollegeId);
  const allRequests = useSelector(selectPendingRequests);
  const totals = useSelector(selectPendingTotals);
  const loading = useSelector(selectPendingLoading);
  const error = useSelector(selectPendingError);
  const saving = useSelector(selectMarkPaidSaving);
  const saveError = useSelector(selectMarkPaidError);
  const payments = useSelector(selectPayments);
  const paymentsPagination = useSelector(selectPaymentsPagination);
  const paymentsLoading = useSelector(selectPaymentsLoading);
  const paymentsError = useSelector(selectPaymentsError);
  const overview = useSelector(selectSuperAdminOverview);
  const paymentDetail = useSelector(selectPaymentDetail);
  const paymentDetailRequests = useSelector(selectPaymentDetailRequests);
  const paymentDetailLoading = useSelector(selectPaymentDetailLoading);
  const paymentDetailError = useSelector(selectPaymentDetailError);

  const [selectedIds, setSelectedIds] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paymentsPage, setPaymentsPage] = useState(1);

  useEffect(() => {
    dispatch(fetchPendingRequested({ collegeId }));
    dispatch(fetchSuperAdminOverviewRequested({ params: {} }));
    return () => {
      dispatch(clearPaymentDetail());
    };
  }, [dispatch, collegeId]);

  useEffect(() => {
    dispatch(fetchPaymentsRequested({ params: { collegeId, page: paymentsPage, limit: PAGE_SIZE } }));
  }, [dispatch, collegeId, paymentsPage]);

  // Store mein pichhle school ka ledger ho to na dikhe
  const requests = pendingCollegeId === collegeId ? allRequests : [];
  const row = overview?.colleges?.find((item) => item.collegeId === collegeId) || null;
  const collegeName = college?.name || row?.name || 'School';

  // Sirf wahi jo abhi pending hain (refresh ke baad jo nikal gayi wo apne aap hat jaati hai)
  const selected = requests.filter((request) => selectedIds.includes(request.id));
  const allSelected = requests.length > 0 && selected.length === requests.length;
  const selectedCards = selected.reduce((sum, request) => sum + request.cardCount, 0);
  const selectedPaise = selected.reduce((sum, request) => sum + request.amountPaise, 0);
  const hiddenCount = (totals?.requests || 0) - requests.length;

  const toggle = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : requests.map((request) => request.id));
  };

  const openModal = () => {
    dispatch(clearMarkPaidError());
    setModalOpen(true);
  };

  const confirmPaid = (body) => {
    dispatch(markPaidRequested({
      collegeId,
      body,
      onSuccess: () => {
        setModalOpen(false);
        setSelectedIds([]);
      },
    }));
  };

  const openPayment = (payment) => {
    dispatch(fetchPaymentRequested({ paymentId: payment.id }));
    setDrawerOpen(true);
  };

  const closePayment = () => {
    setDrawerOpen(false);
    dispatch(clearPaymentDetail());
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={collegeName}
        description="Choose the pending requests this payment covers and mark them as paid."
        breadcrumbs={[{ label: 'Commission', path: ROUTES.COMMISSION }, { label: collegeName }]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <DashboardStatCard
          title="Pending Payment"
          value={formatInr(totals?.amount ?? 0)}
          subtitle={cardsLabel(totals?.cards)}
          icon={BadgeIndianRupee}
          colorScheme="amber"
          valueClassName={AMOUNT_VALUE_CLASS}
          isLoading={loading && !totals}
        />
        <DashboardStatCard
          title="Paid"
          value={formatInr(row?.paid?.amount ?? 0)}
          subtitle={cardsLabel(row?.paid?.cards)}
          icon={CheckCircle2}
          colorScheme="emerald"
          valueClassName={AMOUNT_VALUE_CLASS}
          isLoading={!overview}
        />
        <DashboardStatCard
          title="Current rate"
          value={row?.rate?.effective ? `${formatInrShort(row.rate.effective.rate)} / card` : 'Not set'}
          subtitle={row?.rate?.scope === 'COLLEGE' ? 'School rate' : row?.rate?.scope === 'GLOBAL' ? 'Default' : 'Set a rate on the Commission page'}
          icon={IndianRupee}
          colorScheme="indigo"
          valueClassName={AMOUNT_VALUE_CLASS}
          isLoading={!overview}
        />
      </div>

      {error && <ErrorMessage message={error} title="Couldn't load pending payments" />}

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800">Pending payment requests</h2>

        {!loading && requests.length === 0 ? (
          <EmptyState title="Nothing to collect" description="This school has no requests waiting for payment." icon={ReceiptIndianRupee} />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm" aria-label="Pending payment requests">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="pl-4 sm:pl-6 py-3 w-10">
                      <input
                        type="checkbox"
                        aria-label="Select all requests"
                        checked={allSelected}
                        disabled={requests.length === 0}
                        onChange={toggleAll}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-4 py-3">Request</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3 text-center">Cards</th>
                    <th className="px-4 py-3 text-right">Rate</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Approved</th>
                    <th className="px-4 sm:px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading && requests.length === 0
                    ? Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 8 }).map((__, j) => (
                          <td key={j} className="px-4 py-4"><span className="block h-4 rounded bg-slate-100" /></td>
                        ))}
                      </tr>
                    ))
                    : requests.map((request) => (
                      <tr key={request.id} className="hover:bg-slate-50/70">
                        <td className="pl-4 sm:pl-6 py-3.5 w-10">
                          <input
                            type="checkbox"
                            aria-label={`Select ${request.requestNumber || 'request'}`}
                            checked={selectedIds.includes(request.id)}
                            onChange={() => toggle(request.id)}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <Link to={getPrintCenterDetailRoute(request.id)} className="font-mono text-xs font-semibold text-indigo-700 hover:underline">
                            {request.requestNumber || '—'}
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">{classOf(request)}</td>
                        <td className="px-4 py-3.5 text-center font-semibold tabular-nums">{request.cardCount}</td>
                        <td className="px-4 py-3.5 text-right text-slate-700 whitespace-nowrap tabular-nums">{formatInrShort(request.rate)}</td>
                        <td className="px-4 py-3.5 text-right font-semibold text-slate-900 whitespace-nowrap tabular-nums">{formatInr(request.amount)}</td>
                        <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">{formatDateTime(request.approvedAt)}</td>
                        <td className="px-4 sm:px-6 py-3.5"><RequestStatusBadge statusView={request.statusView} /></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {hiddenCount > 0 && (
          <p className="text-xs text-slate-500">
            Showing the oldest {requests.length} of {totals.requests} requests. Mark these as paid to see the rest.
          </p>
        )}
      </section>

      {/* Running total: scroll karte waqt bhi neeche dikhe */}
      {requests.length > 0 && (
        <div className="sticky bottom-0 z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{selected.length}</span> selected ·{' '}
            {cardsLabel(selectedCards)} ·{' '}
            <span className="font-bold text-slate-900 tabular-nums">{formatInr(selectedPaise / 100)}</span>
          </p>
          <button
            type="button"
            onClick={openModal}
            disabled={selected.length === 0}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BadgeIndianRupee className="h-4 w-4" /> Mark as Paid
          </button>
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800">Paid history</h2>
        {paymentsError && <ErrorMessage message={paymentsError} title="Couldn't load payments" />}
        <PaymentsTable payments={payments} loading={paymentsLoading} showCollege={false} onSelect={openPayment} />
        <StudentPagination pagination={toPaginationProps(paymentsPagination)} onPageChange={setPaymentsPage} itemLabel="payments" />
      </section>

      <MarkPaidModal
        open={modalOpen}
        requests={selected}
        collegeName={collegeName}
        loading={saving}
        error={saveError}
        onConfirm={confirmPaid}
        onCancel={() => setModalOpen(false)}
      />

      <PaymentDetailDrawer
        open={drawerOpen}
        payment={paymentDetail}
        requests={paymentDetailRequests}
        loading={paymentDetailLoading}
        error={paymentDetailError}
        onClose={closePayment}
      />
    </div>
  );
};

export default CommissionCollegeLedgerPage;

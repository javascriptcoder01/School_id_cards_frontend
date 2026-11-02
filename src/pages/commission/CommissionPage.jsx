// CommissionPage.jsx — Super Admin: rate per card (default + school), schools ka hisaab, rate history, payments
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { AlertTriangle, BadgeIndianRupee, CalendarClock, CheckCircle2, IndianRupee, RefreshCw } from 'lucide-react';
import {
  fetchRatesRequested,
  fetchRateHistoryRequested,
  fetchPaymentsRequested,
  fetchPaymentRequested,
  clearPaymentDetail,
  setGlobalRateRequested,
  setCollegeRateRequested,
  removeCollegeRateRequested,
  clearRateSaveError,
} from '../../features/commission/commissionSlice.js';
import {
  selectCommissionRates,
  selectCommissionRatesError,
  selectRateHistory,
  selectRateHistoryPagination,
  selectRateHistoryLoading,
  selectRateHistoryError,
  selectRateSaving,
  selectRateSaveError,
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
import {
  selectSuperAdminOverview,
  selectSuperAdminOverviewLoading,
  selectSuperAdminOverviewError,
} from '../../features/dashboard/dashboardOverviewSelectors.js';
import { getCommissionCollegeRoute } from '../../constants/routes.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import StudentPagination from '../../components/students/StudentPagination.jsx';
import DashboardStatCard from '../../components/dashboard/DashboardStatCard.jsx';
import RequestTabs from '../../components/printRequests/RequestTabs.jsx';
import ConfirmActionModal from '../../components/printRequests/ConfirmActionModal.jsx';
import SchoolRevenueTable from '../../components/commission/SchoolRevenueTable.jsx';
import RateHistoryTable from '../../components/commission/RateHistoryTable.jsx';
import PaymentsTable from '../../components/commission/PaymentsTable.jsx';
import PaymentDetailDrawer from '../../components/commission/PaymentDetailDrawer.jsx';
import SetRateModal from '../../components/commission/SetRateModal.jsx';
import { cardsLabel, toPaginationProps } from '../../utils/commissionForm.js';
import { formatInr, formatInrShort } from '../../utils/money.js';

const TABS = [
  { key: 'SCHOOLS', label: 'Schools' },
  { key: 'HISTORY', label: 'Rate history' },
  { key: 'PAYMENTS', label: 'Payments' },
];

const PAGE_SIZE = 10;
const AMOUNT_VALUE_CLASS = 'text-lg sm:text-2xl wrap-anywhere';
const selectClass =
  'px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 max-sm:w-full';

export const CommissionPage = () => {
  const dispatch = useDispatch();

  const overview = useSelector(selectSuperAdminOverview);
  const overviewLoading = useSelector(selectSuperAdminOverviewLoading);
  const overviewError = useSelector(selectSuperAdminOverviewError);
  const rates = useSelector(selectCommissionRates);
  const ratesError = useSelector(selectCommissionRatesError);
  const history = useSelector(selectRateHistory);
  const historyPagination = useSelector(selectRateHistoryPagination);
  const historyLoading = useSelector(selectRateHistoryLoading);
  const historyError = useSelector(selectRateHistoryError);
  const saving = useSelector(selectRateSaving);
  const saveError = useSelector(selectRateSaveError);
  const payments = useSelector(selectPayments);
  const paymentsPagination = useSelector(selectPaymentsPagination);
  const paymentsLoading = useSelector(selectPaymentsLoading);
  const paymentsError = useSelector(selectPaymentsError);
  const paymentDetail = useSelector(selectPaymentDetail);
  const paymentDetailRequests = useSelector(selectPaymentDetailRequests);
  const paymentDetailLoading = useSelector(selectPaymentDetailLoading);
  const paymentDetailError = useSelector(selectPaymentDetailError);

  const [activeTab, setActiveTab] = useState('SCHOOLS');
  const [rateModal, setRateModal] = useState(null); // { college } — college null = default rate
  const [removeTarget, setRemoveTarget] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyScope, setHistoryScope] = useState('');
  const [historyCollegeId, setHistoryCollegeId] = useState('');
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [paymentsCollegeId, setPaymentsCollegeId] = useState('');

  const loadOverview = () => {
    dispatch(fetchRatesRequested());
    dispatch(fetchSuperAdminOverviewRequested({ params: {} }));
  };

  useEffect(() => {
    dispatch(fetchRatesRequested());
    dispatch(fetchSuperAdminOverviewRequested({ params: {} }));
    return () => {
      dispatch(clearPaymentDetail());
    };
  }, [dispatch]);

  useEffect(() => {
    if (activeTab !== 'HISTORY') return;
    dispatch(fetchRateHistoryRequested({
      params: { page: historyPage, limit: PAGE_SIZE, scope: historyScope, collegeId: historyCollegeId },
    }));
  }, [dispatch, activeTab, historyPage, historyScope, historyCollegeId]);

  useEffect(() => {
    if (activeTab !== 'PAYMENTS') return;
    dispatch(fetchPaymentsRequested({
      params: { page: paymentsPage, limit: PAGE_SIZE, collegeId: paymentsCollegeId },
    }));
  }, [dispatch, activeTab, paymentsPage, paymentsCollegeId]);

  const rateInfoByCollege = useMemo(
    () => new Map((rates?.colleges || []).map((college) => [college.collegeId, college])),
    [rates]
  );
  const schoolOptions = rates?.colleges || [];

  const totals = overview?.totals;
  const isLoadingKpis = overviewLoading && !overview;
  const currentGlobal = overview?.rates?.global?.current || null;
  const lastGlobal = overview?.rates?.global?.last || null;

  const openRateModal = (college) => {
    dispatch(clearRateSaveError());
    setRateModal({ college });
  };

  const openPayment = (payment) => {
    dispatch(fetchPaymentRequested({ paymentId: payment.id }));
    setDrawerOpen(true);
  };

  const closePayment = () => {
    setDrawerOpen(false);
    dispatch(clearPaymentDetail());
  };

  const confirmRate = ({ rate, note }) => {
    const onSuccess = () => setRateModal(null);
    if (rateModal.college) {
      dispatch(setCollegeRateRequested({ collegeId: rateModal.college.collegeId, rate, note, onSuccess }));
    } else {
      dispatch(setGlobalRateRequested({ rate, note, onSuccess }));
    }
  };

  const openRemove = (college) => {
    dispatch(clearRateSaveError());
    setRemoveTarget(college);
  };

  const modalCollegeInfo = rateModal?.college ? rateInfoByCollege.get(rateModal.college.collegeId) : null;

  const renderRateActions = (college) => (
    <>
      <button
        type="button"
        onClick={() => openRateModal(college)}
        className="text-xs font-semibold text-indigo-700 hover:underline"
      >
        Set school rate
      </button>
      {college.rate?.scope === 'COLLEGE' && (
        <button
          type="button"
          onClick={() => openRemove(college)}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:underline"
        >
          Use default
        </button>
      )}
    </>
  );

  const renderAction = (college) => (
    <Link
      to={getCommissionCollegeRoute(college.collegeId)}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
    >
      <BadgeIndianRupee className="h-3.5 w-3.5 text-emerald-600" /> Collect payment
    </Link>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commission"
        description="Set the rate per ID card and record payments from schools."
        actions={
          <>
            <button
              type="button"
              onClick={() => openRateModal(null)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm"
            >
              <IndianRupee className="h-4 w-4" /> Set default rate
            </button>
            <button
              type="button"
              onClick={loadOverview}
              disabled={overviewLoading}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-xs"
              aria-label="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${overviewLoading ? 'animate-spin' : ''}`} />
            </button>
          </>
        }
      />

      {overview?.rates?.missingGlobalRate && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="alert">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <p>Set the default ID card rate — schools cannot approve requests until it is set.</p>
        </div>
      )}

      {overviewError && <ErrorMessage message={overviewError} title="Couldn't load the overview" />}
      {ratesError && <ErrorMessage message={ratesError} title="Couldn't load rates" />}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <DashboardStatCard
          title="Default rate"
          value={currentGlobal ? `${formatInrShort(currentGlobal.rate)} / card` : 'Not set'}
          subtitle={lastGlobal ? `Last: ${formatInrShort(lastGlobal.rate)} / card` : 'No earlier rate'}
          icon={IndianRupee}
          colorScheme="indigo"
          valueClassName={AMOUNT_VALUE_CLASS}
          isLoading={isLoadingKpis}
        />
        <DashboardStatCard
          title="Pending Payment"
          value={formatInr(totals?.pendingPayment?.amount ?? 0)}
          subtitle={cardsLabel(totals?.pendingPayment?.cards)}
          icon={BadgeIndianRupee}
          colorScheme="amber"
          valueClassName={AMOUNT_VALUE_CLASS}
          isLoading={isLoadingKpis}
        />
        <DashboardStatCard
          title="Paid"
          value={formatInr(totals?.paid?.amount ?? 0)}
          subtitle={cardsLabel(totals?.paid?.cards)}
          icon={CheckCircle2}
          colorScheme="emerald"
          valueClassName={AMOUNT_VALUE_CLASS}
          isLoading={isLoadingKpis}
        />
        <DashboardStatCard
          title="Upcoming (Est.)"
          value={formatInr(totals?.upcoming?.estimatedAmount)}
          subtitle={`${cardsLabel(totals?.upcoming?.cards)}${totals?.upcoming?.rateMissing ? ' · some schools have no rate' : ''}`}
          icon={CalendarClock}
          colorScheme="blue"
          valueClassName={AMOUNT_VALUE_CLASS}
          isLoading={isLoadingKpis}
        />
      </div>

      <RequestTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'SCHOOLS' && (
        <SchoolRevenueTable
          colleges={overview?.colleges || []}
          loading={overviewLoading}
          renderRateActions={renderRateActions}
          renderAction={renderAction}
        />
      )}

      {activeTab === 'HISTORY' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <select
              aria-label="Filter by rate type"
              value={historyScope}
              onChange={(e) => {
                setHistoryScope(e.target.value);
                setHistoryPage(1);
              }}
              className={selectClass}
            >
              <option value="">All rates</option>
              <option value="GLOBAL">Default rate</option>
              <option value="COLLEGE">School rates</option>
            </select>
            <select
              aria-label="Filter by school"
              value={historyCollegeId}
              onChange={(e) => {
                setHistoryCollegeId(e.target.value);
                setHistoryPage(1);
              }}
              className={selectClass}
            >
              <option value="">All schools</option>
              {schoolOptions.map((school) => (
                <option key={school.collegeId} value={school.collegeId}>{school.name}</option>
              ))}
            </select>
          </div>
          {historyError && <ErrorMessage message={historyError} title="Couldn't load rate history" />}
          <RateHistoryTable rates={history} loading={historyLoading} />
          <StudentPagination pagination={toPaginationProps(historyPagination)} onPageChange={setHistoryPage} itemLabel="rates" />
        </div>
      )}

      {activeTab === 'PAYMENTS' && (
        <div className="space-y-4">
          <select
            aria-label="Filter payments by school"
            value={paymentsCollegeId}
            onChange={(e) => {
              setPaymentsCollegeId(e.target.value);
              setPaymentsPage(1);
            }}
            className={selectClass}
          >
            <option value="">All schools</option>
            {schoolOptions.map((school) => (
              <option key={school.collegeId} value={school.collegeId}>{school.name}</option>
            ))}
          </select>
          {paymentsError && <ErrorMessage message={paymentsError} title="Couldn't load payments" />}
          <PaymentsTable payments={payments} loading={paymentsLoading} onSelect={openPayment} />
          <StudentPagination pagination={toPaginationProps(paymentsPagination)} onPageChange={setPaymentsPage} itemLabel="payments" />
        </div>
      )}

      <SetRateModal
        open={Boolean(rateModal)}
        title={rateModal?.college ? `Set school rate — ${rateModal.college.name}` : 'Set default rate'}
        description={rateModal?.college ? 'This school will use this rate instead of the default.' : 'Used by every school that has no rate of its own.'}
        currentRate={rateModal?.college ? (modalCollegeInfo?.effective?.rate ?? null) : (currentGlobal?.rate ?? null)}
        lastRate={rateModal?.college ? (modalCollegeInfo?.last?.rate ?? null) : (lastGlobal?.rate ?? null)}
        loading={saving}
        error={saveError}
        onConfirm={confirmRate}
        onCancel={() => setRateModal(null)}
      />

      <ConfirmActionModal
        open={Boolean(removeTarget)}
        title={removeTarget ? `Use the default rate for ${removeTarget.name}?` : ''}
        message={saveError || 'New requests will use the default rate. Requests already approved keep their locked amount.'}
        confirmLabel="Use default rate"
        loading={saving}
        onConfirm={() => dispatch(removeCollegeRateRequested({
          collegeId: removeTarget.collegeId,
          onSuccess: () => setRemoveTarget(null),
        }))}
        onCancel={() => setRemoveTarget(null)}
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

export default CommissionPage;

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BadgeIndianRupee, CalendarClock, CheckCircle2, IndianRupee, Info, Printer, RefreshCw } from 'lucide-react';
import DashboardSection from '../../components/dashboard/DashboardSection.jsx';
import QuickActions from '../../components/dashboard/QuickActions.jsx';
import GenerationStatusSummary from '../../components/dashboard/GenerationStatusSummary.jsx';
import CollegeProgressOverview from '../../components/dashboard/CollegeProgressOverview.jsx';
import OperatorProgressTable from '../../components/dashboard/OperatorProgressTable.jsx';
import { loadCollegeProgressRequested } from '../../features/collegeProgress/collegeProgressSlice.js';
import {
  selectCollegeProgressSummary,
  selectCollegeProgressOperators,
  selectCollegeProgressLoading,
} from '../../features/collegeProgress/collegeProgressSelectors.js';
import DashboardStatCard from '../../components/dashboard/DashboardStatCard.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import UpcomingByClassTable from '../../components/commission/UpcomingByClassTable.jsx';
import RecentPaymentsList from '../../components/commission/RecentPaymentsList.jsx';
import { fetchCollegeAdminOverviewRequested } from '../../features/dashboard/dashboardOverviewSlice.js';
import {
  selectCollegeAdminOverview,
  selectCollegeAdminOverviewLoading,
  selectCollegeAdminOverviewError,
} from '../../features/dashboard/dashboardOverviewSelectors.js';
import { cardsLabel } from '../../utils/commissionForm.js';
import { formatDateTime } from '../../utils/idCardFormat.js';
import { formatInr, formatInrShort } from '../../utils/money.js';

const AMOUNT_VALUE_CLASS = 'text-lg sm:text-2xl wrap-anywhere';

export const CollegeAdminDashboard = ({
  user,
  summary: fallbackSummary,
  generationStats,
  isLoading: isDashboardLoading,
}) => {
  const dispatch = useDispatch();

  const progressSummary = useSelector(selectCollegeProgressSummary);
  const operators = useSelector(selectCollegeProgressOperators);
  const isProgressLoading = useSelector(selectCollegeProgressLoading);
  const overview = useSelector(selectCollegeAdminOverview);
  const isOverviewLoading = useSelector(selectCollegeAdminOverviewLoading);
  const overviewError = useSelector(selectCollegeAdminOverviewError);

  useEffect(() => {
    dispatch(loadCollegeProgressRequested());
    dispatch(fetchCollegeAdminOverviewRequested());
  }, [dispatch]);

  const handleRefreshProgress = () => {
    if (!isProgressLoading) {
      dispatch(loadCollegeProgressRequested());
      dispatch(fetchCollegeAdminOverviewRequested());
    }
  };

  const activeSummary = Object.keys(progressSummary).length > 0 ? progressSummary : fallbackSummary;

  const isKpiLoading = isOverviewLoading && !overview;
  const currentRate = overview?.rate?.current || null;
  const lastRate = overview?.rate?.last || null;
  const rateScopeLabel = overview?.rate?.scope === 'COLLEGE' ? 'School rate' : 'Default';

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rounded-full blur-xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-3">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              College Administrator Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {user?.name || 'College Admin'}
            </h1>
            <p className="text-indigo-200 text-sm mt-1">
              Real-time progress tracking, class operator assignments, and batch ID generation
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRefreshProgress}
              disabled={isProgressLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold backdrop-blur-md transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProgressLoading ? 'animate-spin text-indigo-300' : ''}`} />
              <span>{isProgressLoading ? 'Updating...' : 'Refresh Progress'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rate, amount, payment (sirf apna school) */}
      <DashboardSection
        title="ID Card Payments"
        subtitle="Amounts lock when you approve a request. Requests waiting for approval are estimated at today's rate."
      >
        {overviewError && <ErrorMessage message={overviewError} title="Couldn't load the payment overview" />}

        {overview && !currentRate && (
          <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900" role="status">
            <Info className="h-5 w-5 shrink-0 text-blue-600" />
            <p>Rate not set by Super Admin yet. Requests cannot be approved until it is set.</p>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          <DashboardStatCard
            title="Upcoming (Est.)"
            value={formatInr(overview?.upcoming?.estimatedAmount)}
            subtitle={cardsLabel(overview?.upcoming?.cards)}
            icon={CalendarClock}
            colorScheme="blue"
            valueClassName={AMOUNT_VALUE_CLASS}
            isLoading={isKpiLoading}
          />
          <DashboardStatCard
            title="Pending Payment"
            value={formatInr(overview?.pendingPayment?.amount ?? 0)}
            subtitle={cardsLabel(overview?.pendingPayment?.cards)}
            icon={BadgeIndianRupee}
            colorScheme="amber"
            valueClassName={AMOUNT_VALUE_CLASS}
            isLoading={isKpiLoading}
          />
          <DashboardStatCard
            title="Total Paid"
            value={formatInr(overview?.paid?.amount ?? 0)}
            subtitle={overview?.lastPayment
              ? `${cardsLabel(overview.paid.cards)} · last ${formatDateTime(overview.lastPayment.paidAt)}`
              : cardsLabel(overview?.paid?.cards)}
            icon={CheckCircle2}
            colorScheme="emerald"
            valueClassName={AMOUNT_VALUE_CLASS}
            isLoading={isKpiLoading}
          />
          <DashboardStatCard
            title="Printed"
            value={overview?.printed?.cards ?? 0}
            subtitle="cards completed"
            icon={Printer}
            colorScheme="purple"
            valueClassName={AMOUNT_VALUE_CLASS}
            isLoading={isKpiLoading}
          />
          <DashboardStatCard
            title="Current rate"
            value={currentRate ? `${formatInrShort(currentRate.rate)} / card` : 'Not set'}
            subtitle={currentRate
              ? `${rateScopeLabel}${lastRate ? ` · Last: ${formatInrShort(lastRate.rate)}` : ''}`
              : 'Ask the Super Admin'}
            icon={IndianRupee}
            colorScheme="indigo"
            valueClassName={AMOUNT_VALUE_CLASS}
            isLoading={isKpiLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <div className="lg:col-span-2 min-w-0 space-y-2">
            <h3 className="text-sm font-bold text-slate-800">Upcoming by class</h3>
            <UpcomingByClassTable
              rows={overview?.upcomingByClass || []}
              total={overview?.upcoming || null}
              rate={currentRate?.rate ?? null}
              loading={isKpiLoading}
            />
          </div>
          <div className="min-w-0 space-y-2">
            <h3 className="text-sm font-bold text-slate-800">Recent payments</h3>
            <RecentPaymentsList payments={overview?.recentPayments || []} />
          </div>
        </div>
      </DashboardSection>

      {/* College Progress Overview Grid */}
      <DashboardSection
        title="College Progress & Operational Insights"
        subtitle="Real-time aggregation of student data completion and ID card generation across your institution"
      >
        <CollegeProgressOverview
          summary={activeSummary}
          isLoading={isProgressLoading || isDashboardLoading}
        />
      </DashboardSection>

      {/* Operator and Class Breakdown Table */}
      <DashboardSection
        title="Class Roster & Operator Progress"
        subtitle="Detailed status breakdown per assigned class teacher and section"
      >
        <OperatorProgressTable operators={operators} isLoading={isProgressLoading} />
      </DashboardSection>

      {/* Quick Actions */}
      <DashboardSection
        title="College Quick Actions"
        subtitle="Common tasks for enrollment and ID card issuing"
      >
        <QuickActions role="COLLEGE_ADMIN" />
      </DashboardSection>

      {/* Generation Status Pipeline Summary */}
      <DashboardSection
        title="ID Card Generation Lifecycle"
        subtitle="Current status breakdown across all student card jobs"
      >
        <GenerationStatusSummary generationStats={generationStats} />
      </DashboardSection>
    </div>
  );
};

export default CollegeAdminDashboard;

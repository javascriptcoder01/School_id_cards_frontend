import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BadgeIndianRupee,
  CalendarClock,
  CheckCircle2,
  IndianRupee,
  History,
  Printer,
  RefreshCw,
  AlertTriangle,
  Layers,
  Receipt,
  TrendingUp,
  Users,
  Zap,
  Sparkles,
} from 'lucide-react';
import QuickActions from '../../components/dashboard/QuickActions.jsx';
import GenerationStatusSummary from '../../components/dashboard/GenerationStatusSummary.jsx';
import CollegeProgressOverview from '../../components/dashboard/CollegeProgressOverview.jsx';
import OperatorProgressTable from '../../components/dashboard/OperatorProgressTable.jsx';
import {
  usePersistedToggle,
  DashboardHero,
  HeroStat,
  MoneyCard,
  Panel,
  Collapsible,
} from './CollegeDashboard.jsx';
import { loadCollegeProgressRequested } from '../../features/collegeProgress/collegeProgressSlice.js';
import {
  selectCollegeProgressSummary,
  selectCollegeProgressOperators,
  selectCollegeProgressLoading,
} from '../../features/collegeProgress/collegeProgressSelectors.js';
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

const STORAGE_KEYS = {
  upcomingByClass: 'collegeAdminDashboard.showUpcomingByClass',
  recentPayments: 'collegeAdminDashboard.showRecentPayments',
  progress: 'collegeAdminDashboard.showProgress',
  operators: 'collegeAdminDashboard.showOperators',
  generation: 'collegeAdminDashboard.showGeneration',
};

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

  const [showUpcoming, toggleUpcoming] = usePersistedToggle(STORAGE_KEYS.upcomingByClass);
  const [showPayments, togglePayments] = usePersistedToggle(STORAGE_KEYS.recentPayments);
  const [showProgress, toggleProgress] = usePersistedToggle(STORAGE_KEYS.progress);
  const [showOperators, toggleOperators] = usePersistedToggle(STORAGE_KEYS.operators);
  const [showGeneration, toggleGeneration] = usePersistedToggle(STORAGE_KEYS.generation, false);

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

  const activeSummary = Object.keys(progressSummary || {}).length > 0 ? progressSummary : fallbackSummary;

  const isKpiLoading = isOverviewLoading && !overview;
  const currentRate = overview?.rate?.current || null;
  const lastRate = overview?.rate?.last || null;
  const rateScopeLabel = overview?.rate?.scope === 'COLLEGE' ? 'School rate' : 'Default rate';

  const upcomingRows = overview?.upcomingByClass || [];
  const recentPayments = overview?.recentPayments || [];
  const operatorList = Array.isArray(operators) ? operators : [];

  return (
    <div className="space-y-5">
      {/* Hero */}
      <DashboardHero
        eyebrow="School Admin"
        title={`Welcome back, ${user?.name || 'School Admin'}`}
        aside={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="grid grid-cols-3 gap-2">
              <HeroStat
                icon={IndianRupee}
                label={currentRate ? rateScopeLabel : 'Rate'}
                value={currentRate ? `${formatInrShort(currentRate.rate)}/card` : 'Not set'}
                loading={isKpiLoading}
              />
              <HeroStat
                icon={History}
                label="Last rate"
                value={lastRate ? formatInrShort(lastRate.rate) : '—'}
                loading={isKpiLoading}
              />
              <HeroStat icon={Printer} label="Printed" value={overview?.printed?.cards ?? 0} loading={isKpiLoading} />
            </div>

            <button
              type="button"
              onClick={handleRefreshProgress}
              disabled={isProgressLoading}
              aria-label="Refresh"
              className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white ring-1 ring-white/20 backdrop-blur-sm transition-colors hover:bg-white/20 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white disabled:cursor-wait disabled:opacity-70 sm:self-center"
            >
              <RefreshCw className={`h-4 w-4 ${isProgressLoading ? 'animate-spin motion-reduce:animate-none' : ''}`} />
              <span>{isProgressLoading ? 'Updating…' : 'Refresh'}</span>
            </button>
          </div>
        }
      />

      {/* Payments */}
      <Panel title="ID Card Payments" icon={BadgeIndianRupee}>
        {overviewError && (
          <div className="mb-4">
            <ErrorMessage message={overviewError} title="Couldn't load payments" />
          </div>
        )}

        {overview && !currentRate && (
          <div
            className="mb-4 flex items-center gap-2.5 rounded-2xl border border-amber-200 bg-linear-to-r from-amber-50 to-orange-50 px-4 py-3 text-sm font-medium text-amber-900"
            role="status"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
            Rate not set by Super Admin yet — requests can't be approved.
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <MoneyCard
            icon={CalendarClock}
            title="Upcoming (Est.)"
            value={formatInr(overview?.upcoming?.estimatedAmount)}
            subtitle={cardsLabel(overview?.upcoming?.cards)}
            tone="blue"
            loading={isKpiLoading}
          />
          <MoneyCard
            icon={BadgeIndianRupee}
            title="Pending Payment"
            value={formatInr(overview?.pendingPayment?.amount ?? 0)}
            subtitle={cardsLabel(overview?.pendingPayment?.cards)}
            tone="amber"
            loading={isKpiLoading}
          />
          <MoneyCard
            icon={CheckCircle2}
            title="Total Paid"
            value={formatInr(overview?.paid?.amount ?? 0)}
            subtitle={cardsLabel(overview?.paid?.cards)}
            tone="emerald"
            loading={isKpiLoading}
            badge={
              overview?.lastPayment ? (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold">
                  Last {formatDateTime(overview.lastPayment.paidAt)}
                </span>
              ) : null
            }
          />
        </div>

        <div className="mt-4 space-y-3">
          <Collapsible
            id="upcoming-by-class"
            icon={Layers}
            title="Upcoming by class"
            count={upcomingRows.length}
            open={showUpcoming}
            onToggle={toggleUpcoming}
          >
            <UpcomingByClassTable
              rows={upcomingRows}
              total={overview?.upcoming || null}
              rate={currentRate?.rate ?? null}
              loading={isKpiLoading}
            />
          </Collapsible>

          <Collapsible
            id="recent-payments"
            icon={Receipt}
            title="Recent payments"
            count={recentPayments.length}
            open={showPayments}
            onToggle={togglePayments}
          >
            <RecentPaymentsList payments={recentPayments} />
          </Collapsible>
        </div>
      </Panel>

      {/* Progress */}
      <Collapsible
        id="school-progress"
        icon={TrendingUp}
        title="School progress"
        open={showProgress}
        onToggle={toggleProgress}
      >
        <CollegeProgressOverview summary={activeSummary} isLoading={isProgressLoading || isDashboardLoading} />
      </Collapsible>

      {/* Class teachers */}
      <Collapsible
        id="class-teachers"
        icon={Users}
        title="Classes & class teachers"
        count={operatorList.length}
        open={showOperators}
        onToggle={toggleOperators}
      >
        <OperatorProgressTable operators={operators} isLoading={isProgressLoading} />
      </Collapsible>

      {/* Quick actions */}
      <Panel title="Quick Actions" icon={Zap}>
        <QuickActions role="COLLEGE_ADMIN" />
      </Panel>

      {/* Card generation */}
      <Collapsible
        id="card-generation"
        icon={Sparkles}
        title="Card generation status"
        open={showGeneration}
        onToggle={toggleGeneration}
      >
        <GenerationStatusSummary generationStats={generationStats} />
      </Collapsible>
    </div>
  );
};

export default CollegeAdminDashboard;
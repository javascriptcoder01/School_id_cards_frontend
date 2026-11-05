import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  School,
  Users,
  CreditCard,
  Printer,
  ArrowRight,
  GraduationCap,
  UserCheck,
  CalendarClock,
  BadgeIndianRupee,
  CheckCircle2,
  Inbox,
  PackageCheck,
  AlertTriangle,
  Zap,
  Activity,
} from 'lucide-react';
import QuickActions from '../../components/dashboard/QuickActions.jsx';
import {
  usePersistedToggle,
  DashboardHero,
  HeroStat,
  MoneyCard,
  MiniStat,
  Panel,
  Collapsible,
} from './CollegeDashboard.jsx';
import RecentActivity from '../../components/dashboard/RecentActivity.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import DateRangeFilter from '../../components/commission/DateRangeFilter.jsx';
import SchoolRevenueTable from '../../components/commission/SchoolRevenueTable.jsx';
import { ROUTES, getCommissionCollegeRoute } from '../../constants/routes.js';
import { fetchSummaryRequested } from '../../features/printRequestWorkflow/printRequestWorkflowSlice.js';
import {
  selectPrintRequestCounts,
  selectPrintRequestCardCounts,
  selectPrintRequestSummaryLoading,
} from '../../features/printRequestWorkflow/printRequestWorkflowSelectors.js';
import { fetchSuperAdminOverviewRequested } from '../../features/dashboard/dashboardOverviewSlice.js';
import {
  selectSuperAdminOverview,
  selectSuperAdminOverviewLoading,
  selectSuperAdminOverviewError,
} from '../../features/dashboard/dashboardOverviewSelectors.js';
import { cardsLabel, toDateRangeParams } from '../../utils/commissionForm.js';
import { formatInr } from '../../utils/money.js';

const REVENUE_TABLE_STORAGE_KEY = 'superAdminDashboard.showSchoolRevenue';
const ACTIVITY_STORAGE_KEY = 'superAdminDashboard.showRecentActivity';

export const SuperAdminDashboard = ({
  user,
  summary,
  activity,
  isLoading,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const printCounts = useSelector(selectPrintRequestCounts);
  const printCardCounts = useSelector(selectPrintRequestCardCounts);
  const isPrintLoading = useSelector(selectPrintRequestSummaryLoading);
  const overview = useSelector(selectSuperAdminOverview);
  const isOverviewLoading = useSelector(selectSuperAdminOverviewLoading);
  const overviewError = useSelector(selectSuperAdminOverviewError);

  const [dateFilter, setDateFilter] = useState({ preset: 'ALL_TIME', customFrom: '', customTo: '' });
  const dateParams = useMemo(() => toDateRangeParams(dateFilter), [dateFilter]);
  const [showRevenueTable, toggleRevenueTable] = usePersistedToggle(REVENUE_TABLE_STORAGE_KEY);
  const [showActivity, toggleActivity] = usePersistedToggle(ACTIVITY_STORAGE_KEY);

  // Print Center summary (sabhi schools)
  useEffect(() => {
    dispatch(fetchSummaryRequested({ params: {} }));
  }, [dispatch]);

  // Commission overview: date badalne par dobara
  useEffect(() => {
    dispatch(fetchSuperAdminOverviewRequested({ params: dateParams }));
  }, [dispatch, dateParams]);

  const totals = overview?.totals;
  const colleges = overview?.colleges || [];
  const isKpiLoading = isOverviewLoading && !overview;

  const schoolsCount = totals?.schools ?? summary?.totalColleges ?? 0;
  const totalUsers = summary?.totalUsers ?? 0;
  const totalTemplates = summary?.totalTemplates ?? 0;

  return (
    <div className="space-y-5">
      {/* Hero */}
      <DashboardHero
        eyebrow="Super Admin"
        title={`Welcome back, ${user?.name || 'Super Admin'}`}
        aside={
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:w-auto">
            <HeroStat icon={School} label="Schools" value={schoolsCount} loading={isKpiLoading && isLoading} />
            <HeroStat icon={UserCheck} label="Operators" value={totals?.operators ?? 0} loading={isKpiLoading} />
            <HeroStat icon={GraduationCap} label="Students" value={totals?.students ?? 0} loading={isKpiLoading} />
            <HeroStat icon={Users} label="Users" value={totalUsers} loading={isLoading} />
            <HeroStat icon={CreditCard} label="Templates" value={totalTemplates} loading={isLoading} />
          </div>
        }
      />

      {/* Revenue */}
      <Panel
        title="Revenue"
        icon={BadgeIndianRupee}
        action={<DateRangeFilter value={dateFilter} onChange={setDateFilter} />}
      >
        {overviewError && (
          <div className="mb-4">
            <ErrorMessage message={overviewError} title="Couldn't load revenue" />
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <MoneyCard
            icon={CalendarClock}
            title="Upcoming (Est.)"
            value={formatInr(totals?.upcoming?.estimatedAmount)}
            subtitle={cardsLabel(totals?.upcoming?.cards)}
            tone="blue"
            loading={isKpiLoading}
            badge={
              totals?.upcoming?.rateMissing ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold">
                  <AlertTriangle className="h-3 w-3" /> Rate missing
                </span>
              ) : null
            }
          />
          <MoneyCard
            icon={BadgeIndianRupee}
            title="Pending Payment"
            value={formatInr(totals?.pendingPayment?.amount ?? 0)}
            subtitle={cardsLabel(totals?.pendingPayment?.cards)}
            tone="amber"
            loading={isKpiLoading}
          />
          <MoneyCard
            icon={CheckCircle2}
            title="Total Paid"
            value={formatInr(totals?.paid?.amount ?? 0)}
            subtitle={cardsLabel(totals?.paid?.cards)}
            tone="emerald"
            loading={isKpiLoading}
          />
        </div>

        {/* School-wise revenue: show / hide */}
        <div className="mt-4">
          <Collapsible
            id="school-revenue-list"
            icon={School}
            title="School-wise revenue"
            count={colleges.length}
            open={showRevenueTable}
            onToggle={toggleRevenueTable}
          >
            <SchoolRevenueTable
              colleges={colleges}
              loading={isOverviewLoading}
              onRowClick={(college) => navigate(getCommissionCollegeRoute(college.collegeId))}
            />
          </Collapsible>
        </div>
      </Panel>

      {/* Print Center */}
      <Panel
        title="Print Center"
        icon={Printer}
        action={
          <button
            type="button"
            onClick={() => navigate(ROUTES.PRINT_CENTER)}
            className="group inline-flex items-center gap-1.5 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/25 transition-all hover:shadow-lg focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            Open
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
          </button>
        }
      >
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MiniStat icon={Inbox} label="New requests" value={printCounts.APPROVED || 0} tone="indigo" loading={isPrintLoading} />
          <MiniStat icon={Printer} label="Cards in print" value={printCardCounts.PRINTING || 0} tone="violet" loading={isPrintLoading} />
          <MiniStat icon={PackageCheck} label="Cards printed" value={totals?.printed?.cards ?? 0} tone="emerald" loading={isKpiLoading} />
          <MiniStat icon={CheckCircle2} label="Completed requests" value={printCounts.COMPLETED || 0} tone="sky" loading={isPrintLoading} />
        </div>
      </Panel>

      {/* Quick actions */}
      <Panel title="Quick Actions" icon={Zap}>
        <QuickActions role="SUPER_ADMIN" />
      </Panel>

      {/* Recent activity: full width, show / hide */}
      <Collapsible
        id="recent-activity-list"
        icon={Activity}
        title="Recent Activity"
        count={Array.isArray(activity) ? activity.length : undefined}
        open={showActivity}
        onToggle={toggleActivity}
      >
        <RecentActivity activity={activity} />
      </Collapsible>
    </div>
  );
};

export default SuperAdminDashboard;
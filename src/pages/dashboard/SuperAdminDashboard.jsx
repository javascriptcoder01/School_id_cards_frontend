import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { School, Users, CreditCard, ShieldCheck, Printer, Sparkles, ArrowRight } from 'lucide-react';
import DashboardStatCard from '../../components/dashboard/DashboardStatCard.jsx';
import DashboardSection from '../../components/dashboard/DashboardSection.jsx';
import QuickActions from '../../components/dashboard/QuickActions.jsx';
import RecentActivity from '../../components/dashboard/RecentActivity.jsx';
import { ROUTES } from '../../constants/routes.js';
import { fetchSummaryRequested } from '../../features/printRequestWorkflow/printRequestWorkflowSlice.js';
import {
  selectPrintRequestCounts,
  selectPrintRequestCardCounts,
  selectPrintRequestSummaryLoading,
} from '../../features/printRequestWorkflow/printRequestWorkflowSelectors.js';

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

  // Print Center summary (sabhi schools)
  useEffect(() => {
    dispatch(fetchSummaryRequested({ params: {} }));
  }, [dispatch]);

  const totalColleges = summary?.totalColleges ?? 0;
  const totalUsers = summary?.totalUsers ?? 0;
  const totalTemplates = summary?.totalTemplates ?? 0;


  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rounded-full blur-xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Super Administrator Control Plane
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {user?.name || 'Super Admin'}
            </h1>
            <p className="text-indigo-200 text-sm mt-1">
              System-wide multi-tenant governance, college provisioning, and central ID card print management
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10 text-right">
            <span className="text-[11px] text-indigo-200 uppercase font-semibold tracking-wider block">Scope</span>
            <span className="text-base font-extrabold text-white tracking-wide">
              Global Platform
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardStatCard
          title="Affiliated Colleges"
          value={totalColleges}
          icon={School}
          subtitle="Active educational institutions"
          colorScheme="indigo"
          isLoading={isLoading}
        />
        <DashboardStatCard
          title="Provisioned Users"
          value={totalUsers}
          icon={Users}
          subtitle="Administrators & operators"
          colorScheme="purple"
          isLoading={isLoading}
        />
        <DashboardStatCard
          title="ID Card Templates"
          value={totalTemplates}
          icon={CreditCard}
          subtitle="System template layouts"
          colorScheme="emerald"
          isLoading={isLoading}
        />
      </div>

      {/* Central ID Card Print Management Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Central ID Card Print Management</h2>
              <p className="text-xs text-slate-500">
                Accept approved print requests from schools, download print files, and mark them done.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(ROUTES.PRINT_CENTER)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <span>Open Print Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-slate-50/75 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">New Requests</span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">
              {isPrintLoading ? '...' : printCounts.APPROVED || 0}
            </span>
          </div>
          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Cards in Printing</span>
            <span className="text-xl font-extrabold text-emerald-700 mt-1 block">
              {isPrintLoading ? '...' : printCardCounts.PRINTING || 0}
            </span>
          </div>
          <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
            <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">Completed Requests</span>
            <span className="text-xl font-extrabold text-purple-700 mt-1 block">
              {isPrintLoading ? '...' : printCounts.COMPLETED || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <DashboardSection
        title="Administrative Quick Actions"
        subtitle="Frequently used institution and account management tasks"
      >
        <QuickActions role="SUPER_ADMIN" />
      </DashboardSection>

      {/* Recent Activity */}
      <DashboardSection
        title="Platform Audit & Recent Activity"
        subtitle="Latest college onboardings and administrator registrations"
      >
        <RecentActivity activity={activity} />
      </DashboardSection>
    </div>
  );
};

export default SuperAdminDashboard;

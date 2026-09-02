import React from 'react';
import { School, Users, CreditCard, ShieldCheck } from 'lucide-react';
import DashboardStatCard from '../../components/dashboard/DashboardStatCard.jsx';
import DashboardSection from '../../components/dashboard/DashboardSection.jsx';
import QuickActions from '../../components/dashboard/QuickActions.jsx';
import RecentActivity from '../../components/dashboard/RecentActivity.jsx';

export const SuperAdminDashboard = ({
  user,
  summary,
  activity,
  isLoading,
}) => {
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
              System-wide multi-tenant governance, college provisioning, and administrative analytics
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


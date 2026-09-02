import React from 'react';
import { GraduationCap, CreditCard, Sparkles, CheckCircle2 } from 'lucide-react';
import DashboardStatCard from '../../components/dashboard/DashboardStatCard.jsx';
import DashboardSection from '../../components/dashboard/DashboardSection.jsx';
import QuickActions from '../../components/dashboard/QuickActions.jsx';
import GenerationStatusSummary from '../../components/dashboard/GenerationStatusSummary.jsx';

export const CollegeAdminDashboard = ({
  user,
  summary,
  generationStats,
  isLoading,
}) => {
  const totalStudents = summary?.totalStudents ?? 0;
  const totalTemplates = summary?.totalTemplates ?? 0;
  const totalGenerations = summary?.totalGenerations ?? 0;
  const completedGenerations = summary?.completedGenerations ?? 0;

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
              Student roster management, ID card design layouts, and generation job tracking
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10 text-right">
            <span className="text-[11px] text-indigo-200 uppercase font-semibold tracking-wider block">Assigned College</span>
            <span className="text-base font-extrabold text-white tracking-wide">
              {user?.collegeId ? `College #${String(user.collegeId).slice(-6)}` : 'Institutional Workspace'}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatCard
          title="Total Students"
          value={totalStudents}
          icon={GraduationCap}
          subtitle="Enrolled student records"
          colorScheme="indigo"
          isLoading={isLoading}
        />
        <DashboardStatCard
          title="ID Card Templates"
          value={totalTemplates}
          icon={CreditCard}
          subtitle="Configured card layouts"
          colorScheme="purple"
          isLoading={isLoading}
        />
        <DashboardStatCard
          title="Generation Jobs"
          value={totalGenerations}
          icon={Sparkles}
          subtitle="Total card printing batches"
          colorScheme="blue"
          isLoading={isLoading}
        />
        <DashboardStatCard
          title="Completed Jobs"
          value={completedGenerations}
          icon={CheckCircle2}
          subtitle="Finished card exports"
          colorScheme="emerald"
          isLoading={isLoading}
        />
      </div>

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


import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import DashboardSection from '../../components/dashboard/DashboardSection.jsx';
import QuickActions from '../../components/dashboard/QuickActions.jsx';
import GenerationStatusSummary from '../../components/dashboard/GenerationStatusSummary.jsx';
import CollegeProgressOverview from '../../components/dashboard/CollegeProgressOverview.jsx';
import OperatorClassProgressTable from '../../components/dashboard/OperatorClassProgressTable.jsx';
import { loadCollegeProgressRequested } from '../../features/collegeProgress/collegeProgressSlice.js';
import {
  selectCollegeProgressSummary,
  selectCollegeProgressOperators,
  selectCollegeProgressLoading,
  selectCollegeProgressError,
} from '../../features/collegeProgress/collegeProgressSelectors.js';

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
  const progressError = useSelector(selectCollegeProgressError);

  useEffect(() => {
    dispatch(loadCollegeProgressRequested());
  }, [dispatch]);

  const handleRefreshProgress = () => {
    if (!isProgressLoading) {
      dispatch(loadCollegeProgressRequested());
    }
  };

  const activeSummary = Object.keys(progressSummary).length > 0 ? progressSummary : fallbackSummary;

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
        <OperatorClassProgressTable operators={operators} />
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

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RefreshCw, LayoutDashboard } from 'lucide-react';
import { selectCurrentUser, selectUserRole } from '../../features/auth/authSelectors.js';
import {
  loadDashboardRequested,
  refreshDashboardRequested,
  clearDashboard,
} from '../../features/dashboard/dashboardSlice.js';
import {
  selectDashboardSummary,
  selectDashboardActivity,
  selectGenerationStats,
  selectDashboardLoading,
  selectDashboardError,
  selectIsDashboardInitialized,
} from '../../features/dashboard/dashboardSelectors.js';
import SuperAdminDashboard from './SuperAdminDashboard.jsx';
import CollegeAdminDashboard from './CollegeAdminDashboard.jsx';
import OperatorDashboard from './OperatorDashboard.jsx';
import DashboardLoader from '../../components/dashboard/DashboardLoader.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';

export const DashboardPage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const role = useSelector(selectUserRole);

  const summary = useSelector(selectDashboardSummary);
  const activity = useSelector(selectDashboardActivity);
  const generationStats = useSelector(selectGenerationStats);
  const isLoading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);
  const isInitialized = useSelector(selectIsDashboardInitialized);

  useEffect(() => {
    if (role) {
      dispatch(loadDashboardRequested(role));
    }

    return () => {
      dispatch(clearDashboard());
    };
  }, [dispatch, role]);

  const handleRefresh = () => {
    if (isLoading || !role) return;
    dispatch(refreshDashboardRequested(role));
  };

  if (isLoading && !isInitialized) {
    return <DashboardLoader message="Aggregating dashboard analytics..." />;
  }

  if (error && !isInitialized) {
    return (
      <div className="space-y-6">
        <ErrorMessage
          message={error}
          title="Dashboard Analytics Error"
          onDismiss={() => dispatch(clearDashboard())}
        />
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => role && dispatch(loadDashboardRequested(role))}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Retry Loading Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
          <LayoutDashboard className="w-4 h-4 text-indigo-600" />
          <span>Operational Insights & System Health</span>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs"
          title="Refresh Dashboard Data"
          aria-label="Refresh Dashboard"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
          <span>{isLoading ? 'Refreshing...' : 'Refresh Analytics'}</span>
        </button>
      </div>

      {role === 'SUPER_ADMIN' && (
        <SuperAdminDashboard
          user={user}
          summary={summary}
          activity={activity}
          isLoading={isLoading}
        />
      )}

      {role === 'COLLEGE_ADMIN' && (
        <CollegeAdminDashboard
          user={user}
          summary={summary}
          generationStats={generationStats}
          isLoading={isLoading}
        />
      )}

      {role !== 'SUPER_ADMIN' && role !== 'COLLEGE_ADMIN' && (
        <OperatorDashboard
          user={user}
          summary={summary}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default DashboardPage;

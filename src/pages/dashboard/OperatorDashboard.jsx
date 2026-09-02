import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  CreditCard,
  Eye,
  Upload,
  User,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { loadOperatorDashboardRequested } from '../../features/operator/operatorSlice.js';
import {
  selectOperatorDashboard,
  selectOperatorLoading,
  selectOperatorError,
} from '../../features/operator/operatorSelectors.js';
import DashboardStatCard from '../../components/dashboard/DashboardStatCard.jsx';
import DashboardSection from '../../components/dashboard/DashboardSection.jsx';
import QuickActions from '../../components/dashboard/QuickActions.jsx';
import OperatorScopeBadge from '../../components/operator/OperatorScopeBadge.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';

export const OperatorDashboard = ({ user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const dashboard = useSelector(selectOperatorDashboard);
  const isLoading = useSelector(selectOperatorLoading);
  const error = useSelector(selectOperatorError);

  useEffect(() => {
    dispatch(loadOperatorDashboardRequested());
  }, [dispatch]);

  const handleRefresh = () => {
    if (!isLoading) {
      dispatch(loadOperatorDashboardRequested());
    }
  };

  const summary = dashboard?.summary || {};
  const assignments = dashboard?.assignments || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              Operator Operational Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome, {user?.name || 'Operator'}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage student records, photos, ID card proofs, and generation jobs for your assigned classes.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold backdrop-blur-md transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-300' : ''}`} />
            <span>{isLoading ? 'Updating...' : 'Refresh Metrics'}</span>
          </button>
        </div>
      </div>

      {error && (
        <ErrorState
          title="Dashboard Error"
          message={error}
          onRetry={handleRefresh}
        />
      )}

      {/* Scope Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Your Assigned Scope ({assignments.length} Classes/Sections)
          </span>
        </div>
        {assignments.length === 0 ? (
          <p className="text-xs text-slate-400 font-medium italic">
            No active class assignments found. Please contact your college administrator to assign you to a class roster.
          </p>
        ) : (
          <div className="flex items-center gap-2.5 flex-wrap">
            {assignments.map((asgn, idx) => (
              <OperatorScopeBadge
                key={asgn.id || asgn._id || idx}
                className={asgn.className}
                section={asgn.section}
              />
            ))}
          </div>
        )}
      </div>

      {/* Operational Status Summary KPI Grid */}
      <DashboardSection
        title="Operational Status"
        subtitle="Real-time aggregation of student roster and ID card readiness across assigned classes"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DashboardStatCard
            title="Total Assigned Students"
            value={summary.totalStudents ?? 0}
            icon={Users}
            subtitle="Students across your classes"
            colorScheme="indigo"
            isLoading={isLoading}
          />
          <DashboardStatCard
            title="Information Completed"
            value={summary.completedStudents ?? 0}
            icon={CheckCircle2}
            subtitle="Ready for ID card generation"
            colorScheme="emerald"
            isLoading={isLoading}
          />
          <DashboardStatCard
            title="Information Pending"
            value={summary.pendingStudents ?? 0}
            icon={AlertCircle}
            subtitle="Missing photo or required fields"
            colorScheme="amber"
            isLoading={isLoading}
          />
          <DashboardStatCard
            title="Generated ID Cards"
            value={summary.generatedCards ?? 0}
            icon={Sparkles}
            subtitle="Successfully rendered cards"
            colorScheme="indigo"
            isLoading={isLoading}
          />
          <DashboardStatCard
            title="Pending Generation"
            value={summary.pendingCards ?? 0}
            icon={Clock}
            subtitle="Cards awaiting batch rendering"
            colorScheme="blue"
            isLoading={isLoading}
          />
          <DashboardStatCard
            title="Active Assignments"
            value={summary.totalAssignments ?? assignments.length}
            icon={Shield}
            subtitle="Class rosters assigned to you"
            colorScheme="purple"
            isLoading={isLoading}
          />
        </div>
      </DashboardSection>

      {/* Class & Section Progress Breakdown */}
      {assignments.length > 0 && (
        <DashboardSection
          title="Class Roster Progress"
          subtitle="Operational completion status per assigned class and section"
        >
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-xs">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5">Class & Section</th>
                  <th className="px-5 py-3.5">Total Students</th>
                  <th className="px-5 py-3.5">Complete</th>
                  <th className="px-5 py-3.5">Pending</th>
                  <th className="px-5 py-3.5">Generated Cards</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map((asgn, idx) => (
                  <tr key={asgn.id || asgn._id || idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      Class {asgn.className} - {asgn.section}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">
                      {asgn.totalStudents ?? 0}
                    </td>
                    <td className="px-5 py-3.5 text-emerald-600 font-semibold">
                      {asgn.completedStudents ?? 0}
                    </td>
                    <td className="px-5 py-3.5 text-amber-600 font-semibold">
                      {asgn.pendingStudents ?? 0}
                    </td>
                    <td className="px-5 py-3.5 text-indigo-600 font-semibold">
                      {asgn.generatedCards ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardSection>
      )}

      {/* Operational Quick Actions */}
      <DashboardSection
        title="Operational Actions"
        subtitle="Quick shortcuts for operator workflows"
      >
        <QuickActions role="OPERATOR" />
      </DashboardSection>
    </div>
  );
};

export default OperatorDashboard;

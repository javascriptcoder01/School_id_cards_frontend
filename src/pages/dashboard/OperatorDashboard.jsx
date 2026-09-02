import React from 'react';
import { Shield, CheckCircle2, CreditCard } from 'lucide-react';
import DashboardStatCard from '../../components/dashboard/DashboardStatCard.jsx';
import DashboardSection from '../../components/dashboard/DashboardSection.jsx';
import QuickActions from '../../components/dashboard/QuickActions.jsx';

export const OperatorDashboard = ({
  user,
  summary,
  isLoading,
}) => {
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
              Read-only operations, ID template inspections, and system verification monitoring
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10 text-right">
            <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider block">Access Permission</span>
            <span className="text-base font-extrabold text-white tracking-wide">
              Read-Only
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DashboardStatCard
          title="Operational Status"
          value={summary?.operationalStatus || 'ACTIVE'}
          icon={CheckCircle2}
          subtitle="System connectivity and status"
          colorScheme="emerald"
          isLoading={isLoading}
        />
        <DashboardStatCard
          title="Authorization Level"
          value="OPERATOR"
          icon={Shield}
          subtitle="Protected read-only access"
          colorScheme="indigo"
          isLoading={isLoading}
        />
      </div>

      {/* Quick Actions */}
      <DashboardSection
        title="Operational Actions"
        subtitle="Quick shortcuts for operator tasks"
      >
        <QuickActions role="OPERATOR" />
      </DashboardSection>
    </div>
  );
};

export default OperatorDashboard;


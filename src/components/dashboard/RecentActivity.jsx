import React from 'react';
import { Clock, Activity, School, User, Sparkles } from 'lucide-react';
import DashboardEmptyState from './DashboardEmptyState.jsx';

export const RecentActivity = ({ activity = [] }) => {
  if (!activity || activity.length === 0) {
    return (
      <DashboardEmptyState
        title="No Recent Activity"
        description="Recent administrative actions and job updates will appear here."
        icon={Activity}
      />
    );
  }

  const getIcon = (type) => {
    switch (type) {
      case 'COLLEGE_CREATED':
        return <School className="w-4 h-4 text-indigo-600" />;
      case 'USER_CREATED':
        return <User className="w-4 h-4 text-purple-600" />;
      case 'GENERATION_JOB':
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
      default:
        return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    try {
      return new Date(dateStr).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
      {activity.map((item, idx) => (
        <div key={idx} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
              {getIcon(item.type)}
            </div>
            <span className="text-sm font-semibold text-slate-800">{item.title}</span>
          </div>

          <span className="text-xs font-mono text-slate-400 flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3 text-slate-400" />
            {formatDate(item.timestamp)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default RecentActivity;


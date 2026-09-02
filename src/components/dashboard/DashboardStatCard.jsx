import React from 'react';
import { Loader2 } from 'lucide-react';

export const DashboardStatCard = ({
  title,
  value = 0,
  icon: Icon = null,
  subtitle = null,
  isLoading = false,
  colorScheme = 'indigo', // 'indigo' | 'emerald' | 'amber' | 'purple' | 'blue'
}) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      text: 'text-indigo-600',
    },
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      text: 'text-emerald-600',
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      text: 'text-amber-600',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      text: 'text-purple-600',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      text: 'text-blue-600',
    },
  };

  const scheme = colorMap[colorScheme] || colorMap.indigo;

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div
            className={`w-10 h-10 rounded-2xl ${scheme.bg} ${scheme.border} border ${scheme.text} flex items-center justify-center font-bold shrink-0 shadow-xs`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="h-9 w-20 bg-slate-100 rounded-lg animate-pulse" />
        ) : (
          <p className="text-3xl font-black text-slate-900 font-mono tracking-tight">
            {value}
          </p>
        )}

        {subtitle && (
          <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default DashboardStatCard;


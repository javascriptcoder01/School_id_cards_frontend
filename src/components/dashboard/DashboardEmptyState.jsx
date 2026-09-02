import React from 'react';
import { Layers } from 'lucide-react';

export const DashboardEmptyState = ({
  title = 'No Data Available',
  description = 'There are no recent records or metrics to display at this time.',
  icon: Icon = Layers,
}) => {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3 shadow-xs">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto">{description}</p>
    </div>
  );
};

export default DashboardEmptyState;


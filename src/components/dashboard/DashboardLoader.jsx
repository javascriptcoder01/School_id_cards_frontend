import React from 'react';
import { Loader2 } from 'lucide-react';

export const DashboardLoader = ({ message = 'Loading dashboard metrics...' }) => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Skeleton Header */}
      <div className="h-32 bg-slate-200 rounded-3xl" />

      {/* Skeleton Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="h-28 bg-slate-200 rounded-3xl" />
        <div className="h-28 bg-slate-200 rounded-3xl" />
        <div className="h-28 bg-slate-200 rounded-3xl" />
        <div className="h-28 bg-slate-200 rounded-3xl" />
      </div>

      {/* Skeleton Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 bg-slate-200 rounded-3xl" />
        <div className="h-72 bg-slate-200 rounded-3xl" />
      </div>
    </div>
  );
};

export default DashboardLoader;


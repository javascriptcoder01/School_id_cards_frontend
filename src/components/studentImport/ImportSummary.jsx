import React from 'react';
import { Users, CheckCircle, XCircle } from 'lucide-react';

export const ImportSummary = ({
  result = { totalRecords: 0, successCount: 0, failedCount: 0 },
}) => {
  const { totalRecords = 0, successCount = 0, failedCount = 0 } = result;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-800">Import Summary</h2>
          <p className="text-xs text-slate-500">Breakdown of processed student records</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Records Card */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Records
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
            {totalRecords}
          </p>
          <span className="text-[11px] text-slate-400">Total rows submitted</span>
        </div>

        {/* Successful Imports Card */}
        <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Successful Imports
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 mt-2 font-mono">
            {successCount}
          </p>
          <span className="text-[11px] text-emerald-600">Saved to database</span>
        </div>

        {/* Failed Imports Card */}
        <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
              Failed Imports
            </span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold text-rose-700 mt-2 font-mono">
            {failedCount}
          </p>
          <span className="text-[11px] text-rose-600">Rejected with validation issues</span>
        </div>
      </div>
    </div>
  );
};

export default ImportSummary;


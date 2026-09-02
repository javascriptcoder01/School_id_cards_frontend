import React from 'react';
import { Users, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

export const GenerationResultSummary = ({
  results = null,
  generation = null,
}) => {
  const data = results || generation || {};

  const total =
    data.totalStudents ??
    data.total ??
    data.studentCount ??
    (Array.isArray(data.studentIds) ? data.studentIds.length : (data.studentId ? 1 : 0));

  const completed =
    data.completedCount ??
    data.successful ??
    data.successCount ??
    (data.status === 'COMPLETED' ? total : 0);

  const failed =
    data.failedCount ??
    data.failed ??
    (data.status === 'FAILED' ? total : 0);

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800">Generation Results Summary</h3>
          <p className="text-xs text-slate-500">Overview of generated student ID cards</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Students */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Students
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
            {total}
          </p>
          <span className="text-[11px] text-slate-400">Total job batch size</span>
        </div>

        {/* Completed */}
        <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Completed Cards
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 mt-2 font-mono">
            {completed}
          </p>
          <span className="text-[11px] text-emerald-600">Generated successfully</span>
        </div>

        {/* Failed */}
        <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
              Failed Cards
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold text-rose-700 mt-2 font-mono">
            {failed}
          </p>
          <span className="text-[11px] text-rose-600">Errors during generation</span>
        </div>
      </div>
    </div>
  );
};

export default GenerationResultSummary;


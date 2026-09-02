import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle2, Clock, AlertTriangle, ArrowRight, Layers } from 'lucide-react';
import { ROUTES, getIdCardGenerationDetailRoute } from '../../constants/routes.js';
import GenerationStatusBadge from '../idCardGeneration/GenerationStatusBadge.jsx';
import DashboardEmptyState from './DashboardEmptyState.jsx';

export const GenerationStatusSummary = ({ generationStats = null }) => {
  if (!generationStats) {
    return (
      <DashboardEmptyState
        title="No Generation Data"
        description="ID card generation jobs and status analytics will be summarized here."
        icon={Sparkles}
      />
    );
  }

  const {
    total = 0,
    completed = 0,
    pending = 0,
    processing = 0,
    failed = 0,
    recent = [],
  } = generationStats;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-800">ID Card Generation Pipeline</h3>
          <p className="text-xs text-slate-500">Live summary of card printing & generation jobs</p>
        </div>

        <Link
          to={ROUTES.ID_CARD_GENERATIONS}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <span>View All Jobs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
            Completed
          </span>
          <span className="text-xl font-black text-emerald-800 font-mono mt-1 block">
            {completed}
          </span>
        </div>

        <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-100">
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
            Processing
          </span>
          <span className="text-xl font-black text-blue-800 font-mono mt-1 block">
            {processing}
          </span>
        </div>

        <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-100">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
            Pending
          </span>
          <span className="text-xl font-black text-amber-800 font-mono mt-1 block">
            {pending}
          </span>
        </div>

        <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-100">
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
            Failed
          </span>
          <span className="text-xl font-black text-rose-800 font-mono mt-1 block">
            {failed}
          </span>
        </div>
      </div>

      {/* Recent Generations List */}
      {recent && recent.length > 0 && (
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Recent Generation Jobs
          </span>
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
            {recent.slice(0, 4).map((job) => (
              <div
                key={job.id}
                className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <Link
                      to={getIdCardGenerationDetailRoute(job.id)}
                      className="font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                    >
                      {job.templateName}
                    </Link>
                    <span className="text-slate-400 ml-2">({job.studentCount} students)</span>
                  </div>
                </div>

                <GenerationStatusBadge status={job.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerationStatusSummary;


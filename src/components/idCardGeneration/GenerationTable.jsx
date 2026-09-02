import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Play, Sparkles, Layers } from 'lucide-react';
import { getIdCardGenerationDetailRoute } from '../../constants/routes.js';
import { GENERATION_STATUS } from '../../constants/idCardGeneration.js';
import GenerationStatusBadge from './GenerationStatusBadge.jsx';
import EmptyState from '../common/EmptyState.jsx';
import Loader from '../common/Loader.jsx';

export const GenerationTable = ({
  generations = [],
  templatesMap = {},
  isLoading = false,
  processingId = null,
  onProcessJob,
}) => {
  if (isLoading) {
    return <Loader message="Fetching generation jobs..." />;
  }

  if (!generations || generations.length === 0) {
    return (
      <EmptyState
        title="No Generation Jobs"
        description="No ID card generation jobs found. Create a generation job to produce ID cards for students."
        icon={Sparkles}
      />
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" aria-label="Generation Jobs Table">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Job / Template</th>
              <th className="py-3.5 px-4">Students</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Requested At</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {generations.map((gen) => {
              const isProcessingThis = processingId === gen.id;
              const templateName =
                gen.templateName ||
                (gen.templateId && templatesMap[gen.templateId]?.name) ||
                (typeof gen.templateId === 'object' ? gen.templateId.name : null) ||
                'ID Card Template';

              const studentCount =
                gen.studentCount ??
                (Array.isArray(gen.studentIds) ? gen.studentIds.length : (gen.studentId ? 1 : 0));

              const isPending = gen.status === GENERATION_STATUS.PENDING;

              return (
                <tr key={gen.id} className="hover:bg-slate-50/80 transition-colors group">
                  {/* Template Name & Job ID */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <Link
                          to={getIdCardGenerationDetailRoute(gen.id)}
                          className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors block"
                        >
                          {templateName}
                        </Link>
                        <span className="text-xs text-slate-400 font-mono">
                          Job #{gen.id ? String(gen.id).slice(-6) : '---'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Students Count */}
                  <td className="py-4 px-4 text-xs">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      {studentCount} {studentCount === 1 ? 'student' : 'students'}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4">
                    <GenerationStatusBadge status={gen.status} />
                  </td>

                  {/* Requested Date */}
                  <td className="py-4 px-4 text-xs text-slate-500 font-mono">
                    {formatDate(gen.createdAt || gen.requestedAt)}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <div className="inline-flex items-center gap-2 justify-end">
                      <Link
                        to={getIdCardGenerationDetailRoute(gen.id)}
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View job details"
                        aria-label={`View job ${gen.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {isPending && onProcessJob && (
                        <button
                          type="button"
                          disabled={isProcessingThis}
                          onClick={() => onProcessJob(gen.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
                          title="Process generation job"
                        >
                          <Play className="w-3 h-3" />
                          <span>{isProcessingThis ? 'Processing...' : 'Process'}</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GenerationTable;


import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Plus, RefreshCw, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { loadOperatorGenerationsRequested } from '../../features/operator/operatorSlice.js';
import {
  selectOperatorGenerations,
  selectOperatorLoadingGenerations,
  selectOperatorError,
} from '../../features/operator/operatorSelectors.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import PageLoader from '../../components/common/PageLoader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

export const OperatorGenerationListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const generations = useSelector(selectOperatorGenerations);
  const isLoading = useSelector(selectOperatorLoadingGenerations);
  const error = useSelector(selectOperatorError);

  useEffect(() => {
    dispatch(loadOperatorGenerationsRequested());
  }, [dispatch]);

  const handleRefresh = () => {
    if (!isLoading) {
      dispatch(loadOperatorGenerationsRequested());
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Completed
          </span>
        );
      case 'PROCESSING':
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
            <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            Processing
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="ID Card Generation Requests"
        subtitle="Track background ID card rendering batches requested for your assigned students."
        icon={Sparkles}
        action={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/operator/id-cards/generate')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Request Generation</span>
            </button>
          </div>
        }
      />

      {isLoading && generations.length === 0 ? (
        <PageLoader message="Loading generation history..." />
      ) : generations.length === 0 ? (
        <EmptyState
          title="No Card Generation Jobs Yet"
          description="Submit a card generation job for students in your assigned class and section."
          actionText="Generate ID Cards"
          onAction={() => navigate('/operator/id-cards/generate')}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5">Job ID</th>
                <th className="px-5 py-3.5">Template</th>
                <th className="px-5 py-3.5">Total Students</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Requested At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {generations.map((gen) => {
                const id = gen.id || gen._id;
                const template = gen.templateId || {};
                const studentCount = Array.isArray(gen.studentIds) ? gen.studentIds.length : (gen.totalStudents || 0);

                return (
                  <tr key={id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-slate-800">
                      #{String(id).slice(-8)}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      {template.name || 'Standard Layout'}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-700">
                      {studentCount}
                    </td>
                    <td className="px-5 py-3.5">
                      {getStatusBadge(gen.status)}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 font-medium">
                      {gen.requestedAt || gen.createdAt ? new Date(gen.requestedAt || gen.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OperatorGenerationListPage;

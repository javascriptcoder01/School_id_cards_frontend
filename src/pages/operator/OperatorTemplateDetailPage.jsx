import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, ArrowLeft, Eye } from 'lucide-react';
import { loadOperatorTemplatesRequested } from '../../features/operator/operatorSlice.js';
import {
  selectOperatorTemplates,
  selectOperatorLoadingTemplates,
} from '../../features/operator/operatorSelectors.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import PageLoader from '../../components/common/PageLoader.jsx';

export const OperatorTemplateDetailPage = () => {
  const { templateId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const templates = useSelector(selectOperatorTemplates);
  const isLoading = useSelector(selectOperatorLoadingTemplates);

  useEffect(() => {
    if (templates.length === 0) {
      dispatch(loadOperatorTemplatesRequested());
    }
  }, [dispatch, templates.length]);

  const template = templates.find((t) => (t.id || t._id) === templateId);

  if (isLoading && !template) {
    return <PageLoader message="Loading template details..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={`Template: ${template?.name || 'Layout'}`}
        subtitle="Read-only view of template canvas dimensions, visual elements, and field placeholders."
        icon={CreditCard}
        action={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/operator/templates')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Back to Catalog</span>
            </button>
            <button
              type="button"
              onClick={() => navigate(`/operator/id-cards/preview?templateId=${templateId}`)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Test with Student</span>
            </button>
          </div>
        }
      />

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Orientation</span>
            <span className="text-sm font-extrabold text-slate-900 mt-1 block">{template?.orientation || 'PORTRAIT'}</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Dimensions</span>
            <span className="text-sm font-extrabold text-slate-900 mt-1 block">
              {template?.width || 600} × {template?.height || 900} px
            </span>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Configured Fields</span>
            <span className="text-sm font-extrabold text-slate-900 mt-1 block">
              {template?.fields?.length || 0} Fields
            </span>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
            <span className="text-sm font-extrabold text-emerald-600 mt-1 block">Active</span>
          </div>
        </div>

        {/* Fields list */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Template Fields</h3>
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Field Key</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Position (X, Y)</th>
                  <th className="px-4 py-3">Font Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(template?.fields || []).map((fld, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-800 text-xs">{fld.key}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 font-semibold">{fld.type || 'TEXT'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">({fld.x ?? 0}, {fld.y ?? 0})</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{fld.fontSize || 14} px</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorTemplateDetailPage;

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Eye, RefreshCw } from 'lucide-react';
import { loadOperatorTemplatesRequested } from '../../features/operator/operatorSlice.js';
import {
  selectOperatorTemplates,
  selectOperatorLoadingTemplates,
  selectOperatorError,
  selectIsOperatorInitialized,
} from '../../features/operator/operatorSelectors.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import PageLoader from '../../components/common/PageLoader.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

export const OperatorTemplateListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const templates = useSelector(selectOperatorTemplates);
  const isLoading = useSelector(selectOperatorLoadingTemplates);
  const error = useSelector(selectOperatorError);
  const isInitialized = useSelector(selectIsOperatorInitialized);

  useEffect(() => {
    dispatch(loadOperatorTemplatesRequested());
  }, [dispatch]);

  const handleRefresh = () => {
    if (!isLoading) {
      dispatch(loadOperatorTemplatesRequested());
    }
  };

  if (isLoading && !isInitialized && templates.length === 0) {
    return <PageLoader message="Loading available ID card templates..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="ID Card Template Catalog"
        subtitle="Browse approved institution ID card layouts and design specifications (read-only)."
        icon={CreditCard}
        action={
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        }
      />

      {error && !isInitialized && (
        <ErrorState
          title="Failed to Load Templates"
          message={error}
          onRetry={handleRefresh}
        />
      )}

      {templates.length === 0 ? (
        <EmptyState
          title="No Card Templates Available"
          description="Your college administrator has not published any active ID card templates yet."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tmpl) => {
            const id = tmpl.id || tmpl._id;
            return (
              <div
                key={id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {tmpl.orientation || 'PORTRAIT'}
                    </span>
                    <span className="text-xs font-mono font-medium text-slate-400">
                      {tmpl.width || 600} × {tmpl.height || 900} px
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">{tmpl.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {tmpl.description || 'Institutional student badge layout with standard QR verification.'}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">
                    {tmpl.fields?.length || 0} Layout Fields
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(`/operator/templates/${id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Design</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OperatorTemplateListPage;

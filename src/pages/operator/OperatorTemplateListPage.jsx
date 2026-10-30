import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CreditCard, RefreshCw } from 'lucide-react';
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
import TemplateCardGrid from '../../components/templates/TemplateCardGrid.jsx';

export const OperatorTemplateListPage = () => {
  const dispatch = useDispatch();

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
        <TemplateCardGrid
          templates={templates}
          isLoading={isLoading}
          getDetailRoute={(id) => `/operator/templates/${id}`}
          detailLabel="View Design"
        />
      )}
    </div>
  );
};

export default OperatorTemplateListPage;

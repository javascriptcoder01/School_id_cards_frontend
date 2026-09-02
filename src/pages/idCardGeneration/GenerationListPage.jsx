import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Sparkles, Plus, RefreshCw } from 'lucide-react';
import {
  fetchGenerationsRequested,
  processGenerationRequested,
  setGenerationFilters,
  resetGenerationFilters,
  clearGenerationErrors,
} from '../../features/idCardGeneration/idCardGenerationSlice.js';
import {
  selectGenerations,
  selectGenerationPagination,
  selectGenerationFilters,
  selectGenerationsLoading,
  selectGenerationProcessLoading,
  selectGenerationError,
} from '../../features/idCardGeneration/idCardGenerationSelectors.js';
import { fetchTemplatesRequested } from '../../features/templates/templateSlice.js';
import { selectTemplates } from '../../features/templates/templateSelectors.js';
import { ROUTES } from '../../constants/routes.js';
import GenerationFilters from '../../components/idCardGeneration/GenerationFilters.jsx';
import GenerationTable from '../../components/idCardGeneration/GenerationTable.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';

export const GenerationListPage = () => {
  const dispatch = useDispatch();

  const generations = useSelector(selectGenerations);
  const pagination = useSelector(selectGenerationPagination);
  const filters = useSelector(selectGenerationFilters);
  const isLoading = useSelector(selectGenerationsLoading);
  const isProcessing = useSelector(selectGenerationProcessLoading);
  const error = useSelector(selectGenerationError);
  const templates = useSelector(selectTemplates);

  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    dispatch(fetchTemplatesRequested({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchGenerationsRequested({
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status,
        templateId: filters.templateId,
      })
    );
  }, [dispatch, pagination.page, pagination.limit, filters.status, filters.templateId]);

  const handleFilterChange = (newFilters) => {
    dispatch(setGenerationFilters(newFilters));
  };

  const handleResetFilters = () => {
    dispatch(resetGenerationFilters());
  };

  const handleProcessJob = (generationId) => {
    setProcessingId(generationId);
    dispatch(
      processGenerationRequested({
        id: generationId,
        onSuccess: () => {
          setProcessingId(null);
          // Refresh list
          dispatch(
            fetchGenerationsRequested({
              page: pagination.page,
              limit: pagination.limit,
              status: filters.status,
              templateId: filters.templateId,
            })
          );
        },
      })
    );
  };

  const handleRefresh = () => {
    dispatch(
      fetchGenerationsRequested({
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status,
        templateId: filters.templateId,
      })
    );
  };

  const templatesMap = (templates || []).reduce((acc, t) => {
    acc[t.id] = t;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-indigo-600" />
            ID Card Generation Jobs
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor, submit, and process ID card generation jobs for college students
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
            title="Refresh generation jobs"
            aria-label="Refresh generation jobs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to={ROUTES.ID_CARD_GENERATION_NEW}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Generation Job</span>
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <ErrorMessage
          message={error}
          title="Error Loading Generation Jobs"
          onDismiss={() => dispatch(clearGenerationErrors())}
        />
      )}

      {/* Filters Bar */}
      <GenerationFilters
        filters={filters}
        templates={templates}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Generation Table */}
      <GenerationTable
        generations={generations}
        templatesMap={templatesMap}
        isLoading={isLoading}
        processingId={isProcessing ? processingId : null}
        onProcessJob={handleProcessJob}
      />
    </div>
  );
};

export default GenerationListPage;


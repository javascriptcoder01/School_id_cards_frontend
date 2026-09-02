import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Sparkles, ArrowLeft, Play, Layers, FolderDown } from 'lucide-react';
import {
  fetchGenerationDetailRequested,
  processGenerationRequested,
  clearSelectedGeneration,
} from '../../features/idCardGeneration/idCardGenerationSlice.js';
import {
  selectSelectedGeneration,
  selectGenerationDetailLoading,
  selectGenerationProcessLoading,
  selectGenerationError,
} from '../../features/idCardGeneration/idCardGenerationSelectors.js';
import { ROUTES, getIdCardOutputRoute } from '../../constants/routes.js';
import { GENERATION_STATUS } from '../../constants/idCardGeneration.js';
import GenerationStatusBadge from '../../components/idCardGeneration/GenerationStatusBadge.jsx';
import GenerationResultSummary from '../../components/idCardGeneration/GenerationResultSummary.jsx';
import Loader from '../../components/common/Loader.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';

export const GenerationDetailPage = () => {
  const { generationId } = useParams();
  const dispatch = useDispatch();

  const generation = useSelector(selectSelectedGeneration);
  const isLoading = useSelector(selectGenerationDetailLoading);
  const isProcessing = useSelector(selectGenerationProcessLoading);
  const error = useSelector(selectGenerationError);

  useEffect(() => {
    if (generationId) {
      dispatch(fetchGenerationDetailRequested(generationId));
    }

    return () => {
      dispatch(clearSelectedGeneration());
    };
  }, [dispatch, generationId]);

  const handleProcess = () => {
    if (!generationId) return;
    dispatch(
      processGenerationRequested({
        id: generationId,
        onSuccess: () => {
          dispatch(fetchGenerationDetailRequested(generationId));
        },
      })
    );
  };

  if (isLoading && !generation) {
    return <Loader message="Loading generation job details..." />;
  }

  if (error && !generation) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.ID_CARD_GENERATIONS}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Generation Jobs</span>
          </Link>
        </div>
        <ErrorMessage message={error} title="Job Not Found or Inaccessible" />
      </div>
    );
  }

  if (!generation) {
    return null;
  }

  const isPending = generation.status === GENERATION_STATUS.PENDING;
  const isCompleted = generation.status === GENERATION_STATUS.COMPLETED;
  const studentCount =
    generation.studentCount ??
    (Array.isArray(generation.studentIds) ? generation.studentIds.length : (generation.studentId ? 1 : 0));

  const templateName =
    generation.templateName ||
    (typeof generation.templateId === 'object' ? generation.templateId?.name : null) ||
    'ID Card Template';

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to={ROUTES.ID_CARD_GENERATIONS}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Generation Jobs</span>
        </Link>

        <div className="flex items-center gap-3">
          {isPending && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleProcess}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>{isProcessing ? 'Processing Job...' : 'Process Generation Job'}</span>
            </button>
          )}

          {isCompleted && (
            <Link
              to={getIdCardOutputRoute(generationId)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/30 transition-all"
            >
              <FolderDown className="w-4 h-4" />
              <span>View Outputs & Downloads</span>
            </Link>
          )}
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
            <Sparkles className="w-8 h-8" />
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {templateName}
              </h1>
              <GenerationStatusBadge status={generation.status} />
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 flex-wrap">
              <span className="font-mono bg-slate-100 px-2.5 py-0.5 rounded-md font-semibold text-slate-700">
                Job #{generation.id ? String(generation.id).slice(-8) : '---'}
              </span>
              <span className="font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md">
                {studentCount} Student(s) Selected
              </span>
              <span className="text-slate-400">
                Created on {formatDate(generation.createdAt || generation.requestedAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job Parameters */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Layers className="w-5 h-5 text-indigo-600" />
            Job Specifications
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Processing Mode:</span>
              <span className="font-semibold text-slate-800">
                {studentCount > 1 ? 'Bulk Batch' : 'Single Student'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Template Layout:</span>
              <span className="font-medium text-slate-900">{templateName}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Requested Timestamp:</span>
              <span className="font-mono text-xs text-slate-700">
                {formatDate(generation.createdAt || generation.requestedAt)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500">Finished Timestamp:</span>
              <span className="font-mono text-xs text-slate-700">
                {formatDate(generation.completedAt || generation.processedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <GenerationResultSummary generation={generation} />
      </div>
    </div>
  );
};

export default GenerationDetailPage;

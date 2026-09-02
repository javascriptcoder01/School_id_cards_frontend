import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Sparkles, FolderDown, RefreshCw } from 'lucide-react';
import {
  fetchGenerationDetailRequested,
  fetchGenerationResultsRequested,
  clearSelectedGeneration,
} from '../../features/idCardGeneration/idCardGenerationSlice.js';
import {
  selectSelectedGeneration,
  selectGenerationResults,
  selectGenerationDetailLoading,
  selectGenerationResultsLoading,
  selectGenerationError,
} from '../../features/idCardGeneration/idCardGenerationSelectors.js';
import { resetDownloadState } from '../../features/idCardOutput/idCardOutputSlice.js';
import {
  selectDownloadStatus,
  selectDownloadError,
} from '../../features/idCardOutput/idCardOutputSelectors.js';
import { ROUTES, getIdCardGenerationDetailRoute } from '../../constants/routes.js';
import GenerationStatusBadge from '../../components/idCardGeneration/GenerationStatusBadge.jsx';
import GenerationDownloadPanel from '../../components/idCardOutput/GenerationDownloadPanel.jsx';
import StudentOutputTable from '../../components/idCardOutput/StudentOutputTable.jsx';
import DownloadStatusMessage from '../../components/idCardOutput/DownloadStatusMessage.jsx';
import Loader from '../../components/common/Loader.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';

export const GenerationOutputPage = () => {
  const { generationId } = useParams();
  const dispatch = useDispatch();

  const generation = useSelector(selectSelectedGeneration);
  const resultsData = useSelector(selectGenerationResults);
  const isDetailLoading = useSelector(selectGenerationDetailLoading);
  const isResultsLoading = useSelector(selectGenerationResultsLoading);
  const genError = useSelector(selectGenerationError);

  const downloadStatus = useSelector(selectDownloadStatus);
  const downloadError = useSelector(selectDownloadError);

  useEffect(() => {
    if (generationId) {
      dispatch(fetchGenerationDetailRequested(generationId));
      dispatch(fetchGenerationResultsRequested(generationId));
    }

    return () => {
      dispatch(clearSelectedGeneration());
      dispatch(resetDownloadState());
    };
  }, [dispatch, generationId]);

  const handleRefresh = () => {
    if (generationId) {
      dispatch(fetchGenerationDetailRequested(generationId));
      dispatch(fetchGenerationResultsRequested(generationId));
    }
  };

  if ((isDetailLoading || isResultsLoading) && !generation) {
    return <Loader message="Loading generation output files..." />;
  }

  if (genError && !generation) {
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
        <ErrorMessage message={genError} title="Output Files Unavailable" />
      </div>
    );
  }

  if (!generation) return null;

  const resultsList =
    resultsData?.results ||
    generation.results ||
    (Array.isArray(generation.studentIds)
      ? generation.studentIds.map((id, idx) => ({
        studentId: id,
        studentName: `Student ${idx + 1}`,
        status: generation.status,
      }))
      : generation.studentId
        ? [{ studentId: generation.studentId, studentName: 'Student Record', status: generation.status }]
        : []);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to={getIdCardGenerationDetailRoute(generationId)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Job Details</span>
        </Link>

        <button
          type="button"
          onClick={handleRefresh}
          className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
          title="Refresh outputs"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
            <FolderDown className="w-8 h-8" />
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Generated ID Card Outputs
              </h1>
              <GenerationStatusBadge status={generation.status} />
            </div>

            <p className="text-xs text-slate-500 mt-1">
              Job #{generationId ? String(generationId).slice(-8) : '---'} &bull; Template: {generation.templateName || 'Standard Layout'}
            </p>
          </div>
        </div>
      </div>

      {/* Download Status Notification */}
      <DownloadStatusMessage
        status={downloadStatus}
        error={downloadError}
        onDismiss={() => dispatch(resetDownloadState())}
      />

      {/* Bulk ZIP Export Panel */}
      <GenerationDownloadPanel generation={generation} />

      {/* Individual Student Output Table */}
      <StudentOutputTable
        generationId={generationId}
        results={resultsList}
        isLoading={isResultsLoading}
      />
    </div>
  );
};

export default GenerationOutputPage;


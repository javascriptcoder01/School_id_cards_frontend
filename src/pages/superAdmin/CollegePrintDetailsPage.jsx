import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, RefreshCw } from 'lucide-react';
import {
  loadCollegePrintDetailsRequested,
  downloadResultPngRequested,
  downloadCollegeZipRequested,
  downloadCollegePdfRequested,
  clearSelectedCollegePrintDetails,
} from '../../features/superAdminPrint/superAdminPrintSlice.js';
import {
  selectSelectedCollegePrintDetails,
  selectPrintLoadingCollege,
  selectPrintDownloading,
  selectPrintDownloadType,
  selectPrintCurrentDownload,
  selectPrintError,
} from '../../features/superAdminPrint/superAdminPrintSelectors.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import PageLoader from '../../components/common/PageLoader.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import CollegePrintDetails from '../../components/superAdmin/CollegePrintDetails.jsx';

export const CollegePrintDetailsPage = () => {
  const { collegeId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const collegeData = useSelector(selectSelectedCollegePrintDetails);
  const isLoading = useSelector(selectPrintLoadingCollege);
  const isDownloading = useSelector(selectPrintDownloading);
  const downloadType = useSelector(selectPrintDownloadType);
  const currentDownload = useSelector(selectPrintCurrentDownload);
  const error = useSelector(selectPrintError);

  useEffect(() => {
    if (collegeId) {
      dispatch(loadCollegePrintDetailsRequested(collegeId));
    }
    return () => {
      dispatch(clearSelectedCollegePrintDetails());
    };
  }, [dispatch, collegeId]);

  const handleRefresh = () => {
    if (collegeId && !isLoading) {
      dispatch(loadCollegePrintDetailsRequested(collegeId));
    }
  };

  const college = collegeData?.college || {};
  const collegeCode = college.code || 'COL';

  const handleDownloadZip = () => {
    dispatch(downloadCollegeZipRequested({ collegeId, collegeCode }));
  };

  const handleDownloadPdf = () => {
    dispatch(downloadCollegePdfRequested({ collegeId, collegeCode }));
  };

  const handleDownloadPng = (resultId, studentName) => {
    dispatch(downloadResultPngRequested({ resultId, studentName }));
  };

  if (isLoading && !collegeData) {
    return <PageLoader message="Loading college print queue details..." />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title={`Print Queue: ${college.name || 'College'}`}
        subtitle="Manage card rendering outputs, single card downloads, ZIP packaging, and PDF export sheets."
        icon={Printer}
        action={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
              title="Refresh Details"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/super-admin/print-center')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Back to Print Center</span>
            </button>
          </div>
        }
      />

      {error && !collegeData && (
        <ErrorState
          title="Failed to Load College Print Details"
          message={error}
          onRetry={handleRefresh}
        />
      )}

      {collegeData && (
        <CollegePrintDetails
          collegeData={collegeData}
          onDownloadZip={handleDownloadZip}
          onDownloadPdf={handleDownloadPdf}
          onDownloadPng={handleDownloadPng}
          isDownloading={isDownloading}
          downloadType={downloadType}
          currentDownload={currentDownload}
        />
      )}
    </div>
  );
};

export default CollegePrintDetailsPage;

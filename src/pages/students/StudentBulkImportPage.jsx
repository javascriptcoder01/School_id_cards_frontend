import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FileSpreadsheet, ArrowLeft, RotateCcw, CheckCircle } from 'lucide-react';
import {
  importStudentsRequested,
  resetImportState,
} from '../../features/studentImport/studentImportSlice.js';
import {
  selectImportStatus,
  selectImportLoading,
  selectImportResult,
  selectImportError,
} from '../../features/studentImport/studentImportSelectors.js';
import { ROUTES } from '../../constants/routes.js';
import BulkImportUploader from '../../components/studentImport/BulkImportUploader.jsx';
import ImportProgress from '../../components/studentImport/ImportProgress.jsx';
import ImportSummary from '../../components/studentImport/ImportSummary.jsx';
import ImportErrorsTable from '../../components/studentImport/ImportErrorsTable.jsx';

export const StudentBulkImportPage = () => {
  const dispatch = useDispatch();

  const status = useSelector(selectImportStatus);
  const isLoading = useSelector(selectImportLoading);
  const importResult = useSelector(selectImportResult);
  const errorMessage = useSelector(selectImportError);

  const [selectedFile, setSelectedFile] = useState(null);

  // Reset state on unmount
  useEffect(() => {
    return () => {
      dispatch(resetImportState());
    };
  }, [dispatch]);

  const handleUpload = (file) => {
    dispatch(importStudentsRequested(file));
  };

  const handleReset = () => {
    setSelectedFile(null);
    dispatch(resetImportState());
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to={ROUTES.STUDENTS}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students Directory</span>
        </Link>

        {status === 'COMPLETED' && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Upload Another File</span>
          </button>
        )}
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <FileSpreadsheet className="w-7 h-7 text-indigo-600" />
          Student Bulk Import
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Import multiple student records into your college repository using a CSV or Excel spreadsheet
        </p>
      </div>

      {/* Lifecycle Section 1: Progress Banner */}
      <ImportProgress status={status} errorMessage={errorMessage} />

      {/* Lifecycle Section 2: Upload Card (Visible if IDLE or UPLOADING) */}
      {(status === 'IDLE' || status === 'UPLOADING') && (
        <BulkImportUploader
          selectedFile={selectedFile}
          isLoading={isLoading}
          onFileChange={setSelectedFile}
          onFileRemove={() => setSelectedFile(null)}
          onUpload={handleUpload}
        />
      )}

      {/* Lifecycle Section 3: Summary & Detailed Error Table (Visible on COMPLETED) */}
      {status === 'COMPLETED' && (
        <div className="space-y-6">
          <ImportSummary result={importResult} />
          <ImportErrorsTable errors={importResult.errors} />

          <div className="flex items-center justify-end gap-3 pt-4">
            <Link
              to={ROUTES.STUDENTS}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Go to Students Directory</span>
            </Link>
          </div>
        </div>
      )}

      {/* Lifecycle Section 4: Retry Card (Visible on FAILED) */}
      {status === 'FAILED' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center space-y-4">
          <p className="text-sm text-slate-600">
            You can modify the spreadsheet or choose another file to try again.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentBulkImportPage;


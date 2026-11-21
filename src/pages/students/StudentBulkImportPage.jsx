// StudentBulkImportPage.jsx — Bulk Import (School Admin + Class Teacher), naye /students/import/* APIs par:
// 1. Upload (template, Excel + optional photos, class) → 2. Preview (check, filters, error report) → 3. Import (photo progress, result)
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileSpreadsheet, X } from 'lucide-react';
import {
  importPreviewRequested,
  importConfirmRequested,
  importDownloadRequested,
  backToImportUpload,
  clearImportError,
  resetBulkImport,
  stopImportPolling,
  selectBulkImport,
} from '../../features/students/studentBulkImportSlice.js';
import { selectCurrentUser, selectUserRole } from '../../features/auth/authSelectors.js';
import { ROUTES } from '../../constants/routes.js';
import { ROLES } from '../../constants/roles.js';
import OperatorAssignmentBanner from '../../components/students/OperatorAssignmentBanner.jsx';
import ImportStepper from '../../components/studentImport/ImportStepper.jsx';
import ImportUploadStep from '../../components/studentImport/ImportUploadStep.jsx';
import ImportPreviewStep from '../../components/studentImport/ImportPreviewStep.jsx';
import ImportResultStep from '../../components/studentImport/ImportResultStep.jsx';

export const StudentBulkImportPage = () => {
  const dispatch = useDispatch();
  const bulk = useSelector(selectBulkImport);
  const currentUser = useSelector(selectCurrentUser);
  const userRole = useSelector(selectUserRole);
  const isOperator = userRole === ROLES.OPERATOR || currentUser?.role === ROLES.OPERATOR;
  const operatorClass = [currentUser?.className, currentUser?.sectionName || currentUser?.section].filter(Boolean).join(' - ') || null;

  // Page chhodne par polling band + state saaf (photos server par chalti rehti hain)
  useEffect(() => {
    dispatch(resetBulkImport());
    return () => {
      dispatch(stopImportPolling());
      dispatch(resetBulkImport());
    };
  }, [dispatch]);

  const importId = bulk.preview?.importId;

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-4">
      <Link to={ROUTES.STUDENTS} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600">
        <ArrowLeft className="h-4 w-4" /> Back to Students
      </Link>

      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/30">
          <FileSpreadsheet className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">Student Bulk Import</h1>
        </div>
      </div>

      {isOperator && (
        <OperatorAssignmentBanner
          subjectName={currentUser?.subjectName}
          className={currentUser?.className}
          sectionName={currentUser?.sectionName || currentUser?.section}
          operatorName={currentUser?.name}
        />
      )}

      <ImportStepper step={bulk.step} />

      {bulk.error && (
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
          <span>{bulk.error}</span>
          <button type="button" onClick={() => dispatch(clearImportError())} className="rounded-lg p-0.5 text-rose-500 hover:bg-rose-100" aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {bulk.step === 'UPLOAD' && (
        <ImportUploadStep
          isOperator={isOperator}
          operatorClass={operatorClass}
          loading={bulk.previewLoading}
          downloading={bulk.downloading}
          onTemplate={() => dispatch(importDownloadRequested({ kind: 'template' }))}
          onPreview={(input) => dispatch(importPreviewRequested(input))}
        />
      )}

      {bulk.step === 'PREVIEW' && bulk.preview && (
        <ImportPreviewStep
          preview={bulk.preview}
          confirming={bulk.confirmLoading}
          downloading={bulk.downloading}
          onBack={() => dispatch(backToImportUpload())}
          onDownloadErrors={() => dispatch(importDownloadRequested({ kind: 'errors', importId }))}
          onConfirm={() => dispatch(importConfirmRequested({ importId, skipInvalid: true }))}
        />
      )}

      {(bulk.step === 'IMPORTING' || bulk.step === 'DONE') && (
        <ImportResultStep
          step={bulk.step}
          result={bulk.result}
          photoProgress={bulk.photoProgress}
          studentsPath={ROUTES.STUDENTS}
          downloading={bulk.downloading}
          onDownloadFailed={() => dispatch(importDownloadRequested({ kind: 'errors', importId }))}
          onImportAnother={() => dispatch(backToImportUpload())}
        />
      )}
    </div>
  );
};

export default StudentBulkImportPage;

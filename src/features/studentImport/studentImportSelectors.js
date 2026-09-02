/**
 * Student Bulk Import Selectors
 */

export const selectStudentImportState = (state) => state.studentImport;

export const selectImportFile = (state) => state.studentImport?.file || null;

export const selectImportStatus = (state) => state.studentImport?.status || 'IDLE';

export const selectImportLoading = (state) => Boolean(state.studentImport?.loading);

export const selectImportResult = (state) =>
  state.studentImport?.importResult || {
    totalRecords: 0,
    successCount: 0,
    failedCount: 0,
    errors: [],
  };

export const selectImportErrors = (state) =>
  state.studentImport?.importResult?.errors || [];

export const selectImportError = (state) => state.studentImport?.error || null;

export default {
  selectStudentImportState,
  selectImportFile,
  selectImportStatus,
  selectImportLoading,
  selectImportResult,
  selectImportErrors,
  selectImportError,
};


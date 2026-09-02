export const selectSuperAdminPrintState = (state) => state.superAdminPrint || {};

export const selectPrintSummary = (state) =>
  selectSuperAdminPrintState(state).summary || null;

export const selectPrintSummaryColleges = (state) =>
  selectPrintSummary(state)?.colleges || [];

export const selectSelectedCollegePrintDetails = (state) =>
  selectSuperAdminPrintState(state).selectedCollege || null;

export const selectPrintLoading = (state) =>
  Boolean(selectSuperAdminPrintState(state).loading);

export const selectPrintLoadingCollege = (state) =>
  Boolean(selectSuperAdminPrintState(state).loadingCollege);

export const selectPrintDownloading = (state) =>
  Boolean(selectSuperAdminPrintState(state).downloading);

export const selectPrintDownloadType = (state) =>
  selectSuperAdminPrintState(state).downloadType || null;

export const selectPrintCurrentDownload = (state) =>
  selectSuperAdminPrintState(state).currentDownload || null;

export const selectPrintError = (state) =>
  selectSuperAdminPrintState(state).error || null;

export const selectIsPrintInitialized = (state) =>
  Boolean(selectSuperAdminPrintState(state).initialized);

export default {
  selectSuperAdminPrintState,
  selectPrintSummary,
  selectPrintSummaryColleges,
  selectSelectedCollegePrintDetails,
  selectPrintLoading,
  selectPrintLoadingCollege,
  selectPrintDownloading,
  selectPrintDownloadType,
  selectPrintCurrentDownload,
  selectPrintError,
  selectIsPrintInitialized,
};

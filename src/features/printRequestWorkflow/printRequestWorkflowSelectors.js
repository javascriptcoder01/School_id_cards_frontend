// printRequestWorkflowSelectors.js

const EMPTY_PAGINATION = { page: 1, limit: 10, total: 0, totalPages: 0 };

export const selectPrintRequestWorkflowState = (state) => state.printRequestWorkflow;

// List
export const selectPrintRequests = (state) => state.printRequestWorkflow?.list?.items || [];
export const selectPrintRequestPagination = (state) => state.printRequestWorkflow?.list?.pagination || EMPTY_PAGINATION;
export const selectPrintRequestListParams = (state) => state.printRequestWorkflow?.list?.params || null;
export const selectPrintRequestsLoading = (state) => Boolean(state.printRequestWorkflow?.list?.loading);
export const selectPrintRequestsError = (state) => state.printRequestWorkflow?.list?.error || null;

// Summary (tab counts / sidebar badge)
export const selectPrintRequestCounts = (state) => state.printRequestWorkflow?.summary?.counts || {};
export const selectPrintRequestTotal = (state) => state.printRequestWorkflow?.summary?.total || 0;
export const selectPrintRequestCardCounts = (state) => state.printRequestWorkflow?.summary?.cardCounts || {};
export const selectPrintRequestSummaryParams = (state) => state.printRequestWorkflow?.summary?.params || null;
// Sidebar badge counts (bina filter)
export const selectPrintRequestBadgeCounts = (state) => state.printRequestWorkflow?.badges?.counts || {};
export const selectPrintRequestSummaryLoading = (state) => Boolean(state.printRequestWorkflow?.summary?.loading);

// Detail
export const selectPrintRequestDetail = (state) => state.printRequestWorkflow?.detail?.data?.request || null;
export const selectPrintRequestStudents = (state) => state.printRequestWorkflow?.detail?.data?.students || [];
export const selectPrintRequestDetailLoading = (state) => Boolean(state.printRequestWorkflow?.detail?.loading);
export const selectPrintRequestDetailError = (state) => state.printRequestWorkflow?.detail?.error || null;

// Form
export const selectPrintRequestSaving = (state) => Boolean(state.printRequestWorkflow?.form?.saving);
export const selectPrintRequestFormError = (state) => state.printRequestWorkflow?.form?.error || null;

// Status actions
export const selectPrintRequestLoadingAction = (state) => state.printRequestWorkflow?.actionState?.loadingAction || null;
export const selectPrintRequestActionError = (state) => state.printRequestWorkflow?.actionState?.error || null;

// Downloads
export const selectPrintRequestDownloadKey = (state) => state.printRequestWorkflow?.download?.loadingKey || null;
export const selectPrintRequestDownloadError = (state) => state.printRequestWorkflow?.download?.error || null;

// Wizard
export const selectWizardTemplates = (state) => state.printRequestWorkflow?.wizard?.templates?.items || [];
export const selectWizardTemplatesLoading = (state) => Boolean(state.printRequestWorkflow?.wizard?.templates?.loading);
export const selectWizardTemplatesError = (state) => state.printRequestWorkflow?.wizard?.templates?.error || null;
export const selectWizardStudents = (state) => state.printRequestWorkflow?.wizard?.students?.items || [];
export const selectWizardClassScope = (state) => state.printRequestWorkflow?.wizard?.students?.classScope;
export const selectWizardStudentsLoading = (state) => Boolean(state.printRequestWorkflow?.wizard?.students?.loading);
export const selectWizardStudentsError = (state) => state.printRequestWorkflow?.wizard?.students?.error || null;
export const selectCardPreviews = (state) => state.printRequestWorkflow?.wizard?.previews?.byStudentId || {};
export const selectCardPreviewsLoading = (state) => Boolean(state.printRequestWorkflow?.wizard?.previews?.loading);
export const selectCardPreviewsError = (state) => state.printRequestWorkflow?.wizard?.previews?.error || null;

// Request card previews (carousel): poora map ("requestId:studentId" → entry)
export const selectRequestCardPreviews = (state) => state.printRequestWorkflow?.cardPreviews?.byKey || {};

// Review step carousel cache: studentId → { data, loading, error } (sirf current template ka)
const EMPTY_MAP = {};
export const selectWizardCardPreviews = (state) => state.printRequestWorkflow?.wizard?.cardPreviews?.byStudentId || EMPTY_MAP;

export default {
  selectWizardCardPreviews,
  selectRequestCardPreviews,
  selectPrintRequestWorkflowState,
  selectPrintRequests,
  selectPrintRequestPagination,
  selectPrintRequestListParams,
  selectPrintRequestsLoading,
  selectPrintRequestsError,
  selectPrintRequestCounts,
  selectPrintRequestTotal,
  selectPrintRequestCardCounts,
  selectPrintRequestSummaryParams,
  selectPrintRequestBadgeCounts,
  selectPrintRequestSummaryLoading,
  selectPrintRequestDetail,
  selectPrintRequestStudents,
  selectPrintRequestDetailLoading,
  selectPrintRequestDetailError,
  selectPrintRequestSaving,
  selectPrintRequestFormError,
  selectPrintRequestLoadingAction,
  selectPrintRequestActionError,
  selectPrintRequestDownloadKey,
  selectPrintRequestDownloadError,
  selectWizardTemplates,
  selectWizardTemplatesLoading,
  selectWizardTemplatesError,
  selectWizardStudents,
  selectWizardClassScope,
  selectWizardStudentsLoading,
  selectWizardStudentsError,
  selectCardPreviews,
  selectCardPreviewsLoading,
  selectCardPreviewsError,
};

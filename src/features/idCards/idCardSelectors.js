// idCardSelectors.js

export const selectIdCardsState = (state) => state.idCards;

// Preview
export const selectIdCardPreview = (state) => state.idCards?.preview?.data || null;
export const selectIdCardPreviewLoading = (state) => Boolean(state.idCards?.preview?.loading);
export const selectIdCardPreviewError = (state) => state.idCards?.preview?.error || null;

// Templates (card page)
export const selectCardTemplates = (state) => state.idCards?.templates?.items || [];
export const selectCardTemplatesLoading = (state) => Boolean(state.idCards?.templates?.loading);
export const selectCardTemplatesError = (state) => state.idCards?.templates?.error || null;

// Student picker
export const selectCardStudents = (state) => state.idCards?.students?.items || [];
export const selectCardStudentsClassScope = (state) => state.idCards?.students?.classScope;
export const selectCardStudentsLoading = (state) => Boolean(state.idCards?.students?.loading);
export const selectCardStudentsError = (state) => state.idCards?.students?.error || null;

// Create batch

// Batches list
export const selectBatches = (state) => state.idCards?.batches?.items || [];
export const selectBatchPagination = (state) =>
  state.idCards?.batches?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 };
export const selectBatchFilters = (state) => state.idCards?.batches?.filters || { status: '' };
export const selectBatchesLoading = (state) => Boolean(state.idCards?.batches?.loading);
export const selectBatchesError = (state) => state.idCards?.batches?.error || null;

// Batch detail
export const selectCurrentBatch = (state) => state.idCards?.current?.batch || null;
export const selectCurrentBatchCards = (state) => state.idCards?.current?.cards || [];
export const selectCurrentBatchLoading = (state) => Boolean(state.idCards?.current?.loading);
export const selectCurrentBatchError = (state) => state.idCards?.current?.error || null;

// PDF download
export const selectDownloadingBatchId = (state) => state.idCards?.download?.loadingId || null;
export const selectDownloadError = (state) => state.idCards?.download?.error || null;

export default {
  selectIdCardsState,
  selectIdCardPreview,
  selectIdCardPreviewLoading,
  selectIdCardPreviewError,
  selectCardTemplates,
  selectCardTemplatesLoading,
  selectCardTemplatesError,
  selectCardStudents,
  selectCardStudentsClassScope,
  selectCardStudentsLoading,
  selectCardStudentsError,
  selectBatches,
  selectBatchPagination,
  selectBatchFilters,
  selectBatchesLoading,
  selectBatchesError,
  selectCurrentBatch,
  selectCurrentBatchCards,
  selectCurrentBatchLoading,
  selectCurrentBatchError,
  selectDownloadingBatchId,
  selectDownloadError,
};

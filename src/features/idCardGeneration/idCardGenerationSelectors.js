/**
 * ID Card Generation Selectors
 */

export const selectIdCardGenerationState = (state) => state.idCardGeneration;

export const selectGenerations = (state) => state.idCardGeneration?.generations || [];

export const selectSelectedGeneration = (state) =>
  state.idCardGeneration?.selectedGeneration || null;

export const selectGenerationResults = (state) =>
  state.idCardGeneration?.results || null;

export const selectGenerationPagination = (state) =>
  state.idCardGeneration?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 };

export const selectGenerationFilters = (state) =>
  state.idCardGeneration?.filters || { status: '', templateId: '', studentId: '' };

export const selectGenerationLoading = (state) =>
  state.idCardGeneration?.loading || {
    list: false,
    detail: false,
    create: false,
    process: false,
    results: false,
  };

export const selectGenerationsLoading = (state) =>
  Boolean(state.idCardGeneration?.loading?.list);

export const selectGenerationDetailLoading = (state) =>
  Boolean(state.idCardGeneration?.loading?.detail);

export const selectGenerationCreateLoading = (state) =>
  Boolean(state.idCardGeneration?.loading?.create);

export const selectGenerationProcessLoading = (state) =>
  Boolean(state.idCardGeneration?.loading?.process);

export const selectGenerationResultsLoading = (state) =>
  Boolean(state.idCardGeneration?.loading?.results);

export const selectGenerationError = (state) =>
  state.idCardGeneration?.error || null;

export default {
  selectIdCardGenerationState,
  selectGenerations,
  selectSelectedGeneration,
  selectGenerationResults,
  selectGenerationPagination,
  selectGenerationFilters,
  selectGenerationLoading,
  selectGenerationsLoading,
  selectGenerationDetailLoading,
  selectGenerationCreateLoading,
  selectGenerationProcessLoading,
  selectGenerationResultsLoading,
  selectGenerationError,
};


export const selectOperatorState = (state) => state.operator || {};

export const selectOperatorDashboard = (state) =>
  selectOperatorState(state).dashboard || null;

export const selectOperatorSummary = (state) =>
  selectOperatorDashboard(state)?.summary || {};

export const selectOperatorAssignments = (state) =>
  selectOperatorDashboard(state)?.assignments || [];

export const selectOperatorStudents = (state) =>
  selectOperatorState(state).students || [];

export const selectSelectedOperatorStudent = (state) =>
  selectOperatorState(state).selectedStudent || null;

export const selectOperatorPagination = (state) =>
  selectOperatorState(state).pagination || { page: 1, limit: 20, total: 0, totalPages: 0 };

export const selectOperatorTemplates = (state) =>
  selectOperatorState(state).templates || [];

export const selectOperatorPreview = (state) =>
  selectOperatorState(state).preview || null;

export const selectOperatorGenerations = (state) =>
  selectOperatorState(state).generations || [];

export const selectOperatorGenerationsPagination = (state) =>
  selectOperatorState(state).generationsPagination || { page: 1, limit: 20, total: 0, totalPages: 0 };

export const selectOperatorLoading = (state) =>
  Boolean(selectOperatorState(state).loading);

export const selectOperatorLoadingStudents = (state) =>
  Boolean(selectOperatorState(state).loadingStudents);

export const selectOperatorLoadingTemplates = (state) =>
  Boolean(selectOperatorState(state).loadingTemplates);

export const selectOperatorLoadingGenerations = (state) =>
  Boolean(selectOperatorState(state).loadingGenerations);

export const selectOperatorSaving = (state) =>
  Boolean(selectOperatorState(state).saving);

export const selectOperatorImporting = (state) =>
  Boolean(selectOperatorState(state).importing);

export const selectOperatorPreviewing = (state) =>
  Boolean(selectOperatorState(state).previewing);

export const selectOperatorGenerating = (state) =>
  Boolean(selectOperatorState(state).generating);

export const selectOperatorError = (state) =>
  selectOperatorState(state).error || null;

export const selectIsOperatorInitialized = (state) =>
  Boolean(selectOperatorState(state).initialized);

export default {
  selectOperatorState,
  selectOperatorDashboard,
  selectOperatorSummary,
  selectOperatorAssignments,
  selectOperatorStudents,
  selectSelectedOperatorStudent,
  selectOperatorPagination,
  selectOperatorTemplates,
  selectOperatorPreview,
  selectOperatorGenerations,
  selectOperatorGenerationsPagination,
  selectOperatorLoading,
  selectOperatorLoadingStudents,
  selectOperatorLoadingTemplates,
  selectOperatorLoadingGenerations,
  selectOperatorSaving,
  selectOperatorImporting,
  selectOperatorPreviewing,
  selectOperatorGenerating,
  selectOperatorError,
  selectIsOperatorInitialized,
};

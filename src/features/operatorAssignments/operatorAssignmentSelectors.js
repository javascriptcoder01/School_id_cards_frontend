export const selectOperatorAssignmentsState = (state) => state.operatorAssignments || {};

export const selectOperatorAssignments = (state) =>
  selectOperatorAssignmentsState(state).assignments || [];

export const selectOperatorAssignmentsPagination = (state) =>
  selectOperatorAssignmentsState(state).pagination || { page: 1, limit: 20, total: 0, totalPages: 0 };

export const selectOperatorAssignmentsLoading = (state) =>
  Boolean(selectOperatorAssignmentsState(state).loading);

export const selectOperatorAssignmentsSaving = (state) =>
  Boolean(selectOperatorAssignmentsState(state).saving);

export const selectOperatorAssignmentsDeleting = (state) =>
  Boolean(selectOperatorAssignmentsState(state).deleting);

export const selectOperatorAssignmentsError = (state) =>
  selectOperatorAssignmentsState(state).error || null;

export const selectIsOperatorAssignmentsInitialized = (state) =>
  Boolean(selectOperatorAssignmentsState(state).initialized);

export default {
  selectOperatorAssignmentsState,
  selectOperatorAssignments,
  selectOperatorAssignmentsPagination,
  selectOperatorAssignmentsLoading,
  selectOperatorAssignmentsSaving,
  selectOperatorAssignmentsDeleting,
  selectOperatorAssignmentsError,
  selectIsOperatorAssignmentsInitialized,
};


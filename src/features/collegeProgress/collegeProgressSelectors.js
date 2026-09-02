const EMPTY_OBJ = Object.freeze({});
const EMPTY_ARR = Object.freeze([]);

export const selectCollegeProgressState = (state) => state.collegeProgress || EMPTY_OBJ;

export const selectCollegeProgress = (state) =>
  selectCollegeProgressState(state).progress || null;

export const selectCollegeProgressSummary = (state) =>
  selectCollegeProgress(state)?.summary || EMPTY_OBJ;

export const selectCollegeProgressOperators = (state) =>
  selectCollegeProgress(state)?.operators || EMPTY_ARR;

export const selectCollegeProgressLoading = (state) =>
  Boolean(selectCollegeProgressState(state).loading);

export const selectCollegeProgressError = (state) =>
  selectCollegeProgressState(state).error || null;

export const selectIsCollegeProgressInitialized = (state) =>
  Boolean(selectCollegeProgressState(state).initialized);

export default {
  selectCollegeProgressState,
  selectCollegeProgress,
  selectCollegeProgressSummary,
  selectCollegeProgressOperators,
  selectCollegeProgressLoading,
  selectCollegeProgressError,
  selectIsCollegeProgressInitialized,
};

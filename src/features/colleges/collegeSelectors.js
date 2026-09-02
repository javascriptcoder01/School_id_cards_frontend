/**
 * College Management Feature Selectors
 */

export const selectCollegesState = (state) => state.colleges;

export const selectCollegesList = (state) => state.colleges?.colleges || [];

export const selectSelectedCollege = (state) => state.colleges?.selectedCollege || null;

export const selectCollegePagination = (state) =>
  state.colleges?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 };

export const selectCollegeFilters = (state) =>
  state.colleges?.filters || { search: '', isActive: '' };

export const selectCollegeListLoading = (state) => Boolean(state.colleges?.listLoading);

export const selectCollegeDetailLoading = (state) => Boolean(state.colleges?.detailLoading);

export const selectCollegeCreateLoading = (state) => Boolean(state.colleges?.createLoading);

export const selectCollegeUpdateLoading = (state) => Boolean(state.colleges?.updateLoading);

export const selectCollegeStatusLoading = (state) => Boolean(state.colleges?.statusLoading);

export const selectCollegeListError = (state) => state.colleges?.listError || null;

export const selectCollegeDetailError = (state) => state.colleges?.detailError || null;

export const selectCollegeCreateError = (state) => state.colleges?.createError || null;

export const selectCollegeUpdateError = (state) => state.colleges?.updateError || null;

export const selectCollegeStatusError = (state) => state.colleges?.statusError || null;

export default {
  selectCollegesState,
  selectCollegesList,
  selectSelectedCollege,
  selectCollegePagination,
  selectCollegeFilters,
  selectCollegeListLoading,
  selectCollegeDetailLoading,
  selectCollegeCreateLoading,
  selectCollegeUpdateLoading,
  selectCollegeStatusLoading,
  selectCollegeListError,
  selectCollegeDetailError,
  selectCollegeCreateError,
  selectCollegeUpdateError,
  selectCollegeStatusError,
};


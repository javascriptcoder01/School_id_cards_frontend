/**
 * Student Management Feature Selectors
 */

export const selectStudentsState = (state) => state.students;

export const selectStudents = (state) => state.students?.students || [];

export const selectSelectedStudent = (state) => state.students?.selectedStudent || null;

export const selectStudentPagination = (state) =>
  state.students?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 };

export const selectStudentFilters = (state) =>
  state.students?.filters || { search: '' };

export const selectStudentsLoading = (state) => Boolean(state.students?.loading?.list);
export const selectStudentDetailLoading = (state) => Boolean(state.students?.loading?.detail);
export const selectStudentCreateLoading = (state) => Boolean(state.students?.loading?.create);
export const selectStudentUpdateLoading = (state) => Boolean(state.students?.loading?.update);
export const selectStudentStatusLoading = (state) => Boolean(state.students?.loading?.statusUpdate);

export const selectStudentsError = (state) => state.students?.errors?.list || null;
export const selectStudentDetailError = (state) => state.students?.errors?.detail || null;
export const selectStudentCreateError = (state) => state.students?.errors?.create || null;
export const selectStudentUpdateError = (state) => state.students?.errors?.update || null;
export const selectStudentStatusError = (state) => state.students?.errors?.statusUpdate || null;

export default {
  selectStudentsState,
  selectStudents,
  selectSelectedStudent,
  selectStudentPagination,
  selectStudentFilters,
  selectStudentsLoading,
  selectStudentDetailLoading,
  selectStudentCreateLoading,
  selectStudentUpdateLoading,
  selectStudentStatusLoading,
  selectStudentsError,
  selectStudentDetailError,
  selectStudentCreateError,
  selectStudentUpdateError,
  selectStudentStatusError,
};


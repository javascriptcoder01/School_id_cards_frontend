import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  students: [],
  selectedStudent: null,

  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  filters: {
    search: '',
  },

  loading: {
    list: false,
    detail: false,
    create: false,
    update: false,
    statusUpdate: false,
  },

  errors: {
    list: null,
    detail: null,
    create: null,
    update: null,
    statusUpdate: null,
  },
};

export const studentSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    // List Students Actions
    fetchStudentsRequested: (state) => {
      state.loading.list = true;
      state.errors.list = null;
    },
    fetchStudentsSucceeded: (state, action) => {
      state.loading.list = false;
      state.students = action.payload.students || [];
      const pag = action.payload.pagination || {};
      state.pagination = {
        page: pag.page || state.pagination.page,
        limit: pag.limit || state.pagination.limit,
        total: pag.totalItems !== undefined ? pag.totalItems : (pag.total || 0),
        totalPages: pag.totalPages !== undefined ? pag.totalPages : 0,
      };
      state.errors.list = null;
    },
    fetchStudentsFailed: (state, action) => {
      state.loading.list = false;
      state.errors.list = action.payload || 'Failed to fetch students';
    },

    // Detail Student Actions
    fetchStudentRequested: (state) => {
      state.loading.detail = true;
      state.errors.detail = null;
    },
    fetchStudentSucceeded: (state, action) => {
      state.loading.detail = false;
      state.selectedStudent = action.payload;
      state.errors.detail = null;
    },
    fetchStudentFailed: (state, action) => {
      state.loading.detail = false;
      state.errors.detail = action.payload || 'Failed to fetch student details';
    },

    // Create Student Actions
    createStudentRequested: (state) => {
      state.loading.create = true;
      state.errors.create = null;
    },
    createStudentSucceeded: (state, action) => {
      state.loading.create = false;
      state.errors.create = null;
      if (action.payload && action.payload.id) {
        state.students = [action.payload, ...state.students];
      }
    },
    createStudentFailed: (state, action) => {
      state.loading.create = false;
      state.errors.create = action.payload || 'Failed to create student';
    },

    // Update Student Actions
    updateStudentRequested: (state) => {
      state.loading.update = true;
      state.errors.update = null;
    },
    updateStudentSucceeded: (state, action) => {
      state.loading.update = false;
      state.errors.update = null;
      state.selectedStudent = action.payload;
      if (action.payload && action.payload.id) {
        state.students = state.students.map((s) =>
          s.id === action.payload.id ? action.payload : s
        );
      }
    },
    updateStudentFailed: (state, action) => {
      state.loading.update = false;
      state.errors.update = action.payload || 'Failed to update student';
    },

    // Update Student Status Actions
    updateStudentStatusRequested: (state) => {
      state.loading.statusUpdate = true;
      state.errors.statusUpdate = null;
    },
    updateStudentStatusSucceeded: (state, action) => {
      state.loading.statusUpdate = false;
      state.errors.statusUpdate = null;
      const updated = action.payload;
      if (state.selectedStudent && state.selectedStudent.id === updated.id) {
        state.selectedStudent = { ...state.selectedStudent, isActive: updated.isActive };
      }
      state.students = state.students.map((s) =>
        s.id === updated.id ? { ...s, isActive: updated.isActive } : s
      );
    },
    updateStudentStatusFailed: (state, action) => {
      state.loading.statusUpdate = false;
      state.errors.statusUpdate = action.payload || 'Failed to update student status';
    },

    // Filter & Pagination Actions
    setStudentFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
      state.pagination.page = 1;
    },
    resetStudentFilters: (state) => {
      state.filters = { search: '' };
      state.pagination.page = 1;
    },
    setStudentPagination: (state, action) => {
      state.pagination = {
        ...state.pagination,
        ...action.payload,
      };
    },
    clearSelectedStudent: (state) => {
      state.selectedStudent = null;
      state.errors.detail = null;
    },
    clearStudentErrors: (state) => {
      state.errors.list = null;
      state.errors.detail = null;
      state.errors.create = null;
      state.errors.update = null;
      state.errors.statusUpdate = null;
    },
  },
});

export const {
  fetchStudentsRequested,
  fetchStudentsSucceeded,
  fetchStudentsFailed,
  fetchStudentRequested,
  fetchStudentSucceeded,
  fetchStudentFailed,
  createStudentRequested,
  createStudentSucceeded,
  createStudentFailed,
  updateStudentRequested,
  updateStudentSucceeded,
  updateStudentFailed,
  updateStudentStatusRequested,
  updateStudentStatusSucceeded,
  updateStudentStatusFailed,
  setStudentFilters,
  resetStudentFilters,
  setStudentPagination,
  clearSelectedStudent,
  clearStudentErrors,
} = studentSlice.actions;

export default studentSlice.reducer;


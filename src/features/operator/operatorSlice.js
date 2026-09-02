import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  dashboard: null,
  students: [],
  selectedStudent: null,
  templates: [],
  preview: null,
  generations: [],
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  generationsPagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  loading: false,
  loadingStudents: false,
  loadingTemplates: false,
  loadingGenerations: false,
  saving: false,
  importing: false,
  previewing: false,
  generating: false,
  error: null,
  initialized: false,
};

export const operatorSlice = createSlice({
  name: 'operator',
  initialState,
  reducers: {
    // 1. Dashboard
    loadOperatorDashboardRequested: (state) => {
      state.loading = true;
      state.error = null;
    },
    loadOperatorDashboardSucceeded: (state, action) => {
      state.loading = false;
      state.initialized = true;
      state.dashboard = action.payload || null;
      state.error = null;
    },
    loadOperatorDashboardFailed: (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to load operator dashboard';
    },

    // 2. Students List
    loadOperatorStudentsRequested: (state) => {
      state.loadingStudents = true;
      state.error = null;
    },
    loadOperatorStudentsSucceeded: (state, action) => {
      state.loadingStudents = false;
      state.students = action.payload?.students || [];
      state.pagination = action.payload?.pagination || initialState.pagination;
      state.error = null;
    },
    loadOperatorStudentsFailed: (state, action) => {
      state.loadingStudents = false;
      state.error = action.payload || 'Failed to load students';
    },

    // 3. Single Student
    loadOperatorStudentRequested: (state) => {
      state.loadingStudents = true;
      state.error = null;
    },
    loadOperatorStudentSucceeded: (state, action) => {
      state.loadingStudents = false;
      state.selectedStudent = action.payload?.student || action.payload || null;
      state.error = null;
    },
    loadOperatorStudentFailed: (state, action) => {
      state.loadingStudents = false;
      state.error = action.payload || 'Failed to load student details';
    },

    // 4. Create Student
    createOperatorStudentRequested: (state) => {
      state.saving = true;
      state.error = null;
    },
    createOperatorStudentSucceeded: (state, action) => {
      state.saving = false;
      const created = action.payload?.student || action.payload;
      if (created) {
        state.students.unshift(created);
      }
      state.error = null;
    },
    createOperatorStudentFailed: (state, action) => {
      state.saving = false;
      state.error = action.payload || 'Failed to create student';
    },

    // 5. Update Student
    updateOperatorStudentRequested: (state) => {
      state.saving = true;
      state.error = null;
    },
    updateOperatorStudentSucceeded: (state, action) => {
      state.saving = false;
      const updated = action.payload?.student || action.payload;
      if (updated) {
        const id = updated.id || updated._id;
        state.students = state.students.map((s) => ((s.id || s._id) === id ? updated : s));
        if (state.selectedStudent && (state.selectedStudent.id || state.selectedStudent._id) === id) {
          state.selectedStudent = updated;
        }
      }
      state.error = null;
    },
    updateOperatorStudentFailed: (state, action) => {
      state.saving = false;
      state.error = action.payload || 'Failed to update student';
    },

    // 6. Import Students
    importOperatorStudentsRequested: (state) => {
      state.importing = true;
      state.error = null;
    },
    importOperatorStudentsSucceeded: (state) => {
      state.importing = false;
      state.error = null;
    },
    importOperatorStudentsFailed: (state, action) => {
      state.importing = false;
      state.error = action.payload || 'Failed to import students';
    },

    // 7. Templates (Read-only)
    loadOperatorTemplatesRequested: (state) => {
      state.loadingTemplates = true;
      state.error = null;
    },
    loadOperatorTemplatesSucceeded: (state, action) => {
      state.loadingTemplates = false;
      state.templates = action.payload?.templates || action.payload || [];
      state.error = null;
    },
    loadOperatorTemplatesFailed: (state, action) => {
      state.loadingTemplates = false;
      state.error = action.payload || 'Failed to load templates';
    },

    // 8. ID Card Preview
    previewOperatorIdCardRequested: (state) => {
      state.previewing = true;
      state.error = null;
    },
    previewOperatorIdCardSucceeded: (state, action) => {
      state.previewing = false;
      state.preview = action.payload || null;
      state.error = null;
    },
    previewOperatorIdCardFailed: (state, action) => {
      state.previewing = false;
      state.error = action.payload || 'Failed to generate preview';
    },
    clearOperatorPreview: (state) => {
      state.preview = null;
    },

    // 9. Generations
    createOperatorGenerationRequested: (state) => {
      state.generating = true;
      state.error = null;
    },
    createOperatorGenerationSucceeded: (state, action) => {
      state.generating = false;
      const created = action.payload?.generation || action.payload;
      if (created) {
        state.generations.unshift(created);
      }
      state.error = null;
    },
    createOperatorGenerationFailed: (state, action) => {
      state.generating = false;
      state.error = action.payload || 'Failed to submit generation job';
    },

    loadOperatorGenerationsRequested: (state) => {
      state.loadingGenerations = true;
      state.error = null;
    },
    loadOperatorGenerationsSucceeded: (state, action) => {
      state.loadingGenerations = false;
      state.generations = action.payload?.generations || action.payload || [];
      state.generationsPagination = action.payload?.pagination || initialState.generationsPagination;
      state.error = null;
    },
    loadOperatorGenerationsFailed: (state, action) => {
      state.loadingGenerations = false;
      state.error = action.payload || 'Failed to load generations';
    },

    // 10. Clear & Reset
    clearSelectedOperatorStudent: (state) => {
      state.selectedStudent = null;
    },
    clearOperatorError: (state) => {
      state.error = null;
    },
    resetOperatorState: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase('auth/logoutSucceeded', () => initialState);
    builder.addCase('auth/logout', () => initialState);
  },
});

export const {
  loadOperatorDashboardRequested,
  loadOperatorDashboardSucceeded,
  loadOperatorDashboardFailed,
  loadOperatorStudentsRequested,
  loadOperatorStudentsSucceeded,
  loadOperatorStudentsFailed,
  loadOperatorStudentRequested,
  loadOperatorStudentSucceeded,
  loadOperatorStudentFailed,
  createOperatorStudentRequested,
  createOperatorStudentSucceeded,
  createOperatorStudentFailed,
  updateOperatorStudentRequested,
  updateOperatorStudentSucceeded,
  updateOperatorStudentFailed,
  importOperatorStudentsRequested,
  importOperatorStudentsSucceeded,
  importOperatorStudentsFailed,
  loadOperatorTemplatesRequested,
  loadOperatorTemplatesSucceeded,
  loadOperatorTemplatesFailed,
  previewOperatorIdCardRequested,
  previewOperatorIdCardSucceeded,
  previewOperatorIdCardFailed,
  clearOperatorPreview,
  createOperatorGenerationRequested,
  createOperatorGenerationSucceeded,
  createOperatorGenerationFailed,
  loadOperatorGenerationsRequested,
  loadOperatorGenerationsSucceeded,
  loadOperatorGenerationsFailed,
  clearSelectedOperatorStudent,
  clearOperatorError,
  resetOperatorState,
} = operatorSlice.actions;

export default operatorSlice.reducer;

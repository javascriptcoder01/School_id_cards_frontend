import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  file: null,
  status: 'IDLE', // 'IDLE' | 'UPLOADING' | 'COMPLETED' | 'FAILED'
  importResult: {
    totalRecords: 0,
    successCount: 0,
    failedCount: 0,
    errors: [],
  },
  loading: false,
  error: null,
};

export const studentImportSlice = createSlice({
  name: 'studentImport',
  initialState,
  reducers: {
    importStudentsRequested: (state, action) => {
      state.loading = true;
      state.status = 'UPLOADING';
      state.error = null;
      state.file = action.payload?.name || (typeof action.payload === 'string' ? action.payload : 'uploaded-file');
      state.importResult = {
        totalRecords: 0,
        successCount: 0,
        failedCount: 0,
        errors: [],
      };
    },
    importStudentsSucceeded: (state, action) => {
      state.loading = false;
      state.status = 'COMPLETED';
      state.error = null;
      const res = action.payload || {};
      state.importResult = {
        totalRecords: res.totalRecords ?? 0,
        successCount: res.successCount ?? 0,
        failedCount: res.failedCount ?? 0,
        errors: res.errors || [],
      };
    },
    importStudentsFailed: (state, action) => {
      state.loading = false;
      state.status = 'FAILED';
      state.error = action.payload || 'Failed to import students';
    },
    resetImportState: () => initialState,
  },
});

export const {
  importStudentsRequested,
  importStudentsSucceeded,
  importStudentsFailed,
  resetImportState,
} = studentImportSlice.actions;

export default studentImportSlice.reducer;


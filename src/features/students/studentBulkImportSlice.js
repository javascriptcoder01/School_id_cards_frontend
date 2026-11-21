// studentBulkImportSlice.js — Students feature ka Bulk Import (Excel / CSV + photos): UPLOAD → PREVIEW → IMPORTING → DONE.
// Alag reducer key (studentBulkImport), taaki students slice ka shape waisa hi rahe.
import { createSlice } from '@reduxjs/toolkit';

export const initialBulkImportState = {
  step: 'UPLOAD',
  preview: null, // { importId, totals, rows, unknownHeaders, photoFiles, ... }
  result: null, // { created, skipped, failed[], students[] }
  photoProgress: null, // { status, total, processed, uploaded, failed, failures[] }
  previewLoading: false,
  confirmLoading: false,
  downloading: null, // 'template' | 'errors'
  error: null,
};

export const studentBulkImportSlice = createSlice({
  name: 'studentBulkImport',
  initialState: initialBulkImportState,
  reducers: {
    importPreviewRequested: (state) => {
      state.previewLoading = true;
      state.error = null;
    },
    importPreviewSucceeded: (state, action) => {
      state.previewLoading = false;
      state.preview = action.payload;
      state.step = 'PREVIEW';
    },
    importPreviewFailed: (state, action) => {
      state.previewLoading = false;
      state.error = action.payload || 'Could not read the file';
    },
    importConfirmRequested: (state) => {
      state.confirmLoading = true;
      state.error = null;
    },
    importConfirmSucceeded: (state, action) => {
      const { photoProgress = null, ...result } = action.payload || {};
      state.confirmLoading = false;
      state.result = result;
      state.photoProgress = photoProgress;
      state.step = photoProgress?.status === 'RUNNING' ? 'IMPORTING' : 'DONE';
    },
    importConfirmFailed: (state, action) => {
      state.confirmLoading = false;
      state.error = action.payload || 'Import failed';
    },
    // Polling (saga sunta hai)
    startImportPolling: () => {},
    stopImportPolling: () => {},
    importStatusSucceeded: (state, action) => {
      const progress = action.payload?.photoProgress || null;
      state.photoProgress = progress;
      if (!progress || progress.status !== 'RUNNING') state.step = 'DONE';
    },
    importDownloadRequested: (state, action) => {
      state.downloading = action.payload?.kind || null;
    },
    importDownloadFinished: (state, action) => {
      state.downloading = null;
      if (action.payload?.error) state.error = action.payload.error;
    },
    backToImportUpload: () => ({ ...initialBulkImportState }),
    clearImportError: (state) => {
      state.error = null;
    },
    resetBulkImport: () => ({ ...initialBulkImportState }),
  },
});

export const {
  importPreviewRequested,
  importPreviewSucceeded,
  importPreviewFailed,
  importConfirmRequested,
  importConfirmSucceeded,
  importConfirmFailed,
  startImportPolling,
  stopImportPolling,
  importStatusSucceeded,
  importDownloadRequested,
  importDownloadFinished,
  backToImportUpload,
  clearImportError,
  resetBulkImport,
} = studentBulkImportSlice.actions;

export const selectBulkImport = (state) => state.studentBulkImport || initialBulkImportState;

export default studentBulkImportSlice.reducer;

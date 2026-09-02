import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  summary: null,
  selectedCollege: null,
  loading: false,
  loadingCollege: false,
  downloading: false,
  downloadType: null, // 'PNG' | 'ZIP' | 'PDF'
  currentDownload: null,
  error: null,
  initialized: false,
};

export const superAdminPrintSlice = createSlice({
  name: 'superAdminPrint',
  initialState,
  reducers: {
    // 1. Print Summary
    loadPrintSummaryRequested: (state) => {
      state.loading = true;
      state.error = null;
    },
    loadPrintSummarySucceeded: (state, action) => {
      state.loading = false;
      state.initialized = true;
      state.summary = action.payload || null;
      state.error = null;
    },
    loadPrintSummaryFailed: (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to load print summary';
    },

    // 2. College Print Details
    loadCollegePrintDetailsRequested: (state) => {
      state.loadingCollege = true;
      state.error = null;
    },
    loadCollegePrintDetailsSucceeded: (state, action) => {
      state.loadingCollege = false;
      state.selectedCollege = action.payload || null;
      state.error = null;
    },
    loadCollegePrintDetailsFailed: (state, action) => {
      state.loadingCollege = false;
      state.error = action.payload || 'Failed to load college print details';
    },

    // 3. Download PNG
    downloadResultPngRequested: (state, action) => {
      state.downloading = true;
      state.downloadType = 'PNG';
      state.currentDownload = action.payload?.resultId || action.payload;
      state.error = null;
    },
    downloadResultPngSucceeded: (state) => {
      state.downloading = false;
      state.downloadType = null;
      state.currentDownload = null;
      state.error = null;
    },
    downloadResultPngFailed: (state, action) => {
      state.downloading = false;
      state.downloadType = null;
      state.currentDownload = null;
      state.error = action.payload || 'Failed to download card PNG';
    },

    // 4. Download College ZIP
    downloadCollegeZipRequested: (state, action) => {
      state.downloading = true;
      state.downloadType = 'ZIP';
      state.currentDownload = action.payload?.collegeId || action.payload;
      state.error = null;
    },
    downloadCollegeZipSucceeded: (state) => {
      state.downloading = false;
      state.downloadType = null;
      state.currentDownload = null;
      state.error = null;
    },
    downloadCollegeZipFailed: (state, action) => {
      state.downloading = false;
      state.downloadType = null;
      state.currentDownload = null;
      state.error = action.payload || 'Failed to download college ZIP package';
    },

    // 5. Download College PDF
    downloadCollegePdfRequested: (state, action) => {
      state.downloading = true;
      state.downloadType = 'PDF';
      state.currentDownload = action.payload?.collegeId || action.payload;
      state.error = null;
    },
    downloadCollegePdfSucceeded: (state) => {
      state.downloading = false;
      state.downloadType = null;
      state.currentDownload = null;
      state.error = null;
    },
    downloadCollegePdfFailed: (state, action) => {
      state.downloading = false;
      state.downloadType = null;
      state.currentDownload = null;
      state.error = action.payload || 'Failed to export print-ready PDF';
    },

    // 6. Clear / Reset
    clearSelectedCollegePrintDetails: (state) => {
      state.selectedCollege = null;
    },
    clearSuperAdminPrintError: (state) => {
      state.error = null;
    },
    resetSuperAdminPrintState: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase('auth/logoutSucceeded', () => initialState);
    builder.addCase('auth/logout', () => initialState);
  },
});

export const {
  loadPrintSummaryRequested,
  loadPrintSummarySucceeded,
  loadPrintSummaryFailed,
  loadCollegePrintDetailsRequested,
  loadCollegePrintDetailsSucceeded,
  loadCollegePrintDetailsFailed,
  downloadResultPngRequested,
  downloadResultPngSucceeded,
  downloadResultPngFailed,
  downloadCollegeZipRequested,
  downloadCollegeZipSucceeded,
  downloadCollegeZipFailed,
  downloadCollegePdfRequested,
  downloadCollegePdfSucceeded,
  downloadCollegePdfFailed,
  clearSelectedCollegePrintDetails,
  clearSuperAdminPrintError,
  resetSuperAdminPrintState,
} = superAdminPrintSlice.actions;

export default superAdminPrintSlice.reducer;

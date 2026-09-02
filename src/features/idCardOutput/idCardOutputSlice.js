import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  downloadStatus: 'IDLE', // 'IDLE' | 'DOWNLOADING' | 'SUCCESS' | 'FAILED'
  downloadingType: null, // 'PNG' | 'ZIP' | null
  currentDownload: null, // { generationId, studentId, type } | null
  error: null,
};

export const idCardOutputSlice = createSlice({
  name: 'idCardOutput',
  initialState,
  reducers: {
    downloadStudentCardRequested: (state, action) => {
      state.downloadStatus = 'DOWNLOADING';
      state.downloadingType = 'PNG';
      state.currentDownload = {
        generationId: action.payload?.generationId,
        studentId: action.payload?.studentId,
        type: 'PNG',
      };
      state.error = null;
    },
    downloadStudentCardSucceeded: (state) => {
      state.downloadStatus = 'SUCCESS';
      state.downloadingType = null;
      state.currentDownload = null;
      state.error = null;
    },
    downloadStudentCardFailed: (state, action) => {
      state.downloadStatus = 'FAILED';
      state.downloadingType = null;
      state.currentDownload = null;
      state.error = action.payload?.error || action.payload || 'Failed to download student ID card';
    },

    downloadGenerationZipRequested: (state, action) => {
      state.downloadStatus = 'DOWNLOADING';
      state.downloadingType = 'ZIP';
      state.currentDownload = {
        generationId: action.payload?.generationId,
        type: 'ZIP',
      };
      state.error = null;
    },
    downloadGenerationZipSucceeded: (state) => {
      state.downloadStatus = 'SUCCESS';
      state.downloadingType = null;
      state.currentDownload = null;
      state.error = null;
    },
    downloadGenerationZipFailed: (state, action) => {
      state.downloadStatus = 'FAILED';
      state.downloadingType = null;
      state.currentDownload = null;
      state.error = action.payload?.error || action.payload || 'Failed to download generation ZIP archive';
    },

    resetDownloadState: () => initialState,
  },
});

export const {
  downloadStudentCardRequested,
  downloadStudentCardSucceeded,
  downloadStudentCardFailed,
  downloadGenerationZipRequested,
  downloadGenerationZipSucceeded,
  downloadGenerationZipFailed,
  resetDownloadState,
} = idCardOutputSlice.actions;

export default idCardOutputSlice.reducer;


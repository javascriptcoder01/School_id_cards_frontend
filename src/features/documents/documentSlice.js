// documentSlice.js — composer (generate, preview) + history (list, saved copy download).
// PDF Blob store mein nahi — preview ka sirf object URL; generate / download seedha file save.
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  generating: false,
  generateError: null,
  lastGenerated: null, // { refNo, pageCount, documentId }
  preview: { url: null, refNo: null, pageCount: null, loading: false, error: null },
  history: { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }, params: null, loading: false, error: null },
  downloadingId: null,
};

export const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    // payload: { body, onSuccess }
    generateDocumentRequested: (state) => {
      state.generating = true;
      state.generateError = null;
    },
    generateDocumentSucceeded: (state, action) => {
      state.generating = false;
      state.lastGenerated = action.payload;
    },
    generateDocumentFailed: (state, action) => {
      state.generating = false;
      state.generateError = action.payload;
    },
    clearGenerateError: (state) => {
      state.generateError = null;
    },

    // payload: { body }
    documentPreviewRequested: (state) => {
      state.preview.loading = true;
      state.preview.error = null;
    },
    documentPreviewSucceeded: (state, action) => {
      state.preview = { ...state.preview, ...action.payload, loading: false, error: null };
    },
    documentPreviewFailed: (state, action) => {
      state.preview.loading = false;
      state.preview.error = action.payload;
    },
    // payload: { url } → saga wo URL free karta hai
    documentPreviewCleared: (state) => {
      state.preview = { ...initialState.preview };
    },

    fetchDocumentsRequested: (state, action) => {
      state.history.loading = true;
      state.history.error = null;
      state.history.params = action.payload || {};
    },
    fetchDocumentsSucceeded: (state, action) => {
      state.history.loading = false;
      state.history.items = action.payload?.documents || [];
      state.history.pagination = action.payload?.pagination || state.history.pagination;
    },
    fetchDocumentsFailed: (state, action) => {
      state.history.loading = false;
      state.history.error = action.payload;
    },

    // payload: { id, refNo }
    downloadDocumentRequested: (state, action) => {
      state.downloadingId = action.payload?.id || null;
    },
    downloadDocumentFinished: (state) => {
      state.downloadingId = null;
    },
  },
});

export const {
  generateDocumentRequested,
  generateDocumentSucceeded,
  generateDocumentFailed,
  clearGenerateError,
  documentPreviewRequested,
  documentPreviewSucceeded,
  documentPreviewFailed,
  documentPreviewCleared,
  fetchDocumentsRequested,
  fetchDocumentsSucceeded,
  fetchDocumentsFailed,
  downloadDocumentRequested,
  downloadDocumentFinished,
} = documentSlice.actions;

export default documentSlice.reducer;

// idCardSlice.js
// ID card preview + batches. PDF blob kabhi store mein nahi aata (saga seedha download karwata hai).
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Ek student ka renderData (POST /id-cards/preview)
  preview: {
    data: null,
    loading: false,
    error: null,
  },

  // Card page ke dropdown ke templates
  templates: {
    items: [],
    loading: false,
    error: null,
  },

  // Card page ka student picker (students list page se alag state)
  students: {
    items: [],
    classScope: undefined, // OPERATOR: backend se class; null = class assign nahi
    loading: false,
    error: null,
  },

  batches: {
    items: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    filters: { status: '' },
    loading: false,
    error: null,
  },

  current: {
    batch: null,
    cards: [],
    loading: false,
    error: null,
  },


  download: {
    loadingId: null,
    error: null,
  },
};

export const idCardSlice = createSlice({
  name: 'idCards',
  initialState,
  reducers: {
    // Preview
    previewIdCardRequested: (state) => {
      state.preview.loading = true;
      state.preview.error = null;
    },
    previewIdCardSucceeded: (state, action) => {
      state.preview.loading = false;
      state.preview.data = action.payload || null;
    },
    previewIdCardFailed: (state, action) => {
      state.preview.loading = false;
      state.preview.data = null;
      state.preview.error = action.payload || 'Failed to load card preview';
    },
    clearIdCardPreview: (state) => {
      state.preview = { ...initialState.preview };
    },

    // Templates for the card page
    fetchCardTemplatesRequested: (state) => {
      state.templates.loading = true;
      state.templates.error = null;
    },
    fetchCardTemplatesSucceeded: (state, action) => {
      state.templates.loading = false;
      state.templates.items = action.payload || [];
    },
    fetchCardTemplatesFailed: (state, action) => {
      state.templates.loading = false;
      state.templates.error = action.payload || 'Failed to load templates';
    },

    // Student picker
    fetchCardStudentsRequested: (state) => {
      state.students.loading = true;
      state.students.error = null;
    },
    fetchCardStudentsSucceeded: (state, action) => {
      state.students.loading = false;
      state.students.items = action.payload?.students || [];
      state.students.classScope = action.payload?.classScope;
    },
    fetchCardStudentsFailed: (state, action) => {
      state.students.loading = false;
      state.students.error = action.payload || 'Failed to load students';
    },

    // Batches list
    fetchBatchesRequested: (state) => {
      state.batches.loading = true;
      state.batches.error = null;
    },
    fetchBatchesSucceeded: (state, action) => {
      state.batches.loading = false;
      state.batches.items = action.payload?.batches || [];
      const pag = action.payload?.pagination || {};
      state.batches.pagination = {
        page: pag.page || state.batches.pagination.page,
        limit: pag.limit || state.batches.pagination.limit,
        total: pag.totalItems !== undefined ? pag.totalItems : pag.total || 0,
        totalPages: pag.totalPages || 0,
      };
    },
    fetchBatchesFailed: (state, action) => {
      state.batches.loading = false;
      state.batches.error = action.payload || 'Failed to load ID card batches';
    },
    setBatchFilters: (state, action) => {
      state.batches.filters = { ...state.batches.filters, ...action.payload };
      state.batches.pagination.page = 1;
    },
    setBatchPagination: (state, action) => {
      state.batches.pagination = { ...state.batches.pagination, ...action.payload };
    },

    // Batch detail
    fetchBatchRequested: (state) => {
      state.current.loading = true;
      state.current.error = null;
    },
    fetchBatchSucceeded: (state, action) => {
      state.current.loading = false;
      state.current.batch = action.payload?.batch || null;
      state.current.cards = action.payload?.cards || [];
    },
    fetchBatchFailed: (state, action) => {
      state.current.loading = false;
      state.current.error = action.payload || 'Failed to load ID card batch';
    },
    clearCurrentBatch: (state) => {
      state.current = { ...initialState.current };
    },

    // PDF download (sirf kaunsa batch download ho raha hai, blob nahi)
    downloadBatchPdfRequested: (state, action) => {
      state.download.loadingId = action.payload?.batchId || null;
      state.download.error = null;
    },
    downloadBatchPdfSucceeded: (state) => {
      state.download.loadingId = null;
    },
    downloadBatchPdfFailed: (state, action) => {
      state.download.loadingId = null;
      state.download.error = action.payload || 'Failed to download PDF';
    },

    clearIdCardErrors: (state) => {
      state.preview.error = null;
      state.templates.error = null;
      state.students.error = null;
      state.batches.error = null;
      state.current.error = null;
      state.download.error = null;
    },
  },
});

export const {
  previewIdCardRequested,
  previewIdCardSucceeded,
  previewIdCardFailed,
  clearIdCardPreview,
  fetchCardTemplatesRequested,
  fetchCardTemplatesSucceeded,
  fetchCardTemplatesFailed,
  fetchCardStudentsRequested,
  fetchCardStudentsSucceeded,
  fetchCardStudentsFailed,
  fetchBatchesRequested,
  fetchBatchesSucceeded,
  fetchBatchesFailed,
  setBatchFilters,
  setBatchPagination,
  fetchBatchRequested,
  fetchBatchSucceeded,
  fetchBatchFailed,
  clearCurrentBatch,
  downloadBatchPdfRequested,
  downloadBatchPdfSucceeded,
  downloadBatchPdfFailed,
  clearIdCardErrors,
} = idCardSlice.actions;

export default idCardSlice.reducer;

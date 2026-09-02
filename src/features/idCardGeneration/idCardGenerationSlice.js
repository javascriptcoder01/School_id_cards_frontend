import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  generations: [],
  selectedGeneration: null,
  results: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    status: '',
    templateId: '',
    studentId: '',
  },
  loading: {
    list: false,
    detail: false,
    create: false,
    process: false,
    results: false,
  },
  error: null,
};

export const idCardGenerationSlice = createSlice({
  name: 'idCardGeneration',
  initialState,
  reducers: {
    // List generations
    fetchGenerationsRequested: (state) => {
      state.loading.list = true;
      state.error = null;
    },
    fetchGenerationsSucceeded: (state, action) => {
      state.loading.list = false;
      state.generations = action.payload?.generations || [];
      const pag = action.payload?.pagination || {};
      state.pagination = {
        page: pag.page || state.pagination.page,
        limit: pag.limit || state.pagination.limit,
        total: pag.total ?? pag.totalItems ?? 0,
        totalPages: pag.totalPages ?? 0,
      };
      state.error = null;
    },
    fetchGenerationsFailed: (state, action) => {
      state.loading.list = false;
      state.error = action.payload || 'Failed to fetch ID card generations';
    },

    // Generation detail
    fetchGenerationDetailRequested: (state) => {
      state.loading.detail = true;
      state.error = null;
    },
    fetchGenerationDetailSucceeded: (state, action) => {
      state.loading.detail = false;
      state.selectedGeneration = action.payload;
      state.error = null;
    },
    fetchGenerationDetailFailed: (state, action) => {
      state.loading.detail = false;
      state.error = action.payload || 'Failed to fetch generation detail';
    },

    // Single creation
    createGenerationRequested: (state) => {
      state.loading.create = true;
      state.error = null;
    },
    createGenerationSucceeded: (state, action) => {
      state.loading.create = false;
      state.error = null;
      if (action.payload && action.payload.id) {
        state.generations = [action.payload, ...state.generations];
      }
    },
    createGenerationFailed: (state, action) => {
      state.loading.create = false;
      state.error = action.payload || 'Failed to create ID card generation';
    },

    // Bulk creation
    createBulkGenerationRequested: (state) => {
      state.loading.create = true;
      state.error = null;
    },
    createBulkGenerationSucceeded: (state, action) => {
      state.loading.create = false;
      state.error = null;
      if (action.payload && action.payload.id) {
        state.generations = [action.payload, ...state.generations];
      }
    },
    createBulkGenerationFailed: (state, action) => {
      state.loading.create = false;
      state.error = action.payload || 'Failed to create bulk ID card generation';
    },

    // Process generation
    processGenerationRequested: (state) => {
      state.loading.process = true;
      state.error = null;
    },
    processGenerationSucceeded: (state, action) => {
      state.loading.process = false;
      state.error = null;
      const updated = action.payload;
      if (updated && updated.id) {
        if (state.selectedGeneration && state.selectedGeneration.id === updated.id) {
          state.selectedGeneration = updated;
        }
        state.generations = state.generations.map((g) =>
          g.id === updated.id ? updated : g
        );
      }
    },
    processGenerationFailed: (state, action) => {
      state.loading.process = false;
      state.error = action.payload || 'Failed to process generation job';
    },

    // Fetch generation results
    fetchGenerationResultsRequested: (state) => {
      state.loading.results = true;
      state.error = null;
    },
    fetchGenerationResultsSucceeded: (state, action) => {
      state.loading.results = false;
      state.results = action.payload;
      state.error = null;
    },
    fetchGenerationResultsFailed: (state, action) => {
      state.loading.results = false;
      state.error = action.payload || 'Failed to fetch generation results';
    },

    // Filters and pagination
    setGenerationFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
      state.pagination.page = 1;
    },
    resetGenerationFilters: (state) => {
      state.filters = { status: '', templateId: '', studentId: '' };
      state.pagination.page = 1;
    },
    setGenerationPagination: (state, action) => {
      state.pagination = {
        ...state.pagination,
        ...action.payload,
      };
    },
    clearSelectedGeneration: (state) => {
      state.selectedGeneration = null;
      state.results = null;
    },
    clearGenerationErrors: (state) => {
      state.error = null;
    },
    resetGenerationState: () => initialState,
  },
});

export const {
  fetchGenerationsRequested,
  fetchGenerationsSucceeded,
  fetchGenerationsFailed,
  fetchGenerationDetailRequested,
  fetchGenerationDetailSucceeded,
  fetchGenerationDetailFailed,
  createGenerationRequested,
  createGenerationSucceeded,
  createGenerationFailed,
  createBulkGenerationRequested,
  createBulkGenerationSucceeded,
  createBulkGenerationFailed,
  processGenerationRequested,
  processGenerationSucceeded,
  processGenerationFailed,
  fetchGenerationResultsRequested,
  fetchGenerationResultsSucceeded,
  fetchGenerationResultsFailed,
  setGenerationFilters,
  resetGenerationFilters,
  setGenerationPagination,
  clearSelectedGeneration,
  clearGenerationErrors,
  resetGenerationState,
} = idCardGenerationSlice.actions;

export default idCardGenerationSlice.reducer;


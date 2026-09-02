import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  templates: [],
  selectedTemplate: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    search: '',
    collegeId: '',
  },
  loading: {
    list: false,
    detail: false,
    create: false,
    update: false,
    status: false,
  },
  error: null,
};

export const templateSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    // List templates
    fetchTemplatesRequested: (state) => {
      state.loading.list = true;
      state.error = null;
    },
    fetchTemplatesSucceeded: (state, action) => {
      state.loading.list = false;
      state.templates = action.payload?.templates || [];
      const pag = action.payload?.pagination || {};
      state.pagination = {
        page: pag.page || state.pagination.page,
        limit: pag.limit || state.pagination.limit,
        total: pag.total ?? pag.totalItems ?? 0,
        totalPages: pag.totalPages ?? 0,
      };
      state.error = null;
    },
    fetchTemplatesFailed: (state, action) => {
      state.loading.list = false;
      state.error = action.payload || 'Failed to fetch templates';
    },

    // Detail template
    fetchTemplateDetailRequested: (state) => {
      state.loading.detail = true;
      state.error = null;
    },
    fetchTemplateDetailSucceeded: (state, action) => {
      state.loading.detail = false;
      state.selectedTemplate = action.payload;
      state.error = null;
    },
    fetchTemplateDetailFailed: (state, action) => {
      state.loading.detail = false;
      state.error = action.payload || 'Failed to fetch template details';
    },

    // Create template
    createTemplateRequested: (state) => {
      state.loading.create = true;
      state.error = null;
    },
    createTemplateSucceeded: (state, action) => {
      state.loading.create = false;
      state.error = null;
      if (action.payload && action.payload.id) {
        state.templates = [action.payload, ...state.templates];
      }
    },
    createTemplateFailed: (state, action) => {
      state.loading.create = false;
      state.error = action.payload || 'Failed to create template';
    },

    // Update template
    updateTemplateRequested: (state) => {
      state.loading.update = true;
      state.error = null;
    },
    updateTemplateSucceeded: (state, action) => {
      state.loading.update = false;
      state.error = null;
      state.selectedTemplate = action.payload;
      if (action.payload && action.payload.id) {
        state.templates = state.templates.map((t) =>
          t.id === action.payload.id ? action.payload : t
        );
      }
    },
    updateTemplateFailed: (state, action) => {
      state.loading.update = false;
      state.error = action.payload || 'Failed to update template';
    },

    // Status update
    updateTemplateStatusRequested: (state) => {
      state.loading.status = true;
      state.error = null;
    },
    updateTemplateStatusSucceeded: (state, action) => {
      state.loading.status = false;
      state.error = null;
      const updated = action.payload;
      if (state.selectedTemplate && state.selectedTemplate.id === updated.id) {
        state.selectedTemplate = { ...state.selectedTemplate, isActive: updated.isActive };
      }
      state.templates = state.templates.map((t) =>
        t.id === updated.id ? { ...t, isActive: updated.isActive } : t
      );
    },
    updateTemplateStatusFailed: (state, action) => {
      state.loading.status = false;
      state.error = action.payload || 'Failed to update template status';
    },

    // Filters and pagination
    setTemplateFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
      state.pagination.page = 1;
    },
    resetTemplateFilters: (state) => {
      state.filters = { search: '', collegeId: '' };
      state.pagination.page = 1;
    },
    setTemplatePagination: (state, action) => {
      state.pagination = {
        ...state.pagination,
        ...action.payload,
      };
    },
    clearSelectedTemplate: (state) => {
      state.selectedTemplate = null;
    },
    clearTemplateErrors: (state) => {
      state.error = null;
    },
    resetTemplateState: () => initialState,
  },
});

export const {
  fetchTemplatesRequested,
  fetchTemplatesSucceeded,
  fetchTemplatesFailed,
  fetchTemplateDetailRequested,
  fetchTemplateDetailSucceeded,
  fetchTemplateDetailFailed,
  createTemplateRequested,
  createTemplateSucceeded,
  createTemplateFailed,
  updateTemplateRequested,
  updateTemplateSucceeded,
  updateTemplateFailed,
  updateTemplateStatusRequested,
  updateTemplateStatusSucceeded,
  updateTemplateStatusFailed,
  setTemplateFilters,
  resetTemplateFilters,
  setTemplatePagination,
  clearSelectedTemplate,
  clearTemplateErrors,
  resetTemplateState,
} = templateSlice.actions;

export default templateSlice.reducer;


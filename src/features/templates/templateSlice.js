// templateSlice.js
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
  // Card themes catalog (ek baar load, phir cache)
  themes: {
    data: null, // { presets, decorationStyles, backgroundTypes, qrContentTypes, fieldGroups, defaultLabels }
    loading: false,
    error: null,
  },
  // Designer ka live preview (bina save kiye draft) — backend se exact render data
  designerPreview: {
    data: null, // renderData
    student: null, // { id, name, isSample }
    validationErrors: [],
    loading: false,
    error: null,
  },
  // Saved template ka sample preview (list grid / detail) — templateId → { data, loading, error }
  savedPreviews: {
    byId: {},
  },
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

    // Themes catalog
    fetchThemesRequested: (state) => {
      if (!state.themes.data) state.themes.loading = true;
      state.themes.error = null;
    },
    fetchThemesSucceeded: (state, action) => {
      state.themes.loading = false;
      state.themes.data = action.payload || null;
    },
    fetchThemesFailed: (state, action) => {
      state.themes.loading = false;
      state.themes.error = action.payload || 'Failed to load card themes';
    },

    // Designer live preview (saga 400 ms debounce karta hai)
    previewRenderRequested: (state) => {
      state.designerPreview.loading = true;
      state.designerPreview.error = null;
    },
    previewRenderSucceeded: (state, action) => {
      state.designerPreview.loading = false;
      state.designerPreview.data = action.payload?.renderData || null;
      state.designerPreview.student = action.payload?.student || null;
      state.designerPreview.validationErrors = action.payload?.validationErrors || [];
    },
    previewRenderFailed: (state, action) => {
      state.designerPreview.loading = false;
      state.designerPreview.error = action.payload || 'Failed to render preview';
    },
    clearDesignerPreview: (state) => {
      state.designerPreview = { ...initialState.designerPreview };
    },

    // Saved template sample preview (cache by templateId)
    fetchSavedPreviewRequested: (state, action) => {
      const templateId = action.payload?.templateId;
      if (!templateId) return;
      if (!state.savedPreviews) state.savedPreviews = { byId: {} };
      const current = state.savedPreviews.byId[templateId];
      state.savedPreviews.byId[templateId] = { data: current?.data || null, loading: true, error: null };
    },
    fetchSavedPreviewSucceeded: (state, action) => {
      const { templateId, data } = action.payload || {};
      if (!templateId) return;
      if (!state.savedPreviews) state.savedPreviews = { byId: {} };
      state.savedPreviews.byId[templateId] = { data: data || null, loading: false, error: null };
    },
    fetchSavedPreviewFailed: (state, action) => {
      const { templateId, error } = action.payload || {};
      if (!templateId) return;
      if (!state.savedPreviews) state.savedPreviews = { byId: {} };
      const current = state.savedPreviews.byId[templateId];
      state.savedPreviews.byId[templateId] = {
        data: current?.data || null,
        loading: false,
        error: error || 'Failed to load preview',
      };
    },

    resetTemplateState: () => initialState,
  },
  extraReducers: (builder) => {
    // Template badla (save / status) → uska purana sample preview hatao
    builder.addMatcher(
      (action) =>
        action.type === 'templates/updateTemplateSucceeded' ||
        action.type === 'templates/updateTemplateStatusSucceeded',
      (state, action) => {
        const templateId = action.payload?.id;
        if (templateId && state.savedPreviews?.byId) delete state.savedPreviews.byId[templateId];
      }
    );
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
  fetchThemesRequested,
  fetchThemesSucceeded,
  fetchThemesFailed,
  previewRenderRequested,
  previewRenderSucceeded,
  previewRenderFailed,
  clearDesignerPreview,
  fetchSavedPreviewRequested,
  fetchSavedPreviewSucceeded,
  fetchSavedPreviewFailed,
  resetTemplateState,
} = templateSlice.actions;

export default templateSlice.reducer;


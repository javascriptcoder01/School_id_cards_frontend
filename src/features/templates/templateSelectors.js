// templateSelectors.js

export const selectTemplatesState = (state) => state.templates;

export const selectTemplates = (state) => state.templates?.templates || [];

export const selectSelectedTemplate = (state) => state.templates?.selectedTemplate || null;

export const selectTemplatePagination = (state) =>
  state.templates?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 };

export const selectTemplateFilters = (state) =>
  state.templates?.filters || { search: '', collegeId: '' };

export const selectTemplateLoading = (state) => state.templates?.loading || {
  list: false,
  detail: false,
  create: false,
  update: false,
  status: false,
};

export const selectTemplatesLoading = (state) => Boolean(state.templates?.loading?.list);
export const selectTemplateDetailLoading = (state) => Boolean(state.templates?.loading?.detail);
export const selectTemplateCreateLoading = (state) => Boolean(state.templates?.loading?.create);
export const selectTemplateUpdateLoading = (state) => Boolean(state.templates?.loading?.update);
export const selectTemplateStatusLoading = (state) => Boolean(state.templates?.loading?.status);

export const selectTemplateError = (state) => state.templates?.error || null;

// Card themes catalog
export const selectCardThemes = (state) => state.templates?.themes?.data || null;
export const selectCardThemesLoading = (state) => Boolean(state.templates?.themes?.loading);
export const selectCardThemesError = (state) => state.templates?.themes?.error || null;

// Designer live preview
export const selectDesignerPreview = (state) => state.templates?.designerPreview?.data || null;
export const selectDesignerPreviewStudent = (state) => state.templates?.designerPreview?.student || null;
const EMPTY_ERRORS = [];
export const selectDesignerValidationErrors = (state) =>
  state.templates?.designerPreview?.validationErrors || EMPTY_ERRORS;
export const selectDesignerPreviewLoading = (state) => Boolean(state.templates?.designerPreview?.loading);
export const selectDesignerPreviewError = (state) => state.templates?.designerPreview?.error || null;

// Saved template sample preview: selectSavedTemplatePreview(templateId)(state) → { data, loading, error } | undefined
export const selectSavedTemplatePreviews = (state) => state.templates?.savedPreviews?.byId || {};
export const selectSavedTemplatePreview = (templateId) => (state) =>
  state.templates?.savedPreviews?.byId?.[templateId];

export default {
  selectCardThemes,
  selectCardThemesLoading,
  selectCardThemesError,
  selectDesignerPreview,
  selectDesignerPreviewStudent,
  selectDesignerValidationErrors,
  selectDesignerPreviewLoading,
  selectDesignerPreviewError,
  selectSavedTemplatePreviews,
  selectSavedTemplatePreview,
  selectTemplatesState,
  selectTemplates,
  selectSelectedTemplate,
  selectTemplatePagination,
  selectTemplateFilters,
  selectTemplateLoading,
  selectTemplatesLoading,
  selectTemplateDetailLoading,
  selectTemplateCreateLoading,
  selectTemplateUpdateLoading,
  selectTemplateStatusLoading,
  selectTemplateError,
};


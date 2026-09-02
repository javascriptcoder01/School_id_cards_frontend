/**
 * Template Management Selectors
 */

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

export default {
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


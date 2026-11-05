// templateApi.js

import apiClient from '../../api/apiClient.js';
export const getTemplates = async (params = {}) => {
  const queryParams = {};
  if (params.page !== undefined && params.page !== null && params.page !== '') {
    queryParams.page = params.page;
  }
  if (params.limit !== undefined && params.limit !== null && params.limit !== '') {
    queryParams.limit = params.limit;
  }
  if (params.search && typeof params.search === 'string' && params.search.trim().length > 0) {
    queryParams.search = params.search.trim();
  }
  if (params.collegeId && typeof params.collegeId === 'string' && params.collegeId.trim().length > 0) {
    queryParams.collegeId = params.collegeId.trim();
  }
  if (params.isActive !== undefined && params.isActive !== null && params.isActive !== '') {
    queryParams.isActive = typeof params.isActive === 'boolean' ? params.isActive : params.isActive === 'true';
  }

  const response = await apiClient.get('/templates', { params: queryParams });
  return response;
};

export const getTemplateById = async (templateId) => {
  const response = await apiClient.get(`/templates/${templateId}`);
  return response;
};

export const createTemplate = async (payload) => {
  const response = await apiClient.post('/templates', payload);
  return response;
};

export const updateTemplate = async (templateId, payload) => {
  const response = await apiClient.put(`/templates/${templateId}`, payload);
  return response;
};

export const updateTemplateStatus = async (templateId, isActive) => {
  const response = await apiClient.patch(`/templates/${templateId}/status`, { isActive });
  return response;
};

// Card themes: presets, decorations, QR types, field groups, default labels (sab roles)
export const getThemes = async (orientation) => {
  const response = await apiClient.get('/templates/themes', orientation ? { params: { orientation } } : undefined);
  return response;
};

// School ki apni themes (COLLEGE_ADMIN)
export const createSchoolTheme = async (body) => {
  const response = await apiClient.post('/templates/school-themes', body);
  return response;
};

export const renameSchoolTheme = async (themeId, name) => {
  const response = await apiClient.patch(`/templates/school-themes/${themeId}`, { name });
  return response;
};

export const deleteSchoolTheme = async (themeId) => {
  const response = await apiClient.delete(`/templates/school-themes/${themeId}`);
  return response;
};

// Designer draft (bina save) ka render data — { renderData, student, validationErrors } (COLLEGE_ADMIN)
export const previewRender = async ({ template, studentId } = {}) => {
  const body = { template };
  if (studentId) body.studentId = studentId;
  const response = await apiClient.post('/templates/preview-render', body);
  return response;
};

// Saved template ka sample-student preview — { renderData, student } (jo template padh sakta hai)
export const getSavedTemplatePreview = async (templateId) => {
  const response = await apiClient.get(`/templates/${templateId}/preview`);
  return response;
};

// Designer ke "School Images": profile ki logo / principal signature / stamp + suggested size (COLLEGE_ADMIN)
export const getDesignerContext = async () => {
  const response = await apiClient.get('/templates/designer-context');
  return response;
};

export default {
  getTemplates,
  getDesignerContext,
  getTemplateById,
  createTemplate,
  updateTemplate,
  updateTemplateStatus,
  getThemes,
  createSchoolTheme,
  renameSchoolTheme,
  deleteSchoolTheme,
  previewRender,
  getSavedTemplatePreview,
};


import apiClient from '../../api/apiClient.js';

/**
 * ID Card Template Management API Service
 * Interacts with backend /api/templates endpoints using centralized apiClient
 */

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

export default {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  updateTemplateStatus,
};


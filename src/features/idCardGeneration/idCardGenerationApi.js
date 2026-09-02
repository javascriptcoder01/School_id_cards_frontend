import apiClient from '../../api/apiClient.js';

/**
 * ID Card Generation API Service
 * Interacts with backend /api/id-cards/* endpoints using centralized apiClient
 */

export const createGeneration = async (payload) => {
  const response = await apiClient.post('/id-cards/generate', payload);
  return response;
};

export const createBulkGeneration = async (payload) => {
  const response = await apiClient.post('/id-cards/generate/bulk', payload);
  return response;
};

export const getGenerations = async (params = {}) => {
  const queryParams = {};
  if (params.page !== undefined && params.page !== null && params.page !== '') {
    queryParams.page = params.page;
  }
  if (params.limit !== undefined && params.limit !== null && params.limit !== '') {
    queryParams.limit = params.limit;
  }
  if (params.status && typeof params.status === 'string' && params.status.trim().length > 0) {
    queryParams.status = params.status.trim();
  }
  if (params.templateId && typeof params.templateId === 'string' && params.templateId.trim().length > 0) {
    queryParams.templateId = params.templateId.trim();
  }
  if (params.studentId && typeof params.studentId === 'string' && params.studentId.trim().length > 0) {
    queryParams.studentId = params.studentId.trim();
  }

  const response = await apiClient.get('/id-cards/generations', { params: queryParams });
  return response;
};

export const getGenerationById = async (generationId) => {
  const response = await apiClient.get(`/id-cards/generations/${generationId}`);
  return response;
};

export const processGeneration = async (generationId) => {
  const response = await apiClient.post(`/id-cards/generations/${generationId}/process`);
  return response;
};

export const getGenerationResults = async (generationId) => {
  const response = await apiClient.get(`/id-cards/generations/${generationId}/results`);
  return response;
};

export default {
  createGeneration,
  createBulkGeneration,
  getGenerations,
  getGenerationById,
  processGeneration,
  getGenerationResults,
};


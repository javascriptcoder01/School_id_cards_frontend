// idCardApi.js
import apiClient from '../../api/apiClient.js';

// Max students ek batch / picker mein (backend ID_CARD_BATCH_MAX_STUDENTS)
export const ID_CARD_BATCH_MAX_STUDENTS = 100;

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && String(value).trim() !== ''
    )
  );

export const previewIdCard = async (body) => {
  const response = await apiClient.post('/id-cards/preview', body);
  return response;
};

export const getBatches = async (params = {}) => {
  const response = await apiClient.get('/id-cards/batches', { params: cleanParams(params) });
  return response;
};

export const getBatchById = async (batchId) => {
  const response = await apiClient.get(`/id-cards/batches/${batchId}`);
  return response;
};

// PDF blob (Redux mein nahi jaata — saga isse seedha download karwata hai)
export const downloadBatchPdf = async (batchId) => {
  const blob = await apiClient.get(`/id-cards/batches/${batchId}/pdf`, { responseType: 'blob' });
  return blob;
};

// Card page ke liye templates: OPERATOR /operator/templates, baaki /templates (sirf active)
export const getCardTemplates = async ({ isOperator = false } = {}) => {
  if (isOperator) {
    const response = await apiClient.get('/operator/templates');
    const data = response?.data ?? response;
    return Array.isArray(data) ? data : data?.templates || [];
  }
  const response = await apiClient.get('/templates', { params: { limit: 100, isActive: true } });
  const data = response?.data ?? response;
  return data?.templates || [];
};

// Student picker (students list page ki filters se alag rehta hai)
export const getCardStudents = async ({ className, section, search } = {}) => {
  const response = await apiClient.get('/students', {
    params: cleanParams({ page: 1, limit: ID_CARD_BATCH_MAX_STUDENTS, className, section, search }),
  });
  return response;
};

import apiClient from '../../api/apiClient.js';

/**
 * College Management API Service
 * Interacts with backend /api/colleges endpoints using centralized apiClient
 */

export const getCollegesApi = async (params = {}) => {
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
  if (params.isActive !== undefined && params.isActive !== null && params.isActive !== '') {
    queryParams.isActive = params.isActive === true || params.isActive === 'true';
  }

  const response = await apiClient.get('/colleges', { params: queryParams });
  return response;
};

export const getMyCollegeApi = async () => {
  const response = await apiClient.get('/colleges/me');
  return response;
};

export const getCollegeByIdApi = async (collegeId) => {
  const response = await apiClient.get(`/colleges/${collegeId}`);
  return response;
};

export const createCollegeApi = async (collegeData) => {
  const response = await apiClient.post('/colleges', collegeData);
  return response;
};

export const updateCollegeApi = async (collegeId, updateData) => {
  const response = await apiClient.put(`/colleges/${collegeId}`, updateData);
  return response;
};

export const updateCollegeStatusApi = async (collegeId, isActive) => {
  const response = await apiClient.patch(`/colleges/${collegeId}/status`, { isActive });
  return response;
};

export default {
  getCollegesApi,
  getMyCollegeApi,
  getCollegeByIdApi,
  createCollegeApi,
  updateCollegeApi,
  updateCollegeStatusApi,
};


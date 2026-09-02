import apiClient from '../../api/apiClient.js';

/**
 * User Management API Service
 * Interacts with backend /api/users endpoints using centralized apiClient
 */

export const listUsers = async (params = {}) => {
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
  if (params.role && typeof params.role === 'string' && params.role.trim().length > 0) {
    queryParams.role = params.role.trim();
  }
  if (params.collegeId && typeof params.collegeId === 'string' && params.collegeId.trim().length > 0) {
    queryParams.collegeId = params.collegeId.trim();
  }
  if (params.isActive !== undefined && params.isActive !== null && params.isActive !== '') {
    queryParams.isActive = params.isActive === true || params.isActive === 'true';
  }

  const response = await apiClient.get('/users', { params: queryParams });
  return response;
};

export const getUser = async (userId) => {
  const response = await apiClient.get(`/users/${userId}`);
  return response;
};

export const createUser = async (payload) => {
  const response = await apiClient.post('/users', payload);
  return response;
};

export const updateUser = async (userId, payload) => {
  const response = await apiClient.put(`/users/${userId}`, payload);
  return response;
};

export const updateUserStatus = async (userId, isActive) => {
  const response = await apiClient.patch(`/users/${userId}/status`, { isActive });
  return response;
};

export default {
  listUsers,
  getUser,
  createUser,
  updateUser,
  updateUserStatus,
};


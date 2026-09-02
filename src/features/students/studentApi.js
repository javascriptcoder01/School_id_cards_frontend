import apiClient from '../../api/apiClient.js';

/**
 * Student Management API Service
 * Interacts with backend /api/students endpoints using centralized apiClient
 */

export const getStudents = async (params = {}) => {
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

  const response = await apiClient.get('/students', { params: queryParams });
  return response;
};

export const getStudentById = async (studentId) => {
  const response = await apiClient.get(`/students/${studentId}`);
  return response;
};

export const createStudent = async (payload) => {
  const response = await apiClient.post('/students', payload);
  return response;
};

export const updateStudent = async (studentId, payload) => {
  const response = await apiClient.put(`/students/${studentId}`, payload);
  return response;
};

export const updateStudentStatus = async (studentId, isActive) => {
  const response = await apiClient.patch(`/students/${studentId}/status`, { isActive });
  return response;
};

export default {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  updateStudentStatus,
};


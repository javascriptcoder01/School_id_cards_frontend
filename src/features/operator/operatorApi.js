import apiClient from '../../api/apiClient.js';

/**
 * Operator Workspace API Service
 * Interacts with Backend /api/operator/... endpoints (OPERATOR)
 */

export const getOperatorDashboard = async () => {
  const response = await apiClient.get('/operator/dashboard');
  return response?.data?.data || response?.data || {};
};

export const getOperatorStudents = async (params = {}) => {
  const response = await apiClient.get('/operator/students', { params });
  return response?.data?.data || response?.data || {};
};

export const getOperatorStudentById = async (studentId) => {
  const response = await apiClient.get(`/operator/students/${studentId}`);
  return response?.data?.data || response?.data || {};
};

export const createOperatorStudent = async (studentData) => {
  const response = await apiClient.post('/operator/students', studentData);
  return response?.data?.data || response?.data || {};
};

export const updateOperatorStudent = async (studentId, updates) => {
  const response = await apiClient.patch(`/operator/students/${studentId}`, updates);
  return response?.data?.data || response?.data || {};
};

export const importOperatorStudents = async (studentsPayload) => {
  const body = Array.isArray(studentsPayload) ? { students: studentsPayload } : studentsPayload;
  const response = await apiClient.post('/operator/students/import', body);
  return response?.data?.data || response?.data || {};
};

export const getOperatorTemplates = async () => {
  const response = await apiClient.get('/operator/templates');
  return response?.data?.data || response?.data || {};
};

export const previewOperatorIdCard = async (previewData) => {
  const response = await apiClient.post('/operator/id-cards/preview', previewData);
  return response?.data?.data || response?.data || {};
};

export const createOperatorGeneration = async (generationData) => {
  const response = await apiClient.post('/operator/id-cards/generations', generationData);
  return response?.data?.data || response?.data || {};
};

export const getOperatorGenerations = async (params = {}) => {
  const response = await apiClient.get('/operator/id-cards/generations', { params });
  return response?.data?.data || response?.data || {};
};

export default {
  getOperatorDashboard,
  getOperatorStudents,
  getOperatorStudentById,
  createOperatorStudent,
  updateOperatorStudent,
  importOperatorStudents,
  getOperatorTemplates,
  previewOperatorIdCard,
  createOperatorGeneration,
  getOperatorGenerations,
};

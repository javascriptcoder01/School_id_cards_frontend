import apiClient from '../../api/apiClient.js';

/**
 * Operator Assignment API Service
 * Interacts with Backend /api/operator-assignments endpoints (COLLEGE_ADMIN)
 */

export const fetchOperatorAssignments = async (params = {}) => {
  const response = await apiClient.get('/operator-assignments', { params });
  return response?.data?.data || response?.data || {};
};

export const createOperatorAssignment = async (assignmentData) => {
  const response = await apiClient.post('/operator-assignments', assignmentData);
  return response?.data?.data || response?.data || {};
};

export const updateOperatorAssignment = async (assignmentId, updates) => {
  const response = await apiClient.patch(`/operator-assignments/${assignmentId}`, updates);
  return response?.data?.data || response?.data || {};
};

export const deleteOperatorAssignment = async (assignmentId) => {
  const response = await apiClient.delete(`/operator-assignments/${assignmentId}`);
  return response?.data?.data || response?.data || {};
};

export default {
  fetchOperatorAssignments,
  createOperatorAssignment,
  updateOperatorAssignment,
  deleteOperatorAssignment,
};

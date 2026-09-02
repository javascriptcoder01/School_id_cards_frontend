import apiClient from '../../api/apiClient.js';

/**
 * College Progress Analytics API Service
 * Interacts with Backend /api/college/dashboard/progress endpoint (COLLEGE_ADMIN)
 */

export const getCollegeProgress = async () => {
  const response = await apiClient.get('/college/dashboard/progress');
  return response?.data?.data || response?.data || {};
};

export default {
  getCollegeProgress,
};


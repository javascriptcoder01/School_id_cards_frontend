import apiClient from '../../api/apiClient.js';

/**
 * Super Admin Print Center API Service
 * Interacts with Backend /api/super-admin/id-cards/... endpoints (SUPER_ADMIN)
 */

export const getPrintSummary = async (params = {}) => {
  const response = await apiClient.get('/super-admin/id-cards/print-summary', { params });
  return response?.data?.data || response?.data || {};
};

export const getCollegePrintDetails = async (collegeId) => {
  const response = await apiClient.get(`/super-admin/id-cards/colleges/${collegeId}`);
  return response?.data?.data || response?.data || {};
};

export const downloadResultPng = async (resultId) => {
  const response = await apiClient.get(`/super-admin/id-cards/results/${resultId}/download`, {
    responseType: 'blob',
  });
  return response?.data;
};

export const downloadCollegeZip = async (collegeId) => {
  const response = await apiClient.get(`/super-admin/id-cards/colleges/${collegeId}/download`, {
    responseType: 'blob',
  });
  return response?.data;
};

export const downloadCollegePdf = async (collegeId) => {
  const response = await apiClient.get(`/super-admin/id-cards/colleges/${collegeId}/download/pdf`, {
    responseType: 'blob',
  });
  return response?.data;
};

export default {
  getPrintSummary,
  getCollegePrintDetails,
  downloadResultPng,
  downloadCollegeZip,
  downloadCollegePdf,
};


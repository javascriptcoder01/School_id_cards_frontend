import apiClient from '../../api/apiClient.js';

/**
 * Print Request API Service
 * Interacts with Backend Batch 17 Print Request endpoints
 */

// Operator API Methods
export const createPrintRequest = async (data) => {
  const response = await apiClient.post('/print-requests', data);
  return response.data?.data?.printRequest || response.data?.data || response.data;
};

export const getMyPrintRequests = async (params = {}) => {
  const response = await apiClient.get('/print-requests/my', { params });
  return response.data?.data || response.data;
};

// College Admin API Methods
export const getCollegePrintRequests = async (params = {}) => {
  const response = await apiClient.get('/print-requests', { params });
  return response.data?.data || response.data;
};

export const approveCollegePrintRequest = async (requestId) => {
  const response = await apiClient.patch(`/print-requests/${requestId}/approve`);
  return response.data?.data?.printRequest || response.data?.data || response.data;
};

export const rejectCollegePrintRequest = async (requestId, reason) => {
  const response = await apiClient.patch(`/print-requests/${requestId}/reject`, { reason });
  return response.data?.data?.printRequest || response.data?.data || response.data;
};

export const forwardToSuperAdmin = async (requestId) => {
  const response = await apiClient.post(`/print-requests/${requestId}/send-to-super-admin`);
  return response.data?.data?.printRequest || response.data?.data || response.data;
};

// Common Detail Method
export const getPrintRequestById = async (requestId) => {
  const response = await apiClient.get(`/print-requests/${requestId}`);
  return response.data?.data?.printRequest || response.data?.data || response.data;
};

// Super Admin API Methods
export const getAdminPrintRequests = async (params = {}) => {
  const response = await apiClient.get('/admin/print-requests', { params });
  return response.data?.data || response.data;
};

export const approveAdminPrintRequest = async (requestId) => {
  const response = await apiClient.patch(`/admin/print-requests/${requestId}/approve`);
  return response.data?.data?.printRequest || response.data?.data || response.data;
};

export const rejectAdminPrintRequest = async (requestId, reason) => {
  const response = await apiClient.patch(`/admin/print-requests/${requestId}/reject`, { reason });
  return response.data?.data?.printRequest || response.data?.data || response.data;
};

export const markAdminPrinting = async (requestId) => {
  const response = await apiClient.patch(`/admin/print-requests/${requestId}/printing`);
  return response.data?.data?.printRequest || response.data?.data || response.data;
};

export const dispatchAdminPrint = async (requestId, payload = {}) => {
  const response = await apiClient.post(`/admin/print-requests/${requestId}/print`, payload);
  return response.data?.data?.printRequest || response.data?.data || response.data;
};

export const markAdminComplete = async (requestId) => {
  const response = await apiClient.patch(`/admin/print-requests/${requestId}/complete`);
  return response.data?.data?.printRequest || response.data?.data || response.data;
};

export const downloadAdminPrintAssets = async (requestId) => {
  const response = await apiClient.get(`/admin/print-requests/${requestId}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

export const downloadAdminPrintPdf = async (requestId) => {
  const response = await apiClient.get(`/admin/print-requests/${requestId}/download/pdf`, {
    responseType: 'blob',
  });
  return response.data;
};

export default {
  createPrintRequest,
  getMyPrintRequests,
  getCollegePrintRequests,
  approveCollegePrintRequest,
  rejectCollegePrintRequest,
  forwardToSuperAdmin,
  getPrintRequestById,
  getAdminPrintRequests,
  approveAdminPrintRequest,
  rejectAdminPrintRequest,
  markAdminPrinting,
  dispatchAdminPrint,
  markAdminComplete,
  downloadAdminPrintAssets,
  downloadAdminPrintPdf,
};


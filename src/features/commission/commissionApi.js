// commissionApi.js
// Rate per ID card + payments (SUPER_ADMIN only) — /api/commission
import apiClient from '../../api/apiClient.js';

const BASE = '/commission';

// Khaali values hatao
const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
  );

export const getRates = async () => {
  const response = await apiClient.get(`${BASE}/rates`);
  return response;
};

export const getRateHistory = async (params = {}) => {
  const response = await apiClient.get(`${BASE}/rates/history`, { params: cleanParams(params) });
  return response;
};

export const setGlobalRate = async (body) => {
  const response = await apiClient.put(`${BASE}/rates/global`, body);
  return response;
};

export const setCollegeRate = async (collegeId, body) => {
  const response = await apiClient.put(`${BASE}/rates/colleges/${collegeId}`, body);
  return response;
};

export const removeCollegeRate = async (collegeId) => {
  const response = await apiClient.delete(`${BASE}/rates/colleges/${collegeId}`);
  return response;
};

export const getPendingPayments = async (collegeId, params = {}) => {
  const response = await apiClient.get(`${BASE}/colleges/${collegeId}/pending`, { params: cleanParams(params) });
  return response;
};

export const markPaid = async (collegeId, body) => {
  const response = await apiClient.post(`${BASE}/colleges/${collegeId}/payments`, body);
  return response;
};

export const getPayments = async (params = {}) => {
  const response = await apiClient.get(`${BASE}/payments`, { params: cleanParams(params) });
  return response;
};

export const getPaymentById = async (paymentId) => {
  const response = await apiClient.get(`${BASE}/payments/${paymentId}`);
  return response;
};

/** Undo (reason zaroori) — requests wapas PENDING */
export const reversePayment = async (paymentId, reason) => {
  const response = await apiClient.post(`${BASE}/payments/${paymentId}/reverse`, { reason });
  return response;
};

/** Payment proof (image / PDF) → { proof: { url, publicId, mimeType } } */
export const uploadPaymentProof = async (collegeId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('collegeId', collegeId);
  const response = await apiClient.post(`${BASE}/payments/proof`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return response;
};

/* Platform payment details (QR / UPI) — Super Admin likhe, College Admin padhe */
export const getPaymentSettings = async () => apiClient.get('/platform-settings/payment');

export const updatePaymentSettings = async (body) => apiClient.put('/platform-settings/payment', body);

export const uploadPaymentQr = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post('/platform-settings/payment/qr', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export default {
  getRates,
  getRateHistory,
  setGlobalRate,
  setCollegeRate,
  removeCollegeRate,
  getPendingPayments,
  markPaid,
  getPayments,
  getPaymentById,
  reversePayment,
  uploadPaymentProof,
  getPaymentSettings,
  updatePaymentSettings,
  uploadPaymentQr,
};

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
};

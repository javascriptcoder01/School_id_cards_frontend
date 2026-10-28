// printRequestWorkflowApi.js
// ID card Print Request workflow (Operator → School Admin → Print Center) — /api/print-requests
import apiClient from '../../api/apiClient.js';
import { previewIdCard, getCardTemplates, getCardStudents } from '../idCards/idCardApi.js';

const BASE = '/print-requests';

// Status actions jo backend samajhta hai (POST /:id/<action>)
export const PRINT_REQUEST_ACTION_PATHS = {
  SUBMIT: 'submit',
  CANCEL: 'cancel',
  APPROVE: 'approve',
  REJECT: 'reject',
  ACCEPT: 'accept',
  DECLINE: 'decline',
  COMPLETE: 'complete',
};

// Khaali values hatao; status array → "APPROVED,PRINTING"
const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params)
      .map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : value])
      .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
  );

export const getRequests = async (params = {}) => {
  const response = await apiClient.get(BASE, { params: cleanParams(params) });
  return response;
};

export const getSummary = async (params = {}) => {
  const response = await apiClient.get(`${BASE}/summary`, { params: cleanParams(params) });
  return response;
};

export const getRequestById = async (requestId) => {
  const response = await apiClient.get(`${BASE}/${requestId}`);
  return response;
};

export const createRequest = async (body) => {
  const response = await apiClient.post(BASE, body);
  return response;
};

export const updateRequest = async (requestId, body) => {
  const response = await apiClient.put(`${BASE}/${requestId}`, body);
  return response;
};

/**
 * @param {string} requestId
 * @param {string} action - SUBMIT | CANCEL | APPROVE | REJECT | ACCEPT | DECLINE | COMPLETE
 * @param {{ reason?: string }} [body]
 */
export const runRequestAction = async (requestId, action, body = {}) => {
  const path = PRINT_REQUEST_ACTION_PATHS[action];
  if (!path) throw new Error(`Unknown action: ${action}`);
  const response = await apiClient.post(`${BASE}/${requestId}/${path}`, body);
  return response;
};

// Print files (Blob) — Redux mein nahi jaate, saga seedha download karwata hai
export const downloadRequestPdf = async (requestId) => {
  const blob = await apiClient.get(`${BASE}/${requestId}/download/pdf`, { responseType: 'blob' });
  return blob;
};

export const downloadRequestZip = async (requestId) => {
  const blob = await apiClient.get(`${BASE}/${requestId}/download/zip`, { responseType: 'blob' });
  return blob;
};

// Bulk print: kai requests ke saare cards ek PDF mein (max 20 requests)
export const getBulkPrintPdf = async (requestIds) => {
  const blob = await apiClient.post(`${BASE}/bulk/pdf`, { requestIds }, { responseType: 'blob' });
  return blob;
};

// Wizard helpers (ID cards feature ke API reuse)
export const getWizardTemplates = getCardTemplates;
export const getWizardStudents = getCardStudents;
export const previewCard = previewIdCard;

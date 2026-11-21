// letterheadApi.js — /api/letterheads (Letterhead Studio)
import apiClient from '../../api/apiClient.js';
import { getCollegesApi, getMyCollegeApi, getCollegeByIdApi } from '../colleges/collegeApi.js';

const BASE = '/letterheads';
const clean = (params = {}) => Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''));

export const listLetterheads = async (params = {}) => apiClient.get(BASE, { params: clean(params) });
export const getLetterhead = async (id) => apiClient.get(`${BASE}/${id}`);
export const createLetterhead = async (body) => apiClient.post(BASE, body);
export const updateLetterhead = async (id, body) => apiClient.patch(`${BASE}/${id}`, body);
export const deleteLetterhead = async (id) => apiClient.delete(`${BASE}/${id}`);
export const duplicateLetterhead = async (id) => apiClient.post(`${BASE}/${id}/duplicate`);
export const setDefaultLetterhead = async (id) => apiClient.post(`${BASE}/${id}/set-default`);
export const listLetterheadTemplates = async (segment) => apiClient.get(`${BASE}/templates`, { params: clean({ segment }) });
export const getLetterheadSettings = async () => apiClient.get(`${BASE}/settings`);
export const updateLetterheadSettings = async (body) => apiClient.put(`${BASE}/settings`, body);

/**
 * Apna letterhead file (PDF / PNG / JPG) → normalised A4 PDF
 * @param {{ file: File, page?: 'FIRST'|'CONTINUATION', collegeId?: string }} input
 */
export const uploadCustomLetterhead = async ({ file, page = 'FIRST', collegeId }) => {
  const form = new FormData();
  form.append('file', file);
  form.append('page', page);
  if (collegeId) form.append('collegeId', collegeId);
  return apiClient.post(`${BASE}/upload-custom`, form, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 120000 });
};

/** Preview (unsaved config ya letterheadId) → PDF Blob (page 1 / 2, sample letter) */
// arraybuffer: error (JSON) ko yahin decode karte hain taaki normalizeApiError asli message dikhaye
const decodeErrorBody = (data, headers, status) => {
  if (status >= 400 && data instanceof ArrayBuffer) {
    try {
      return JSON.parse(new TextDecoder().decode(data));
    } catch {
      return null;
    }
  }
  return data;
};

export const previewLetterhead = async (body) => {
  const data = await apiClient.post(`${BASE}/preview`, body, { responseType: 'arraybuffer', timeout: 60000, transformResponse: [decodeErrorBody] });
  return new Blob([data], { type: 'application/pdf' });
};

// Org details ke placeholder (school profile) + Super Admin ka school picker
export const getCollegeForLetterhead = async (collegeId) => (collegeId ? getCollegeByIdApi(collegeId) : getMyCollegeApi());
export const getCollegeOptions = async () => getCollegesApi({ page: 1, limit: 100 });

// documentApi.js — /api/documents: generate (PDF + X-Ref-No), preview (page 1), history, saved copy download.
// apiClient interceptor sirf response.data deta hai — isliye PDF wale calls transformResponse mein headers
// saath rakh lete hain, aur error ka JSON body yahin decode hota hai (normalizeApiError asli message dikhaye).
import apiClient from '../../api/apiClient.js';

const BASE = '/documents';
const clean = (params = {}) => Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''));

const header = (headers, name) => (typeof headers?.get === 'function' ? headers.get(name) : headers?.[name]) || null;

const pdfResponse = (data, headers, status) => {
  if (status >= 400) {
    try {
      return JSON.parse(new TextDecoder().decode(data));
    } catch {
      return null;
    }
  }
  return {
    blob: new Blob([data], { type: 'application/pdf' }),
    refNo: header(headers, 'x-ref-no'),
    pageCount: Number(header(headers, 'x-page-count')) || null,
    documentId: header(headers, 'x-document-id'),
  };
};

const pdfConfig = { responseType: 'arraybuffer', timeout: 90000, transformResponse: [pdfResponse] };

/** @returns {Promise<{ blob: Blob, refNo: string, pageCount: number, documentId: string }>} */
export const generateDocumentApi = async (body) => apiClient.post(`${BASE}/generate`, body, pdfConfig);

/** Ek page ka preview (kuch save nahi hota) @returns {Promise<{ blob, refNo, pageCount }>} */
export const previewDocumentApi = async (body) => apiClient.post(`${BASE}/preview`, body, pdfConfig);

export const listDocumentsApi = async (params = {}) => apiClient.get(BASE, { params: clean(params) });

/** Saved copy @returns {Promise<{ blob }>} */
export const downloadDocumentApi = async (id) => apiClient.get(`${BASE}/${id}/download`, pdfConfig);

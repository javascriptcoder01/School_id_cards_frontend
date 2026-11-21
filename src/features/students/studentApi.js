
// studentApi.js
import apiClient from '../../api/apiClient.js';

export const getStudents = async (params = {}) => {
  const queryParams = {};
  if (params.page !== undefined && params.page !== null && params.page !== '') {
    queryParams.page = params.page;
  }
  if (params.limit !== undefined && params.limit !== null && params.limit !== '') {
    queryParams.limit = params.limit;
  }
  if (params.search && typeof params.search === 'string' && params.search.trim().length > 0) {
    queryParams.search = params.search.trim();
  }
  // COLLEGE_ADMIN class/section filter (operator ke liye backend apna scope lagata hai)
  if (params.className && typeof params.className === 'string' && params.className.trim().length > 0) {
    queryParams.className = params.className.trim();
  }
  if (params.section && typeof params.section === 'string' && params.section.trim().length > 0) {
    queryParams.section = params.section.trim();
  }

  const response = await apiClient.get('/students', { params: queryParams });
  return response;
};

export const getStudentById = async (studentId) => {
  const response = await apiClient.get(`/students/${studentId}`);
  return response;
};

export const createStudent = async (payload) => {
  const response = await apiClient.post('/students', payload);
  return response;
};

export const updateStudent = async (studentId, payload) => {
  const response = await apiClient.put(`/students/${studentId}`, payload);
  return response;
};

export const updateStudentStatus = async (studentId, isActive) => {
  const response = await apiClient.patch(`/students/${studentId}/status`, { isActive });
  return response;
};

/* ---------------- Bulk import (Excel / CSV + photos) — /students/import/* ---------------- */

/**
 * Preview: file + optional photos (ek .zip ya kai images) + School admin ki default class (khaali Class rows ke liye)
 * @param {{ file: File, photos?: File[], className?: string, section?: string }} input
 */
export const previewStudentImport = async ({ file, photos = [], className, section }) => {
  const formData = new FormData();
  formData.append('file', file);
  photos.forEach((photo) => formData.append('photos', photo));
  if (className) formData.append('className', className);
  if (section) formData.append('section', section);
  const response = await apiClient.post('/students/import/preview', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 5 * 60 * 1000, // 200 MB ZIP tak
  });
  return response;
};

export const confirmStudentImport = async (importId, { skipInvalid = true } = {}) => {
  const response = await apiClient.post(`/students/import/${importId}/confirm`, { skipInvalid });
  return response;
};

// Confirm ke baad photo upload progress
export const getStudentImportStatus = async (importId) => {
  const response = await apiClient.get(`/students/import/${importId}/status`);
  return response;
};

export const downloadStudentImportTemplate = async () => {
  const blob = await apiClient.get('/students/import/template', { responseType: 'blob' });
  return blob;
};

export const downloadStudentImportErrors = async (importId) => {
  const blob = await apiClient.get(`/students/import/${importId}/errors`, { responseType: 'blob' });
  return blob;
};

export default {
  previewStudentImport,
  confirmStudentImport,
  getStudentImportStatus,
  downloadStudentImportTemplate,
  downloadStudentImportErrors,
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  updateStudentStatus,
};


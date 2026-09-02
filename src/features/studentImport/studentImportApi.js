import apiClient from '../../api/apiClient.js';

/**
 * Student Bulk Import API Service
 * Interacts with backend /api/students/import endpoint using centralized apiClient
 */

export const uploadStudents = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/students/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response;
};

export default {
  uploadStudents,
};


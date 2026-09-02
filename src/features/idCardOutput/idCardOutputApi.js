import apiClient from '../../api/apiClient.js';

/**
 * ID Card Output Download & Export API Service
 * Interacts with backend /api/id-cards/generations/* download endpoints using responseType 'blob'
 */

export const downloadStudentCard = async (generationId, studentId) => {
  const response = await apiClient.get(
    `/id-cards/generations/${generationId}/results/${studentId}/download`,
    {
      responseType: 'blob',
    }
  );
  return response;
};

export const downloadGenerationZip = async (generationId) => {
  const response = await apiClient.get(
    `/id-cards/generations/${generationId}/download`,
    {
      responseType: 'blob',
    }
  );
  return response;
};

export default {
  downloadStudentCard,
  downloadGenerationZip,
};


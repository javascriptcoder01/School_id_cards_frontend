import apiClient from '../../api/apiClient.js';

/**
 * Public ID Card QR Verification API Service
 * Interacts with backend /api/public/id-card/verify/:token
 */

export const verifyIdCard = async (token) => {
  const cleanToken = typeof token === 'string' ? token.trim() : '';
  const response = await apiClient.get(`/public/id-card/verify/${encodeURIComponent(cleanToken)}`);
  return response;
};

export default {
  verifyIdCard,
};


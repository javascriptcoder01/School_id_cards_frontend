import apiClient from '../../api/apiClient.js';

/**
 * Isolated Authentication API Service
 */
export const loginApi = async ({ email, password }) => {
  const response = await apiClient.post('/auth/login', {
    email,
    password,
  });
  return response;
};

export default {
  loginApi,
};


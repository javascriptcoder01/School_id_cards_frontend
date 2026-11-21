import apiClient from '../../api/apiClient.js';

/**
 * Isolated Authentication API Service
 */
export const loginApi = async ({ keyCode, email, password }) => {
  const response = await apiClient.post('/auth/login', {
    keyCode,
    email,
    password,
  });
  return response;
};

export default {
  loginApi,
};


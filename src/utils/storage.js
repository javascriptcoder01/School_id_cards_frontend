import { STORAGE_KEYS } from '../constants/storage.js';

/**
 * Safe Local Storage Wrapper for Authentication & Session persistence
 */

export const getAuthToken = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || null;
  } catch {
    return null;
  }
};

export const getRefreshToken = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) || null;
  } catch {
    return null;
  }
};

export const setAuthTokens = (accessToken, refreshToken) => {
  try {
    if (accessToken) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    }
    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
  } catch {
    // Fail safely if storage quota is exceeded or storage is disabled
  }
};

export const clearAuthTokens = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch {
    // Fail safely
  }
};

export const getUserData = () => {
  try {
    const rawData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!rawData) return null;
    return JSON.parse(rawData);
  } catch {
    // Malformed JSON should not crash the app
    clearUserData();
    return null;
  }
};

export const setUserData = (user) => {
  try {
    if (user && typeof user === 'object') {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    }
  } catch {
    // Fail safely
  }
};

export const clearUserData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  } catch {
    // Fail safely
  }
};

export const clearAuthStorage = () => {
  clearAuthTokens();
  clearUserData();
};

export default {
  getAuthToken,
  getRefreshToken,
  setAuthTokens,
  clearAuthTokens,
  getUserData,
  setUserData,
  clearUserData,
  clearAuthStorage,
};


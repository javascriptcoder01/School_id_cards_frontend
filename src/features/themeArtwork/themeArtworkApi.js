// themeArtworkApi.js — Super Admin theme artwork (SVG) — /api/theme-artworks
// Read: koi bhi logged-in user; write: SUPER_ADMIN.
import apiClient from '../../api/apiClient.js';

const BASE = '/theme-artworks';

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
  );

export const listThemeArtworks = async (params = {}) => apiClient.get(BASE, { params: cleanParams(params) });

export const listActiveThemeArtworks = async () => apiClient.get(`${BASE}/active`);

/** Sanitised SVG ke saath */
export const getThemeArtwork = async (artworkId) => apiClient.get(`${BASE}/${artworkId}`);

/**
 * @param {{ file: File, name: string, category?: string, orientation?: string }} data
 */
export const createThemeArtwork = async ({ file, name, category, orientation }) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', name);
  if (category) formData.append('category', category);
  if (orientation) formData.append('orientation', orientation);
  return apiClient.post(BASE, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const updateThemeArtwork = async (artworkId, body) => apiClient.patch(`${BASE}/${artworkId}`, body);

export const deleteThemeArtwork = async (artworkId) => apiClient.delete(`${BASE}/${artworkId}`);

export default {
  listThemeArtworks,
  listActiveThemeArtworks,
  getThemeArtwork,
  createThemeArtwork,
  updateThemeArtwork,
  deleteThemeArtwork,
};

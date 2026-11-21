// protectedFile.js — login wale file endpoints (PDF / image) ko blob ki tarah laao aur naye tab mein kholo.
// Cloudinary PDF ka public link block hai, isliye proof server se aata hai (signed download).
import apiClient from '../api/apiClient.js';

// arraybuffer: success par Blob (sahi content-type), error par JSON decode (normalizeApiError asli message dikhaye)
const toBlobOrError = (data, headers, status) => {
  if (status >= 400) {
    try {
      return JSON.parse(new TextDecoder().decode(data));
    } catch {
      return null;
    }
  }
  const type = (typeof headers?.get === 'function' ? headers.get('content-type') : headers?.['content-type']) || 'application/octet-stream';
  return new Blob([data], { type: String(type).split(';')[0] });
};

/** GET path → Blob */
export const fetchProtectedFile = async (path) =>
  apiClient.get(path, { responseType: 'arraybuffer', timeout: 60000, transformResponse: [toBlobOrError] });

/**
 * Tab pehle kholo (click ke turant baad — popup block na ho), phir file aane par usme dikhao.
 * @param {() => Promise<Blob>} fetcher
 */
export const openProtectedFileInNewTab = async (fetcher) => {
  const win = window.open('', '_blank');
  try {
    const blob = await fetcher();
    const url = URL.createObjectURL(blob);
    if (win) win.location.href = url;
    else window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (error) {
    if (win) win.close();
    throw error;
  }
};

export default { fetchProtectedFile, openProtectedFileInNewTab };

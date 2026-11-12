// useLocalProcessedImage.js — base64 image (Cloudinary nahi) ka background removal browser mein.
// Processed image ka data URL deta hai; tab tak / fail par null (caller original dikhata hai).
import { useEffect, useState } from 'react';
import { isLocalProcessableUrl, processImageUrlLocally } from '../utils/localImageProcessing.js';

/**
 * @param {string|null} url - original image (data:image/...)
 * @param {object|null} settings - render data processing.settings; null = kuch nahi
 * @returns {{ url: string|null, loading: boolean, error: boolean }}
 */
export const useLocalProcessedImage = (url, settings) => {
  const active = Boolean(settings) && isLocalProcessableUrl(url);
  const settingsKey = active ? JSON.stringify(settings) : '';
  const [state, setState] = useState({ key: null, url: null, error: false });
  const requestKey = active ? `${url?.length}|${url?.slice(-48)}|${settingsKey}` : null;

  useEffect(() => {
    if (!active) return undefined;
    let cancelled = false;
    processImageUrlLocally(url, JSON.parse(settingsKey))
      .then((processed) => {
        if (!cancelled) setState({ key: requestKey, url: processed, error: false });
      })
      .catch(() => {
        if (!cancelled) setState({ key: requestKey, url: null, error: true });
      });
    return () => {
      cancelled = true;
    };
  }, [active, url, settingsKey, requestKey]);

  if (!active) return { url: null, loading: false, error: false };
  const current = state.key === requestKey;
  return { url: current ? state.url : null, loading: !current, error: current && state.error };
};

export default useLocalProcessedImage;

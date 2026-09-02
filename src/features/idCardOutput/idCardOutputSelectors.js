/**
 * ID Card Output Download Selectors
 */

export const selectIdCardOutputState = (state) => state.idCardOutput;

export const selectDownloadStatus = (state) =>
  state.idCardOutput?.downloadStatus || 'IDLE';

export const selectDownloadingType = (state) =>
  state.idCardOutput?.downloadingType || null;

export const selectCurrentDownload = (state) =>
  state.idCardOutput?.currentDownload || null;

export const selectDownloadError = (state) =>
  state.idCardOutput?.error || null;

export const selectIsDownloading = (state) =>
  state.idCardOutput?.downloadStatus === 'DOWNLOADING';

export default {
  selectIdCardOutputState,
  selectDownloadStatus,
  selectDownloadingType,
  selectCurrentDownload,
  selectDownloadError,
  selectIsDownloading,
};


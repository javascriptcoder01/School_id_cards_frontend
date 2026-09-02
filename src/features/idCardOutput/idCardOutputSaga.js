import { takeLatest, call, put } from 'redux-saga/effects';
import {
  downloadStudentCardRequested,
  downloadStudentCardSucceeded,
  downloadStudentCardFailed,
  downloadGenerationZipRequested,
  downloadGenerationZipSucceeded,
  downloadGenerationZipFailed,
} from './idCardOutputSlice.js';
import {
  downloadStudentCard,
  downloadGenerationZip,
} from './idCardOutputApi.js';

/**
 * Helper to extract filename from Content-Disposition header
 */
export const getFilenameFromHeader = (contentDisposition, defaultName) => {
  if (!contentDisposition) return defaultName;
  const match = contentDisposition.match(/filename=["']?([^"';]+)["']?/i);
  return match && match[1] ? match[1] : defaultName;
};

/**
 * Helper to trigger browser download and immediately revoke blob URL
 */
export const triggerBrowserDownload = (blobData, mimeType, fileName) => {
  if (typeof window === 'undefined' || !window.URL || !document) return;

  const blob = blobData instanceof Blob ? blobData : new Blob([blobData], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export function* downloadStudentCardWorker(action) {
  const { generationId, studentId, studentName } = action.payload || {};
  try {
    const response = yield call(downloadStudentCard, generationId, studentId);
    const contentDisposition = response?.headers?.['content-disposition'];
    const fileName = getFilenameFromHeader(
      contentDisposition,
      `student-card-${studentName ? studentName.toLowerCase().replace(/\s+/g, '_') : studentId}.png`
    );

    triggerBrowserDownload(response.data, 'image/png', fileName);

    yield put(
      downloadStudentCardSucceeded({
        generationId,
        studentId,
      })
    );

    if (typeof action.payload?.onSuccess === 'function') {
      action.payload.onSuccess({ fileName });
    }
  } catch (error) {
    let message = 'Failed to download student ID card';
    if (error?.response?.status === 404) {
      message = 'Student ID card file is missing or has been cleaned up';
    } else if (error?.message) {
      message = error.message;
    }

    yield put(
      downloadStudentCardFailed({
        generationId,
        studentId,
        error: message,
      })
    );

    if (typeof action.payload?.onError === 'function') {
      action.payload.onError(message);
    }
  }
}

export function* downloadGenerationZipWorker(action) {
  const { generationId } = action.payload || {};
  try {
    const response = yield call(downloadGenerationZip, generationId);
    const contentDisposition = response?.headers?.['content-disposition'];
    const fileName = getFilenameFromHeader(
      contentDisposition,
      `id-cards-generation-${generationId}.zip`
    );

    triggerBrowserDownload(response.data, 'application/zip', fileName);

    yield put(
      downloadGenerationZipSucceeded({
        generationId,
      })
    );

    if (typeof action.payload?.onSuccess === 'function') {
      action.payload.onSuccess({ fileName });
    }
  } catch (error) {
    let message = 'Failed to download generation ZIP archive';
    if (error?.response?.status === 404) {
      message = 'Generation ZIP package is missing or outputs were cleaned up';
    } else if (error?.message) {
      message = error.message;
    }

    yield put(
      downloadGenerationZipFailed({
        generationId,
        error: message,
      })
    );

    if (typeof action.payload?.onError === 'function') {
      action.payload.onError(message);
    }
  }
}

export function* watchIdCardOutput() {
  yield takeLatest(downloadStudentCardRequested.type, downloadStudentCardWorker);
  yield takeLatest(downloadGenerationZipRequested.type, downloadGenerationZipWorker);
}

export default watchIdCardOutput;


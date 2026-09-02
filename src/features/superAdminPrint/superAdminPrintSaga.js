import { takeLatest, call, put } from 'redux-saga/effects';
import {
  loadPrintSummaryRequested,
  loadPrintSummarySucceeded,
  loadPrintSummaryFailed,
  loadCollegePrintDetailsRequested,
  loadCollegePrintDetailsSucceeded,
  loadCollegePrintDetailsFailed,
  downloadResultPngRequested,
  downloadResultPngSucceeded,
  downloadResultPngFailed,
  downloadCollegeZipRequested,
  downloadCollegeZipSucceeded,
  downloadCollegeZipFailed,
  downloadCollegePdfRequested,
  downloadCollegePdfSucceeded,
  downloadCollegePdfFailed,
} from './superAdminPrintSlice.js';
import {
  getPrintSummary,
  getCollegePrintDetails,
  downloadResultPng,
  downloadCollegeZip,
  downloadCollegePdf,
} from './superAdminPrintApi.js';
import { showNotification } from '../notifications/notificationSlice.js';

export const triggerBrowserDownload = (blobData, mimeType, fileName) => {
  if (typeof window === 'undefined' || !window.URL || !document) return;

  const blob = blobData instanceof Blob ? blobData : new Blob([blobData], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    if (link.parentNode) {
      document.body.removeChild(link);
    }
    window.URL.revokeObjectURL(url);
  }
};

export function* loadPrintSummaryWorker(action) {
  try {
    const params = action.payload || {};
    const data = yield call(getPrintSummary, params);
    yield put(loadPrintSummarySucceeded(data));
  } catch (error) {
    const message = error?.message || 'Failed to load print center summary';
    yield put(loadPrintSummaryFailed(message));
    yield put(
      showNotification({
        type: 'ERROR',
        title: 'Print Center Error',
        message,
      })
    );
  }
}

export function* loadCollegePrintDetailsWorker(action) {
  try {
    const collegeId = typeof action.payload === 'object' ? action.payload.collegeId : action.payload;
    const data = yield call(getCollegePrintDetails, collegeId);
    yield put(loadCollegePrintDetailsSucceeded(data));
  } catch (error) {
    const message = error?.message || 'Failed to load college print details';
    yield put(loadCollegePrintDetailsFailed(message));
    yield put(
      showNotification({
        type: 'ERROR',
        title: 'College Queue Error',
        message,
      })
    );
  }
}

export function* downloadResultPngWorker(action) {
  try {
    const { resultId, studentName } = typeof action.payload === 'object' ? action.payload : { resultId: action.payload };
    const blobData = yield call(downloadResultPng, resultId);
    const fileName = `id-card-${studentName ? studentName.toLowerCase().replace(/\s+/g, '_') : resultId}.png`;

    triggerBrowserDownload(blobData, 'image/png', fileName);
    yield put(downloadResultPngSucceeded({ resultId }));
    yield put(
      showNotification({
        type: 'SUCCESS',
        title: 'Download Complete',
        message: 'ID Card PNG downloaded successfully.',
      })
    );
  } catch (error) {
    const message = error?.message || 'Failed to download card PNG';
    yield put(downloadResultPngFailed(message));
    yield put(
      showNotification({
        type: 'ERROR',
        title: 'Download Failed',
        message,
      })
    );
  }
}

export function* downloadCollegeZipWorker(action) {
  try {
    const { collegeId, collegeCode } = typeof action.payload === 'object' ? action.payload : { collegeId: action.payload };
    const blobData = yield call(downloadCollegeZip, collegeId);
    const fileName = `${collegeCode ? collegeCode.toUpperCase() : 'College'}_ID_Cards.zip`;

    triggerBrowserDownload(blobData, 'application/zip', fileName);
    yield put(downloadCollegeZipSucceeded({ collegeId }));
    yield put(
      showNotification({
        type: 'SUCCESS',
        title: 'ZIP Export Complete',
        message: 'College ID cards archive downloaded successfully.',
      })
    );
  } catch (error) {
    const message = error?.message || 'Failed to download college ZIP package';
    yield put(downloadCollegeZipFailed(message));
    yield put(
      showNotification({
        type: 'ERROR',
        title: 'ZIP Export Failed',
        message,
      })
    );
  }
}

export function* downloadCollegePdfWorker(action) {
  try {
    const { collegeId, collegeCode } = typeof action.payload === 'object' ? action.payload : { collegeId: action.payload };
    const blobData = yield call(downloadCollegePdf, collegeId);
    const fileName = `${collegeCode ? collegeCode.toUpperCase() : 'College'}_Print_Ready_ID_Cards.pdf`;

    triggerBrowserDownload(blobData, 'application/pdf', fileName);
    yield put(downloadCollegePdfSucceeded({ collegeId }));
    yield put(
      showNotification({
        type: 'SUCCESS',
        title: 'PDF Export Complete',
        message: 'Print-ready PDF document downloaded successfully.',
      })
    );
  } catch (error) {
    const message = error?.message || 'Failed to export print-ready PDF';
    yield put(downloadCollegePdfFailed(message));
    yield put(
      showNotification({
        type: 'ERROR',
        title: 'PDF Export Failed',
        message,
      })
    );
  }
}

export function* watchSuperAdminPrint() {
  yield takeLatest(loadPrintSummaryRequested.type, loadPrintSummaryWorker);
  yield takeLatest(loadCollegePrintDetailsRequested.type, loadCollegePrintDetailsWorker);
  yield takeLatest(downloadResultPngRequested.type, downloadResultPngWorker);
  yield takeLatest(downloadCollegeZipRequested.type, downloadCollegeZipWorker);
  yield takeLatest(downloadCollegePdfRequested.type, downloadCollegePdfWorker);
}

export default watchSuperAdminPrint;

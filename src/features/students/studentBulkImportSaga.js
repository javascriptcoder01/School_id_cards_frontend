// studentBulkImportSaga.js — Bulk import: importPreview, importConfirm, pollImportStatus (khatam / page chhodne par band),
// downloadTemplate, downloadErrors.
import { takeLatest, takeEvery, call, put, delay, race, take } from 'redux-saga/effects';
import { showNotification } from '../notifications/notificationSlice.js';
import {
  importPreviewRequested,
  importPreviewSucceeded,
  importPreviewFailed,
  importConfirmRequested,
  importConfirmSucceeded,
  importConfirmFailed,
  startImportPolling,
  stopImportPolling,
  importStatusSucceeded,
  importDownloadRequested,
  importDownloadFinished,
  backToImportUpload,
  resetBulkImport,
} from './studentBulkImportSlice.js';
import {
  previewStudentImport,
  confirmStudentImport,
  getStudentImportStatus,
  downloadStudentImportTemplate,
  downloadStudentImportErrors,
} from './studentApi.js';

const IMPORT_POLL_MS = 2000;

// object URL → <a download> → URL free (blob store mein nahi)
const saveBlobAsFile = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/** payload: { file, photos?, className?, section? } */
export function* importPreviewWorker(action) {
  try {
    const response = yield call(previewStudentImport, action.payload || {});
    yield put(importPreviewSucceeded(response?.data || response));
  } catch (error) {
    yield put(importPreviewFailed(error?.message || 'Could not read the file'));
  }
}

/** payload: { importId, skipInvalid? } — photos chal rahi hon to polling shuru */
export function* importConfirmWorker(action) {
  const { importId, skipInvalid = true } = action.payload || {};
  try {
    const response = yield call(confirmStudentImport, importId, { skipInvalid });
    const data = response?.data || response;
    yield put(importConfirmSucceeded(data));
    yield put(
      showNotification({
        type: data?.failed?.length ? 'WARNING' : 'SUCCESS',
        title: 'Students imported',
        message: `${data?.created || 0} student(s) created${data?.failed?.length ? `, ${data.failed.length} failed` : ''}.`,
      })
    );
    if (data?.photoProgress?.status === 'RUNNING') yield put(startImportPolling({ importId }));
  } catch (error) {
    yield put(importConfirmFailed(error?.message || 'Import failed'));
  }
}

// Har 2 s status; photo job khatam (DONE / STALLED) → band
function* pollImportLoop(importId) {
  while (true) {
    try {
      const response = yield call(getStudentImportStatus, importId);
      const data = response?.data || response;
      yield put(importStatusSucceeded(data));
      if (!data?.photoProgress || data.photoProgress.status !== 'RUNNING') return;
    } catch (error) {
      if (error?.statusCode === 404) {
        yield put(importStatusSucceeded({ photoProgress: null }));
        return;
      }
      // network hiccup → agli baar phir
    }
    yield delay(IMPORT_POLL_MS);
  }
}

// Page chhoda / naya import → stop
export function* pollImportStatusWorker(action) {
  const importId = action.payload?.importId;
  if (!importId) return;
  yield race({
    poll: call(pollImportLoop, importId),
    stop: take([stopImportPolling.type, resetBulkImport.type, backToImportUpload.type]),
  });
}

/** payload: { kind: 'template' | 'errors', importId? } */
export function* importDownloadWorker(action) {
  const { kind, importId } = action.payload || {};
  try {
    if (kind === 'template') {
      saveBlobAsFile(yield call(downloadStudentImportTemplate), 'student-import-template.xlsx');
    } else {
      saveBlobAsFile(yield call(downloadStudentImportErrors, importId), 'student-import-errors.xlsx');
    }
    yield put(importDownloadFinished());
  } catch (error) {
    const message = error?.statusCode === 404 ? 'This import has expired. Upload the file again.' : error?.message || 'Download failed';
    yield put(importDownloadFinished({ error: message }));
  }
}

export function* watchStudentBulkImport() {
  yield takeLatest(importPreviewRequested.type, importPreviewWorker);
  yield takeLatest(importConfirmRequested.type, importConfirmWorker);
  yield takeLatest(startImportPolling.type, pollImportStatusWorker);
  yield takeEvery(importDownloadRequested.type, importDownloadWorker);
}

export default watchStudentBulkImport;

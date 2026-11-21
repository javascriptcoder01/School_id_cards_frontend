// documentSaga.js — generate (PDF blob → file save, toast mein ref no), preview (object URL, purana free),
// history list, saved copy download.
import { call, put, takeLatest, takeEvery, select } from 'redux-saga/effects';
import {
  generateDocumentRequested,
  generateDocumentSucceeded,
  generateDocumentFailed,
  documentPreviewRequested,
  documentPreviewSucceeded,
  documentPreviewFailed,
  documentPreviewCleared,
  fetchDocumentsRequested,
  fetchDocumentsSucceeded,
  fetchDocumentsFailed,
  downloadDocumentRequested,
  downloadDocumentFinished,
} from './documentSlice.js';
import { generateDocumentApi, previewDocumentApi, listDocumentsApi, downloadDocumentApi } from './documentApi.js';
import { selectDocumentPreview } from './documentSelectors.js';
import { showNotification } from '../notifications/notificationSlice.js';

const msg = (error, fallback) => error?.message || fallback;

// "RPIC0123/2026/0007" → "RPIC0123-2026-0007.pdf" (backend jaisa). Yahin rakha — constants/documents.js
// (quick templates) main bundle mein na aaye.
export const pdfFileName = (refNo) =>
  `${String(refNo || 'document').replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'document'}.pdf`;

// Blob → browser download (filename = ref no)
export const saveBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
};

function* generateWorker(action) {
  const { body, onSuccess } = action.payload || {};
  try {
    const result = yield call(generateDocumentApi, body);
    yield call(saveBlob, result.blob, pdfFileName(result.refNo));
    const info = { refNo: result.refNo, pageCount: result.pageCount, documentId: result.documentId };
    yield put(generateDocumentSucceeded(info));
    yield put(
      showNotification({
        type: 'SUCCESS',
        title: 'Document generated',
        message: `Ref. no. ${result.refNo || '—'} · ${result.pageCount || 1} page(s)${body?.saveCopy ? ' · copy saved' : ''}`,
        duration: 6000,
      })
    );
    if (typeof onSuccess === 'function') onSuccess(info);
  } catch (error) {
    yield put(generateDocumentFailed(msg(error, 'Could not generate the document')));
  }
}

function* revokePreviewUrl() {
  const { url } = yield select(selectDocumentPreview);
  if (url) URL.revokeObjectURL(url);
}

function* previewWorker(action) {
  try {
    const result = yield call(previewDocumentApi, action.payload?.body || {});
    yield call(revokePreviewUrl);
    yield put(documentPreviewSucceeded({ url: URL.createObjectURL(result.blob), refNo: result.refNo, pageCount: result.pageCount }));
  } catch (error) {
    yield put(documentPreviewFailed(msg(error, 'Preview could not be made')));
  }
}

const revokeUrl = (url) => url && URL.revokeObjectURL(url);

function* clearPreviewWorker(action) {
  // reducer pehle chal chuka; URL action payload mein aata hai
  yield call(revokeUrl, action.payload?.url);
}

function* listWorker(action) {
  try {
    const response = yield call(listDocumentsApi, action.payload || {});
    yield put(fetchDocumentsSucceeded(response?.data ?? response));
  } catch (error) {
    yield put(fetchDocumentsFailed(msg(error, 'Could not load documents')));
  }
}

function* downloadWorker(action) {
  const { id, refNo } = action.payload || {};
  try {
    const result = yield call(downloadDocumentApi, id);
    yield call(saveBlob, result.blob, pdfFileName(refNo));
  } catch (error) {
    yield put(showNotification({ type: 'ERROR', title: 'Download failed', message: msg(error, 'Please try again') }));
  } finally {
    yield put(downloadDocumentFinished());
  }
}

export function* watchDocuments() {
  yield takeLatest(generateDocumentRequested.type, generateWorker);
  yield takeLatest(documentPreviewRequested.type, previewWorker);
  yield takeEvery(documentPreviewCleared.type, clearPreviewWorker);
  yield takeLatest(fetchDocumentsRequested.type, listWorker);
  yield takeEvery(downloadDocumentRequested.type, downloadWorker);
}

export default watchDocuments;

// idCardSaga.js
import { takeLatest, takeEvery, call, put } from 'redux-saga/effects';
import {
  previewIdCardRequested,
  previewIdCardSucceeded,
  previewIdCardFailed,
  fetchCardTemplatesRequested,
  fetchCardTemplatesSucceeded,
  fetchCardTemplatesFailed,
  fetchCardStudentsRequested,
  fetchCardStudentsSucceeded,
  fetchCardStudentsFailed,
  fetchBatchesRequested,
  fetchBatchesSucceeded,
  fetchBatchesFailed,
  fetchBatchRequested,
  fetchBatchSucceeded,
  fetchBatchFailed,
  downloadBatchPdfRequested,
  downloadBatchPdfSucceeded,
  downloadBatchPdfFailed,
} from './idCardSlice.js';
import {
  previewIdCard,
  getBatches,
  getBatchById,
  downloadBatchPdf,
  getCardTemplates,
  getCardStudents,
} from './idCardApi.js';
import { showNotification } from '../notifications/notificationSlice.js';

const dataOf = (response) => response?.data ?? response;

// Blob request ki error body bhi blob hoti hai, isliye message status se
const pdfErrorMessage = (error) => {
  if (error?.statusCode === 404) return 'This batch has no cards to download.';
  if (error?.statusCode === 403) return 'You are not allowed to download this batch.';
  return error?.message || 'Failed to download PDF';
};

// Browser download: object URL → <a download> click → URL free. Blob store mein nahi jaata.
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

export function* previewIdCardWorker(action) {
  try {
    const { templateId, studentId } = action.payload || {};
    const response = yield call(previewIdCard, { templateId, studentId });
    yield put(previewIdCardSucceeded(dataOf(response)?.renderData || null));
  } catch (error) {
    yield put(previewIdCardFailed(error?.message || 'Failed to load card preview'));
  }
}

export function* fetchCardTemplatesWorker(action) {
  try {
    const templates = yield call(getCardTemplates, { isOperator: Boolean(action.payload?.isOperator) });
    yield put(fetchCardTemplatesSucceeded(templates));
  } catch (error) {
    yield put(fetchCardTemplatesFailed(error?.message || 'Failed to load templates'));
  }
}

export function* fetchCardStudentsWorker(action) {
  try {
    const response = yield call(getCardStudents, action.payload || {});
    const data = dataOf(response);
    yield put(
      fetchCardStudentsSucceeded({
        students: data?.students || [],
        classScope: data?.classScope,
      })
    );
  } catch (error) {
    yield put(fetchCardStudentsFailed(error?.message || 'Failed to load students'));
  }
}

export function* fetchBatchesWorker(action) {
  try {
    const response = yield call(getBatches, action.payload || {});
    const data = dataOf(response);
    yield put(
      fetchBatchesSucceeded({
        batches: data?.batches || [],
        pagination: data?.pagination || {},
      })
    );
  } catch (error) {
    yield put(fetchBatchesFailed(error?.message || 'Failed to load ID card batches'));
  }
}

export function* fetchBatchWorker(action) {
  try {
    const batchId = action.payload?.batchId || action.payload;
    const response = yield call(getBatchById, batchId);
    const data = dataOf(response);
    yield put(fetchBatchSucceeded({ batch: data?.batch || null, cards: data?.cards || [] }));
  } catch (error) {
    yield put(fetchBatchFailed(error?.message || 'Failed to load ID card batch'));
  }
}

export function* downloadBatchPdfWorker(action) {
  const batchId = action.payload?.batchId;
  try {
    const blob = yield call(downloadBatchPdf, batchId);
    yield call(saveBlobAsFile, blob, `id-cards-${batchId}.pdf`);
    yield put(downloadBatchPdfSucceeded());
  } catch (error) {
    const message = pdfErrorMessage(error);
    yield put(downloadBatchPdfFailed(message));
    yield put(showNotification({ type: 'ERROR', title: 'Download Failed', message }));
  }
}

export function* watchIdCards() {
  yield takeLatest(previewIdCardRequested.type, previewIdCardWorker);
  yield takeLatest(fetchCardTemplatesRequested.type, fetchCardTemplatesWorker);
  yield takeLatest(fetchCardStudentsRequested.type, fetchCardStudentsWorker);
  yield takeLatest(fetchBatchesRequested.type, fetchBatchesWorker);
  yield takeLatest(fetchBatchRequested.type, fetchBatchWorker);
  // Har row ka download alag (ek ke beech doosra cancel na ho)
  yield takeEvery(downloadBatchPdfRequested.type, downloadBatchPdfWorker);
}

export default watchIdCards;

import { takeLatest, call, put } from 'redux-saga/effects';
import {
  fetchGenerationsRequested,
  fetchGenerationsSucceeded,
  fetchGenerationsFailed,
  fetchGenerationDetailRequested,
  fetchGenerationDetailSucceeded,
  fetchGenerationDetailFailed,
  createGenerationRequested,
  createGenerationSucceeded,
  createGenerationFailed,
  createBulkGenerationRequested,
  createBulkGenerationSucceeded,
  createBulkGenerationFailed,
  processGenerationRequested,
  processGenerationSucceeded,
  processGenerationFailed,
  fetchGenerationResultsRequested,
  fetchGenerationResultsSucceeded,
  fetchGenerationResultsFailed,
} from './idCardGenerationSlice.js';
import {
  createGeneration,
  createBulkGeneration,
  getGenerations,
  getGenerationById,
  processGeneration,
  getGenerationResults,
} from './idCardGenerationApi.js';

export function* fetchGenerationsWorker(action) {
  try {
    const params = action.payload || {};
    const response = yield call(getGenerations, params);
    const data = response?.data || response;
    yield put(
      fetchGenerationsSucceeded({
        generations: data?.generations || [],
        pagination: data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 },
      })
    );
  } catch (error) {
    const message = error?.message || 'Failed to fetch ID card generations';
    yield put(fetchGenerationsFailed(message));
  }
}

export function* fetchGenerationDetailWorker(action) {
  try {
    const generationId = typeof action.payload === 'object' ? action.payload.id : action.payload;
    const response = yield call(getGenerationById, generationId);
    const data = response?.data || response;
    const generation = data?.generation || data;
    yield put(fetchGenerationDetailSucceeded(generation));
  } catch (error) {
    const message = error?.message || 'Failed to fetch generation detail';
    yield put(fetchGenerationDetailFailed(message));
  }
}

export function* createGenerationWorker(action) {
  try {
    const payload = action.payload || {};
    const generationData = payload.data || payload;
    const response = yield call(createGeneration, generationData);
    const data = response?.data || response;
    const generation = data?.generation || data;

    yield put(createGenerationSucceeded(generation));

    if (typeof payload.onSuccess === 'function') {
      payload.onSuccess(generation);
    }
  } catch (error) {
    const message = error?.message || 'Failed to create ID card generation';
    yield put(createGenerationFailed(message));
  }
}

export function* createBulkGenerationWorker(action) {
  try {
    const payload = action.payload || {};
    const bulkData = payload.data || payload;
    const response = yield call(createBulkGeneration, bulkData);
    const data = response?.data || response;
    const generation = data?.generation || data;

    yield put(createBulkGenerationSucceeded(generation));

    if (typeof payload.onSuccess === 'function') {
      payload.onSuccess(generation);
    }
  } catch (error) {
    const message = error?.message || 'Failed to create bulk ID card generation';
    yield put(createBulkGenerationFailed(message));
  }
}

export function* processGenerationWorker(action) {
  try {
    const payload = action.payload || {};
    const generationId = typeof payload === 'object' ? payload.id : payload;
    const response = yield call(processGeneration, generationId);
    const data = response?.data || response;
    const generation = data?.generation || data;

    yield put(processGenerationSucceeded(generation));

    if (typeof payload.onSuccess === 'function') {
      payload.onSuccess(generation);
    }
  } catch (error) {
    const message = error?.message || 'Failed to process generation job';
    yield put(processGenerationFailed(message));
  }
}

export function* fetchGenerationResultsWorker(action) {
  try {
    const generationId = typeof action.payload === 'object' ? action.payload.id : action.payload;
    const response = yield call(getGenerationResults, generationId);
    const data = response?.data || response;
    const results = data?.generation || data;
    yield put(fetchGenerationResultsSucceeded(results));
  } catch (error) {
    const message = error?.message || 'Failed to fetch generation results';
    yield put(fetchGenerationResultsFailed(message));
  }
}

export function* watchIdCardGeneration() {
  yield takeLatest(fetchGenerationsRequested.type, fetchGenerationsWorker);
  yield takeLatest(fetchGenerationDetailRequested.type, fetchGenerationDetailWorker);
  yield takeLatest(createGenerationRequested.type, createGenerationWorker);
  yield takeLatest(createBulkGenerationRequested.type, createBulkGenerationWorker);
  yield takeLatest(processGenerationRequested.type, processGenerationWorker);
  yield takeLatest(fetchGenerationResultsRequested.type, fetchGenerationResultsWorker);
}

export default watchIdCardGeneration;


// letterheadCommissionSaga.js — /api/letterhead-commission (Super Admin rates) + organisations list.
import { call, put, takeLatest, takeEvery, delay, select } from 'redux-saga/effects';
import apiClient from '../../api/apiClient.js';
import { getCollegesApi } from '../colleges/collegeApi.js';
import {
  fetchLhRatesRequested,
  fetchLhRatesSucceeded,
  fetchLhRatesFailed,
  fetchLhHistoryRequested,
  fetchLhHistorySucceeded,
  fetchLhHistoryFailed,
  saveLhRateRequested,
  saveLhRateFinished,
  endLhRateRequested,
  endLhRateFinished,
  checkLhPriceRequested,
  checkLhPriceFinished,
  calculateLhDraftRequested,
  calculateLhDraftFinished,
  fetchLhCollegesRequested,
  fetchLhCollegesFinished,
  selectLhCommission,
} from './letterheadCommissionSlice.js';
import { showNotification } from '../notifications/notificationSlice.js';

const BASE = '/letterhead-commission';
const clean = (p = {}) => Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== null && v !== ''));
export const listLhRatesApi = async (params) => apiClient.get(`${BASE}/rates`, { params: clean(params) });
export const createLhRateApi = async (body) => apiClient.post(`${BASE}/rates`, body);
export const endLhRateApi = async (id) => apiClient.post(`${BASE}/rates/${id}/end`);
export const previewLhPriceApi = async (params) => apiClient.get(`${BASE}/rates/preview`, { params: clean(params) });
export const calculateLhDraftApi = async (body) => apiClient.post(`${BASE}/rates/calculate`, body);

const dataOf = (r) => r?.data ?? r;
const msg = (e, f) => e?.message || f;

function* refresh() {
  const { historyParams } = yield select(selectLhCommission);
  yield put(fetchLhRatesRequested());
  yield put(fetchLhHistoryRequested(historyParams || { page: 1, limit: 10 }));
}

function* listWorker() {
  try {
    yield put(fetchLhRatesSucceeded(dataOf(yield call(listLhRatesApi, { page: 1, limit: 1 }))));
  } catch (e) {
    yield put(fetchLhRatesFailed(msg(e, 'Could not load letterhead rates')));
  }
}

function* historyWorker(action) {
  try {
    const { label, ...params } = action.payload || {}; // label sirf UI
    void label;
    yield put(fetchLhHistorySucceeded(dataOf(yield call(listLhRatesApi, params))));
  } catch {
    yield put(fetchLhHistoryFailed());
  }
}

function* saveWorker(action) {
  const { body, onSuccess } = action.payload || {};
  try {
    yield call(createLhRateApi, body);
    yield put(saveLhRateFinished());
    yield put(showNotification({ type: 'SUCCESS', title: 'Letterhead rate saved', message: 'The previous rate at this level has ended.' }));
    yield call(refresh);
    if (typeof onSuccess === 'function') onSuccess();
  } catch (e) {
    yield put(saveLhRateFinished({ error: msg(e, 'Could not save the rate') }));
  }
}

function* endWorker(action) {
  try {
    yield call(endLhRateApi, action.payload.id);
    yield put(showNotification({ type: 'SUCCESS', title: 'Rate ended', message: 'The next broader level applies now.' }));
    yield call(refresh);
    if (typeof action.payload?.onSuccess === 'function') action.payload.onSuccess();
  } catch (e) {
    yield put(showNotification({ type: 'ERROR', title: 'Could not end the rate', message: msg(e, 'Please try again') }));
  } finally {
    yield put(endLhRateFinished());
  }
}

function* checkWorker(action) {
  try {
    const r = yield call(previewLhPriceApi, action.payload?.params || {});
    yield put(checkLhPriceFinished({ ...dataOf(r), message: r?.message || null }));
  } catch (e) {
    yield put(checkLhPriceFinished({ error: msg(e, 'Could not check the price') }));
  }
}

function* draftWorker(action) {
  yield delay(400); // takeLatest + delay = debounce
  try {
    yield put(calculateLhDraftFinished(dataOf(yield call(calculateLhDraftApi, action.payload?.body || {}))?.amount || null));
  } catch (e) {
    yield put(calculateLhDraftFinished({ error: msg(e, 'Example could not be calculated') }));
  }
}

function* collegesWorker() {
  try {
    const data = dataOf(yield call(getCollegesApi, { page: 1, limit: 100 }));
    yield put(fetchLhCollegesFinished((data?.colleges || []).map((c) => ({ id: c.id || c._id, name: c.name, code: c.code, segment: c.segment || 'ACADEMIC' }))));
  } catch {
    yield put(fetchLhCollegesFinished([]));
  }
}

export function* watchLetterheadCommission() {
  yield takeLatest(fetchLhRatesRequested.type, listWorker);
  yield takeLatest(fetchLhHistoryRequested.type, historyWorker);
  yield takeLatest(saveLhRateRequested.type, saveWorker);
  yield takeEvery(endLhRateRequested.type, endWorker);
  yield takeLatest(checkLhPriceRequested.type, checkWorker);
  yield takeLatest(calculateLhDraftRequested.type, draftWorker);
  yield takeLatest(fetchLhCollegesRequested.type, collegesWorker);
}

export default watchLetterheadCommission;

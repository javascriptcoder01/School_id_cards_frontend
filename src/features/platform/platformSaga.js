// platformSaga.js — platform owner: key check (list), organisations create / status.
import { call, put, select, takeLatest, takeEvery } from 'redux-saga/effects';
import {
  unlockPlatformRequested,
  fetchOrganizationsRequested,
  fetchOrganizationsSucceeded,
  fetchOrganizationsFailed,
  lockPlatform,
  createOrganizationRequested,
  createOrganizationSucceeded,
  createOrganizationFailed,
  setOrganizationStatusRequested,
  setOrganizationStatusFinished,
  selectPlatform,
  writePlatformKey,
} from './platformSlice.js';
import { listOrganizationsApi, createOrganizationApi, setOrganizationStatusApi } from './platformApi.js';
import { showNotification } from '../notifications/notificationSlice.js';

const KEY_REJECTED = [401, 429, 503];

function* loadOrganizations(key, { lockOnReject }) {
  try {
    const res = yield call(listOrganizationsApi, key);
    writePlatformKey(key);
    yield put(fetchOrganizationsSucceeded(res?.data?.organizations || []));
  } catch (error) {
    const reject = KEY_REJECTED.includes(error.statusCode);
    if (reject && lockOnReject) writePlatformKey('');
    yield put(fetchOrganizationsFailed({ message: error.message, lock: reject && lockOnReject }));
  }
}

function* unlockWorker(action) {
  yield call(loadOrganizations, action.payload?.key || '', { lockOnReject: true });
}

function* refreshWorker() {
  const { key } = yield select(selectPlatform);
  yield call(loadOrganizations, key, { lockOnReject: true });
}

function* createWorker(action) {
  const { body, onSuccess } = action.payload || {};
  const { key } = yield select(selectPlatform);
  try {
    const res = yield call(createOrganizationApi, key, body);
    yield put(createOrganizationSucceeded(res?.data || null));
    yield put(showNotification({ type: 'SUCCESS', title: 'Organisation created', message: res?.message || '' }));
    yield put(fetchOrganizationsRequested());
    if (typeof onSuccess === 'function') onSuccess(res?.data);
  } catch (error) {
    yield put(createOrganizationFailed(error.message));
  }
}

function* statusWorker(action) {
  const { code, status, onSuccess } = action.payload || {};
  const { key } = yield select(selectPlatform);
  try {
    const res = yield call(setOrganizationStatusApi, key, code, status);
    yield put(setOrganizationStatusFinished({ organization: res?.data?.organization }));
    yield put(showNotification({ type: 'SUCCESS', title: status === 'ACTIVE' ? 'Organisation activated' : 'Organisation suspended', message: res?.message || '' }));
    if (typeof onSuccess === 'function') onSuccess();
  } catch (error) {
    yield put(setOrganizationStatusFinished({ error: error.message }));
  }
}

function* lockWorker() {
  yield call(writePlatformKey, '');
}

export function* watchPlatform() {
  yield takeLatest(unlockPlatformRequested.type, unlockWorker);
  yield takeLatest(fetchOrganizationsRequested.type, refreshWorker);
  yield takeLatest(createOrganizationRequested.type, createWorker);
  yield takeEvery(setOrganizationStatusRequested.type, statusWorker);
  yield takeLatest(lockPlatform.type, lockWorker);
}

export default watchPlatform;

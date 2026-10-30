// collegeSaga.js
import { takeLatest, call, put } from 'redux-saga/effects';
import {
  fetchCollegesRequested,
  fetchCollegesSucceeded,
  fetchCollegesFailed,
  fetchCollegeByIdRequested,
  fetchCollegeByIdSucceeded,
  fetchCollegeByIdFailed,
  fetchMyCollegeRequested,
  fetchMyCollegeSucceeded,
  fetchMyCollegeFailed,
  createCollegeRequested,
  createCollegeSucceeded,
  createCollegeFailed,
  updateCollegeRequested,
  updateCollegeSucceeded,
  updateCollegeFailed,
  updateCollegeStatusRequested,
  updateCollegeStatusSucceeded,
  updateCollegeStatusFailed,
  updateIdCardContactsRequested,
  updateIdCardContactsSucceeded,
  updateIdCardContactsFailed,
} from './collegeSlice.js';
import {
  getCollegesApi,
  getMyCollegeApi,
  getCollegeByIdApi,
  createCollegeApi,
  updateCollegeApi,
  updateCollegeStatusApi,
  updateMyIdCardContactsApi,
} from './collegeApi.js';
import { showNotification } from '../notifications/notificationSlice.js';

/**
 * ID card contact numbers. School Admin → PATCH /colleges/me/id-card-contacts;
 * Super Admin → PUT /colleges/:id { idCardContacts } (dono mein sirf bheje gaye keys badalte hain)
 * payload: { collegeId, isMine, contacts, onSuccess }
 */
export function* updateIdCardContactsWorker(action) {
  const { collegeId, isMine, contacts, onSuccess } = action.payload || {};
  try {
    const response = isMine
      ? yield call(updateMyIdCardContactsApi, contacts)
      : yield call(updateCollegeApi, collegeId, { idCardContacts: contacts });
    const data = response?.data || response;
    const college = data?.college || data;
    yield put(updateIdCardContactsSucceeded(college));
    yield put(
      showNotification({
        type: 'SUCCESS',
        title: 'Contact details saved',
        message: 'ID cards will show the new numbers on the back side.',
      })
    );
    if (typeof onSuccess === 'function') onSuccess(college);
  } catch (error) {
    yield put(updateIdCardContactsFailed(error?.message || 'Failed to save ID card contact details'));
  }
}

export function* fetchCollegesWorker(action) {
  try {
    const params = action.payload || {};
    const response = yield call(getCollegesApi, params);
    const data = response?.data || response;
    yield put(
      fetchCollegesSucceeded({
        colleges: data?.colleges || [],
        pagination: data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 },
      })
    );
  } catch (error) {
    const message = error?.message || 'Failed to fetch colleges';
    yield put(fetchCollegesFailed(message));
  }
}

export function* fetchCollegeByIdWorker(action) {
  try {
    const collegeId = typeof action.payload === 'object' ? action.payload.id : action.payload;
    const response = yield call(getCollegeByIdApi, collegeId);
    const data = response?.data || response;
    const college = data?.college || data;
    yield put(fetchCollegeByIdSucceeded(college));
  } catch (error) {
    const message = error?.message || 'Failed to fetch college details';
    yield put(fetchCollegeByIdFailed(message));
  }
}

export function* fetchMyCollegeWorker() {
  try {
    const response = yield call(getMyCollegeApi);
    const data = response?.data || response;
    const college = data?.college || data;
    yield put(fetchMyCollegeSucceeded(college));
  } catch (error) {
    const message = error?.message || 'Failed to fetch college details';
    yield put(fetchMyCollegeFailed(message));
  }
}

export function* createCollegeWorker(action) {
  try {
    const payload = action.payload || {};
    const collegeData = payload.data || payload;
    const response = yield call(createCollegeApi, collegeData);
    const data = response?.data || response;
    const college = data?.college || data;

    yield put(createCollegeSucceeded(college));

    if (typeof payload.onSuccess === 'function') {
      payload.onSuccess(college);
    }
  } catch (error) {
    const message = error?.message || 'Failed to create college';
    yield put(createCollegeFailed(message));
  }
}

export function* updateCollegeWorker(action) {
  try {
    const payload = action.payload || {};
    const { id, data: updateData } = payload;
    const response = yield call(updateCollegeApi, id, updateData);
    const data = response?.data || response;
    const college = data?.college || data;

    yield put(updateCollegeSucceeded(college));

    if (typeof payload.onSuccess === 'function') {
      payload.onSuccess(college);
    }
  } catch (error) {
    const message = error?.message || 'Failed to update college';
    yield put(updateCollegeFailed(message));
  }
}

export function* updateCollegeStatusWorker(action) {
  try {
    const payload = action.payload || {};
    const { id, isActive } = payload;
    const response = yield call(updateCollegeStatusApi, id, isActive);
    const data = response?.data || response;
    const college = data?.college || data;

    yield put(updateCollegeStatusSucceeded(college));

    if (typeof payload.onSuccess === 'function') {
      payload.onSuccess(college);
    }
  } catch (error) {
    const message = error?.message || 'Failed to update college status';
    yield put(updateCollegeStatusFailed(message));
  }
}

export function* watchColleges() {
  yield takeLatest(fetchCollegesRequested.type, fetchCollegesWorker);
  yield takeLatest(fetchCollegeByIdRequested.type, fetchCollegeByIdWorker);
  yield takeLatest(fetchMyCollegeRequested.type, fetchMyCollegeWorker);
  yield takeLatest(createCollegeRequested.type, createCollegeWorker);
  yield takeLatest(updateCollegeRequested.type, updateCollegeWorker);
  yield takeLatest(updateCollegeStatusRequested.type, updateCollegeStatusWorker);
  yield takeLatest(updateIdCardContactsRequested.type, updateIdCardContactsWorker);
}

export default watchColleges;


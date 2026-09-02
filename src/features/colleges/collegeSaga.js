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
} from './collegeSlice.js';
import {
  getCollegesApi,
  getMyCollegeApi,
  getCollegeByIdApi,
  createCollegeApi,
  updateCollegeApi,
  updateCollegeStatusApi,
} from './collegeApi.js';

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
}

export default watchColleges;


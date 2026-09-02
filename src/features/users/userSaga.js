import { takeLatest, call, put } from 'redux-saga/effects';
import {
  fetchUsersRequested,
  fetchUsersSucceeded,
  fetchUsersFailed,
  fetchUserRequested,
  fetchUserSucceeded,
  fetchUserFailed,
  createUserRequested,
  createUserSucceeded,
  createUserFailed,
  updateUserRequested,
  updateUserSucceeded,
  updateUserFailed,
  updateUserStatusRequested,
  updateUserStatusSucceeded,
  updateUserStatusFailed,
} from './userSlice.js';
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  updateUserStatus,
} from './userApi.js';

export function* fetchUsersWorker(action) {
  try {
    const params = action.payload || {};
    const response = yield call(listUsers, params);
    const data = response?.data || response;
    yield put(
      fetchUsersSucceeded({
        users: data?.users || [],
        pagination: data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 },
      })
    );
  } catch (error) {
    const message = error?.message || 'Failed to fetch users';
    yield put(fetchUsersFailed(message));
  }
}

export function* fetchUserWorker(action) {
  try {
    const userId = typeof action.payload === 'object' ? action.payload.id : action.payload;
    const response = yield call(getUser, userId);
    const data = response?.data || response;
    const user = data?.user || data;
    yield put(fetchUserSucceeded(user));
  } catch (error) {
    const message = error?.message || 'Failed to fetch user details';
    yield put(fetchUserFailed(message));
  }
}

export function* createUserWorker(action) {
  try {
    const payload = action.payload || {};
    const userData = payload.data || payload;
    const response = yield call(createUser, userData);
    const data = response?.data || response;
    const user = data?.user || data;

    yield put(createUserSucceeded(user));

    if (typeof payload.onSuccess === 'function') {
      payload.onSuccess(user);
    }
  } catch (error) {
    const message = error?.message || 'Failed to create user';
    yield put(createUserFailed(message));
  }
}

export function* updateUserWorker(action) {
  try {
    const payload = action.payload || {};
    const { id, data: updateData } = payload;
    const response = yield call(updateUser, id, updateData);
    const data = response?.data || response;
    const user = data?.user || data;

    yield put(updateUserSucceeded(user));

    if (typeof payload.onSuccess === 'function') {
      payload.onSuccess(user);
    }
  } catch (error) {
    const message = error?.message || 'Failed to update user';
    yield put(updateUserFailed(message));
  }
}

export function* updateUserStatusWorker(action) {
  try {
    const payload = action.payload || {};
    const { id, isActive } = payload;
    const response = yield call(updateUserStatus, id, isActive);
    const data = response?.data || response;
    const user = data?.user || data;

    yield put(updateUserStatusSucceeded(user));

    if (typeof payload.onSuccess === 'function') {
      payload.onSuccess(user);
    }
  } catch (error) {
    const message = error?.message || 'Failed to update user status';
    yield put(updateUserStatusFailed(message));
  }
}

export function* watchUsers() {
  yield takeLatest(fetchUsersRequested.type, fetchUsersWorker);
  yield takeLatest(fetchUserRequested.type, fetchUserWorker);
  yield takeLatest(createUserRequested.type, createUserWorker);
  yield takeLatest(updateUserRequested.type, updateUserWorker);
  yield takeLatest(updateUserStatusRequested.type, updateUserStatusWorker);
}

export default watchUsers;


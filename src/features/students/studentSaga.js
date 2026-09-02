import { takeLatest, call, put } from 'redux-saga/effects';
import {
  fetchStudentsRequested,
  fetchStudentsSucceeded,
  fetchStudentsFailed,
  fetchStudentRequested,
  fetchStudentSucceeded,
  fetchStudentFailed,
  createStudentRequested,
  createStudentSucceeded,
  createStudentFailed,
  updateStudentRequested,
  updateStudentSucceeded,
  updateStudentFailed,
  updateStudentStatusRequested,
  updateStudentStatusSucceeded,
  updateStudentStatusFailed,
} from './studentSlice.js';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  updateStudentStatus,
} from './studentApi.js';

export function* fetchStudentsWorker(action) {
  try {
    const params = action.payload || {};
    const response = yield call(getStudents, params);
    const data = response?.data || response;
    yield put(
      fetchStudentsSucceeded({
        students: data?.students || [],
        pagination: data?.pagination || { page: 1, limit: 10, totalItems: 0, totalPages: 0 },
      })
    );
  } catch (error) {
    const message = error?.message || 'Failed to fetch students';
    yield put(fetchStudentsFailed(message));
  }
}

export function* fetchStudentWorker(action) {
  try {
    const studentId = typeof action.payload === 'object' ? action.payload.id : action.payload;
    const response = yield call(getStudentById, studentId);
    const data = response?.data || response;
    const student = data?.student || data;
    yield put(fetchStudentSucceeded(student));
  } catch (error) {
    const message = error?.message || 'Failed to fetch student details';
    yield put(fetchStudentFailed(message));
  }
}

export function* createStudentWorker(action) {
  try {
    const payload = action.payload || {};
    const studentData = payload.data || payload;
    const response = yield call(createStudent, studentData);
    const data = response?.data || response;
    const student = data?.student || data;

    yield put(createStudentSucceeded(student));

    if (typeof payload.onSuccess === 'function') {
      payload.onSuccess(student);
    }
  } catch (error) {
    const message = error?.message || 'Failed to create student';
    yield put(createStudentFailed(message));
  }
}

export function* updateStudentWorker(action) {
  try {
    const payload = action.payload || {};
    const { id, data: updateData } = payload;
    const response = yield call(updateStudent, id, updateData);
    const data = response?.data || response;
    const student = data?.student || data;

    yield put(updateStudentSucceeded(student));

    if (typeof payload.onSuccess === 'function') {
      payload.onSuccess(student);
    }
  } catch (error) {
    const message = error?.message || 'Failed to update student';
    yield put(updateStudentFailed(message));
  }
}

export function* updateStudentStatusWorker(action) {
  try {
    const payload = action.payload || {};
    const { id, isActive } = payload;
    const response = yield call(updateStudentStatus, id, isActive);
    const data = response?.data || response;
    const student = data?.student || data;

    yield put(updateStudentStatusSucceeded(student));

    if (typeof payload.onSuccess === 'function') {
      payload.onSuccess(student);
    }
  } catch (error) {
    const message = error?.message || 'Failed to update student status';
    yield put(updateStudentStatusFailed(message));
  }
}

export function* watchStudents() {
  yield takeLatest(fetchStudentsRequested.type, fetchStudentsWorker);
  yield takeLatest(fetchStudentRequested.type, fetchStudentWorker);
  yield takeLatest(createStudentRequested.type, createStudentWorker);
  yield takeLatest(updateStudentRequested.type, updateStudentWorker);
  yield takeLatest(updateStudentStatusRequested.type, updateStudentStatusWorker);
}

export default watchStudents;


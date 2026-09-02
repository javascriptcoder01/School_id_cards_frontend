import { takeLatest, call, put } from 'redux-saga/effects';
import {
  importStudentsRequested,
  importStudentsSucceeded,
  importStudentsFailed,
} from './studentImportSlice.js';
import { uploadStudents } from './studentImportApi.js';

export function* importStudentsWorker(action) {
  try {
    const file = action.payload?.file || action.payload;
    const response = yield call(uploadStudents, file);
    const data = response?.data || response;
    const result = data?.data || data;

    yield put(
      importStudentsSucceeded({
        totalRecords: result?.totalRecords ?? 0,
        successCount: result?.successCount ?? 0,
        failedCount: result?.failedCount ?? 0,
        errors: result?.errors || [],
      })
    );

    if (typeof action.payload?.onSuccess === 'function') {
      action.payload.onSuccess(result);
    }
  } catch (error) {
    const message = error?.message || 'Failed to import students';
    yield put(importStudentsFailed(message));

    if (typeof action.payload?.onError === 'function') {
      action.payload.onError(error);
    }
  }
}

export function* watchStudentImport() {
  yield takeLatest(importStudentsRequested.type, importStudentsWorker);
}

export default watchStudentImport;


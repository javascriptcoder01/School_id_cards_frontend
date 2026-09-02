import { takeLatest, call, put } from 'redux-saga/effects';
import {
  loadCollegeProgressRequested,
  loadCollegeProgressSucceeded,
  loadCollegeProgressFailed,
} from './collegeProgressSlice.js';
import { getCollegeProgress } from './collegeProgressApi.js';
import { showNotification } from '../notifications/notificationSlice.js';

export function* loadCollegeProgressWorker() {
  try {
    const data = yield call(getCollegeProgress);
    yield put(loadCollegeProgressSucceeded(data));
  } catch (error) {
    const message = error?.message || 'Failed to load college progress analytics';
    yield put(loadCollegeProgressFailed(message));
    yield put(
      showNotification({
        type: 'ERROR',
        title: 'Progress Analytics Error',
        message,
      })
    );
  }
}

export function* watchCollegeProgress() {
  yield takeLatest(loadCollegeProgressRequested.type, loadCollegeProgressWorker);
}

export default watchCollegeProgress;

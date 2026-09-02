import { takeLatest, call, put, select } from 'redux-saga/effects';
import {
  loadDashboardRequested,
  refreshDashboardRequested,
  loadDashboardSucceeded,
  loadDashboardFailed,
} from './dashboardSlice.js';
import {
  getSuperAdminSummary,
  getCollegeAdminSummary,
  getOperatorSummary,
} from './dashboardApi.js';
import { selectUserRole } from '../auth/authSelectors.js';

export function* loadDashboardWorker(action) {
  try {
    let role = typeof action.payload === 'string' ? action.payload : action.payload?.role;
    if (!role) {
      role = yield select(selectUserRole);
    }

    let data;
    if (role === 'SUPER_ADMIN') {
      data = yield call(getSuperAdminSummary);
    } else if (role === 'COLLEGE_ADMIN') {
      data = yield call(getCollegeAdminSummary);
    } else {
      data = yield call(getOperatorSummary);
    }

    yield put(
      loadDashboardSucceeded({
        dashboardType: role,
        summary: data.summary,
        activity: data.activity,
        generationStats: data.generationStats,
      })
    );
  } catch (error) {
    const message = error?.message || 'Failed to load dashboard metrics';
    yield put(loadDashboardFailed(message));
  }
}

export function* watchDashboard() {
  yield takeLatest(
    [loadDashboardRequested.type, refreshDashboardRequested.type],
    loadDashboardWorker
  );
}

export default watchDashboard;

// dashboardOverviewSaga.js
import { call, put, takeLatest } from 'redux-saga/effects';
import {
  fetchSuperAdminOverviewRequested,
  fetchSuperAdminOverviewSucceeded,
  fetchSuperAdminOverviewFailed,
  fetchCollegeAdminOverviewRequested,
  fetchCollegeAdminOverviewSucceeded,
  fetchCollegeAdminOverviewFailed,
} from './dashboardOverviewSlice.js';
import { getSuperAdminOverview, getCollegeAdminOverview } from './dashboardApi.js';

const dataOf = (response) => response?.data ?? response;

export function* fetchSuperAdminOverviewWorker(action) {
  try {
    const response = yield call(getSuperAdminOverview, action.payload?.params || {});
    yield put(fetchSuperAdminOverviewSucceeded(dataOf(response)));
  } catch (error) {
    yield put(fetchSuperAdminOverviewFailed(error?.message || 'Failed to load the overview'));
  }
}

export function* fetchCollegeAdminOverviewWorker() {
  try {
    const response = yield call(getCollegeAdminOverview);
    yield put(fetchCollegeAdminOverviewSucceeded(dataOf(response)));
  } catch (error) {
    yield put(fetchCollegeAdminOverviewFailed(error?.message || 'Failed to load the overview'));
  }
}

export function* watchDashboardOverview() {
  yield takeLatest(fetchSuperAdminOverviewRequested.type, fetchSuperAdminOverviewWorker);
  yield takeLatest(fetchCollegeAdminOverviewRequested.type, fetchCollegeAdminOverviewWorker);
}

export default watchDashboardOverview;

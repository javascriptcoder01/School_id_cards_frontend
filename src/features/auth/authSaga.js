import { takeLatest, call, put } from 'redux-saga/effects';
import {
  loginRequested,
  loginSuccess,
  loginFailure,
  logout,
} from './authSlice.js';
import { loginApi } from './authApi.js';
import {
  setAuthTokens,
  setUserData,
  clearAuthStorage,
} from '../../utils/storage.js';

export function* loginWorker(action) {
  try {
    const response = yield call(loginApi, action.payload);
    const authData = (response && response.data) ? response.data : response;

    if (!authData || !authData.accessToken || !authData.user) {
      throw new Error('Invalid response structure received from authentication server.');
    }

    const { user, accessToken, refreshToken } = authData;

    // Persist session to centralized storage
    yield call(setAuthTokens, accessToken, refreshToken);
    yield call(setUserData, user);

    yield put(
      loginSuccess({
        user,
        accessToken,
        refreshToken: refreshToken || null,
      })
    );
  } catch (error) {
    const errorMessage = error?.message || 'Login failed. Please try again.';
    yield put(loginFailure(errorMessage));
  }
}

export function* logoutWorker() {
  try {
    yield call(clearAuthStorage);
  } catch {
    // Fail safely
  }
}

export function* watchAuth() {
  yield takeLatest(loginRequested.type, loginWorker);
  yield takeLatest(logout.type, logoutWorker);
}

export default watchAuth;


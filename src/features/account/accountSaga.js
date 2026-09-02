import { takeLatest, call, put, select } from 'redux-saga/effects';
import {
  fetchAccountRequested,
  fetchAccountSucceeded,
  fetchAccountFailed,
} from './accountSlice.js';
import { getCurrentAccount } from './accountApi.js';
import { selectCurrentUser } from '../auth/authSelectors.js';

export function* fetchAccountWorker() {
  try {
    let profile = yield call(getCurrentAccount);
    if (!profile) {
      const authUser = yield select(selectCurrentUser);
      if (authUser) {
        profile = {
          id: authUser.id,
          name: authUser.name || 'User',
          email: authUser.email || 'N/A',
          role: authUser.role || 'USER',
          collegeId: authUser.collegeId || null,
          isActive: authUser.isActive !== false,
        };
      }
    }

    if (!profile) {
      throw new Error('User profile not available');
    }

    yield put(fetchAccountSucceeded(profile));
  } catch (error) {
    const message = error?.message || 'Failed to load account profile';
    yield put(fetchAccountFailed(message));
  }
}

export function* watchAccount() {
  yield takeLatest(fetchAccountRequested.type, fetchAccountWorker);
}

export default watchAccount;


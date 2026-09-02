import { takeLatest, call, put } from 'redux-saga/effects';
import {
  verifyRequested,
  verifySucceeded,
  verifyFailed,
} from './idCardVerificationSlice.js';
import { verifyIdCard } from './idCardVerificationApi.js';

export function* verifyIdCardWorker(action) {
  try {
    const token = typeof action.payload === 'object' ? action.payload?.token : action.payload;
    if (!token || typeof token !== 'string' || !token.trim()) {
      yield put(verifyFailed('ID card verification record not found or invalid.'));
      return;
    }

    const response = yield call(verifyIdCard, token);
    const data = response?.data?.data || response?.data || response;

    if (!data || !data.verified) {
      yield put(verifyFailed('ID card verification record not found or invalid.'));
      return;
    }

    yield put(
      verifySucceeded({
        verified: data.verified,
        student: data.student,
        college: data.college,
        generatedAt: data.generatedAt,
      })
    );
  } catch {
    // Return generic safe failure message without leaking raw stack trace, tokens, or Mongo IDs
    yield put(verifyFailed('ID card verification record not found or invalid.'));
  }
}

export function* watchIdCardVerification() {
  yield takeLatest(verifyRequested.type, verifyIdCardWorker);
}

export default watchIdCardVerification;


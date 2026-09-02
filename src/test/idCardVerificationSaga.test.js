import { describe, it, expect } from 'vitest';
import { call, put, takeLatest } from 'redux-saga/effects';
import {
  verifyRequested,
  verifySucceeded,
  verifyFailed,
} from '../features/idCardVerification/idCardVerificationSlice.js';
import {
  verifyIdCardWorker,
  watchIdCardVerification,
} from '../features/idCardVerification/idCardVerificationSaga.js';
import { verifyIdCard } from '../features/idCardVerification/idCardVerificationApi.js';

describe('ID CARD VERIFICATION REDUX SAGA', () => {
  it('1. verifyIdCardWorker successfully calls API and dispatches success', () => {
    const generator = verifyIdCardWorker(verifyRequested('token-123'));
    expect(generator.next().value).toEqual(call(verifyIdCard, 'token-123'));

    const mockResponse = {
      data: {
        success: true,
        data: {
          verified: true,
          student: { studentId: 'STU-001', name: 'Aarav Patel' },
          college: { name: 'Stanford University' },
          generatedAt: '2026-08-31T18:45:00.000Z',
        },
      },
    };

    expect(generator.next(mockResponse).value).toEqual(
      put(
        verifySucceeded({
          verified: true,
          student: { studentId: 'STU-001', name: 'Aarav Patel' },
          college: { name: 'Stanford University' },
          generatedAt: '2026-08-31T18:45:00.000Z',
        })
      )
    );
    expect(generator.next().done).toBe(true);
  });

  it('2. verifyIdCardWorker handles missing or invalid token', () => {
    const generator = verifyIdCardWorker(verifyRequested(''));
    expect(generator.next().value).toEqual(
      put(verifyFailed('ID card verification record not found or invalid.'))
    );
    expect(generator.next().done).toBe(true);
  });

  it('3. verifyIdCardWorker handles API errors and dispatches generic failure message', () => {
    const generator = verifyIdCardWorker(verifyRequested('invalid-token'));
    generator.next(); // call API
    expect(generator.throw(new Error('Network or Server Error')).value).toEqual(
      put(verifyFailed('ID card verification record not found or invalid.'))
    );
    expect(generator.next().done).toBe(true);
  });

  it('4. watchIdCardVerification registers takeLatest watcher', () => {
    const generator = watchIdCardVerification();
    expect(generator.next().value).toEqual(
      takeLatest(verifyRequested.type, verifyIdCardWorker)
    );
    expect(generator.next().done).toBe(true);
  });
});


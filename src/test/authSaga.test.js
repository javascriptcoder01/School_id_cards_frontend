import { describe, it, expect, vi } from 'vitest';
import { call, put, takeLatest } from 'redux-saga/effects';
import {
  loginRequested,
  loginSuccess,
  loginFailure,
  logout,
} from '../features/auth/authSlice.js';
import { loginWorker, logoutWorker, watchAuth } from '../features/auth/authSaga.js';
import { loginApi } from '../features/auth/authApi.js';
import {
  setAuthTokens,
  setUserData,
  clearAuthStorage,
} from '../utils/storage.js';

describe('GROUP D — REDUX SAGA ASYNC WORKFLOWS', () => {
  it('1. loginWorker handles successful API response by saving session and dispatching loginSuccess', () => {
    const action = loginRequested({ email: 'admin@school.edu', password: 'password123' });
    const generator = loginWorker(action);

    // 1. Calls loginApi
    expect(generator.next().value).toEqual(call(loginApi, action.payload));

    const mockResponse = {
      data: {
        user: { id: 'u-1', name: 'Admin', role: 'SUPER_ADMIN', collegeId: null, isActive: true },
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
      },
    };

    // 2. Calls setAuthTokens
    expect(generator.next(mockResponse).value).toEqual(
      call(setAuthTokens, 'access-token-123', 'refresh-token-456')
    );

    // 3. Calls setUserData
    expect(generator.next().value).toEqual(
      call(setUserData, mockResponse.data.user)
    );

    // 4. Dispatches loginSuccess
    expect(generator.next().value).toEqual(
      put(
        loginSuccess({
          user: mockResponse.data.user,
          accessToken: 'access-token-123',
          refreshToken: 'refresh-token-456',
        })
      )
    );

    // Generator finishes
    expect(generator.next().done).toBe(true);
  });

  it('2. loginWorker handles API failure by dispatching loginFailure action', () => {
    const action = loginRequested({ email: 'invalid@school.edu', password: 'wrong' });
    const generator = loginWorker(action);

    expect(generator.next().value).toEqual(call(loginApi, action.payload));

    const apiError = new Error('Invalid email or password');
    expect(generator.throw(apiError).value).toEqual(
      put(loginFailure('Invalid email or password'))
    );

    expect(generator.next().done).toBe(true);
  });

  it('3. loginWorker rejects malformed server response without access token', () => {
    const action = loginRequested({ email: 'admin@school.edu', password: 'pass' });
    const generator = loginWorker(action);

    expect(generator.next().value).toEqual(call(loginApi, action.payload));

    const badResponse = { data: { message: 'ok' } }; // missing accessToken and user
    expect(generator.next(badResponse).value).toEqual(
      put(loginFailure('Invalid response structure received from authentication server.'))
    );

    expect(generator.next().done).toBe(true);
  });

  it('4. logoutWorker calls clearAuthStorage', () => {
    const generator = logoutWorker();
    expect(generator.next().value).toEqual(call(clearAuthStorage));
    expect(generator.next().done).toBe(true);
  });

  it('5. watchAuth configures takeLatest for loginRequested and logout', () => {
    const generator = watchAuth();
    expect(generator.next().value).toEqual(
      takeLatest(loginRequested.type, loginWorker)
    );
    expect(generator.next().value).toEqual(
      takeLatest(logout.type, logoutWorker)
    );
    expect(generator.next().done).toBe(true);
  });
});


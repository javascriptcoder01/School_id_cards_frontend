import { describe, it, expect } from 'vitest';
import authReducer, {
  loginRequested,
  loginSuccess,
  loginFailure,
  logout,
  restoreSession,
  authInitialized,
  clearAuthError,
} from '../features/auth/authSlice.js';

describe('GROUP C — AUTH STATE (REDUX SLICE)', () => {
  const initialState = {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    initialized: false,
  };

  it('1. Initial auth state matches specification', () => {
    expect(authReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('2. loginRequested sets isLoading to true and clears error', () => {
    const stateWithError = { ...initialState, error: 'Previous error' };
    const nextState = authReducer(stateWithError, loginRequested({ email: 'a@b.com', password: '123' }));
    expect(nextState.isLoading).toBe(true);
    expect(nextState.error).toBeNull();
    expect(nextState.isAuthenticated).toBe(false);
  });

  it('3. loginSuccess sets user, tokens, isAuthenticated and resets isLoading/error', () => {
    const loadingState = { ...initialState, isLoading: true };
    const payload = {
      user: {
        id: 'user-1',
        name: 'Admin',
        email: 'admin@school.edu',
        role: 'SUPER_ADMIN',
        collegeId: null,
        isActive: true,
      },
      accessToken: 'access-jwt-123',
      refreshToken: 'refresh-jwt-456',
    };

    const nextState = authReducer(loadingState, loginSuccess(payload));
    expect(nextState.isLoading).toBe(false);
    expect(nextState.isAuthenticated).toBe(true);
    expect(nextState.user).toEqual(payload.user);
    expect(nextState.token).toBe('access-jwt-123');
    expect(nextState.refreshToken).toBe('refresh-jwt-456');
    expect(nextState.error).toBeNull();
  });

  it('4. loginFailure sets error and resets loading and auth flags', () => {
    const loadingState = { ...initialState, isLoading: true };
    const nextState = authReducer(loadingState, loginFailure('Invalid email or password'));
    expect(nextState.isLoading).toBe(false);
    expect(nextState.isAuthenticated).toBe(false);
    expect(nextState.user).toBeNull();
    expect(nextState.token).toBeNull();
    expect(nextState.error).toBe('Invalid email or password');
  });

  it('5. logout resets all auth state back to unauthenticated', () => {
    const authedState = {
      user: { id: 'user-1', role: 'OPERATOR' },
      token: 'jwt-123',
      refreshToken: 'jwt-456',
      isAuthenticated: true,
      isLoading: false,
      error: null,
      initialized: true,
    };

    const nextState = authReducer(authedState, logout());
    expect(nextState.user).toBeNull();
    expect(nextState.token).toBeNull();
    expect(nextState.refreshToken).toBeNull();
    expect(nextState.isAuthenticated).toBe(false);
    expect(nextState.error).toBeNull();
    expect(nextState.initialized).toBe(true); // retains initialization
  });

  it('6. restoreSession restores user and tokens without triggering loading', () => {
    const sessionData = {
      user: { id: 'u1', name: 'Restored User', role: 'COLLEGE_ADMIN', collegeId: 'c1' },
      accessToken: 'restored-token',
      refreshToken: 'restored-refresh',
    };

    const nextState = authReducer(initialState, restoreSession(sessionData));
    expect(nextState.isAuthenticated).toBe(true);
    expect(nextState.user.name).toBe('Restored User');
    expect(nextState.token).toBe('restored-token');
    expect(nextState.error).toBeNull();
    expect(nextState.isLoading).toBe(false);
  });

  it('7. authInitialized sets initialized flag to true', () => {
    const nextState = authReducer(initialState, authInitialized());
    expect(nextState.initialized).toBe(true);
  });

  it('8. clearAuthError resets error to null', () => {
    const errorState = { ...initialState, error: 'Some error' };
    const nextState = authReducer(errorState, clearAuthError());
    expect(nextState.error).toBeNull();
  });
});


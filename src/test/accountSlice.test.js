import { describe, it, expect } from 'vitest';
import accountReducer, {
  fetchAccountRequested,
  fetchAccountSucceeded,
  fetchAccountFailed,
  clearAccountError,
  resetAccountState,
} from '../features/account/accountSlice.js';
import { logout } from '../features/auth/authSlice.js';

describe('ACCOUNT REDUX SLICE', () => {
  const initialState = {
    profile: null,
    loading: false,
    error: null,
    initialized: false,
  };

  it('1. Returns initial state on @@INIT', () => {
    expect(accountReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('2. Handles fetchAccountRequested', () => {
    const state = accountReducer(initialState, fetchAccountRequested());
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('3. Handles fetchAccountSucceeded with whitelisted safe fields', () => {
    const rawData = {
      id: 'u1',
      name: 'Super Admin',
      email: 'admin@school.edu',
      role: 'SUPER_ADMIN',
      collegeId: null,
      isActive: true,
      passwordHash: 'secret_hash_should_not_be_saved',
      __v: 0,
      token: 'jwt_token',
    };

    const state = accountReducer(
      { ...initialState, loading: true },
      fetchAccountSucceeded(rawData)
    );

    expect(state.loading).toBe(false);
    expect(state.initialized).toBe(true);
    expect(state.profile).toEqual({
      id: 'u1',
      name: 'Super Admin',
      email: 'admin@school.edu',
      role: 'SUPER_ADMIN',
      collegeId: null,
      isActive: true,
    });
    expect(state.profile).not.toHaveProperty('passwordHash');
    expect(state.profile).not.toHaveProperty('__v');
    expect(state.profile).not.toHaveProperty('token');
  });

  it('4. Handles fetchAccountFailed', () => {
    const state = accountReducer(
      { ...initialState, loading: true },
      fetchAccountFailed('Session expired')
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Session expired');
  });

  it('5. Handles clearAccountError and resetAccountState', () => {
    const errorState = { ...initialState, error: 'Some error' };
    expect(accountReducer(errorState, clearAccountError()).error).toBeNull();

    const dirtyState = {
      profile: { id: 'u1' },
      loading: false,
      error: null,
      initialized: true,
    };
    expect(accountReducer(dirtyState, resetAccountState())).toEqual(initialState);
  });

  it('6. Automatically resets account state on auth/logout', () => {
    const populatedState = {
      profile: { id: 'u1', name: 'User' },
      loading: false,
      error: null,
      initialized: true,
    };
    expect(accountReducer(populatedState, logout())).toEqual(initialState);
  });
});


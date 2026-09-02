import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAuthToken,
  getRefreshToken,
  setAuthTokens,
  clearAuthTokens,
  getUserData,
  setUserData,
  clearUserData,
  clearAuthStorage,
} from '../utils/storage.js';
import { STORAGE_KEYS } from '../constants/storage.js';

describe('GROUP E — SESSION STORAGE ABSTRACTION', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. setAuthTokens persists tokens and getAuthToken / getRefreshToken retrieves them', () => {
    setAuthTokens('jwt-access-123', 'jwt-refresh-456');
    expect(getAuthToken()).toBe('jwt-access-123');
    expect(getRefreshToken()).toBe('jwt-refresh-456');
  });

  it('2. clearAuthTokens removes only authentication tokens', () => {
    setAuthTokens('jwt-access-123', 'jwt-refresh-456');
    setUserData({ name: 'Admin' });

    clearAuthTokens();
    expect(getAuthToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(getUserData()).toEqual({ name: 'Admin' });
  });

  it('3. setUserData and getUserData correctly serializes and deserializes JSON', () => {
    const userPayload = {
      id: 'usr-99',
      name: 'Jane Doe',
      email: 'jane@college.edu',
      role: 'COLLEGE_ADMIN',
      collegeId: 'col-1',
    };

    setUserData(userPayload);
    expect(getUserData()).toEqual(userPayload);
  });

  it('4. getUserData fails safely on corrupted JSON without crashing', () => {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, '{bad-json-syntax');
    const result = getUserData();
    expect(result).toBeNull();
    // It should have cleaned up the corrupted value
    expect(localStorage.getItem(STORAGE_KEYS.USER_DATA)).toBeNull();
  });

  it('5. clearAuthStorage removes both tokens and user data completely', () => {
    setAuthTokens('access-1', 'refresh-1');
    setUserData({ id: 'u1', name: 'User' });

    clearAuthStorage();
    expect(getAuthToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(getUserData()).toBeNull();
  });
});


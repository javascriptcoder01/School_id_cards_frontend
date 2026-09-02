import { describe, it, expect } from 'vitest';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import {
  fetchAccountRequested,
  fetchAccountSucceeded,
  fetchAccountFailed,
} from '../features/account/accountSlice.js';
import {
  fetchAccountWorker,
  watchAccount,
} from '../features/account/accountSaga.js';
import { getCurrentAccount } from '../features/account/accountApi.js';
import { selectCurrentUser } from '../features/auth/authSelectors.js';

describe('ACCOUNT REDUX SAGA', () => {
  it('1. fetchAccountWorker retrieves account from API and dispatches success', () => {
    const generator = fetchAccountWorker();
    expect(generator.next().value).toEqual(call(getCurrentAccount));

    const mockProfile = {
      id: 'u1',
      name: 'Super Admin',
      email: 'admin@school.edu',
      role: 'SUPER_ADMIN',
      collegeId: null,
      isActive: true,
    };

    expect(generator.next(mockProfile).value).toEqual(
      put(fetchAccountSucceeded(mockProfile))
    );
    expect(generator.next().done).toBe(true);
  });

  it('2. fetchAccountWorker falls back to auth state if API returns null', () => {
    const generator = fetchAccountWorker();
    expect(generator.next().value).toEqual(call(getCurrentAccount));

    // When getCurrentAccount returns null, it selects authUser
    expect(generator.next(null).value).toEqual(select(selectCurrentUser));

    const authUser = {
      id: 'u2',
      name: 'Fallback User',
      email: 'fallback@school.edu',
      role: 'OPERATOR',
      collegeId: 'c1',
      isActive: true,
    };

    expect(generator.next(authUser).value).toEqual(
      put(
        fetchAccountSucceeded({
          id: 'u2',
          name: 'Fallback User',
          email: 'fallback@school.edu',
          role: 'OPERATOR',
          collegeId: 'c1',
          isActive: true,
        })
      )
    );
    expect(generator.next().done).toBe(true);
  });

  it('3. fetchAccountWorker handles failure properly', () => {
    const generator = fetchAccountWorker();
    generator.next();
    expect(generator.throw(new Error('Session not found')).value).toEqual(
      put(fetchAccountFailed('Session not found'))
    );
    expect(generator.next().done).toBe(true);
  });

  it('4. watchAccount registers takeLatest watcher', () => {
    const generator = watchAccount();
    expect(generator.next().value).toEqual(
      takeLatest(fetchAccountRequested.type, fetchAccountWorker)
    );
    expect(generator.next().done).toBe(true);
  });
});


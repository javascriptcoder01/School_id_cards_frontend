import { describe, it, expect, vi } from 'vitest';
import { call, put, takeLatest } from 'redux-saga/effects';
import {
  fetchUsersRequested,
  fetchUsersSucceeded,
  fetchUsersFailed,
  fetchUserRequested,
  fetchUserSucceeded,
  fetchUserFailed,
  createUserRequested,
  createUserSucceeded,
  createUserFailed,
  updateUserRequested,
  updateUserSucceeded,
  updateUserFailed,
  updateUserStatusRequested,
  updateUserStatusSucceeded,
  updateUserStatusFailed,
} from '../features/users/userSlice.js';
import {
  fetchUsersWorker,
  fetchUserWorker,
  createUserWorker,
  updateUserWorker,
  updateUserStatusWorker,
  watchUsers,
} from '../features/users/userSaga.js';
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  updateUserStatus,
} from '../features/users/userApi.js';

describe('GROUP D — USER REDUX SAGA WORKFLOWS', () => {
  it('1. fetchUsersWorker calls API and dispatches fetchUsersSucceeded', () => {
    const params = { page: 1, limit: 10, search: 'Alice' };
    const generator = fetchUsersWorker(fetchUsersRequested(params));

    expect(generator.next().value).toEqual(call(listUsers, params));

    const mockResponse = {
      data: {
        users: [{ id: 'u1', name: 'Alice' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
    };

    expect(generator.next(mockResponse).value).toEqual(
      put(
        fetchUsersSucceeded({
          users: mockResponse.data.users,
          pagination: mockResponse.data.pagination,
        })
      )
    );
    expect(generator.next().done).toBe(true);
  });

  it('2. fetchUsersWorker handles failure by dispatching fetchUsersFailed', () => {
    const generator = fetchUsersWorker(fetchUsersRequested());
    expect(generator.next().value).toEqual(call(listUsers, {}));

    const error = new Error('Network error');
    expect(generator.throw(error).value).toEqual(
      put(fetchUsersFailed('Network error'))
    );
    expect(generator.next().done).toBe(true);
  });

  it('3. fetchUserWorker calls getUser API and dispatches success action', () => {
    const generator = fetchUserWorker(fetchUserRequested('u123'));
    expect(generator.next().value).toEqual(call(getUser, 'u123'));

    const mockResponse = {
      data: { user: { id: 'u123', name: 'Bob', role: 'OPERATOR' } },
    };
    expect(generator.next(mockResponse).value).toEqual(
      put(fetchUserSucceeded(mockResponse.data.user))
    );
    expect(generator.next().done).toBe(true);
  });

  it('4. createUserWorker invokes API, dispatches success, and calls onSuccess callback', () => {
    const onSuccess = vi.fn();
    const userData = { name: 'Charlie', email: 'charlie@col.edu', role: 'OPERATOR' };
    const generator = createUserWorker(createUserRequested({ data: userData, onSuccess }));

    expect(generator.next().value).toEqual(call(createUser, userData));

    const mockResponse = {
      data: { user: { id: 'u3', name: 'Charlie', role: 'OPERATOR' } },
    };
    expect(generator.next(mockResponse).value).toEqual(
      put(createUserSucceeded(mockResponse.data.user))
    );

    expect(generator.next().done).toBe(true);
    expect(onSuccess).toHaveBeenCalledWith(mockResponse.data.user);
  });

  it('5. updateUserWorker invokes API and dispatches updateUserSucceeded', () => {
    const updatePayload = { id: 'u1', data: { name: 'Updated Name' } };
    const generator = updateUserWorker(updateUserRequested(updatePayload));

    expect(generator.next().value).toEqual(call(updateUser, 'u1', { name: 'Updated Name' }));

    const mockResponse = {
      data: { user: { id: 'u1', name: 'Updated Name' } },
    };
    expect(generator.next(mockResponse).value).toEqual(
      put(updateUserSucceeded(mockResponse.data.user))
    );
    expect(generator.next().done).toBe(true);
  });

  it('6. updateUserStatusWorker invokes API and dispatches updateUserStatusSucceeded', () => {
    const statusPayload = { id: 'u1', isActive: false };
    const generator = updateUserStatusWorker(updateUserStatusRequested(statusPayload));

    expect(generator.next().value).toEqual(call(updateUserStatus, 'u1', false));

    const mockResponse = {
      data: { user: { id: 'u1', isActive: false } },
    };
    expect(generator.next(mockResponse).value).toEqual(
      put(updateUserStatusSucceeded(mockResponse.data.user))
    );
    expect(generator.next().done).toBe(true);
  });

  it('7. watchUsers sets up takeLatest watchers for all user management actions', () => {
    const generator = watchUsers();
    expect(generator.next().value).toEqual(takeLatest(fetchUsersRequested.type, fetchUsersWorker));
    expect(generator.next().value).toEqual(takeLatest(fetchUserRequested.type, fetchUserWorker));
    expect(generator.next().value).toEqual(takeLatest(createUserRequested.type, createUserWorker));
    expect(generator.next().value).toEqual(takeLatest(updateUserRequested.type, updateUserWorker));
    expect(generator.next().value).toEqual(takeLatest(updateUserStatusRequested.type, updateUserStatusWorker));
    expect(generator.next().done).toBe(true);
  });
});


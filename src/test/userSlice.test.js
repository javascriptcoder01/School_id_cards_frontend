import { describe, it, expect } from 'vitest';
import userReducer, {
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
  setFilters,
  setPage,
  clearSelectedUser,
  clearUserErrors,
  resetUserOperationState,
} from '../features/users/userSlice.js';

describe('GROUP B — USER REDUX SLICE', () => {
  const initialState = {
    users: [],
    selectedUser: null,
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    filters: { search: '', role: '', isActive: '', collegeId: '' },
    list: { isLoading: false, error: null },
    detail: { isLoading: false, error: null },
    create: { isLoading: false, error: null, success: false },
    update: { isLoading: false, error: null, success: false },
    statusUpdate: { isLoading: false, error: null, success: false },
  };

  it('1. Initial state matches expected structure', () => {
    expect(userReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('2. fetchUsersRequested sets list.isLoading to true and clears list.error', () => {
    const stateWithError = {
      ...initialState,
      list: { isLoading: false, error: 'Previous error' },
    };
    const nextState = userReducer(stateWithError, fetchUsersRequested());
    expect(nextState.list.isLoading).toBe(true);
    expect(nextState.list.error).toBeNull();
  });

  it('3. fetchUsersSucceeded sets users array and pagination data', () => {
    const loadingState = {
      ...initialState,
      list: { isLoading: true, error: null },
    };
    const payload = {
      users: [{ id: 'u1', name: 'Alice Admin', email: 'alice@col.edu', role: 'COLLEGE_ADMIN' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };
    const nextState = userReducer(loadingState, fetchUsersSucceeded(payload));
    expect(nextState.list.isLoading).toBe(false);
    expect(nextState.users).toHaveLength(1);
    expect(nextState.users[0].name).toBe('Alice Admin');
    expect(nextState.pagination.total).toBe(1);
  });

  it('4. fetchUsersFailed sets list.error and stops loading', () => {
    const loadingState = {
      ...initialState,
      list: { isLoading: true, error: null },
    };
    const nextState = userReducer(loadingState, fetchUsersFailed('Server error'));
    expect(nextState.list.isLoading).toBe(false);
    expect(nextState.list.error).toBe('Server error');
  });

  it('5. fetchUserRequested, fetchUserSucceeded, and fetchUserFailed manage detail state', () => {
    const reqState = userReducer(initialState, fetchUserRequested());
    expect(reqState.detail.isLoading).toBe(true);

    const user = { id: 'u2', name: 'Bob Operator', role: 'OPERATOR' };
    const succState = userReducer(reqState, fetchUserSucceeded(user));
    expect(succState.detail.isLoading).toBe(false);
    expect(succState.selectedUser).toEqual(user);
    expect(succState.detail.error).toBeNull();

    const failState = userReducer(reqState, fetchUserFailed('User not found'));
    expect(failState.detail.isLoading).toBe(false);
    expect(failState.detail.error).toBe('User not found');
  });

  it('6. createUser actions manage creation lifecycle and prepend new user', () => {
    const reqState = userReducer(initialState, createUserRequested());
    expect(reqState.create.isLoading).toBe(true);
    expect(reqState.create.success).toBe(false);

    const newUser = { id: 'u3', name: 'Charlie', role: 'OPERATOR' };
    const succState = userReducer(reqState, createUserSucceeded(newUser));
    expect(succState.create.isLoading).toBe(false);
    expect(succState.create.success).toBe(true);
    expect(succState.users).toContainEqual(newUser);

    const failState = userReducer(reqState, createUserFailed('Email conflict'));
    expect(failState.create.isLoading).toBe(false);
    expect(failState.create.error).toBe('Email conflict');
    expect(failState.create.success).toBe(false);
  });

  it('7. updateUserSucceeded updates selectedUser and user in list', () => {
    const state = {
      ...initialState,
      users: [{ id: 'u1', name: 'Old Name', role: 'OPERATOR' }],
      selectedUser: { id: 'u1', name: 'Old Name', role: 'OPERATOR' },
      update: { isLoading: true, error: null, success: false },
    };
    const updated = { id: 'u1', name: 'New Name', role: 'OPERATOR' };
    const nextState = userReducer(state, updateUserSucceeded(updated));
    expect(nextState.update.isLoading).toBe(false);
    expect(nextState.update.success).toBe(true);
    expect(nextState.selectedUser.name).toBe('New Name');
    expect(nextState.users[0].name).toBe('New Name');
  });

  it('8. updateUserStatusSucceeded updates status in selectedUser and users array', () => {
    const state = {
      ...initialState,
      users: [{ id: 'u1', name: 'User 1', isActive: true }],
      selectedUser: { id: 'u1', name: 'User 1', isActive: true },
      statusUpdate: { isLoading: true, error: null, success: false },
    };
    const updatedStatus = { id: 'u1', isActive: false };
    const nextState = userReducer(state, updateUserStatusSucceeded(updatedStatus));
    expect(nextState.statusUpdate.isLoading).toBe(false);
    expect(nextState.statusUpdate.success).toBe(true);
    expect(nextState.selectedUser.isActive).toBe(false);
    expect(nextState.users[0].isActive).toBe(false);
  });

  it('9. setFilters updates filters and resets page to 1', () => {
    const stateWithPage = {
      ...initialState,
      pagination: { ...initialState.pagination, page: 5 },
    };
    const nextState = userReducer(stateWithPage, setFilters({ search: 'Jane', role: 'OPERATOR' }));
    expect(nextState.filters.search).toBe('Jane');
    expect(nextState.filters.role).toBe('OPERATOR');
    expect(nextState.pagination.page).toBe(1);
  });

  it('10. clearUserErrors and resetUserOperationState clear errors and operation flags', () => {
    const stateWithErrors = {
      ...initialState,
      list: { isLoading: false, error: 'err1' },
      detail: { isLoading: false, error: 'err2' },
      create: { isLoading: false, error: 'err3', success: true },
      update: { isLoading: false, error: 'err4', success: true },
      statusUpdate: { isLoading: false, error: 'err5', success: true },
    };

    const clearedErrors = userReducer(stateWithErrors, clearUserErrors());
    expect(clearedErrors.list.error).toBeNull();
    expect(clearedErrors.detail.error).toBeNull();
    expect(clearedErrors.create.error).toBeNull();

    const resetOps = userReducer(stateWithErrors, resetUserOperationState());
    expect(resetOps.create.success).toBe(false);
    expect(resetOps.update.success).toBe(false);
    expect(resetOps.statusUpdate.success).toBe(false);
  });
});


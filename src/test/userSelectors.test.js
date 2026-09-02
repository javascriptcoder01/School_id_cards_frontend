import { describe, it, expect } from 'vitest';
import {
  selectUsersState,
  selectUsersList,
  selectSelectedUser,
  selectUserPagination,
  selectUserFilters,
  selectUserListLoading,
  selectUserListError,
  selectUserDetailLoading,
  selectUserDetailError,
  selectUserCreateLoading,
  selectUserCreateError,
  selectUserCreateSuccess,
  selectUserUpdateLoading,
  selectUserUpdateError,
  selectUserUpdateSuccess,
  selectUserStatusLoading,
  selectUserStatusError,
  selectUserStatusSuccess,
} from '../features/users/userSelectors.js';

describe('GROUP C — USER FEATURE SELECTORS', () => {
  const mockState = {
    users: {
      users: [{ id: 'u1', name: 'John Doe', email: 'john@col.edu', role: 'OPERATOR' }],
      selectedUser: { id: 'u1', name: 'John Doe', email: 'john@col.edu', role: 'OPERATOR' },
      pagination: { page: 1, limit: 10, total: 12, totalPages: 2 },
      filters: { search: 'John', role: 'OPERATOR', isActive: 'true', collegeId: '' },
      list: { isLoading: true, error: 'List err' },
      detail: { isLoading: false, error: null },
      create: { isLoading: true, error: 'Create err', success: false },
      update: { isLoading: false, error: null, success: true },
      statusUpdate: { isLoading: false, error: null, success: true },
    },
  };

  it('1. Selectors extract values correctly from populated state', () => {
    expect(selectUsersState(mockState)).toEqual(mockState.users);
    expect(selectUsersList(mockState)).toHaveLength(1);
    expect(selectSelectedUser(mockState)?.name).toBe('John Doe');
    expect(selectUserPagination(mockState).totalPages).toBe(2);
    expect(selectUserFilters(mockState).search).toBe('John');
    expect(selectUserListLoading(mockState)).toBe(true);
    expect(selectUserListError(mockState)).toBe('List err');
    expect(selectUserDetailLoading(mockState)).toBe(false);
    expect(selectUserDetailError(mockState)).toBeNull();
    expect(selectUserCreateLoading(mockState)).toBe(true);
    expect(selectUserCreateError(mockState)).toBe('Create err');
    expect(selectUserCreateSuccess(mockState)).toBe(false);
    expect(selectUserUpdateSuccess(mockState)).toBe(true);
    expect(selectUserStatusSuccess(mockState)).toBe(true);
  });

  it('2. Selectors handle undefined/null user slice gracefully', () => {
    const emptyState = {};
    expect(selectUsersList(emptyState)).toEqual([]);
    expect(selectSelectedUser(emptyState)).toBeNull();
    expect(selectUserPagination(emptyState)).toEqual({ page: 1, limit: 10, total: 0, totalPages: 0 });
    expect(selectUserFilters(emptyState)).toEqual({ search: '', role: '', isActive: '', collegeId: '' });
    expect(selectUserListLoading(emptyState)).toBe(false);
    expect(selectUserListError(emptyState)).toBeNull();
    expect(selectUserCreateSuccess(emptyState)).toBe(false);
  });
});


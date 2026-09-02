import { describe, it, expect } from 'vitest';
import {
  selectAccountState,
  selectAccountProfile,
  selectAccountLoading,
  selectAccountError,
  selectIsAccountInitialized,
} from '../features/account/accountSelectors.js';

describe('ACCOUNT SELECTORS', () => {
  const mockState = {
    account: {
      profile: {
        id: 'u10',
        name: 'Alex Johnson',
        email: 'alex@stanford.edu',
        role: 'COLLEGE_ADMIN',
        collegeId: 'c10',
        isActive: true,
      },
      loading: false,
      error: null,
      initialized: true,
    },
  };

  it('1. Selects account state correctly', () => {
    expect(selectAccountState(mockState)).toEqual(mockState.account);
    expect(selectAccountProfile(mockState)).toEqual(mockState.account.profile);
    expect(selectAccountLoading(mockState)).toBe(false);
    expect(selectAccountError(mockState)).toBeNull();
    expect(selectIsAccountInitialized(mockState)).toBe(true);
  });

  it('2. Returns safe fallback values on empty state', () => {
    expect(selectAccountProfile({})).toBeNull();
    expect(selectAccountLoading({})).toBe(false);
    expect(selectAccountError({})).toBeNull();
    expect(selectIsAccountInitialized({})).toBe(false);
  });
});


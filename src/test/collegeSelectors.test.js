import { describe, it, expect } from 'vitest';
import {
  selectCollegesState,
  selectCollegesList,
  selectSelectedCollege,
  selectCollegePagination,
  selectCollegeFilters,
  selectCollegeListLoading,
  selectCollegeDetailLoading,
  selectCollegeCreateLoading,
  selectCollegeUpdateLoading,
  selectCollegeStatusLoading,
  selectCollegeListError,
  selectCollegeDetailError,
  selectCollegeCreateError,
  selectCollegeUpdateError,
  selectCollegeStatusError,
} from '../features/colleges/collegeSelectors.js';

describe('GROUP C — COLLEGE FEATURE SELECTORS', () => {
  const mockState = {
    colleges: {
      colleges: [{ _id: '1', name: 'IIT Delhi', code: 'IITD' }],
      selectedCollege: { _id: '1', name: 'IIT Delhi', code: 'IITD' },
      pagination: { page: 2, limit: 10, total: 25, totalPages: 3 },
      filters: { search: 'IIT', isActive: 'true' },
      listLoading: true,
      detailLoading: false,
      createLoading: true,
      updateLoading: false,
      statusLoading: false,
      listError: 'Failed to load',
      detailError: null,
      createError: 'Name conflict',
      updateError: null,
      statusError: null,
    },
  };

  it('1. Selectors extract values correctly from populated state', () => {
    expect(selectCollegesState(mockState)).toEqual(mockState.colleges);
    expect(selectCollegesList(mockState)).toHaveLength(1);
    expect(selectSelectedCollege(mockState)?.code).toBe('IITD');
    expect(selectCollegePagination(mockState).totalPages).toBe(3);
    expect(selectCollegeFilters(mockState).search).toBe('IIT');
    expect(selectCollegeListLoading(mockState)).toBe(true);
    expect(selectCollegeDetailLoading(mockState)).toBe(false);
    expect(selectCollegeCreateLoading(mockState)).toBe(true);
    expect(selectCollegeListError(mockState)).toBe('Failed to load');
    expect(selectCollegeCreateError(mockState)).toBe('Name conflict');
    expect(selectCollegeDetailError(mockState)).toBeNull();
  });

  it('2. Selectors handle undefined/null colleges slice gracefully', () => {
    const emptyState = {};
    expect(selectCollegesList(emptyState)).toEqual([]);
    expect(selectSelectedCollege(emptyState)).toBeNull();
    expect(selectCollegePagination(emptyState)).toEqual({ page: 1, limit: 10, total: 0, totalPages: 0 });
    expect(selectCollegeFilters(emptyState)).toEqual({ search: '', isActive: '' });
    expect(selectCollegeListLoading(emptyState)).toBe(false);
    expect(selectCollegeListError(emptyState)).toBeNull();
  });
});


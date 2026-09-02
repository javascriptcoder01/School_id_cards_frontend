import { describe, it, expect } from 'vitest';
import {
  selectStudentsState,
  selectStudents,
  selectSelectedStudent,
  selectStudentPagination,
  selectStudentFilters,
  selectStudentsLoading,
  selectStudentDetailLoading,
  selectStudentCreateLoading,
  selectStudentUpdateLoading,
  selectStudentStatusLoading,
  selectStudentsError,
  selectStudentDetailError,
  selectStudentCreateError,
  selectStudentUpdateError,
  selectStudentStatusError,
} from '../features/students/studentSelectors.js';

describe('GROUP C — STUDENT FEATURE SELECTORS', () => {
  const mockState = {
    students: {
      students: [{ id: 's1', studentId: 'STU-001', name: 'Aarav Patel', className: '10A' }],
      selectedStudent: { id: 's1', studentId: 'STU-001', name: 'Aarav Patel', className: '10A' },
      pagination: { page: 1, limit: 10, total: 42, totalPages: 5 },
      filters: { search: 'Aarav' },
      loading: {
        list: true,
        detail: false,
        create: true,
        update: false,
        statusUpdate: false,
      },
      errors: {
        list: 'List error',
        detail: null,
        create: 'Create error',
        update: null,
        statusUpdate: null,
      },
    },
  };

  it('1. Selectors extract values correctly from populated state', () => {
    expect(selectStudentsState(mockState)).toEqual(mockState.students);
    expect(selectStudents(mockState)).toHaveLength(1);
    expect(selectSelectedStudent(mockState)?.name).toBe('Aarav Patel');
    expect(selectStudentPagination(mockState).totalPages).toBe(5);
    expect(selectStudentFilters(mockState).search).toBe('Aarav');
    expect(selectStudentsLoading(mockState)).toBe(true);
    expect(selectStudentDetailLoading(mockState)).toBe(false);
    expect(selectStudentCreateLoading(mockState)).toBe(true);
    expect(selectStudentsError(mockState)).toBe('List error');
    expect(selectStudentCreateError(mockState)).toBe('Create error');
    expect(selectStudentDetailError(mockState)).toBeNull();
  });

  it('2. Selectors handle undefined or empty state safely', () => {
    const emptyState = {};
    expect(selectStudents(emptyState)).toEqual([]);
    expect(selectSelectedStudent(emptyState)).toBeNull();
    expect(selectStudentPagination(emptyState)).toEqual({ page: 1, limit: 10, total: 0, totalPages: 0 });
    expect(selectStudentFilters(emptyState)).toEqual({ search: '' });
    expect(selectStudentsLoading(emptyState)).toBe(false);
    expect(selectStudentsError(emptyState)).toBeNull();
  });
});


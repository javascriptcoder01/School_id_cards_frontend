import { describe, it, expect } from 'vitest';
import studentReducer, {
  fetchStudentsRequested,
  fetchStudentsSucceeded,
  fetchStudentsFailed,
  fetchStudentRequested,
  fetchStudentSucceeded,
  fetchStudentFailed,
  createStudentRequested,
  createStudentSucceeded,
  createStudentFailed,
  updateStudentRequested,
  updateStudentSucceeded,
  updateStudentFailed,
  updateStudentStatusRequested,
  updateStudentStatusSucceeded,
  updateStudentStatusFailed,
  setStudentFilters,
  resetStudentFilters,
  setStudentPagination,
  clearSelectedStudent,
  clearStudentErrors,
} from '../features/students/studentSlice.js';

describe('GROUP B — STUDENT REDUX SLICE', () => {
  const initialState = {
    students: [],
    selectedStudent: null,
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    filters: { search: '' },
    loading: {
      list: false,
      detail: false,
      create: false,
      update: false,
      statusUpdate: false,
    },
    errors: {
      list: null,
      detail: null,
      create: null,
      update: null,
      statusUpdate: null,
    },
  };

  it('1. Initial state matches expected structure', () => {
    expect(studentReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('2. fetchStudentsRequested sets loading.list to true and clears errors.list', () => {
    const stateWithError = {
      ...initialState,
      errors: { ...initialState.errors, list: 'Old error' },
    };
    const nextState = studentReducer(stateWithError, fetchStudentsRequested());
    expect(nextState.loading.list).toBe(true);
    expect(nextState.errors.list).toBeNull();
  });

  it('3. fetchStudentsSucceeded sets students and handles totalItems pagination', () => {
    const loadingState = {
      ...initialState,
      loading: { ...initialState.loading, list: true },
    };
    const payload = {
      students: [{ id: 's1', name: 'Aarav Patel', studentId: 'STU-001', className: '10A' }],
      pagination: { page: 1, limit: 10, totalItems: 25, totalPages: 3 },
    };
    const nextState = studentReducer(loadingState, fetchStudentsSucceeded(payload));
    expect(nextState.loading.list).toBe(false);
    expect(nextState.students).toHaveLength(1);
    expect(nextState.students[0].name).toBe('Aarav Patel');
    expect(nextState.pagination.total).toBe(25);
    expect(nextState.pagination.totalPages).toBe(3);
  });

  it('4. fetchStudentsFailed sets errors.list and stops loading', () => {
    const loadingState = {
      ...initialState,
      loading: { ...initialState.loading, list: true },
    };
    const nextState = studentReducer(loadingState, fetchStudentsFailed('Server timeout'));
    expect(nextState.loading.list).toBe(false);
    expect(nextState.errors.list).toBe('Server timeout');
  });

  it('5. fetchStudentRequested, Succeeded, and Failed manage detail state', () => {
    const reqState = studentReducer(initialState, fetchStudentRequested());
    expect(reqState.loading.detail).toBe(true);

    const studentObj = { id: 's1', name: 'Aarav', studentId: 'STU-001' };
    const succState = studentReducer(reqState, fetchStudentSucceeded(studentObj));
    expect(succState.loading.detail).toBe(false);
    expect(succState.selectedStudent).toEqual(studentObj);
    expect(succState.errors.detail).toBeNull();

    const failState = studentReducer(reqState, fetchStudentFailed('Student not found'));
    expect(failState.loading.detail).toBe(false);
    expect(failState.errors.detail).toBe('Student not found');
  });

  it('6. createStudent actions manage creation lifecycle and prepend new student', () => {
    const reqState = studentReducer(initialState, createStudentRequested());
    expect(reqState.loading.create).toBe(true);

    const newStudent = { id: 's2', name: 'Diya Sharma', studentId: 'STU-002' };
    const succState = studentReducer(reqState, createStudentSucceeded(newStudent));
    expect(succState.loading.create).toBe(false);
    expect(succState.students).toContainEqual(newStudent);
    expect(succState.errors.create).toBeNull();

    const failState = studentReducer(reqState, createStudentFailed('Duplicate student ID'));
    expect(failState.loading.create).toBe(false);
    expect(failState.errors.create).toBe('Duplicate student ID');
  });

  it('7. updateStudentSucceeded updates selectedStudent and student in list', () => {
    const state = {
      ...initialState,
      students: [{ id: 's1', name: 'Old Name', studentId: 'STU-001' }],
      selectedStudent: { id: 's1', name: 'Old Name', studentId: 'STU-001' },
      loading: { ...initialState.loading, update: true },
    };
    const updated = { id: 's1', name: 'New Name', studentId: 'STU-001' };
    const nextState = studentReducer(state, updateStudentSucceeded(updated));
    expect(nextState.loading.update).toBe(false);
    expect(nextState.selectedStudent.name).toBe('New Name');
    expect(nextState.students[0].name).toBe('New Name');
  });

  it('8. updateStudentStatusSucceeded updates isActive in selectedStudent and student list', () => {
    const state = {
      ...initialState,
      students: [{ id: 's1', name: 'Student 1', isActive: true }],
      selectedStudent: { id: 's1', name: 'Student 1', isActive: true },
      loading: { ...initialState.loading, statusUpdate: true },
    };
    const updated = { id: 's1', isActive: false };
    const nextState = studentReducer(state, updateStudentStatusSucceeded(updated));
    expect(nextState.loading.statusUpdate).toBe(false);
    expect(nextState.selectedStudent.isActive).toBe(false);
    expect(nextState.students[0].isActive).toBe(false);
  });

  it('9. setStudentFilters updates search filter and resets page to 1', () => {
    const stateWithPage = {
      ...initialState,
      pagination: { ...initialState.pagination, page: 4 },
    };
    const nextState = studentReducer(stateWithPage, setStudentFilters({ search: 'Aarav' }));
    expect(nextState.filters.search).toBe('Aarav');
    expect(nextState.pagination.page).toBe(1);
  });

  it('10. resetStudentFilters, clearSelectedStudent, and clearStudentErrors work as expected', () => {
    const modifiedState = {
      ...initialState,
      selectedStudent: { id: 's1', name: 'Aarav' },
      filters: { search: 'Aarav' },
      pagination: { page: 3, limit: 10, total: 10, totalPages: 1 },
      errors: {
        list: 'err1',
        detail: 'err2',
        create: 'err3',
        update: 'err4',
        statusUpdate: 'err5',
      },
    };

    const resetFiltersState = studentReducer(modifiedState, resetStudentFilters());
    expect(resetFiltersState.filters.search).toBe('');
    expect(resetFiltersState.pagination.page).toBe(1);

    const clearedSel = studentReducer(modifiedState, clearSelectedStudent());
    expect(clearedSel.selectedStudent).toBeNull();

    const clearedErr = studentReducer(modifiedState, clearStudentErrors());
    expect(clearedErr.errors.list).toBeNull();
    expect(clearedErr.errors.detail).toBeNull();
    expect(clearedErr.errors.create).toBeNull();
    expect(clearedErr.errors.update).toBeNull();
    expect(clearedErr.errors.statusUpdate).toBeNull();
  });
});


import { describe, it, expect } from 'vitest';
import collegeReducer, {
  fetchCollegesRequested,
  fetchCollegesSucceeded,
  fetchCollegesFailed,
  fetchCollegeByIdRequested,
  fetchCollegeByIdSucceeded,
  fetchCollegeByIdFailed,
  fetchMyCollegeRequested,
  fetchMyCollegeSucceeded,
  fetchMyCollegeFailed,
  createCollegeRequested,
  createCollegeSucceeded,
  createCollegeFailed,
  updateCollegeRequested,
  updateCollegeSucceeded,
  updateCollegeFailed,
  updateCollegeStatusRequested,
  updateCollegeStatusSucceeded,
  updateCollegeStatusFailed,
  setFilters,
  setPage,
  clearCollegeErrors,
  clearSelectedCollege,
} from '../features/colleges/collegeSlice.js';

describe('GROUP C — COLLEGE REDUX SLICE', () => {
  const initialState = {
    colleges: [],
    selectedCollege: null,
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    filters: { search: '', isActive: '' },
    listLoading: false,
    detailLoading: false,
    createLoading: false,
    updateLoading: false,
    statusLoading: false,
    listError: null,
    detailError: null,
    createError: null,
    updateError: null,
    statusError: null,
  };

  it('1. Initial state matches expected structure', () => {
    expect(collegeReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('2. fetchCollegesRequested sets listLoading to true and clears listError', () => {
    const stateWithError = { ...initialState, listError: 'Previous error' };
    const nextState = collegeReducer(stateWithError, fetchCollegesRequested());
    expect(nextState.listLoading).toBe(true);
    expect(nextState.listError).toBeNull();
  });

  it('3. fetchCollegesSucceeded sets colleges list and pagination data', () => {
    const loadingState = { ...initialState, listLoading: true };
    const payload = {
      colleges: [{ _id: 'col-1', name: 'Harvard', code: 'HARV01', isActive: true }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };
    const nextState = collegeReducer(loadingState, fetchCollegesSucceeded(payload));
    expect(nextState.listLoading).toBe(false);
    expect(nextState.colleges).toHaveLength(1);
    expect(nextState.colleges[0].name).toBe('Harvard');
    expect(nextState.pagination.total).toBe(1);
  });

  it('4. fetchCollegesFailed sets listError and stops loading', () => {
    const loadingState = { ...initialState, listLoading: true };
    const nextState = collegeReducer(loadingState, fetchCollegesFailed('Server error'));
    expect(nextState.listLoading).toBe(false);
    expect(nextState.listError).toBe('Server error');
  });

  it('5. fetchCollegeByIdRequested and fetchCollegeByIdSucceeded manage detail state', () => {
    const reqState = collegeReducer(initialState, fetchCollegeByIdRequested());
    expect(reqState.detailLoading).toBe(true);

    const college = { _id: 'col-2', name: 'MIT', code: 'MIT01' };
    const succState = collegeReducer(reqState, fetchCollegeByIdSucceeded(college));
    expect(succState.detailLoading).toBe(false);
    expect(succState.selectedCollege).toEqual(college);
    expect(succState.detailError).toBeNull();
  });

  it('6. createCollegeRequested, createCollegeSucceeded, and createCollegeFailed', () => {
    const reqState = collegeReducer(initialState, createCollegeRequested());
    expect(reqState.createLoading).toBe(true);

    const newCollege = { _id: 'col-3', name: 'Stanford', code: 'STAN01' };
    const succState = collegeReducer(reqState, createCollegeSucceeded(newCollege));
    expect(succState.createLoading).toBe(false);
    expect(succState.colleges).toContainEqual(newCollege);

    const failState = collegeReducer(reqState, createCollegeFailed('Duplicate code'));
    expect(failState.createLoading).toBe(false);
    expect(failState.createError).toBe('Duplicate code');
  });

  it('7. updateCollegeSucceeded updates selectedCollege and item in colleges array', () => {
    const state = {
      ...initialState,
      colleges: [{ _id: 'col-1', name: 'Old Name', code: 'C1' }],
      selectedCollege: { _id: 'col-1', name: 'Old Name', code: 'C1' },
      updateLoading: true,
    };
    const updated = { _id: 'col-1', name: 'New Name', code: 'C1' };
    const nextState = collegeReducer(state, updateCollegeSucceeded(updated));
    expect(nextState.updateLoading).toBe(false);
    expect(nextState.selectedCollege.name).toBe('New Name');
    expect(nextState.colleges[0].name).toBe('New Name');
  });

  it('8. updateCollegeStatusSucceeded updates status in both selectedCollege and colleges array', () => {
    const state = {
      ...initialState,
      colleges: [{ _id: 'col-1', name: 'College 1', isActive: true }],
      selectedCollege: { _id: 'col-1', name: 'College 1', isActive: true },
      statusLoading: true,
    };
    const updatedStatus = { _id: 'col-1', isActive: false };
    const nextState = collegeReducer(state, updateCollegeStatusSucceeded(updatedStatus));
    expect(nextState.statusLoading).toBe(false);
    expect(nextState.selectedCollege.isActive).toBe(false);
    expect(nextState.colleges[0].isActive).toBe(false);
  });

  it('9. setFilters updates filters and resets page to 1', () => {
    const stateWithPage = {
      ...initialState,
      pagination: { ...initialState.pagination, page: 4 },
    };
    const nextState = collegeReducer(stateWithPage, setFilters({ search: 'Tech' }));
    expect(nextState.filters.search).toBe('Tech');
    expect(nextState.pagination.page).toBe(1);
  });

  it('10. clearCollegeErrors clears all error fields', () => {
    const stateWithErrors = {
      ...initialState,
      listError: 'err1',
      detailError: 'err2',
      createError: 'err3',
      updateError: 'err4',
      statusError: 'err5',
    };
    const nextState = collegeReducer(stateWithErrors, clearCollegeErrors());
    expect(nextState.listError).toBeNull();
    expect(nextState.detailError).toBeNull();
    expect(nextState.createError).toBeNull();
    expect(nextState.updateError).toBeNull();
    expect(nextState.statusError).toBeNull();
  });
});


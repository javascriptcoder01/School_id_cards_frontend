import { describe, it, expect } from 'vitest';
import studentImportReducer, {
  importStudentsRequested,
  importStudentsSucceeded,
  importStudentsFailed,
  resetImportState,
} from '../features/studentImport/studentImportSlice.js';

describe('STUDENT IMPORT REDUX SLICE', () => {
  const initialState = {
    file: null,
    status: 'IDLE',
    importResult: {
      totalRecords: 0,
      successCount: 0,
      failedCount: 0,
      errors: [],
    },
    loading: false,
    error: null,
  };

  it('1. Returns initial state on init', () => {
    expect(studentImportReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('2. importStudentsRequested sets status to UPLOADING and loading to true', () => {
    const mockFile = { name: 'students_batch.csv' };
    const nextState = studentImportReducer(initialState, importStudentsRequested(mockFile));
    expect(nextState.loading).toBe(true);
    expect(nextState.status).toBe('UPLOADING');
    expect(nextState.file).toBe('students_batch.csv');
    expect(nextState.error).toBeNull();
  });

  it('3. importStudentsSucceeded sets status to COMPLETED and stores importResult', () => {
    const uploadingState = {
      ...initialState,
      loading: true,
      status: 'UPLOADING',
      file: 'students.csv',
    };
    const resultPayload = {
      totalRecords: 50,
      successCount: 48,
      failedCount: 2,
      errors: [{ row: 12, field: 'email', message: 'Invalid email' }],
    };

    const nextState = studentImportReducer(uploadingState, importStudentsSucceeded(resultPayload));
    expect(nextState.loading).toBe(false);
    expect(nextState.status).toBe('COMPLETED');
    expect(nextState.importResult.totalRecords).toBe(50);
    expect(nextState.importResult.successCount).toBe(48);
    expect(nextState.importResult.failedCount).toBe(2);
    expect(nextState.importResult.errors).toHaveLength(1);
    expect(nextState.error).toBeNull();
  });

  it('4. importStudentsFailed sets status to FAILED and stores error message', () => {
    const uploadingState = {
      ...initialState,
      loading: true,
      status: 'UPLOADING',
    };

    const nextState = studentImportReducer(uploadingState, importStudentsFailed('File parsing failed'));
    expect(nextState.loading).toBe(false);
    expect(nextState.status).toBe('FAILED');
    expect(nextState.error).toBe('File parsing failed');
  });

  it('5. resetImportState resets state back to initial values', () => {
    const modifiedState = {
      file: 'data.xlsx',
      status: 'COMPLETED',
      importResult: { totalRecords: 10, successCount: 10, failedCount: 0, errors: [] },
      loading: false,
      error: null,
    };

    const nextState = studentImportReducer(modifiedState, resetImportState());
    expect(nextState).toEqual(initialState);
  });
});


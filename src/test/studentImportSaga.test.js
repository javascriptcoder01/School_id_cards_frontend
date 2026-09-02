import { describe, it, expect, vi } from 'vitest';
import { call, put, takeLatest } from 'redux-saga/effects';
import {
  importStudentsRequested,
  importStudentsSucceeded,
  importStudentsFailed,
} from '../features/studentImport/studentImportSlice.js';
import {
  importStudentsWorker,
  watchStudentImport,
} from '../features/studentImport/studentImportSaga.js';
import { uploadStudents } from '../features/studentImport/studentImportApi.js';

describe('STUDENT IMPORT REDUX SAGA', () => {
  it('1. importStudentsWorker calls uploadStudents and dispatches success', () => {
    const mockFile = new File(['a,b,c'], 'students.csv', { type: 'text/csv' });
    const onSuccess = vi.fn();
    const generator = importStudentsWorker(importStudentsRequested({ file: mockFile, onSuccess }));

    expect(generator.next().value).toEqual(call(uploadStudents, mockFile));

    const mockResponse = {
      data: {
        totalRecords: 20,
        successCount: 19,
        failedCount: 1,
        errors: [{ row: 2, field: 'name', message: 'Name too short' }],
      },
    };

    expect(generator.next(mockResponse).value).toEqual(
      put(
        importStudentsSucceeded({
          totalRecords: 20,
          successCount: 19,
          failedCount: 1,
          errors: [{ row: 2, field: 'name', message: 'Name too short' }],
        })
      )
    );

    expect(generator.next().done).toBe(true);
    expect(onSuccess).toHaveBeenCalledWith(mockResponse.data);
  });

  it('2. importStudentsWorker handles error and dispatches failure action', () => {
    const mockFile = new File(['a,b,c'], 'students.csv', { type: 'text/csv' });
    const generator = importStudentsWorker(importStudentsRequested(mockFile));

    expect(generator.next().value).toEqual(call(uploadStudents, mockFile));

    const error = new Error('Corrupted CSV headers');
    expect(generator.throw(error).value).toEqual(
      put(importStudentsFailed('Corrupted CSV headers'))
    );
    expect(generator.next().done).toBe(true);
  });

  it('3. watchStudentImport registers takeLatest for importStudentsRequested', () => {
    const generator = watchStudentImport();
    expect(generator.next().value).toEqual(
      takeLatest(importStudentsRequested.type, importStudentsWorker)
    );
    expect(generator.next().done).toBe(true);
  });
});


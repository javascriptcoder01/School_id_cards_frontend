import { describe, it, expect, vi } from 'vitest';
import { call, put, takeLatest } from 'redux-saga/effects';
import {
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
} from '../features/students/studentSlice.js';
import {
  fetchStudentsWorker,
  fetchStudentWorker,
  createStudentWorker,
  updateStudentWorker,
  updateStudentStatusWorker,
  watchStudents,
} from '../features/students/studentSaga.js';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  updateStudentStatus,
} from '../features/students/studentApi.js';

describe('GROUP D — STUDENT REDUX SAGA WORKFLOWS', () => {
  it('1. fetchStudentsWorker calls getStudents API and dispatches fetchStudentsSucceeded', () => {
    const params = { page: 1, limit: 10, search: 'Aarav' };
    const generator = fetchStudentsWorker(fetchStudentsRequested(params));

    expect(generator.next().value).toEqual(call(getStudents, params));

    const mockResponse = {
      data: {
        students: [{ id: 's1', name: 'Aarav Patel', studentId: 'STU-001' }],
        pagination: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
      },
    };

    expect(generator.next(mockResponse).value).toEqual(
      put(
        fetchStudentsSucceeded({
          students: mockResponse.data.students,
          pagination: mockResponse.data.pagination,
        })
      )
    );
    expect(generator.next().done).toBe(true);
  });

  it('2. fetchStudentsWorker dispatches fetchStudentsFailed on API error', () => {
    const generator = fetchStudentsWorker(fetchStudentsRequested({}));
    expect(generator.next().value).toEqual(call(getStudents, {}));

    const error = new Error('Connection refused');
    expect(generator.throw(error).value).toEqual(
      put(fetchStudentsFailed('Connection refused'))
    );
    expect(generator.next().done).toBe(true);
  });

  it('3. fetchStudentWorker calls getStudentById and dispatches fetchStudentSucceeded', () => {
    const generator = fetchStudentWorker(fetchStudentRequested('s100'));
    expect(generator.next().value).toEqual(call(getStudentById, 's100'));

    const mockResponse = {
      data: { student: { id: 's100', name: 'Kavya', studentId: 'STU-100' } },
    };
    expect(generator.next(mockResponse).value).toEqual(
      put(fetchStudentSucceeded(mockResponse.data.student))
    );
    expect(generator.next().done).toBe(true);
  });

  it('4. createStudentWorker calls createStudent, dispatches success, and runs onSuccess callback', () => {
    const onSuccess = vi.fn();
    const studentData = { name: 'Kunal', studentId: 'STU-200', className: '12th' };
    const generator = createStudentWorker(createStudentRequested({ data: studentData, onSuccess }));

    expect(generator.next().value).toEqual(call(createStudent, studentData));

    const mockResponse = {
      data: { student: { id: 's200', ...studentData } },
    };
    expect(generator.next(mockResponse).value).toEqual(
      put(createStudentSucceeded(mockResponse.data.student))
    );

    expect(generator.next().done).toBe(true);
    expect(onSuccess).toHaveBeenCalledWith(mockResponse.data.student);
  });

  it('5. updateStudentWorker calls updateStudent and dispatches updateStudentSucceeded', () => {
    const updatePayload = { id: 's1', data: { name: 'Updated Name' } };
    const generator = updateStudentWorker(updateStudentRequested(updatePayload));

    expect(generator.next().value).toEqual(call(updateStudent, 's1', { name: 'Updated Name' }));

    const mockResponse = {
      data: { student: { id: 's1', name: 'Updated Name' } },
    };
    expect(generator.next(mockResponse).value).toEqual(
      put(updateStudentSucceeded(mockResponse.data.student))
    );
    expect(generator.next().done).toBe(true);
  });

  it('6. updateStudentStatusWorker calls updateStudentStatus and dispatches success', () => {
    const statusPayload = { id: 's1', isActive: false };
    const generator = updateStudentStatusWorker(updateStudentStatusRequested(statusPayload));

    expect(generator.next().value).toEqual(call(updateStudentStatus, 's1', false));

    const mockResponse = {
      data: { student: { id: 's1', isActive: false } },
    };
    expect(generator.next(mockResponse).value).toEqual(
      put(updateStudentStatusSucceeded(mockResponse.data.student))
    );
    expect(generator.next().done).toBe(true);
  });

  it('7. watchStudents registers takeLatest watchers for all student actions', () => {
    const generator = watchStudents();
    expect(generator.next().value).toEqual(takeLatest(fetchStudentsRequested.type, fetchStudentsWorker));
    expect(generator.next().value).toEqual(takeLatest(fetchStudentRequested.type, fetchStudentWorker));
    expect(generator.next().value).toEqual(takeLatest(createStudentRequested.type, createStudentWorker));
    expect(generator.next().value).toEqual(takeLatest(updateStudentRequested.type, updateStudentWorker));
    expect(generator.next().value).toEqual(takeLatest(updateStudentStatusRequested.type, updateStudentStatusWorker));
    expect(generator.next().done).toBe(true);
  });
});


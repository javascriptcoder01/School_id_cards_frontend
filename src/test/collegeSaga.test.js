import { describe, it, expect, vi } from 'vitest';
import { call, put, takeLatest } from 'redux-saga/effects';
import {
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
} from '../features/colleges/collegeSlice.js';
import {
  fetchCollegesWorker,
  fetchCollegeByIdWorker,
  fetchMyCollegeWorker,
  createCollegeWorker,
  updateCollegeWorker,
  updateCollegeStatusWorker,
  watchColleges,
} from '../features/colleges/collegeSaga.js';
import {
  getCollegesApi,
  getMyCollegeApi,
  getCollegeByIdApi,
  createCollegeApi,
  updateCollegeApi,
  updateCollegeStatusApi,
} from '../features/colleges/collegeApi.js';

describe('GROUP D — COLLEGE REDUX SAGA WORKFLOWS', () => {
  it('1. fetchCollegesWorker calls API and dispatches fetchCollegesSucceeded', () => {
    const params = { page: 2, limit: 10, search: 'Delhi' };
    const generator = fetchCollegesWorker(fetchCollegesRequested(params));

    expect(generator.next().value).toEqual(call(getCollegesApi, params));

    const mockResponse = {
      data: {
        colleges: [{ _id: 'c1', name: 'Delhi College' }],
        pagination: { page: 2, limit: 10, total: 15, totalPages: 2 },
      },
    };

    expect(generator.next(mockResponse).value).toEqual(
      put(
        fetchCollegesSucceeded({
          colleges: mockResponse.data.colleges,
          pagination: mockResponse.data.pagination,
        })
      )
    );
    expect(generator.next().done).toBe(true);
  });

  it('2. fetchCollegesWorker handles API failure by dispatching fetchCollegesFailed', () => {
    const generator = fetchCollegesWorker(fetchCollegesRequested());
    expect(generator.next().value).toEqual(call(getCollegesApi, {}));

    const error = new Error('Network error');
    expect(generator.throw(error).value).toEqual(
      put(fetchCollegesFailed('Network error'))
    );
    expect(generator.next().done).toBe(true);
  });

  it('3. fetchCollegeByIdWorker calls getCollegeByIdApi and dispatches success action', () => {
    const generator = fetchCollegeByIdWorker(fetchCollegeByIdRequested('c123'));
    expect(generator.next().value).toEqual(call(getCollegeByIdApi, 'c123'));

    const mockResponse = {
      data: { college: { _id: 'c123', name: 'Oxford', code: 'OX01' } },
    };
    expect(generator.next(mockResponse).value).toEqual(
      put(fetchCollegeByIdSucceeded(mockResponse.data.college))
    );
    expect(generator.next().done).toBe(true);
  });

  it('4. fetchMyCollegeWorker calls getMyCollegeApi and dispatches success action', () => {
    const generator = fetchMyCollegeWorker();
    expect(generator.next().value).toEqual(call(getMyCollegeApi));

    const mockResponse = {
      data: { college: { _id: 'c-mine', name: 'My College', code: 'MY01' } },
    };
    expect(generator.next(mockResponse).value).toEqual(
      put(fetchMyCollegeSucceeded(mockResponse.data.college))
    );
    expect(generator.next().done).toBe(true);
  });

  it('5. createCollegeWorker invokes API, dispatches success, and calls onSuccess callback', () => {
    const onSuccess = vi.fn();
    const collegeData = { name: 'Cambridge', code: 'CAM01' };
    const generator = createCollegeWorker(createCollegeRequested({ data: collegeData, onSuccess }));

    expect(generator.next().value).toEqual(call(createCollegeApi, collegeData));

    const mockResponse = {
      data: { college: { _id: 'cam-1', name: 'Cambridge', code: 'CAM01' } },
    };
    expect(generator.next(mockResponse).value).toEqual(
      put(createCollegeSucceeded(mockResponse.data.college))
    );

    expect(generator.next().done).toBe(true);
    expect(onSuccess).toHaveBeenCalledWith(mockResponse.data.college);
  });

  it('6. updateCollegeWorker invokes API and dispatches updateCollegeSucceeded', () => {
    const updatePayload = { id: 'c1', data: { name: 'Updated Name' } };
    const generator = updateCollegeWorker(updateCollegeRequested(updatePayload));

    expect(generator.next().value).toEqual(call(updateCollegeApi, 'c1', { name: 'Updated Name' }));

    const mockResponse = {
      data: { college: { _id: 'c1', name: 'Updated Name' } },
    };
    expect(generator.next(mockResponse).value).toEqual(
      put(updateCollegeSucceeded(mockResponse.data.college))
    );
    expect(generator.next().done).toBe(true);
  });

  it('7. updateCollegeStatusWorker invokes API and dispatches updateCollegeStatusSucceeded', () => {
    const statusPayload = { id: 'c1', isActive: false };
    const generator = updateCollegeStatusWorker(updateCollegeStatusRequested(statusPayload));

    expect(generator.next().value).toEqual(call(updateCollegeStatusApi, 'c1', false));

    const mockResponse = {
      data: { college: { _id: 'c1', isActive: false } },
    };
    expect(generator.next(mockResponse).value).toEqual(
      put(updateCollegeStatusSucceeded(mockResponse.data.college))
    );
    expect(generator.next().done).toBe(true);
  });

  it('8. watchColleges sets up takeLatest watchers for all college actions', () => {
    const generator = watchColleges();
    expect(generator.next().value).toEqual(takeLatest(fetchCollegesRequested.type, fetchCollegesWorker));
    expect(generator.next().value).toEqual(takeLatest(fetchCollegeByIdRequested.type, fetchCollegeByIdWorker));
    expect(generator.next().value).toEqual(takeLatest(fetchMyCollegeRequested.type, fetchMyCollegeWorker));
    expect(generator.next().value).toEqual(takeLatest(createCollegeRequested.type, createCollegeWorker));
    expect(generator.next().value).toEqual(takeLatest(updateCollegeRequested.type, updateCollegeWorker));
    expect(generator.next().value).toEqual(takeLatest(updateCollegeStatusRequested.type, updateCollegeStatusWorker));
    expect(generator.next().done).toBe(true);
  });
});


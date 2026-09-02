import { describe, it, expect } from 'vitest';
import { call, put } from 'redux-saga/effects';
import { loadCollegeProgressWorker } from '../features/collegeProgress/collegeProgressSaga.js';
import { getCollegeProgress } from '../features/collegeProgress/collegeProgressApi.js';
import { loadCollegeProgressSucceeded } from '../features/collegeProgress/collegeProgressSlice.js';

describe('COLLEGE PROGRESS SAGA', () => {
  it('1. loadCollegeProgressWorker dispatches success on API response', () => {
    const generator = loadCollegeProgressWorker();
    expect(generator.next().value).toEqual(call(getCollegeProgress));

    const mockData = { summary: { totalStudents: 100 }, operators: [] };
    expect(generator.next(mockData).value).toEqual(put(loadCollegeProgressSucceeded(mockData)));
    expect(generator.next().done).toBe(true);
  });
});

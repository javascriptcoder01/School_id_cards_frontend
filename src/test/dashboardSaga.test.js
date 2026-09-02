import { describe, it, expect } from 'vitest';
import { call, put, takeLatest } from 'redux-saga/effects';
import {
  loadDashboardRequested,
  refreshDashboardRequested,
  loadDashboardSucceeded,
  loadDashboardFailed,
} from '../features/dashboard/dashboardSlice.js';
import {
  loadDashboardWorker,
  watchDashboard,
} from '../features/dashboard/dashboardSaga.js';
import {
  getSuperAdminSummary,
  getCollegeAdminSummary,
  getOperatorSummary,
} from '../features/dashboard/dashboardApi.js';

describe('DASHBOARD REDUX SAGA', () => {
  it('1. loadDashboardWorker handles SUPER_ADMIN role', () => {
    const generator = loadDashboardWorker(loadDashboardRequested('SUPER_ADMIN'));
    expect(generator.next().value).toEqual(call(getSuperAdminSummary));

    const mockData = {
      summary: { totalColleges: 5, totalUsers: 10, totalTemplates: 2 },
      activity: [],
      generationStats: null,
    };

    expect(generator.next(mockData).value).toEqual(
      put(
        loadDashboardSucceeded({
          dashboardType: 'SUPER_ADMIN',
          summary: mockData.summary,
          activity: mockData.activity,
          generationStats: mockData.generationStats,
        })
      )
    );
    expect(generator.next().done).toBe(true);
  });

  it('2. loadDashboardWorker handles COLLEGE_ADMIN role', () => {
    const generator = loadDashboardWorker(loadDashboardRequested('COLLEGE_ADMIN'));
    expect(generator.next().value).toEqual(call(getCollegeAdminSummary));

    const mockData = {
      summary: { totalStudents: 200, totalTemplates: 2 },
      activity: [],
      generationStats: { completed: 5 },
    };

    expect(generator.next(mockData).value).toEqual(
      put(
        loadDashboardSucceeded({
          dashboardType: 'COLLEGE_ADMIN',
          summary: mockData.summary,
          activity: mockData.activity,
          generationStats: mockData.generationStats,
        })
      )
    );
    expect(generator.next().done).toBe(true);
  });

  it('3. loadDashboardWorker handles OPERATOR role', () => {
    const generator = loadDashboardWorker(loadDashboardRequested('OPERATOR'));
    expect(generator.next().value).toEqual(call(getOperatorSummary));

    const mockData = {
      summary: { operationalStatus: 'ACTIVE' },
      activity: [],
      generationStats: null,
    };

    expect(generator.next(mockData).value).toEqual(
      put(
        loadDashboardSucceeded({
          dashboardType: 'OPERATOR',
          summary: mockData.summary,
          activity: mockData.activity,
          generationStats: mockData.generationStats,
        })
      )
    );
    expect(generator.next().done).toBe(true);
  });

  it('4. loadDashboardWorker handles error', () => {
    const generator = loadDashboardWorker(loadDashboardRequested('SUPER_ADMIN'));
    generator.next();
    expect(generator.throw(new Error('Network failure')).value).toEqual(
      put(loadDashboardFailed('Network failure'))
    );
    expect(generator.next().done).toBe(true);
  });

  it('5. watchDashboard registers takeLatest for load and refresh', () => {
    const generator = watchDashboard();
    expect(generator.next().value).toEqual(
      takeLatest(
        [loadDashboardRequested.type, refreshDashboardRequested.type],
        loadDashboardWorker
      )
    );
    expect(generator.next().done).toBe(true);
  });
});

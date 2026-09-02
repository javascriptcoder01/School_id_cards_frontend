import { describe, it, expect } from 'vitest';
import dashboardReducer, {
  loadDashboardRequested,
  loadDashboardSucceeded,
  loadDashboardFailed,
  clearDashboard,
} from '../features/dashboard/dashboardSlice.js';

describe('DASHBOARD REDUX SLICE', () => {
  const initialState = {
    dashboardType: null,
    summary: null,
    activity: [],
    generationStats: null,
    loading: false,
    error: null,
    initialized: false,
  };

  it('1. Returns initial state on init', () => {
    expect(dashboardReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('2. Handles loadDashboardRequested', () => {
    const state = dashboardReducer(initialState, loadDashboardRequested('SUPER_ADMIN'));
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
    expect(state.dashboardType).toBe('SUPER_ADMIN');
  });

  it('3. Handles loadDashboardSucceeded', () => {
    const payload = {
      dashboardType: 'SUPER_ADMIN',
      summary: { totalColleges: 5, totalUsers: 12 },
      activity: [{ type: 'COLLEGE_CREATED', title: 'MIT' }],
      generationStats: null,
    };

    const state = dashboardReducer({ ...initialState, loading: true }, loadDashboardSucceeded(payload));
    expect(state.loading).toBe(false);
    expect(state.initialized).toBe(true);
    expect(state.dashboardType).toBe('SUPER_ADMIN');
    expect(state.summary).toEqual({ totalColleges: 5, totalUsers: 12 });
    expect(state.activity).toHaveLength(1);
  });

  it('4. Handles loadDashboardFailed', () => {
    const state = dashboardReducer(
      { ...initialState, loading: true },
      loadDashboardFailed('Network error')
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Network error');
  });

  it('5. Handles clearDashboard', () => {
    const dirtyState = {
      dashboardType: 'COLLEGE_ADMIN',
      summary: { totalStudents: 100 },
      activity: [],
      generationStats: {},
      loading: false,
      error: null,
      initialized: true,
    };
    expect(dashboardReducer(dirtyState, clearDashboard())).toEqual(initialState);
  });
});


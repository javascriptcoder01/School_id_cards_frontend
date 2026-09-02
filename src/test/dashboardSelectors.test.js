import { describe, it, expect } from 'vitest';
import {
  selectDashboardState,
  selectDashboardType,
  selectDashboardSummary,
  selectDashboardActivity,
  selectGenerationStats,
  selectDashboardLoading,
  selectDashboardError,
  selectIsDashboardInitialized,
} from '../features/dashboard/dashboardSelectors.js';

describe('DASHBOARD SELECTORS', () => {
  const mockState = {
    dashboard: {
      dashboardType: 'SUPER_ADMIN',
      summary: { totalColleges: 10, totalUsers: 20 },
      activity: [{ type: 'COLLEGE_CREATED', title: 'MIT' }],
      generationStats: { total: 5, completed: 5 },
      loading: true,
      error: 'Error occurred',
      initialized: true,
    },
  };

  it('1. Selects state fields correctly', () => {
    expect(selectDashboardState(mockState)).toEqual(mockState.dashboard);
    expect(selectDashboardType(mockState)).toBe('SUPER_ADMIN');
    expect(selectDashboardSummary(mockState)).toEqual({ totalColleges: 10, totalUsers: 20 });
    expect(selectDashboardActivity(mockState)).toEqual([{ type: 'COLLEGE_CREATED', title: 'MIT' }]);
    expect(selectGenerationStats(mockState)).toEqual({ total: 5, completed: 5 });
    expect(selectDashboardLoading(mockState)).toBe(true);
    expect(selectDashboardError(mockState)).toBe('Error occurred');
    expect(selectIsDashboardInitialized(mockState)).toBe(true);
  });

  it('2. Handles undefined state safely', () => {
    expect(selectDashboardSummary({})).toBeNull();
    expect(selectDashboardActivity({})).toEqual([]);
    expect(selectDashboardLoading({})).toBe(false);
  });
});


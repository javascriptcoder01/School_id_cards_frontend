/**
 * Dashboard & Analytics Selectors
 */

export const selectDashboardState = (state) => state.dashboard;

export const selectDashboardType = (state) =>
  state.dashboard?.dashboardType || null;

export const selectDashboardSummary = (state) =>
  state.dashboard?.summary || null;

export const selectDashboardActivity = (state) =>
  state.dashboard?.activity || [];

export const selectGenerationStats = (state) =>
  state.dashboard?.generationStats || null;

export const selectDashboardLoading = (state) =>
  Boolean(state.dashboard?.loading);

export const selectDashboardError = (state) =>
  state.dashboard?.error || null;

export const selectIsDashboardInitialized = (state) =>
  Boolean(state.dashboard?.initialized);

export default {
  selectDashboardState,
  selectDashboardType,
  selectDashboardSummary,
  selectDashboardActivity,
  selectGenerationStats,
  selectDashboardLoading,
  selectDashboardError,
  selectIsDashboardInitialized,
};


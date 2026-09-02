import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  dashboardType: null,
  summary: null,
  activity: [],
  generationStats: null,
  loading: false,
  error: null,
  initialized: false,
};

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    loadDashboardRequested: (state, action) => {
      state.loading = true;
      state.error = null;
      state.dashboardType = action.payload || state.dashboardType;
    },
    refreshDashboardRequested: (state, action) => {
      state.loading = true;
      state.error = null;
      state.dashboardType = action.payload || state.dashboardType;
    },
    loadDashboardSucceeded: (state, action) => {
      state.loading = false;
      state.error = null;
      state.initialized = true;
      state.dashboardType = action.payload?.dashboardType || state.dashboardType;
      state.summary = action.payload?.summary || null;
      state.activity = action.payload?.activity || [];
      state.generationStats = action.payload?.generationStats || null;
    },
    loadDashboardFailed: (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to load dashboard metrics';
    },
    clearDashboard: () => initialState,
  },
});

export const {
  loadDashboardRequested,
  refreshDashboardRequested,
  loadDashboardSucceeded,
  loadDashboardFailed,
  clearDashboard,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;

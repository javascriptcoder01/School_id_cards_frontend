// dashboardOverviewSlice.js
// Commission overview (rate, amount, payment) — Super Admin aur College Admin.
// dashboardSlice se alag: wahan ka purana flow (summary, activity) aur clearDashboard waise hi rahe.
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  superAdmin: { data: null, params: null, loading: false, error: null },
  collegeAdmin: { data: null, loading: false, error: null },
};

export const dashboardOverviewSlice = createSlice({
  name: 'dashboardOverview',
  initialState,
  reducers: {
    // { params: { from, to } }
    fetchSuperAdminOverviewRequested: (state, action) => {
      state.superAdmin.loading = true;
      state.superAdmin.error = null;
      state.superAdmin.params = action.payload?.params || {};
    },
    fetchSuperAdminOverviewSucceeded: (state, action) => {
      state.superAdmin.loading = false;
      state.superAdmin.data = action.payload || null;
    },
    fetchSuperAdminOverviewFailed: (state, action) => {
      state.superAdmin.loading = false;
      state.superAdmin.error = action.payload || 'Failed to load the overview';
    },

    fetchCollegeAdminOverviewRequested: (state) => {
      state.collegeAdmin.loading = true;
      state.collegeAdmin.error = null;
    },
    fetchCollegeAdminOverviewSucceeded: (state, action) => {
      state.collegeAdmin.loading = false;
      state.collegeAdmin.data = action.payload || null;
    },
    fetchCollegeAdminOverviewFailed: (state, action) => {
      state.collegeAdmin.loading = false;
      state.collegeAdmin.error = action.payload || 'Failed to load the overview';
    },
  },
});

export const {
  fetchSuperAdminOverviewRequested,
  fetchSuperAdminOverviewSucceeded,
  fetchSuperAdminOverviewFailed,
  fetchCollegeAdminOverviewRequested,
  fetchCollegeAdminOverviewSucceeded,
  fetchCollegeAdminOverviewFailed,
} = dashboardOverviewSlice.actions;

export default dashboardOverviewSlice.reducer;

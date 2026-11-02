// dashboardOverviewSelectors.js

export const selectSuperAdminOverview = (state) => state.dashboardOverview?.superAdmin?.data || null;
export const selectSuperAdminOverviewParams = (state) => state.dashboardOverview?.superAdmin?.params || null;
export const selectSuperAdminOverviewLoading = (state) => Boolean(state.dashboardOverview?.superAdmin?.loading);
export const selectSuperAdminOverviewError = (state) => state.dashboardOverview?.superAdmin?.error || null;

export const selectCollegeAdminOverview = (state) => state.dashboardOverview?.collegeAdmin?.data || null;
export const selectCollegeAdminOverviewLoading = (state) => Boolean(state.dashboardOverview?.collegeAdmin?.loading);
export const selectCollegeAdminOverviewError = (state) => state.dashboardOverview?.collegeAdmin?.error || null;

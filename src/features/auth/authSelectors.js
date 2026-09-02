/**
 * Authentication State Selectors
 */

export const selectAuth = (state) => state.auth;

export const selectCurrentUser = (state) => state.auth?.user || null;

export const selectIsAuthenticated = (state) => Boolean(state.auth?.isAuthenticated && state.auth?.token);

export const selectAuthLoading = (state) => Boolean(state.auth?.isLoading);

export const selectAuthError = (state) => state.auth?.error || null;

export const selectAuthInitialized = (state) => Boolean(state.auth?.initialized);

export const selectUserRole = (state) => state.auth?.user?.role || null;

export const selectUserCollegeId = (state) => state.auth?.user?.collegeId || null;

export default {
  selectAuth,
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectAuthInitialized,
  selectUserRole,
  selectUserCollegeId,
};


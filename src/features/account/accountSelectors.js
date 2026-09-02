/**
 * Account Selectors
 */

export const selectAccountState = (state) => state.account;

export const selectAccountProfile = (state) => state.account?.profile || null;

export const selectAccountLoading = (state) => Boolean(state.account?.loading);

export const selectAccountError = (state) => state.account?.error || null;

export const selectIsAccountInitialized = (state) =>
  Boolean(state.account?.initialized);

export default {
  selectAccountState,
  selectAccountProfile,
  selectAccountLoading,
  selectAccountError,
  selectIsAccountInitialized,
};


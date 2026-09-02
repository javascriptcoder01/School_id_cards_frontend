/**
 * ID Card Verification Selectors
 */

export const selectIdCardVerificationState = (state) => state.idCardVerification;

export const selectVerificationData = (state) =>
  state.idCardVerification?.verificationData || null;

export const selectVerificationStatus = (state) =>
  state.idCardVerification?.status || 'IDLE';

export const selectVerificationError = (state) =>
  state.idCardVerification?.error || null;

export const selectIsVerified = (state) =>
  state.idCardVerification?.status === 'VERIFIED' && Boolean(state.idCardVerification?.verificationData?.verified);

export const selectIsLoading = (state) =>
  state.idCardVerification?.status === 'VERIFYING';

export const selectIsInitialized = (state) =>
  Boolean(state.idCardVerification?.initialized);

export default {
  selectIdCardVerificationState,
  selectVerificationData,
  selectVerificationStatus,
  selectVerificationError,
  selectIsVerified,
  selectIsLoading,
  selectIsInitialized,
};


import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  verificationData: null,
  status: 'IDLE', // 'IDLE' | 'VERIFYING' | 'VERIFIED' | 'FAILED'
  error: null,
  initialized: false,
};

export const idCardVerificationSlice = createSlice({
  name: 'idCardVerification',
  initialState,
  reducers: {
    verifyRequested: (state) => {
      state.status = 'VERIFYING';
      state.error = null;
      state.verificationData = null;
      state.initialized = true;
    },
    verifySucceeded: (state, action) => {
      state.status = 'VERIFIED';
      state.error = null;
      // Sanitize payload data — strictly only allow student, college, and generatedAt info
      const raw = action.payload || {};
      state.verificationData = {
        verified: Boolean(raw.verified),
        student: {
          studentId: raw.student?.studentId || '',
          name: raw.student?.name || '',
        },
        college: {
          name: raw.college?.name || '',
        },
        generatedAt: raw.generatedAt || null,
      };
    },
    verifyFailed: (state, action) => {
      state.status = 'FAILED';
      state.verificationData = null;
      state.error = action.payload || 'ID card verification record not found or invalid.';
    },
    clearVerification: () => initialState,
  },
});

export const {
  verifyRequested,
  verifySucceeded,
  verifyFailed,
  clearVerification,
} = idCardVerificationSlice.actions;

export default idCardVerificationSlice.reducer;


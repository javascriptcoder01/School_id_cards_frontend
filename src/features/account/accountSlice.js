import { createSlice } from '@reduxjs/toolkit';
import { logout } from '../auth/authSlice.js';

const initialState = {
  profile: null,
  loading: false,
  error: null,
  initialized: false,
};

const pickCollege = (data) => {
  const college = data.college && typeof data.college === 'object' ? data.college : null;
  const populatedId = data.collegeId && typeof data.collegeId === 'object' ? data.collegeId : null;

  return {
    collegeId:
      (populatedId ? populatedId._id || populatedId.id : data.collegeId) ||
      (college ? college._id || college.id : null) ||
      null,
    collegeName: college?.name || populatedId?.name || data.collegeName || null,
    collegeCode: college?.code || populatedId?.code || data.collegeCode || null,
  };
};

export const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    fetchAccountRequested: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAccountSucceeded: (state, action) => {
      state.loading = false;
      state.error = null;
      state.initialized = true;
      const data = action.payload || {};
      // Strict whitelist of safe profile fields
      state.profile = {
        id: data.id,
        name: data.name || 'User',
        email: data.email || 'N/A',
        role: data.role || 'USER',
        ...pickCollege(data),
        isActive: data.isActive !== false,
      };
    },
    fetchAccountFailed: (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to load account profile';
    },
    clearAccountError: (state) => {
      state.error = null;
    },
    resetAccountState: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState);
  },
});

export const {
  fetchAccountRequested,
  fetchAccountSucceeded,
  fetchAccountFailed,
  clearAccountError,
  resetAccountState,
} = accountSlice.actions;

export default accountSlice.reducer;
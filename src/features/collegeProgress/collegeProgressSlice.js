import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  progress: null,
  loading: false,
  error: null,
  initialized: false,
};

export const collegeProgressSlice = createSlice({
  name: 'collegeProgress',
  initialState,
  reducers: {
    loadCollegeProgressRequested: (state) => {
      state.loading = true;
      state.error = null;
    },
    loadCollegeProgressSucceeded: (state, action) => {
      state.loading = false;
      state.initialized = true;
      state.progress = action.payload || null;
      state.error = null;
    },
    loadCollegeProgressFailed: (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to load college progress analytics';
    },
    clearCollegeProgress: (state) => {
      state.error = null;
    },
    resetCollegeProgressState: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase('auth/logoutSucceeded', () => initialState);
    builder.addCase('auth/logout', () => initialState);
  },
});

export const {
  loadCollegeProgressRequested,
  loadCollegeProgressSucceeded,
  loadCollegeProgressFailed,
  clearCollegeProgress,
  resetCollegeProgressState,
} = collegeProgressSlice.actions;

export default collegeProgressSlice.reducer;

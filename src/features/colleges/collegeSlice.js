import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  colleges: [],
  selectedCollege: null,

  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  filters: {
    search: '',
    isActive: '',
  },

  listLoading: false,
  detailLoading: false,
  createLoading: false,
  updateLoading: false,
  statusLoading: false,

  listError: null,
  detailError: null,
  createError: null,
  updateError: null,
  statusError: null,
};

export const collegeSlice = createSlice({
  name: 'colleges',
  initialState,
  reducers: {
    // List Colleges Actions
    fetchCollegesRequested: (state) => {
      state.listLoading = true;
      state.listError = null;
    },
    fetchCollegesSucceeded: (state, action) => {
      state.listLoading = false;
      state.colleges = action.payload.colleges || [];
      state.pagination = action.payload.pagination || state.pagination;
      state.listError = null;
    },
    fetchCollegesFailed: (state, action) => {
      state.listLoading = false;
      state.listError = action.payload || 'Failed to fetch colleges';
    },

    // Detail College Actions
    fetchCollegeByIdRequested: (state) => {
      state.detailLoading = true;
      state.detailError = null;
    },
    fetchCollegeByIdSucceeded: (state, action) => {
      state.detailLoading = false;
      state.selectedCollege = action.payload;
      state.detailError = null;
    },
    fetchCollegeByIdFailed: (state, action) => {
      state.detailLoading = false;
      state.detailError = action.payload || 'Failed to fetch college details';
    },

    // My College Actions
    fetchMyCollegeRequested: (state) => {
      state.detailLoading = true;
      state.detailError = null;
    },
    fetchMyCollegeSucceeded: (state, action) => {
      state.detailLoading = false;
      state.selectedCollege = action.payload;
      state.detailError = null;
    },
    fetchMyCollegeFailed: (state, action) => {
      state.detailLoading = false;
      state.detailError = action.payload || 'Failed to fetch college details';
    },

    // Create College Actions
    createCollegeRequested: (state) => {
      state.createLoading = true;
      state.createError = null;
    },
    createCollegeSucceeded: (state, action) => {
      state.createLoading = false;
      state.createError = null;
      if (action.payload && action.payload._id) {
        state.colleges = [action.payload, ...state.colleges];
      }
    },
    createCollegeFailed: (state, action) => {
      state.createLoading = false;
      state.createError = action.payload || 'Failed to create college';
    },

    // Update College Actions
    updateCollegeRequested: (state) => {
      state.updateLoading = true;
      state.updateError = null;
    },
    updateCollegeSucceeded: (state, action) => {
      state.updateLoading = false;
      state.updateError = null;
      state.selectedCollege = action.payload;
      if (action.payload && action.payload._id) {
        state.colleges = state.colleges.map((c) =>
          c._id === action.payload._id ? action.payload : c
        );
      }
    },
    updateCollegeFailed: (state, action) => {
      state.updateLoading = false;
      state.updateError = action.payload || 'Failed to update college';
    },

    // Update College Status Actions
    updateCollegeStatusRequested: (state) => {
      state.statusLoading = true;
      state.statusError = null;
    },
    updateCollegeStatusSucceeded: (state, action) => {
      state.statusLoading = false;
      state.statusError = null;
      const updated = action.payload;
      if (state.selectedCollege && state.selectedCollege._id === updated._id) {
        state.selectedCollege = { ...state.selectedCollege, isActive: updated.isActive };
      }
      state.colleges = state.colleges.map((c) =>
        c._id === updated._id ? { ...c, isActive: updated.isActive } : c
      );
    },
    updateCollegeStatusFailed: (state, action) => {
      state.statusLoading = false;
      state.statusError = action.payload || 'Failed to update college status';
    },

    // Filter & Pagination Actions
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
      state.pagination.page = 1;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearCollegeErrors: (state) => {
      state.listError = null;
      state.detailError = null;
      state.createError = null;
      state.updateError = null;
      state.statusError = null;
    },
    clearSelectedCollege: (state) => {
      state.selectedCollege = null;
    },
  },
});

export const {
  fetchCollegesRequested,
  fetchCollegesSucceeded,
  fetchCollegesFailed,
  fetchCollegeByIdRequested,
  fetchCollegeByIdSucceeded,
  fetchCollegeByIdFailed,
  fetchMyCollegeRequested,
  fetchMyCollegeSucceeded,
  fetchMyCollegeFailed,
  createCollegeRequested,
  createCollegeSucceeded,
  createCollegeFailed,
  updateCollegeRequested,
  updateCollegeSucceeded,
  updateCollegeFailed,
  updateCollegeStatusRequested,
  updateCollegeStatusSucceeded,
  updateCollegeStatusFailed,
  setFilters,
  setPage,
  clearCollegeErrors,
  clearSelectedCollege,
} = collegeSlice.actions;

export default collegeSlice.reducer;


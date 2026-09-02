import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: [],
  selectedUser: null,

  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  filters: {
    search: '',
    role: '',
    isActive: '',
    collegeId: '',
  },

  list: {
    isLoading: false,
    error: null,
  },

  detail: {
    isLoading: false,
    error: null,
  },

  create: {
    isLoading: false,
    error: null,
    success: false,
  },

  update: {
    isLoading: false,
    error: null,
    success: false,
  },

  statusUpdate: {
    isLoading: false,
    error: null,
    success: false,
  },
};

export const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // List Users Actions
    fetchUsersRequested: (state) => {
      state.list.isLoading = true;
      state.list.error = null;
    },
    fetchUsersSucceeded: (state, action) => {
      state.list.isLoading = false;
      state.users = action.payload.users || [];
      state.pagination = action.payload.pagination || state.pagination;
      state.list.error = null;
    },
    fetchUsersFailed: (state, action) => {
      state.list.isLoading = false;
      state.list.error = action.payload || 'Failed to fetch users';
    },

    // Detail User Actions
    fetchUserRequested: (state) => {
      state.detail.isLoading = true;
      state.detail.error = null;
    },
    fetchUserSucceeded: (state, action) => {
      state.detail.isLoading = false;
      state.selectedUser = action.payload;
      state.detail.error = null;
    },
    fetchUserFailed: (state, action) => {
      state.detail.isLoading = false;
      state.detail.error = action.payload || 'Failed to fetch user details';
    },

    // Create User Actions
    createUserRequested: (state) => {
      state.create.isLoading = true;
      state.create.error = null;
      state.create.success = false;
    },
    createUserSucceeded: (state, action) => {
      state.create.isLoading = false;
      state.create.error = null;
      state.create.success = true;
      if (action.payload && action.payload.id) {
        state.users = [action.payload, ...state.users];
      }
    },
    createUserFailed: (state, action) => {
      state.create.isLoading = false;
      state.create.error = action.payload || 'Failed to create user';
      state.create.success = false;
    },

    // Update User Actions
    updateUserRequested: (state) => {
      state.update.isLoading = true;
      state.update.error = null;
      state.update.success = false;
    },
    updateUserSucceeded: (state, action) => {
      state.update.isLoading = false;
      state.update.error = null;
      state.update.success = true;
      state.selectedUser = action.payload;
      if (action.payload && action.payload.id) {
        state.users = state.users.map((u) =>
          u.id === action.payload.id ? action.payload : u
        );
      }
    },
    updateUserFailed: (state, action) => {
      state.update.isLoading = false;
      state.update.error = action.payload || 'Failed to update user';
      state.update.success = false;
    },

    // Update User Status Actions
    updateUserStatusRequested: (state) => {
      state.statusUpdate.isLoading = true;
      state.statusUpdate.error = null;
      state.statusUpdate.success = false;
    },
    updateUserStatusSucceeded: (state, action) => {
      state.statusUpdate.isLoading = false;
      state.statusUpdate.error = null;
      state.statusUpdate.success = true;
      const updated = action.payload;
      if (state.selectedUser && state.selectedUser.id === updated.id) {
        state.selectedUser = { ...state.selectedUser, isActive: updated.isActive };
      }
      state.users = state.users.map((u) =>
        u.id === updated.id ? { ...u, isActive: updated.isActive } : u
      );
    },
    updateUserStatusFailed: (state, action) => {
      state.statusUpdate.isLoading = false;
      state.statusUpdate.error = action.payload || 'Failed to update user status';
      state.statusUpdate.success = false;
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
    clearSelectedUser: (state) => {
      state.selectedUser = null;
      state.detail.error = null;
    },
    clearUserErrors: (state) => {
      state.list.error = null;
      state.detail.error = null;
      state.create.error = null;
      state.update.error = null;
      state.statusUpdate.error = null;
    },
    resetUserOperationState: (state) => {
      state.create.isLoading = false;
      state.create.error = null;
      state.create.success = false;
      state.update.isLoading = false;
      state.update.error = null;
      state.update.success = false;
      state.statusUpdate.isLoading = false;
      state.statusUpdate.error = null;
      state.statusUpdate.success = false;
    },
  },
});

export const {
  fetchUsersRequested,
  fetchUsersSucceeded,
  fetchUsersFailed,
  fetchUserRequested,
  fetchUserSucceeded,
  fetchUserFailed,
  createUserRequested,
  createUserSucceeded,
  createUserFailed,
  updateUserRequested,
  updateUserSucceeded,
  updateUserFailed,
  updateUserStatusRequested,
  updateUserStatusSucceeded,
  updateUserStatusFailed,
  setFilters,
  setPage,
  clearSelectedUser,
  clearUserErrors,
  resetUserOperationState,
} = userSlice.actions;

export default userSlice.reducer;


/**
 * User Management Feature Selectors
 */

export const selectUsersState = (state) => state.users;

export const selectUsersList = (state) => state.users?.users || [];

export const selectSelectedUser = (state) => state.users?.selectedUser || null;

export const selectUserPagination = (state) =>
  state.users?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 };

export const selectUserFilters = (state) =>
  state.users?.filters || { search: '', role: '', isActive: '', collegeId: '' };

export const selectUserListLoading = (state) => Boolean(state.users?.list?.isLoading);
export const selectUserListError = (state) => state.users?.list?.error || null;

export const selectUserDetailLoading = (state) => Boolean(state.users?.detail?.isLoading);
export const selectUserDetailError = (state) => state.users?.detail?.error || null;

export const selectUserCreateLoading = (state) => Boolean(state.users?.create?.isLoading);
export const selectUserCreateError = (state) => state.users?.create?.error || null;
export const selectUserCreateSuccess = (state) => Boolean(state.users?.create?.success);

export const selectUserUpdateLoading = (state) => Boolean(state.users?.update?.isLoading);
export const selectUserUpdateError = (state) => state.users?.update?.error || null;
export const selectUserUpdateSuccess = (state) => Boolean(state.users?.update?.success);

export const selectUserStatusLoading = (state) => Boolean(state.users?.statusUpdate?.isLoading);
export const selectUserStatusError = (state) => state.users?.statusUpdate?.error || null;
export const selectUserStatusSuccess = (state) => Boolean(state.users?.statusUpdate?.success);

export default {
  selectUsersState,
  selectUsersList,
  selectSelectedUser,
  selectUserPagination,
  selectUserFilters,
  selectUserListLoading,
  selectUserListError,
  selectUserDetailLoading,
  selectUserDetailError,
  selectUserCreateLoading,
  selectUserCreateError,
  selectUserCreateSuccess,
  selectUserUpdateLoading,
  selectUserUpdateError,
  selectUserUpdateSuccess,
  selectUserStatusLoading,
  selectUserStatusError,
  selectUserStatusSuccess,
};


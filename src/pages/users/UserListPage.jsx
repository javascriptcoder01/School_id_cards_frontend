import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Plus, Users, RefreshCw } from 'lucide-react';
import {
  fetchUsersRequested,
  updateUserStatusRequested,
  setFilters,
  setPage,
  clearUserErrors,
} from '../../features/users/userSlice.js';
import {
  selectUsersList,
  selectUserPagination,
  selectUserFilters,
  selectUserListLoading,
  selectUserStatusLoading,
  selectUserListError,
  selectUserStatusError,
} from '../../features/users/userSelectors.js';
import { selectUserRole } from '../../features/auth/authSelectors.js';
import { ROUTES } from '../../constants/routes.js';
import { ROLES } from '../../constants/roles.js';
import UserSearch from '../../components/users/UserSearch.jsx';
import UserTable from '../../components/users/UserTable.jsx';
import UserPagination from '../../components/users/UserPagination.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';

export const UserListPage = () => {
  const dispatch = useDispatch();

  const userRole = useSelector(selectUserRole);
  const users = useSelector(selectUsersList);
  const pagination = useSelector(selectUserPagination);
  const filters = useSelector(selectUserFilters);
  const isLoading = useSelector(selectUserListLoading);
  const isStatusLoading = useSelector(selectUserStatusLoading);
  const listError = useSelector(selectUserListError);
  const statusError = useSelector(selectUserStatusError);

  const [togglingId, setTogglingId] = useState(null);

  const isSuperAdmin = userRole === ROLES.SUPER_ADMIN;
  const isCollegeAdmin = userRole === ROLES.COLLEGE_ADMIN;
  const canManageUsers = isSuperAdmin || isCollegeAdmin;

  // Fetch users on filter or pagination changes
  useEffect(() => {
    if (canManageUsers) {
      const queryParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        isActive: filters.isActive,
      };

      if (isSuperAdmin && filters.role) {
        queryParams.role = filters.role;
      }
      if (isSuperAdmin && filters.collegeId) {
        queryParams.collegeId = filters.collegeId;
      }

      dispatch(fetchUsersRequested(queryParams));
    }
  }, [
    dispatch,
    canManageUsers,
    isSuperAdmin,
    pagination.page,
    pagination.limit,
    filters.search,
    filters.role,
    filters.isActive,
    filters.collegeId,
  ]);

  const handleSearchChange = (searchTerm) => {
    dispatch(setFilters({ search: searchTerm }));
  };

  const handleRoleFilterChange = (roleValue) => {
    dispatch(setFilters({ role: roleValue }));
  };

  const handleStatusFilterChange = (statusValue) => {
    dispatch(setFilters({ isActive: statusValue }));
  };

  const handleResetFilters = () => {
    dispatch(setFilters({ search: '', role: '', isActive: '', collegeId: '' }));
  };

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
  };

  const handleStatusToggle = (userId, newStatus) => {
    setTogglingId(userId);
    dispatch(
      updateUserStatusRequested({
        id: userId,
        isActive: newStatus,
        onSuccess: () => setTogglingId(null),
      })
    );
  };

  const handleRefresh = () => {
    const queryParams = {
      page: pagination.page,
      limit: pagination.limit,
      search: filters.search,
      isActive: filters.isActive,
    };
    if (isSuperAdmin && filters.role) queryParams.role = filters.role;
    if (isSuperAdmin && filters.collegeId) queryParams.collegeId = filters.collegeId;

    dispatch(fetchUsersRequested(queryParams));
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-indigo-600" />
            Users Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isSuperAdmin
              ? 'Manage administrator and operator accounts across the platform'
              : 'Manage operator staff accounts for your institution'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
            title="Refresh directory"
            aria-label="Refresh directory"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {canManageUsers && (
            <Link
              to={ROUTES.USERS_NEW}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add User</span>
            </Link>
          )}
        </div>
      </div>

      {/* Error Banners */}
      {listError && (
        <ErrorMessage
          message={listError}
          title="Error Loading Users"
          onDismiss={() => dispatch(clearUserErrors())}
        />
      )}

      {statusError && (
        <ErrorMessage
          message={statusError}
          title="Status Update Failed"
          onDismiss={() => dispatch(clearUserErrors())}
        />
      )}

      {/* Search & Filters */}
      <UserSearch
        search={filters.search}
        role={filters.role}
        isActive={filters.isActive}
        isSuperAdmin={isSuperAdmin}
        onSearchChange={handleSearchChange}
        onRoleChange={handleRoleFilterChange}
        onStatusChange={handleStatusFilterChange}
        onReset={handleResetFilters}
      />

      {/* Users Table */}
      <UserTable
        users={users}
        isLoading={isLoading}
        canEdit={canManageUsers}
        statusLoadingId={isStatusLoading ? togglingId : null}
        onStatusToggle={handleStatusToggle}
      />

      {/* Pagination */}
      <UserPagination
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default UserListPage;


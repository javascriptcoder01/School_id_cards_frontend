import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, School, RefreshCw } from 'lucide-react';
import {
  fetchCollegesRequested,
  updateCollegeStatusRequested,
  setFilters,
  setPage,
  clearCollegeErrors,
} from '../../features/auth/../colleges/collegeSlice.js';
import {
  selectCollegesList,
  selectCollegePagination,
  selectCollegeFilters,
  selectCollegeListLoading,
  selectCollegeStatusLoading,
  selectCollegeListError,
  selectCollegeStatusError,
} from '../../features/auth/../colleges/collegeSelectors.js';
import { selectCurrentUser, selectUserRole } from '../../features/auth/authSelectors.js';
import { ROUTES } from '../../constants/routes.js';
import CollegeSearch from '../../components/colleges/CollegeSearch.jsx';
import CollegeTable from '../../components/colleges/CollegeTable.jsx';
import CollegePagination from '../../components/colleges/CollegePagination.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';

export const CollegeListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectCurrentUser);
  const userRole = useSelector(selectUserRole);
  const colleges = useSelector(selectCollegesList);
  const pagination = useSelector(selectCollegePagination);
  const filters = useSelector(selectCollegeFilters);
  const isLoading = useSelector(selectCollegeListLoading);
  const isStatusLoading = useSelector(selectCollegeStatusLoading);
  const listError = useSelector(selectCollegeListError);
  const statusError = useSelector(selectCollegeStatusError);

  const [togglingId, setTogglingId] = useState(null);

  const isSuperAdmin = userRole === 'SUPER_ADMIN';

  // If a COLLEGE_ADMIN lands here, redirect to their own college profile
  useEffect(() => {
    if (userRole === 'COLLEGE_ADMIN' && user?.collegeId) {
      navigate(`/colleges/${user.collegeId}`, { replace: true });
    }
  }, [userRole, user, navigate]);

  // Fetch colleges whenever page or filters change
  useEffect(() => {
    if (isSuperAdmin) {
      dispatch(
        fetchCollegesRequested({
          page: pagination.page,
          limit: pagination.limit,
          search: filters.search,
          isActive: filters.isActive,
        })
      );
    }
  }, [dispatch, isSuperAdmin, pagination.page, pagination.limit, filters.search, filters.isActive]);

  const handleSearchChange = (searchTerm) => {
    dispatch(setFilters({ search: searchTerm }));
  };

  const handleStatusFilterChange = (statusValue) => {
    dispatch(setFilters({ isActive: statusValue }));
  };

  const handleResetFilters = () => {
    dispatch(setFilters({ search: '', isActive: '' }));
  };

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
  };

  const handleStatusToggle = (collegeId, newStatus) => {
    setTogglingId(collegeId);
    dispatch(
      updateCollegeStatusRequested({
        id: collegeId,
        isActive: newStatus,
        onSuccess: () => setTogglingId(null),
      })
    );
  };

  const handleRefresh = () => {
    dispatch(
      fetchCollegesRequested({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        isActive: filters.isActive,
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <School className="w-7 h-7 text-indigo-600" />
            Colleges Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage participating institutions and their access configuration
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

          {isSuperAdmin && (
            <Link
              to={ROUTES.COLLEGES_NEW}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add College</span>
            </Link>
          )}
        </div>
      </div>

      {/* Error Banners */}
      {listError && (
        <ErrorMessage
          message={listError}
          title="Error Loading Colleges"
          onDismiss={() => dispatch(clearCollegeErrors())}
        />
      )}

      {statusError && (
        <ErrorMessage
          message={statusError}
          title="Status Update Failed"
          onDismiss={() => dispatch(clearCollegeErrors())}
        />
      )}

      {/* Search & Filters */}
      <CollegeSearch
        search={filters.search}
        isActive={filters.isActive}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusFilterChange}
        onReset={handleResetFilters}
      />

      {/* Colleges Table */}
      <CollegeTable
        colleges={colleges}
        isLoading={isLoading}
        isSuperAdmin={isSuperAdmin}
        statusLoadingId={isStatusLoading ? togglingId : null}
        onStatusToggle={handleStatusToggle}
      />

      {/* Pagination */}
      <CollegePagination
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default CollegeListPage;


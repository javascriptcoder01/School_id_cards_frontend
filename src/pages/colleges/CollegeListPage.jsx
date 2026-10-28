import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, School, RefreshCw, SearchX } from 'lucide-react';
import {
  fetchCollegesRequested,
  updateCollegeStatusRequested,
  setFilters,
  setPage,
  clearCollegeErrors,
} from '../../features/colleges/collegeSlice.js';
import {
  selectCollegesList,
  selectCollegePagination,
  selectCollegeFilters,
  selectCollegeListLoading,
  selectCollegeStatusLoading,
  selectCollegeListError,
  selectCollegeStatusError,
} from '../../features/colleges/collegeSelectors.js';
import { selectCurrentUser, selectUserRole } from '../../features/auth/authSelectors.js';
import { ROUTES } from '../../constants/routes.js';
import CollegeSearch from '../../components/colleges/CollegeSearch.jsx';
// import CollegeCard, { CollegeCardSkeleton } from '../../components/colleges/CollegeCard.jsx';
import CollegePagination from '../../components/colleges/CollegePagination.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import CollegeCard, { CollegeCardSkeleton } from './CollegeCard.jsx';

const SKELETON_COUNT = 6;

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
  const hasFilters = Boolean(filters.search) || filters.isActive !== '';
  const list = colleges ?? [];

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

  // Clear the spinner once the status request finishes, success or failure
  useEffect(() => {
    if (!isStatusLoading) setTogglingId(null);
  }, [isStatusLoading]);

  const handleSearchChange = (searchTerm) => dispatch(setFilters({ search: searchTerm }));
  const handleStatusFilterChange = (statusValue) => dispatch(setFilters({ isActive: statusValue }));
  const handleResetFilters = () => dispatch(setFilters({ search: '', isActive: '' }));
  const handlePageChange = (newPage) => dispatch(setPage(newPage));

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

  const renderGrid = () => {
    // First load: show skeleton cards
    if (isLoading && list.length === 0) {
      return (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <CollegeCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (!isLoading && list.length === 0) {
      return (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-slate-100 grid place-items-center">
            {hasFilters ? (
              <SearchX className="w-6 h-6 text-slate-500" />
            ) : (
              <School className="w-6 h-6 text-slate-500" />
            )}
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-900">
            {hasFilters ? 'No colleges match these filters' : 'No colleges added yet'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {hasFilters
              ? 'Try a different name or status, or clear the filters.'
              : 'Add the first institution to start managing access.'}
          </p>
          <div className="mt-5">
            {hasFilters ? (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Clear filters
              </button>
            ) : (
              isSuperAdmin && (
                <Link
                  to={ROUTES.COLLEGES_NEW}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  Add college
                </Link>
              )
            )}
          </div>
        </div>
      );
    }

    // Refetching with data on screen: keep cards visible but dimmed
    return (
      <div
        className={`grid gap-5 sm:grid-cols-2 xl:grid-cols-3 transition-opacity ${isLoading ? 'opacity-60 pointer-events-none' : ''
          }`}
        aria-busy={isLoading}
      >
        {list.map((college) => {
          const id = college.id ?? college._id;
          return (
            <CollegeCard
              key={id}
              college={college}
              isSuperAdmin={isSuperAdmin}
              isToggling={isStatusLoading && togglingId === id}
              onStatusToggle={handleStatusToggle}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <School className="w-7 h-7 text-indigo-600" />
            Colleges
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {pagination?.total != null
              ? `${pagination.total.toLocaleString('en-IN')} institutions on the platform`
              : 'Manage participating institutions and their access'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-60"
            title="Refresh list"
            aria-label="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {isSuperAdmin && (
            <Link
              to={ROUTES.COLLEGES_NEW}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add college</span>
            </Link>
          )}
        </div>
      </div>

      {/* Errors */}
      {listError && (
        <ErrorMessage
          message={listError}
          title="Couldn't load colleges"
          onDismiss={() => dispatch(clearCollegeErrors())}
        />
      )}
      {statusError && (
        <ErrorMessage
          message={statusError}
          title="Status wasn't updated"
          onDismiss={() => dispatch(clearCollegeErrors())}
        />
      )}

      {/* Search & filters */}
      <CollegeSearch
        search={filters.search}
        isActive={filters.isActive}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusFilterChange}
        onReset={handleResetFilters}
      />

      {/* Cards */}
      {renderGrid()}

      {/* Pagination */}
      {list.length > 0 && (
        <CollegePagination pagination={pagination} onPageChange={handlePageChange} />
      )}
    </div>
  );
};

export default CollegeListPage;
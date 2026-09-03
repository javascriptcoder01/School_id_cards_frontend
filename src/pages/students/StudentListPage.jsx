import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Plus, GraduationCap, RefreshCw, FileSpreadsheet } from 'lucide-react';
import {
  fetchStudentsRequested,
  updateStudentStatusRequested,
  setStudentFilters,
  setStudentPagination,
  clearStudentErrors,
} from '../../features/students/studentSlice.js';
import {
  selectStudents,
  selectStudentPagination,
  selectStudentFilters,
  selectStudentsLoading,
  selectStudentStatusLoading,
  selectStudentsError,
  selectStudentStatusError,
} from '../../features/students/studentSelectors.js';
import { selectCurrentUser, selectUserRole } from '../../features/auth/authSelectors.js';
import { ROUTES } from '../../constants/routes.js';
import { ROLES } from '../../constants/roles.js';
import StudentSearch from '../../components/students/StudentSearch.jsx';
import StudentTable from '../../components/students/StudentTable.jsx';
import StudentPagination from '../../components/students/StudentPagination.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import OperatorAssignmentBanner from '../../components/students/OperatorAssignmentBanner.jsx';

export const StudentListPage = () => {
  const dispatch = useDispatch();

  const currentUser = useSelector(selectCurrentUser);
  const userRole = useSelector(selectUserRole);
  const isOperator = userRole === ROLES.OPERATOR || currentUser?.role === ROLES.OPERATOR;

  const students = useSelector(selectStudents);
  const pagination = useSelector(selectStudentPagination);
  const filters = useSelector(selectStudentFilters);
  const isLoading = useSelector(selectStudentsLoading);
  const isStatusLoading = useSelector(selectStudentStatusLoading);
  const listError = useSelector(selectStudentsError);
  const statusError = useSelector(selectStudentStatusError);

  const [togglingId, setTogglingId] = useState(null);

  // Fetch students on initial mount or when pagination/filters change
  useEffect(() => {
    dispatch(
      fetchStudentsRequested({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
      })
    );
  }, [dispatch, pagination.page, pagination.limit, filters.search]);

  const handleSearchChange = (searchTerm) => {
    dispatch(setStudentFilters({ search: searchTerm }));
  };

  const handleResetSearch = () => {
    dispatch(setStudentFilters({ search: '' }));
  };

  const handlePageChange = (newPage) => {
    dispatch(setStudentPagination({ page: newPage }));
  };

  const handleStatusToggle = (studentId, newStatus) => {
    if (isOperator) return;
    setTogglingId(studentId);
    dispatch(
      updateStudentStatusRequested({
        id: studentId,
        isActive: newStatus,
        onSuccess: () => setTogglingId(null),
      })
    );
  };

  const handleRefresh = () => {
    dispatch(
      fetchStudentsRequested({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <GraduationCap className="w-7 h-7 text-indigo-600" />
            {isOperator ? 'My Assigned Students' : 'Students Directory'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isOperator
              ? 'View and manage student profiles, completion status, and ID card readiness for your assigned roster'
              : 'Manage student records, credentials, and identity status for your institution'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
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

          <Link
            to={ROUTES.STUDENT_IMPORT}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-xs transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
            <span>Bulk Import Students</span>
          </Link>

          <Link
            to={ROUTES.STUDENTS_NEW}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </Link>
        </div>
      </div>

      {/* Operator Assignment Scope Banner */}
      {isOperator && (
        <OperatorAssignmentBanner
          subjectName={currentUser?.subjectName}
          className={currentUser?.className}
          sectionName={currentUser?.sectionName || currentUser?.section}
          operatorName={currentUser?.name}
        />
      )}

      {/* Error Banners */}
      {listError && (
        <ErrorMessage
          message={listError}
          title="Error Loading Students"
          onDismiss={() => dispatch(clearStudentErrors())}
        />
      )}

      {statusError && (
        <ErrorMessage
          message={statusError}
          title="Status Update Failed"
          onDismiss={() => dispatch(clearStudentErrors())}
        />
      )}

      {/* Search Input */}
      <StudentSearch
        search={filters.search}
        onSearchChange={handleSearchChange}
        onReset={handleResetSearch}
      />

      {/* Students Table */}
      <StudentTable
        students={students}
        isLoading={isLoading}
        canEdit={true}
        statusLoadingId={isStatusLoading ? togglingId : null}
        onStatusToggle={handleStatusToggle}
      />

      {/* Pagination */}
      <StudentPagination
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default StudentListPage;


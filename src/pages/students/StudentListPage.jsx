import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Plus, GraduationCap, RefreshCw, FileSpreadsheet, Filter, X } from 'lucide-react';
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
  selectStudentClassScope,
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
import EmptyState from '../../components/common/EmptyState.jsx';

const filterInputClass =
  'w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all';

export const StudentListPage = () => {
  const dispatch = useDispatch();

  const currentUser = useSelector(selectCurrentUser);
  const userRole = useSelector(selectUserRole);
  const isOperator = userRole === ROLES.OPERATOR || currentUser?.role === ROLES.OPERATOR;

  const students = useSelector(selectStudents);
  const pagination = useSelector(selectStudentPagination);
  const filters = useSelector(selectStudentFilters);
  const classScope = useSelector(selectStudentClassScope);
  const isLoading = useSelector(selectStudentsLoading);
  const isStatusLoading = useSelector(selectStudentStatusLoading);
  const listError = useSelector(selectStudentsError);
  const statusError = useSelector(selectStudentStatusError);

  const [togglingId, setTogglingId] = useState(null);

  // COLLEGE_ADMIN class/section filter (Apply par hi request jaati hai)
  const appliedClassName = isOperator ? '' : filters.className || '';
  const appliedSection = isOperator ? '' : filters.section || '';
  const [classInput, setClassInput] = useState(appliedClassName);
  const [sectionInput, setSectionInput] = useState(appliedSection);
  const hasClassFilter = Boolean(appliedClassName || appliedSection);

  // OPERATOR: backend ne bataya ki class assign nahi hai
  const operatorHasNoClass = isOperator && classScope === null;

  const buildListParams = () => ({
    page: pagination.page,
    limit: pagination.limit,
    search: filters.search,
    className: appliedClassName,
    section: appliedSection,
  });

  // Fetch students on initial mount or when pagination/filters change
  useEffect(() => {
    dispatch(fetchStudentsRequested(buildListParams()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, pagination.page, pagination.limit, filters.search, appliedClassName, appliedSection]);

  const handleApplyClassFilter = (e) => {
    e.preventDefault();
    dispatch(setStudentFilters({ className: classInput.trim(), section: sectionInput.trim() }));
  };

  const handleClearClassFilter = () => {
    setClassInput('');
    setSectionInput('');
    dispatch(setStudentFilters({ className: '', section: '' }));
  };

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
    dispatch(fetchStudentsRequested(buildListParams()));
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
      {/* Class backend se aati hai (classScope); load hone tak profile wali class */}
      {isOperator && !operatorHasNoClass && (
        <OperatorAssignmentBanner
          subjectName={currentUser?.subjectName}
          className={classScope?.className || currentUser?.className}
          sectionName={classScope?.section || currentUser?.sectionName || currentUser?.section}
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

      {operatorHasNoClass ? (
        <EmptyState
          title="No Class Assigned"
          description="No class is assigned to you yet. Ask the school admin."
          icon={GraduationCap}
        />
      ) : (
        <>
          {/* Class / Section Filter (COLLEGE_ADMIN) */}
          {!isOperator && (
            <form
              onSubmit={handleApplyClassFilter}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-end gap-3"
            >
              <div className="w-full sm:w-48">
                <label htmlFor="filter-class" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Class
                </label>
                <input
                  id="filter-class"
                  type="text"
                  maxLength={100}
                  value={classInput}
                  onChange={(e) => setClassInput(e.target.value)}
                  placeholder="e.g. 10th"
                  className={filterInputClass}
                />
              </div>
              <div className="w-full sm:w-32">
                <label htmlFor="filter-section" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Section
                </label>
                <input
                  id="filter-section"
                  type="text"
                  maxLength={50}
                  value={sectionInput}
                  onChange={(e) => setSectionInput(e.target.value)}
                  placeholder="e.g. A"
                  className={filterInputClass}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs disabled:opacity-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>Apply</span>
                </button>
                {hasClassFilter && (
                  <button
                    type="button"
                    onClick={handleClearClassFilter}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </form>
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
            showClassTeacher={!isOperator}
          />

          {/* Pagination */}
          <StudentPagination
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default StudentListPage;


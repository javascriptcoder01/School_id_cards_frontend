import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Plus, FileSpreadsheet, RefreshCw, Search } from 'lucide-react';
import {
  loadOperatorStudentsRequested,
  loadOperatorDashboardRequested,
} from '../../features/operator/operatorSlice.js';
import {
  selectOperatorStudents,
  selectOperatorAssignments,
  selectOperatorLoadingStudents,
  selectOperatorError,
  selectIsOperatorInitialized,
} from '../../features/operator/operatorSelectors.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import PageLoader from '../../components/common/PageLoader.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import OperatorScopeBadge from '../../components/operator/OperatorScopeBadge.jsx';
import OperatorStudentTable from '../../components/operator/OperatorStudentTable.jsx';

export const OperatorStudentListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const students = useSelector(selectOperatorStudents);
  const assignments = useSelector(selectOperatorAssignments);
  const isLoading = useSelector(selectOperatorLoadingStudents);
  const error = useSelector(selectOperatorError);
  const isInitialized = useSelector(selectIsOperatorInitialized);

  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(loadOperatorStudentsRequested());
    dispatch(loadOperatorDashboardRequested());
  }, [dispatch]);

  const handleRefresh = () => {
    if (!isLoading) {
      dispatch(loadOperatorStudentsRequested());
      dispatch(loadOperatorDashboardRequested());
    }
  };

  const handleEditStudent = (studentId) => {
    navigate(`/operator/students/${studentId}/edit`);
  };

  const handlePreviewCard = (studentId) => {
    navigate(`/operator/id-cards/preview?studentId=${studentId}`);
  };

  const filteredStudents = (students || []).filter((st) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = st.name?.toLowerCase() || '';
    const studentId = st.studentId?.toLowerCase() || '';
    const className = st.className?.toLowerCase() || '';
    const section = st.section?.toLowerCase() || '';
    return name.includes(q) || studentId.includes(q) || className.includes(q) || section.includes(q);
  });

  if (isLoading && !isInitialized && students.length === 0) {
    return <PageLoader message="Loading assigned student roster..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assigned Students Roster"
        subtitle="Manage enrolled students, update information, and trigger ID previews within your assigned class scopes."
        icon={GraduationCap}
        action={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/operator/students/import')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
              <span>Bulk Import</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/operator/students/new')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Student</span>
            </button>
          </div>
        }
      />

      {error && !isInitialized && (
        <ErrorState
          title="Failed to Load Students"
          message={error}
          onRetry={handleRefresh}
        />
      )}

      {/* Scope Banner */}
      <OperatorScopeBadge assignments={assignments} />

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, ID, class..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
          />
        </div>
      </div>

      {/* Scoped Student Table */}
      <OperatorStudentTable
        students={filteredStudents}
        onEdit={handleEditStudent}
        onPreview={handlePreviewCard}
      />
    </div>
  );
};

export default OperatorStudentListPage;

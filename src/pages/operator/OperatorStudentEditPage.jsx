import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import {
  loadOperatorStudentRequested,
  updateOperatorStudentRequested,
  loadOperatorDashboardRequested,
  clearSelectedOperatorStudent,
} from '../../features/operator/operatorSlice.js';
import {
  selectSelectedOperatorStudent,
  selectOperatorAssignments,
  selectOperatorLoadingStudents,
  selectOperatorSaving,
  selectOperatorError,
} from '../../features/operator/operatorSelectors.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import PageLoader from '../../components/common/PageLoader.jsx';
import OperatorStudentForm from '../../components/operator/OperatorStudentForm.jsx';

export const OperatorStudentEditPage = () => {
  const { studentId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Declined print request se "Edit student" → save / back par wapas wahi request
  const location = useLocation();
  const returnTo = typeof location.state?.returnTo === 'string' && location.state.returnTo.startsWith('/') ? location.state.returnTo : null;
  const backPath = returnTo || '/operator/students';

  const student = useSelector(selectSelectedOperatorStudent);
  const assignments = useSelector(selectOperatorAssignments);
  const isLoading = useSelector(selectOperatorLoadingStudents);
  const isSaving = useSelector(selectOperatorSaving);
  const error = useSelector(selectOperatorError);

  useEffect(() => {
    if (studentId) {
      dispatch(loadOperatorStudentRequested(studentId));
      dispatch(loadOperatorDashboardRequested());
    }
    return () => {
      dispatch(clearSelectedOperatorStudent());
    };
  }, [dispatch, studentId]);

  const handleSubmit = (formData) => {
    dispatch(
      updateOperatorStudentRequested({
        studentId,
        updates: formData,
      })
    );
    navigate(backPath);
  };

  if (isLoading && !student) {
    return <PageLoader message="Loading student details..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={`Edit Student: ${student?.name || 'Student'}`}
        subtitle="Update student attributes, contact numbers, and photo for ID card rendering."
        icon={GraduationCap}
        action={
          <button
            type="button"
            onClick={() => navigate(backPath)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>{returnTo ? 'Back to Request' : 'Back to Roster'}</span>
          </button>
        }
      />

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <OperatorStudentForm
          initialValues={student}
          assignedScopes={assignments}
          onSubmit={handleSubmit}
          onCancel={() => navigate(backPath)}
          isSaving={isSaving}
          error={error}
        />
      </div>
    </div>
  );
};

export default OperatorStudentEditPage;

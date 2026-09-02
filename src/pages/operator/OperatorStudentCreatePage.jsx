import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import {
  createOperatorStudentRequested,
  loadOperatorDashboardRequested,
} from '../../features/operator/operatorSlice.js';
import {
  selectOperatorAssignments,
  selectOperatorSaving,
  selectOperatorError,
} from '../../features/operator/operatorSelectors.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import OperatorStudentForm from '../../components/operator/OperatorStudentForm.jsx';

export const OperatorStudentCreatePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const assignments = useSelector(selectOperatorAssignments);
  const isSaving = useSelector(selectOperatorSaving);
  const error = useSelector(selectOperatorError);

  useEffect(() => {
    dispatch(loadOperatorDashboardRequested());
  }, [dispatch]);

  const handleSubmit = (formData) => {
    dispatch(createOperatorStudentRequested(formData));
    navigate('/operator/students');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Add New Student"
        subtitle="Create an enrolled student record within your assigned class and section scope."
        icon={GraduationCap}
        action={
          <button
            type="button"
            onClick={() => navigate('/operator/students')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>Back to Roster</span>
          </button>
        }
      />

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <OperatorStudentForm
          assignedScopes={assignments}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/operator/students')}
          isSaving={isSaving}
          error={error}
        />
      </div>
    </div>
  );
};

export default OperatorStudentCreatePage;

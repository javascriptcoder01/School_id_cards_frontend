import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import {
  createStudentRequested,
  clearStudentErrors,
} from '../../features/students/studentSlice.js';
import {
  selectStudentCreateLoading,
  selectStudentCreateError,
} from '../../features/students/studentSelectors.js';
import { ROUTES, getStudentDetailRoute } from '../../constants/routes.js';
import StudentForm from '../../components/students/StudentForm.jsx';

export const CreateStudentPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isLoading = useSelector(selectStudentCreateLoading);
  const errorMessage = useSelector(selectStudentCreateError);

  useEffect(() => {
    dispatch(clearStudentErrors());
  }, [dispatch]);

  const handleSubmit = (formData) => {
    dispatch(
      createStudentRequested({
        data: formData,
        onSuccess: (createdStudent) => {
          if (createdStudent?.id) {
            navigate(getStudentDetailRoute(createdStudent.id));
          } else {
            navigate(ROUTES.STUDENTS);
          }
        },
      })
    );
  };

  const handleCancel = () => {
    navigate(ROUTES.STUDENTS);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Navigation */}
      <div className="flex items-center gap-3">
        <Link
          to={ROUTES.STUDENTS}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students Directory</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <GraduationCap className="w-7 h-7 text-indigo-600" />
          Register New Student
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Add a student record with academic, contact, guardian, and residential details
        </p>
      </div>

      {/* Form Component */}
      <StudentForm
        isEdit={false}
        isLoading={isLoading}
        errorMessage={errorMessage}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default CreateStudentPage;


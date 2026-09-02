import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import {
  fetchStudentRequested,
  updateStudentRequested,
  clearStudentErrors,
} from '../../features/students/studentSlice.js';
import {
  selectSelectedStudent,
  selectStudentDetailLoading,
  selectStudentUpdateLoading,
  selectStudentUpdateError,
} from '../../features/students/studentSelectors.js';
import { ROUTES, getStudentDetailRoute } from '../../constants/routes.js';
import StudentForm from '../../components/students/StudentForm.jsx';
import Loader from '../../components/common/Loader.jsx';

export const EditStudentPage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const student = useSelector(selectSelectedStudent);
  const isFetching = useSelector(selectStudentDetailLoading);
  const isUpdating = useSelector(selectStudentUpdateLoading);
  const errorMessage = useSelector(selectStudentUpdateError);

  useEffect(() => {
    dispatch(clearStudentErrors());
    if (studentId && (!student || student.id !== studentId)) {
      dispatch(fetchStudentRequested(studentId));
    }
  }, [dispatch, studentId, student]);

  const handleSubmit = (formData) => {
    dispatch(
      updateStudentRequested({
        id: studentId,
        data: formData,
        onSuccess: () => {
          navigate(getStudentDetailRoute(studentId));
        },
      })
    );
  };

  const handleCancel = () => {
    navigate(getStudentDetailRoute(studentId));
  };

  if (isFetching && !student) {
    return <Loader message="Fetching student information..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Navigation */}
      <div className="flex items-center gap-3">
        <Link
          to={getStudentDetailRoute(studentId)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Profile</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <GraduationCap className="w-7 h-7 text-indigo-600" />
          Edit Student Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Update personal details, academic designation, guardian contact, or address
        </p>
      </div>

      {/* Form Component */}
      <StudentForm
        initialValues={student}
        isEdit={true}
        isLoading={isUpdating}
        errorMessage={errorMessage}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default EditStudentPage;


import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { School, ArrowLeft } from 'lucide-react';
import {
  fetchCollegeByIdRequested,
  updateCollegeRequested,
  clearCollegeErrors,
} from '../../features/colleges/collegeSlice.js';
import {
  selectSelectedCollege,
  selectCollegeDetailLoading,
  selectCollegeUpdateLoading,
  selectCollegeUpdateError,
} from '../../features/colleges/collegeSelectors.js';
import { ROUTES, getCollegeDetailRoute } from '../../constants/routes.js';
import CollegeForm from '../../components/colleges/CollegeForm.jsx';
import Loader from '../../components/common/Loader.jsx';

export const EditCollegePage = () => {
  const { collegeId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const college = useSelector(selectSelectedCollege);
  const isDetailLoading = useSelector(selectCollegeDetailLoading);
  const isUpdating = useSelector(selectCollegeUpdateLoading);
  const updateError = useSelector(selectCollegeUpdateError);

  useEffect(() => {
    if (collegeId && (!college || college._id !== collegeId)) {
      dispatch(fetchCollegeByIdRequested(collegeId));
    }

    return () => {
      dispatch(clearCollegeErrors());
    };
  }, [dispatch, collegeId, college]);

  const handleSubmit = (updateData) => {
    dispatch(
      updateCollegeRequested({
        id: collegeId,
        data: updateData,
        onSuccess: () => {
          navigate(getCollegeDetailRoute(collegeId));
        },
      })
    );
  };

  if (isDetailLoading) {
    return <Loader message="Loading college for editing..." />;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header & Breadcrumbs */}
      <div>
        <Link
          to={getCollegeDetailRoute(collegeId)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to College Details</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <School className="w-7 h-7 text-indigo-600" />
          Edit College Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Update institutional details for {college?.name || 'the college'}
        </p>
      </div>

      {/* College Edit Form */}
      <CollegeForm
        initialValues={college}
        isEdit={true}
        isLoading={isUpdating}
        errorMessage={updateError}
        onSubmit={handleSubmit}
        onCancel={() => navigate(getCollegeDetailRoute(collegeId))}
      />
    </div>
  );
};

export default EditCollegePage;


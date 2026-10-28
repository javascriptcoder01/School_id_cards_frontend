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
  selectCollegeDetailError,
  selectCollegeUpdateLoading,
  selectCollegeUpdateError,
} from '../../features/colleges/collegeSelectors.js';
import { ROUTES, getCollegeDetailRoute } from '../../constants/routes.js';
import CollegeForm from '../../components/colleges/CollegeForm.jsx';
import Loader from '../../components/common/Loader.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';

export const EditCollegePage = () => {
  const { collegeId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const college = useSelector(selectSelectedCollege);
  const isDetailLoading = useSelector(selectCollegeDetailLoading);
  const detailError = useSelector(selectCollegeDetailError);
  const isUpdating = useSelector(selectCollegeUpdateLoading);
  const updateError = useSelector(selectCollegeUpdateError);

  // Sirf wahi college form mein jaaye jo URL mein hai (store mein purana college pada ho sakta hai)
  const isCorrectCollege = Boolean(college && String(college._id) === String(collegeId));

  // Fetch only when the right college isn't in the store yet
  useEffect(() => {
    if (collegeId && !isCorrectCollege) {
      dispatch(fetchCollegeByIdRequested(collegeId));
    }
  }, [dispatch, collegeId, isCorrectCollege]);

  // Clear errors only when leaving the page (pehle har college change par bhi clear ho jaata tha)
  useEffect(() => {
    return () => {
      dispatch(clearCollegeErrors());
    };
  }, [dispatch]);

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

  const header = (
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
        Update details, logo, signature and stamp for {isCorrectCollege ? college.name : 'the college'}
      </p>
    </div>
  );

  // Load fail hua to khaali form mat dikhao — save karne par poora college overwrite ho jaata
  if (detailError && !isCorrectCollege) {
    return (
      <div className="space-y-6 max-w-5xl">
        {header}
        <ErrorMessage message={detailError} title="Couldn't load this college" />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => dispatch(fetchCollegeByIdRequested(collegeId))}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
          >
            Try again
          </button>
          <Link
            to={ROUTES.COLLEGES}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"
          >
            Back to Colleges
          </Link>
        </div>
      </div>
    );
  }

  // Data aane tak form render nahi hota, taaki blank form flash na ho
  if (isDetailLoading || !isCorrectCollege) {
    return <Loader message="Loading college for editing..." />;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {header}

      {/* key: dusre college par jaane se form state fresh ho jaati hai */}
      <CollegeForm
        key={college._id}
        initialValues={college}
        isEdit
        isLoading={isUpdating}
        errorMessage={updateError}
        onSubmit={handleSubmit}
        onCancel={() => navigate(getCollegeDetailRoute(collegeId))}
      />
    </div>
  );
};

export default EditCollegePage;
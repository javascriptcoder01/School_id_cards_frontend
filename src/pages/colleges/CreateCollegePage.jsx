import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { School, ArrowLeft } from 'lucide-react';
import {
  createCollegeRequested,
  clearCollegeErrors,
} from '../../features/colleges/collegeSlice.js';
import {
  selectCollegeCreateLoading,
  selectCollegeCreateError,
} from '../../features/colleges/collegeSelectors.js';
import { ROUTES } from '../../constants/routes.js';
import CollegeForm from '../../components/colleges/CollegeForm.jsx';

export const CreateCollegePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isLoading = useSelector(selectCollegeCreateLoading);
  const createError = useSelector(selectCollegeCreateError);

  useEffect(() => {
    return () => {
      dispatch(clearCollegeErrors());
    };
  }, [dispatch]);

  const handleSubmit = (collegeData) => {
    dispatch(
      createCollegeRequested({
        data: collegeData,
        onSuccess: () => {
          navigate(ROUTES.COLLEGES);
        },
      })
    );
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header & Breadcrumbs */}
      <div>
        <Link
          to={ROUTES.COLLEGES}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Colleges Directory</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <School className="w-7 h-7 text-indigo-600" />
          Add New College
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Register a new educational institution to generate student identity cards
        </p>
      </div>

      {/* College Creation Form */}
      <CollegeForm
        isEdit={false}
        isLoading={isLoading}
        errorMessage={createError}
        onSubmit={handleSubmit}
        onCancel={() => navigate(ROUTES.COLLEGES)}
      />
    </div>
  );
};

export default CreateCollegePage;


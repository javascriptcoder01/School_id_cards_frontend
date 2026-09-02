import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  School,
  Building,
  MapPin,
  Mail,
  Phone,
  ArrowLeft,
  Edit3,
  Calendar,
  CheckCircle,
  XCircle,
  Globe,
} from 'lucide-react';
import {
  fetchCollegeByIdRequested,
  fetchMyCollegeRequested,
  clearSelectedCollege,
} from '../../features/colleges/collegeSlice.js';
import {
  selectSelectedCollege,
  selectCollegeDetailLoading,
  selectCollegeDetailError,
} from '../../features/colleges/collegeSelectors.js';
import { selectCurrentUser, selectUserRole } from '../../features/auth/authSelectors.js';
import { ROUTES, getCollegeEditRoute } from '../../constants/routes.js';
import Loader from '../../components/common/Loader.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';

export const CollegeDetailPage = () => {
  const { collegeId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectCurrentUser);
  const userRole = useSelector(selectUserRole);
  const college = useSelector(selectSelectedCollege);
  const isLoading = useSelector(selectCollegeDetailLoading);
  const error = useSelector(selectCollegeDetailError);

  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const isCollegeAdmin = userRole === 'COLLEGE_ADMIN';

  useEffect(() => {
    if (collegeId === 'me' || (isCollegeAdmin && !collegeId)) {
      dispatch(fetchMyCollegeRequested());
    } else if (collegeId) {
      // If COLLEGE_ADMIN tries to view an ID that isn't their own, redirect
      if (isCollegeAdmin && user?.collegeId && user.collegeId !== collegeId) {
        navigate(ROUTES.UNAUTHORIZED, { replace: true });
        return;
      }
      dispatch(fetchCollegeByIdRequested(collegeId));
    }

    return () => {
      dispatch(clearSelectedCollege());
    };
  }, [dispatch, collegeId, isCollegeAdmin, user, navigate]);

  if (isLoading) {
    return <Loader message="Loading college details..." />;
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <Link
              to={ROUTES.COLLEGES}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Directory</span>
            </Link>
          )}
        </div>
        <ErrorMessage message={error} title="College Not Found or Inaccessible" />
      </div>
    );
  }

  if (!college) {
    return null;
  }

  const address = college.address || {};
  const contact = college.contact || {};

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Navigation & Actions Bar */}
      <div className="flex items-center justify-between">
        {isSuperAdmin ? (
          <Link
            to={ROUTES.COLLEGES}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Colleges</span>
          </Link>
        ) : (
          <div />
        )}

        {isSuperAdmin && (
          <Link
            to={getCollegeEditRoute(college._id)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/30 transition-all"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit College</span>
          </Link>
        )}
      </div>

      {/* College Profile Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {college.logo ? (
            <img
              src={college.logo}
              alt={`${college.name} Logo`}
              className="w-20 h-20 rounded-2xl object-contain bg-slate-50 border border-slate-200 p-2 shadow-xs shrink-0"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-indigo-500/20 shrink-0">
              {college.code ? college.code.slice(0, 2) : <School className="w-10 h-10" />}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {college.name}
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${college.isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
              >
                {college.isActive ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    Active Institution
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 text-rose-500" />
                    Inactive Institution
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-slate-700">
                Code: {college.code}
              </span>
              {college.createdAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Registered: {new Date(college.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Mail className="w-5 h-5 text-indigo-600" />
            Contact Details
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500">Official Email:</span>
              <span className="font-medium text-slate-900">
                {contact.email ? (
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-indigo-600 hover:underline"
                  >
                    {contact.email}
                  </a>
                ) : (
                  <span className="text-slate-400 italic">Not provided</span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-t border-slate-50">
              <span className="text-slate-500">Phone Number:</span>
              <span className="font-medium text-slate-900">
                {contact.phone || <span className="text-slate-400 italic">Not provided</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Location & Address Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
            <MapPin className="w-5 h-5 text-emerald-600" />
            Campus Location
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-start justify-between py-1.5">
              <span className="text-slate-500">Street Address:</span>
              <span className="font-medium text-slate-900 text-right max-w-[240px]">
                {[address.line1, address.line2].filter(Boolean).join(', ') || (
                  <span className="text-slate-400 italic">Not provided</span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-t border-slate-50">
              <span className="text-slate-500">City & State:</span>
              <span className="font-medium text-slate-900">
                {[address.city, address.state].filter(Boolean).join(', ') || (
                  <span className="text-slate-400 italic">Not provided</span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-t border-slate-50">
              <span className="text-slate-500">Postal Code & Country:</span>
              <span className="font-medium text-slate-900">
                {[address.postalCode, address.country].filter(Boolean).join(', ') || (
                  <span className="text-slate-400 italic">Not provided</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeDetailPage;


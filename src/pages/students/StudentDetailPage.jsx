import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  GraduationCap,
  User,
  BookOpen,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Edit3,
} from 'lucide-react';
import {
  fetchStudentRequested,
  clearSelectedStudent,
} from '../../features/students/studentSlice.js';
import {
  selectSelectedStudent,
  selectStudentDetailLoading,
  selectStudentDetailError,
} from '../../features/students/studentSelectors.js';
import { ROUTES, getStudentEditRoute } from '../../constants/routes.js';
import Loader from '../../components/common/Loader.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';

export const StudentDetailPage = () => {
  const { studentId } = useParams();
  const dispatch = useDispatch();

  const student = useSelector(selectSelectedStudent);
  const isLoading = useSelector(selectStudentDetailLoading);
  const error = useSelector(selectStudentDetailError);

  useEffect(() => {
    if (studentId) {
      dispatch(fetchStudentRequested(studentId));
    }

    return () => {
      dispatch(clearSelectedStudent());
    };
  }, [dispatch, studentId]);

  if (isLoading) {
    return <Loader message="Loading student details..." />;
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.STUDENTS}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Students</span>
          </Link>
        </div>
        <ErrorMessage message={error} title="Student Not Found or Inaccessible" />
      </div>
    );
  }

  if (!student) {
    return null;
  }

  const address = student.address || {};

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to={ROUTES.STUDENTS}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students Directory</span>
        </Link>

        <Link
          to={getStudentEditRoute(student.id)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/30 transition-all"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Student</span>
        </Link>
      </div>

      {/* Student Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {student.photo ? (
            <img
              src={student.photo}
              alt={`${student.name} photo`}
              className="w-20 h-20 rounded-2xl object-cover bg-slate-50 border border-slate-200 p-1 shadow-xs shrink-0"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-indigo-500/20 shrink-0">
              {student.name ? student.name.slice(0, 2).toUpperCase() : <GraduationCap className="w-10 h-10" />}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {student.name}
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${student.isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
              >
                {student.isActive ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    Active Record
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 text-rose-500" />
                    Inactive Record
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 flex-wrap">
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-slate-700">
                ID: {student.studentId}
              </span>
              <span className="font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                Class: {student.className} {student.section ? `(${student.section})` : ''}
              </span>
              {student.rollNumber && (
                <span className="font-mono bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md text-slate-600">
                  Roll: {student.rollNumber}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic & Personal Details */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Academic & Demographics
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Student ID / Reg No:</span>
              <span className="font-medium text-slate-900 font-mono">{student.studentId}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Class & Section:</span>
              <span className="font-medium text-slate-900">
                {student.className} {student.section ? `(Sec ${student.section})` : ''}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Roll Number:</span>
              <span className="font-medium text-slate-900 font-mono">
                {student.rollNumber || <span className="text-slate-400 italic">Not assigned</span>}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Date of Birth:</span>
              <span className="font-medium text-slate-900">
                {student.dateOfBirth
                  ? new Date(student.dateOfBirth).toLocaleDateString()
                  : <span className="text-slate-400 italic">Not provided</span>}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500">Gender:</span>
              <span className="font-medium text-slate-900 capitalize">
                {student.gender ? student.gender.toLowerCase() : <span className="text-slate-400 italic">Not specified</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Contact & Guardian Details */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Mail className="w-5 h-5 text-purple-600" />
            Contact & Guardian
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Student Email:</span>
              <span className="font-medium text-slate-900">
                {student.email ? (
                  <a href={`mailto:${student.email}`} className="text-indigo-600 hover:underline">
                    {student.email}
                  </a>
                ) : (
                  <span className="text-slate-400 italic">Not provided</span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Student Phone:</span>
              <span className="font-medium text-slate-900">
                {student.phone || <span className="text-slate-400 italic">Not provided</span>}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Guardian Name:</span>
              <span className="font-medium text-slate-900">
                {student.guardianName || <span className="text-slate-400 italic">Not provided</span>}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500">Guardian Phone:</span>
              <span className="font-medium text-slate-900">
                {student.guardianPhone || <span className="text-slate-400 italic">Not provided</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Address Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 md:col-span-2">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
            <MapPin className="w-5 h-5 text-emerald-600" />
            Residential Address
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="sm:col-span-2">
              <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">Street Address</span>
              <span className="font-medium text-slate-900">
                {[address.line1, address.line2].filter(Boolean).join(', ') || (
                  <span className="text-slate-400 italic">Not provided</span>
                )}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">City, State</span>
              <span className="font-medium text-slate-900">
                {[address.city, address.state].filter(Boolean).join(', ') || (
                  <span className="text-slate-400 italic">Not provided</span>
                )}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">Postal Code & Country</span>
              <span className="font-medium text-slate-900">
                {[address.postalCode, address.country].filter(Boolean).join(', ') || (
                  <span className="text-slate-400 italic">Not provided</span>
                )}
              </span>
            </div>

            {student.createdAt && (
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">Record Created</span>
                <span className="font-medium text-slate-700">
                  {new Date(student.createdAt).toLocaleString()}
                </span>
              </div>
            )}

            {student.updatedAt && (
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">Last Updated</span>
                <span className="font-medium text-slate-700">
                  {new Date(student.updatedAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailPage;


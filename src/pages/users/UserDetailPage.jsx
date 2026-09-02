import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Users,
  User,
  Mail,
  Shield,
  Building,
  Calendar,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Edit3,
} from 'lucide-react';
import {
  fetchUserRequested,
  clearSelectedUser,
} from '../../features/users/userSlice.js';
import {
  selectSelectedUser,
  selectUserDetailLoading,
  selectUserDetailError,
} from '../../features/users/userSelectors.js';
import { selectUserRole } from '../../features/auth/authSelectors.js';
import { ROUTES, getUserEditRoute } from '../../constants/routes.js';
import { ROLES } from '../../constants/roles.js';
import Loader from '../../components/common/Loader.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';

export const UserDetailPage = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();

  const userRole = useSelector(selectUserRole);
  const user = useSelector(selectSelectedUser);
  const isLoading = useSelector(selectUserDetailLoading);
  const error = useSelector(selectUserDetailError);

  const isSuperAdmin = userRole === ROLES.SUPER_ADMIN;
  const isCollegeAdmin = userRole === ROLES.COLLEGE_ADMIN;
  const canEdit = isSuperAdmin || isCollegeAdmin;

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserRequested(userId));
    }

    return () => {
      dispatch(clearSelectedUser());
    };
  }, [dispatch, userId]);

  if (isLoading) {
    return <Loader message="Loading user details..." />;
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.USERS}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Users</span>
          </Link>
        </div>
        <ErrorMessage message={error} title="User Not Found or Inaccessible" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const formatRoleLabel = (role) => {
    switch (role) {
      case ROLES.SUPER_ADMIN:
        return 'Super Admin';
      case ROLES.COLLEGE_ADMIN:
        return 'College Admin';
      case ROLES.OPERATOR:
        return 'Operator';
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to={ROUTES.USERS}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Users Directory</span>
        </Link>

        {canEdit && (
          <Link
            to={getUserEditRoute(user.id)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/30 transition-all"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit User</span>
          </Link>
        )}
      </div>

      {/* User Header Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-indigo-500/20 shrink-0">
            {user.name ? user.name.slice(0, 2).toUpperCase() : <User className="w-10 h-10" />}
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {user.name}
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${user.isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
              >
                {user.isActive ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    Active Account
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 text-rose-500" />
                    Inactive Account
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
              <span className="font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                {formatRoleLabel(user.role)}
              </span>
              {user.createdAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Registered: {new Date(user.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
          <Shield className="w-5 h-5 text-indigo-600" />
          Account & Access Specifications
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="flex flex-col gap-1 py-1 border-b border-slate-50 pb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase">Account Name</span>
            <span className="font-medium text-slate-900">{user.name}</span>
          </div>

          <div className="flex flex-col gap-1 py-1 border-b border-slate-50 pb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase">Email Address</span>
            <span className="font-medium text-slate-900">
              <a href={`mailto:${user.email}`} className="text-indigo-600 hover:underline">
                {user.email}
              </a>
            </span>
          </div>

          <div className="flex flex-col gap-1 py-1 border-b border-slate-50 pb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase">Assigned Role</span>
            <span className="font-medium text-slate-900">{formatRoleLabel(user.role)}</span>
          </div>

          <div className="flex flex-col gap-1 py-1 border-b border-slate-50 pb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase">Institution Scope</span>
            <span className="font-medium text-slate-900 font-mono">
              {user.collegeId || <span className="font-sans text-slate-400 italic">System-wide</span>}
            </span>
          </div>

          {user.createdAt && (
            <div className="flex flex-col gap-1 py-1">
              <span className="text-xs font-semibold text-slate-400 uppercase">Account Created</span>
              <span className="font-medium text-slate-700">
                {new Date(user.createdAt).toLocaleString()}
              </span>
            </div>
          )}

          {user.updatedAt && (
            <div className="flex flex-col gap-1 py-1">
              <span className="text-xs font-semibold text-slate-400 uppercase">Last Updated</span>
              <span className="font-medium text-slate-700">
                {new Date(user.updatedAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;


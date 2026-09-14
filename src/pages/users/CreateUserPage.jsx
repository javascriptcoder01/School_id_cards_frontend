import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Users, ArrowLeft } from 'lucide-react';
import {
  createUserRequested,
  clearUserErrors,
} from '../../features/users/userSlice.js';
import {
  selectUserCreateLoading,
  selectUserCreateError,
} from '../../features/users/userSelectors.js';
import { selectUserRole } from '../../features/auth/authSelectors.js';
import { fetchCollegesRequested } from '../../features/colleges/collegeSlice.js';
import { selectCollegesList } from '../../features/colleges/collegeSelectors.js';
import { ROUTES } from '../../constants/routes.js';
import { ROLES } from '../../constants/roles.js';
import UserForm from '../../components/users/UserForm.jsx';

export const CreateUserPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userRole = useSelector(selectUserRole);
  const isLoading = useSelector(selectUserCreateLoading);
  const createError = useSelector(selectUserCreateError);
  const collegesList = useSelector(selectCollegesList);

  const isSuperAdmin = userRole === ROLES.SUPER_ADMIN;

  useEffect(() => {
    if (isSuperAdmin && (!collegesList || collegesList.length === 0)) {
      dispatch(fetchCollegesRequested({ limit: 100, isActive: true }));
    }
    return () => {
      dispatch(clearUserErrors());
    };
  }, [dispatch, isSuperAdmin, collegesList]);

  const handleSubmit = (userData) => {
    dispatch(
      createUserRequested({
        data: userData,
        onSuccess: () => {
          navigate(ROUTES.USERS);
        },
      })
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header & Navigation */}
      <div>
        <Link
          to={ROUTES.USERS}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Users Directory</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Users className="w-7 h-7 text-indigo-600" />
          Create New User
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {isSuperAdmin
            ? 'Provision a new college administrator or operator account'
            : 'Provision a new operator staff account for your institution'}
        </p>
      </div>

      {/* User Creation Form */}
      <UserForm
        isEdit={false}
        isSuperAdmin={isSuperAdmin}
        isLoading={isLoading}
        errorMessage={createError}
        colleges={collegesList}
        onSubmit={handleSubmit}
        onCancel={() => navigate(ROUTES.USERS)}
      />
    </div>
  );
};

export default CreateUserPage;


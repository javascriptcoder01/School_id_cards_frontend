import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Users, ArrowLeft } from 'lucide-react';
import {
  fetchUserRequested,
  updateUserRequested,
  clearUserErrors,
} from '../../features/users/userSlice.js';
import {
  selectSelectedUser,
  selectUserDetailLoading,
  selectUserUpdateLoading,
  selectUserUpdateError,
} from '../../features/users/userSelectors.js';
import { selectUserRole } from '../../features/auth/authSelectors.js';
import { ROUTES, getUserDetailRoute } from '../../constants/routes.js';
import { ROLES } from '../../constants/roles.js';
import UserForm from '../../components/users/UserForm.jsx';
import Loader from '../../components/common/Loader.jsx';

export const EditUserPage = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userRole = useSelector(selectUserRole);
  const user = useSelector(selectSelectedUser);
  const isDetailLoading = useSelector(selectUserDetailLoading);
  const isUpdating = useSelector(selectUserUpdateLoading);
  const updateError = useSelector(selectUserUpdateError);

  const isSuperAdmin = userRole === ROLES.SUPER_ADMIN;

  useEffect(() => {
    if (userId && (!user || user.id !== userId)) {
      dispatch(fetchUserRequested(userId));
    }

    return () => {
      dispatch(clearUserErrors());
    };
  }, [dispatch, userId, user]);

  const handleSubmit = (updateData) => {
    dispatch(
      updateUserRequested({
        id: userId,
        data: updateData,
        onSuccess: () => {
          navigate(getUserDetailRoute(userId));
        },
      })
    );
  };

  if (isDetailLoading) {
    return <Loader message="Loading user details for editing..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header & Navigation */}
      <div>
        <Link
          to={getUserDetailRoute(userId)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to User Details</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Users className="w-7 h-7 text-indigo-600" />
          Edit User Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Update account details and access permissions for {user?.name || 'this user'}
        </p>
      </div>

      {/* User Edit Form */}
      <UserForm
        initialValues={user}
        isEdit={true}
        isSuperAdmin={isSuperAdmin}
        isLoading={isUpdating}
        errorMessage={updateError}
        onSubmit={handleSubmit}
        onCancel={() => navigate(getUserDetailRoute(userId))}
      />
    </div>
  );
};

export default EditUserPage;


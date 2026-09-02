import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  selectIsAuthenticated,
  selectAuthInitialized,
  selectUserRole,
} from '../features/auth/authSelectors.js';
import { ROUTES } from '../constants/routes.js';
import Loader from '../components/common/Loader.jsx';

export const RoleRoute = ({ allowedRoles = [], children }) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const initialized = useSelector(selectAuthInitialized);
  const userRole = useSelector(selectUserRole);

  if (!initialized) {
    return <Loader fullScreen message="Verifying permissions..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && (!userRole || !allowedRoles.includes(userRole))) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return children ? children : <Outlet />;
};

export default RoleRoute;


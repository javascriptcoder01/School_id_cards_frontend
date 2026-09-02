import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAccountRequested,
  clearAccountError,
} from '../../features/account/accountSlice.js';
import {
  selectAccountProfile,
  selectAccountLoading,
  selectAccountError,
  selectIsAccountInitialized,
} from '../../features/account/accountSelectors.js';
import { logout } from '../../features/auth/authSlice.js';
import { ROUTES } from '../../constants/routes.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import PageLoader from '../../components/common/PageLoader.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import AccountProfileCard from '../../components/account/AccountProfileCard.jsx';
import AccountSecurityCard from '../../components/account/AccountSecurityCard.jsx';

export const AccountSettingsPage = () => {
  const dispatch = useDispatch();
  const profile = useSelector(selectAccountProfile);
  const isLoading = useSelector(selectAccountLoading);
  const error = useSelector(selectAccountError);
  const isInitialized = useSelector(selectIsAccountInitialized);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    dispatch(fetchAccountRequested());
  }, [dispatch]);

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    dispatch(logout());
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Account Settings"
        description="View your user identity, institutional role, and active session security status"
        breadcrumbs={[
          { label: 'Dashboard', path: ROUTES.DASHBOARD },
          { label: 'Account Settings', path: null },
        ]}
      />

      {isLoading && !isInitialized && (
        <PageLoader message="Loading your account profile..." />
      )}

      {error && !isInitialized && (
        <ErrorState
          title="Account Profile Error"
          message={error}
          onRetry={() => {
            dispatch(clearAccountError());
            dispatch(fetchAccountRequested());
          }}
        />
      )}

      {(!isLoading || isInitialized) && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <AccountProfileCard profile={profile} />
          <AccountSecurityCard onLogoutClick={() => setShowLogoutConfirm(true)} />
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        open={showLogoutConfirm}
        title="Sign Out of Session"
        message="Are you sure you want to end your current session? You will need your credentials to log back in."
        confirmLabel="Sign Out"
        cancelLabel="Stay Logged In"
        variant="danger"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
};

export default AccountSettingsPage;


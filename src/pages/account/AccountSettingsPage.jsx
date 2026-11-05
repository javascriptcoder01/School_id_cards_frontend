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
import AccountProfileCard from '../../components/account/AccountProfileCard.jsx'
import AccountHeroCard from '../../components/account/AccountHeroCard.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
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
    <div className="mx-auto w-full min-w-0 max-w-6xl space-y-6">
      <PageHeader
        title="My Account"
        breadcrumbs={[
          { label: 'Dashboard', path: ROUTES.DASHBOARD },
          { label: 'My Account', path: null },
        ]}
      />

      {isLoading && !isInitialized && <PageLoader message="Loading your account..." />}

      {error && !isInitialized && (
        <ErrorState
          title="Couldn't load your account"
          message={error}
          onRetry={() => {
            dispatch(clearAccountError());
            dispatch(fetchAccountRequested());
          }}
        />
      )}

      {(!isLoading || isInitialized) && !error && (
        <>
          <AccountHeroCard profile={profile} />

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
            <div className="min-w-0 lg:col-span-2">
              <AccountProfileCard profile={profile} />
            </div>
            <div className="min-w-0">
              <AccountSecurityCard onLogoutClick={() => setShowLogoutConfirm(true)} />
            </div>
          </div>
        </>
      )}

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        open={showLogoutConfirm}
        title="Sign out?"
        message="You will need to log in again to continue."
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
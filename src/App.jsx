import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  restoreSession,
  authInitialized,
  logout,
} from './features/auth/authSlice.js';
import {
  getAuthToken,
  getRefreshToken,
  getUserData,
  clearAuthStorage,
} from './utils/storage.js';
import { setUnauthorizedHandler } from './api/apiClient.js';
import AppRoutes from './routes/AppRoutes.jsx';
import AppErrorBoundary from './components/common/AppErrorBoundary.jsx';
import NotificationContainer from './components/common/NotificationContainer.jsx';

export const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // 1. Configure global 401 handler for API client
    setUnauthorizedHandler(() => {
      dispatch(logout());
    });

    // 2. Restore session from centralized storage on application startup
    try {
      const accessToken = getAuthToken();
      const refreshToken = getRefreshToken();
      const user = getUserData();

      if (accessToken && user && user.id && user.role) {
        dispatch(
          restoreSession({
            user,
            accessToken,
            refreshToken,
          })
        );
      } else if (accessToken || user) {
        // Cleanup inconsistent/invalid storage
        clearAuthStorage();
      }
    } catch {
      clearAuthStorage();
    } finally {
      // Mark auth initialization completed
      dispatch(authInitialized());
    }
  }, [dispatch]);

  return (
    <AppErrorBoundary>
      <AppRoutes />
      <NotificationContainer />
    </AppErrorBoundary>
  );
};

export default App;

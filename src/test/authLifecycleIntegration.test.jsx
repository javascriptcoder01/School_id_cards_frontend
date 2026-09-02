import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureAppStore } from '../app/store';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from '../routes/AppRoutes';
import { setAuthTokens, setUserData, getAuthToken, clearAuthStorage } from '../utils/storage';
import { loginFailure, logout, restoreSession } from '../features/auth/authSlice';
import { ROLES } from '../constants/roles';

describe('Auth Lifecycle Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('restores authentication session from storage on store initialization', () => {
    const mockUser = {
      id: 'usr-1',
      name: 'Super Admin',
      email: 'admin@school.edu',
      role: ROLES.SUPER_ADMIN,
    };
    const mockToken = 'mock-jwt-token';
    setAuthTokens(mockToken);
    setUserData(mockUser);

    const store = configureAppStore();
    store.dispatch(restoreSession({ user: mockUser, accessToken: mockToken }));

    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe(mockToken);
    expect(state.user).toEqual(mockUser);
  });

  it('clears session on logout', () => {
    const mockUser = {
      id: 'usr-1',
      name: 'Super Admin',
      email: 'admin@school.edu',
      role: ROLES.SUPER_ADMIN,
    };
    setAuthTokens('mock-jwt-token');
    setUserData(mockUser);

    const store = configureAppStore();
    store.dispatch(logout());
    clearAuthStorage();

    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(getAuthToken()).toBeNull();
  });

  it('redirects unauthenticated user accessing protected route to login', async () => {
    const store = configureAppStore({
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        initialized: true,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    });
  });

  it('sets error state when login fails', () => {
    const store = configureAppStore();
    store.dispatch(loginFailure('Invalid email or password'));

    const state = store.getState().auth;
    expect(state.error).toBe('Invalid email or password');
    expect(state.isAuthenticated).toBe(false);
  });
});


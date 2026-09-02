import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { configureAppStore } from '../app/store.js';
import RoleRoute from '../routes/RoleRoute.jsx';
import AppRoutes from '../routes/AppRoutes.jsx';
import UnauthorizedPage from '../pages/common/UnauthorizedPage.jsx';

describe('GROUP F — ROUTING & ROLE-BASED AUTHORIZATION', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Unauthenticated user accessing protected route is redirected to /login', async () => {
    const unauthenticatedStore = configureAppStore({
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        initialized: true,
      },
    });

    render(
      <Provider store={unauthenticatedStore}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Sign in to access your administrative dashboard/i)).toBeInTheDocument();
      expect(screen.queryByText(/Welcome back/i)).not.toBeInTheDocument();
    });
  });

  it('2. Authenticated user accessing protected route renders the Dashboard layout and content', async () => {
    const authenticatedStore = configureAppStore({
      auth: {
        user: { id: 'u1', name: 'Super Administrator', email: 'super@admin.com', role: 'SUPER_ADMIN', collegeId: null },
        token: 'valid-token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      },
      dashboard: {
        summary: null,
        activity: [],
        generationStats: null,
        loading: false,
        error: null,
        initialized: true,
      },
    });

    render(
      <Provider store={authenticatedStore}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Super Administrator')).toBeInTheDocument();
      expect(screen.getAllByText(/SUPER_ADMIN/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText('School ID Cards').length).toBeGreaterThan(0);
      expect(screen.getByText(/Super Administrator Control Plane/i)).toBeInTheDocument();
    });
  });

  it('3. RoleRoute blocks user with unauthorized role and redirects to /unauthorized', () => {
    const operatorStore = configureAppStore({
      auth: {
        user: { id: 'u2', name: 'Operator User', role: 'OPERATOR' },
        token: 'op-token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      },
    });

    render(
      <Provider store={operatorStore}>
        <MemoryRouter initialEntries={['/admin-only']}>
          <Routes>
            <Route
              path="/admin-only"
              element={
                <RoleRoute allowedRoles={['SUPER_ADMIN']}>
                  <div>Secret Super Admin Panel</div>
                </RoleRoute>
              }
            />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.queryByText('Secret Super Admin Panel')).not.toBeInTheDocument();
    expect(screen.getByText(/403/i)).toBeInTheDocument();
    expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
  });

  it('4. RoleRoute allows user with matching authorized role', () => {
    const adminStore = configureAppStore({
      auth: {
        user: { id: 'u3', name: 'Super Admin', role: 'SUPER_ADMIN' },
        token: 'admin-token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      },
    });

    render(
      <Provider store={adminStore}>
        <MemoryRouter initialEntries={['/admin-only']}>
          <Routes>
            <Route
              path="/admin-only"
              element={
                <RoleRoute allowedRoles={['SUPER_ADMIN']}>
                  <div>Secret Super Admin Panel</div>
                </RoleRoute>
              }
            />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Secret Super Admin Panel')).toBeInTheDocument();
  });

  it('5. Unknown route renders 404 NotFoundPage', () => {
    const store = configureAppStore({
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        initialized: true,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/some-nonexistent-url-404']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/404/i)).toBeInTheDocument();
    expect(screen.getByText(/Page Not Found/i)).toBeInTheDocument();
  });
});

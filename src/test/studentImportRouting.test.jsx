import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureAppStore } from '../app/store.js';
import AppRoutes from '../routes/AppRoutes.jsx';
import { ROLES } from '../constants/roles.js';

describe('STUDENT BULK IMPORT ROUTING & AUTHORIZATION', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('1. COLLEGE_ADMIN can access /students/import route', async () => {
    const store = configureAppStore({
      auth: {
        user: { id: 'ca1', name: 'College Admin', role: ROLES.COLLEGE_ADMIN, collegeId: 'c1' },
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/students/import']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Student Bulk Import/i })).toBeInTheDocument();
      expect(screen.getByText(/Upload Student Data File/i)).toBeInTheDocument();
    });
  });

  it('2. OPERATOR can access /students/import with operator scope banner', async () => {
    const store = configureAppStore({
      auth: {
        user: { id: 'op1', name: 'Operator', role: ROLES.OPERATOR, className: '10', sectionName: 'A' },
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/students/import']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Student Bulk Import/i })).toBeInTheDocument();
      expect(screen.getByText(/Operator Assignment Scope/i)).toBeInTheDocument();
    });
  });

  it('3. SUPER_ADMIN is blocked from /students/import and redirected to /unauthorized', async () => {
    const store = configureAppStore({
      auth: {
        user: { id: 'sa1', name: 'Super Admin', role: ROLES.SUPER_ADMIN },
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/students/import']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('403')).toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.queryByText(/Student Bulk Import/i)).not.toBeInTheDocument();
    });
  });

  it('4. Unauthenticated user accessing /students/import is redirected to /login', async () => {
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
        <MemoryRouter initialEntries={['/students/import']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /School ID Cards/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    });
  });
});

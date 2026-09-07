import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureAppStore } from '../app/store.js';
import AppRoutes from '../routes/AppRoutes.jsx';
import apiClient from '../api/apiClient.js';
import { ROLES } from '../constants/roles.js';

describe('BATCH 16 — ROLE ACCESS MATRIX', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('1. SUPER_ADMIN can access /colleges directory and /dashboard', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: { colleges: [], pagination: {} } });

    const store = configureAppStore({
      auth: {
        user: { id: 'sa1', name: 'Super Admin', role: ROLES.SUPER_ADMIN },
        token: 'valid-token',
        isAuthenticated: true,
        initialized: true,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/colleges']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Colleges Directory')).toBeInTheDocument();
    });
  });

  it('2. SUPER_ADMIN is blocked from college-scoped /students route (403)', async () => {
    const store = configureAppStore({
      auth: {
        user: { id: 'sa1', name: 'Super Admin', role: ROLES.SUPER_ADMIN },
        token: 'valid-token',
        isAuthenticated: true,
        initialized: true,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/students']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('403')).toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });

  it('3. COLLEGE_ADMIN can access /students directory', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: { students: [], pagination: {} } });

    const store = configureAppStore({
      auth: {
        user: { id: 'ca1', name: 'College Admin', role: ROLES.COLLEGE_ADMIN, collegeId: 'c1' },
        token: 'valid-token',
        isAuthenticated: true,
        initialized: true,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/students']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Students Directory')).toBeInTheDocument();
    });
  });

  it('4. COLLEGE_ADMIN is blocked from super-admin-only /colleges/new route (403)', async () => {
    const store = configureAppStore({
      auth: {
        user: { id: 'ca1', name: 'College Admin', role: ROLES.COLLEGE_ADMIN, collegeId: 'c1' },
        token: 'valid-token',
        isAuthenticated: true,
        initialized: true,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/colleges/new']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('403')).toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });

  it('5. OPERATOR can access /dashboard workspace', async () => {
    const store = configureAppStore({
      auth: {
        user: { id: 'op1', name: 'Operator', role: ROLES.OPERATOR },
        token: 'valid-token',
        isAuthenticated: true,
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
      expect(screen.getByText('Operator Operational Workspace')).toBeInTheDocument();
    });
  });

  it('6. OPERATOR is blocked from /students and /id-cards/generations (403)', async () => {
    const store = configureAppStore({
      auth: {
        user: { id: 'op1', name: 'Operator', role: ROLES.OPERATOR },
        token: 'valid-token',
        isAuthenticated: true,
        initialized: true,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/students']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('403')).toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });

  it('7. UNAUTHENTICATED user accessing protected route is redirected to /login', async () => {
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
      expect(screen.getByRole('heading', { name: /School ID Cards/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    });
  });

  it('8. UNAUTHENTICATED user can access /verify/:token directly without authentication', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        success: true,
        data: {
          verified: true,
          student: { name: 'Priya Sharma' },
          college: { name: 'Oxford' },
        },
      },
    });

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
        <MemoryRouter initialEntries={['/verify/qr-public-123']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Official Verification Portal')).toBeInTheDocument();
    });
  });
});


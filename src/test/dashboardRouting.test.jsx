import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureAppStore } from '../app/store.js';
import AppRoutes from '../routes/AppRoutes.jsx';
import apiClient from '../api/apiClient.js';
import { ROLES } from '../constants/roles.js';

describe('DASHBOARD ROUTING & ROLE EXPERIENCES', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('1. SUPER_ADMIN accesses /dashboard and renders SuperAdminDashboard', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        colleges: [{ id: 'c1', name: 'Harvard' }],
        users: [{ id: 'u1', name: 'Super Admin' }],
        templates: [{ id: 't1', name: 'Template 1' }],
        pagination: { total: 1 },
      },
    });

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
        <MemoryRouter initialEntries={['/dashboard']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Super Administrator Control Plane')).toBeInTheDocument();
      expect(screen.getByText('Affiliated Colleges')).toBeInTheDocument();
      expect(screen.getByText('Provisioned Users')).toBeInTheDocument();
    });
  });

  it('2. COLLEGE_ADMIN accesses /dashboard and renders CollegeAdminDashboard', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        students: [{ id: 's1', name: 'Student 1' }],
        templates: [{ id: 't1', name: 'Template 1' }],
        generations: [{ id: 'g1', templateName: 'Template 1', status: 'COMPLETED' }],
        pagination: { total: 1 },
      },
    });

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
        <MemoryRouter initialEntries={['/dashboard']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('College Administrator Workspace')).toBeInTheDocument();
      expect(screen.getByText('Total Students')).toBeInTheDocument();
      expect(screen.getByText('ID Card Generation Lifecycle')).toBeInTheDocument();
    });
  });

  it('3. OPERATOR accesses /dashboard and renders OperatorDashboard', async () => {
    const store = configureAppStore({
      auth: {
        user: { id: 'op1', name: 'Operator User', role: ROLES.OPERATOR },
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
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
      expect(screen.getByText('Operational Status')).toBeInTheDocument();
    });
  });

  it('4. Unauthenticated user accessing /dashboard is redirected to /login', async () => {
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
});

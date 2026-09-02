import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureAppStore } from '../app/store.js';
import DashboardPage from '../pages/dashboard/DashboardPage.jsx';
import apiClient from '../api/apiClient.js';
import { ROLES } from '../constants/roles.js';
import { clearDashboard } from '../features/dashboard/dashboardSlice.js';

describe('DASHBOARD ROLE ACCESS & TENANT ISOLATION', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('1. SUPER_ADMIN sees only global platform capabilities and quick actions', async () => {
    vi.spyOn(apiClient, 'get').mockImplementation((url) => {
      if (url === '/colleges') return Promise.resolve({ data: { colleges: [], pagination: { total: 12 } } });
      if (url === '/users') return Promise.resolve({ data: { users: [], pagination: { total: 40 } } });
      if (url === '/templates') return Promise.resolve({ data: { templates: [], pagination: { total: 8 } } });
      return Promise.resolve({ data: {} });
    });

    const store = configureAppStore({
      auth: {
        user: { id: 'sa1', name: 'Super Admin', role: ROLES.SUPER_ADMIN },
        token: 'token_sa',
        isAuthenticated: true,
        initialized: true,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Super Administrator Control Plane')).toBeInTheDocument();
      expect(screen.getByText('Affiliated Colleges')).toBeInTheDocument();
      expect(screen.getByText('Register College')).toBeInTheDocument();
    });

    // Should NOT see college-specific widgets
    expect(screen.queryByText('ID Card Generation Lifecycle')).not.toBeInTheDocument();
    expect(screen.queryByText('Add Student')).not.toBeInTheDocument();
  });

  it('2. COLLEGE_ADMIN sees only college-scoped capabilities and generation stats', async () => {
    vi.spyOn(apiClient, 'get').mockImplementation((url) => {
      if (url === '/students') return Promise.resolve({ data: { students: [], pagination: { total: 350 } } });
      if (url === '/templates') return Promise.resolve({ data: { templates: [], pagination: { total: 4 } } });
      if (url === '/id-cards/generations') {
        return Promise.resolve({
          data: {
            generations: [
              { id: 'g1', templateName: 'Campus ID', status: 'COMPLETED', studentCount: 50 },
            ],
            pagination: { total: 1 },
          },
        });
      }
      if (url === '/id-cards/summary') {
        return Promise.resolve({
          data: {
            summary: {
              totalGenerations: 1,
              completed: 1,
              pending: 0,
              processing: 0,
              failed: 0,
              totalStudentsRequested: 50,
              totalStudentCompleted: 50,
              totalStudentFailed: 0,
            },
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    const store = configureAppStore({
      auth: {
        user: { id: 'ca1', name: 'College Admin', role: ROLES.COLLEGE_ADMIN, collegeId: 'c101' },
        token: 'token_ca',
        isAuthenticated: true,
        initialized: true,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('College Administrator Workspace')).toBeInTheDocument();
      expect(screen.getByText('Total Students')).toBeInTheDocument();
      expect(screen.getByText('Add Student')).toBeInTheDocument();
      expect(screen.getByText('Bulk Import')).toBeInTheDocument();
    });

    // Should NOT see super admin quick actions
    expect(screen.queryByText('Register College')).not.toBeInTheDocument();
  });

  it('3. OPERATOR sees only read-only status and safe public actions', async () => {
    const store = configureAppStore({
      auth: {
        user: { id: 'op1', name: 'Operator User', role: ROLES.OPERATOR },
        token: 'token_op',
        isAuthenticated: true,
        initialized: true,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Operator Operational Workspace')).toBeInTheDocument();
      expect(screen.getByText('Verify ID Card')).toBeInTheDocument();
      expect(screen.getByText('My Account')).toBeInTheDocument();
    });

    // Should NOT see administrative actions
    expect(screen.queryByText('Register College')).not.toBeInTheDocument();
    expect(screen.queryByText('Add Student')).not.toBeInTheDocument();
    expect(screen.queryByText('Bulk Import')).not.toBeInTheDocument();
    expect(screen.queryByText('Generate Cards')).not.toBeInTheDocument();
  });

  it('4. User logout purges dashboard state completely', () => {
    const store = configureAppStore({
      dashboard: {
        dashboardType: 'COLLEGE_ADMIN',
        summary: { totalStudents: 999 },
        activity: [{ title: 'Secret Job' }],
        generationStats: { total: 10 },
        loading: false,
        error: null,
        initialized: true,
      },
    });

    expect(store.getState().dashboard.summary).not.toBeNull();
    store.dispatch(clearDashboard());
    expect(store.getState().dashboard.summary).toBeNull();
    expect(store.getState().dashboard.activity).toEqual([]);
    expect(store.getState().dashboard.initialized).toBe(false);
  });
});


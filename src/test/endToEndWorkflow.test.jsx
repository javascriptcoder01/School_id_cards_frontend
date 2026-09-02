import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureAppStore } from '../app/store';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from '../routes/AppRoutes';
import apiClient from '../api/apiClient';
import { ROLES } from '../constants/roles';

describe('End-to-End Workflow Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders Public QR Verification page for unauthenticated external visitor', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        success: true,
        data: {
          verified: true,
          student: { name: 'Aarav Sharma' },
          college: { name: 'St. Xavier' },
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
        <MemoryRouter initialEntries={['/verify/test-token-123']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Official Verification Portal/i)).toBeInTheDocument();
    });
  });

  it('renders College Admin workspace and output view for authenticated college admin', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        success: true,
        data: {
          generation: { id: 'gen-123', status: 'COMPLETED' },
          results: [],
        },
      },
    });

    const adminUser = {
      id: 'usr-col-1',
      name: 'College Admin User',
      email: 'admin@college.edu',
      role: ROLES.COLLEGE_ADMIN,
      collegeId: 'col-123',
    };

    const store = configureAppStore({
      auth: {
        user: adminUser,
        token: 'valid-admin-token',
        isAuthenticated: true,
        initialized: true,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/id-cards/generations/gen-123/output']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Generated ID Card Outputs/i)).toBeInTheDocument();
    });
  });
});


import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureAppStore } from '../app/store.js';
import AppRoutes from '../routes/AppRoutes.jsx';
import apiClient from '../api/apiClient.js';
import { ROLES } from '../constants/roles.js';

describe('BATCH 16 — DIRECT ROUTE NAVIGATION & REFRESH RESILIENCE', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('1. Direct navigation to student detail page loads student details correctly', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        student: {
          id: 'stu-99',
          name: 'Aarav Patel',
          studentId: 'STU-0099',
          className: '12th Grade',
          email: 'aarav@college.edu',
          isActive: true,
        },
      },
    });

    const store = configureAppStore({
      auth: {
        user: { id: 'ca1', name: 'College Admin', role: ROLES.COLLEGE_ADMIN, collegeId: 'c1' },
        token: 'token',
        isAuthenticated: true,
        initialized: true,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/students/stu-99']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Aarav Patel' })).toBeInTheDocument();
      expect(screen.getByText('STU-0099')).toBeInTheDocument();
      expect(screen.getByText('Back to Students Directory')).toBeInTheDocument();
    });
  });

  it('2. Direct navigation to generation output page renders output options', async () => {
    const store = configureAppStore({
      auth: {
        user: { id: 'ca1', name: 'College Admin', role: ROLES.COLLEGE_ADMIN, collegeId: 'c1' },
        token: 'token',
        isAuthenticated: true,
        initialized: true,
      },
      idCardGeneration: {
        generations: [],
        selectedGeneration: { id: 'gen-88', status: 'COMPLETED', studentCount: 5 },
        results: null,
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        filters: { status: '', templateId: '', studentId: '' },
        loading: { list: false, detail: false, create: false, process: false, results: false },
        error: null,
      },
      idCardOutput: {
        downloadStatus: 'IDLE',
        downloadingType: null,
        currentDownload: null,
        error: null,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/id-cards/generations/gen-88/output']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Generated ID Card Outputs/i })).toBeInTheDocument();
      expect(screen.getByText(/Complete ID Cards ZIP Package/i)).toBeInTheDocument();
    });
  });

  it('3. Direct navigation to unknown URL renders 404 NotFoundPage', async () => {
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
        <MemoryRouter initialEntries={['/completely-unknown-route-404']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    });
  });

  it('4. Direct navigation to unauthorized URL renders 403 Access Denied', async () => {
    const store = configureAppStore({
      auth: {
        user: { id: 'op1', name: 'Operator', role: ROLES.OPERATOR },
        token: 'token',
        isAuthenticated: true,
        initialized: true,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/operator-assignments']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('403')).toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });
});


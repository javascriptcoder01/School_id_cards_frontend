import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureAppStore } from '../app/store.js';
import AppRoutes from '../routes/AppRoutes.jsx';
import { ROLES } from '../constants/roles.js';

describe('ID CARD OUTPUT ROUTING & ACCESS CONTROL', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('1. COLLEGE_ADMIN can access /id-cards/generations/:id/output', async () => {
    const store = configureAppStore({
      auth: {
        user: { id: 'ca1', name: 'College Admin', role: ROLES.COLLEGE_ADMIN, collegeId: 'c1' },
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      },
      idCardGeneration: {
        generations: [],
        selectedGeneration: {
          id: 'gen-123456',
          status: 'COMPLETED',
          studentCount: 1,
        },
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
        <MemoryRouter initialEntries={['/id-cards/generations/gen-123456/output']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Generated ID Card Outputs/i })).toBeInTheDocument();
      expect(screen.getByText(/Complete ID Cards ZIP Package/i)).toBeInTheDocument();
    });
  });

  it('2. SUPER_ADMIN is blocked from /id-cards/generations/:id/output and redirected to /unauthorized', async () => {
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
        <MemoryRouter initialEntries={['/id-cards/generations/gen-123456/output']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('403')).toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });

  it('3. OPERATOR is blocked from /id-cards/generations/:id/output and redirected to /unauthorized', async () => {
    const store = configureAppStore({
      auth: {
        user: { id: 'op1', name: 'Operator', role: ROLES.OPERATOR },
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/id-cards/generations/gen-123456/output']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('403')).toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });

  it('4. Unauthenticated user accessing /id-cards/generations/:id/output is redirected to /login', async () => {
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
        <MemoryRouter initialEntries={['/id-cards/generations/gen-123456/output']}>
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

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureAppStore } from '../app/store.js';
import AppRoutes from '../routes/AppRoutes.jsx';
import { ROLES } from '../constants/roles.js';

describe('ID CARD GENERATION ROUTING & ACCESS CONTROL', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('1. COLLEGE_ADMIN can access /id-cards/generations', async () => {
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
        <MemoryRouter initialEntries={['/id-cards/generations']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /ID Card Generation Jobs/i })).toBeInTheDocument();
      expect(screen.getByText(/New Generation Job/i)).toBeInTheDocument();
    });
  });

  it('2. COLLEGE_ADMIN can access /id-cards/generations/new', async () => {
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
        <MemoryRouter initialEntries={['/id-cards/generations/new']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Create ID Card Generation Job/i })).toBeInTheDocument();
      expect(screen.getByText(/Select ID Card Template/i)).toBeInTheDocument();
    });
  });

  it('3. SUPER_ADMIN is blocked from /id-cards/generations and redirected to /unauthorized', async () => {
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
        <MemoryRouter initialEntries={['/id-cards/generations']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('403')).toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.queryByText(/ID Card Generation Jobs/i)).not.toBeInTheDocument();
    });
  });

  it('4. OPERATOR is blocked from /id-cards/generations and redirected to /unauthorized', async () => {
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
        <MemoryRouter initialEntries={['/id-cards/generations']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('403')).toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.queryByText(/ID Card Generation Jobs/i)).not.toBeInTheDocument();
    });
  });
});

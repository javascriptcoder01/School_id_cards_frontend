import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureAppStore } from '../app/store.js';
import AppRoutes from '../routes/AppRoutes.jsx';
import apiClient from '../api/apiClient.js';

describe('GROUP G — COLLEGE ROUTING & AUTHORIZATION', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('1. SUPER_ADMIN can access /colleges list route', async () => {
    const mockCollege = { _id: 'col-1', name: 'Delhi College', code: 'DC01', isActive: true };
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        colleges: [mockCollege],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
    });

    const store = configureAppStore({
      auth: {
        user: { id: 'sa1', name: 'Super Admin', role: 'SUPER_ADMIN' },
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
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
      expect(screen.getByText('Add College')).toBeInTheDocument();
      expect(screen.getByText('Delhi College')).toBeInTheDocument();
    });
  });

  it('2. SUPER_ADMIN can access /colleges/new creation route', async () => {
    const store = configureAppStore({
      auth: {
        user: { id: 'sa1', name: 'Super Admin', role: 'SUPER_ADMIN' },
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
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
      expect(screen.getByRole('heading', { name: /Add New College/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/College Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/College Code/i)).toBeInTheDocument();
    });
  });

  it('3. OPERATOR role is blocked from /colleges and redirected to /unauthorized', async () => {
    const store = configureAppStore({
      auth: {
        user: { id: 'op1', name: 'Operator', role: 'OPERATOR' },
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
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
      expect(screen.getByText('403')).toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.queryByText('Colleges Directory')).not.toBeInTheDocument();
    });
  });

  it('4. COLLEGE_ADMIN role is blocked from /colleges/new creation route', async () => {
    const store = configureAppStore({
      auth: {
        user: { id: 'ca1', name: 'College Admin', role: 'COLLEGE_ADMIN', collegeId: 'my-col-id' },
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
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
      expect(screen.queryByText(/Add New College/i)).not.toBeInTheDocument();
    });
  });

  it('5. Static route /colleges/new does not get interpreted as dynamic ID route', async () => {
    const store = configureAppStore({
      auth: {
        user: { id: 'sa1', name: 'Super Admin', role: 'SUPER_ADMIN' },
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
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
      expect(screen.getByRole('heading', { name: /Add New College/i })).toBeInTheDocument();
      expect(screen.queryByText(/Campus Location/i)).not.toBeInTheDocument();
    });
  });
});

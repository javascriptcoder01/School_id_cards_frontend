import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureAppStore } from '../app/store.js';
import AppRoutes from '../routes/AppRoutes.jsx';
import apiClient from '../api/apiClient.js';

describe('GROUP F — USER ROUTING & AUTHORIZATION', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('1. SUPER_ADMIN can access /users list route', async () => {
    const mockUser = {
      id: 'u1',
      name: 'Managed User',
      email: 'user@col.edu',
      role: 'COLLEGE_ADMIN',
      isActive: true,
    };

    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        users: [mockUser],
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
        <MemoryRouter initialEntries={['/users']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Users Directory')).toBeInTheDocument();
      expect(screen.getByText('Add User')).toBeInTheDocument();
      expect(screen.getByText('Managed User')).toBeInTheDocument();
    });
  });

  it('2. COLLEGE_ADMIN can access /users list route', async () => {
    const mockUser = {
      id: 'u2',
      name: 'College Operator',
      email: 'op@col.edu',
      role: 'OPERATOR',
      isActive: true,
    };

    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        users: [mockUser],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
    });

    const store = configureAppStore({
      auth: {
        user: { id: 'ca1', name: 'College Admin', role: 'COLLEGE_ADMIN', collegeId: 'c1' },
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/users']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Users Directory')).toBeInTheDocument();
      expect(screen.getByText('College Operator')).toBeInTheDocument();
    });
  });

  it('3. OPERATOR role is blocked from /users and redirected to /unauthorized', async () => {
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
        <MemoryRouter initialEntries={['/users']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('403')).toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.queryByText('Users Directory')).not.toBeInTheDocument();
    });
  });

  it('4. SUPER_ADMIN can access /users/new creation route', async () => {
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
        <MemoryRouter initialEntries={['/users/new']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Create New User/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Target College ID/i)).toBeInTheDocument();
    });
  });

  it('5. Static route /users/new does not get interpreted as dynamic ID route', async () => {
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
        <MemoryRouter initialEntries={['/users/new']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Create New User/i })).toBeInTheDocument();
      expect(screen.queryByText(/Account & Access Specifications/i)).not.toBeInTheDocument();
    });
  });
});

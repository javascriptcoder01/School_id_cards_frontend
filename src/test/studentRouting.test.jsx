import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureAppStore } from '../app/store.js';
import AppRoutes from '../routes/AppRoutes.jsx';
import apiClient from '../api/apiClient.js';
import { ROLES } from '../constants/roles.js';

describe('GROUP G — STUDENT ROUTING & AUTHORIZATION', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('1. COLLEGE_ADMIN can access /students directory route', async () => {
    const mockStudent = {
      id: 's1',
      studentId: 'STU-001',
      name: 'Rohan Verma',
      className: '10th',
      isActive: true,
    };

    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        students: [mockStudent],
        pagination: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
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
        <MemoryRouter initialEntries={['/students']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Students Directory')).toBeInTheDocument();
      expect(screen.getByText('Add Student')).toBeInTheDocument();
      expect(screen.getByText('Rohan Verma')).toBeInTheDocument();
    });
  });

  it('2. COLLEGE_ADMIN can access /students/new creation route', async () => {
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
        <MemoryRouter initialEntries={['/students/new']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Register New Student/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Student ID/i)).toBeInTheDocument();
    });
  });

  it('3. SUPER_ADMIN role is blocked from /students and redirected to /unauthorized', async () => {
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
        <MemoryRouter initialEntries={['/students']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('403')).toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.queryByText('Students Directory')).not.toBeInTheDocument();
    });
  });

  it('4. OPERATOR role is blocked from /students and redirected to /unauthorized', async () => {
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
        <MemoryRouter initialEntries={['/students']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('403')).toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.queryByText('Students Directory')).not.toBeInTheDocument();
    });
  });

  it('5. Static route /students/new does not get interpreted as dynamic student ID', async () => {
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
        <MemoryRouter initialEntries={['/students/new']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Register New Student/i })).toBeInTheDocument();
      expect(screen.queryByText(/Student Profile Details/i)).not.toBeInTheDocument();
    });
  });
});

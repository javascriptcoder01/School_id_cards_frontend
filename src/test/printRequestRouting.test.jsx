import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../routes/AppRoutes.jsx';
import { ROLES } from '../constants/roles.js';
import { ROUTES } from '../constants/routes.js';
import authReducer from '../features/auth/authSlice.js';
import appReducer from '../store/slices/appSlice.js';
import printRequestReducer from '../features/printRequests/printRequestSlice.js';
import dashboardReducer from '../features/dashboard/dashboardSlice.js';

describe('PRINT REQUEST ROUTING & ROLE GUARDS', () => {
  const createStoreWithRole = (role) =>
    configureStore({
      reducer: {
        auth: authReducer,
        app: appReducer,
        printRequests: printRequestReducer,
        dashboard: dashboardReducer,
      },
      preloadedState: {
        auth: {
          user: { id: 'u-1', role, collegeId: role !== ROLES.SUPER_ADMIN ? 'col-1' : null },
          token: 'mock-token',
          isAuthenticated: true,
          initialized: true,
        },
        app: { sidebarOpen: true },
        printRequests: {
          list: [],
          selectedRequest: null,
          status: 'idle',
        },
      },
    });

  it('1. Operator accesses /print-requests successfully', async () => {
    const store = createStoreWithRole(ROLES.OPERATOR);
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[ROUTES.PRINT_REQUESTS]}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    expect(await screen.findByText('My Print Requests')).toBeInTheDocument();
  });

  it('2. College Admin accesses /print-requests successfully', async () => {
    const store = createStoreWithRole(ROLES.COLLEGE_ADMIN);
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[ROUTES.PRINT_REQUESTS]}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    expect(await screen.findByText('College Print Request Queue')).toBeInTheDocument();
  });

  it('3. Super Admin accesses /admin/print-requests successfully', async () => {
    const store = createStoreWithRole(ROLES.SUPER_ADMIN);
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[ROUTES.ADMIN_PRINT_REQUESTS]}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    expect(await screen.findByText('Central ID Card Print Center')).toBeInTheDocument();
  });

  it('4. Operator cannot access /admin/print-requests and is shown Unauthorized', async () => {
    const store = createStoreWithRole(ROLES.OPERATOR);
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[ROUTES.ADMIN_PRINT_REQUESTS]}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    expect(await screen.findByText(/Access Denied|Unauthorized/i)).toBeInTheDocument();
  });
});


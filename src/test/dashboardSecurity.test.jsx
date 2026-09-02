import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureAppStore } from '../app/store.js';
import DashboardPage from '../pages/dashboard/DashboardPage.jsx';
import apiClient from '../api/apiClient.js';
import { ROLES } from '../constants/roles.js';

describe('DASHBOARD SECURITY & PRIVACY SANITIZATION', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('1. Tokens and sensitive secrets are not exposed in Dashboard DOM markup', async () => {
    const sensitiveToken = 'super-secret-jwt-token-dashboard-999';
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        colleges: [{ id: 'c1', name: 'MIT', __v: 0, internalSecret: 'secret_123' }],
        users: [{ id: 'u1', name: 'Admin', role: 'SUPER_ADMIN' }],
        templates: [],
        pagination: { total: 1 },
      },
    });

    const store = configureAppStore({
      auth: {
        user: { id: 'sa1', name: 'Super Admin', role: ROLES.SUPER_ADMIN },
        token: sensitiveToken,
        refreshToken: 'refresh-secret-token-dashboard-999',
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      },
    });

    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(container.innerHTML).toContain('Affiliated Colleges');
    });

    expect(container.innerHTML).not.toContain(sensitiveToken);
    expect(container.innerHTML).not.toContain('refresh-secret-token-dashboard-999');
    expect(container.innerHTML).not.toContain('internalSecret');
    expect(container.innerHTML).not.toContain('__v');
  });

  it('2. Backend stack traces and raw errors are not leaked on dashboard failure', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValue({
      response: { status: 500, data: { message: 'Database query timeout at MongoDB.find /server/db.js:99' } },
      message: 'AxiosError: Internal Server Error',
      stack: 'Error: AxiosError\n    at settle (/node_modules/axios/lib/core/settle.js:19:12)',
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

    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(container.innerHTML).toContain('Dashboard Analytics Error');
    });

    expect(container.innerHTML).not.toContain('MongoDB.find');
    expect(container.innerHTML).not.toContain('/server/db.js');
    expect(container.innerHTML).not.toContain('settle.js');
  });
});


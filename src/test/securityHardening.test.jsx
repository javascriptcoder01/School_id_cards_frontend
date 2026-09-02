import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureAppStore } from '../app/store.js';
import AppRoutes from '../routes/AppRoutes.jsx';
import AppErrorBoundary from '../components/common/AppErrorBoundary.jsx';
import apiClient from '../api/apiClient.js';
import { ROLES } from '../constants/roles.js';

describe('FRONTEND SECURITY & PRIVACY HARDENING', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => { });
    vi.spyOn(console, 'error').mockImplementation(() => { });
  });

  it('1. Tokens, secrets, and auth headers are never rendered in App markup', async () => {
    const sensitiveToken = 'bearer-jwt-super-secret-production-999';
    const store = configureAppStore({
      auth: {
        user: { id: 'sa1', name: 'Super Admin', role: ROLES.SUPER_ADMIN },
        token: sensitiveToken,
        refreshToken: 'refresh-jwt-super-secret-production-888',
        isAuthenticated: true,
        initialized: true,
      },
    });

    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        colleges: [{ id: 'c1', name: 'Harvard', __v: 0 }],
        users: [{ id: 'u1', name: 'Admin One', role: 'SUPER_ADMIN' }],
        templates: [],
        pagination: { total: 1 },
      },
    });

    const { container } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Super Administrator Control Plane')).toBeInTheDocument();
    });

    expect(container.innerHTML).not.toContain(sensitiveToken);
    expect(container.innerHTML).not.toContain('refresh-jwt-super-secret-production-888');
    expect(container.innerHTML).not.toContain('Authorization: Bearer');
    expect(container.innerHTML).not.toContain('__v');
  });

  it('2. AppErrorBoundary suppresses stack traces and raw error messages from DOM', () => {
    const DangerousCrash = () => {
      const err = new Error('Sensitive SQL/Mongo Crash: DB_PASS=secret123 at /server/auth.js:88');
      err.stack = 'Error: at /server/auth.js:88\n at MongoDriver.query';
      throw err;
    };

    const { container } = render(
      <AppErrorBoundary>
        <DangerousCrash />
      </AppErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(container.innerHTML).not.toContain('DB_PASS');
    expect(container.innerHTML).not.toContain('secret123');
    expect(container.innerHTML).not.toContain('/server/auth.js');
    expect(container.innerHTML).not.toContain('MongoDriver');
  });
});


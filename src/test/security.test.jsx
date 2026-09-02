import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureAppStore } from '../app/store.js';
import DashboardPage from '../pages/dashboard/DashboardPage.jsx';
import Header from '../components/layout/Header.jsx';
import { ROLES, ROLE_VALUES } from '../constants/roles.js';
import { normalizeApiError } from '../api/apiError.js';

describe('GROUP H — SECURITY & SANITIZATION', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Role constants in frontend strictly match backend constants', () => {
    expect(ROLES.SUPER_ADMIN).toBe('SUPER_ADMIN');
    expect(ROLES.COLLEGE_ADMIN).toBe('COLLEGE_ADMIN');
    expect(ROLES.OPERATOR).toBe('OPERATOR');
    expect(ROLE_VALUES).toEqual(['SUPER_ADMIN', 'COLLEGE_ADMIN', 'OPERATOR']);
  });

  it('2. Sensitive tokens (accessToken, refreshToken) are never rendered anywhere in the UI', () => {
    const sensitiveAccessToken = 'super-secret-access-token-1234567890';
    const sensitiveRefreshToken = 'super-secret-refresh-token-9876543210';

    const store = configureAppStore({
      auth: {
        user: { id: 'u1', name: 'Secure User', email: 'user@school.edu', role: 'SUPER_ADMIN', collegeId: null },
        token: sensitiveAccessToken,
        refreshToken: sensitiveRefreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      },
    });

    const { container: dashboardContainer } = render(
      <Provider store={store}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </Provider>
    );

    expect(dashboardContainer.innerHTML).not.toContain(sensitiveAccessToken);
    expect(dashboardContainer.innerHTML).not.toContain(sensitiveRefreshToken);

    const { container: headerContainer } = render(
      <Provider store={store}>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </Provider>
    );

    expect(headerContainer.innerHTML).not.toContain(sensitiveAccessToken);
    expect(headerContainer.innerHTML).not.toContain(sensitiveRefreshToken);
  });

  it('3. Error normalizer strips Axios config, request details, and server stack traces', () => {
    const dangerousAxiosError = {
      config: {
        url: '/auth/login',
        headers: { Authorization: 'Bearer raw-secret' },
        data: '{"password":"mypassword"}',
      },
      request: {
        responseURL: 'http://localhost:5000/api/auth/login',
      },
      response: {
        status: 500,
        data: {
          message: 'Database query crash',
          stack: 'Error: Database query crash\n  at /server/app.js:123:45',
        },
      },
      stack: 'AxiosError: Request failed with status code 500',
    };

    const normalized = normalizeApiError(dangerousAxiosError);
    expect(normalized).not.toHaveProperty('config');
    expect(normalized).not.toHaveProperty('request');
    expect(normalized).not.toHaveProperty('stack');
    expect(normalized.message).toBe('Database query crash');
  });
});


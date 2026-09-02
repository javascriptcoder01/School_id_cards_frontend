import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import AccountProfileCard from '../components/account/AccountProfileCard.jsx';
import AccountSettingsPage from '../pages/account/AccountSettingsPage.jsx';
import { configureAppStore } from '../app/store.js';
import accountReducer, { fetchAccountSucceeded } from '../features/account/accountSlice.js';

describe('ACCOUNT SECURITY & DATA SANITIZATION', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Reducer strips sensitive fields (password, passwordHash, token, __v) upon success', () => {
    const maliciousPayload = {
      id: 'u1',
      name: 'Legit User',
      email: 'user@school.edu',
      role: 'OPERATOR',
      collegeId: 'col_1',
      isActive: true,
      password: 'plain_password_123',
      passwordHash: '$2b$10$hashed_secret_password',
      accessToken: 'jwt_secret_access_token',
      refreshToken: 'jwt_secret_refresh_token',
      __v: 0,
      internalSecret: 'db_secret_key',
    };

    const state = accountReducer(undefined, fetchAccountSucceeded(maliciousPayload));

    expect(state.profile).not.toHaveProperty('password');
    expect(state.profile).not.toHaveProperty('passwordHash');
    expect(state.profile).not.toHaveProperty('accessToken');
    expect(state.profile).not.toHaveProperty('refreshToken');
    expect(state.profile).not.toHaveProperty('__v');
    expect(state.profile).not.toHaveProperty('internalSecret');
  });

  it('2. AccountProfileCard DOM does not render tokens or database metadata', () => {
    const profile = {
      id: 'u1',
      name: 'John Doe',
      email: 'john@school.edu',
      role: 'COLLEGE_ADMIN',
      collegeId: 'col_999',
      isActive: true,
    };

    const { container } = render(<AccountProfileCard profile={profile} />);

    expect(container.innerHTML).not.toContain('Authorization:');
    expect(container.innerHTML).not.toContain('Bearer');
    expect(container.innerHTML).not.toContain('password');
    expect(container.innerHTML).not.toContain('__v');
  });

  it('3. AccountSettingsPage does not expose tokens or Axios configs in DOM', () => {
    const sensitiveToken = 'super-secret-jwt-token-account-page-888';
    const store = configureAppStore({
      auth: {
        user: { id: 'u1', name: 'Admin', role: 'SUPER_ADMIN' },
        token: sensitiveToken,
        isAuthenticated: true,
        initialized: true,
      },
      account: {
        profile: {
          id: 'u1',
          name: 'Super Admin',
          email: 'admin@school.edu',
          role: 'SUPER_ADMIN',
          collegeId: null,
          isActive: true,
        },
        loading: false,
        error: null,
        initialized: true,
      },
    });

    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <AccountSettingsPage />
        </MemoryRouter>
      </Provider>
    );

    expect(container.innerHTML).not.toContain(sensitiveToken);
    expect(container.innerHTML).not.toContain('AxiosError');
    expect(container.innerHTML).not.toContain('MongoServerError');
  });
});


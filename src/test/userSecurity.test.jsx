import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureAppStore } from '../app/store.js';
import UserListPage from '../pages/users/UserListPage.jsx';
import UserDetailPage from '../pages/users/UserDetailPage.jsx';
import { ROLES } from '../constants/roles.js';

describe('GROUP G — USER SECURITY & TENANT ISOLATION', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Auth tokens and passwords are never exposed in UserListPage or UserDetailPage markup', () => {
    const sensitiveToken = 'super-secret-jwt-token-user-999';
    const store = configureAppStore({
      auth: {
        user: { id: 'sa1', name: 'Super Admin', role: ROLES.SUPER_ADMIN },
        token: sensitiveToken,
        refreshToken: 'refresh-token-user-999',
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      },
      users: {
        users: [
          {
            id: 'u-sec-1',
            name: 'Security Test User',
            email: 'sec@user.com',
            role: ROLES.OPERATOR,
            isActive: true,
          },
        ],
        selectedUser: {
          id: 'u-sec-1',
          name: 'Security Test User',
          email: 'sec@user.com',
          role: ROLES.OPERATOR,
          isActive: true,
        },
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        filters: { search: '', role: '', isActive: '', collegeId: '' },
        list: { isLoading: false, error: null },
        detail: { isLoading: false, error: null },
        create: { isLoading: false, error: null, success: false },
        update: { isLoading: false, error: null, success: false },
        statusUpdate: { isLoading: false, error: null, success: false },
      },
    });

    const { container: listContainer } = render(
      <Provider store={store}>
        <MemoryRouter>
          <UserListPage />
        </MemoryRouter>
      </Provider>
    );

    expect(listContainer.innerHTML).not.toContain(sensitiveToken);
    expect(listContainer.innerHTML).not.toContain('refresh-token-user-999');

    const { container: detailContainer } = render(
      <Provider store={store}>
        <MemoryRouter>
          <UserDetailPage />
        </MemoryRouter>
      </Provider>
    );

    expect(detailContainer.innerHTML).not.toContain(sensitiveToken);
    expect(detailContainer.innerHTML).not.toContain('refresh-token-user-999');
  });

  it('2. MongoDB internal __v and passwordHash are not rendered anywhere in user detail view', () => {
    const store = configureAppStore({
      auth: {
        user: { id: 'sa1', name: 'Super Admin', role: ROLES.SUPER_ADMIN },
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      },
      users: {
        selectedUser: {
          id: 'u1',
          name: 'Clean User',
          email: 'clean@user.com',
          role: ROLES.OPERATOR,
          __v: 0,
          passwordHash: '$2b$10$hashedstringthatmustneverrender',
          isActive: true,
        },
        detail: { isLoading: false, error: null },
      },
    });

    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <UserDetailPage />
        </MemoryRouter>
      </Provider>
    );

    expect(container.innerHTML).not.toContain('__v');
    expect(container.innerHTML).not.toContain('$2b$10$hashedstringthatmustneverrender');
  });
});


import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureAppStore } from '../app/store.js';
import CollegeListPage from '../pages/colleges/CollegeListPage.jsx';
import CollegeDetailPage from '../pages/colleges/CollegeDetailPage.jsx';

describe('GROUP H — COLLEGE SECURITY & SAFE DATA HANDLING', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Tokens are never exposed in CollegeListPage or CollegeDetailPage markup', () => {
    const sensitiveToken = 'super-secret-jwt-token-college-999';
    const store = configureAppStore({
      auth: {
        user: { id: 'sa1', name: 'Super Admin', role: 'SUPER_ADMIN' },
        token: sensitiveToken,
        refreshToken: 'refresh-secret-999',
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      },
      colleges: {
        colleges: [
          {
            _id: 'col-secret-1',
            name: 'Security Test College',
            code: 'STC01',
            isActive: true,
          },
        ],
        selectedCollege: {
          _id: 'col-secret-1',
          name: 'Security Test College',
          code: 'STC01',
          isActive: true,
        },
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        filters: { search: '', isActive: '' },
      },
    });

    const { container: listContainer } = render(
      <Provider store={store}>
        <MemoryRouter>
          <CollegeListPage />
        </MemoryRouter>
      </Provider>
    );

    expect(listContainer.innerHTML).not.toContain(sensitiveToken);
    expect(listContainer.innerHTML).not.toContain('refresh-secret-999');

    const { container: detailContainer } = render(
      <Provider store={store}>
        <MemoryRouter>
          <CollegeDetailPage />
        </MemoryRouter>
      </Provider>
    );

    expect(detailContainer.innerHTML).not.toContain(sensitiveToken);
    expect(detailContainer.innerHTML).not.toContain('refresh-secret-999');
  });

  it('2. MongoDB internal __v is not rendered anywhere in college detail view', () => {
    const store = configureAppStore({
      auth: {
        user: { id: 'sa1', name: 'Super Admin', role: 'SUPER_ADMIN' },
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      },
      colleges: {
        selectedCollege: {
          _id: 'col-1',
          name: 'Clean College',
          code: 'CC01',
          __v: 0,
          isActive: true,
        },
      },
    });

    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <CollegeDetailPage />
        </MemoryRouter>
      </Provider>
    );

    expect(container.innerHTML).not.toContain('__v');
  });
});


import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureAppStore } from '../app/store.js';
import TemplateDetailPage from '../pages/templates/TemplateDetailPage.jsx';
import { ROLES } from '../constants/roles.js';

describe('TEMPLATE SECURITY & DATA SANITIZATION', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Tokens and sensitive secrets are not exposed in TemplateDetailPage markup', () => {
    const sensitiveToken = 'super-secret-jwt-token-template-mgmt-999';
    const store = configureAppStore({
      auth: {
        user: { id: 'ca1', name: 'College Admin', role: ROLES.COLLEGE_ADMIN, collegeId: 'c1' },
        token: sensitiveToken,
        refreshToken: 'refresh-secret-token-template-999',
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      },
      templates: {
        templates: [],
        selectedTemplate: {
          id: 'tpl-1',
          name: 'Annual ID Card',
          orientation: 'PORTRAIT',
          width: 86,
          height: 54,
          fields: [{ field: 'name', label: 'Student Name', x: 10, y: 20, fontSize: 12, fontWeight: 'NORMAL' }],
          isActive: true,
        },
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        filters: { search: '', collegeId: '' },
        loading: { list: false, detail: false, create: false, update: false, status: false },
        error: null,
      },
    });

    const { container } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/templates/tpl-1']}>
          <TemplateDetailPage />
        </MemoryRouter>
      </Provider>
    );

    expect(container.innerHTML).not.toContain(sensitiveToken);
    expect(container.innerHTML).not.toContain('refresh-secret-token-template-999');
  });

  it('2. Mongo internal __v and raw server stack traces are not exposed in Template views', () => {
    const store = configureAppStore({
      auth: {
        user: { id: 'ca1', name: 'College Admin', role: ROLES.COLLEGE_ADMIN, collegeId: 'c1' },
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      },
      templates: {
        templates: [],
        selectedTemplate: {
          id: 'tpl-1',
          name: 'Annual ID Card',
          orientation: 'PORTRAIT',
          width: 86,
          height: 54,
          fields: [],
          isActive: true,
          __v: 0,
          stack: 'Error: at line 42 inside internal Mongo driver',
        },
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        filters: { search: '', collegeId: '' },
        loading: { list: false, detail: false, create: false, update: false, status: false },
        error: null,
      },
    });

    const { container } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/templates/tpl-1']}>
          <TemplateDetailPage />
        </MemoryRouter>
      </Provider>
    );

    expect(container.innerHTML).not.toContain('__v');
    expect(container.innerHTML).not.toContain('inside internal Mongo driver');
  });
});


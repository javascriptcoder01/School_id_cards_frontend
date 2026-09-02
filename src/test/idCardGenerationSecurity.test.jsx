import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureAppStore } from '../app/store.js';
import GenerationDetailPage from '../pages/idCardGeneration/GenerationDetailPage.jsx';
import { ROLES } from '../constants/roles.js';

describe('ID CARD GENERATION SECURITY & DATA SANITIZATION', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Tokens and sensitive secrets are not exposed in GenerationDetailPage markup', () => {
    const sensitiveToken = 'super-secret-jwt-token-idcard-generation-999';
    const store = configureAppStore({
      auth: {
        user: { id: 'ca1', name: 'College Admin', role: ROLES.COLLEGE_ADMIN, collegeId: 'c1' },
        token: sensitiveToken,
        refreshToken: 'refresh-secret-token-generation-999',
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      },
      idCardGeneration: {
        generations: [],
        selectedGeneration: {
          id: 'gen-123456',
          templateName: 'Standard ID Card',
          studentCount: 1,
          status: 'COMPLETED',
        },
        results: null,
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        filters: { status: '', templateId: '', studentId: '' },
        loading: { list: false, detail: false, create: false, process: false, results: false },
        error: null,
      },
    });

    const { container } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/id-cards/generations/gen-123456']}>
          <GenerationDetailPage />
        </MemoryRouter>
      </Provider>
    );

    expect(container.innerHTML).not.toContain(sensitiveToken);
    expect(container.innerHTML).not.toContain('refresh-secret-token-generation-999');
  });

  it('2. Mongo internal __v and raw server stack traces are not exposed in generation views', () => {
    const store = configureAppStore({
      auth: {
        user: { id: 'ca1', name: 'College Admin', role: ROLES.COLLEGE_ADMIN, collegeId: 'c1' },
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      },
      idCardGeneration: {
        generations: [],
        selectedGeneration: {
          id: 'gen-123456',
          templateName: 'Standard ID Card',
          studentCount: 1,
          status: 'FAILED',
          __v: 0,
          stack: 'Error: at line 99 inside worker process ID generator',
        },
        results: null,
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        filters: { status: '', templateId: '', studentId: '' },
        loading: { list: false, detail: false, create: false, process: false, results: false },
        error: null,
      },
    });

    const { container } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/id-cards/generations/gen-123456']}>
          <GenerationDetailPage />
        </MemoryRouter>
      </Provider>
    );

    expect(container.innerHTML).not.toContain('__v');
    expect(container.innerHTML).not.toContain('inside worker process ID generator');
  });
});


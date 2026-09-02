import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureAppStore } from '../app/store.js';
import GenerationOutputPage from '../pages/idCardOutput/GenerationOutputPage.jsx';
import idCardOutputReducer from '../features/idCardOutput/idCardOutputSlice.js';
import { ROLES } from '../constants/roles.js';

describe('ID CARD OUTPUT SECURITY & DATA SANITIZATION', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Redux idCardOutput slice never stores binary blobs or base64 strings', () => {
    const state = idCardOutputReducer(undefined, { type: '@@INIT' });
    expect(state).not.toHaveProperty('blob');
    expect(state).not.toHaveProperty('buffer');
    expect(state).not.toHaveProperty('bytes');
    expect(state).not.toHaveProperty('base64');
  });

  it('2. Tokens and sensitive secrets are not exposed in GenerationOutputPage markup', () => {
    const sensitiveToken = 'super-secret-jwt-token-idcard-output-999';
    const store = configureAppStore({
      auth: {
        user: { id: 'ca1', name: 'College Admin', role: ROLES.COLLEGE_ADMIN, collegeId: 'c1' },
        token: sensitiveToken,
        refreshToken: 'refresh-secret-token-output-999',
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      },
      idCardGeneration: {
        generations: [],
        selectedGeneration: {
          id: 'gen-123456',
          status: 'COMPLETED',
          studentCount: 1,
        },
        results: {
          results: [{ studentId: 's1', studentName: 'Aarav Patel', status: 'COMPLETED' }],
        },
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        filters: { status: '', templateId: '', studentId: '' },
        loading: { list: false, detail: false, create: false, process: false, results: false },
        error: null,
      },
      idCardOutput: {
        downloadStatus: 'IDLE',
        downloadingType: null,
        currentDownload: null,
        error: null,
      },
    });

    const { container } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/id-cards/generations/gen-123456/output']}>
          <GenerationOutputPage />
        </MemoryRouter>
      </Provider>
    );

    expect(container.innerHTML).not.toContain(sensitiveToken);
    expect(container.innerHTML).not.toContain('refresh-secret-token-output-999');
  });

  it('3. Internal server filesystem paths and stack traces are not leaked in output views', () => {
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
          status: 'COMPLETED',
          studentCount: 1,
          serverPath: '/var/www/idcards/internal/generated_temp.zip',
          stack: 'Error: at line 45 internal generator path leaked',
        },
        results: null,
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        filters: { status: '', templateId: '', studentId: '' },
        loading: { list: false, detail: false, create: false, process: false, results: false },
        error: null,
      },
      idCardOutput: {
        downloadStatus: 'IDLE',
        downloadingType: null,
        currentDownload: null,
        error: null,
      },
    });

    const { container } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/id-cards/generations/gen-123456/output']}>
          <GenerationOutputPage />
        </MemoryRouter>
      </Provider>
    );

    expect(container.innerHTML).not.toContain('/var/www/idcards/internal');
    expect(container.innerHTML).not.toContain('internal generator path leaked');
  });
});


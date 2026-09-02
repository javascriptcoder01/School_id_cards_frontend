import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureAppStore } from '../app/store.js';
import StudentBulkImportPage from '../pages/students/StudentBulkImportPage.jsx';
import { ROLES } from '../constants/roles.js';

describe('STUDENT BULK IMPORT SECURITY', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Tokens and sensitive secrets are not exposed in StudentBulkImportPage markup', () => {
    const sensitiveToken = 'super-secret-jwt-token-bulk-import-999';
    const store = configureAppStore({
      auth: {
        user: { id: 'ca1', name: 'College Admin', role: ROLES.COLLEGE_ADMIN, collegeId: 'c1' },
        token: sensitiveToken,
        refreshToken: 'refresh-secret-token-bulk-import-999',
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      },
      studentImport: {
        file: 'students.csv',
        status: 'COMPLETED',
        importResult: {
          totalRecords: 10,
          successCount: 8,
          failedCount: 2,
          errors: [
            { row: 2, field: 'name', message: 'Name invalid' },
            { row: 5, field: 'email', message: 'Email duplicate' },
          ],
        },
        loading: false,
        error: null,
      },
    });

    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <StudentBulkImportPage />
        </MemoryRouter>
      </Provider>
    );

    expect(container.innerHTML).not.toContain(sensitiveToken);
    expect(container.innerHTML).not.toContain('refresh-secret-token-bulk-import-999');
  });

  it('2. Mongo internal __v, stack traces, and passwords are not rendered in errors table', () => {
    const store = configureAppStore({
      auth: {
        user: { id: 'ca1', name: 'College Admin', role: ROLES.COLLEGE_ADMIN, collegeId: 'c1' },
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      },
      studentImport: {
        file: 'students.xlsx',
        status: 'COMPLETED',
        importResult: {
          totalRecords: 1,
          successCount: 0,
          failedCount: 1,
          errors: [
            {
              row: 1,
              field: 'studentId',
              message: 'Validation failed',
              __v: 0,
              passwordHash: '$2b$10$verysecretpasswordhashtobehidden',
              stack: 'Error: at line 42 at node:internal',
            },
          ],
        },
        loading: false,
        error: null,
      },
    });

    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <StudentBulkImportPage />
        </MemoryRouter>
      </Provider>
    );

    expect(container.innerHTML).not.toContain('__v');
    expect(container.innerHTML).not.toContain('$2b$10$verysecretpasswordhashtobehidden');
    expect(container.innerHTML).not.toContain('node:internal');
  });
});


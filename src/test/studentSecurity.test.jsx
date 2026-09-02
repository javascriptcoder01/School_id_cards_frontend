import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureAppStore } from '../app/store.js';
import StudentListPage from '../pages/students/StudentListPage.jsx';
import StudentDetailPage from '../pages/students/StudentDetailPage.jsx';
import { ROLES } from '../constants/roles.js';

describe('GROUP H — STUDENT SECURITY & TENANT ISOLATION', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Auth tokens are never exposed in StudentListPage or StudentDetailPage markup', () => {
    const sensitiveToken = 'super-secret-jwt-token-student-888';
    const store = configureAppStore({
      auth: {
        user: { id: 'ca1', name: 'College Admin', role: ROLES.COLLEGE_ADMIN, collegeId: 'c1' },
        token: sensitiveToken,
        refreshToken: 'refresh-token-student-888',
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      },
      students: {
        students: [
          {
            id: 's-sec-1',
            studentId: 'STU-SEC-1',
            name: 'Security Test Student',
            className: '10th Grade',
            isActive: true,
          },
        ],
        selectedStudent: {
          id: 's-sec-1',
          studentId: 'STU-SEC-1',
          name: 'Security Test Student',
          className: '10th Grade',
          isActive: true,
        },
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        filters: { search: '' },
        loading: {
          list: false,
          detail: false,
          create: false,
          update: false,
          statusUpdate: false,
        },
        errors: {
          list: null,
          detail: null,
          create: null,
          update: null,
          statusUpdate: null,
        },
      },
    });

    const { container: listContainer } = render(
      <Provider store={store}>
        <MemoryRouter>
          <StudentListPage />
        </MemoryRouter>
      </Provider>
    );

    expect(listContainer.innerHTML).not.toContain(sensitiveToken);
    expect(listContainer.innerHTML).not.toContain('refresh-token-student-888');

    const { container: detailContainer } = render(
      <Provider store={store}>
        <MemoryRouter>
          <StudentDetailPage />
        </MemoryRouter>
      </Provider>
    );

    expect(detailContainer.innerHTML).not.toContain(sensitiveToken);
    expect(detailContainer.innerHTML).not.toContain('refresh-token-student-888');
  });

  it('2. MongoDB internal __v and system metadata are not rendered in student detail view', () => {
    const store = configureAppStore({
      auth: {
        user: { id: 'ca1', name: 'College Admin', role: ROLES.COLLEGE_ADMIN, collegeId: 'c1' },
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      },
      students: {
        selectedStudent: {
          id: 's1',
          studentId: 'STU-001',
          name: 'Clean Student',
          className: '12th',
          __v: 0,
          passwordHash: '$2b$10$hashedstringthatmustneverrender',
          isActive: true,
        },
        loading: { detail: false },
        errors: { detail: null },
      },
    });

    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <StudentDetailPage />
        </MemoryRouter>
      </Provider>
    );

    expect(container.innerHTML).not.toContain('__v');
    expect(container.innerHTML).not.toContain('$2b$10$hashedstringthatmustneverrender');
  });
});


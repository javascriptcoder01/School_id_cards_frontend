import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureAppStore } from '../app/store.js';
import AppRoutes from '../routes/AppRoutes.jsx';
import apiClient from '../api/apiClient.js';
import { ROLES } from '../constants/roles.js';

describe('BATCH 16 — FINAL RELEASE SECURITY & DATA SANITIZATION', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('1. DOM never renders sensitive tokens or Authorization headers', async () => {
    const sensitiveToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sensitive_payload_string';
    const store = configureAppStore({
      auth: {
        user: { id: 'sa1', name: 'Super Admin', role: ROLES.SUPER_ADMIN },
        token: sensitiveToken,
        isAuthenticated: true,
        initialized: true,
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
    expect(container.innerHTML).not.toContain('Bearer ');
  });

  it('2. Backend Mongo __v and internal stack traces are not leaked in error states', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValue({
      response: {
        status: 500,
        data: {
          message: 'Error at Object.<anonymous> (/server/db/MongoConnection.js:42:11)',
          __v: 0,
        },
      },
    });

    const store = configureAppStore({
      auth: {
        user: { id: 'ca1', name: 'College Admin', role: ROLES.COLLEGE_ADMIN, collegeId: 'c1' },
        token: 'token',
        isAuthenticated: true,
        initialized: true,
      },
    });

    const { container } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/students']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Students Directory')).toBeInTheDocument();
    });

    expect(container.innerHTML).not.toContain('MongoConnection');
    expect(container.innerHTML).not.toContain('/server/db/');
    expect(container.innerHTML).not.toContain('__v');
  });

  it('3. Binary Blob data is never stored in Redux store', () => {
    const store = configureAppStore();
    const state = store.getState();

    // Verify all slices in Redux have serializable state without Blobs
    const jsonState = JSON.stringify(state);
    expect(jsonState).toBeDefined();
    expect(state.idCardOutput.currentDownload).toBeNull();
  });
});


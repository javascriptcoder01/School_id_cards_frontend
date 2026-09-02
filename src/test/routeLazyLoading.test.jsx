import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureAppStore } from '../app/store.js';
import AppRoutes from '../routes/AppRoutes.jsx';
import RouteLoader from '../components/common/RouteLoader.jsx';
import { ROLES } from '../constants/roles.js';
import apiClient from '../api/apiClient.js';

describe('ROUTE-LEVEL LAZY LOADING & SUSPENSE BOUNDARIES', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('1. RouteLoader renders with appropriate accessible status semantics', () => {
    render(<RouteLoader message="Custom loading test..." />);
    const statusElem = screen.getByRole('status');
    expect(statusElem).toBeInTheDocument();
    expect(statusElem).toHaveAttribute('aria-live', 'polite');
    expect(statusElem).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Custom loading test...')).toBeInTheDocument();
  });

  it('2. Lazy public login route resolves and renders login interface', async () => {
    const store = configureAppStore({
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        initialized: true,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/login']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /School ID Cards/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    });
  });

  it('3. Lazy public verification route resolves and renders verification page', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        success: true,
        data: {
          verified: true,
          student: { studentId: 'STU-100', name: 'Priya Sharma' },
          college: { name: 'Oxford College' },
          generatedAt: '2026-08-31T18:45:00.000Z',
        },
      },
    });

    const store = configureAppStore({
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        initialized: true,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/verify/test-qr-token-123']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Official Verification Portal')).toBeInTheDocument();
      expect(screen.getByText('ID Card Authenticity Verified')).toBeInTheDocument();
    });
  });

  it('4. Lazy protected dashboard route resolves for authenticated SUPER_ADMIN', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        colleges: [{ id: 'c1', name: 'MIT' }],
        users: [{ id: 'u1', name: 'Super Admin' }],
        templates: [],
        pagination: { total: 1 },
      },
    });

    const store = configureAppStore({
      auth: {
        user: { id: 'sa1', name: 'Super Admin', role: ROLES.SUPER_ADMIN },
        token: 'token_sa',
        isAuthenticated: true,
        initialized: true,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Super Administrator Control Plane')).toBeInTheDocument();
    });
  });
});


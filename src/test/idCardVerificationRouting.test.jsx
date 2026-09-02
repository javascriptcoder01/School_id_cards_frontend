import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureAppStore } from '../app/store.js';
import AppRoutes from '../routes/AppRoutes.jsx';
import apiClient from '../api/apiClient.js';

describe('ID CARD VERIFICATION PUBLIC ROUTING', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('1. Unauthenticated user can access /verify/:token without being redirected to /login', async () => {
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
        isLoading: false,
        error: null,
        initialized: true,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/verify/valid-qr-token-abc']}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    // Should render PublicVerificationPage
    await waitFor(() => {
      expect(screen.getByText('Official Verification Portal')).toBeInTheDocument();
      expect(screen.getByText('ID Card Authenticity Verified')).toBeInTheDocument();
      expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
    });

    // Must not show login form
    expect(screen.queryByRole('heading', { name: /School ID Cards Login/i })).not.toBeInTheDocument();
  });
});

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { configureAppStore } from '../app/store.js';
import PublicVerificationPage from '../pages/idCardVerification/PublicVerificationPage.jsx';
import idCardVerificationReducer from '../features/idCardVerification/idCardVerificationSlice.js';
import apiClient from '../api/apiClient.js';

describe('ID CARD VERIFICATION SECURITY & PRIVACY SANITIZATION', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('1. Redux idCardVerification state never stores tokens or internal IDs', () => {
    const state = idCardVerificationReducer(undefined, { type: '@@INIT' });
    expect(state).not.toHaveProperty('token');
    expect(state).not.toHaveProperty('qrPayload');
    expect(state).not.toHaveProperty('jwt');
  });

  it('2. Raw token and internal MongoDB fields are not exposed in PublicVerificationPage markup', async () => {
    const rawQrToken = 'secret-raw-qr-verification-token-999';
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        success: true,
        data: {
          verified: true,
          student: { studentId: 'STU-100', name: 'Aarav Patel', _id: 'mongo123', internalDbPath: '/db/students' },
          college: { name: 'Stanford University', _id: 'col123' },
          generatedAt: '2026-08-31T18:45:00.000Z',
        },
      },
    });

    const store = configureAppStore();

    const { container } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[`/verify/${rawQrToken}`]}>
          <Routes>
            <Route path="/verify/:token" element={<PublicVerificationPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(container.innerHTML).toContain('Aarav Patel');
    });

    // The raw token and internal DB fields must NOT be rendered in the body/DOM
    expect(container.innerHTML).not.toContain(rawQrToken);
    expect(container.innerHTML).not.toContain('mongo123');
    expect(container.innerHTML).not.toContain('col123');
    expect(container.innerHTML).not.toContain('/db/students');
  });

  it('3. Internal server errors and stack traces are not leaked on failure', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValue({
      response: {
        status: 404,
        data: { message: 'Database connection failed at MongoDB.connect internal/db.js:88' },
      },
      message: 'AxiosError: Request failed with status code 404',
      stack: 'Error: AxiosError\n    at settle (axios.js:123)',
    });

    const store = configureAppStore();

    const { container } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/verify/invalid-token']}>
          <Routes>
            <Route path="/verify/:token" element={<PublicVerificationPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(container.innerHTML).toContain('Verification Failed');
    });

    expect(container.innerHTML).toContain('ID card verification record not found or invalid.');
    expect(container.innerHTML).not.toContain('AxiosError');
    expect(container.innerHTML).not.toContain('MongoDB.connect');
    expect(container.innerHTML).not.toContain('internal/db.js');
    expect(container.innerHTML).not.toContain('settle (axios.js');
  });
});


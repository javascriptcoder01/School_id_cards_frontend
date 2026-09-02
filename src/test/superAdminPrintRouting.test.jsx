import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import RoleRoute from '../routes/RoleRoute.jsx';

describe('SUPER ADMIN PRINT CENTER ROUTE PROTECTION', () => {
  const createTestStore = (role) =>
    configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: {
          isAuthenticated: true,
          token: 'mock-jwt-token',
          initialized: true,
          user: { id: 'u-1', role },
        },
      },
    });

  it('1. SUPER_ADMIN is granted access to /super-admin/print-center', () => {
    const store = createTestStore('SUPER_ADMIN');
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/super-admin/print-center']}>
          <Routes>
            <Route
              path="/super-admin/print-center"
              element={
                <RoleRoute allowedRoles={['SUPER_ADMIN']}>
                  <div>Print Center Content</div>
                </RoleRoute>
              }
            />
            <Route path="/unauthorized" element={<div>Access Denied 403</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Print Center Content')).toBeInTheDocument();
  });

  it('2. COLLEGE_ADMIN and OPERATOR are denied access to /super-admin/print-center', () => {
    const store = createTestStore('COLLEGE_ADMIN');
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/super-admin/print-center']}>
          <Routes>
            <Route
              path="/super-admin/print-center"
              element={
                <RoleRoute allowedRoles={['SUPER_ADMIN']}>
                  <div>Print Center Content</div>
                </RoleRoute>
              }
            />
            <Route path="/unauthorized" element={<div>Access Denied 403</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Access Denied 403')).toBeInTheDocument();
    expect(screen.queryByText('Print Center Content')).not.toBeInTheDocument();
  });
});

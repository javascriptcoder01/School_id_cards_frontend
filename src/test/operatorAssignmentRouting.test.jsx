import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import RoleRoute from '../routes/RoleRoute.jsx';

describe('OPERATOR ASSIGNMENT ROUTE GUARDS', () => {
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

  it('1. COLLEGE_ADMIN is granted access to /operator-assignments route', () => {
    const store = createTestStore('COLLEGE_ADMIN');
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/operator-assignments']}>
          <Routes>
            <Route
              path="/operator-assignments"
              element={
                <RoleRoute allowedRoles={['COLLEGE_ADMIN']}>
                  <div>Operator Assignments Protected Content</div>
                </RoleRoute>
              }
            />
            <Route path="/unauthorized" element={<div>Access Denied 403</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Operator Assignments Protected Content')).toBeInTheDocument();
  });

  it('2. OPERATOR is denied access to /operator-assignments route and redirected', () => {
    const store = createTestStore('OPERATOR');
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/operator-assignments']}>
          <Routes>
            <Route
              path="/operator-assignments"
              element={
                <RoleRoute allowedRoles={['COLLEGE_ADMIN']}>
                  <div>Operator Assignments Protected Content</div>
                </RoleRoute>
              }
            />
            <Route path="/unauthorized" element={<div>Access Denied 403</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Access Denied 403')).toBeInTheDocument();
    expect(screen.queryByText('Operator Assignments Protected Content')).not.toBeInTheDocument();
  });
});


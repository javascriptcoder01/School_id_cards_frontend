import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureAppStore } from '../app/store.js';
import LoginPage from '../pages/auth/LoginPage.jsx';
import Header from '../components/layout/Header.jsx';
import Sidebar from '../components/layout/Sidebar.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import Loader from '../components/common/Loader.jsx';

describe('GROUP G — UI FOUNDATION & COMPONENTS', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. LoginPage displays validation errors on submitting empty fields', () => {
    const store = configureAppStore({
      auth: { user: null, token: null, isAuthenticated: false, isLoading: false, error: null, initialized: true },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </Provider>
    );

    const submitBtn = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Email address is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
  });

  it('2. LoginPage displays validation error on malformed email format', () => {
    const store = configureAppStore({
      auth: { user: null, token: null, isAuthenticated: false, isLoading: false, error: null, initialized: true },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </Provider>
    );

    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'not-an-email' } });

    const submitBtn = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Please provide a valid email address/i)).toBeInTheDocument();
  });

  it('3. LoginPage shows loading indicator and disables submit button when isLoading is true', () => {
    const store = configureAppStore({
      auth: { user: null, token: null, isAuthenticated: false, isLoading: true, error: null, initialized: true },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/Authenticating.../i)).toBeInTheDocument();
    const submitBtn = screen.getByRole('button');
    expect(submitBtn).toBeDisabled();
    expect(screen.getByLabelText(/Email Address/i)).toBeDisabled();
    expect(screen.getByLabelText(/Password/i)).toBeDisabled();
  });

  it('4. ErrorMessage safely renders string and object messages without leaking objects', () => {
    const { rerender } = render(<ErrorMessage message="Direct error string" />);
    expect(screen.getByText('Direct error string')).toBeInTheDocument();

    rerender(<ErrorMessage message={{ message: 'Extracted message from object' }} />);
    expect(screen.getByText('Extracted message from object')).toBeInTheDocument();
  });

  it('5. Loader component supports inline and full-screen modes', () => {
    const { rerender } = render(<Loader message="Processing data..." />);
    expect(screen.getByText('Processing data...')).toBeInTheDocument();

    rerender(<Loader fullScreen message="Loading entire screen..." />);
    expect(screen.getByText('Loading entire screen...')).toBeInTheDocument();
  });

  it('6. Header displays user name and role badge', () => {
    const store = configureAppStore({
      auth: {
        user: { id: 'u1', name: 'John College Admin', role: 'COLLEGE_ADMIN' },
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('John College Admin')).toBeInTheDocument();
    expect(screen.getByText('COLLEGE_ADMIN')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign out/i })).toBeInTheDocument();
  });

  it('7. Sidebar renders Batch 1 Dashboard navigation link', () => {
    const store = configureAppStore({
      auth: {
        user: { id: 'u1', name: 'Admin', role: 'SUPER_ADMIN' },
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText(/School ID Cards/i)).toBeInTheDocument();
  });
});

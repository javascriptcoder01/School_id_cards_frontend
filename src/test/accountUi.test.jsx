import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import AccountProfileCard from '../components/account/AccountProfileCard.jsx';
import AccountSecurityCard from '../components/account/AccountSecurityCard.jsx';
import AccountSettingsPage from '../pages/account/AccountSettingsPage.jsx';
import { configureAppStore } from '../app/store.js';

describe('ACCOUNT UI COMPONENTS', () => {
  it('1. AccountProfileCard renders name, email, role, and active status', () => {
    const profile = {
      id: 'u1',
      name: 'Sarah Connor',
      email: 'sarah@school.edu',
      role: 'SUPER_ADMIN',
      collegeId: null,
      isActive: true,
    };

    render(<AccountProfileCard profile={profile} />);

    expect(screen.getAllByText('Sarah Connor').length).toBeGreaterThan(0);
    expect(screen.getAllByText('sarah@school.edu').length).toBeGreaterThan(0);
    expect(screen.getByText('SUPER_ADMIN')).toBeInTheDocument();
    expect(screen.getByText('Platform Wide (Global)')).toBeInTheDocument();
    expect(screen.getByText('Active & Verified')).toBeInTheDocument();
  });

  it('2. AccountProfileCard renders fallback when profile is empty', () => {
    render(<AccountProfileCard profile={null} />);
    expect(screen.getByText('Profile details not available.')).toBeInTheDocument();
  });

  it('3. AccountSecurityCard renders security policies and triggers onLogoutClick', () => {
    const onLogoutClick = vi.fn();
    render(<AccountSecurityCard onLogoutClick={onLogoutClick} />);

    expect(screen.getByText('Security & Session Management')).toBeInTheDocument();
    expect(screen.getByText(/Institutional Account Governance/i)).toBeInTheDocument();
    expect(screen.getByText(/Authentication Protocol/i)).toBeInTheDocument();

    const logoutBtn = screen.getByRole('button', { name: /Sign Out/i });
    fireEvent.click(logoutBtn);
    expect(onLogoutClick).toHaveBeenCalledTimes(1);
  });

  it('4. AccountSettingsPage renders and handles logout dialog', () => {
    const store = configureAppStore({
      auth: {
        user: { id: 'u1', name: 'Admin', role: 'SUPER_ADMIN' },
        isAuthenticated: true,
        initialized: true,
      },
      account: {
        profile: {
          id: 'u1',
          name: 'Admin User',
          email: 'admin@school.edu',
          role: 'SUPER_ADMIN',
          collegeId: null,
          isActive: true,
        },
        loading: false,
        error: null,
        initialized: true,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <AccountSettingsPage />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByRole('heading', { level: 1, name: 'My Account Settings' })).toBeInTheDocument();
    expect(screen.getAllByText('Admin User').length).toBeGreaterThan(0);

    // Click sign out button in security card
    const signOutBtn = screen.getByRole('button', { name: /Sign Out/i });
    fireEvent.click(signOutBtn);

    // Confirm dialog should appear
    expect(screen.getByText('Sign Out of Session')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Stay Logged In' })).toBeInTheDocument();

    // Confirm sign out
    const dialogConfirmBtn = screen.getAllByRole('button', { name: 'Sign Out' }).find(
      (btn) => btn.closest('[role="dialog"]')
    );
    fireEvent.click(dialogConfirmBtn);

    // Auth state should be logged out
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });
});


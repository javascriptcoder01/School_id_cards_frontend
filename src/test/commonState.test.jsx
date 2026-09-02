import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import NotFoundState from '../components/common/NotFoundState.jsx';
import UnauthorizedState from '../components/common/UnauthorizedState.jsx';

describe('COMMON UI STATE COMPONENTS', () => {
  it('1. EmptyState renders title, description, and optional action', () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        title="No Colleges Found"
        description="Try adjusting your search criteria."
        actionLabel="Register College"
        onAction={onAction}
      />
    );

    expect(screen.getByText('No Colleges Found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search criteria.')).toBeInTheDocument();
    const actionBtn = screen.getByRole('button', { name: 'Register College' });
    fireEvent.click(actionBtn);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('2. ErrorState renders title, message, and retry button', () => {
    const onRetry = vi.fn();
    render(
      <ErrorState
        title="Network Error"
        message="Unable to communicate with the server."
        retryLabel="Reload Data"
        onRetry={onRetry}
      />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Network Error')).toBeInTheDocument();
    expect(screen.getByText('Unable to communicate with the server.')).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: /Reload Data/i });
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('3. PageHeader renders title, description, breadcrumbs, and actions', () => {
    render(
      <MemoryRouter>
        <PageHeader
          title="Student Roster"
          description="Manage enrolled students"
          breadcrumbs={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Students', path: null },
          ]}
          actions={<button type="button">Add Student</button>}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Student Roster' })).toBeInTheDocument();
    expect(screen.getByText('Manage enrolled students')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Student' })).toBeInTheDocument();
  });

  it('4. NotFoundState renders 404 and return link', () => {
    render(
      <MemoryRouter>
        <NotFoundState />
      </MemoryRouter>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Return to Dashboard/i })).toBeInTheDocument();
  });

  it('5. UnauthorizedState renders 403 and return link', () => {
    render(
      <MemoryRouter>
        <UnauthorizedState />
      </MemoryRouter>
    );

    expect(screen.getByText('403')).toBeInTheDocument();
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Return to Dashboard/i })).toBeInTheDocument();
  });
});


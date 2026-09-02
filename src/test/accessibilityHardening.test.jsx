import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RouteLoader from '../components/common/RouteLoader.jsx';
import AppErrorBoundary from '../components/common/AppErrorBoundary.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';

describe('ACCESSIBILITY & KEYBOARD NAVIGATION HARDENING', () => {
  it('1. RouteLoader provides full screen reader and status semantics', () => {
    render(<RouteLoader message="Preparing ID workspace..." />);
    const loader = screen.getByRole('status');
    expect(loader).toBeInTheDocument();
    expect(loader).toHaveAttribute('aria-live', 'polite');
    expect(loader).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Loading content, please wait...')).toHaveClass('sr-only');
  });

  it('2. AppErrorBoundary provides assertive alert semantics on failure', () => {
    const CrashComponent = () => {
      throw new Error('Test crash');
    };

    render(
      <AppErrorBoundary>
        <CrashComponent />
      </AppErrorBoundary>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });

  it('3. ConfirmDialog renders with dialog semantics and accessible buttons', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Confirm Student Deletion"
        message="Are you sure you want to delete this record?"
        confirmLabel="Delete Student"
        cancelLabel="Cancel"
        onConfirm={() => { }}
        onCancel={() => { }}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Confirm Student Deletion')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete Student' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });
});


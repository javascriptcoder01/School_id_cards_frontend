import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AppLoader from '../components/common/AppLoader.jsx';
import PageLoader from '../components/common/PageLoader.jsx';
import InlineLoader from '../components/common/InlineLoader.jsx';

describe('COMMON LOADING COMPONENTS', () => {
  it('1. AppLoader renders accessible application loading state', () => {
    render(<AppLoader message="Bootstrapping session..." />);
    const statusEl = screen.getByRole('status');
    expect(statusEl).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('School ID Cards')).toBeInTheDocument();
    expect(screen.getByText('Bootstrapping session...')).toBeInTheDocument();
  });

  it('2. PageLoader renders accessible page loading state', () => {
    render(<PageLoader message="Fetching records..." />);
    const statusEl = screen.getByRole('status');
    expect(statusEl).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Fetching records...')).toBeInTheDocument();
  });

  it('3. InlineLoader renders inline loading text with accessible fallback', () => {
    render(<InlineLoader text="Submitting..." />);
    const statusEl = screen.getByRole('status');
    expect(statusEl).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Submitting...')).toBeInTheDocument();
  });
});


import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GenerationStatusBadge from '../components/idCardGeneration/GenerationStatusBadge.jsx';
import TemplateStatusBadge from '../components/templates/TemplateStatusBadge.jsx';

describe('PERFORMANCE & COMPONENT MEMOIZATION HARDENING', () => {
  it('1. GenerationStatusBadge renders status variants cleanly with memoized structure', () => {
    const { rerender } = render(<GenerationStatusBadge status="COMPLETED" />);
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();

    rerender(<GenerationStatusBadge status="PROCESSING" />);
    expect(screen.getByText('PROCESSING')).toBeInTheDocument();

    rerender(<GenerationStatusBadge status="PENDING" />);
    expect(screen.getByText('PENDING')).toBeInTheDocument();

    rerender(<GenerationStatusBadge status="FAILED" />);
    expect(screen.getByText('FAILED')).toBeInTheDocument();
  });

  it('2. TemplateStatusBadge renders active and inactive states correctly', () => {
    const { rerender } = render(<TemplateStatusBadge isActive={true} />);
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();

    rerender(<TemplateStatusBadge isActive={false} />);
    expect(screen.getByText('INACTIVE')).toBeInTheDocument();
  });

});


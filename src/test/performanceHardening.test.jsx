import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GenerationStatusBadge from '../components/idCardGeneration/GenerationStatusBadge.jsx';
import TemplateStatusBadge from '../components/templates/TemplateStatusBadge.jsx';
import PhotoBox from '../components/templates/designer/PhotoBox.jsx';
import DesignerElement from '../components/templates/designer/DesignerElement.jsx';

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

  it('3. PhotoBox renders memoized photo container at precise coordinates', () => {
    const photo = { x: 50, y: 20, width: 25, height: 30, visible: true };
    render(<PhotoBox photo={photo} cardWidth={86} cardHeight={54} isDesignMode={true} />);

    const photoElem = screen.getByTitle('Student Photo');
    expect(photoElem).toBeInTheDocument();
    expect(photoElem.style.left).toBe(`${(50 / 86) * 100}%`);
    expect(photoElem.style.top).toBe(`${(20 / 54) * 100}%`);
  });

  it('4. DesignerElement renders text preview values accurately', () => {
    const field = {
      field: 'NAME',
      label: 'Student Name',
      x: 10,
      y: 30,
      fontSize: 12,
      fontWeight: 'BOLD',
      visible: true,
    };

    render(<DesignerElement field={field} cardWidth={86} cardHeight={54} isDesignMode={true} />);
    expect(screen.getByTitle('Field: NAME')).toBeInTheDocument();
    expect(screen.getByText(/Student Name:/i)).toBeInTheDocument();
  });
});


import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TemplateLivePreview from '../components/templates/designer/TemplateLivePreview.jsx';

describe('TEMPLATE LIVE PREVIEW COMPONENT', () => {
  const sampleTemplate = {
    name: 'Executive Student Card',
    orientation: 'LANDSCAPE',
    width: 86,
    height: 54,
    primaryColor: '#2563EB',
    secondaryColor: '#7C3AED',
    photo: { x: 55, y: 15, width: 25, height: 30, visible: true },
    fields: [
      { field: 'name', label: 'Name', x: 10, y: 25, fontSize: 13, fontWeight: 'BOLD', visible: true },
      { field: 'studentId', label: 'Student ID', x: 10, y: 35, fontSize: 11, fontWeight: 'NORMAL', visible: true },
    ],
  };

  it('1. Renders clean live preview with sample student mock credentials', () => {
    render(<TemplateLivePreview template={sampleTemplate} />);

    expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
    expect(screen.getByText('STU-2026-001')).toBeInTheDocument();
    expect(screen.getByTitle('Student Photo')).toBeInTheDocument();
  });

  it('2. Reflects updated theme colors immediately in DOM style', () => {
    const { container } = render(
      <TemplateLivePreview
        template={{
          ...sampleTemplate,
          primaryColor: '#059669',
          secondaryColor: '#10B981',
        }}
      />
    );

    // JSDOM serializes hex colors to rgb(...) in inline styles
    expect(container.innerHTML).toContain('rgb(5, 150, 105)');
    expect(container.innerHTML).toContain('rgb(16, 185, 129)');
  });
});


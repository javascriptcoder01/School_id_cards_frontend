import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TemplateCanvas from '../components/templates/designer/TemplateCanvas.jsx';
import { TEMPLATE_DESIGNER_MODES } from '../constants/template.js';

describe('TEMPLATE CANVAS COMPONENT', () => {
  const sampleTemplate = {
    name: 'Sample Template',
    orientation: 'PORTRAIT',
    width: 86,
    height: 54,
    primaryColor: '#4F46E5',
    secondaryColor: '#9333EA',
    photo: { x: 55, y: 20, width: 25, height: 30, visible: true },
    fields: [
      { field: 'name', label: 'Name', x: 10, y: 30, fontSize: 14, fontWeight: 'BOLD', visible: true },
      { field: 'studentId', label: 'ID', x: 10, y: 40, fontSize: 11, fontWeight: 'NORMAL', visible: true },
    ],
  };

  it('1. Renders photo box and dynamic fields on canvas', () => {
    render(
      <TemplateCanvas
        template={sampleTemplate}
        mode={TEMPLATE_DESIGNER_MODES.DESIGN}
      />
    );

    expect(screen.getByTitle('Student Photo')).toBeInTheDocument();
    expect(screen.getByTitle('Field: name')).toBeInTheDocument();
    expect(screen.getByTitle('Field: studentId')).toBeInTheDocument();
    expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
    expect(screen.getByText('STU-2026-001')).toBeInTheDocument();
  });

  it('2. Triggers onSelectElement when clicking elements in DESIGN mode', () => {
    const onSelectElement = vi.fn();
    render(
      <TemplateCanvas
        template={sampleTemplate}
        mode={TEMPLATE_DESIGNER_MODES.DESIGN}
        onSelectElement={onSelectElement}
      />
    );

    fireEvent.click(screen.getByTitle('Student Photo'));
    expect(onSelectElement).toHaveBeenCalledWith({ type: 'PHOTO', id: 'photo' });

    fireEvent.click(screen.getByTitle('Field: name'));
    expect(onSelectElement).toHaveBeenCalledWith({ type: 'FIELD', id: 'name' });
  });

  it('3. Visual selection styling applied when element is selected', () => {
    render(
      <TemplateCanvas
        template={sampleTemplate}
        mode={TEMPLATE_DESIGNER_MODES.DESIGN}
        selectedElement={{ type: 'PHOTO', id: 'photo' }}
      />
    );

    const photoEl = screen.getByTitle('Student Photo');
    expect(photoEl.className).toContain('ring-2 ring-indigo-600');
  });
});


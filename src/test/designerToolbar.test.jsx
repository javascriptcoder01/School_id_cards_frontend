import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DesignerToolbar from '../components/templates/designer/DesignerToolbar.jsx';
import { TEMPLATE_DESIGNER_MODES } from '../constants/template.js';

describe('DESIGNER TOOLBAR COMPONENT', () => {
  it('1. Renders mode toggles and zoom controls', () => {
    render(
      <DesignerToolbar
        mode={TEMPLATE_DESIGNER_MODES.DESIGN}
        zoom={1.0}
        onModeChange={vi.fn()}
        onZoomChange={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /Design Canvas/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Live Preview/i })).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('2. Triggers onModeChange when switching to preview mode', () => {
    const onModeChange = vi.fn();
    render(
      <DesignerToolbar
        mode={TEMPLATE_DESIGNER_MODES.DESIGN}
        zoom={1.0}
        onModeChange={onModeChange}
        onZoomChange={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Live Preview/i }));
    expect(onModeChange).toHaveBeenCalledWith(TEMPLATE_DESIGNER_MODES.PREVIEW);
  });

  it('3. Triggers onZoomChange on Zoom In / Zoom Out / Reset', () => {
    const onZoomChange = vi.fn();
    render(
      <DesignerToolbar
        mode={TEMPLATE_DESIGNER_MODES.DESIGN}
        zoom={1.0}
        onModeChange={vi.fn()}
        onZoomChange={onZoomChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Zoom In' }));
    expect(onZoomChange).toHaveBeenCalledWith(1.1);

    fireEvent.click(screen.getByRole('button', { name: 'Zoom Out' }));
    expect(onZoomChange).toHaveBeenCalledWith(0.9);
  });
});


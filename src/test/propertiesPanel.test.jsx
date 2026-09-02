import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PropertiesPanel from '../components/templates/designer/PropertiesPanel.jsx';

describe('PROPERTIES PANEL COMPONENT', () => {
  const mockFormData = {
    width: 86,
    height: 54,
    photo: { x: 55, y: 20, width: 25, height: 30, visible: true },
    fields: [
      { field: 'name', label: 'Full Name', x: 10, y: 30, fontSize: 14, fontWeight: 'BOLD', visible: true },
    ],
  };

  it('1. Renders empty prompt when no element is selected', () => {
    render(
      <PropertiesPanel
        selectedElement={null}
        formData={mockFormData}
        onUpdatePhoto={vi.fn()}
        onUpdateField={vi.fn()}
        onRemoveField={vi.fn()}
      />
    );

    expect(screen.getByText('Properties Inspector')).toBeInTheDocument();
  });

  it('2. Renders photo coordinate inputs when photo is selected', () => {
    const onUpdatePhoto = vi.fn();
    render(
      <PropertiesPanel
        selectedElement={{ type: 'PHOTO', id: 'photo' }}
        formData={mockFormData}
        onUpdatePhoto={onUpdatePhoto}
        onUpdateField={vi.fn()}
        onRemoveField={vi.fn()}
      />
    );

    expect(screen.getByText('Photo Box Properties')).toBeInTheDocument();
    expect(screen.getByText('X Position (mm)')).toBeInTheDocument();
  });

  it('3. Renders field typography & coordinates when field is selected', () => {
    const onUpdateField = vi.fn();
    render(
      <PropertiesPanel
        selectedElement={{ type: 'FIELD', id: 'name' }}
        formData={mockFormData}
        onUpdatePhoto={vi.fn()}
        onUpdateField={onUpdateField}
        onRemoveField={vi.fn()}
      />
    );

    expect(screen.getByText('Student Name')).toBeInTheDocument();
    expect(screen.getByText('Display Label')).toBeInTheDocument();
    expect(screen.getByText('Font Size (pt)')).toBeInTheDocument();
  });

  it('4. Calls onRemoveField when delete button clicked', () => {
    const onRemoveField = vi.fn();
    render(
      <PropertiesPanel
        selectedElement={{ type: 'FIELD', id: 'name' }}
        formData={mockFormData}
        onUpdatePhoto={vi.fn()}
        onUpdateField={vi.fn()}
        onRemoveField={onRemoveField}
      />
    );

    const deleteBtn = screen.getByRole('button', { name: /Remove name/i });
    fireEvent.click(deleteBtn);
    expect(onRemoveField).toHaveBeenCalledWith(0);
  });
});


import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FieldPalette from '../components/templates/designer/FieldPalette.jsx';

describe('FIELD PALETTE COMPONENT', () => {
  const mockFields = [
    { field: 'name', label: 'Name', x: 10, y: 30 },
  ];

  it('1. Renders student photo item and dynamic fields', () => {
    render(
      <FieldPalette
        fields={mockFields}
        photo={{ x: 55, y: 20 }}
        selectedElement={null}
        onSelectElement={vi.fn()}
        onAddField={vi.fn()}
      />
    );

    expect(screen.getByText('Student Photo Box')).toBeInTheDocument();
    expect(screen.getByText('Student Name')).toBeInTheDocument();
    expect(screen.getByText('Student ID / Reg No')).toBeInTheDocument();
  });

  it('2. Selecting placed field triggers onSelectElement', () => {
    const onSelectElement = vi.fn();
    render(
      <FieldPalette
        fields={mockFields}
        selectedElement={null}
        onSelectElement={onSelectElement}
        onAddField={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Student Name'));
    expect(onSelectElement).toHaveBeenCalledWith({ type: 'FIELD', id: 'name' });
  });

  it('3. Clicking unplaced field triggers onAddField', () => {
    const onAddField = vi.fn();
    const onSelectElement = vi.fn();

    render(
      <FieldPalette
        fields={mockFields}
        selectedElement={null}
        onSelectElement={onSelectElement}
        onAddField={onAddField}
      />
    );

    fireEvent.click(screen.getByText('Student ID / Reg No'));
    expect(onAddField).toHaveBeenCalledWith('studentId');
    expect(onSelectElement).toHaveBeenCalledWith({ type: 'FIELD', id: 'studentId' });
  });
});


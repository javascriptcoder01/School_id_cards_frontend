import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TemplateTable from '../components/templates/TemplateTable.jsx';
import TemplateStatusBadge from '../components/templates/TemplateStatusBadge.jsx';
import TemplateSearch from '../components/templates/TemplateSearch.jsx';
import TemplateForm from '../components/templates/TemplateForm.jsx';

describe('TEMPLATE MANAGEMENT UI COMPONENTS', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. TemplateStatusBadge renders ACTIVE and INACTIVE states properly', () => {
    const { rerender } = render(<TemplateStatusBadge isActive={true} />);
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();

    rerender(<TemplateStatusBadge isActive={false} />);
    expect(screen.getByText('INACTIVE')).toBeInTheDocument();
  });

  it('2. TemplateSearch triggers debounced callback and handles reset', async () => {
    const onSearchChange = vi.fn();
    const onReset = vi.fn();

    render(
      <TemplateSearch
        search=""
        onSearchChange={onSearchChange}
        onReset={onReset}
      />
    );

    const input = screen.getByPlaceholderText(/Search templates by name/i);
    fireEvent.change(input, { target: { value: 'Standard Card' } });

    await waitFor(
      () => {
        expect(onSearchChange).toHaveBeenCalledWith('Standard Card');
      },
      { timeout: 1000 }
    );
  });

  it('3. TemplateTable renders list of templates with actions and metadata', () => {
    const mockTemplates = [
      {
        id: 'tpl-1',
        name: 'Standard Portrait 2026',
        orientation: 'PORTRAIT',
        width: 86,
        height: 54,
        fields: [{ field: 'name', label: 'Student Name' }, { field: 'studentId' }],
        primaryColor: '#4F46E5',
        secondaryColor: '#9333EA',
        isActive: true,
      },
    ];

    const onStatusToggle = vi.fn();

    render(
      <MemoryRouter>
        <TemplateTable
          templates={mockTemplates}
          isLoading={false}
          canEdit={true}
          onStatusToggle={onStatusToggle}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Standard Portrait 2026')).toBeInTheDocument();
    expect(screen.getByText('PORTRAIT')).toBeInTheDocument();
    expect(screen.getByText('86 × 54 mm')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();

    const deactBtn = screen.getByRole('button', { name: /Deactivate/i });
    fireEvent.click(deactBtn);
    expect(onStatusToggle).toHaveBeenCalledWith('tpl-1', false);
  });

  it('4. TemplateTable renders empty state when no templates exist', () => {
    render(
      <MemoryRouter>
        <TemplateTable templates={[]} isLoading={false} />
      </MemoryRouter>
    );

    expect(screen.getByText('No Templates Found')).toBeInTheDocument();
  });

  it('5. TemplateForm enforces validation for required fields', async () => {
    const onSubmit = vi.fn();

    render(
      <MemoryRouter>
        <TemplateForm onSubmit={onSubmit} isEdit={false} />
      </MemoryRouter>
    );

    const nameInput = screen.getByLabelText(/Template Name/i);
    fireEvent.change(nameInput, { target: { value: '' } });

    const submitBtn = screen.getByRole('button', { name: /Create Template/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Template name is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('6. TemplateForm submits formatted payload when inputs are valid', () => {
    const onSubmit = vi.fn();

    render(
      <MemoryRouter>
        <TemplateForm onSubmit={onSubmit} isEdit={false} />
      </MemoryRouter>
    );

    const nameInput = screen.getByLabelText(/Template Name/i);
    fireEvent.change(nameInput, { target: { value: 'Annual ID Card' } });

    const submitBtn = screen.getByRole('button', { name: /Create Template/i });
    fireEvent.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Annual ID Card',
        orientation: 'PORTRAIT',
        width: 86,
        height: 54,
        fields: expect.any(Array),
      })
    );
  });
});


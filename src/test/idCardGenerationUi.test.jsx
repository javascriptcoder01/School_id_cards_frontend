import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GenerationStatusBadge from '../components/idCardGeneration/GenerationStatusBadge.jsx';
import GenerationFilters from '../components/idCardGeneration/GenerationFilters.jsx';
import StudentSelector from '../components/idCardGeneration/StudentSelector.jsx';
import GenerationCreateForm from '../components/idCardGeneration/GenerationCreateForm.jsx';
import GenerationTable from '../components/idCardGeneration/GenerationTable.jsx';
import GenerationResultSummary from '../components/idCardGeneration/GenerationResultSummary.jsx';

describe('ID CARD GENERATION UI COMPONENTS', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. GenerationStatusBadge renders all 4 status variants properly', () => {
    const { rerender } = render(<GenerationStatusBadge status="PENDING" />);
    expect(screen.getByText('PENDING')).toBeInTheDocument();

    rerender(<GenerationStatusBadge status="PROCESSING" />);
    expect(screen.getByText('PROCESSING')).toBeInTheDocument();

    rerender(<GenerationStatusBadge status="COMPLETED" />);
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();

    rerender(<GenerationStatusBadge status="FAILED" />);
    expect(screen.getByText('FAILED')).toBeInTheDocument();
  });

  it('2. GenerationFilters renders status and template filters and triggers change', () => {
    const onFilterChange = vi.fn();
    const onReset = vi.fn();
    const mockTemplates = [{ id: 't1', name: 'Portrait Template' }];

    render(
      <GenerationFilters
        filters={{ status: 'PENDING', templateId: '' }}
        templates={mockTemplates}
        onFilterChange={onFilterChange}
        onReset={onReset}
      />
    );

    const statusSelect = screen.getByLabelText(/Filter by Status/i);
    expect(statusSelect).toHaveValue('PENDING');

    fireEvent.change(statusSelect, { target: { value: 'COMPLETED' } });
    expect(onFilterChange).toHaveBeenCalledWith({ status: 'COMPLETED' });

    const resetBtn = screen.getByRole('button', { name: /Reset Filters/i });
    fireEvent.click(resetBtn);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('3. StudentSelector filters students and supports multi-selection', () => {
    const mockStudents = [
      { id: 's1', name: 'Aarav Patel', studentId: 'STU-001', className: '10', rollNumber: '1' },
      { id: 's2', name: 'Diya Sharma', studentId: 'STU-002', className: '10', rollNumber: '2' },
    ];
    const onToggle = vi.fn();
    const onSelectAll = vi.fn();

    render(
      <StudentSelector
        students={mockStudents}
        selectedStudentIds={['s1']}
        onToggleStudent={onToggle}
        onSelectAll={onSelectAll}
        onClearAll={vi.fn()}
        isBulkMode={true}
      />
    );

    expect(screen.getByText(/1 Selected/i)).toBeInTheDocument();
    expect(screen.getAllByText('Aarav Patel').length).toBeGreaterThan(0);
    expect(screen.getByText('Diya Sharma')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Diya Sharma'));
    expect(onToggle).toHaveBeenCalledWith('s2');
  });

  it('4. GenerationCreateForm validates template and student selection', () => {
    const onSubmit = vi.fn();
    const mockTemplates = [{ id: 't1', name: 'Standard ID', orientation: 'PORTRAIT', width: 86, height: 54 }];
    const mockStudents = [{ id: 's1', name: 'Aarav Patel', studentId: 'STU-001' }];

    render(
      <MemoryRouter>
        <GenerationCreateForm
          templates={mockTemplates}
          students={mockStudents}
          onSubmit={onSubmit}
        />
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /Create Generation Job/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Please select an ID card template')).toBeInTheDocument();
    expect(screen.getByText('Please select a student for ID card generation')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('5. GenerationTable renders list and triggers process action', () => {
    const mockGenerations = [
      {
        id: 'gen-123456',
        templateName: 'Standard Template',
        studentCount: 5,
        status: 'PENDING',
        createdAt: '2026-09-01T10:00:00Z',
      },
    ];
    const onProcessJob = vi.fn();

    render(
      <MemoryRouter>
        <GenerationTable
          generations={mockGenerations}
          onProcessJob={onProcessJob}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Standard Template')).toBeInTheDocument();
    expect(screen.getByText(/5 students/i)).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();

    const processBtn = screen.getByRole('button', { name: /Process/i });
    fireEvent.click(processBtn);
    expect(onProcessJob).toHaveBeenCalledWith('gen-123456');
  });

  it('6. GenerationResultSummary renders metric counts', () => {
    render(
      <GenerationResultSummary
        results={{
          totalStudents: 100,
          completedCount: 98,
          failedCount: 2,
        }}
      />
    );

    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('98')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});


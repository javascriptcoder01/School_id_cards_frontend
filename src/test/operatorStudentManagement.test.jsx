import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OperatorStudentTable from '../components/operator/OperatorStudentTable.jsx';
import OperatorStudentForm from '../components/operator/OperatorStudentForm.jsx';

describe('OPERATOR STUDENT MANAGEMENT UI', () => {
  it('1. OperatorStudentTable renders assigned student roster with status', () => {
    const students = [
      {
        id: 's-1',
        name: 'Aarav Sharma',
        studentId: 'STU-10A-01',
        className: '10',
        section: 'A',
        rollNumber: '01',
        gender: 'MALE',
        completion: { isComplete: true },
      },
    ];

    render(
      <OperatorStudentTable
        students={students}
        onEdit={vi.fn()}
        onPreview={vi.fn()}
      />
    );

    expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
    expect(screen.getByText('STU-10A-01')).toBeInTheDocument();
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  it('2. OperatorStudentForm enforces required fields and submits scoped data', () => {
    const handleSubmit = vi.fn();
    const assignedScopes = [{ className: '10', section: 'A' }];

    render(
      <OperatorStudentForm
        assignedScopes={assignedScopes}
        onSubmit={handleSubmit}
        onCancel={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Pooja Nair' } });
    fireEvent.change(screen.getByLabelText(/Student ID/i), { target: { value: 'STU-10A-02' } });
    fireEvent.change(screen.getByLabelText(/Class \/ Grade/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Section/i), { target: { value: 'A' } });

    fireEvent.click(screen.getByText('Save Student Record'));

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Pooja Nair',
        studentId: 'STU-10A-02',
        className: '10',
        section: 'A',
      })
    );
  });
});

import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import OperatorProgressTable from '../components/dashboard/OperatorProgressTable.jsx';

describe('College Admin Operator Progress Table (Batch 19)', () => {
  const mockOperators = [
    {
      operatorId: 'op1',
      name: 'Pooja Nair',
      email: 'pooja@institution.edu',
      subjectName: 'Physics',
      className: '11',
      sectionName: 'A',
      students: {
        total: 40,
        complete: 36,
        pending: 4,
      },
      idCards: {
        generated: 30,
        pendingGeneration: 6,
        completed: 30,
      },
      printRequests: {
        pendingCollegeApproval: 1,
        sentToSuperAdmin: 1,
        printing: 1,
        completed: 2,
        collegeRejected: 0,
        superAdminRejected: 0,
      },
    },
    {
      operatorId: 'op2',
      name: 'Rohan Gupta',
      email: 'rohan@institution.edu',
      subjectName: 'Chemistry',
      className: '12',
      sectionName: 'B',
      students: {
        total: 30,
        complete: 30,
        pending: 0,
      },
      idCards: {
        generated: 30,
        pendingGeneration: 0,
        completed: 30,
      },
      printRequests: {
        pendingCollegeApproval: 0,
        sentToSuperAdmin: 0,
        printing: 0,
        completed: 3,
        collegeRejected: 0,
        superAdminRejected: 0,
      },
    },
  ];

  it('renders all operator rows with scope, completion metrics, and print counts', () => {
    render(<OperatorProgressTable operators={mockOperators} />);

    // Check operator names and subjects
    expect(screen.getByText('Pooja Nair')).toBeDefined();
    expect(screen.getByText(/pooja@institution.edu/i)).toBeDefined();
    expect(screen.getByText(/Subject: Physics/i)).toBeDefined();
    expect(screen.getByText(/Class 11 \(Sec A\)/i)).toBeDefined();

    // Check student completion stats
    expect(screen.getByText('90% Complete')).toBeDefined(); // 36 / 40 = 90%
    expect(screen.getByText('100% Complete')).toBeDefined(); // 30 / 30 = 100%

    // Check ID card counts
    expect(screen.getAllByText(/30 Gen/i).length).toBe(2);

    // Check second operator
    expect(screen.getByText('Rohan Gupta')).toBeDefined();
    expect(screen.getByText(/Subject: Chemistry/i)).toBeDefined();
  });

  it('renders empty state when operators list is empty', () => {
    render(<OperatorProgressTable operators={[]} />);
    expect(screen.getByText(/No Operators Assigned/i)).toBeDefined();
  });
});

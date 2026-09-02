import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CollegeProgressOverview from '../components/dashboard/CollegeProgressOverview.jsx';
import OperatorClassProgressTable from '../components/dashboard/OperatorClassProgressTable.jsx';

describe('COLLEGE PROGRESS UI COMPONENTS', () => {
  it('1. CollegeProgressOverview renders summary metric cards', () => {
    const summary = {
      totalOperators: 3,
      totalStudents: 120,
      completedStudents: 110,
      pendingStudents: 10,
      generatedCards: 105,
      activeAssignments: 3,
    };

    render(<CollegeProgressOverview summary={summary} isLoading={false} />);

    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('110')).toBeInTheDocument();
    expect(screen.getByText('105')).toBeInTheDocument();
  });

  it('2. OperatorClassProgressTable renders class-level breakdown per operator', () => {
    const operators = [
      {
        operator: { name: 'Rahul Sharma', email: 'rahul@apex.edu' },
        assignments: [
          {
            className: '10',
            section: 'A',
            totalStudents: 40,
            completedStudents: 38,
            pendingStudents: 2,
            generatedCards: 35,
            pendingCards: 5,
          },
        ],
      },
    ];

    render(<OperatorClassProgressTable operators={operators} />);

    expect(screen.getByText('Rahul Sharma')).toBeInTheDocument();
    expect(screen.getByText('Class 10')).toBeInTheDocument();
    expect(screen.getByText('Section A')).toBeInTheDocument();
    expect(screen.getByText('38')).toBeInTheDocument();
  });
});

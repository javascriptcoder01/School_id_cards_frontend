import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SuperAdminPrintSummary from '../components/superAdmin/SuperAdminPrintSummary.jsx';
import CollegePrintQueueTable from '../components/superAdmin/CollegePrintQueueTable.jsx';

describe('SUPER ADMIN PRINT CENTER UI COMPONENTS', () => {
  it('1. SuperAdminPrintSummary aggregates ready to print and generated cards', () => {
    const colleges = [
      {
        college: { id: 'c-1', name: 'Apex Academy' },
        statistics: { totalStudents: 50, completedStudents: 45, generatedCards: 40, readyToPrint: 40 },
      },
    ];

    render(<SuperAdminPrintSummary colleges={colleges} isLoading={false} />);

    expect(screen.getByText('1')).toBeInTheDocument(); // total colleges
    expect(screen.getAllByText('40').length).toBeGreaterThanOrEqual(1); // ready to print & total generated
  });

  it('2. CollegePrintQueueTable renders rows with action buttons', () => {
    const colleges = [
      {
        college: { id: 'c-1', name: 'Apex Academy', code: 'APX' },
        statistics: { totalStudents: 50, completedStudents: 45, generatedCards: 40 },
      },
    ];

    render(<CollegePrintQueueTable colleges={colleges} onViewCollege={vi.fn()} />);

    expect(screen.getByText('Apex Academy')).toBeInTheDocument();
    expect(screen.getAllByText('APX').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('View Queue')).toBeInTheDocument();
  });
});


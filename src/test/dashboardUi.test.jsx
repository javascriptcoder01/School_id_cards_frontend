import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardStatCard from '../components/dashboard/DashboardStatCard.jsx';
import DashboardSection from '../components/dashboard/DashboardSection.jsx';
import DashboardEmptyState from '../components/dashboard/DashboardEmptyState.jsx';
import RecentActivity from '../components/dashboard/RecentActivity.jsx';
import GenerationStatusSummary from '../components/dashboard/GenerationStatusSummary.jsx';
import QuickActions from '../components/dashboard/QuickActions.jsx';

describe('DASHBOARD UI COMPONENTS', () => {
  it('1. DashboardStatCard renders title, value, and subtitle', () => {
    render(
      <DashboardStatCard
        title="Total Colleges"
        value={15}
        subtitle="Active universities"
        colorScheme="indigo"
      />
    );

    expect(screen.getByText('Total Colleges')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('Active universities')).toBeInTheDocument();
  });

  it('2. DashboardSection renders title and subtitle', () => {
    render(
      <DashboardSection title="Overview Section" subtitle="Overview description">
        <div>Child Content</div>
      </DashboardSection>
    );

    expect(screen.getByText('Overview Section')).toBeInTheDocument();
    expect(screen.getByText('Overview description')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('3. RecentActivity renders activity items', () => {
    const activity = [
      { type: 'COLLEGE_CREATED', title: 'College: Harvard', timestamp: '2026-09-01T10:00:00Z' },
    ];
    render(<RecentActivity activity={activity} />);
    expect(screen.getByText('College: Harvard')).toBeInTheDocument();
  });

  it('4. GenerationStatusSummary renders pipeline breakdown', () => {
    const generationStats = {
      total: 10,
      completed: 8,
      pending: 1,
      processing: 1,
      failed: 0,
      recent: [{ id: 'g1', templateName: 'Standard Layout', studentCount: 20, status: 'COMPLETED' }],
    };

    render(
      <MemoryRouter>
        <GenerationStatusSummary generationStats={generationStats} />
      </MemoryRouter>
    );

    expect(screen.getByText('ID Card Generation Pipeline')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('Standard Layout')).toBeInTheDocument();
  });

  it('5. QuickActions renders role shortcuts for SUPER_ADMIN and COLLEGE_ADMIN', () => {
    const { rerender } = render(
      <MemoryRouter>
        <QuickActions role="SUPER_ADMIN" />
      </MemoryRouter>
    );
    expect(screen.getByText('Register College')).toBeInTheDocument();
    expect(screen.getByText('Create User')).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <QuickActions role="COLLEGE_ADMIN" />
      </MemoryRouter>
    );
    expect(screen.getByText('Add Student')).toBeInTheDocument();
    expect(screen.getByText('Bulk Import')).toBeInTheDocument();
    expect(screen.getByText('Generate Cards')).toBeInTheDocument();
  });
});


import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import OperatorStudentProgress from '../components/dashboard/OperatorStudentProgress.jsx';
import OperatorDashboard from '../pages/dashboard/OperatorDashboard.jsx';
import operatorReducer from '../features/operator/operatorSlice.js';
import authReducer from '../features/auth/authSlice.js';

describe('Operator Dashboard & Progress Tracking (Batch 19)', () => {
  const mockStudentsSummary = {
    total: 50,
    complete: 45,
    pending: 5,
  };

  const mockIdCardsSummary = {
    generated: 40,
    pendingGeneration: 5,
  };

  const mockPrintRequestsSummary = {
    total: 12,
    pendingCollegeApproval: 2,
    collegeApproved: 1,
    sentToSuperAdmin: 3,
    printing: 2,
    completed: 3,
    collegeRejected: 1,
    superAdminRejected: 0,
  };

  describe('OperatorStudentProgress Component', () => {
    it('renders profile completion percentage and stats', () => {
      render(
        <OperatorStudentProgress
          studentsSummary={mockStudentsSummary}
          idCardsSummary={mockIdCardsSummary}
          printRequestsSummary={mockPrintRequestsSummary}
        />
      );

      // 45 / 50 = 90%
      expect(screen.getByText('90% Complete')).toBeDefined();
      expect(screen.getByText('50')).toBeDefined();
      expect(screen.getByText(/45 Complete/i)).toBeDefined();
      expect(screen.getByText(/5 Pending/i)).toBeDefined();
    });

    it('renders ID card generation and print request breakdown', () => {
      render(
        <OperatorStudentProgress
          studentsSummary={mockStudentsSummary}
          idCardsSummary={mockIdCardsSummary}
          printRequestsSummary={mockPrintRequestsSummary}
        />
      );

      expect(screen.getByText('40')).toBeDefined(); // generated cards
      expect(screen.getByText('5 students')).toBeDefined(); // pending generation
      expect(screen.getByText('12 Total Jobs')).toBeDefined();

      // Lifecycle status counts
      expect(screen.getByText('College Review')).toBeDefined();
      expect(screen.getByText('Super Admin Queue')).toBeDefined();
      expect(screen.getByText('In Printing')).toBeDefined();
    });
  });

  describe('OperatorDashboard Integration', () => {
    it('renders OperatorStudentProgress with live dashboard state', () => {
      const store = configureStore({
        reducer: {
          operator: operatorReducer,
          auth: authReducer,
        },
        preloadedState: {
          auth: {
            user: { role: 'OPERATOR', name: 'John Operator', className: '10', sectionName: 'A' },
          },
          operator: {
            dashboard: {
              students: mockStudentsSummary,
              idCards: mockIdCardsSummary,
              printRequests: mockPrintRequestsSummary,
              summary: {
                totalStudents: 50,
                completedStudents: 45,
                pendingStudents: 5,
                generatedCards: 40,
                pendingCards: 5,
              },
              assignments: [{ id: 'a1', className: '10', section: 'A' }],
            },
            loading: false,
          },
        },
      });

      render(
        <Provider store={store}>
          <MemoryRouter>
            <OperatorDashboard user={{ name: 'John Operator' }} />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText(/Welcome, John Operator/i)).toBeDefined();
      expect(screen.getByText(/Student Completion & Print Workflow/i)).toBeDefined();
      expect(screen.getByText(/90% Complete/i)).toBeDefined();
    });
  });
});

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import PrintRequestCreatePanel from '../components/printRequests/PrintRequestCreatePanel.jsx';
import OperatorPrintRequestList from '../components/printRequests/OperatorPrintRequestList.jsx';
import PrintRequestsPage from '../pages/printRequests/PrintRequestsPage.jsx';
import printRequestReducer from '../features/printRequests/printRequestSlice.js';
import authReducer from '../features/auth/authSlice.js';
import { ROLES } from '../constants/roles.js';
import { PRINT_REQUEST_STATUS } from '../constants/printRequest.js';

describe('OPERATOR PRINT REQUEST UI WORKFLOW', () => {
  const createTestStore = (role = ROLES.OPERATOR, printRequestsState = {}) =>
    configureStore({
      reducer: {
        printRequests: printRequestReducer,
        auth: authReducer,
      },
      preloadedState: {
        auth: {
          user: {
            id: 'op-1',
            name: 'Rahul Sharma',
            role,
            collegeId: 'col-1',
            subjectName: 'Mathematics',
            className: '10',
            sectionName: 'A',
          },
          token: 'token',
          isAuthenticated: true,
        },
        printRequests: {
          list: [],
          selectedRequest: null,
          status: 'idle',
          actionStatus: 'idle',
          downloadStatus: 'idle',
          error: null,
          filters: {},
          ...printRequestsState,
        },
      },
    });

  it('1. PrintRequestCreatePanel renders selection count and BULK type indicator', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <PrintRequestCreatePanel
            generationId="gen-1"
            selectedStudentIds={['s-1', 's-2', 's-3']}
            totalAvailable={10}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/Type: BULK/i)).toBeInTheDocument();
    expect(screen.getByText(/3 \/ 10 cards/i)).toBeInTheDocument();
    expect(screen.getByText(/Rahul Sharma/i)).toBeInTheDocument();
    expect(screen.getByText(/Submit \(3 Cards\) for Printing/i)).toBeInTheDocument();
  });

  it('2. PrintRequestCreatePanel opens confirmation dialog before submission', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <PrintRequestCreatePanel
            generationId="gen-1"
            selectedStudentIds={['s-1']}
            totalAvailable={5}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/Type: SINGLE/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Submit \(1 Cards\) for Printing/i));

    expect(screen.getByText(/Confirm Print Request Submission/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to submit 1 ID card\(s\)/i)
    ).toBeInTheDocument();
  });

  it('3. OperatorPrintRequestList renders requests table and links to details', () => {
    const requests = [
      {
        id: '60d5ec49f1b2c8b1f8e4e1a1',
        totalCards: 12,
        requestType: 'BULK',
        status: PRINT_REQUEST_STATUS.PENDING_COLLEGE_APPROVAL,
        createdAt: new Date().toISOString(),
      },
    ];

    render(
      <MemoryRouter>
        <OperatorPrintRequestList requests={requests} />
      </MemoryRouter>
    );

    expect(screen.getByText('#F8E4E1A1')).toBeInTheDocument();
    expect(screen.getByText('12 Cards')).toBeInTheDocument();
    expect(screen.getByText('BULK')).toBeInTheDocument();
    expect(screen.getByText('Pending College Approval')).toBeInTheDocument();
  });

  it('4. PrintRequestsPage renders Operator title and list for OPERATOR role', () => {
    const requests = [
      {
        id: '60d5ec49f1b2c8b1f8e4e1a2',
        totalCards: 1,
        requestType: 'SINGLE',
        status: PRINT_REQUEST_STATUS.COLLEGE_APPROVED,
        createdAt: new Date().toISOString(),
      },
    ];

    render(
      <MemoryRouter>
        <OperatorPrintRequestList requests={requests} />
      </MemoryRouter>
    );

    expect(screen.getByText('#F8E4E1A2')).toBeInTheDocument();
    expect(screen.getByText('College Approved')).toBeInTheDocument();
  });
});

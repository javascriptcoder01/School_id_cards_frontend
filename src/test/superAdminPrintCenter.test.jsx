import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import SuperAdminPrintCenterPage from '../pages/superAdmin/SuperAdminPrintCenterPage.jsx';
import SuperAdminPrintQueueTable from '../components/printRequests/SuperAdminPrintQueueTable.jsx';
import printRequestReducer from '../features/printRequests/printRequestSlice.js';
import authReducer from '../features/auth/authSlice.js';
import { ROLES } from '../constants/roles.js';
import { PRINT_REQUEST_STATUS } from '../constants/printRequest.js';

describe('SUPER ADMIN CENTRAL PRINT CENTER UI', () => {
  const mockRequests = [
    {
      id: 'req-sa-1',
      collegeId: { id: 'col-1', name: 'Apex Engineering College', code: 'APEX' },
      requestedBy: { id: 'op-1', name: 'Rahul Sharma', className: '10', sectionName: 'A' },
      totalCards: 50,
      requestType: 'BULK',
      status: PRINT_REQUEST_STATUS.SENT_TO_SUPER_ADMIN,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'req-sa-2',
      collegeId: { id: 'col-2', name: 'Beacon High School', code: 'BEACON' },
      requestedBy: { id: 'op-2', name: 'Priya Singh', className: '12', sectionName: 'B' },
      totalCards: 10,
      requestType: 'BULK',
      status: PRINT_REQUEST_STATUS.SUPER_ADMIN_APPROVED,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'req-sa-3',
      collegeId: { id: 'col-1', name: 'Apex Engineering College', code: 'APEX' },
      requestedBy: { id: 'op-1', name: 'Rahul Sharma', className: '10', sectionName: 'A' },
      totalCards: 5,
      requestType: 'BULK',
      status: PRINT_REQUEST_STATUS.PRINTING,
      createdAt: new Date().toISOString(),
    },
  ];

  const store = configureStore({
    reducer: {
      printRequests: printRequestReducer,
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: { id: 'sa-1', role: ROLES.SUPER_ADMIN },
        token: 'token',
        isAuthenticated: true,
      },
      printRequests: {
        list: mockRequests,
        selectedRequest: null,
        status: 'succeeded',
        actionStatus: 'idle',
        downloadStatus: 'idle',
        error: null,
        filters: {},
      },
    },
  });

  it('1. SuperAdminPrintCenterPage renders KPI metric summary cards', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SuperAdminPrintCenterPage />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Central ID Card Print Center')).toBeInTheDocument();
    expect(screen.getByText('Total Requests')).toBeInTheDocument();
    expect(screen.getAllByText('Pending Review')[0]).toBeInTheDocument();
  });

  it('2. SuperAdminPrintCenterPage renders College-Wise grouped counts', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SuperAdminPrintCenterPage />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Institution Print Production Overview')).toBeInTheDocument();
    expect(screen.getAllByText('Apex Engineering College')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Beacon High School')[0]).toBeInTheDocument();
  });

  it('3. SuperAdminPrintQueueTable renders appropriate actions per status', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SuperAdminPrintQueueTable requests={mockRequests} />
        </MemoryRouter>
      </Provider>
    );

    // SENT_TO_SUPER_ADMIN row -> Approve & Reject
    expect(screen.getByRole('button', { name: /^Approve$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Reject$/i })).toBeInTheDocument();

    // SUPER_ADMIN_APPROVED row -> Mark Printing
    expect(screen.getByRole('button', { name: /Mark Printing/i })).toBeInTheDocument();

    // PRINTING row -> ZIP & Complete
    expect(screen.getByRole('button', { name: /ZIP/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Complete/i })).toBeInTheDocument();
  });
});

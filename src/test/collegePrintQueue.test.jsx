import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import CollegePrintRequestQueue from '../components/printRequests/CollegePrintRequestQueue.jsx';
import printRequestReducer from '../features/printRequests/printRequestSlice.js';
import { PRINT_REQUEST_STATUS } from '../constants/printRequest.js';

describe('COLLEGE ADMIN PRINT REQUEST QUEUE UI', () => {
  const store = configureStore({
    reducer: {
      printRequests: printRequestReducer,
    },
  });

  const mockRequests = [
    {
      id: 'req-pending-1',
      requestedBy: {
        id: 'op-1',
        name: 'Rahul Sharma',
        subjectName: 'Mathematics',
        className: '10',
        sectionName: 'A',
      },
      totalCards: 25,
      requestType: 'BULK',
      status: PRINT_REQUEST_STATUS.PENDING_COLLEGE_APPROVAL,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'req-approved-1',
      requestedBy: {
        id: 'op-2',
        name: 'Priya Singh',
        subjectName: 'Physics',
        className: '12',
        sectionName: 'B',
      },
      totalCards: 1,
      requestType: 'SINGLE',
      status: PRINT_REQUEST_STATUS.COLLEGE_APPROVED,
      createdAt: new Date().toISOString(),
    },
  ];

  it('1. CollegePrintRequestQueue renders operator, subject, class, and card counts', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CollegePrintRequestQueue requests={mockRequests} />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Rahul Sharma')).toBeInTheDocument();
    expect(screen.getByText('Mathematics')).toBeInTheDocument();
    expect(screen.getByText('10 (Sec A)')).toBeInTheDocument();
    expect(screen.getByText('25 Cards')).toBeInTheDocument();
    expect(screen.getByText('Pending College Approval')).toBeInTheDocument();
  });

  it('2. PENDING_COLLEGE_APPROVAL shows Approve and Reject action buttons', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CollegePrintRequestQueue requests={[mockRequests[0]]} />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByRole('button', { name: /Approve/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reject/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Forward to Super Admin/i })).not.toBeInTheDocument();
  });

  it('3. Clicking Reject opens the Rejection Reason dialog', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CollegePrintRequestQueue requests={[mockRequests[0]]} />
        </MemoryRouter>
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Reject/i }));
    expect(screen.getByText(/Reject Print Request/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Rejection Reason/i)).toBeInTheDocument();
  });

  it('4. COLLEGE_APPROVED shows Forward to Super Admin button', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CollegePrintRequestQueue requests={[mockRequests[1]]} />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByRole('button', { name: /Forward to Super Admin/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Approve$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Reject$/i })).not.toBeInTheDocument();
  });
});


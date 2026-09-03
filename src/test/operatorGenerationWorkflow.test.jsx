import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import PrintRequestCreatePanel from '../components/printRequests/PrintRequestCreatePanel.jsx';
import printRequestReducer from '../features/printRequests/printRequestSlice.js';
import authReducer from '../features/auth/authSlice.js';
import { ROLES } from '../constants/roles.js';

describe('OPERATOR GENERATION & PRINT REQUEST INTEGRATION WORKFLOW', () => {
  const store = configureStore({
    reducer: {
      printRequests: printRequestReducer,
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: {
          id: 'op-1',
          name: 'Rahul Sharma',
          role: ROLES.OPERATOR,
          className: '10',
          sectionName: 'A',
        },
        token: 'token',
        isAuthenticated: true,
      },
      printRequests: {
        list: [],
        status: 'idle',
        actionStatus: 'idle',
      },
    },
  });

  it('1. Operator selects multiple generated students and creates bulk request', () => {
    const handleSuccess = vi.fn();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <PrintRequestCreatePanel
            generationId="gen-101"
            selectedStudentIds={['s-1', 's-2', 's-3', 's-4']}
            totalAvailable={15}
            onSuccess={handleSuccess}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Type: BULK')).toBeInTheDocument();
    expect(screen.getByText('4 / 15 cards')).toBeInTheDocument();

    const submitBtn = screen.getByText('Submit (4 Cards) for Printing');
    fireEvent.click(submitBtn);

    // Confirmation dialog appears
    expect(screen.getByText('Confirm Print Request Submission')).toBeInTheDocument();
    const confirmBtn = screen.getByText('Confirm & Submit');
    fireEvent.click(confirmBtn);

    expect(handleSuccess).toHaveBeenCalled();
  });
});

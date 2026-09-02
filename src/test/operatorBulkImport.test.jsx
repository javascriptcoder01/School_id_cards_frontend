import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import OperatorStudentBulkImportPage from '../pages/operator/OperatorStudentBulkImportPage.jsx';
import operatorReducer from '../features/operator/operatorSlice.js';

describe('OPERATOR BULK IMPORT UI', () => {
  it('1. parses valid CSV rows and shows submit button', async () => {
    const store = configureStore({
      reducer: { operator: operatorReducer },
      preloadedState: {
        operator: {
          dashboard: { assignments: [{ className: '10', section: 'A' }] },
          importing: false,
          error: null,
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <OperatorStudentBulkImportPage />
        </MemoryRouter>
      </Provider>
    );

    const textarea = screen.getByPlaceholderText(/studentId,name,className/i);
    const validCsv = 'studentId,name,className,section,rollNumber,gender\nSTU-01,Student One,10,A,01,MALE';

    fireEvent.change(textarea, { target: { value: validCsv } });

    expect(screen.getByText('Student One')).toBeInTheDocument();
    expect(screen.getByText(/Submit Bulk Import/i)).toBeInTheDocument();
  });
});


import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import OperatorAssignmentTable from '../components/operatorAssignments/OperatorAssignmentTable.jsx';
import OperatorAssignmentForm from '../components/operatorAssignments/OperatorAssignmentForm.jsx';
import userReducer from '../features/users/userSlice.js';

describe('OPERATOR ASSIGNMENT UI COMPONENTS', () => {
  const store = configureStore({
    reducer: {
      users: userReducer,
    },
    preloadedState: {
      users: {
        users: [
          { id: 'op-1', name: 'Rahul Sharma', email: 'rahul@apex.edu', role: 'OPERATOR', isActive: true },
        ],
        loading: { list: false },
        errors: { list: null },
      },
    },
  });

  it('1. OperatorAssignmentTable renders rows correctly', () => {
    const mockAssignments = [
      {
        id: 'asgn-1',
        operatorId: { name: 'Rahul Sharma', email: 'rahul@apex.edu' },
        className: '10',
        section: 'A',
        isActive: true,
      },
    ];

    render(
      <OperatorAssignmentTable
        assignments={mockAssignments}
        onEdit={vi.fn()}
        onDeactivate={vi.fn()}
      />
    );

    expect(screen.getByText('Rahul Sharma')).toBeInTheDocument();
    expect(screen.getByText('Class 10')).toBeInTheDocument();
    expect(screen.getByText('Section A')).toBeInTheDocument();
  });

  it('2. OperatorAssignmentForm submits valid form values', () => {
    const handleSubmit = vi.fn();
    render(
      <Provider store={store}>
        <OperatorAssignmentForm onSubmit={handleSubmit} onCancel={vi.fn()} />
      </Provider>
    );

    const operatorSelect = screen.getByLabelText(/Assigned Operator/i);
    const classInput = screen.getByLabelText(/Class \/ Grade/i);
    const sectionInput = screen.getByLabelText(/Section/i);

    fireEvent.change(operatorSelect, { target: { value: 'op-1' } });
    fireEvent.change(classInput, { target: { value: '10' } });
    fireEvent.change(sectionInput, { target: { value: 'B' } });

    fireEvent.click(screen.getByText('Create Assignment'));

    expect(handleSubmit).toHaveBeenCalledWith({
      operatorId: 'op-1',
      className: '10',
      section: 'B',
    });
  });
});


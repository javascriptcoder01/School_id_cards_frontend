import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import OperatorAssignmentTable from '../components/operatorAssignments/OperatorAssignmentTable.jsx';
import OperatorAssignmentForm from '../components/operatorAssignments/OperatorAssignmentForm.jsx';
import UserForm from '../components/users/UserForm.jsx';
import UserDetailPage from '../pages/users/UserDetailPage.jsx';
import userReducer from '../features/users/userSlice.js';
import authReducer from '../features/auth/authSlice.js';
import { ROLES } from '../constants/roles.js';

describe('OPERATOR ASSIGNMENT UI COMPONENTS & USER FORM', () => {
  const store = configureStore({
    reducer: {
      users: userReducer,
      auth: authReducer,
    },
    preloadedState: {
      users: {
        users: [
          { id: 'op-1', name: 'Rahul Sharma', email: 'rahul@apex.edu', role: 'OPERATOR', isActive: true },
        ],
        selectedUser: {
          id: 'op-1',
          name: 'Rahul Sharma',
          email: 'rahul@apex.edu',
          role: ROLES.OPERATOR,
          collegeId: 'col-1',
          subjectName: 'Mathematics',
          className: '10',
          sectionName: 'A',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        list: { isLoading: false, error: null },
        detail: { isLoading: false, error: null },
        create: { isLoading: false, error: null, success: false },
        update: { isLoading: false, error: null, success: false },
        statusUpdate: { isLoading: false, error: null, success: false },
      },
      auth: {
        user: { id: 'admin-1', role: ROLES.COLLEGE_ADMIN, collegeId: 'col-1' },
        token: 'token',
        isAuthenticated: true,
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

  it('3. UserForm renders Subject, Class, and Section inputs for OPERATOR role', () => {
    const handleSubmit = vi.fn();
    render(
      <MemoryRouter>
        <UserForm
          isSuperAdmin={false}
          isEdit={false}
          onSubmit={handleSubmit}
        />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Subject Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Class \/ Grade/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Section/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Min 8 characters/i), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText(/Subject Name/i), { target: { value: 'Physics' } });
    fireEvent.change(screen.getByLabelText(/Class \/ Grade/i), { target: { value: '12th' } });
    fireEvent.change(screen.getByLabelText(/Section/i), { target: { value: 'B' } });

    fireEvent.click(screen.getByText('Create User'));

    expect(handleSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
      role: ROLES.OPERATOR,
      subjectName: 'Physics',
      className: '12th',
      sectionName: 'B',
    });
  });

  it('4. UserForm pre-populates assignment values on edit', () => {
    const handleSubmit = vi.fn();
    render(
      <MemoryRouter>
        <UserForm
          isSuperAdmin={false}
          isEdit={true}
          initialValues={{
            name: 'Jane Doe',
            email: 'jane@example.com',
            role: ROLES.OPERATOR,
            subjectName: 'Chemistry',
            className: '11th',
            sectionName: 'C',
          }}
          onSubmit={handleSubmit}
        />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Subject Name/i)).toHaveValue('Chemistry');
    expect(screen.getByLabelText(/Class \/ Grade/i)).toHaveValue('11th');
    expect(screen.getByLabelText(/Section/i)).toHaveValue('C');
  });

  it('5. UserDetailPage displays operator assignment details', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <UserDetailPage />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getAllByText('Rahul Sharma')[0]).toBeInTheDocument();
    expect(screen.getByText('Mathematics')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
  });
});

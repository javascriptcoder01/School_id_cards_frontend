import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import StudentForm from '../components/students/StudentForm.jsx';
import StudentCompletionMetric, {
  computeStudentCompletion,
} from '../components/students/StudentCompletionMetric.jsx';
import StudentTable from '../components/students/StudentTable.jsx';
import authReducer from '../features/auth/authSlice.js';
import { ROLES } from '../constants/roles.js';

describe('OPERATOR STUDENT SCOPE & COMPLETION METRICS', () => {
  const createTestStore = (role, userOverrides = {}) =>
    configureStore({
      reducer: {
        auth: authReducer,
      },
      preloadedState: {
        auth: {
          user: {
            id: 'op-1',
            role,
            collegeId: 'col-1',
            subjectName: 'Mathematics',
            className: '10',
            sectionName: 'A',
            ...userOverrides,
          },
          token: 'token',
          isAuthenticated: true,
        },
      },
    });

  it('1. Operator student form displays Operator Assignment Scope banner', () => {
    const store = createTestStore(ROLES.OPERATOR);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <StudentForm onSubmit={vi.fn()} onCancel={vi.fn()} />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/Operator Assignment Scope/i)).toBeInTheDocument();
    expect(screen.getByText(/Mathematics/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Class and Section are automatically assigned from your Operator profile/i)
    ).toBeInTheDocument();
  });

  it('2. Operator student form makes Class and Section read-only', () => {
    const store = createTestStore(ROLES.OPERATOR);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <StudentForm onSubmit={vi.fn()} onCancel={vi.fn()} />
        </MemoryRouter>
      </Provider>
    );

    const classInput = screen.getByLabelText(/Class \/ Course/i);
    const sectionInput = screen.getByLabelText(/Section/i);

    expect(classInput).toBeDisabled();
    expect(sectionInput).toBeDisabled();
    expect(classInput).toHaveValue('10');
    expect(sectionInput).toHaveValue('A');
  });

  it('3. College Admin student form permits full editing of Class and Section', () => {
    const store = createTestStore(ROLES.COLLEGE_ADMIN);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <StudentForm onSubmit={vi.fn()} onCancel={vi.fn()} />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.queryByText(/Operator Assignment Scope/i)).not.toBeInTheDocument();

    const classInput = screen.getByLabelText(/Class \/ Course/i);
    const sectionInput = screen.getByLabelText(/Section/i);

    expect(classInput).not.toBeDisabled();
    expect(sectionInput).not.toBeDisabled();
  });

  it('4. computeStudentCompletion returns 100% COMPLETED for complete student profile', () => {
    const completeStudent = {
      name: 'John Doe',
      studentId: 'STU-001',
      className: '10th',
      section: 'A',
      photo: 'https://example.com/photo.jpg',
    };

    const res = computeStudentCompletion(completeStudent);
    expect(res.isComplete).toBe(true);
    expect(res.percentage).toBe(100);
    expect(res.completedCount).toBe(5);
    expect(res.missingFields.length).toBe(0);

    render(<StudentCompletionMetric student={completeStudent} showDetail={true} />);
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
  });

  it('5. computeStudentCompletion returns PENDING and lists missing fields', () => {
    const incompleteStudent = {
      name: 'Jane Doe',
      studentId: 'STU-002',
      className: '10th',
      section: '',
      photo: '',
    };

    const res = computeStudentCompletion(incompleteStudent);
    expect(res.isComplete).toBe(false);
    expect(res.percentage).toBe(60);
    expect(res.missingFields).toContain('Section');
    expect(res.missingFields).toContain('Photo');

    render(<StudentCompletionMetric student={incompleteStudent} showDetail={true} />);
    expect(screen.getByText(/PENDING \(60%\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Missing: Section, Photo/i)).toBeInTheDocument();
  });

  it('6. StudentTable displays completion metrics and handles multi-select', () => {
    const students = [
      {
        id: 's-1',
        name: 'Student One',
        studentId: 'STU-1',
        className: '10',
        section: 'A',
        photo: 'https://example.com/1.jpg',
        isActive: true,
      },
      {
        id: 's-2',
        name: 'Student Two',
        studentId: 'STU-2',
        className: '10',
        section: 'A',
        photo: '',
        isActive: true,
      },
    ];

    const handleSelectToggle = vi.fn();

    render(
      <MemoryRouter>
        <StudentTable
          students={students}
          selectable={true}
          selectedIds={['s-1']}
          onSelectToggle={handleSelectToggle}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Student One')).toBeInTheDocument();
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    expect(screen.getByText(/PENDING \(80%\)/i)).toBeInTheDocument();

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(3); // 1 select-all + 2 row checkboxes
    fireEvent.click(checkboxes[2]);
    expect(handleSelectToggle).toHaveBeenCalledWith('s-2');
  });
});


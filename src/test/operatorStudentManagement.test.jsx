import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { calculateStudentCompletion } from '../utils/studentCompletion.js';
import OperatorAssignmentBanner from '../components/students/OperatorAssignmentBanner.jsx';
import StudentCompletionMetric from '../components/students/StudentCompletionMetric.jsx';
import StudentForm from '../components/students/StudentForm.jsx';
import authReducer from '../features/auth/authSlice.js';

describe('Operator Student Management & Profile Completeness (Batch 19)', () => {
  describe('Deterministic 5-field calculateStudentCompletion', () => {
    it('returns complete when all 5 required fields are present and valid', () => {
      const student = {
        name: 'Rahul Sharma',
        studentId: 'STU-1001',
        className: '10',
        section: 'A',
        photo: 'https://example.com/photos/rahul.jpg',
      };
      const result = calculateStudentCompletion(student);
      expect(result.isComplete).toBe(true);
      expect(result.completedCount).toBe(5);
      expect(result.totalRequired).toBe(5);
      expect(result.percentage).toBe(100);
      expect(result.missingFields).toHaveLength(0);
    });

    it('identifies missing fields and returns incomplete status', () => {
      const student = {
        name: 'Priya Patel',
        studentId: '',
        className: '10',
        section: '',
        photo: null,
      };
      const result = calculateStudentCompletion(student);
      expect(result.isComplete).toBe(false);
      expect(result.completedCount).toBe(2); // name & className
      expect(result.percentage).toBe(40);
      expect(result.missingFields).toContain('studentId');
      expect(result.missingFields).toContain('section');
      expect(result.missingFields).toContain('photo');
    });

    it('handles legacy and alias field names (class vs className, sectionName vs section)', () => {
      const student = {
        name: 'Amit Verma',
        studentId: 'STU-1002',
        class: '12',
        sectionName: 'B',
        photoUrl: 'https://example.com/photos/amit.jpg',
      };
      const result = calculateStudentCompletion(student);
      expect(result.isComplete).toBe(true);
      expect(result.percentage).toBe(100);
    });
  });

  describe('OperatorAssignmentBanner Component', () => {
    it('renders operator scope information clearly', () => {
      render(
        <OperatorAssignmentBanner
          className="Class 10"
          sectionName="Sec A"
          subjectName="Computer Science"
          operatorName="John Doe"
        />
      );

      expect(screen.getByText(/Operator Assignment Scope/i)).toBeDefined();
      expect(screen.getByText(/Class 10/i)).toBeDefined();
      expect(screen.getByText(/Sec A/i)).toBeDefined();
      expect(screen.getByText(/Computer Science/i)).toBeDefined();
    });

    it('returns null if no class or section is provided', () => {
      const { container } = render(<OperatorAssignmentBanner />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('StudentCompletionMetric Component', () => {
    it('renders 100% Complete status badge for complete student', () => {
      const student = {
        name: 'Sneha Rao',
        studentId: 'STU-1003',
        className: '9',
        section: 'C',
        photo: 'https://example.com/photo.jpg',
      };
      render(<StudentCompletionMetric student={student} />);
      expect(screen.getByText(/COMPLETED/i)).toBeDefined();
    });

    it('renders incomplete status with missing count for partial student', () => {
      const student = {
        name: 'Sneha Rao',
        studentId: '',
        className: '9',
        section: 'C',
        photo: '',
      };
      render(<StudentCompletionMetric student={student} showDetail={true} />);
      expect(screen.getByText(/60%/i)).toBeDefined();
      expect(screen.getByText(/Missing: Student ID, Photo/i)).toBeDefined();
    });
  });

  describe('StudentForm for OPERATOR Role', () => {
    it('renders className and section as disabled/read-only fields with prefilled scope', () => {
      const store = configureStore({
        reducer: {
          auth: authReducer,
        },
        preloadedState: {
          auth: {
            user: {
              role: 'OPERATOR',
              name: 'Jane Operator',
              className: '10',
              sectionName: 'A',
              subjectName: 'Mathematics',
            },
            token: 'test-token',
          },
        },
      });

      render(
        <Provider store={store}>
          <MemoryRouter>
            <StudentForm
              onSubmit={vi.fn()}
              operatorScope={{ className: '10', sectionName: 'A' }}
            />
          </MemoryRouter>
        </Provider>
      );

      const classInput = screen.getByLabelText(/Class \/ Course/i);
      const sectionInput = screen.getByLabelText(/Section/i);

      expect(classInput.value).toBe('10');
      expect(classInput.disabled).toBe(true);
      expect(sectionInput.value).toBe('A');
      expect(sectionInput.disabled).toBe(true);
      expect(screen.getAllByText(/Assigned from operator profile/i).length).toBeGreaterThan(0);
    });
  });
});

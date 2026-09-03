import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import StudentGenerationSelector from '../components/idCardGeneration/StudentGenerationSelector.jsx';
import TemplateGenerationSelector from '../components/idCardGeneration/TemplateGenerationSelector.jsx';
import GenerationReviewPanel from '../components/idCardGeneration/GenerationReviewPanel.jsx';
import OperatorGenerateCardsPage from '../pages/idCards/OperatorGenerateCardsPage.jsx';
import operatorReducer from '../features/operator/operatorSlice.js';
import authReducer from '../features/auth/authSlice.js';

describe('Operator Bulk ID Card Generation Wizard (Batch 19)', () => {
  const mockStudents = [
    {
      id: 's1',
      name: 'Alice Johnson',
      studentId: 'STU-001',
      className: '10',
      section: 'A',
      photo: 'https://example.com/alice.jpg',
    },
    {
      id: 's2',
      name: 'Bob Smith',
      studentId: 'STU-002',
      className: '10',
      section: 'A',
      photo: '', // Incomplete
    },
    {
      id: 's3',
      name: 'Charlie Brown',
      studentId: 'STU-003',
      className: '10',
      section: 'A',
      photo: 'https://example.com/charlie.jpg',
    },
  ];

  const mockTemplates = [
    {
      id: 't1',
      name: 'Standard Portrait ID',
      orientation: 'portrait',
      width: 54,
      height: 86,
    },
    {
      id: 't2',
      name: 'Executive Landscape Badge',
      orientation: 'landscape',
      width: 86,
      height: 54,
    },
  ];

  describe('StudentGenerationSelector Component', () => {
    it('disables incomplete students from selection and allows selecting complete students', () => {
      const onSelectionChange = vi.fn();

      render(
        <StudentGenerationSelector
          students={mockStudents}
          selectedStudentIds={[]}
          onSelectionChange={onSelectionChange}
        />
      );

      // Check for eligible count badge
      expect(screen.getByTestId('eligible-count-badge')).toBeDefined();
      expect(screen.getByText(/Eligible:/i)).toBeDefined();

      // Alice checkbox should be enabled
      const aliceCheckbox = screen.getByLabelText(/Select student Alice Johnson/i);
      expect(aliceCheckbox.disabled).toBe(false);

      // Bob checkbox should be disabled because profile is incomplete
      const bobCheckbox = screen.getByLabelText(/Select student Bob Smith/i);
      expect(bobCheckbox.disabled).toBe(true);

      // Clicking Alice should invoke selection change
      fireEvent.click(aliceCheckbox);
      expect(onSelectionChange).toHaveBeenCalledWith(['s1']);
    });

    it('selects all eligible students on "Select All Eligible" click', () => {
      const onSelectionChange = vi.fn();

      render(
        <StudentGenerationSelector
          students={mockStudents}
          selectedStudentIds={[]}
          onSelectionChange={onSelectionChange}
        />
      );

      const selectAllBtn = screen.getByRole('button', { name: /Select All Eligible/i });
      fireEvent.click(selectAllBtn);

      expect(onSelectionChange).toHaveBeenCalledWith(['s1', 's3']);
    });
  });

  describe('TemplateGenerationSelector Component', () => {
    it('renders templates and allows selecting a template', () => {
      const onSelectTemplate = vi.fn();

      render(
        <TemplateGenerationSelector
          templates={mockTemplates}
          selectedTemplateId="t1"
          onSelectTemplate={onSelectTemplate}
        />
      );

      expect(screen.getByText('Standard Portrait ID')).toBeDefined();
      expect(screen.getByText('Executive Landscape Badge')).toBeDefined();

      const secondTemplate = screen.getByText('Executive Landscape Badge');
      fireEvent.click(secondTemplate);

      expect(onSelectTemplate).toHaveBeenCalledWith('t2');
    });
  });

  describe('GenerationReviewPanel Component', () => {
    it('renders review summary and triggers onSubmit', () => {
      const onSubmit = vi.fn();

      render(
        <GenerationReviewPanel
          selectedStudentsCount={5}
          eligibleStudentsCount={10}
          selectedTemplate={mockTemplates[0]}
          operatorScope={{ className: '10', sectionName: 'A', subjectName: 'Physics' }}
          onSubmit={onSubmit}
        />
      );

      expect(screen.getByText(/Review & Generate ID Cards/i)).toBeDefined();
      expect(screen.getByText('Standard Portrait ID')).toBeDefined();
      expect(screen.getByText(/10 Sec A/i)).toBeDefined();

      const generateBtn = screen.getByRole('button', { name: /Generate 5 ID Cards/i });
      fireEvent.click(generateBtn);

      expect(onSubmit).toHaveBeenCalled();
    });
  });

  describe('OperatorGenerateCardsPage 3-Step Wizard Navigation', () => {
    it('advances through steps 1, 2, and 3', () => {
      const store = configureStore({
        reducer: {
          operator: operatorReducer,
          auth: authReducer,
        },
        preloadedState: {
          auth: {
            user: { role: 'OPERATOR', className: '10', sectionName: 'A' },
          },
          operator: {
            students: mockStudents,
            templates: mockTemplates,
            loading: false,
            generating: false,
          },
        },
      });

      render(
        <Provider store={store}>
          <MemoryRouter>
            <OperatorGenerateCardsPage />
          </MemoryRouter>
        </Provider>
      );

      // Step 1: Select Eligible Students
      expect(screen.getByText(/Step 1/i)).toBeDefined();
      const selectAllBtn = screen.getByRole('button', { name: /Select All Eligible/i });
      fireEvent.click(selectAllBtn);

      // Click Next to Step 2
      const nextToTemplatesBtn = screen.getByRole('button', { name: /Next: Select Template/i });
      fireEvent.click(nextToTemplatesBtn);

      // Step 2: Choose Template
      expect(screen.getByText(/Step 2/i)).toBeDefined();
      const nextToReviewBtn = screen.getByRole('button', { name: /Next: Review & Generate/i });
      fireEvent.click(nextToReviewBtn);

      // Step 3: Review & Generate
      expect(screen.getAllByText(/Review/i).length).toBeGreaterThan(0);
      expect(screen.getByRole('button', { name: /Generate 2 ID Cards/i })).toBeDefined();
    });
  });
});

import { describe, it, expect } from 'vitest';
import operatorReducer, {
  loadOperatorDashboardRequested,
  loadOperatorDashboardSucceeded,
  createOperatorStudentRequested,
  createOperatorStudentSucceeded,
  updateOperatorStudentRequested,
  updateOperatorStudentSucceeded,
  previewOperatorIdCardRequested,
  previewOperatorIdCardSucceeded,
  createOperatorGenerationRequested,
  createOperatorGenerationSucceeded,
  clearOperatorPreview,
} from '../features/operator/operatorSlice.js';

describe('OPERATOR WORKSPACE SLICE', () => {
  const initialState = {
    dashboard: null,
    students: [],
    selectedStudent: null,
    templates: [],
    preview: null,
    generations: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    generationsPagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    loading: false,
    loadingStudents: false,
    loadingTemplates: false,
    loadingGenerations: false,
    saving: false,
    importing: false,
    previewing: false,
    generating: false,
    error: null,
    initialized: false,
  };

  it('1. returns expected initial state', () => {
    expect(operatorReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('2. handles dashboard loading lifecycle', () => {
    let state = operatorReducer(initialState, loadOperatorDashboardRequested());
    expect(state.loading).toBe(true);

    const mockDashboard = { summary: { totalStudents: 40 }, assignments: [{ className: '10', section: 'A' }] };
    state = operatorReducer(state, loadOperatorDashboardSucceeded(mockDashboard));
    expect(state.loading).toBe(false);
    expect(state.initialized).toBe(true);
    expect(state.dashboard).toEqual(mockDashboard);
  });

  it('3. handles student CRUD actions in slice', () => {
    const student1 = { id: 's-1', name: 'Aarav', className: '10', section: 'A' };
    let state = operatorReducer(initialState, createOperatorStudentSucceeded({ student: student1 }));
    expect(state.students).toHaveLength(1);

    const updatedStudent1 = { id: 's-1', name: 'Aarav Updated', className: '10', section: 'A' };
    state = operatorReducer(state, updateOperatorStudentSucceeded({ student: updatedStudent1 }));
    expect(state.students[0].name).toBe('Aarav Updated');
  });

  it('4. handles preview actions in slice', () => {
    let state = operatorReducer(initialState, previewOperatorIdCardRequested());
    expect(state.previewing).toBe(true);

    state = operatorReducer(state, previewOperatorIdCardSucceeded({ previewUrl: 'data:image...' }));
    expect(state.previewing).toBe(false);
    expect(state.preview).toEqual({ previewUrl: 'data:image...' });

    state = operatorReducer(state, clearOperatorPreview());
    expect(state.preview).toBeNull();
  });

  it('5. handles generation creation and list', () => {
    const genJob = { id: 'g-1', status: 'PENDING' };
    let state = operatorReducer(initialState, createOperatorGenerationSucceeded({ generation: genJob }));
    expect(state.generations).toContainEqual(genJob);
  });

  it('6. clears state on auth/logoutSucceeded', () => {
    const populated = { ...initialState, dashboard: { summary: {} }, initialized: true };
    const state = operatorReducer(populated, { type: 'auth/logoutSucceeded' });
    expect(state).toEqual(initialState);
  });
});

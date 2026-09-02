import { describe, it, expect } from 'vitest';
import operatorAssignmentReducer, {
  loadOperatorAssignmentsRequested,
  loadOperatorAssignmentsSucceeded,
  loadOperatorAssignmentsFailed,
  createOperatorAssignmentRequested,
  createOperatorAssignmentSucceeded,
  createOperatorAssignmentFailed,
  updateOperatorAssignmentRequested,
  updateOperatorAssignmentSucceeded,
  updateOperatorAssignmentFailed,
  deleteOperatorAssignmentRequested,
  deleteOperatorAssignmentSucceeded,
  deleteOperatorAssignmentFailed,
  resetOperatorAssignmentState,
} from '../features/operatorAssignments/operatorAssignmentSlice.js';

describe('OPERATOR ASSIGNMENT SLICE', () => {
  const initialState = {
    assignments: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    loading: false,
    saving: false,
    deleting: false,
    error: null,
    initialized: false,
  };

  it('1. returns expected initial state', () => {
    expect(operatorAssignmentReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('2. handles loadOperatorAssignmentsRequested and Succeeded', () => {
    let state = operatorAssignmentReducer(initialState, loadOperatorAssignmentsRequested());
    expect(state.loading).toBe(true);

    const assignments = [{ id: 'asgn-1', className: '10', section: 'A' }];
    state = operatorAssignmentReducer(
      state,
      loadOperatorAssignmentsSucceeded({ assignments, pagination: { total: 1 } })
    );
    expect(state.loading).toBe(false);
    expect(state.initialized).toBe(true);
    expect(state.assignments).toHaveLength(1);
    expect(state.pagination.total).toBe(1);
  });

  it('3. handles createOperatorAssignmentRequested and Succeeded', () => {
    let state = operatorAssignmentReducer(initialState, createOperatorAssignmentRequested());
    expect(state.saving).toBe(true);

    const newAssignment = { id: 'asgn-2', className: '9', section: 'B' };
    state = operatorAssignmentReducer(
      state,
      createOperatorAssignmentSucceeded({ assignment: newAssignment })
    );
    expect(state.saving).toBe(false);
    expect(state.assignments).toContainEqual(newAssignment);
  });

  it('4. handles updateOperatorAssignmentSucceeded', () => {
    const existingState = {
      ...initialState,
      assignments: [{ id: 'asgn-1', className: '10', section: 'A' }],
    };
    const updatedAssignment = { id: 'asgn-1', className: '10', section: 'C' };
    const state = operatorAssignmentReducer(
      existingState,
      updateOperatorAssignmentSucceeded({ assignment: updatedAssignment })
    );
    expect(state.assignments[0].section).toBe('C');
  });

  it('5. handles deleteOperatorAssignmentSucceeded', () => {
    const existingState = {
      ...initialState,
      assignments: [{ id: 'asgn-1', className: '10', section: 'A' }],
    };
    const state = operatorAssignmentReducer(
      existingState,
      deleteOperatorAssignmentSucceeded({ assignmentId: 'asgn-1' })
    );
    expect(state.assignments).toHaveLength(0);
  });

  it('6. clears state on reset or auth/logoutSucceeded', () => {
    const populatedState = {
      ...initialState,
      assignments: [{ id: 'asgn-1' }],
      initialized: true,
    };
    const state = operatorAssignmentReducer(populatedState, { type: 'auth/logoutSucceeded' });
    expect(state).toEqual(initialState);
  });
});


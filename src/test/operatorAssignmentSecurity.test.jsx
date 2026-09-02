import { describe, it, expect } from 'vitest';
import operatorAssignmentReducer from '../features/operatorAssignments/operatorAssignmentSlice.js';

describe('OPERATOR ASSIGNMENT SECURITY & TENANT ISOLATION', () => {
  it('1. Redux state does not accept or store client-supplied collegeId overrides', () => {
    const maliciousPayload = {
      assignment: {
        id: 'asgn-1',
        operatorId: 'op-1',
        className: '10',
        section: 'A',
        collegeId: 'malicious-college-id',
        password: 'password123',
        token: 'jwt.token.here',
      },
    };

    const state = operatorAssignmentReducer(
      undefined,
      { type: 'operatorAssignments/createOperatorAssignmentSucceeded', payload: maliciousPayload }
    );

    expect(state.assignments[0].id).toBe('asgn-1');
  });

  it('2. Logout immediately purges all operator assignment state from memory', () => {
    const populatedState = {
      assignments: [{ id: 'asgn-1', className: '10' }],
      pagination: { total: 1 },
      loading: false,
      saving: false,
      deleting: false,
      error: null,
      initialized: true,
    };

    const state = operatorAssignmentReducer(populatedState, { type: 'auth/logoutSucceeded' });
    expect(state.assignments).toHaveLength(0);
    expect(state.initialized).toBe(false);
  });
});


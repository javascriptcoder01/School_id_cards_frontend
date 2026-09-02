import { describe, it, expect, vi } from 'vitest';
import { call, put } from 'redux-saga/effects';
import {
  loadOperatorAssignmentsWorker,
  createOperatorAssignmentWorker,
  updateOperatorAssignmentWorker,
  deleteOperatorAssignmentWorker,
} from '../features/operatorAssignments/operatorAssignmentSaga.js';
import {
  fetchOperatorAssignments,
  createOperatorAssignment,
  updateOperatorAssignment,
  deleteOperatorAssignment,
} from '../features/operatorAssignments/operatorAssignmentApi.js';
import {
  loadOperatorAssignmentsSucceeded,
  createOperatorAssignmentSucceeded,
  updateOperatorAssignmentSucceeded,
  deleteOperatorAssignmentSucceeded,
} from '../features/operatorAssignments/operatorAssignmentSlice.js';
import { showNotification } from '../features/notifications/notificationSlice.js';

describe('OPERATOR ASSIGNMENT SAGA', () => {
  it('1. loadOperatorAssignmentsWorker dispatches success on valid response', () => {
    const generator = loadOperatorAssignmentsWorker({ payload: {} });
    expect(generator.next().value).toEqual(call(fetchOperatorAssignments, {}));

    const mockData = {
      assignments: [{ id: 'asgn-1', className: '10' }],
      pagination: { total: 1 },
    };
    expect(generator.next(mockData).value).toEqual(
      put(loadOperatorAssignmentsSucceeded({ assignments: mockData.assignments, pagination: mockData.pagination }))
    );
    expect(generator.next().done).toBe(true);
  });

  it('2. createOperatorAssignmentWorker dispatches success and notification', () => {
    const payload = { operatorId: 'op-1', className: '10', section: 'A' };
    const generator = createOperatorAssignmentWorker({ payload });
    expect(generator.next().value).toEqual(call(createOperatorAssignment, payload));

    const mockResponse = { assignment: { id: 'asgn-1', ...payload } };
    expect(generator.next(mockResponse).value).toEqual(
      put(createOperatorAssignmentSucceeded(mockResponse))
    );
    expect(generator.next().value).toEqual(
      put(
        showNotification({
          type: 'SUCCESS',
          title: 'Assignment Created',
          message: 'Operator assignment created successfully.',
        })
      )
    );
    expect(generator.next().done).toBe(true);
  });

  it('3. deleteOperatorAssignmentWorker dispatches success and notification', () => {
    const generator = deleteOperatorAssignmentWorker({ payload: { assignmentId: 'asgn-1' } });
    expect(generator.next().value).toEqual(call(deleteOperatorAssignment, 'asgn-1'));

    expect(generator.next().value).toEqual(
      put(deleteOperatorAssignmentSucceeded({ assignmentId: 'asgn-1' }))
    );
    expect(generator.next().value).toEqual(
      put(
        showNotification({
          type: 'SUCCESS',
          title: 'Assignment Deactivated',
          message: 'Operator assignment deactivated successfully.',
        })
      )
    );
    expect(generator.next().done).toBe(true);
  });
});


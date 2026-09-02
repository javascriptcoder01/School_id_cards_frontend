import { takeLatest, call, put } from 'redux-saga/effects';
import {
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
} from './operatorAssignmentSlice.js';
import {
  fetchOperatorAssignments,
  createOperatorAssignment,
  updateOperatorAssignment,
  deleteOperatorAssignment,
} from './operatorAssignmentApi.js';
import { showNotification } from '../notifications/notificationSlice.js';

export function* loadOperatorAssignmentsWorker(action) {
  try {
    const params = action.payload || {};
    const data = yield call(fetchOperatorAssignments, params);
    yield put(
      loadOperatorAssignmentsSucceeded({
        assignments: data?.assignments || [],
        pagination: data?.pagination || {},
      })
    );
  } catch (error) {
    const message = error?.message || 'Failed to load operator assignments';
    yield put(loadOperatorAssignmentsFailed(message));
    yield put(
      showNotification({
        type: 'ERROR',
        title: 'Error Loading Assignments',
        message,
      })
    );
  }
}

export function* createOperatorAssignmentWorker(action) {
  try {
    const payload = action.payload || {};
    const data = yield call(createOperatorAssignment, payload);
    yield put(createOperatorAssignmentSucceeded(data));
    yield put(
      showNotification({
        type: 'SUCCESS',
        title: 'Assignment Created',
        message: 'Operator assignment created successfully.',
      })
    );
  } catch (error) {
    const message = error?.message || 'Failed to create operator assignment';
    yield put(createOperatorAssignmentFailed(message));
    yield put(
      showNotification({
        type: 'ERROR',
        title: 'Creation Failed',
        message,
      })
    );
  }
}

export function* updateOperatorAssignmentWorker(action) {
  try {
    const { assignmentId, updates } = action.payload || {};
    const data = yield call(updateOperatorAssignment, assignmentId, updates);
    yield put(updateOperatorAssignmentSucceeded(data));
    yield put(
      showNotification({
        type: 'SUCCESS',
        title: 'Assignment Updated',
        message: 'Operator assignment updated successfully.',
      })
    );
  } catch (error) {
    const message = error?.message || 'Failed to update operator assignment';
    yield put(updateOperatorAssignmentFailed(message));
    yield put(
      showNotification({
        type: 'ERROR',
        title: 'Update Failed',
        message,
      })
    );
  }
}

export function* deleteOperatorAssignmentWorker(action) {
  try {
    const assignmentId = typeof action.payload === 'object' ? action.payload.assignmentId : action.payload;
    yield call(deleteOperatorAssignment, assignmentId);
    yield put(deleteOperatorAssignmentSucceeded({ assignmentId }));
    yield put(
      showNotification({
        type: 'SUCCESS',
        title: 'Assignment Deactivated',
        message: 'Operator assignment deactivated successfully.',
      })
    );
  } catch (error) {
    const message = error?.message || 'Failed to deactivate operator assignment';
    yield put(deleteOperatorAssignmentFailed(message));
    yield put(
      showNotification({
        type: 'ERROR',
        title: 'Deactivation Failed',
        message,
      })
    );
  }
}

export function* watchOperatorAssignments() {
  yield takeLatest(loadOperatorAssignmentsRequested.type, loadOperatorAssignmentsWorker);
  yield takeLatest(createOperatorAssignmentRequested.type, createOperatorAssignmentWorker);
  yield takeLatest(updateOperatorAssignmentRequested.type, updateOperatorAssignmentWorker);
  yield takeLatest(deleteOperatorAssignmentRequested.type, deleteOperatorAssignmentWorker);
}

export default watchOperatorAssignments;


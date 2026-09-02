import { describe, it, expect } from 'vitest';
import { call, put } from 'redux-saga/effects';
import {
  loadOperatorDashboardWorker,
  createOperatorStudentWorker,
  previewOperatorIdCardWorker,
  createOperatorGenerationWorker,
} from '../features/operator/operatorSaga.js';
import {
  getOperatorDashboard,
  createOperatorStudent,
  previewOperatorIdCard,
  createOperatorGeneration,
} from '../features/operator/operatorApi.js';
import {
  loadOperatorDashboardSucceeded,
  createOperatorStudentSucceeded,
  previewOperatorIdCardSucceeded,
  createOperatorGenerationSucceeded,
} from '../features/operator/operatorSlice.js';
import { showNotification } from '../features/notifications/notificationSlice.js';

describe('OPERATOR WORKSPACE SAGA', () => {
  it('1. loadOperatorDashboardWorker dispatches success on API response', () => {
    const generator = loadOperatorDashboardWorker();
    expect(generator.next().value).toEqual(call(getOperatorDashboard));

    const mockData = { summary: { totalStudents: 40 }, assignments: [] };
    expect(generator.next(mockData).value).toEqual(put(loadOperatorDashboardSucceeded(mockData)));
    expect(generator.next().done).toBe(true);
  });

  it('2. createOperatorStudentWorker dispatches success and notification', () => {
    const payload = { name: 'Pooja', studentId: 'S-2', className: '10', section: 'A' };
    const generator = createOperatorStudentWorker({ payload });
    expect(generator.next().value).toEqual(call(createOperatorStudent, payload));

    const mockResponse = { student: { id: 's-2', ...payload } };
    expect(generator.next(mockResponse).value).toEqual(put(createOperatorStudentSucceeded(mockResponse)));
    expect(generator.next().value).toEqual(
      put(
        showNotification({
          type: 'SUCCESS',
          title: 'Student Created',
          message: 'Student created successfully within your assigned class scope.',
        })
      )
    );
    expect(generator.next().done).toBe(true);
  });

  it('3. previewOperatorIdCardWorker dispatches success on preview rendering', () => {
    const payload = { studentId: 's-1', templateId: 't-1' };
    const generator = previewOperatorIdCardWorker({ payload });
    expect(generator.next().value).toEqual(call(previewOperatorIdCard, payload));

    const mockPreview = { previewUrl: 'data:image...' };
    expect(generator.next(mockPreview).value).toEqual(put(previewOperatorIdCardSucceeded(mockPreview)));
    expect(generator.next().value).toEqual(
      put(
        showNotification({
          type: 'SUCCESS',
          title: 'Preview Generated',
          message: 'ID Card preview generated successfully.',
        })
      )
    );
    expect(generator.next().done).toBe(true);
  });
});

import { takeLatest, call, put } from 'redux-saga/effects';
import {
  loadOperatorDashboardRequested,
  loadOperatorDashboardSucceeded,
  loadOperatorDashboardFailed,
  loadOperatorStudentsRequested,
  loadOperatorStudentsSucceeded,
  loadOperatorStudentsFailed,
  loadOperatorStudentRequested,
  loadOperatorStudentSucceeded,
  loadOperatorStudentFailed,
  createOperatorStudentRequested,
  createOperatorStudentSucceeded,
  createOperatorStudentFailed,
  updateOperatorStudentRequested,
  updateOperatorStudentSucceeded,
  updateOperatorStudentFailed,
  importOperatorStudentsRequested,
  importOperatorStudentsSucceeded,
  importOperatorStudentsFailed,
  loadOperatorTemplatesRequested,
  loadOperatorTemplatesSucceeded,
  loadOperatorTemplatesFailed,
  previewOperatorIdCardRequested,
  previewOperatorIdCardSucceeded,
  previewOperatorIdCardFailed,
  createOperatorGenerationRequested,
  createOperatorGenerationSucceeded,
  createOperatorGenerationFailed,
  loadOperatorGenerationsRequested,
  loadOperatorGenerationsSucceeded,
  loadOperatorGenerationsFailed,
} from './operatorSlice.js';
import {
  getOperatorDashboard,
  getOperatorStudents,
  getOperatorStudentById,
  createOperatorStudent,
  updateOperatorStudent,
  importOperatorStudents,
  getOperatorTemplates,
  previewOperatorIdCard,
  createOperatorGeneration,
  getOperatorGenerations,
} from './operatorApi.js';
import { showNotification } from '../notifications/notificationSlice.js';

export function* loadOperatorDashboardWorker() {
  try {
    const data = yield call(getOperatorDashboard);
    yield put(loadOperatorDashboardSucceeded(data));
  } catch (error) {
    const message = error?.message || 'Failed to load operator dashboard';
    yield put(loadOperatorDashboardFailed(message));
    yield put(
      showNotification({
        type: 'ERROR',
        title: 'Operator Dashboard Error',
        message,
      })
    );
  }
}

export function* loadOperatorStudentsWorker(action) {
  try {
    const params = action.payload || {};
    const data = yield call(getOperatorStudents, params);
    yield put(
      loadOperatorStudentsSucceeded({
        students: data.students || [],
        pagination: data.pagination,
      })
    );
  } catch (error) {
    const message = error?.message || 'Failed to load assigned students';
    yield put(loadOperatorStudentsFailed(message));
    yield put(
      showNotification({
        type: 'ERROR',
        title: 'Students Error',
        message,
      })
    );
  }
}

export function* loadOperatorStudentWorker(action) {
  try {
    const studentId = action.payload;
    const data = yield call(getOperatorStudentById, studentId);
    yield put(loadOperatorStudentSucceeded(data));
  } catch (error) {
    const message = error?.message || 'Failed to load student details';
    yield put(loadOperatorStudentFailed(message));
    yield put(
      showNotification({
        type: 'ERROR',
        title: 'Student Load Error',
        message,
      })
    );
  }
}

export function* createOperatorStudentWorker(action) {
  try {
    const data = yield call(createOperatorStudent, action.payload);
    yield put(createOperatorStudentSucceeded(data));
    yield put(
      showNotification({
        type: 'SUCCESS',
        title: 'Student Created',
        message: 'Student created successfully within your assigned class scope.',
      })
    );
  } catch (error) {
    const message = error?.message || 'Failed to create student';
    yield put(createOperatorStudentFailed(message));
    yield put(
      showNotification({
        type: 'ERROR',
        title: 'Creation Failed',
        message,
      })
    );
  }
}

export function* updateOperatorStudentWorker(action) {
  try {
    const { studentId, updates } = action.payload;
    const data = yield call(updateOperatorStudent, studentId, updates);
    yield put(updateOperatorStudentSucceeded(data));
    yield put(
      showNotification({
        type: 'SUCCESS',
        title: 'Student Updated',
        message: 'Student record updated successfully.',
      })
    );
  } catch (error) {
    const message = error?.message || 'Failed to update student';
    yield put(updateOperatorStudentFailed(message));
    yield put(
      showNotification({
        type: 'ERROR',
        title: 'Update Failed',
        message,
      })
    );
  }
}

export function* importOperatorStudentsWorker(action) {
  try {
    const data = yield call(importOperatorStudents, action.payload);
    yield put(importOperatorStudentsSucceeded(data));
    yield put(
      showNotification({
        type: 'SUCCESS',
        title: 'Bulk Import Complete',
        message: `Imported ${data.successCount ?? 0} students successfully (${data.failedCount ?? 0} failed).`,
      })
    );
  } catch (error) {
    const message = error?.message || 'Failed to import students';
    yield put(importOperatorStudentsFailed(message));
    yield put(
      showNotification({
        type: 'ERROR',
        title: 'Import Failed',
        message,
      })
    );
  }
}

export function* loadOperatorTemplatesWorker() {
  try {
    const data = yield call(getOperatorTemplates);
    yield put(loadOperatorTemplatesSucceeded(data));
  } catch (error) {
    const message = error?.message || 'Failed to load templates';
    yield put(loadOperatorTemplatesFailed(message));
    yield put(
      showNotification({
        type: 'ERROR',
        title: 'Templates Error',
        message,
      })
    );
  }
}

export function* previewOperatorIdCardWorker(action) {
  try {
    const data = yield call(previewOperatorIdCard, action.payload);
    yield put(previewOperatorIdCardSucceeded(data));
    yield put(
      showNotification({
        type: 'SUCCESS',
        title: 'Preview Generated',
        message: 'ID Card preview generated successfully.',
      })
    );
  } catch (error) {
    const message = error?.message || 'Failed to generate card preview';
    yield put(previewOperatorIdCardFailed(message));
    yield put(
      showNotification({
        type: 'ERROR',
        title: 'Preview Failed',
        message,
      })
    );
  }
}

export function* createOperatorGenerationWorker(action) {
  try {
    const data = yield call(createOperatorGeneration, action.payload);
    yield put(createOperatorGenerationSucceeded(data));
    yield put(
      showNotification({
        type: 'SUCCESS',
        title: 'Generation Job Submitted',
        message: 'ID card rendering job submitted successfully.',
      })
    );
  } catch (error) {
    const message = error?.message || 'Failed to submit generation job';
    yield put(createOperatorGenerationFailed(message));
    yield put(
      showNotification({
        type: 'ERROR',
        title: 'Generation Failed',
        message,
      })
    );
  }
}

export function* loadOperatorGenerationsWorker(action) {
  try {
    const params = action.payload || {};
    const data = yield call(getOperatorGenerations, params);
    yield put(loadOperatorGenerationsSucceeded(data));
  } catch (error) {
    const message = error?.message || 'Failed to load generation history';
    yield put(loadOperatorGenerationsFailed(message));
    yield put(
      showNotification({
        type: 'ERROR',
        title: 'Generations Error',
        message,
      })
    );
  }
}

export function* watchOperator() {
  yield takeLatest(loadOperatorDashboardRequested.type, loadOperatorDashboardWorker);
  yield takeLatest(loadOperatorStudentsRequested.type, loadOperatorStudentsWorker);
  yield takeLatest(loadOperatorStudentRequested.type, loadOperatorStudentWorker);
  yield takeLatest(createOperatorStudentRequested.type, createOperatorStudentWorker);
  yield takeLatest(updateOperatorStudentRequested.type, updateOperatorStudentWorker);
  yield takeLatest(importOperatorStudentsRequested.type, importOperatorStudentsWorker);
  yield takeLatest(loadOperatorTemplatesRequested.type, loadOperatorTemplatesWorker);
  yield takeLatest(previewOperatorIdCardRequested.type, previewOperatorIdCardWorker);
  yield takeLatest(createOperatorGenerationRequested.type, createOperatorGenerationWorker);
  yield takeLatest(loadOperatorGenerationsRequested.type, loadOperatorGenerationsWorker);
}

export default watchOperator;

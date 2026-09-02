import { takeLatest, call, put } from 'redux-saga/effects';
import {
  fetchTemplatesRequested,
  fetchTemplatesSucceeded,
  fetchTemplatesFailed,
  fetchTemplateDetailRequested,
  fetchTemplateDetailSucceeded,
  fetchTemplateDetailFailed,
  createTemplateRequested,
  createTemplateSucceeded,
  createTemplateFailed,
  updateTemplateRequested,
  updateTemplateSucceeded,
  updateTemplateFailed,
  updateTemplateStatusRequested,
  updateTemplateStatusSucceeded,
  updateTemplateStatusFailed,
} from './templateSlice.js';
import {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  updateTemplateStatus,
} from './templateApi.js';

export function* fetchTemplatesWorker(action) {
  try {
    const params = action.payload || {};
    const response = yield call(getTemplates, params);
    const data = response?.data || response;
    const payloadData = data?.data || data;
    yield put(
      fetchTemplatesSucceeded({
        templates: payloadData?.templates || [],
        pagination: payloadData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 },
      })
    );
  } catch (error) {
    const message = error?.message || 'Failed to fetch templates';
    yield put(fetchTemplatesFailed(message));
  }
}

export function* fetchTemplateDetailWorker(action) {
  try {
    const templateId = typeof action.payload === 'object' ? action.payload.id : action.payload;
    const response = yield call(getTemplateById, templateId);
    const data = response?.data || response;
    const template = data?.data?.template || data?.template || data?.data || data;
    yield put(fetchTemplateDetailSucceeded(template));
  } catch (error) {
    const message = error?.message || 'Failed to fetch template details';
    yield put(fetchTemplateDetailFailed(message));
  }
}

export function* createTemplateWorker(action) {
  try {
    const payload = action.payload || {};
    const templateData = payload.data || payload;
    const response = yield call(createTemplate, templateData);
    const data = response?.data || response;
    const template = data?.data?.template || data?.template || data?.data || data;

    yield put(createTemplateSucceeded(template));

    if (typeof payload.onSuccess === 'function') {
      payload.onSuccess(template);
    }
  } catch (error) {
    const message = error?.message || 'Failed to create template';
    yield put(createTemplateFailed(message));
  }
}

export function* updateTemplateWorker(action) {
  try {
    const payload = action.payload || {};
    const { id, data: updateData } = payload;
    const response = yield call(updateTemplate, id, updateData);
    const data = response?.data || response;
    const template = data?.data?.template || data?.template || data?.data || data;

    yield put(updateTemplateSucceeded(template));

    if (typeof payload.onSuccess === 'function') {
      payload.onSuccess(template);
    }
  } catch (error) {
    const message = error?.message || 'Failed to update template';
    yield put(updateTemplateFailed(message));
  }
}

export function* updateTemplateStatusWorker(action) {
  try {
    const payload = action.payload || {};
    const { id, isActive } = payload;
    const response = yield call(updateTemplateStatus, id, isActive);
    const data = response?.data || response;
    const template = data?.data?.template || data?.template || data?.data || data;

    yield put(updateTemplateStatusSucceeded(template));

    if (typeof payload.onSuccess === 'function') {
      payload.onSuccess(template);
    }
  } catch (error) {
    const message = error?.message || 'Failed to update template status';
    yield put(updateTemplateStatusFailed(message));
  }
}

export function* watchTemplates() {
  yield takeLatest(fetchTemplatesRequested.type, fetchTemplatesWorker);
  yield takeLatest(fetchTemplateDetailRequested.type, fetchTemplateDetailWorker);
  yield takeLatest(createTemplateRequested.type, createTemplateWorker);
  yield takeLatest(updateTemplateRequested.type, updateTemplateWorker);
  yield takeLatest(updateTemplateStatusRequested.type, updateTemplateStatusWorker);
}

export default watchTemplates;

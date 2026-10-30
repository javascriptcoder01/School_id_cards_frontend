// templateSaga.js
import { takeLatest, takeEvery, debounce, call, put, select } from 'redux-saga/effects';
import { createAction } from '@reduxjs/toolkit';
import {
  fetchThemesRequested,
  fetchThemesSucceeded,
  fetchThemesFailed,
  previewRenderRequested,
  previewRenderSucceeded,
  previewRenderFailed,
  fetchSavedPreviewRequested,
  fetchSavedPreviewSucceeded,
  fetchSavedPreviewFailed,
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
  getThemes,
  previewRender,
  getSavedTemplatePreview,
} from './templateApi.js';
import { selectCardThemes, selectSavedTemplatePreview } from './templateSelectors.js';

// apiClient body lautata hai: { success, message, data }
const dataOf = (response) => response?.data ?? response;

// Debounce ke baad ka internal action (state nahi badalta) — takeLatest purani request cancel karta hai
const previewRenderDebounced = createAction('templates/previewRenderDebounced');
const PREVIEW_DEBOUNCE_MS = 400;

/* ---------------- Themes / previews ---------------- */

// Ek baar load (cache). payload { force: true } se dobara.
export function* fetchThemesWorker(action) {
  const cached = yield select(selectCardThemes);
  if (cached && !action.payload?.force) {
    yield put(fetchThemesSucceeded(cached));
    return;
  }
  try {
    const response = yield call(getThemes);
    yield put(fetchThemesSucceeded(dataOf(response)));
  } catch (error) {
    yield put(fetchThemesFailed(error?.message || 'Failed to load card themes'));
  }
}

function* debouncePreviewRender(action) {
  yield put(previewRenderDebounced(action.payload));
}

// payload: { template, studentId? } — designer ka poora draft
export function* previewRenderWorker(action) {
  try {
    const response = yield call(previewRender, action.payload || {});
    yield put(previewRenderSucceeded(dataOf(response)));
  } catch (error) {
    yield put(previewRenderFailed(error?.message || 'Failed to render preview'));
  }
}

// payload: { templateId, force? } — cache mein ho to dobara nahi
export function* fetchSavedPreviewWorker(action) {
  const { templateId, force } = action.payload || {};
  if (!templateId) return;
  const cached = yield select(selectSavedTemplatePreview(templateId));
  if (cached?.data && !force) {
    yield put(fetchSavedPreviewSucceeded({ templateId, data: cached.data }));
    return;
  }
  try {
    const response = yield call(getSavedTemplatePreview, templateId);
    yield put(fetchSavedPreviewSucceeded({ templateId, data: dataOf(response)?.renderData || null }));
  } catch (error) {
    yield put(fetchSavedPreviewFailed({ templateId, error: error?.message || 'Failed to load preview' }));
  }
}

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
  yield takeLatest(fetchThemesRequested.type, fetchThemesWorker);
  // Har change par 400 ms ruko, phir sirf aakhri draft render (purani chalti request cancel)
  yield debounce(PREVIEW_DEBOUNCE_MS, previewRenderRequested.type, debouncePreviewRender);
  yield takeLatest(previewRenderDebounced.type, previewRenderWorker);
  yield takeEvery(fetchSavedPreviewRequested.type, fetchSavedPreviewWorker);
}

export default watchTemplates;

// commissionTemplateRatesSaga.js — /api/commission/rates/colleges/:collegeId/templates (list / set / clear)
import { call, put, takeLatest } from 'redux-saga/effects';
import apiClient from '../../api/apiClient.js';
import {
  fetchTemplateRatesRequested,
  fetchTemplateRatesSucceeded,
  fetchTemplateRatesFailed,
  setTemplateRateRequested,
  removeTemplateRateRequested,
  templateRateSaveFinished,
} from './commissionTemplateRatesSlice.js';
import { showNotification } from '../notifications/notificationSlice.js';

const base = (collegeId) => `/commission/rates/colleges/${collegeId}/templates`;
export const getTemplateRatesApi = async (collegeId) => apiClient.get(base(collegeId));
export const setTemplateRateApi = async (collegeId, templateId, body) => apiClient.put(`${base(collegeId)}/${templateId}`, body);
export const removeTemplateRateApi = async (collegeId, templateId) => apiClient.delete(`${base(collegeId)}/${templateId}`);

const dataOf = (r) => r?.data ?? r;

function* fetchWorker(action) {
  try {
    yield put(fetchTemplateRatesSucceeded(dataOf(yield call(getTemplateRatesApi, action.payload.collegeId))));
  } catch (error) {
    yield put(fetchTemplateRatesFailed(error?.message || 'Could not load template rates'));
  }
}

function* setWorker(action) {
  const { collegeId, templateId, rate, note, onSuccess } = action.payload || {};
  try {
    yield call(setTemplateRateApi, collegeId, templateId, { rate, ...(note ? { note } : {}) });
    yield put(templateRateSaveFinished());
    yield put(showNotification({ type: 'SUCCESS', title: 'Template rate updated', message: 'New requests with this template use this rate.' }));
    yield put(fetchTemplateRatesRequested({ collegeId }));
    if (typeof onSuccess === 'function') onSuccess();
  } catch (error) {
    yield put(templateRateSaveFinished({ error: error?.message || 'Could not save the rate' }));
  }
}

function* removeWorker(action) {
  const { collegeId, templateId, onSuccess } = action.payload || {};
  try {
    yield call(removeTemplateRateApi, collegeId, templateId);
    yield put(templateRateSaveFinished());
    yield put(showNotification({ type: 'SUCCESS', title: 'Template rate removed', message: 'This template now uses the school rate.' }));
    yield put(fetchTemplateRatesRequested({ collegeId }));
    if (typeof onSuccess === 'function') onSuccess();
  } catch (error) {
    yield put(templateRateSaveFinished({ error: error?.message || 'Could not remove the rate' }));
  }
}

export function* watchCommissionTemplateRates() {
  yield takeLatest(fetchTemplateRatesRequested.type, fetchWorker);
  yield takeLatest(setTemplateRateRequested.type, setWorker);
  yield takeLatest(removeTemplateRateRequested.type, removeWorker);
}

export default watchCommissionTemplateRates;

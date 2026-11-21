// letterheadSaga.js — Letterhead Studio: list, detail, create / update, duplicate / set default / delete,
// custom upload, live preview (takeLatest + 500 ms debounce, purana object URL free), templates, settings.
import { call, put, takeLatest, takeEvery, delay, select } from 'redux-saga/effects';
import {
  fetchLetterheadsRequested,
  fetchLetterheadsSucceeded,
  fetchLetterheadsFailed,
  fetchLetterheadRequested,
  fetchLetterheadSucceeded,
  fetchLetterheadFailed,
  saveLetterheadRequested,
  saveLetterheadSucceeded,
  saveLetterheadFailed,
  letterheadActionRequested,
  letterheadActionFinished,
  fetchTemplatesRequested,
  fetchTemplatesSucceeded,
  fetchTemplatesFailed,
  previewRequested,
  previewSucceeded,
  previewFailed,
  uploadCustomRequested,
  uploadCustomFinished,
  fetchLetterheadCollegeRequested,
  fetchLetterheadCollegeFinished,
  fetchCollegeOptionsRequested,
  fetchCollegeOptionsFinished,
  fetchSettingsRequested,
  fetchSettingsFinished,
  updateSettingsRequested,
  updateSettingsFinished,
} from './letterheadSlice.js';
import {
  listLetterheads,
  getLetterhead,
  createLetterhead,
  updateLetterhead,
  deleteLetterhead,
  duplicateLetterhead,
  setDefaultLetterhead,
  listLetterheadTemplates,
  previewLetterhead,
  uploadCustomLetterhead,
  getCollegeForLetterhead,
  getCollegeOptions,
  getLetterheadSettings,
  updateLetterheadSettings,
} from './letterheadApi.js';
import { selectLetterheadList, selectLetterheadPreview } from './letterheadSelectors.js';
import { showNotification } from '../notifications/notificationSlice.js';

const dataOf = (r) => r?.data ?? r;
const msg = (error, fallback) => error?.message || fallback;

function* fetchListWorker(action) {
  try {
    yield put(fetchLetterheadsSucceeded(dataOf(yield call(listLetterheads, action.payload || {}))));
  } catch (error) {
    yield put(fetchLetterheadsFailed(msg(error, 'Could not load letterheads')));
  }
}

function* refreshList() {
  const { params } = yield select(selectLetterheadList);
  if (params) yield put(fetchLetterheadsRequested(params));
}

function* fetchDetailWorker(action) {
  try {
    yield put(fetchLetterheadSucceeded(dataOf(yield call(getLetterhead, action.payload?.id))?.letterhead || null));
  } catch (error) {
    yield put(fetchLetterheadFailed(msg(error, 'Could not load the letterhead')));
  }
}

function* saveWorker(action) {
  const { id, body, onSuccess } = action.payload || {};
  try {
    const response = id ? yield call(updateLetterhead, id, body) : yield call(createLetterhead, body);
    const letterhead = dataOf(response)?.letterhead || null;
    yield put(saveLetterheadSucceeded(letterhead));
    yield put(showNotification({ type: 'SUCCESS', title: id ? 'Letterhead saved' : 'Letterhead created', message: `${letterhead?.name || 'Letterhead'} · version ${letterhead?.version || 1}` }));
    if (typeof onSuccess === 'function') onSuccess(letterhead);
  } catch (error) {
    yield put(saveLetterheadFailed(msg(error, 'Could not save the letterhead')));
  }
}

const ACTIONS = {
  duplicate: { fn: duplicateLetterhead, done: 'Letterhead duplicated' },
  setDefault: { fn: setDefaultLetterhead, done: 'Default letterhead set' },
  delete: { fn: deleteLetterhead, done: 'Letterhead deleted' },
};

function* actionWorker(action) {
  const { id, kind, onSuccess } = action.payload || {};
  const config = ACTIONS[kind];
  if (!config) return;
  try {
    const result = dataOf(yield call(config.fn, id));
    yield put(showNotification({ type: 'SUCCESS', title: config.done, message: result?.letterhead?.name || '' }));
    yield call(refreshList);
    if (typeof onSuccess === 'function') onSuccess(result);
  } catch (error) {
    yield put(showNotification({ type: 'ERROR', title: 'Action failed', message: msg(error, 'Please try again') }));
  } finally {
    yield put(letterheadActionFinished());
  }
}

function* templatesWorker(action) {
  try {
    yield put(fetchTemplatesSucceeded(dataOf(yield call(listLetterheadTemplates, action.payload?.segment))?.templates || []));
  } catch (error) {
    yield put(fetchTemplatesFailed(msg(error, 'Could not load templates')));
  }
}

function* previewWorker(action) {
  yield delay(500); // takeLatest + delay = debounce
  const { body } = action.payload || {};
  try {
    const blob = yield call(previewLetterhead, body);
    const url = URL.createObjectURL(blob);
    const previous = (yield select(selectLetterheadPreview)).url;
    yield put(previewSucceeded(url));
    if (previous) URL.revokeObjectURL(previous);
  } catch (error) {
    yield put(previewFailed(msg(error, 'Preview could not be made')));
  }
}

function* uploadWorker(action) {
  const { file, page, collegeId, onSuccess } = action.payload || {};
  try {
    const result = dataOf(yield call(uploadCustomLetterhead, { file, page, collegeId }));
    yield put(uploadCustomFinished());
    if (typeof onSuccess === 'function') onSuccess(result);
  } catch (error) {
    yield put(uploadCustomFinished({ error: msg(error, 'Upload failed') }));
  }
}

function* collegeWorker(action) {
  try {
    const data = dataOf(yield call(getCollegeForLetterhead, action.payload?.collegeId || null));
    yield put(fetchLetterheadCollegeFinished(data?.college || data || null));
  } catch {
    yield put(fetchLetterheadCollegeFinished(null));
  }
}

function* collegeOptionsWorker() {
  try {
    const data = dataOf(yield call(getCollegeOptions));
    yield put(fetchCollegeOptionsFinished((data?.colleges || []).map((c) => ({ id: c.id || c._id, name: c.name, code: c.code }))));
  } catch {
    yield put(fetchCollegeOptionsFinished([]));
  }
}

function* settingsWorker() {
  try {
    yield put(fetchSettingsFinished(dataOf(yield call(getLetterheadSettings))?.settings || null));
  } catch (error) {
    yield put(fetchSettingsFinished({ error: msg(error, 'Could not load settings') }));
  }
}

function* updateSettingsWorker(action) {
  try {
    const settings = dataOf(yield call(updateLetterheadSettings, action.payload?.body || {}))?.settings || null;
    yield put(updateSettingsFinished(settings));
    yield put(showNotification({ type: 'SUCCESS', title: 'Settings saved', message: 'Letterhead settings updated.' }));
  } catch (error) {
    yield put(updateSettingsFinished({ error: msg(error, 'Could not save settings') }));
  }
}

export function* watchLetterheads() {
  yield takeLatest(fetchLetterheadsRequested.type, fetchListWorker);
  yield takeLatest(fetchLetterheadRequested.type, fetchDetailWorker);
  yield takeLatest(saveLetterheadRequested.type, saveWorker);
  yield takeEvery(letterheadActionRequested.type, actionWorker);
  yield takeLatest(fetchTemplatesRequested.type, templatesWorker);
  yield takeLatest(previewRequested.type, previewWorker);
  yield takeLatest(uploadCustomRequested.type, uploadWorker);
  yield takeLatest(fetchLetterheadCollegeRequested.type, collegeWorker);
  yield takeLatest(fetchCollegeOptionsRequested.type, collegeOptionsWorker);
  yield takeLatest(fetchSettingsRequested.type, settingsWorker);
  yield takeLatest(updateSettingsRequested.type, updateSettingsWorker);
}

export default watchLetterheads;

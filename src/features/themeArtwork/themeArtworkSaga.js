// themeArtworkSaga.js — badlav ke baad list taaza + notification. Designer ka content cache bhi update.
import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import {
  fetchArtworksRequested,
  fetchArtworksSucceeded,
  fetchArtworksFailed,
  fetchArtworkRequested,
  fetchArtworkSucceeded,
  fetchArtworkFailed,
  createArtworkRequested,
  updateArtworkRequested,
  saveArtworkSucceeded,
  saveArtworkFailed,
  deleteArtworkRequested,
  deleteArtworkSucceeded,
  deleteArtworkFailed,
} from './themeArtworkSlice.js';
import {
  listThemeArtworks,
  getThemeArtwork,
  createThemeArtwork,
  updateThemeArtwork,
  deleteThemeArtwork,
} from './themeArtworkApi.js';
import { selectThemeArtworksParams } from './themeArtworkSelectors.js';
import { forgetThemeArtwork, primeThemeArtwork } from '../../hooks/useThemeArtworkContent.js';
import { showNotification } from '../notifications/notificationSlice.js';

const dataOf = (response) => response?.data ?? response;
const errorMessage = (error, fallback) => error?.message || fallback;

function* refreshList() {
  const params = yield select(selectThemeArtworksParams);
  yield put(fetchArtworksRequested({ params: params || {} }));
}

export function* fetchArtworksWorker(action) {
  try {
    const response = yield call(listThemeArtworks, action.payload?.params || {});
    yield put(fetchArtworksSucceeded(dataOf(response)));
  } catch (error) {
    yield put(fetchArtworksFailed(errorMessage(error, 'Failed to load theme artworks')));
  }
}

export function* fetchArtworkWorker(action) {
  try {
    const response = yield call(getThemeArtwork, action.payload?.artworkId);
    const artwork = dataOf(response)?.artwork || null;
    if (artwork) primeThemeArtwork(artwork);
    yield put(fetchArtworkSucceeded(artwork));
  } catch (error) {
    yield put(fetchArtworkFailed(errorMessage(error, 'Failed to load the artwork')));
  }
}

export function* createArtworkWorker(action) {
  const { onSuccess, ...data } = action.payload || {};
  try {
    const response = yield call(createThemeArtwork, data);
    const { artwork, removed } = dataOf(response) || {};
    if (artwork) primeThemeArtwork(artwork);
    yield put(saveArtworkSucceeded({ artwork, removed }));
    yield put(showNotification({ type: 'SUCCESS', title: 'Artwork uploaded', message: `"${artwork?.name}" is ready for school designs` }));
    yield* refreshList();
    if (typeof onSuccess === 'function') onSuccess(artwork, removed || []);
  } catch (error) {
    yield put(saveArtworkFailed(errorMessage(error, 'Failed to upload the artwork')));
  }
}

export function* updateArtworkWorker(action) {
  const { artworkId, body, onSuccess } = action.payload || {};
  try {
    const response = yield call(updateThemeArtwork, artworkId, body);
    const artwork = dataOf(response)?.artwork || null;
    // Slot defaults / status badle → designer dobara le
    forgetThemeArtwork(artworkId);
    yield put(saveArtworkSucceeded({ artwork }));
    yield put(showNotification({ type: 'SUCCESS', title: 'Artwork updated', message: `"${artwork?.name}" was saved` }));
    yield* refreshList();
    if (typeof onSuccess === 'function') onSuccess(artwork);
  } catch (error) {
    yield put(saveArtworkFailed(errorMessage(error, 'Failed to update the artwork')));
  }
}

export function* deleteArtworkWorker(action) {
  const { artworkId, onSuccess } = action.payload || {};
  try {
    yield call(deleteThemeArtwork, artworkId);
    forgetThemeArtwork(artworkId);
    yield put(deleteArtworkSucceeded(artworkId));
    yield put(showNotification({ type: 'SUCCESS', title: 'Artwork deleted', message: 'Cards that used it now render without that layer' }));
    yield* refreshList();
    if (typeof onSuccess === 'function') onSuccess();
  } catch (error) {
    yield put(deleteArtworkFailed());
    yield put(showNotification({ type: 'ERROR', title: 'Delete failed', message: errorMessage(error, 'Failed to delete the artwork') }));
  }
}

export function* watchThemeArtwork() {
  yield takeLatest(fetchArtworksRequested.type, fetchArtworksWorker);
  yield takeLatest(fetchArtworkRequested.type, fetchArtworkWorker);
  yield takeEvery(createArtworkRequested.type, createArtworkWorker);
  yield takeEvery(updateArtworkRequested.type, updateArtworkWorker);
  yield takeEvery(deleteArtworkRequested.type, deleteArtworkWorker);
}

export default watchThemeArtwork;

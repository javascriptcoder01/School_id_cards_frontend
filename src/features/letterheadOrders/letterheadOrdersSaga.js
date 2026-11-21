// letterheadOrdersSaga.js — /api/letterhead-orders: list, status actions, PDF download, payments (mark paid / undo).
import { call, put, takeLatest, takeEvery, select, delay } from 'redux-saga/effects';
import apiClient from '../../api/apiClient.js';
import {
  fetchLhOrdersRequested,
  fetchLhOrdersSucceeded,
  fetchLhOrdersFailed,
  lhOrderActionRequested,
  lhOrderActionFinished,
  downloadLhOrderRequested,
  fetchLhPaymentsRequested,
  fetchLhPaymentsSucceeded,
  fetchLhPaymentsFailed,
  fetchLhPendingRequested,
  fetchLhPendingFinished,
  lhMarkPaidRequested,
  lhMarkPaidFinished,
  lhUndoPaymentRequested,
  lhUndoPaymentFinished,
  lhQuoteRequested,
  lhQuoteFinished,
  lhSubmitOrderRequested,
  lhSubmitOrderFinished,
  fetchLhMyRateRequested,
  fetchLhMyRateFinished,
  selectLhOrders,
} from './letterheadOrdersSlice.js';
import { showNotification } from '../notifications/notificationSlice.js';

const BASE = '/letterhead-orders';
const clean = (p = {}) => Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== null && v !== ''));
export const listLhOrdersApi = async (params) => apiClient.get(BASE, { params: clean(params) });
export const lhOrderActionApi = async (id, action, body) => apiClient.post(`${BASE}/${id}/${action}`, body || {});
export const listLhPaymentsApi = async (params) => apiClient.get(`${BASE}/payments`, { params: clean(params) });
export const markLhPaidApi = async (body) => apiClient.post(`${BASE}/payments`, body);
export const quoteLhOrderApi = async (body) => apiClient.post(`${BASE}/quote`, body);
export const createLhOrderApi = async (body) => apiClient.post(BASE, body);
export const getLhMyRateApi = async () => apiClient.get('/letterhead-commission/my-rate');
export const undoLhPaymentApi = async (paymentId, reason) => apiClient.post(`${BASE}/payments/${paymentId}/undo`, { reason });
// PDF: arraybuffer + error JSON yahin decode (interceptor sirf data deta hai)
export const downloadLhOrderApi = async (id) =>
  apiClient.get(`${BASE}/${id}/download`, {
    responseType: 'arraybuffer',
    timeout: 90000,
    transformResponse: [
      (data, headers, status) => {
        if (status >= 400) {
          try {
            return JSON.parse(new TextDecoder().decode(data));
          } catch {
            return null;
          }
        }
        return new Blob([data], { type: 'application/pdf' });
      },
    ],
  });

const dataOf = (r) => r?.data ?? r;
const msg = (e, f) => e?.message || f;
const ACTION_DONE = { accept: 'Order accepted', decline: 'Order declined', printing: 'Marked as printing', complete: 'Order completed', cancel: 'Order cancelled' };

function* refreshLists() {
  const { list, payments } = yield select(selectLhOrders);
  if (list.params) yield put(fetchLhOrdersRequested(list.params));
  if (payments.params) yield put(fetchLhPaymentsRequested(payments.params));
}

function* listWorker(action) {
  try {
    yield put(fetchLhOrdersSucceeded(dataOf(yield call(listLhOrdersApi, action.payload || {}))));
  } catch (e) {
    yield put(fetchLhOrdersFailed(msg(e, 'Could not load print orders')));
  }
}

function* actionWorker(action) {
  const { id, action: kind, reason, onSuccess } = action.payload || {};
  try {
    const r = yield call(lhOrderActionApi, id, kind, reason ? { reason } : undefined);
    yield put(showNotification({ type: 'SUCCESS', title: ACTION_DONE[kind] || 'Updated', message: dataOf(r)?.order?.orderNumber || '' }));
    yield call(refreshLists);
    if (typeof onSuccess === 'function') onSuccess();
  } catch (e) {
    yield put(showNotification({ type: 'ERROR', title: 'Action failed', message: msg(e, 'Please refresh and try again') }));
  } finally {
    yield put(lhOrderActionFinished());
  }
}

const saveBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
};

function* downloadWorker(action) {
  const { id, orderNumber } = action.payload || {};
  try {
    const blob = yield call(downloadLhOrderApi, id);
    yield call(saveBlob, blob, `${String(orderNumber || 'order').replace(/[^A-Za-z0-9._-]+/g, '-')}.pdf`);
  } catch (e) {
    yield put(showNotification({ type: 'ERROR', title: 'Download failed', message: msg(e, 'Please try again') }));
  }
}

function* paymentsWorker(action) {
  try {
    yield put(fetchLhPaymentsSucceeded(dataOf(yield call(listLhPaymentsApi, action.payload || {}))));
  } catch (e) {
    yield put(fetchLhPaymentsFailed(msg(e, 'Could not load payments')));
  }
}

function* pendingWorker(action) {
  try {
    const data = dataOf(yield call(listLhOrdersApi, { collegeId: action.payload?.collegeId, paymentStatus: 'PENDING', limit: 100 }));
    yield put(fetchLhPendingFinished(data?.orders || []));
  } catch {
    yield put(fetchLhPendingFinished([]));
  }
}

function* markPaidWorker(action) {
  const { body, onSuccess } = action.payload || {};
  try {
    const r = yield call(markLhPaidApi, body);
    yield put(lhMarkPaidFinished());
    const p = dataOf(r)?.payment;
    yield put(showNotification({ type: 'SUCCESS', title: 'Payment recorded', message: p ? `${p.paymentNumber} · ${p.amount?.formatted || ''}` : '' }));
    yield call(refreshLists);
    if (typeof onSuccess === 'function') onSuccess();
  } catch (e) {
    yield put(lhMarkPaidFinished({ error: msg(e, 'Could not record the payment') }));
  }
}

function* undoWorker(action) {
  const { paymentId, reason, onSuccess } = action.payload || {};
  try {
    yield call(undoLhPaymentApi, paymentId, reason);
    yield put(lhUndoPaymentFinished());
    yield put(showNotification({ type: 'SUCCESS', title: 'Payment undone', message: 'Its orders are pending payment again.' }));
    yield call(refreshLists);
    if (typeof onSuccess === 'function') onSuccess();
  } catch (e) {
    yield put(lhUndoPaymentFinished({ error: msg(e, 'Could not undo the payment') }));
  }
}

function* quoteWorker(action) {
  yield delay(400); // takeLatest + delay = debounce
  try {
    const r = yield call(quoteLhOrderApi, action.payload?.body || {});
    yield put(lhQuoteFinished({ ...dataOf(r), message: r?.message || null }));
  } catch (e) {
    yield put(lhQuoteFinished({ error: msg(e, 'Price could not be calculated') }));
  }
}

function* submitWorker(action) {
  const { body, onSuccess } = action.payload || {};
  try {
    const order = dataOf(yield call(createLhOrderApi, body))?.order;
    yield put(lhSubmitOrderFinished({ order }));
    yield put(showNotification({ type: 'SUCCESS', title: 'Sent to print', message: `Order ${order?.orderNumber || ''} · ${order?.pricing?.total?.formatted || ''}`, duration: 6000 }));
    yield call(refreshLists);
    if (typeof onSuccess === 'function') onSuccess(order);
  } catch (e) {
    yield put(lhSubmitOrderFinished({ error: msg(e, 'Could not send to print') }));
  }
}

function* myRateWorker() {
  try {
    const r = yield call(getLhMyRateApi);
    yield put(fetchLhMyRateFinished({ ...dataOf(r), message: r?.message || null }));
  } catch (e) {
    yield put(fetchLhMyRateFinished({ error: msg(e, 'Could not load your print rate') }));
  }
}

export function* watchLetterheadOrders() {
  yield takeLatest(lhQuoteRequested.type, quoteWorker);
  yield takeLatest(lhSubmitOrderRequested.type, submitWorker);
  yield takeLatest(fetchLhMyRateRequested.type, myRateWorker);
  yield takeLatest(fetchLhOrdersRequested.type, listWorker);
  yield takeEvery(lhOrderActionRequested.type, actionWorker);
  yield takeEvery(downloadLhOrderRequested.type, downloadWorker);
  yield takeLatest(fetchLhPaymentsRequested.type, paymentsWorker);
  yield takeLatest(fetchLhPendingRequested.type, pendingWorker);
  yield takeLatest(lhMarkPaidRequested.type, markPaidWorker);
  yield takeLatest(lhUndoPaymentRequested.type, undoWorker);
}

export default watchLetterheadOrders;

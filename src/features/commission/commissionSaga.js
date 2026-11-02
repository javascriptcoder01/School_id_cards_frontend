// commissionSaga.js
// Rate ya payment badalne ke baad jo bhi screen par hai wo taaza: rates, history, payments, ledger, dashboard.
import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import {
  fetchRatesRequested,
  fetchRatesSucceeded,
  fetchRatesFailed,
  fetchRateHistoryRequested,
  fetchRateHistorySucceeded,
  fetchRateHistoryFailed,
  setGlobalRateRequested,
  setCollegeRateRequested,
  removeCollegeRateRequested,
  saveRateSucceeded,
  saveRateFailed,
  fetchPendingRequested,
  fetchPendingSucceeded,
  fetchPendingFailed,
  markPaidRequested,
  markPaidSucceeded,
  markPaidFailed,
  fetchPaymentsRequested,
  fetchPaymentsSucceeded,
  fetchPaymentsFailed,
  fetchPaymentRequested,
  fetchPaymentSucceeded,
  fetchPaymentFailed,
} from './commissionSlice.js';
import {
  getRates,
  getRateHistory,
  setGlobalRate,
  setCollegeRate,
  removeCollegeRate,
  getPendingPayments,
  markPaid,
  getPayments,
  getPaymentById,
} from './commissionApi.js';
import {
  selectRateHistoryParams,
  selectPaymentsParams,
  selectPendingCollegeId,
} from './commissionSelectors.js';
import { fetchSuperAdminOverviewRequested } from '../dashboard/dashboardOverviewSlice.js';
import { selectSuperAdminOverviewParams } from '../dashboard/dashboardOverviewSelectors.js';
import { showNotification } from '../notifications/notificationSlice.js';

const dataOf = (response) => response?.data ?? response;
const errorMessage = (error, fallback) => error?.message || fallback;

/* ---------------- Reads ---------------- */

export function* fetchRatesWorker() {
  try {
    const response = yield call(getRates);
    yield put(fetchRatesSucceeded(dataOf(response)));
  } catch (error) {
    yield put(fetchRatesFailed(errorMessage(error, 'Failed to load rates')));
  }
}

export function* fetchRateHistoryWorker(action) {
  try {
    const response = yield call(getRateHistory, action.payload?.params || {});
    yield put(fetchRateHistorySucceeded(dataOf(response)));
  } catch (error) {
    yield put(fetchRateHistoryFailed(errorMessage(error, 'Failed to load rate history')));
  }
}

export function* fetchPendingWorker(action) {
  try {
    const { collegeId, params } = action.payload || {};
    const response = yield call(getPendingPayments, collegeId, params || {});
    yield put(fetchPendingSucceeded(dataOf(response)));
  } catch (error) {
    yield put(fetchPendingFailed(errorMessage(error, 'Failed to load pending payments')));
  }
}

export function* fetchPaymentsWorker(action) {
  try {
    const response = yield call(getPayments, action.payload?.params || {});
    yield put(fetchPaymentsSucceeded(dataOf(response)));
  } catch (error) {
    yield put(fetchPaymentsFailed(errorMessage(error, 'Failed to load payments')));
  }
}

export function* fetchPaymentWorker(action) {
  try {
    const response = yield call(getPaymentById, action.payload?.paymentId);
    yield put(fetchPaymentSucceeded(dataOf(response)));
  } catch (error) {
    yield put(fetchPaymentFailed(errorMessage(error, 'Failed to load the payment')));
  }
}

/* ---------------- Refresh ---------------- */

export function* refreshDashboard() {
  const params = yield select(selectSuperAdminOverviewParams);
  yield put(fetchSuperAdminOverviewRequested({ params: params || {} }));
}

export function* refreshAfterRateChange() {
  const historyParams = yield select(selectRateHistoryParams);
  yield put(fetchRatesRequested());
  yield put(fetchRateHistoryRequested({ params: historyParams || {} }));
  yield call(refreshDashboard);
}

export function* refreshAfterPayment(collegeId) {
  const paymentsParams = yield select(selectPaymentsParams);
  const pendingCollegeId = yield select(selectPendingCollegeId);
  yield put(fetchPendingRequested({ collegeId: collegeId || pendingCollegeId }));
  yield put(fetchPaymentsRequested({ params: paymentsParams || {} }));
  yield call(refreshDashboard);
}

/* ---------------- Rate writes ---------------- */

function* saveRate(apiCall, apiArgs, successMessage, onSuccess) {
  try {
    yield call(apiCall, ...apiArgs);
    yield put(saveRateSucceeded());
    yield put(showNotification({ type: 'SUCCESS', title: 'Rate updated', message: successMessage }));
    yield call(refreshAfterRateChange);
    if (typeof onSuccess === 'function') onSuccess();
  } catch (error) {
    // Modal apne andar dikhata hai
    yield put(saveRateFailed(errorMessage(error, 'Failed to save the rate')));
    // 409 = kisi aur ne pehle badla → taaza data dikhao
    if (error?.statusCode === 409) yield call(refreshAfterRateChange);
  }
}

export function* setGlobalRateWorker(action) {
  const { rate, note, onSuccess } = action.payload || {};
  yield call(saveRate, setGlobalRate, [{ rate, note }], 'Default rate updated.', onSuccess);
}

export function* setCollegeRateWorker(action) {
  const { collegeId, rate, note, onSuccess } = action.payload || {};
  yield call(saveRate, setCollegeRate, [collegeId, { rate, note }], 'School rate updated.', onSuccess);
}

export function* removeCollegeRateWorker(action) {
  const { collegeId, onSuccess } = action.payload || {};
  yield call(saveRate, removeCollegeRate, [collegeId], 'School now uses the default rate.', onSuccess);
}

/* ---------------- Mark Paid ---------------- */

export function* markPaidWorker(action) {
  const { collegeId, body, onSuccess } = action.payload || {};
  try {
    const response = yield call(markPaid, collegeId, body);
    const payment = dataOf(response)?.payment || null;
    yield put(markPaidSucceeded());
    yield put(
      showNotification({
        type: 'SUCCESS',
        title: 'Payment recorded',
        message: payment
          ? `${payment.paymentNumber}: ${payment.amountFormatted} marked as paid.`
          : 'Payment marked as paid.',
      })
    );
    yield call(refreshAfterPayment, collegeId);
    if (typeof onSuccess === 'function') onSuccess(payment);
  } catch (error) {
    yield put(markPaidFailed(errorMessage(error, 'Failed to record the payment')));
    // 409 = request badal gayi ya pehle hi paid → list taaza
    if (error?.statusCode === 409) yield call(refreshAfterPayment, collegeId);
  }
}

export function* watchCommission() {
  yield takeLatest(fetchRatesRequested.type, fetchRatesWorker);
  yield takeLatest(fetchRateHistoryRequested.type, fetchRateHistoryWorker);
  yield takeLatest(fetchPendingRequested.type, fetchPendingWorker);
  yield takeLatest(fetchPaymentsRequested.type, fetchPaymentsWorker);
  yield takeLatest(fetchPaymentRequested.type, fetchPaymentWorker);
  yield takeEvery(setGlobalRateRequested.type, setGlobalRateWorker);
  yield takeEvery(setCollegeRateRequested.type, setCollegeRateWorker);
  yield takeEvery(removeCollegeRateRequested.type, removeCollegeRateWorker);
  yield takeEvery(markPaidRequested.type, markPaidWorker);
}

export default watchCommission;

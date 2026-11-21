// commissionSlice.js — rates, rate history, school ka pending ledger, payments (SUPER_ADMIN)
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  rates: { data: null, loading: false, error: null },
  history: { items: [], pagination: null, params: null, loading: false, error: null },
  pending: { collegeId: null, college: null, items: [], totals: null, pagination: null, loading: false, error: null },
  payments: { items: [], pagination: null, params: null, loading: false, error: null },
  paymentDetail: { payment: null, requests: [], loading: false, error: null },
  // Modal ke andar dikhne wale error (SetRateModal / MarkPaidModal)
  rateSave: { saving: false, error: null },
  markPaid: { saving: false, error: null },
  // Undo payment (reason ke saath)
  reverse: { saving: false, error: null },
  // Platform payment details (QR / UPI) — Super Admin settings + School Admin "Pay now"
  paymentSettings: { data: null, loading: false, saving: false, error: null },
};

export const commissionSlice = createSlice({
  name: 'commission',
  initialState,
  reducers: {
    fetchRatesRequested: (state) => {
      state.rates.loading = true;
      state.rates.error = null;
    },
    fetchRatesSucceeded: (state, action) => {
      state.rates.loading = false;
      state.rates.data = action.payload || null;
    },
    fetchRatesFailed: (state, action) => {
      state.rates.loading = false;
      state.rates.error = action.payload || 'Failed to load rates';
    },

    fetchRateHistoryRequested: (state, action) => {
      state.history.loading = true;
      state.history.error = null;
      state.history.params = action.payload?.params || state.history.params;
    },
    fetchRateHistorySucceeded: (state, action) => {
      state.history.loading = false;
      state.history.items = action.payload?.rates || [];
      state.history.pagination = action.payload?.pagination || null;
    },
    fetchRateHistoryFailed: (state, action) => {
      state.history.loading = false;
      state.history.error = action.payload || 'Failed to load rate history';
    },

    // { rate, note, onSuccess }
    setGlobalRateRequested: (state) => {
      state.rateSave.saving = true;
      state.rateSave.error = null;
    },
    // { collegeId, rate, note, onSuccess }
    setCollegeRateRequested: (state) => {
      state.rateSave.saving = true;
      state.rateSave.error = null;
    },
    // { collegeId, onSuccess }
    removeCollegeRateRequested: (state) => {
      state.rateSave.saving = true;
      state.rateSave.error = null;
    },
    saveRateSucceeded: (state) => {
      state.rateSave.saving = false;
    },
    saveRateFailed: (state, action) => {
      state.rateSave.saving = false;
      state.rateSave.error = action.payload || 'Failed to save the rate';
    },
    clearRateSaveError: (state) => {
      state.rateSave.error = null;
    },

    // { collegeId, params }
    fetchPendingRequested: (state, action) => {
      const collegeId = action.payload?.collegeId || null;
      // Doosre school par jaate hi purana ledger na dikhe
      if (collegeId !== state.pending.collegeId) {
        state.pending = { ...initialState.pending, collegeId };
      }
      state.pending.loading = true;
      state.pending.error = null;
    },
    fetchPendingSucceeded: (state, action) => {
      state.pending.loading = false;
      state.pending.college = action.payload?.college || null;
      state.pending.items = action.payload?.requests || [];
      state.pending.totals = action.payload?.totals || null;
      state.pending.pagination = action.payload?.pagination || null;
    },
    fetchPendingFailed: (state, action) => {
      state.pending.loading = false;
      state.pending.error = action.payload || 'Failed to load pending payments';
    },

    // { collegeId, body: { requestIds, mode, referenceNo, paidAt, note }, onSuccess }
    markPaidRequested: (state) => {
      state.markPaid.saving = true;
      state.markPaid.error = null;
    },
    markPaidSucceeded: (state) => {
      state.markPaid.saving = false;
    },
    markPaidFailed: (state, action) => {
      state.markPaid.saving = false;
      state.markPaid.error = action.payload || 'Failed to record the payment';
    },
    clearMarkPaidError: (state) => {
      state.markPaid.error = null;
    },

    fetchPaymentsRequested: (state, action) => {
      state.payments.loading = true;
      state.payments.error = null;
      state.payments.params = action.payload?.params || state.payments.params;
    },
    fetchPaymentsSucceeded: (state, action) => {
      state.payments.loading = false;
      state.payments.items = action.payload?.payments || [];
      state.payments.pagination = action.payload?.pagination || null;
    },
    fetchPaymentsFailed: (state, action) => {
      state.payments.loading = false;
      state.payments.error = action.payload || 'Failed to load payments';
    },

    // { paymentId }
    fetchPaymentRequested: (state) => {
      state.paymentDetail = { ...initialState.paymentDetail, loading: true };
    },
    fetchPaymentSucceeded: (state, action) => {
      state.paymentDetail.loading = false;
      state.paymentDetail.payment = action.payload?.payment || null;
      state.paymentDetail.requests = action.payload?.requests || [];
    },
    fetchPaymentFailed: (state, action) => {
      state.paymentDetail.loading = false;
      state.paymentDetail.error = action.payload || 'Failed to load the payment';
    },
    clearPaymentDetail: (state) => {
      state.paymentDetail = initialState.paymentDetail;
    },

    // { paymentId, reason, onSuccess }
    reversePaymentRequested: (state) => {
      state.reverse.saving = true;
      state.reverse.error = null;
    },
    reversePaymentSucceeded: (state, action) => {
      state.reverse.saving = false;
      if (action.payload && state.paymentDetail.payment?.id === action.payload.id) state.paymentDetail.payment = action.payload;
    },
    reversePaymentFailed: (state, action) => {
      state.reverse.saving = false;
      state.reverse.error = action.payload || 'Failed to undo the payment';
    },
    clearReverseError: (state) => {
      state.reverse.error = null;
    },

    fetchPaymentSettingsRequested: (state) => {
      state.paymentSettings.loading = true;
      state.paymentSettings.error = null;
    },
    fetchPaymentSettingsSucceeded: (state, action) => {
      state.paymentSettings.loading = false;
      state.paymentSettings.data = action.payload || null;
    },
    fetchPaymentSettingsFailed: (state, action) => {
      state.paymentSettings.loading = false;
      state.paymentSettings.error = action.payload || 'Failed to load payment details';
    },
    // { body, onSuccess } / { file, onSuccess }
    updatePaymentSettingsRequested: (state) => {
      state.paymentSettings.saving = true;
      state.paymentSettings.error = null;
    },
    uploadPaymentQrRequested: (state) => {
      state.paymentSettings.saving = true;
      state.paymentSettings.error = null;
    },
    savePaymentSettingsSucceeded: (state, action) => {
      state.paymentSettings.saving = false;
      state.paymentSettings.data = action.payload || state.paymentSettings.data;
    },
    savePaymentSettingsFailed: (state, action) => {
      state.paymentSettings.saving = false;
      state.paymentSettings.error = action.payload || 'Failed to save payment details';
    },
  },
});

export const {
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
  clearRateSaveError,
  fetchPendingRequested,
  fetchPendingSucceeded,
  fetchPendingFailed,
  markPaidRequested,
  markPaidSucceeded,
  markPaidFailed,
  clearMarkPaidError,
  fetchPaymentsRequested,
  fetchPaymentsSucceeded,
  fetchPaymentsFailed,
  fetchPaymentRequested,
  fetchPaymentSucceeded,
  fetchPaymentFailed,
  clearPaymentDetail,
  reversePaymentRequested,
  reversePaymentSucceeded,
  reversePaymentFailed,
  clearReverseError,
  fetchPaymentSettingsRequested,
  fetchPaymentSettingsSucceeded,
  fetchPaymentSettingsFailed,
  updatePaymentSettingsRequested,
  uploadPaymentQrRequested,
  savePaymentSettingsSucceeded,
  savePaymentSettingsFailed,
} = commissionSlice.actions;

export default commissionSlice.reducer;

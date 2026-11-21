// letterheadOrdersSlice.js — Super Admin (aur School Admin R5 mein): letterhead print orders + payments.
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }, params: null, loading: false, error: null },
  actionId: null, // status action chal raha (row spinner)
  payments: { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }, params: null, loading: false, error: null },
  pending: { items: [], loading: false }, // Mark-paid modal: ek organisation ke PENDING orders
  markPaid: { saving: false, error: null },
  undo: { saving: false, error: null },
  // School Admin (R5): send to print
  quote: { result: null, loading: false, error: null },
  submit: { saving: false, error: null, lastOrder: null },
  myRate: { data: null, loading: false, error: null },
};

export const letterheadOrdersSlice = createSlice({
  name: 'letterheadOrders',
  initialState,
  reducers: {
    fetchLhOrdersRequested: (state, action) => {
      state.list.loading = true;
      state.list.error = null;
      state.list.params = action.payload || {};
    },
    fetchLhOrdersSucceeded: (state, action) => {
      state.list.loading = false;
      state.list.items = action.payload?.orders || [];
      state.list.pagination = action.payload?.pagination || state.list.pagination;
    },
    fetchLhOrdersFailed: (state, action) => {
      state.list.loading = false;
      state.list.error = action.payload;
    },
    // payload: { id, action: 'accept'|'decline'|'printing'|'complete'|'cancel', reason?, onSuccess? }
    lhOrderActionRequested: (state, action) => {
      state.actionId = action.payload?.id || null;
    },
    lhOrderActionFinished: (state) => {
      state.actionId = null;
    },
    // payload: { id, orderNumber }
    downloadLhOrderRequested: () => {},

    fetchLhPaymentsRequested: (state, action) => {
      state.payments.loading = true;
      state.payments.error = null;
      state.payments.params = action.payload || {};
    },
    fetchLhPaymentsSucceeded: (state, action) => {
      state.payments.loading = false;
      state.payments.items = action.payload?.payments || [];
      state.payments.pagination = action.payload?.pagination || state.payments.pagination;
    },
    fetchLhPaymentsFailed: (state, action) => {
      state.payments.loading = false;
      state.payments.error = action.payload;
    },
    // payload: { collegeId }
    fetchLhPendingRequested: (state) => {
      state.pending.loading = true;
    },
    fetchLhPendingFinished: (state, action) => {
      state.pending.loading = false;
      state.pending.items = action.payload || [];
    },
    // payload: { body, onSuccess }
    lhMarkPaidRequested: (state) => {
      state.markPaid.saving = true;
      state.markPaid.error = null;
    },
    lhMarkPaidFinished: (state, action) => {
      state.markPaid.saving = false;
      state.markPaid.error = action.payload?.error || null;
    },
    // payload: { paymentId, reason, onSuccess }
    lhUndoPaymentRequested: (state) => {
      state.undo.saving = true;
      state.undo.error = null;
    },
    lhUndoPaymentFinished: (state, action) => {
      state.undo.saving = false;
      state.undo.error = action.payload?.error || null;
    },
    clearLhOrderErrors: (state) => {
      state.markPaid.error = null;
      state.undo.error = null;
    },
    // payload: { body: { documentId, copies, colour, doubleSided } } — saga 400 ms debounce
    lhQuoteRequested: (state) => {
      state.quote.loading = true;
      state.quote.error = null;
    },
    lhQuoteFinished: (state, action) => {
      state.quote.loading = false;
      if (action.payload?.error) {
        state.quote.error = action.payload.error;
        state.quote.result = null;
      } else state.quote.result = action.payload;
    },
    // payload: { body, onSuccess }
    lhSubmitOrderRequested: (state) => {
      state.submit.saving = true;
      state.submit.error = null;
    },
    lhSubmitOrderFinished: (state, action) => {
      state.submit.saving = false;
      state.submit.error = action.payload?.error || null;
      if (action.payload?.order) state.submit.lastOrder = action.payload.order;
    },
    clearLhSendToPrint: (state) => {
      state.quote = { ...initialState.quote };
      state.submit = { ...initialState.submit };
    },
    fetchLhMyRateRequested: (state) => {
      state.myRate.loading = true;
      state.myRate.error = null;
    },
    fetchLhMyRateFinished: (state, action) => {
      state.myRate.loading = false;
      if (action.payload?.error) state.myRate.error = action.payload.error;
      else state.myRate.data = action.payload;
    },
  },
});

export const {
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
  clearLhOrderErrors,
  lhQuoteRequested,
  lhQuoteFinished,
  lhSubmitOrderRequested,
  lhSubmitOrderFinished,
  clearLhSendToPrint,
  fetchLhMyRateRequested,
  fetchLhMyRateFinished,
} = letterheadOrdersSlice.actions;

export const selectLhOrders = (state) => state.letterheadOrders || initialState;

export default letterheadOrdersSlice.reducer;

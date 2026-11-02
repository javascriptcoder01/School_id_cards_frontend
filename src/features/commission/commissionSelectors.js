// commissionSelectors.js

const EMPTY_LIST = [];

// Rates
export const selectCommissionRates = (state) => state.commission?.rates?.data || null;
export const selectCommissionRatesLoading = (state) => Boolean(state.commission?.rates?.loading);
export const selectCommissionRatesError = (state) => state.commission?.rates?.error || null;

// Rate history
export const selectRateHistory = (state) => state.commission?.history?.items || EMPTY_LIST;
export const selectRateHistoryPagination = (state) => state.commission?.history?.pagination || null;
export const selectRateHistoryParams = (state) => state.commission?.history?.params || null;
export const selectRateHistoryLoading = (state) => Boolean(state.commission?.history?.loading);
export const selectRateHistoryError = (state) => state.commission?.history?.error || null;

// Rate save (modal)
export const selectRateSaving = (state) => Boolean(state.commission?.rateSave?.saving);
export const selectRateSaveError = (state) => state.commission?.rateSave?.error || null;

// School ledger
export const selectPendingCollegeId = (state) => state.commission?.pending?.collegeId || null;
export const selectPendingCollege = (state) => state.commission?.pending?.college || null;
export const selectPendingRequests = (state) => state.commission?.pending?.items || EMPTY_LIST;
export const selectPendingTotals = (state) => state.commission?.pending?.totals || null;
export const selectPendingPagination = (state) => state.commission?.pending?.pagination || null;
export const selectPendingLoading = (state) => Boolean(state.commission?.pending?.loading);
export const selectPendingError = (state) => state.commission?.pending?.error || null;

// Mark Paid (modal)
export const selectMarkPaidSaving = (state) => Boolean(state.commission?.markPaid?.saving);
export const selectMarkPaidError = (state) => state.commission?.markPaid?.error || null;

// Payments
export const selectPayments = (state) => state.commission?.payments?.items || EMPTY_LIST;
export const selectPaymentsPagination = (state) => state.commission?.payments?.pagination || null;
export const selectPaymentsParams = (state) => state.commission?.payments?.params || null;
export const selectPaymentsLoading = (state) => Boolean(state.commission?.payments?.loading);
export const selectPaymentsError = (state) => state.commission?.payments?.error || null;

// Payment detail
export const selectPaymentDetail = (state) => state.commission?.paymentDetail?.payment || null;
export const selectPaymentDetailRequests = (state) => state.commission?.paymentDetail?.requests || EMPTY_LIST;
export const selectPaymentDetailLoading = (state) => Boolean(state.commission?.paymentDetail?.loading);
export const selectPaymentDetailError = (state) => state.commission?.paymentDetail?.error || null;

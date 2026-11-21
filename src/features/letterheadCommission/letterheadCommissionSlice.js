// letterheadCommissionSlice.js — Super Admin: letterhead PRINT rates (list, save, end), rate checker, draft calculate.
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  current: [],
  history: [],
  historyPagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  historyParams: null,
  historyLoading: false,
  loading: false,
  error: null,
  saving: false,
  saveError: null,
  endingId: null,
  checker: { result: null, loading: false, error: null },
  draft: { amount: null, loading: false, error: null },
  colleges: { items: [], loading: false },
};

export const letterheadCommissionSlice = createSlice({
  name: 'letterheadCommission',
  initialState,
  reducers: {
    // Saare current rates (tables ke liye, bina filter)
    fetchLhRatesRequested: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchLhRatesSucceeded: (state, action) => {
      state.loading = false;
      state.current = action.payload?.current || [];
    },
    fetchLhRatesFailed: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    // History sirf (filter: scope / segment / collegeId + page) — current tables par asar nahi
    fetchLhHistoryRequested: (state, action) => {
      state.historyLoading = true;
      state.historyParams = action.payload || {};
    },
    fetchLhHistorySucceeded: (state, action) => {
      state.historyLoading = false;
      state.history = action.payload?.history || [];
      state.historyPagination = action.payload?.pagination || state.historyPagination;
    },
    fetchLhHistoryFailed: (state) => {
      state.historyLoading = false;
    },
    // payload: { body, onSuccess }
    saveLhRateRequested: (state) => {
      state.saving = true;
      state.saveError = null;
    },
    saveLhRateFinished: (state, action) => {
      state.saving = false;
      state.saveError = action.payload?.error || null;
    },
    clearLhRateSaveError: (state) => {
      state.saveError = null;
    },
    // payload: { id }
    endLhRateRequested: (state, action) => {
      state.endingId = action.payload?.id || null;
    },
    endLhRateFinished: (state) => {
      state.endingId = null;
    },
    // payload: { params: { collegeId, pages, copies, colour, doubleSided } }
    checkLhPriceRequested: (state) => {
      state.checker.loading = true;
      state.checker.error = null;
    },
    checkLhPriceFinished: (state, action) => {
      state.checker.loading = false;
      if (action.payload?.error) state.checker.error = action.payload.error;
      else state.checker.result = action.payload;
    },
    // payload: { body } (debounced)
    calculateLhDraftRequested: (state) => {
      state.draft.loading = true;
      state.draft.error = null;
    },
    calculateLhDraftFinished: (state, action) => {
      state.draft.loading = false;
      if (action.payload?.error) {
        state.draft.error = action.payload.error;
        state.draft.amount = null;
      } else state.draft.amount = action.payload;
    },
    clearLhDraft: (state) => {
      state.draft = { ...initialState.draft };
    },
    fetchLhCollegesRequested: (state) => {
      state.colleges.loading = true;
    },
    fetchLhCollegesFinished: (state, action) => {
      state.colleges.loading = false;
      state.colleges.items = action.payload || [];
    },
  },
});

export const {
  fetchLhRatesRequested,
  fetchLhRatesSucceeded,
  fetchLhRatesFailed,
  fetchLhHistoryRequested,
  fetchLhHistorySucceeded,
  fetchLhHistoryFailed,
  saveLhRateRequested,
  saveLhRateFinished,
  clearLhRateSaveError,
  endLhRateRequested,
  endLhRateFinished,
  checkLhPriceRequested,
  checkLhPriceFinished,
  calculateLhDraftRequested,
  calculateLhDraftFinished,
  clearLhDraft,
  fetchLhCollegesRequested,
  fetchLhCollegesFinished,
} = letterheadCommissionSlice.actions;

export const selectLhCommission = (state) => state.letterheadCommission || initialState;

export default letterheadCommissionSlice.reducer;

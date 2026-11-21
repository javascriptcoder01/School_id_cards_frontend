// commissionTemplateRatesSlice.js — optional school + ID card template rate (Super Admin, Commission page).
// Commission slice se alag (wahan kuch nahi badla).
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  collegeId: null,
  schoolRate: null, // template rate na ho to yahi lagta hai
  templates: [],
  loading: false,
  error: null,
  savingTemplateId: null,
  saveError: null,
};

export const commissionTemplateRatesSlice = createSlice({
  name: 'commissionTemplateRates',
  initialState,
  reducers: {
    fetchTemplateRatesRequested: (state, action) => {
      const collegeId = action.payload?.collegeId || null;
      if (state.collegeId !== collegeId) {
        state.templates = [];
        state.schoolRate = null;
      }
      state.collegeId = collegeId;
      state.loading = true;
      state.error = null;
    },
    fetchTemplateRatesSucceeded: (state, action) => {
      state.loading = false;
      state.schoolRate = action.payload?.schoolRate || null;
      state.templates = action.payload?.templates || [];
    },
    fetchTemplateRatesFailed: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    // payload: { collegeId, templateId, rate, note, onSuccess }
    setTemplateRateRequested: (state, action) => {
      state.savingTemplateId = action.payload?.templateId || null;
      state.saveError = null;
    },
    // payload: { collegeId, templateId, onSuccess }
    removeTemplateRateRequested: (state, action) => {
      state.savingTemplateId = action.payload?.templateId || null;
      state.saveError = null;
    },
    templateRateSaveFinished: (state, action) => {
      state.savingTemplateId = null;
      state.saveError = action.payload?.error || null;
    },
    clearTemplateRates: () => initialState,
  },
});

export const {
  fetchTemplateRatesRequested,
  fetchTemplateRatesSucceeded,
  fetchTemplateRatesFailed,
  setTemplateRateRequested,
  removeTemplateRateRequested,
  templateRateSaveFinished,
  clearTemplateRates,
} = commissionTemplateRatesSlice.actions;

export const selectTemplateRates = (state) => state.commissionTemplateRates || initialState;

export default commissionTemplateRatesSlice.reducer;

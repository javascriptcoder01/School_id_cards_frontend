// letterheadSlice.js — Letterhead Studio state: list, detail, save, templates, live preview, upload, settings.
// Preview Blob store mein nahi — sirf object URL (saga purana URL free karta hai).
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: { items: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 }, params: null, loading: false, error: null },
  detail: { data: null, loading: false, error: null },
  saving: false,
  saveError: null,
  actionId: null, // duplicate / set-default / delete chal raha (row spinner)
  templates: { items: [], segment: null, loading: false, error: null },
  preview: { url: null, page: 1, loading: false, error: null },
  upload: { loadingPage: null, error: null },
  college: { data: null, loading: false },
  collegeOptions: { items: [], loading: false },
  settings: { data: null, loading: false, saving: false, error: null },
};

export const letterheadSlice = createSlice({
  name: 'letterheads',
  initialState,
  reducers: {
    fetchLetterheadsRequested: (state, action) => {
      state.list.loading = true;
      state.list.error = null;
      state.list.params = action.payload || {};
    },
    fetchLetterheadsSucceeded: (state, action) => {
      state.list.loading = false;
      state.list.items = action.payload?.letterheads || [];
      state.list.pagination = action.payload?.pagination || state.list.pagination;
    },
    fetchLetterheadsFailed: (state, action) => {
      state.list.loading = false;
      state.list.error = action.payload;
    },

    fetchLetterheadRequested: (state) => {
      state.detail.loading = true;
      state.detail.error = null;
    },
    fetchLetterheadSucceeded: (state, action) => {
      state.detail.loading = false;
      state.detail.data = action.payload;
    },
    fetchLetterheadFailed: (state, action) => {
      state.detail.loading = false;
      state.detail.error = action.payload;
    },
    clearLetterheadDetail: (state) => {
      state.detail = { ...initialState.detail };
      state.saveError = null;
      state.upload = { ...initialState.upload };
    },

    // create / update (payload: { id?, body, onSuccess })
    saveLetterheadRequested: (state) => {
      state.saving = true;
      state.saveError = null;
    },
    saveLetterheadSucceeded: (state, action) => {
      state.saving = false;
      state.detail.data = action.payload;
    },
    saveLetterheadFailed: (state, action) => {
      state.saving = false;
      state.saveError = action.payload;
    },

    // row actions: { id, kind: 'duplicate' | 'setDefault' | 'delete' }
    letterheadActionRequested: (state, action) => {
      state.actionId = action.payload?.id || null;
    },
    letterheadActionFinished: (state) => {
      state.actionId = null;
    },

    fetchTemplatesRequested: (state, action) => {
      state.templates.loading = true;
      state.templates.error = null;
      state.templates.segment = action.payload?.segment || null;
    },
    fetchTemplatesSucceeded: (state, action) => {
      state.templates.loading = false;
      state.templates.items = action.payload || [];
    },
    fetchTemplatesFailed: (state, action) => {
      state.templates.loading = false;
      state.templates.error = action.payload;
    },

    // preview: { body, page } — saga 500 ms debounce
    previewRequested: (state, action) => {
      state.preview.loading = true;
      state.preview.error = null;
      state.preview.page = action.payload?.page || 1;
    },
    previewSucceeded: (state, action) => {
      state.preview.loading = false;
      state.preview.url = action.payload;
    },
    previewFailed: (state, action) => {
      state.preview.loading = false;
      state.preview.error = action.payload;
    },
    clearPreview: (state) => {
      state.preview = { ...initialState.preview };
    },

    // upload: { file, page, collegeId, onSuccess }
    uploadCustomRequested: (state, action) => {
      state.upload.loadingPage = action.payload?.page || 'FIRST';
      state.upload.error = null;
    },
    uploadCustomFinished: (state, action) => {
      state.upload.loadingPage = null;
      state.upload.error = action.payload?.error || null;
    },

    fetchLetterheadCollegeRequested: (state) => {
      state.college.loading = true;
    },
    fetchLetterheadCollegeFinished: (state, action) => {
      state.college.loading = false;
      state.college.data = action.payload || null;
    },
    fetchCollegeOptionsRequested: (state) => {
      state.collegeOptions.loading = true;
    },
    fetchCollegeOptionsFinished: (state, action) => {
      state.collegeOptions.loading = false;
      state.collegeOptions.items = action.payload || [];
    },

    fetchSettingsRequested: (state) => {
      state.settings.loading = true;
      state.settings.error = null;
    },
    fetchSettingsFinished: (state, action) => {
      state.settings.loading = false;
      if (action.payload?.error) state.settings.error = action.payload.error;
      else state.settings.data = action.payload;
    },
    updateSettingsRequested: (state) => {
      state.settings.saving = true;
      state.settings.error = null;
    },
    updateSettingsFinished: (state, action) => {
      state.settings.saving = false;
      if (action.payload?.error) state.settings.error = action.payload.error;
      else state.settings.data = action.payload;
    },
  },
});

export const {
  fetchLetterheadsRequested,
  fetchLetterheadsSucceeded,
  fetchLetterheadsFailed,
  fetchLetterheadRequested,
  fetchLetterheadSucceeded,
  fetchLetterheadFailed,
  clearLetterheadDetail,
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
  clearPreview,
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
} = letterheadSlice.actions;

export default letterheadSlice.reducer;

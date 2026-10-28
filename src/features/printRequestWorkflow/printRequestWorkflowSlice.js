// printRequestWorkflowSlice.js
// Print requests: list, summary (tabs / badges), detail, form, status actions, downloads, wizard data.
// Blob / PDF / ZIP kabhi store mein nahi. `silent` refresh (polling) loading spinner nahi dikhata.
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: {
    items: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    params: null, // aakhri list query (polling / action ke baad isi se refresh)
    loading: false,
    error: null,
  },
  summary: {
    counts: {},
    cardCounts: {}, // status → students (Print Center "cards in print")
    total: 0,
    params: null, // aakhri summary filter (e.g. school) — polling isi se refresh
    loading: false,
  },
  // Sidebar badge (bina filter ke summary) — page summary ke filter se alag
  badges: {
    counts: {},
  },
  detail: {
    data: null, // { request, students }
    loading: false,
    error: null,
  },
  form: {
    saving: false,
    error: null,
  },
  actionState: {
    loadingAction: null, // e.g. 'APPROVE'
    error: null,
  },
  download: {
    loadingKey: null, // e.g. '<id>:pdf'
    error: null,
  },
  wizard: {
    templates: { items: [], loading: false, error: null },
    students: { items: [], classScope: undefined, loading: false, error: null },
    previews: { byStudentId: {}, loading: false, error: null },
  },
};

const isSilent = (action) => Boolean(action.payload?.silent);

export const printRequestWorkflowSlice = createSlice({
  name: 'printRequestWorkflow',
  initialState,
  reducers: {
    // List
    fetchRequestsRequested: (state, action) => {
      state.list.params = action.payload?.params || state.list.params || {};
      if (!isSilent(action)) state.list.loading = true;
      state.list.error = null;
    },
    fetchRequestsSucceeded: (state, action) => {
      state.list.loading = false;
      state.list.items = action.payload?.requests || [];
      const pag = action.payload?.pagination || {};
      state.list.pagination = {
        page: pag.page || 1,
        limit: pag.limit || state.list.pagination.limit,
        total: pag.totalItems !== undefined ? pag.totalItems : pag.total || 0,
        totalPages: pag.totalPages || 0,
      };
    },
    fetchRequestsFailed: (state, action) => {
      state.list.loading = false;
      state.list.error = action.payload || 'Failed to load print requests';
    },

    // Summary
    fetchSummaryRequested: (state, action) => {
      if (action.payload?.params) state.summary.params = action.payload.params;
      if (!isSilent(action)) state.summary.loading = true;
    },
    fetchSummarySucceeded: (state, action) => {
      state.summary.loading = false;
      state.summary.counts = action.payload?.counts || {};
      state.summary.cardCounts = action.payload?.cardCounts || {};
      state.summary.total = action.payload?.total || 0;
    },
    fetchSummaryFailed: (state) => {
      state.summary.loading = false;
    },

    // Sidebar badges
    fetchBadgeCountsRequested: () => {},
    fetchBadgeCountsSucceeded: (state, action) => {
      state.badges.counts = action.payload?.counts || {};
    },

    // Detail
    fetchRequestRequested: (state, action) => {
      if (!isSilent(action)) state.detail.loading = true;
      state.detail.error = null;
    },
    fetchRequestSucceeded: (state, action) => {
      state.detail.loading = false;
      state.detail.data = action.payload || null;
    },
    fetchRequestFailed: (state, action) => {
      state.detail.loading = false;
      state.detail.error = action.payload || 'Failed to load print request';
    },
    clearRequestDetail: (state) => {
      state.detail = { ...initialState.detail };
      state.actionState = { ...initialState.actionState };
    },

    // Create / update (+ optional submit)
    saveRequestRequested: (state) => {
      state.form.saving = true;
      state.form.error = null;
    },
    saveRequestSucceeded: (state) => {
      state.form.saving = false;
    },
    saveRequestFailed: (state, action) => {
      state.form.saving = false;
      state.form.error = action.payload || 'Failed to save print request';
    },
    clearFormError: (state) => {
      state.form.error = null;
    },

    // Status actions
    requestActionRequested: (state, action) => {
      state.actionState.loadingAction = action.payload?.action || null;
      state.actionState.error = null;
    },
    requestActionSucceeded: (state, action) => {
      state.actionState.loadingAction = null;
      // Detail khula hai to turant naya status (refetch baad mein students bhi laata hai)
      if (state.detail.data?.request && action.payload?.id === state.detail.data.request.id) {
        state.detail.data.request = action.payload;
      }
    },
    requestActionFailed: (state, action) => {
      state.actionState.loadingAction = null;
      state.actionState.error = action.payload || 'Action failed';
    },

    // Downloads (sirf kaunsa file chal raha hai)
    downloadFileRequested: (state, action) => {
      state.download.loadingKey = `${action.payload?.id}:${action.payload?.kind}`;
      state.download.error = null;
    },
    downloadFileSucceeded: (state) => {
      state.download.loadingKey = null;
    },
    downloadFileFailed: (state, action) => {
      state.download.loadingKey = null;
      state.download.error = action.payload || 'Download failed';
    },

    // Wizard: templates
    fetchWizardTemplatesRequested: (state) => {
      state.wizard.templates.loading = true;
      state.wizard.templates.error = null;
    },
    fetchWizardTemplatesSucceeded: (state, action) => {
      state.wizard.templates.loading = false;
      state.wizard.templates.items = action.payload || [];
    },
    fetchWizardTemplatesFailed: (state, action) => {
      state.wizard.templates.loading = false;
      state.wizard.templates.error = action.payload || 'Failed to load templates';
    },

    // Wizard: class students
    fetchWizardStudentsRequested: (state) => {
      state.wizard.students.loading = true;
      state.wizard.students.error = null;
    },
    fetchWizardStudentsSucceeded: (state, action) => {
      state.wizard.students.loading = false;
      state.wizard.students.items = action.payload?.students || [];
      state.wizard.students.classScope = action.payload?.classScope;
    },
    fetchWizardStudentsFailed: (state, action) => {
      state.wizard.students.loading = false;
      state.wizard.students.error = action.payload || 'Failed to load students';
    },

    // Wizard / admin: card previews (studentId → renderData)
    fetchPreviewsRequested: (state) => {
      state.wizard.previews.loading = true;
      state.wizard.previews.error = null;
      state.wizard.previews.byStudentId = {};
    },
    fetchPreviewsSucceeded: (state, action) => {
      state.wizard.previews.loading = false;
      state.wizard.previews.byStudentId = action.payload || {};
    },
    fetchPreviewsFailed: (state, action) => {
      state.wizard.previews.loading = false;
      state.wizard.previews.error = action.payload || 'Failed to load card previews';
    },
    clearWizard: (state) => {
      state.wizard = { ...initialState.wizard };
      state.form = { ...initialState.form };
    },

    // Polling (saga sunta hai; state nahi badalti)
    startPrintRequestPolling: () => {},
    stopPrintRequestPolling: () => {},

    clearPrintRequestErrors: (state) => {
      state.list.error = null;
      state.detail.error = null;
      state.form.error = null;
      state.actionState.error = null;
      state.download.error = null;
    },
  },
});

export const {
  fetchRequestsRequested,
  fetchRequestsSucceeded,
  fetchRequestsFailed,
  fetchSummaryRequested,
  fetchSummarySucceeded,
  fetchSummaryFailed,
  fetchBadgeCountsRequested,
  fetchBadgeCountsSucceeded,
  fetchRequestRequested,
  fetchRequestSucceeded,
  fetchRequestFailed,
  clearRequestDetail,
  saveRequestRequested,
  saveRequestSucceeded,
  saveRequestFailed,
  clearFormError,
  requestActionRequested,
  requestActionSucceeded,
  requestActionFailed,
  downloadFileRequested,
  downloadFileSucceeded,
  downloadFileFailed,
  fetchWizardTemplatesRequested,
  fetchWizardTemplatesSucceeded,
  fetchWizardTemplatesFailed,
  fetchWizardStudentsRequested,
  fetchWizardStudentsSucceeded,
  fetchWizardStudentsFailed,
  fetchPreviewsRequested,
  fetchPreviewsSucceeded,
  fetchPreviewsFailed,
  clearWizard,
  startPrintRequestPolling,
  stopPrintRequestPolling,
  clearPrintRequestErrors,
} = printRequestWorkflowSlice.actions;

export default printRequestWorkflowSlice.reducer;

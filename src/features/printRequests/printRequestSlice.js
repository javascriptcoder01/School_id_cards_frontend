import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: [],
  selectedRequest: null,
  pagination: null,
  status: 'idle',
  actionStatus: 'idle',
  downloadStatus: 'idle',
  error: null,
  filters: {},
};

export const printRequestSlice = createSlice({
  name: 'printRequests',
  initialState,
  reducers: {
    // 1. Create Print Request
    createPrintRequestRequested: (state, _action) => {
      state.actionStatus = 'loading';
      state.error = null;
    },
    createPrintRequestSucceeded: (state, action) => {
      state.actionStatus = 'succeeded';
      state.error = null;
      if (action.payload) {
        state.list = [action.payload, ...state.list];
      }
    },
    createPrintRequestFailed: (state, action) => {
      state.actionStatus = 'failed';
      state.error = action.payload;
    },

    // 2. Fetch Operator Print Requests (My)
    fetchMyPrintRequestsRequested: (state, _action) => {
      state.status = 'loading';
      state.error = null;
    },
    fetchMyPrintRequestsSucceeded: (state, action) => {
      state.status = 'succeeded';
      state.error = null;
      state.list = action.payload?.printRequests || action.payload || [];
      state.pagination = action.payload?.pagination || null;
    },
    fetchMyPrintRequestsFailed: (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    },

    // 3. Fetch College Print Requests (College Admin Queue)
    fetchCollegePrintRequestsRequested: (state, _action) => {
      state.status = 'loading';
      state.error = null;
    },
    fetchCollegePrintRequestsSucceeded: (state, action) => {
      state.status = 'succeeded';
      state.error = null;
      state.list = action.payload?.printRequests || action.payload || [];
      state.pagination = action.payload?.pagination || null;
    },
    fetchCollegePrintRequestsFailed: (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    },

    // 4. Fetch Global Admin Print Requests (Super Admin Queue)
    fetchAdminPrintRequestsRequested: (state, _action) => {
      state.status = 'loading';
      state.error = null;
    },
    fetchAdminPrintRequestsSucceeded: (state, action) => {
      state.status = 'succeeded';
      state.error = null;
      state.list = action.payload?.printRequests || action.payload || [];
      state.pagination = action.payload?.pagination || null;
    },
    fetchAdminPrintRequestsFailed: (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    },

    // 5. Fetch Single Print Request By ID
    fetchPrintRequestByIdRequested: (state, _action) => {
      state.status = 'loading';
      state.error = null;
    },
    fetchPrintRequestByIdSucceeded: (state, action) => {
      state.status = 'succeeded';
      state.error = null;
      state.selectedRequest = action.payload;
    },
    fetchPrintRequestByIdFailed: (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    },

    // 6. College Admin Actions
    approveCollegePrintRequestRequested: (state, _action) => {
      state.actionStatus = 'loading';
      state.error = null;
    },
    approveCollegePrintRequestSucceeded: (state, action) => {
      state.actionStatus = 'succeeded';
      state.error = null;
      const updated = action.payload;
      if (updated) {
        state.list = state.list.map((r) => (r.id === updated.id ? updated : r));
        if (state.selectedRequest?.id === updated.id) {
          state.selectedRequest = updated;
        }
      }
    },
    approveCollegePrintRequestFailed: (state, action) => {
      state.actionStatus = 'failed';
      state.error = action.payload;
    },

    rejectCollegePrintRequestRequested: (state, _action) => {
      state.actionStatus = 'loading';
      state.error = null;
    },
    rejectCollegePrintRequestSucceeded: (state, action) => {
      state.actionStatus = 'succeeded';
      state.error = null;
      const updated = action.payload;
      if (updated) {
        state.list = state.list.map((r) => (r.id === updated.id ? updated : r));
        if (state.selectedRequest?.id === updated.id) {
          state.selectedRequest = updated;
        }
      }
    },
    rejectCollegePrintRequestFailed: (state, action) => {
      state.actionStatus = 'failed';
      state.error = action.payload;
    },

    forwardToSuperAdminRequested: (state, _action) => {
      state.actionStatus = 'loading';
      state.error = null;
    },
    forwardToSuperAdminSucceeded: (state, action) => {
      state.actionStatus = 'succeeded';
      state.error = null;
      const updated = action.payload;
      if (updated) {
        state.list = state.list.map((r) => (r.id === updated.id ? updated : r));
        if (state.selectedRequest?.id === updated.id) {
          state.selectedRequest = updated;
        }
      }
    },
    forwardToSuperAdminFailed: (state, action) => {
      state.actionStatus = 'failed';
      state.error = action.payload;
    },

    // 7. Super Admin Actions
    approveAdminPrintRequestRequested: (state, _action) => {
      state.actionStatus = 'loading';
      state.error = null;
    },
    approveAdminPrintRequestSucceeded: (state, action) => {
      state.actionStatus = 'succeeded';
      state.error = null;
      const updated = action.payload;
      if (updated) {
        state.list = state.list.map((r) => (r.id === updated.id ? updated : r));
        if (state.selectedRequest?.id === updated.id) {
          state.selectedRequest = updated;
        }
      }
    },
    approveAdminPrintRequestFailed: (state, action) => {
      state.actionStatus = 'failed';
      state.error = action.payload;
    },

    rejectAdminPrintRequestRequested: (state, _action) => {
      state.actionStatus = 'loading';
      state.error = null;
    },
    rejectAdminPrintRequestSucceeded: (state, action) => {
      state.actionStatus = 'succeeded';
      state.error = null;
      const updated = action.payload;
      if (updated) {
        state.list = state.list.map((r) => (r.id === updated.id ? updated : r));
        if (state.selectedRequest?.id === updated.id) {
          state.selectedRequest = updated;
        }
      }
    },
    rejectAdminPrintRequestFailed: (state, action) => {
      state.actionStatus = 'failed';
      state.error = action.payload;
    },

    markAdminPrintingRequested: (state, _action) => {
      state.actionStatus = 'loading';
      state.error = null;
    },
    markAdminPrintingSucceeded: (state, action) => {
      state.actionStatus = 'succeeded';
      state.error = null;
      const updated = action.payload;
      if (updated) {
        state.list = state.list.map((r) => (r.id === updated.id ? updated : r));
        if (state.selectedRequest?.id === updated.id) {
          state.selectedRequest = updated;
        }
      }
    },
    markAdminPrintingFailed: (state, action) => {
      state.actionStatus = 'failed';
      state.error = action.payload;
    },

    // 7.1 Super Admin Print Dispatch (POST /api/admin/print-requests/:requestId/print)
    dispatchAdminPrintRequested: (state, _action) => {
      state.actionStatus = 'loading';
      state.error = null;
    },
    dispatchAdminPrintSucceeded: (state, action) => {
      state.actionStatus = 'succeeded';
      state.error = null;
      const updated = action.payload;
      if (updated) {
        state.list = state.list.map((r) => (r.id === updated.id ? updated : r));
        if (state.selectedRequest?.id === updated.id) {
          state.selectedRequest = updated;
        }
      }
    },
    dispatchAdminPrintFailed: (state, action) => {
      state.actionStatus = 'failed';
      state.error = action.payload;
    },

    markAdminCompleteRequested: (state, _action) => {
      state.actionStatus = 'loading';
      state.error = null;
    },
    markAdminCompleteSucceeded: (state, action) => {
      state.actionStatus = 'succeeded';
      state.error = null;
      const updated = action.payload;
      if (updated) {
        state.list = state.list.map((r) => (r.id === updated.id ? updated : r));
        if (state.selectedRequest?.id === updated.id) {
          state.selectedRequest = updated;
        }
      }
    },
    markAdminCompleteFailed: (state, action) => {
      state.actionStatus = 'failed';
      state.error = action.payload;
    },

    // 8. Super Admin Download ZIP
    downloadAdminPrintAssetsRequested: (state, _action) => {
      state.downloadStatus = 'loading';
      state.error = null;
    },
    downloadAdminPrintAssetsSucceeded: (state) => {
      state.downloadStatus = 'succeeded';
      state.error = null;
    },
    downloadAdminPrintAssetsFailed: (state, action) => {
      state.downloadStatus = 'failed';
      state.error = action.payload;
    },

    // 8.1 Super Admin Download PDF
    downloadAdminPrintPdfRequested: (state, _action) => {
      state.downloadStatus = 'loading';
      state.error = null;
    },
    downloadAdminPrintPdfSucceeded: (state) => {
      state.downloadStatus = 'succeeded';
      state.error = null;
    },
    downloadAdminPrintPdfFailed: (state, action) => {
      state.downloadStatus = 'failed';
      state.error = action.payload;
    },

    // 9. Filters & Reset
    setPrintRequestFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSelectedPrintRequest: (state) => {
      state.selectedRequest = null;
    },
    resetPrintRequestState: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase('auth/logout', () => initialState);
  },
});

export const {
  createPrintRequestRequested,
  createPrintRequestSucceeded,
  createPrintRequestFailed,
  fetchMyPrintRequestsRequested,
  fetchMyPrintRequestsSucceeded,
  fetchMyPrintRequestsFailed,
  fetchCollegePrintRequestsRequested,
  fetchCollegePrintRequestsSucceeded,
  fetchCollegePrintRequestsFailed,
  fetchAdminPrintRequestsRequested,
  fetchAdminPrintRequestsSucceeded,
  fetchAdminPrintRequestsFailed,
  fetchPrintRequestByIdRequested,
  fetchPrintRequestByIdSucceeded,
  fetchPrintRequestByIdFailed,
  approveCollegePrintRequestRequested,
  approveCollegePrintRequestSucceeded,
  approveCollegePrintRequestFailed,
  rejectCollegePrintRequestRequested,
  rejectCollegePrintRequestSucceeded,
  rejectCollegePrintRequestFailed,
  forwardToSuperAdminRequested,
  forwardToSuperAdminSucceeded,
  forwardToSuperAdminFailed,
  approveAdminPrintRequestRequested,
  approveAdminPrintRequestSucceeded,
  approveAdminPrintRequestFailed,
  rejectAdminPrintRequestRequested,
  rejectAdminPrintRequestSucceeded,
  rejectAdminPrintRequestFailed,
  markAdminPrintingRequested,
  markAdminPrintingSucceeded,
  markAdminPrintingFailed,
  dispatchAdminPrintRequested,
  dispatchAdminPrintSucceeded,
  dispatchAdminPrintFailed,
  markAdminCompleteRequested,
  markAdminCompleteSucceeded,
  markAdminCompleteFailed,
  downloadAdminPrintAssetsRequested,
  downloadAdminPrintAssetsSucceeded,
  downloadAdminPrintAssetsFailed,
  downloadAdminPrintPdfRequested,
  downloadAdminPrintPdfSucceeded,
  downloadAdminPrintPdfFailed,
  setPrintRequestFilters,
  clearSelectedPrintRequest,
  resetPrintRequestState,
} = printRequestSlice.actions;

export default printRequestSlice.reducer;


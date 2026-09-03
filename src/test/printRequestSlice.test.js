import { describe, it, expect } from 'vitest';
import printRequestReducer, {
  createPrintRequestRequested,
  createPrintRequestSucceeded,
  createPrintRequestFailed,
  fetchMyPrintRequestsRequested,
  fetchMyPrintRequestsSucceeded,
  fetchMyPrintRequestsFailed,
  fetchCollegePrintRequestsRequested,
  fetchCollegePrintRequestsSucceeded,
  fetchAdminPrintRequestsRequested,
  fetchAdminPrintRequestsSucceeded,
  fetchPrintRequestByIdRequested,
  fetchPrintRequestByIdSucceeded,
  approveCollegePrintRequestRequested,
  approveCollegePrintRequestSucceeded,
  rejectCollegePrintRequestRequested,
  rejectCollegePrintRequestSucceeded,
  forwardToSuperAdminRequested,
  forwardToSuperAdminSucceeded,
  approveAdminPrintRequestRequested,
  approveAdminPrintRequestSucceeded,
  rejectAdminPrintRequestRequested,
  rejectAdminPrintRequestSucceeded,
  markAdminPrintingRequested,
  markAdminPrintingSucceeded,
  markAdminCompleteRequested,
  markAdminCompleteSucceeded,
  downloadAdminPrintAssetsRequested,
  downloadAdminPrintAssetsSucceeded,
  downloadAdminPrintAssetsFailed,
  clearSelectedPrintRequest,
  resetPrintRequestState,
} from '../features/printRequests/printRequestSlice.js';

describe('PRINT REQUEST REDUX SLICE', () => {
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

  it('1. should return initial state by default', () => {
    expect(printRequestReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('2. handles createPrintRequest lifecycle', () => {
    let state = printRequestReducer(initialState, createPrintRequestRequested());
    expect(state.actionStatus).toBe('loading');
    expect(state.error).toBeNull();

    const mockRequest = { id: 'pr-1', totalCards: 5, status: 'PENDING_COLLEGE_APPROVAL' };
    state = printRequestReducer(state, createPrintRequestSucceeded(mockRequest));
    expect(state.actionStatus).toBe('succeeded');
    expect(state.list).toEqual([mockRequest]);

    state = printRequestReducer(state, createPrintRequestFailed('Creation error'));
    expect(state.actionStatus).toBe('failed');
    expect(state.error).toBe('Creation error');
  });

  it('3. handles fetchMyPrintRequests lifecycle', () => {
    let state = printRequestReducer(initialState, fetchMyPrintRequestsRequested());
    expect(state.status).toBe('loading');

    const payload = {
      printRequests: [{ id: 'pr-1' }, { id: 'pr-2' }],
      pagination: { total: 2, page: 1 },
    };
    state = printRequestReducer(state, fetchMyPrintRequestsSucceeded(payload));
    expect(state.status).toBe('succeeded');
    expect(state.list).toHaveLength(2);
    expect(state.pagination).toEqual(payload.pagination);

    state = printRequestReducer(state, fetchMyPrintRequestsFailed('Fetch error'));
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Fetch error');
  });

  it('4. handles fetchCollegePrintRequests and fetchAdminPrintRequests', () => {
    let state = printRequestReducer(initialState, fetchCollegePrintRequestsRequested());
    expect(state.status).toBe('loading');
    state = printRequestReducer(state, fetchCollegePrintRequestsSucceeded([{ id: 'cpr-1' }]));
    expect(state.status).toBe('succeeded');
    expect(state.list).toHaveLength(1);

    state = printRequestReducer(state, fetchAdminPrintRequestsRequested());
    expect(state.status).toBe('loading');
    state = printRequestReducer(state, fetchAdminPrintRequestsSucceeded([{ id: 'apr-1' }]));
    expect(state.status).toBe('succeeded');
    expect(state.list).toHaveLength(1);
  });

  it('5. handles state transitions on approve, reject, forward, print, complete', () => {
    let state = {
      ...initialState,
      list: [{ id: 'pr-1', status: 'PENDING_COLLEGE_APPROVAL' }],
      selectedRequest: { id: 'pr-1', status: 'PENDING_COLLEGE_APPROVAL' },
    };

    // College Approve
    state = printRequestReducer(state, approveCollegePrintRequestRequested('pr-1'));
    expect(state.actionStatus).toBe('loading');
    state = printRequestReducer(
      state,
      approveCollegePrintRequestSucceeded({ id: 'pr-1', status: 'COLLEGE_APPROVED' })
    );
    expect(state.actionStatus).toBe('succeeded');
    expect(state.list[0].status).toBe('COLLEGE_APPROVED');
    expect(state.selectedRequest.status).toBe('COLLEGE_APPROVED');

    // Forward
    state = printRequestReducer(state, forwardToSuperAdminRequested('pr-1'));
    expect(state.actionStatus).toBe('loading');
    state = printRequestReducer(
      state,
      forwardToSuperAdminSucceeded({ id: 'pr-1', status: 'SENT_TO_SUPER_ADMIN' })
    );
    expect(state.list[0].status).toBe('SENT_TO_SUPER_ADMIN');

    // Super Admin Approve
    state = printRequestReducer(
      state,
      approveAdminPrintRequestSucceeded({ id: 'pr-1', status: 'SUPER_ADMIN_APPROVED' })
    );
    expect(state.list[0].status).toBe('SUPER_ADMIN_APPROVED');

    // Mark Printing
    state = printRequestReducer(
      state,
      markAdminPrintingSucceeded({ id: 'pr-1', status: 'PRINTING' })
    );
    expect(state.list[0].status).toBe('PRINTING');

    // Mark Complete
    state = printRequestReducer(
      state,
      markAdminCompleteSucceeded({ id: 'pr-1', status: 'COMPLETED' })
    );
    expect(state.list[0].status).toBe('COMPLETED');
  });

  it('6. handles downloadAdminPrintAssets lifecycle', () => {
    let state = printRequestReducer(initialState, downloadAdminPrintAssetsRequested({ requestId: 'pr-1' }));
    expect(state.downloadStatus).toBe('loading');

    state = printRequestReducer(state, downloadAdminPrintAssetsSucceeded());
    expect(state.downloadStatus).toBe('succeeded');

    state = printRequestReducer(state, downloadAdminPrintAssetsFailed('ZIP error'));
    expect(state.downloadStatus).toBe('failed');
    expect(state.error).toBe('ZIP error');
  });

  it('7. clears state on auth/logout', () => {
    const dirtyState = {
      ...initialState,
      list: [{ id: 'pr-1' }],
      selectedRequest: { id: 'pr-1' },
      status: 'succeeded',
    };

    const state = printRequestReducer(dirtyState, { type: 'auth/logout' });
    expect(state).toEqual(initialState);
  });
});


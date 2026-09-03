import { call, put, takeLatest, all } from 'redux-saga/effects';
import * as api from './printRequestApi.js';
import {
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
} from './printRequestSlice.js';
import { showNotification } from '../notifications/notificationSlice.js';
import { getSanitizedErrorMessage } from '../../api/apiError.js';

// 1. Create Print Request
function* handleCreatePrintRequest(action) {
  try {
    const data = yield call(api.createPrintRequest, action.payload);
    yield put(createPrintRequestSucceeded(data));
    yield put(
      showNotification({
        type: 'success',
        message: 'Print request submitted successfully to College Admin',
      })
    );
  } catch (error) {
    const errorMsg = getSanitizedErrorMessage(error, 'Failed to create print request');
    yield put(createPrintRequestFailed(errorMsg));
    yield put(showNotification({ type: 'error', message: errorMsg }));
  }
}

// 2. Fetch Operator Print Requests (My)
function* handleFetchMyPrintRequests(action) {
  try {
    const data = yield call(api.getMyPrintRequests, action.payload);
    yield put(fetchMyPrintRequestsSucceeded(data));
  } catch (error) {
    const errorMsg = getSanitizedErrorMessage(error, 'Failed to fetch your print requests');
    yield put(fetchMyPrintRequestsFailed(errorMsg));
    yield put(showNotification({ type: 'error', message: errorMsg }));
  }
}

// 3. Fetch College Print Requests (College Admin Queue)
function* handleFetchCollegePrintRequests(action) {
  try {
    const data = yield call(api.getCollegePrintRequests, action.payload);
    yield put(fetchCollegePrintRequestsSucceeded(data));
  } catch (error) {
    const errorMsg = getSanitizedErrorMessage(error, 'Failed to fetch college print requests');
    yield put(fetchCollegePrintRequestsFailed(errorMsg));
    yield put(showNotification({ type: 'error', message: errorMsg }));
  }
}

// 4. Fetch Global Admin Print Requests (Super Admin Queue)
function* handleFetchAdminPrintRequests(action) {
  try {
    const data = yield call(api.getAdminPrintRequests, action.payload);
    yield put(fetchAdminPrintRequestsSucceeded(data));
  } catch (error) {
    const errorMsg = getSanitizedErrorMessage(error, 'Failed to fetch global print requests');
    yield put(fetchAdminPrintRequestsFailed(errorMsg));
    yield put(showNotification({ type: 'error', message: errorMsg }));
  }
}

// 5. Fetch Single Print Request By ID
function* handleFetchPrintRequestById(action) {
  try {
    const data = yield call(api.getPrintRequestById, action.payload);
    yield put(fetchPrintRequestByIdSucceeded(data));
  } catch (error) {
    const errorMsg = getSanitizedErrorMessage(error, 'Failed to load print request details');
    yield put(fetchPrintRequestByIdFailed(errorMsg));
    yield put(showNotification({ type: 'error', message: errorMsg }));
  }
}

// 6. College Admin Actions
function* handleApproveCollegePrintRequest(action) {
  try {
    const data = yield call(api.approveCollegePrintRequest, action.payload);
    yield put(approveCollegePrintRequestSucceeded(data));
    yield put(
      showNotification({
        type: 'success',
        message: 'Print request approved by College Admin',
      })
    );
  } catch (error) {
    const errorMsg = getSanitizedErrorMessage(error, 'Failed to approve print request');
    yield put(approveCollegePrintRequestFailed(errorMsg));
    yield put(showNotification({ type: 'error', message: errorMsg }));
  }
}

function* handleRejectCollegePrintRequest(action) {
  try {
    const { requestId, reason } = action.payload;
    const data = yield call(api.rejectCollegePrintRequest, requestId, reason);
    yield put(rejectCollegePrintRequestSucceeded(data));
    yield put(
      showNotification({
        type: 'warning',
        message: 'Print request rejected',
      })
    );
  } catch (error) {
    const errorMsg = getSanitizedErrorMessage(error, 'Failed to reject print request');
    yield put(rejectCollegePrintRequestFailed(errorMsg));
    yield put(showNotification({ type: 'error', message: errorMsg }));
  }
}

function* handleForwardToSuperAdmin(action) {
  try {
    const data = yield call(api.forwardToSuperAdmin, action.payload);
    yield put(forwardToSuperAdminSucceeded(data));
    yield put(
      showNotification({
        type: 'success',
        message: 'Print request forwarded to Super Admin successfully',
      })
    );
  } catch (error) {
    const errorMsg = getSanitizedErrorMessage(
      error,
      'Failed to forward print request to Super Admin'
    );
    yield put(forwardToSuperAdminFailed(errorMsg));
    yield put(showNotification({ type: 'error', message: errorMsg }));
  }
}

// 7. Super Admin Actions
function* handleApproveAdminPrintRequest(action) {
  try {
    const data = yield call(api.approveAdminPrintRequest, action.payload);
    yield put(approveAdminPrintRequestSucceeded(data));
    yield put(
      showNotification({
        type: 'success',
        message: 'Print request approved by Super Admin',
      })
    );
  } catch (error) {
    const errorMsg = getSanitizedErrorMessage(error, 'Failed to approve print request');
    yield put(approveAdminPrintRequestFailed(errorMsg));
    yield put(showNotification({ type: 'error', message: errorMsg }));
  }
}

function* handleRejectAdminPrintRequest(action) {
  try {
    const { requestId, reason } = action.payload;
    const data = yield call(api.rejectAdminPrintRequest, requestId, reason);
    yield put(rejectAdminPrintRequestSucceeded(data));
    yield put(
      showNotification({
        type: 'warning',
        message: 'Print request rejected by Super Admin',
      })
    );
  } catch (error) {
    const errorMsg = getSanitizedErrorMessage(error, 'Failed to reject print request');
    yield put(rejectAdminPrintRequestFailed(errorMsg));
    yield put(showNotification({ type: 'error', message: errorMsg }));
  }
}

function* handleMarkAdminPrinting(action) {
  try {
    const data = yield call(api.markAdminPrinting, action.payload);
    yield put(markAdminPrintingSucceeded(data));
    yield put(
      showNotification({
        type: 'info',
        message: 'Print request marked as PRINTING in progress',
      })
    );
  } catch (error) {
    const errorMsg = getSanitizedErrorMessage(error, 'Failed to mark request as PRINTING');
    yield put(markAdminPrintingFailed(errorMsg));
    yield put(showNotification({ type: 'error', message: errorMsg }));
  }
}

function* handleDispatchAdminPrint(action) {
  try {
    const { requestId, printMode, notes } = action.payload;
    const data = yield call(api.dispatchAdminPrint, requestId, { printMode, notes });
    yield put(dispatchAdminPrintSucceeded(data));
    yield put(
      showNotification({
        type: 'info',
        message: `Print production dispatched in ${printMode} mode`,
      })
    );
  } catch (error) {
    const errorMsg = getSanitizedErrorMessage(error, 'Failed to dispatch print production');
    yield put(dispatchAdminPrintFailed(errorMsg));
    yield put(showNotification({ type: 'error', message: errorMsg }));
  }
}

function* handleMarkAdminComplete(action) {
  try {
    const data = yield call(api.markAdminComplete, action.payload);
    yield put(markAdminCompleteSucceeded(data));
    yield put(
      showNotification({
        type: 'success',
        message: 'Print request marked as COMPLETED successfully',
      })
    );
  } catch (error) {
    const errorMsg = getSanitizedErrorMessage(error, 'Failed to mark request as COMPLETED');
    yield put(markAdminCompleteFailed(errorMsg));
    yield put(showNotification({ type: 'error', message: errorMsg }));
  }
}

// 8. Super Admin Download ZIP
function* handleDownloadAdminPrintAssets(action) {
  try {
    const { requestId, fileName } = action.payload;
    const blob = yield call(api.downloadAdminPrintAssets, requestId);

    if (typeof window !== 'undefined' && window.URL && window.document) {
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = fileName || `print-request-${requestId}.zip`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }

    yield put(downloadAdminPrintAssetsSucceeded());
    yield put(
      showNotification({
        type: 'success',
        message: 'Print assets ZIP downloaded successfully',
      })
    );
  } catch (error) {
    const errorMsg = getSanitizedErrorMessage(error, 'Failed to download print assets ZIP');
    yield put(downloadAdminPrintAssetsFailed(errorMsg));
    yield put(showNotification({ type: 'error', message: errorMsg }));
  }
}

// 8.1 Super Admin Download PDF
function* handleDownloadAdminPrintPdf(action) {
  try {
    const { requestId, fileName } = action.payload;
    const blob = yield call(api.downloadAdminPrintPdf, requestId);

    if (typeof window !== 'undefined' && window.URL && window.document) {
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = fileName || `print-request-${requestId}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }

    yield put(downloadAdminPrintPdfSucceeded());
    yield put(
      showNotification({
        type: 'success',
        message: 'Print package PDF downloaded successfully',
      })
    );
  } catch (error) {
    const errorMsg = getSanitizedErrorMessage(error, 'Failed to download print package PDF');
    yield put(downloadAdminPrintPdfFailed(errorMsg));
    yield put(showNotification({ type: 'error', message: errorMsg }));
  }
}

// Watcher Saga
export function* printRequestSaga() {
  yield all([
    takeLatest(createPrintRequestRequested.type, handleCreatePrintRequest),
    takeLatest(fetchMyPrintRequestsRequested.type, handleFetchMyPrintRequests),
    takeLatest(fetchCollegePrintRequestsRequested.type, handleFetchCollegePrintRequests),
    takeLatest(fetchAdminPrintRequestsRequested.type, handleFetchAdminPrintRequests),
    takeLatest(fetchPrintRequestByIdRequested.type, handleFetchPrintRequestById),
    takeLatest(approveCollegePrintRequestRequested.type, handleApproveCollegePrintRequest),
    takeLatest(rejectCollegePrintRequestRequested.type, handleRejectCollegePrintRequest),
    takeLatest(forwardToSuperAdminRequested.type, handleForwardToSuperAdmin),
    takeLatest(approveAdminPrintRequestRequested.type, handleApproveAdminPrintRequest),
    takeLatest(rejectAdminPrintRequestRequested.type, handleRejectAdminPrintRequest),
    takeLatest(markAdminPrintingRequested.type, handleMarkAdminPrinting),
    takeLatest(dispatchAdminPrintRequested.type, handleDispatchAdminPrint),
    takeLatest(markAdminCompleteRequested.type, handleMarkAdminComplete),
    takeLatest(downloadAdminPrintAssetsRequested.type, handleDownloadAdminPrintAssets),
    takeLatest(downloadAdminPrintPdfRequested.type, handleDownloadAdminPrintPdf),
  ]);
}

export default printRequestSaga;


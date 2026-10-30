// printRequestWorkflowSaga.js
import { all, call, delay, put, race, select, take, takeEvery, takeLatest } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import {
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
  saveRequestRequested,
  saveRequestSucceeded,
  saveRequestFailed,
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
  startPrintRequestPolling,
  stopPrintRequestPolling,
  fetchRequestCardPreviewRequested,
  fetchRequestCardPreviewSucceeded,
  fetchRequestCardPreviewFailed,
  cardPreviewKey,
  fetchWizardCardPreviewRequested,
  fetchWizardCardPreviewSucceeded,
  fetchWizardCardPreviewFailed,
} from './printRequestWorkflowSlice.js';
import {
  getRequests,
  getSummary,
  getRequestById,
  createRequest,
  updateRequest,
  runRequestAction,
  downloadRequestPdf,
  downloadRequestZip,
  getBulkPrintPdf,
  getRequestCardPreview,
  getWizardTemplates,
  getWizardStudents,
  previewCard,
} from './printRequestWorkflowApi.js';
import {
  selectPrintRequestListParams,
  selectPrintRequestSummaryParams,
  selectPrintRequestDetail,
} from './printRequestWorkflowSelectors.js';
import { showNotification } from '../notifications/notificationSlice.js';

export const PRINT_REQUEST_POLL_INTERVAL_MS = 30000;

const dataOf = (response) => response?.data ?? response;
const errorMessage = (error, fallback) => error?.message || fallback;

// Action ke baad dikhne wala message
const ACTION_SUCCESS_MESSAGES = {
  SUBMIT: 'Request sent for approval.',
  CANCEL: 'Request cancelled.',
  APPROVE: 'Request approved. Cards are locked for printing.',
  REJECT: 'Request rejected.',
  ACCEPT: 'Request accepted for printing.',
  DECLINE: 'Request declined.',
  COMPLETE: 'Request marked as completed.',
};

// Blob error body padha nahi ja sakta → status se message
const downloadErrorMessage = (error, isBulk = false) => {
  if (error?.statusCode === 409 && isBulk) return 'Some selected requests are not ready for printing. Refresh and try again.';
  if (error?.statusCode === 409) return 'Accept the request before downloading print files.';
  if (error?.statusCode === 400 && isBulk) return 'Select between 1 and 20 requests to print.';
  if (error?.statusCode === 404) return 'No cards found for this request.';
  if (error?.statusCode === 403) return 'You are not allowed to download these files.';
  return error?.message || 'Download failed';
};

// object URL → <a download> click → URL free. Blob store mein kabhi nahi.
const saveBlobAsFile = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// PDF ko hidden iframe mein load karke browser ka print dialog. Ek waqt mein ek hi print frame.
// Frame kuch der rehta hai (print dialog khula ho tab tak); iframe print block ho to naye tab mein PDF.
let activePrintFrame = null;
const PRINT_FRAME_TTL_MS = 10 * 60 * 1000;

const printPdfBlob = (blob) => {
  if (activePrintFrame) activePrintFrame.cleanup();

  const url = URL.createObjectURL(blob);
  const frame = document.createElement('iframe');
  frame.title = 'Print ID cards';
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';

  const timer = setTimeout(() => cleanup(), PRINT_FRAME_TTL_MS);
  function cleanup() {
    clearTimeout(timer);
    frame.remove();
    URL.revokeObjectURL(url);
    if (activePrintFrame?.frame === frame) activePrintFrame = null;
  }

  frame.onload = () => {
    try {
      frame.contentWindow.focus();
      frame.contentWindow.print();
    } catch {
      window.open(url, '_blank', 'noopener');
    }
  };
  frame.src = url;
  document.body.appendChild(frame);
  activePrintFrame = { frame, cleanup };
};

/* ---------------- Reads ---------------- */

export function* fetchRequestsWorker(action) {
  try {
    const params = action.payload?.params || (yield select(selectPrintRequestListParams)) || {};
    const response = yield call(getRequests, params);
    yield put(fetchRequestsSucceeded(dataOf(response)));
  } catch (error) {
    yield put(fetchRequestsFailed(errorMessage(error, 'Failed to load print requests')));
  }
}

export function* fetchSummaryWorker(action) {
  try {
    const params = action.payload?.params || (yield select(selectPrintRequestSummaryParams)) || {};
    const response = yield call(getSummary, params);
    yield put(fetchSummarySucceeded(dataOf(response)));
  } catch {
    yield put(fetchSummaryFailed());
  }
}

// Sidebar badge: hamesha bina filter ke summary (page ke filter ko nahi chhedta)
export function* fetchBadgeCountsWorker() {
  try {
    const response = yield call(getSummary, {});
    yield put(fetchBadgeCountsSucceeded(dataOf(response)));
  } catch {
    // Badge na aaye to chup — sidebar bina number ke chalta hai
  }
}

export function* fetchRequestWorker(action) {
  try {
    const requestId = action.payload?.requestId || action.payload;
    const response = yield call(getRequestById, requestId);
    const data = dataOf(response);
    yield put(fetchRequestSucceeded({ request: data?.request || null, students: data?.students || [] }));
  } catch (error) {
    yield put(fetchRequestFailed(errorMessage(error, 'Failed to load print request')));
  }
}

// Action / polling ke baad: summary + current list + khula detail — chup-chaap (spinner nahi)
function* refreshAll({ detailId = null } = {}) {
  const listParams = yield select(selectPrintRequestListParams);
  const openDetail = yield select(selectPrintRequestDetail);
  const id = detailId || openDetail?.id || null;

  yield all([
    put(fetchSummaryRequested({ silent: true })),
    put(fetchBadgeCountsRequested()),
    ...(listParams ? [put(fetchRequestsRequested({ params: listParams, silent: true }))] : []),
    ...(id ? [put(fetchRequestRequested({ requestId: id, silent: true }))] : []),
  ]);
}

/* ---------------- Writes ---------------- */

/**
 * Create ya update; `submit: true` ho to save ke baad Send for Approval bhi.
 * payload: { requestId?, data, submit?, onSuccess?(request, { submitted }) }
 * Draft save ho gaya lekin submit fail (e.g. photo missing) → error dikhao AUR onSuccess(request, { submitted: false }),
 * taaki form edit mode mein chala jaye (dobara click par doosra draft na bane).
 */
export function* saveRequestWorker(action) {
  const { requestId, data, submit = false, onSuccess } = action.payload || {};
  let request = null;
  try {
    const response = requestId ? yield call(updateRequest, requestId, data) : yield call(createRequest, data);
    request = dataOf(response)?.request || null;
  } catch (error) {
    yield put(saveRequestFailed(errorMessage(error, 'Failed to save print request')));
    return;
  }

  if (submit && request?.id) {
    try {
      const submitted = yield call(runRequestAction, request.id, 'SUBMIT', {});
      request = dataOf(submitted)?.request || request;
    } catch (error) {
      const message = errorMessage(error, 'Draft saved, but it could not be sent for approval');
      yield put(saveRequestFailed(message));
      yield put(showNotification({ type: 'WARNING', title: 'Saved as Draft', message }));
      yield call(refreshAll, { detailId: request.id });
      if (typeof onSuccess === 'function') onSuccess(request, { submitted: false });
      return;
    }
  }

  yield put(saveRequestSucceeded(request));
  yield put(
    showNotification({
      type: 'SUCCESS',
      title: submit ? 'Sent for Approval' : 'Draft Saved',
      message: submit
        ? `${request?.requestNumber || 'Request'} was sent to the school admin.`
        : `${request?.requestNumber || 'Request'} was saved as a draft.`,
    })
  );
  yield call(refreshAll, { detailId: request?.id });

  if (typeof onSuccess === 'function') onSuccess(request, { submitted: submit });
}

/**
 * payload: { requestId, action, reason?, onSuccess? }
 */
export function* requestActionWorker(action) {
  const { requestId, action: name, reason, onSuccess } = action.payload || {};
  try {
    const response = yield call(runRequestAction, requestId, name, reason ? { reason } : {});
    const request = dataOf(response)?.request || null;
    yield put(requestActionSucceeded(request));
    yield put(
      showNotification({
        type: 'SUCCESS',
        title: request?.statusView?.label || 'Updated',
        message: ACTION_SUCCESS_MESSAGES[name] || 'Request updated.',
      })
    );
    yield call(refreshAll, { detailId: requestId });

    if (typeof onSuccess === 'function') onSuccess(request);
  } catch (error) {
    const message = errorMessage(error, 'Action failed');
    yield put(requestActionFailed(message));
    yield put(showNotification({ type: 'ERROR', title: 'Action Failed', message }));
    // 409 = kisi aur ne status badla → taaza data dikhao
    if (error?.statusCode === 409) yield call(refreshAll, { detailId: requestId });
  }
}

/**
 * payload: { id, kind: 'pdf' | 'zip', requestNumber }
 */
/**
 * kind: 'pdf' | 'zip' → file download; 'print' → print dialog
 * Bulk print: { id: 'bulk', kind: 'print', requestIds } — sab cards ek PDF mein.
 * Print se status nahi badalta; Super Admin print ke baad "Mark Printing Done" karta hai.
 */
export function* downloadFileWorker(action) {
  const { id, kind, requestNumber, requestIds } = action.payload || {};
  const isBulk = Array.isArray(requestIds);
  try {
    if (kind === 'print') {
      const blob = yield call(isBulk ? getBulkPrintPdf : downloadRequestPdf, isBulk ? requestIds : id);
      yield call(printPdfBlob, blob);
      yield put(downloadFileSucceeded());
      yield put(
        showNotification({
          type: 'INFO',
          title: 'Print dialog opened',
          message: isBulk
            ? `Cards of ${requestIds.length} request(s) sent to print. After printing, click "Mark Printing Done" on each request.`
            : 'After printing, click "Mark Printing Done".',
        })
      );
    } else {
      const blob = yield call(kind === 'zip' ? downloadRequestZip : downloadRequestPdf, id);
      yield call(saveBlobAsFile, blob, `${requestNumber || `print-request-${id}`}.${kind === 'zip' ? 'zip' : 'pdf'}`);
      yield put(downloadFileSucceeded());
    }
    // Download count / time list mein update ho
    yield call(refreshAll, {});
  } catch (error) {
    const message = downloadErrorMessage(error, isBulk);
    yield put(downloadFileFailed(message));
    yield put(showNotification({ type: 'ERROR', title: kind === 'print' ? 'Print Failed' : 'Download Failed', message }));
  }
}

/* ---------------- Wizard ---------------- */

export function* fetchWizardTemplatesWorker(action) {
  try {
    const templates = yield call(getWizardTemplates, { isOperator: Boolean(action.payload?.isOperator) });
    yield put(fetchWizardTemplatesSucceeded(templates));
  } catch (error) {
    yield put(fetchWizardTemplatesFailed(errorMessage(error, 'Failed to load templates')));
  }
}

export function* fetchWizardStudentsWorker(action) {
  try {
    const response = yield call(getWizardStudents, action.payload || {});
    const data = dataOf(response);
    yield put(fetchWizardStudentsSucceeded({ students: data?.students || [], classScope: data?.classScope }));
  } catch (error) {
    yield put(fetchWizardStudentsFailed(errorMessage(error, 'Failed to load students')));
  }
}

/**
 * Kuch students ke card previews ek saath. payload: { templateId, studentIds }
 * Ek student fail ho to baaki dikhte hain.
 */
export function* fetchPreviewsWorker(action) {
  const { templateId, studentIds = [] } = action.payload || {};
  try {
    const results = yield all(
      studentIds.map((studentId) =>
        call(function* previewOne() {
          try {
            const response = yield call(previewCard, { templateId, studentId });
            return [studentId, dataOf(response)?.renderData || null];
          } catch {
            return [studentId, null];
          }
        })
      )
    );
    yield put(fetchPreviewsSucceeded(Object.fromEntries(results)));
  } catch (error) {
    yield put(fetchPreviewsFailed(errorMessage(error, 'Failed to load card previews')));
  }
}

/**
 * Request ke ek student ka card (carousel lazy load). Cache mein ho to dobara nahi (payload.force se dobara).
 * payload: { requestId, studentId, force? }
 */
export function* fetchRequestCardPreviewWorker(action) {
  const { requestId, studentId, force } = action.payload || {};
  if (!requestId || !studentId) return;
  const key = cardPreviewKey(requestId, studentId);
  const cached = yield select((state) => state.printRequestWorkflow?.cardPreviews?.byKey?.[key]);
  if (cached?.data && !force) {
    yield put(
      fetchRequestCardPreviewSucceeded({
        key,
        data: { renderData: cached.data, source: cached.source, cardNumber: cached.cardNumber, cardStatus: cached.cardStatus },
      })
    );
    return;
  }
  try {
    const response = yield call(getRequestCardPreview, requestId, studentId);
    yield put(fetchRequestCardPreviewSucceeded({ key, data: dataOf(response) }));
  } catch (error) {
    yield put(fetchRequestCardPreviewFailed({ key, error: errorMessage(error, 'Failed to load card preview') }));
  }
}

/**
 * Review step carousel: ek student ka card (POST /id-cards/preview). Same template ke liye cache.
 * payload: { templateId, studentId }
 */
export function* fetchWizardCardPreviewWorker(action) {
  const { templateId, studentId } = action.payload || {};
  if (!templateId || !studentId) return;
  const cached = yield select((state) => state.printRequestWorkflow?.wizard?.cardPreviews);
  const entry = cached?.templateId === templateId ? cached.byStudentId?.[studentId] : null;
  if (entry?.data) {
    yield put(fetchWizardCardPreviewSucceeded({ templateId, studentId, data: entry.data }));
    return;
  }
  try {
    const response = yield call(previewCard, { templateId, studentId });
    yield put(fetchWizardCardPreviewSucceeded({ templateId, studentId, data: dataOf(response)?.renderData || null }));
  } catch (error) {
    yield put(fetchWizardCardPreviewFailed({ templateId, studentId, error: errorMessage(error, 'Failed to load card') }));
  }
}

/* ---------------- Polling: har 30 s + tab wapas visible hone par ---------------- */

const createVisibilityChannel = () =>
  eventChannel((emit) => {
    const handler = () => {
      if (document.visibilityState === 'visible') emit(true);
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  });

/**
 * startPrintRequestPolling({ detailId? }) — page mount par; stopPrintRequestPolling() — unmount par.
 * takeLatest: naya page purani polling cancel kar deta hai.
 */
export function* pollingWorker(action) {
  const channel = yield call(createVisibilityChannel);
  try {
    while (true) {
      const { stopped } = yield race({
        stopped: take(stopPrintRequestPolling.type),
        tick: delay(PRINT_REQUEST_POLL_INTERVAL_MS),
        visible: take(channel),
      });
      if (stopped) break;
      yield call(refreshAll, { detailId: action.payload?.detailId || null });
    }
  } finally {
    channel.close();
  }
}

export function* watchPrintRequestWorkflow() {
  yield takeLatest(fetchRequestsRequested.type, fetchRequestsWorker);
  yield takeLatest(fetchSummaryRequested.type, fetchSummaryWorker);
  yield takeLatest(fetchBadgeCountsRequested.type, fetchBadgeCountsWorker);
  yield takeLatest(fetchRequestRequested.type, fetchRequestWorker);
  yield takeLatest(saveRequestRequested.type, saveRequestWorker);
  yield takeLatest(requestActionRequested.type, requestActionWorker);
  // Har file ka download alag (ek doosre ko cancel na kare)
  yield takeEvery(downloadFileRequested.type, downloadFileWorker);
  yield takeEvery(fetchRequestCardPreviewRequested.type, fetchRequestCardPreviewWorker);
  yield takeEvery(fetchWizardCardPreviewRequested.type, fetchWizardCardPreviewWorker);
  yield takeLatest(fetchWizardTemplatesRequested.type, fetchWizardTemplatesWorker);
  yield takeLatest(fetchWizardStudentsRequested.type, fetchWizardStudentsWorker);
  yield takeLatest(fetchPreviewsRequested.type, fetchPreviewsWorker);
  yield takeLatest(startPrintRequestPolling.type, pollingWorker);
}

export default watchPrintRequestWorkflow;

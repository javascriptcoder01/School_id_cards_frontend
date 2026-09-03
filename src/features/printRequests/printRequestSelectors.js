import { createSelector } from '@reduxjs/toolkit';
import { PRINT_REQUEST_STATUS } from '../../constants/printRequest.js';

export const selectPrintRequestsState = (state) => state.printRequests;

export const selectPrintRequests = createSelector(
  [selectPrintRequestsState],
  (state) => state?.list || []
);

export const selectSelectedPrintRequest = createSelector(
  [selectPrintRequestsState],
  (state) => state?.selectedRequest || null
);

export const selectPrintRequestStatus = createSelector(
  [selectPrintRequestsState],
  (state) => state?.status || 'idle'
);

export const selectPrintRequestActionStatus = createSelector(
  [selectPrintRequestsState],
  (state) => state?.actionStatus || 'idle'
);

export const selectPrintRequestDownloadStatus = createSelector(
  [selectPrintRequestsState],
  (state) => state?.downloadStatus || 'idle'
);

export const selectPrintRequestError = createSelector(
  [selectPrintRequestsState],
  (state) => state?.error || null
);

export const selectPrintRequestPagination = createSelector(
  [selectPrintRequestsState],
  (state) => state?.pagination || null
);

export const selectPrintRequestFilters = createSelector(
  [selectPrintRequestsState],
  (state) => state?.filters || {}
);

export const selectIsPrintRequestLoading = createSelector(
  [selectPrintRequestStatus],
  (status) => status === 'loading'
);

export const selectIsPrintRequestActionLoading = createSelector(
  [selectPrintRequestActionStatus],
  (status) => status === 'loading'
);

export const selectIsPrintRequestDownloadLoading = createSelector(
  [selectPrintRequestDownloadStatus],
  (status) => status === 'loading'
);

export const selectPendingCollegeRequests = createSelector(
  [selectPrintRequests],
  (requests) =>
    requests.filter((r) => r.status === PRINT_REQUEST_STATUS.PENDING_COLLEGE_APPROVAL)
);

export const selectPendingSuperAdminRequests = createSelector(
  [selectPrintRequests],
  (requests) => requests.filter((r) => r.status === PRINT_REQUEST_STATUS.SENT_TO_SUPER_ADMIN)
);

export const selectPrintRequestsGroupedByCollege = createSelector(
  [selectPrintRequests],
  (requests) => {
    const groups = {};
    requests.forEach((req) => {
      const college =
        req.collegeId && typeof req.collegeId === 'object'
          ? req.collegeId
          : { id: req.collegeId || 'UNKNOWN', name: 'Unknown Institution', code: '' };
      const cId = college.id || college._id || 'UNKNOWN';

      if (!groups[cId]) {
        groups[cId] = {
          college,
          requests: [],
          totalCards: 0,
          pending: 0,
          approved: 0,
          printing: 0,
          completed: 0,
          rejected: 0,
        };
      }

      groups[cId].requests.push(req);
      groups[cId].totalCards += Number(req.totalCards || 1);

      if (req.status === PRINT_REQUEST_STATUS.SENT_TO_SUPER_ADMIN) groups[cId].pending++;
      else if (req.status === PRINT_REQUEST_STATUS.SUPER_ADMIN_APPROVED) groups[cId].approved++;
      else if (req.status === PRINT_REQUEST_STATUS.PRINTING) groups[cId].printing++;
      else if (req.status === PRINT_REQUEST_STATUS.COMPLETED) groups[cId].completed++;
      else if (req.status === PRINT_REQUEST_STATUS.SUPER_ADMIN_REJECTED) groups[cId].rejected++;
    });

    return Object.values(groups);
  }
);


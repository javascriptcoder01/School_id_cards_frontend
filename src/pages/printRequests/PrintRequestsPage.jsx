import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Printer, RefreshCw, Layers } from 'lucide-react';
import {
  fetchMyPrintRequestsRequested,
  fetchCollegePrintRequestsRequested,
} from '../../features/printRequests/printRequestSlice.js';
import {
  selectPrintRequests,
  selectIsPrintRequestLoading,
  selectPrintRequestError,
} from '../../features/printRequests/printRequestSelectors.js';
import { selectUserRole } from '../../features/auth/authSelectors.js';
import { ROLES } from '../../constants/roles.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import OperatorPrintRequestList from '../../components/printRequests/OperatorPrintRequestList.jsx';
import CollegePrintRequestQueue from '../../components/printRequests/CollegePrintRequestQueue.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';

export const PrintRequestsPage = () => {
  const dispatch = useDispatch();
  const userRole = useSelector(selectUserRole);
  const requests = useSelector(selectPrintRequests);
  const isLoading = useSelector(selectIsPrintRequestLoading);
  const error = useSelector(selectPrintRequestError);

  const isOperator = userRole === ROLES.OPERATOR;
  const isCollegeAdmin = userRole === ROLES.COLLEGE_ADMIN;

  const loadData = () => {
    if (isOperator) {
      dispatch(fetchMyPrintRequestsRequested());
    } else if (isCollegeAdmin) {
      dispatch(fetchCollegePrintRequestsRequested());
    }
  };

  useEffect(() => {
    loadData();
  }, [dispatch, isOperator, isCollegeAdmin]);

  const pageTitle = isOperator ? 'My Print Requests' : 'College Print Request Queue';
  const pageSubtitle = isOperator
    ? 'Track the status and progress of your submitted student ID card print requests'
    : 'Review, approve, reject, and forward operator ID card print requests to the Super Admin Print Center';

  return (
    <div className="space-y-6">
      <PageHeader
        title={pageTitle}
        subtitle={pageSubtitle}
        icon={Printer}
        action={
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        }
      />

      {error && <ErrorMessage message={error} title="Print Requests Error" />}

      {isOperator && (
        <OperatorPrintRequestList requests={requests} isLoading={isLoading} />
      )}

      {isCollegeAdmin && (
        <CollegePrintRequestQueue requests={requests} isLoading={isLoading} />
      )}
    </div>
  );
};

export default PrintRequestsPage;


import React from 'react';
import { Link } from 'react-router-dom';
import { Printer, Eye, Calendar, Layers, AlertCircle, ArrowRight } from 'lucide-react';
import { getPrintRequestDetailRoute } from '../../constants/routes.js';
import PrintRequestStatusBadge from './PrintRequestStatusBadge.jsx';
import EmptyState from '../common/EmptyState.jsx';
import Loader from '../common/Loader.jsx';

/**
 * OperatorPrintRequestList Component
 * Displays the authenticated operator's submitted print requests
 */
export const OperatorPrintRequestList = ({
  requests = [],
  isLoading = false,
  className = '',
}) => {
  if (isLoading) {
    return <Loader message="Fetching your print requests..." />;
  }

  if (!requests || requests.length === 0) {
    return (
      <EmptyState
        title="No Print Requests Yet"
        description="You have not submitted any ID card print requests. Generate ID cards for your students and submit them for printing."
        icon={Printer}
      />
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" aria-label="Operator Print Requests">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Request ID</th>
              <th className="py-3.5 px-4">Submitted Date</th>
              <th className="py-3.5 px-4">Cards / Scope</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4">Current Status</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {requests.map((request) => {
              const requestId = request.id || request._id;
              const dateStr = request.createdAt
                ? new Date(request.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
                : '--';

              return (
                <tr key={requestId} className="hover:bg-slate-50/80 transition-colors group">
                  {/* Request ID */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                        <Printer className="w-4 h-4" />
                      </div>
                      <div>
                        <Link
                          to={getPrintRequestDetailRoute(requestId)}
                          className="font-mono font-semibold text-slate-900 hover:text-indigo-600 transition-colors text-xs block"
                        >
                          #{String(requestId).slice(-8).toUpperCase()}
                        </Link>
                        {request.rejectionReason && (
                          <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-0.5" title={request.rejectionReason}>
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[150px]">{request.rejectionReason}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Submitted Date */}
                  <td className="py-4 px-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {dateStr}
                    </span>
                  </td>

                  {/* Cards / Scope */}
                  <td className="py-4 px-4 text-xs font-semibold text-slate-800">
                    <span>{request.totalCards || (Array.isArray(request.studentIds) ? request.studentIds.length : 1)} Cards</span>
                  </td>

                  {/* Type */}
                  <td className="py-4 px-4 text-xs font-medium text-slate-600">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
                      {request.requestType || 'SINGLE'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    <PrintRequestStatusBadge status={request.status} />
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <Link
                      to={getPrintRequestDetailRoute(requestId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OperatorPrintRequestList;


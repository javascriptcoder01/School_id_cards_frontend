import React from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Printer,
  Ban,
  HelpCircle,
} from 'lucide-react';
import {
  PRINT_REQUEST_STATUS,
  PRINT_REQUEST_STATUS_META,
} from '../../constants/printRequest.js';

/**
 * Accessible Print Request Status Badge
 */
export const PrintRequestStatusBadge = ({
  status,
  className = '',
  showIcon = true,
}) => {
  const meta = PRINT_REQUEST_STATUS_META[status] || {
    label: status || 'Unknown',
    colorClass: 'bg-slate-50 text-slate-700 border-slate-200',
    description: 'Status unavailable',
  };

  const getStatusIcon = (st) => {
    switch (st) {
      case PRINT_REQUEST_STATUS.DRAFT:
        return <Clock className="w-3.5 h-3.5 text-slate-500" />;
      case PRINT_REQUEST_STATUS.READY_FOR_COLLEGE_APPROVAL:
        return <Clock className="w-3.5 h-3.5 text-amber-600" />;
      case PRINT_REQUEST_STATUS.PROCESSING:
        return <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin" />;
      case PRINT_REQUEST_STATUS.READY_FOR_SUPER_ADMIN:
        return <Send className="w-3.5 h-3.5 text-indigo-600" />;
      case PRINT_REQUEST_STATUS.READY_TO_PRINT:
        return <CheckCircle className="w-3.5 h-3.5 text-cyan-600" />;
      case PRINT_REQUEST_STATUS.PRINTING:
        return <Printer className="w-3.5 h-3.5 text-amber-600 animate-pulse" />;
      case PRINT_REQUEST_STATUS.COMPLETED:
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />;
      case PRINT_REQUEST_STATUS.REJECTED:
        return <XCircle className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.colorClass} ${className}`}
      title={meta.description}
      aria-label={`Status: ${meta.label}`}
    >
      {showIcon && getStatusIcon(status)}
      <span>{meta.label}</span>
    </span>
  );
};

export default PrintRequestStatusBadge;


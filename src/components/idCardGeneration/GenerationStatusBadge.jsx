import React, { memo } from 'react';
import { Clock, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { GENERATION_STATUS } from '../../constants/idCardGeneration.js';

export const GenerationStatusBadge = memo(({ status = GENERATION_STATUS.PENDING }) => {
  switch (status) {
    case GENERATION_STATUS.PENDING:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          PENDING
        </span>
      );

    case GENERATION_STATUS.PROCESSING:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
          PROCESSING
        </span>
      );

    case GENERATION_STATUS.COMPLETED:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          COMPLETED
        </span>
      );

    case GENERATION_STATUS.FAILED:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          FAILED
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          {status || 'UNKNOWN'}
        </span>
      );
  }
});

GenerationStatusBadge.displayName = 'GenerationStatusBadge';

export default GenerationStatusBadge;

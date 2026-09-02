import React, { memo } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export const TemplateStatusBadge = memo(({ isActive = true }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        isActive
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-rose-50 text-rose-700 border-rose-200'
      }`}
    >
      {isActive ? (
        <>
          <CheckCircle className="w-3 h-3 text-emerald-500" />
          ACTIVE
        </>
      ) : (
        <>
          <XCircle className="w-3 h-3 text-rose-500" />
          INACTIVE
        </>
      )}
    </span>
  );
});

TemplateStatusBadge.displayName = 'TemplateStatusBadge';

export default TemplateStatusBadge;

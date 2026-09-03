import React from 'react';
import { Shield } from 'lucide-react';

/**
 * OperatorAssignmentBanner Component
 * Displays the authenticated operator's assigned scope (Subject, Class, Section)
 * and clearly indicates that backend enforces this scope for student creation.
 */
export const OperatorAssignmentBanner = ({
  subjectName = '',
  className = '',
  sectionName = '',
  operatorName = '',
  classNameProp = '',
}) => {
  if (!subjectName && !className && !sectionName && !operatorName) {
    return null;
  }

  return (
    <div
      data-testid="operator-assignment-banner"
      className={`p-4 bg-indigo-50/90 border border-indigo-100 rounded-2xl flex items-start gap-3 shadow-xs ${classNameProp}`}
      role="region"
      aria-label="Operator Assignment Scope"
    >
      <Shield className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
          Operator Assignment Scope
        </p>
        <div className="text-xs text-indigo-800 flex flex-wrap items-center gap-x-3 gap-y-1">
          {operatorName && (
            <span>
              Operator: <span className="font-semibold text-indigo-950">{operatorName}</span>
            </span>
          )}
          <span>
            Assigned Subject:{' '}
            <span className="font-semibold text-indigo-950">{subjectName || 'N/A'}</span>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Assigned Class:{' '}
            <span className="font-semibold text-indigo-950">{className || 'N/A'}</span>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Assigned Section:{' '}
            <span className="font-semibold text-indigo-950">{sectionName || 'N/A'}</span>
          </span>
        </div>
        <p className="text-[11px] text-indigo-600/90 font-medium">
          Students created here are automatically assigned to your authorized class and section.
        </p>
      </div>
    </div>
  );
};

export default OperatorAssignmentBanner;

import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { calculateStudentCompletion } from '../../utils/studentCompletion.js';

export { calculateStudentCompletion, calculateStudentCompletion as computeStudentCompletion };

export const StudentCompletionMetric = ({
  student,
  showDetail = false,
  className = '',
}) => {
  const { isComplete, completedCount, totalRequired, percentage, missingFields } =
    calculateStudentCompletion(student);

  if (isComplete) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
          title="Student profile is 100% complete with photo"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>COMPLETED</span>
        </span>
        {showDetail && (
          <span className="text-xs text-slate-500 font-medium">
            ({completedCount}/{totalRequired} fields · 100%)
          </span>
        )}
      </div>
    );
  }

  const formatMissingLabel = (field) => {
    switch (field) {
      case 'name':
        return 'Name';
      case 'studentId':
        return 'Student ID';
      case 'className':
        return 'Class';
      case 'section':
        return 'Section';
      case 'photo':
        return 'Photo';
      default:
        return field;
    }
  };

  const missingLabels = missingFields.map(formatMissingLabel);

  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      <div className="inline-flex items-center gap-1.5">
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200"
          title={`Profile pending: missing ${missingLabels.join(', ')}`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>PENDING ({percentage}%)</span>
        </span>
        {showDetail && (
          <span className="text-xs text-slate-500 font-medium">
            {completedCount}/{totalRequired} fields
          </span>
        )}
      </div>
      {showDetail && missingLabels.length > 0 && (
        <span className="text-[11px] text-rose-500 font-medium">
          Missing: {missingLabels.join(', ')}
        </span>
      )}
    </div>
  );
};

export default StudentCompletionMetric;

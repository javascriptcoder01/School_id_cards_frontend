import React from 'react';
import EmptyState from '../common/EmptyState.jsx';

export const OperatorClassProgressTable = ({
  operators = [],
}) => {
  if (!operators || operators.length === 0) {
    return (
      <EmptyState
        title="No Operator Progress Recorded"
        description="Assign operators to classes and sections to begin tracking class roster completion and ID generation progress."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <th className="px-5 py-3.5">Operator (Teacher)</th>
            <th className="px-5 py-3.5">Assigned Class</th>
            <th className="px-5 py-3.5">Section</th>
            <th className="px-5 py-3.5">Total Students</th>
            <th className="px-5 py-3.5">Complete</th>
            <th className="px-5 py-3.5">Pending Info</th>
            <th className="px-5 py-3.5">Generated Cards</th>
            <th className="px-5 py-3.5">Pending Cards</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {operators.flatMap((item, opIdx) => {
            const op = item.operator || {};
            const opName = op.name || 'Operator';
            const opEmail = op.email || '';
            const assignments = item.assignments || [];

            if (assignments.length === 0) {
              return [
                <tr key={`op-${opIdx}`} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-slate-900">{opName}</div>
                    {opEmail && <div className="text-xs text-slate-400 font-normal">{opEmail}</div>}
                  </td>
                  <td colSpan={7} className="px-5 py-3.5 text-xs text-slate-400 italic">
                    No active class assignments
                  </td>
                </tr>,
              ];
            }

            return assignments.map((asgn, asgnIdx) => (
              <tr key={`op-${opIdx}-asgn-${asgnIdx}`} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5">
                  {asgnIdx === 0 ? (
                    <div>
                      <div className="font-semibold text-slate-900">{opName}</div>
                      {opEmail && <div className="text-xs text-slate-400 font-normal">{opEmail}</div>}
                    </div>
                  ) : (
                    <span className="text-slate-300 text-xs pl-2">↳</span>
                  )}
                </td>
                <td className="px-5 py-3.5 font-bold text-slate-800">
                  Class {asgn.className}
                </td>
                <td className="px-5 py-3.5 font-semibold text-slate-700">
                  Section {asgn.section}
                </td>
                <td className="px-5 py-3.5 font-semibold text-slate-900">
                  {asgn.totalStudents ?? 0}
                </td>
                <td className="px-5 py-3.5 font-semibold text-emerald-600">
                  {asgn.completedStudents ?? 0}
                </td>
                <td className="px-5 py-3.5 font-semibold text-amber-600">
                  {asgn.pendingStudents ?? 0}
                </td>
                <td className="px-5 py-3.5 font-semibold text-indigo-600">
                  {asgn.generatedCards ?? 0}
                </td>
                <td className="px-5 py-3.5 font-semibold text-slate-600">
                  {asgn.pendingCards ?? 0}
                </td>
              </tr>
            ));
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OperatorClassProgressTable;


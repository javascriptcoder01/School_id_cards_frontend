import React from 'react';
import { Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import EmptyState from '../common/EmptyState.jsx';

export const OperatorAssignmentTable = ({
  assignments = [],
  onEdit,
  onDeactivate,
  isDeactivating = false,
}) => {
  if (!assignments || assignments.length === 0) {
    return (
      <EmptyState
        title="No Operator Assignments Found"
        description="Assign operators (class teachers) to specific classes and sections to enable scoped student management."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <th className="px-5 py-3.5">Operator (Teacher)</th>
            <th className="px-5 py-3.5">Class / Grade</th>
            <th className="px-5 py-3.5">Section</th>
            <th className="px-5 py-3.5">Status</th>
            <th className="px-5 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {assignments.map((item) => {
            const operator = item.operatorId || {};
            const opName = typeof operator === 'object' ? operator.name || 'Operator' : 'Operator';
            const opEmail = typeof operator === 'object' ? operator.email || '' : '';
            const isActive = item.isActive !== false;

            return (
              <tr key={item.id || item._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="font-semibold text-slate-900">{opName}</div>
                  {opEmail && <div className="text-xs text-slate-500 font-normal">{opEmail}</div>}
                </td>
                <td className="px-5 py-3.5 font-medium text-slate-800">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Class {item.className}
                  </span>
                </td>
                <td className="px-5 py-3.5 font-medium text-slate-800">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    Section {item.section}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  {isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                      <XCircle className="w-3.5 h-3.5 text-slate-400" />
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="inline-flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      title="Edit Assignment"
                      aria-label={`Edit assignment for ${opName}`}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeactivate(item)}
                      disabled={isDeactivating}
                      title="Deactivate Assignment"
                      aria-label={`Deactivate assignment for ${opName}`}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OperatorAssignmentTable;


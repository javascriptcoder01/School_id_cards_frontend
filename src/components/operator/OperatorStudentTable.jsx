import React from 'react';
import { Edit, Eye, CheckCircle2, AlertCircle } from 'lucide-react';
import EmptyState from '../common/EmptyState.jsx';

export const OperatorStudentTable = ({
  students = [],
  onEdit,
  onPreview,
}) => {
  if (!students || students.length === 0) {
    return (
      <EmptyState
        title="No Assigned Students Found"
        description="No student records match your assigned classes or search criteria."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <th className="px-5 py-3.5">Student</th>
            <th className="px-5 py-3.5">Student ID</th>
            <th className="px-5 py-3.5">Class & Section</th>
            <th className="px-5 py-3.5">Roll No.</th>
            <th className="px-5 py-3.5">Completion</th>
            <th className="px-5 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {students.map((student) => {
            const id = student.id || student._id;
            const completion = student.completion || {};
            const isComplete = completion.isComplete !== undefined
              ? completion.isComplete
              : Boolean(student.photo && student.name && student.studentId && student.className);

            return (
              <tr key={id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    {student.photo ? (
                      <img
                        src={student.photo}
                        alt={student.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 bg-slate-100 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                        {student.name?.charAt(0)?.toUpperCase() || 'S'}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-slate-900">{student.name}</div>
                      <div className="text-xs text-slate-500">{student.gender || '—'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 font-mono text-xs text-slate-700 font-semibold">
                  {student.studentId}
                </td>
                <td className="px-5 py-3.5 font-medium text-slate-800">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Class {student.className} - {student.section || '—'}
                  </span>
                </td>
                <td className="px-5 py-3.5 font-medium text-slate-700">
                  {student.rollNumber || '—'}
                </td>
                <td className="px-5 py-3.5">
                  {isComplete ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Complete
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      Pending Info
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="inline-flex items-center justify-end gap-1.5">
                    {onPreview && (
                      <button
                        type="button"
                        onClick={() => onPreview(student)}
                        title="Preview ID Card"
                        aria-label={`Preview ID Card for ${student.name}`}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(student)}
                        title="Edit Student"
                        aria-label={`Edit ${student.name}`}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
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

export default OperatorStudentTable;


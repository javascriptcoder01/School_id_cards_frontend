import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit3, CheckCircle, XCircle, GraduationCap, Mail, Phone, Hash } from 'lucide-react';
import { getStudentDetailRoute, getStudentEditRoute } from '../../constants/routes.js';
import EmptyState from '../common/EmptyState.jsx';
import Loader from '../common/Loader.jsx';

/**
 * StudentTable Component
 * Renders the list of students with responsive table design, status toggling, and action links
 */
export const StudentTable = ({
  students = [],
  isLoading = false,
  canEdit = true,
  statusLoadingId = null,
  onStatusToggle,
}) => {
  if (isLoading) {
    return <Loader message="Fetching students list..." />;
  }

  if (!students || students.length === 0) {
    return (
      <EmptyState
        title="No Students Found"
        description="No student records match your current search criteria. Try adjusting your query or register a new student."
        icon={GraduationCap}
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" aria-label="Students Directory">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Student</th>
              <th className="py-3.5 px-4">Class & Section</th>
              <th className="py-3.5 px-4">Roll Number</th>
              <th className="py-3.5 px-4">Contact</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {students.map((student) => {
              const isToggling = statusLoadingId === student.id;

              return (
                <tr
                  key={student.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Student Name & ID */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      {student.photo ? (
                        <img
                          src={student.photo}
                          alt={`${student.name} photo`}
                          className="w-10 h-10 rounded-xl object-cover bg-slate-50 border border-slate-200 shrink-0"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                          {student.name ? student.name.slice(0, 2).toUpperCase() : <GraduationCap className="w-5 h-5" />}
                        </div>
                      )}
                      <div>
                        <Link
                          to={getStudentDetailRoute(student.id)}
                          className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors block"
                        >
                          {student.name}
                        </Link>
                        <span className="inline-flex items-center text-xs font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md mt-0.5">
                          ID: {student.studentId}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Class & Section */}
                  <td className="py-4 px-4 text-xs font-medium text-slate-700">
                    <div>
                      <span>{student.className}</span>
                      {student.section && (
                        <span className="text-slate-400 font-normal ml-1">
                          (Sec: {student.section})
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Roll Number */}
                  <td className="py-4 px-4 text-xs font-mono text-slate-600">
                    {student.rollNumber ? (
                      <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        {student.rollNumber}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">--</span>
                    )}
                  </td>

                  {/* Contact */}
                  <td className="py-4 px-4 text-slate-600 text-xs">
                    <div className="space-y-0.5">
                      {student.email ? (
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[140px]">{student.email}</span>
                        </div>
                      ) : null}
                      {student.phone ? (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{student.phone}</span>
                        </div>
                      ) : null}
                      {!student.email && !student.phone && (
                        <span className="text-slate-400 italic">No contact</span>
                      )}
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${student.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                    >
                      {student.isActive ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-rose-500" />
                          Inactive
                        </>
                      )}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      {/* View Action */}
                      <Link
                        to={getStudentDetailRoute(student.id)}
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View details"
                        aria-label={`View ${student.name}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {/* Edit Action */}
                      {canEdit && (
                        <Link
                          to={getStudentEditRoute(student.id)}
                          className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit student"
                          aria-label={`Edit ${student.name}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                      )}

                      {/* Status Toggle Action */}
                      {canEdit && onStatusToggle && (
                        <button
                          type="button"
                          disabled={isToggling}
                          onClick={() => onStatusToggle(student.id, !student.isActive)}
                          className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50 ${student.isActive
                              ? 'text-rose-600 border-rose-200 hover:bg-rose-50'
                              : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                            }`}
                          title={student.isActive ? 'Deactivate student' : 'Activate student'}
                        >
                          {isToggling ? '...' : student.isActive ? 'Deactivate' : 'Activate'}
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
    </div>
  );
};

export default StudentTable;


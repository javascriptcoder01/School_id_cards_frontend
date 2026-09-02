import React from 'react';
import { Eye, Printer } from 'lucide-react';
import EmptyState from '../common/EmptyState.jsx';

export const CollegePrintQueueTable = ({
  colleges = [],
  onViewCollege,
}) => {
  if (!colleges || colleges.length === 0) {
    return (
      <EmptyState
        title="No Print Queues Found"
        description="No colleges currently have student ID cards in the central print management queue."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <th className="px-5 py-3.5">College / Institution</th>
            <th className="px-5 py-3.5">Total Students</th>
            <th className="px-5 py-3.5">Info Complete</th>
            <th className="px-5 py-3.5">Generated Cards</th>
            <th className="px-5 py-3.5">Ready to Print</th>
            <th className="px-5 py-3.5">Pending</th>
            <th className="px-5 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {colleges.map((item) => {
            const college = item.college || {};
            const stats = item.statistics || {};
            const collegeId = college.id || college._id;
            const readyToPrint = stats.readyToPrint !== undefined ? stats.readyToPrint : (stats.generatedCards || 0);

            return (
              <tr key={collegeId} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    {college.logo ? (
                      <img
                        src={college.logo}
                        alt={college.name}
                        className="w-9 h-9 rounded-xl object-contain border border-slate-200 bg-white p-0.5 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-xs shrink-0">
                        {college.code || 'COL'}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-slate-900">{college.name}</div>
                      <div className="text-xs text-slate-400 font-mono font-medium">{college.code}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 font-semibold text-slate-900">
                  {stats.totalStudents ?? 0}
                </td>
                <td className="px-5 py-3.5 font-semibold text-emerald-600">
                  {stats.completedStudents ?? 0}
                </td>
                <td className="px-5 py-3.5 font-semibold text-purple-600">
                  {stats.generatedCards ?? 0}
                </td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <Printer className="w-3.5 h-3.5 text-emerald-600" />
                    {readyToPrint} Cards
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-500 font-medium">
                  {stats.pendingCards ?? 0} Pending
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => onViewCollege(collegeId)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Queue</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CollegePrintQueueTable;


import React from 'react';
import { UserCheck, CheckCircle2, AlertCircle, Sparkles, Printer, User } from 'lucide-react';
import EmptyState from '../common/EmptyState.jsx';

/**
 * OperatorProgressTable Component
 * Displayed on the College Admin Dashboard to track each operator's performance:
 * - Student onboarding & profile completion
 * - ID card generations
 * - Print request throughput
 */
export const OperatorProgressTable = ({ operators = [], isLoading = false }) => {
  if (!operators || operators.length === 0) {
    return (
      <EmptyState
        title="No Operators Assigned"
        description="No operators or class rosters are currently configured for your institution. Assign operators to track their class-wise student enrollment and ID card progress."
        icon={UserCheck}
      />
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm" aria-label="Operator Class Progress Table">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-4 px-4 sm:px-6">Operator & Subject</th>
              <th className="py-4 px-4">Assigned Scope</th>
              <th className="py-4 px-4 text-center">Students (Comp / Pend / Total)</th>
              <th className="py-4 px-4 text-center">ID Cards (Gen / Pend)</th>
              <th className="py-4 px-4 text-center">Print Requests (Review / Printing / Comp)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {operators.map((op) => {
              const studentStats = op.students || {};
              const idStats = op.idCards || {};
              const printStats = op.printRequests || {};

              const totalStudents = studentStats.total ?? op.totalStudents ?? 0;
              const completeStudents = studentStats.complete ?? op.completedStudents ?? 0;
              const pendingStudents = studentStats.pending ?? op.pendingStudents ?? 0;

              const generatedCards = idStats.generated ?? op.generatedCards ?? 0;
              const pendingCards = idStats.pendingGeneration ?? op.pendingGenerationCards ?? (totalStudents - generatedCards);

              const pendingPrint = printStats.pendingCollegeApproval ?? op.pendingCollegeApproval ?? 0;
              const sentSuperAdmin = printStats.sentToSuperAdmin ?? op.sentToSuperAdmin ?? 0;
              const printing = printStats.printing ?? op.printing ?? 0;
              const completedPrint = printStats.completed ?? op.completedPrint ?? 0;

              const percent = totalStudents > 0 ? Math.round((completeStudents / totalStudents) * 100) : 0;

              return (
                <tr key={op.operatorId || op.id || op.email} className="hover:bg-slate-50/80 transition-colors">
                  {/* Operator Info */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {op.name ? op.name.charAt(0).toUpperCase() : 'O'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">{op.name || 'Unnamed Operator'}</p>
                        <p className="text-xs text-slate-400 truncate max-w-xs">{op.email}</p>
                        {op.subjectName && (
                          <span className="inline-block mt-0.5 text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                            Subject: {op.subjectName}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Class Scope */}
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      {op.className || 'Class N/A'} {op.sectionName || op.section ? `(Sec ${op.sectionName || op.section})` : ''}
                    </span>
                  </td>

                  {/* Students Progress */}
                  <td className="py-4 px-4 text-center">
                    <div className="inline-flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <span className="text-emerald-700">{completeStudents}</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-amber-700">{pendingStudents}</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-800">{totalStudents}</span>
                      </div>
                      <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">{percent}% Complete</span>
                    </div>
                  </td>

                  {/* ID Cards */}
                  <td className="py-4 px-4 text-center">
                    <div className="inline-flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200" title="Generated ID Cards">
                        {generatedCards} Gen
                      </span>
                      {pendingCards > 0 && (
                        <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200" title="Pending Generation">
                          {pendingCards} Pend
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Print Requests */}
                  <td className="py-4 px-4 text-center">
                    <div className="inline-flex items-center gap-1.5 text-xs">
                      <span className="px-2 py-0.5 rounded-lg font-bold bg-amber-50 text-amber-700" title="Pending Review">
                        {pendingPrint} Rev
                      </span>
                      <span className="px-2 py-0.5 rounded-lg font-bold bg-blue-50 text-blue-700" title="In Printing">
                        {printing} Print
                      </span>
                      <span className="px-2 py-0.5 rounded-lg font-bold bg-emerald-50 text-emerald-700" title="Completed">
                        {completedPrint} Done
                      </span>
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

export default OperatorProgressTable;

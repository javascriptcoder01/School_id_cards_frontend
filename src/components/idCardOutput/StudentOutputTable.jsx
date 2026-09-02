import React from 'react';
import { User, CheckCircle2, AlertTriangle, Clock, FileX2 } from 'lucide-react';
import DownloadButton from './DownloadButton.jsx';
import EmptyState from '../common/EmptyState.jsx';

export const StudentOutputTable = ({
  generationId,
  results = [],
  isLoading = false,
}) => {
  if (!results || results.length === 0) {
    return (
      <EmptyState
        title="No Output Records"
        description="No student output records are available for this generation job."
        icon={FileX2}
      />
    );
  }

  const getOutputBadge = (item) => {
    const isCleaned = Boolean(item.cleaned || item.isCleaned || item.outputCleaned);
    const isFailed = item.status === 'FAILED' || item.isFailed;
    const isAvailable = (item.status === 'COMPLETED' || item.status === 'SUCCESS' || !item.status) && !isCleaned;

    if (isCleaned) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          Cleaned Up
        </span>
      );
    }

    if (isFailed) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertTriangle className="w-3 h-3 text-rose-500" />
          Failed
        </span>
      );
    }

    if (isAvailable) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          Available (PNG)
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3 h-3 text-amber-500" />
        Pending
      </span>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Generated Student Card Outputs</h3>
            <p className="text-xs text-slate-500">Individual student ID card PNG assets ({results.length} total)</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" aria-label="Student Card Outputs Table">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Student</th>
              <th className="py-3.5 px-4">Student ID / Reg</th>
              <th className="py-3.5 px-4">Output Status</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Download Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {results.map((res, idx) => {
              const studentId = res.studentId || res.id || `student-${idx}`;
              const studentName = res.studentName || res.name || 'Student Record';
              const isCleaned = Boolean(res.cleaned || res.isCleaned || res.outputCleaned);
              const isFailed = res.status === 'FAILED';
              const canDownload = !isCleaned && !isFailed;

              return (
                <tr key={studentId} className="hover:bg-slate-50/80 transition-colors">
                  {/* Student Name */}
                  <td className="py-4 px-4 sm:px-6 font-semibold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <span>{studentName}</span>
                    </div>
                  </td>

                  {/* Student ID */}
                  <td className="py-4 px-4 font-mono text-xs text-slate-600">
                    {res.studentRegNo || res.studentId || '--'}
                  </td>

                  {/* Output Status */}
                  <td className="py-4 px-4">
                    {getOutputBadge(res)}
                  </td>

                  {/* Action */}
                  <td className="py-4 px-4 sm:px-6 text-right">
                    {canDownload ? (
                      <DownloadButton
                        type="PNG"
                        generationId={generationId}
                        studentId={studentId}
                        studentName={studentName}
                      />
                    ) : isCleaned ? (
                      <span className="text-xs text-slate-400 italic">File cleaned</span>
                    ) : (
                      <span className="text-xs text-rose-500 italic">Unavailable</span>
                    )}
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

export default StudentOutputTable;


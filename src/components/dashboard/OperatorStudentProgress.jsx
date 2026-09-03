import React from 'react';
import {
  Users,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Printer,
  Sparkles,
  TrendingUp,
  Clock,
  Send,
  XCircle,
} from 'lucide-react';

/**
 * OperatorStudentProgress Component
 * Visualizes the Operator's real-time operational status:
 * 1. Student Profile Completion (Complete vs Pending)
 * 2. ID Card Generation Progress (Generated vs Pending)
 * 3. Print Request Pipeline Lifecycle
 */
export const OperatorStudentProgress = ({
  studentsSummary = {},
  idCardsSummary = {},
  printRequestsSummary = {},
  assignment = null,
  isLoading = false,
}) => {
  const totalStudents = studentsSummary?.total ?? 0;
  const completeStudents = studentsSummary?.complete ?? 0;
  const pendingStudents = studentsSummary?.pending ?? 0;

  const completionPercent =
    totalStudents > 0 ? Math.round((completeStudents / totalStudents) * 100) : 0;

  const totalGeneratedCards = idCardsSummary?.generated ?? 0;
  const pendingGenerationCards = idCardsSummary?.pendingGeneration ?? 0;

  const printTotal = printRequestsSummary?.total ?? 0;
  const printPendingCollege = printRequestsSummary?.pendingCollegeApproval ?? 0;
  const printCollegeApproved = printRequestsSummary?.collegeApproved ?? 0;
  const printSentToSuperAdmin = printRequestsSummary?.sentToSuperAdmin ?? 0;
  const printPrinting = printRequestsSummary?.printing ?? 0;
  const printCompleted = printRequestsSummary?.completed ?? 0;
  const printRejected =
    (printRequestsSummary?.collegeRejected ?? 0) +
    (printRequestsSummary?.superAdminRejected ?? 0);

  return (
    <div className="space-y-6">
      {/* 3 Overview KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Student Profiles */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {completionPercent}% Complete
            </span>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Assigned Students
            </span>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{totalStudents}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
                role="progressbar"
                aria-valuenow={completionPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {completeStudents} Complete
              </span>
              <span className="text-amber-700 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                {pendingStudents} Pending
              </span>
            </div>
          </div>
        </div>

        {/* 2. ID Card Generations */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Ready for Print
            </span>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Generated ID Cards
            </span>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{totalGeneratedCards}</p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Pending Card Generation:</span>
            <span className="font-bold text-amber-600">{pendingGenerationCards} students</span>
          </div>
        </div>

        {/* 3. Print Requests */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {printTotal} Total Jobs
            </span>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Printing & Fulfilled
            </span>
            <p className="text-2xl font-black text-slate-900 mt-0.5">
              {printPrinting + printCompleted}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Pending Review:</span>
            <span className="font-bold text-indigo-600">
              {printPendingCollege + printSentToSuperAdmin} requests
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Print Request Pipeline Status */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Print Request Lifecycle Status
              </h3>
              <p className="text-xs text-slate-500">
                Live breakdown of your submitted print batches across all review stages
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Pending College */}
          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-center space-y-1">
            <Clock className="w-4 h-4 text-amber-600 mx-auto" />
            <span className="text-[11px] font-bold text-amber-900 block">College Review</span>
            <p className="text-lg font-black text-amber-700">{printPendingCollege}</p>
          </div>

          {/* College Approved */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/60 text-center space-y-1">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 mx-auto" />
            <span className="text-[11px] font-bold text-indigo-900 block">College Approved</span>
            <p className="text-lg font-black text-indigo-700">{printCollegeApproved}</p>
          </div>

          {/* Sent to Super Admin */}
          <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200/60 text-center space-y-1">
            <Send className="w-4 h-4 text-purple-600 mx-auto" />
            <span className="text-[11px] font-bold text-purple-900 block">Super Admin Queue</span>
            <p className="text-lg font-black text-purple-700">{printSentToSuperAdmin}</p>
          </div>

          {/* Printing */}
          <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/60 text-center space-y-1">
            <Printer className="w-4 h-4 text-blue-600 mx-auto" />
            <span className="text-[11px] font-bold text-blue-900 block">In Printing</span>
            <p className="text-lg font-black text-blue-700">{printPrinting}</p>
          </div>

          {/* Completed */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 text-center space-y-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
            <span className="text-[11px] font-bold text-emerald-900 block">Completed</span>
            <p className="text-lg font-black text-emerald-700">{printCompleted}</p>
          </div>

          {/* Rejected */}
          <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200/60 text-center space-y-1">
            <XCircle className="w-4 h-4 text-rose-600 mx-auto" />
            <span className="text-[11px] font-bold text-rose-900 block">Rejected</span>
            <p className="text-lg font-black text-rose-700">{printRejected}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorStudentProgress;

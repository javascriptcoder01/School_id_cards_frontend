import React from 'react';
import { User, School, Calendar, Check, ShieldCheck } from 'lucide-react';

export const VerifiedStudentCard = ({ verificationData = null }) => {
  if (!verificationData) return null;

  const { student = {}, college = {}, generatedAt = null } = verificationData;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Top Header Strip */}
      <div className="bg-linear-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/5 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Verified Credential
            </span>
          </div>
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-semibold text-slate-200 border border-white/10">
            Active ID Record
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black mt-4 tracking-tight">
          {college.name || 'Educational Institution'}
        </h3>
        <p className="text-xs text-indigo-200 mt-0.5">Official Student Identification Record</p>
      </div>

      {/* Student Details Grid */}
      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl shrink-0">
            <User className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Student Full Name
            </span>
            <h4 className="text-xl font-extrabold text-slate-900">{student.name || 'N/A'}</h4>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
          {/* Student ID */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>Student ID / Roll No</span>
            </div>
            <p className="text-base font-extrabold text-slate-900 font-mono">
              {student.studentId || 'N/A'}
            </p>
          </div>

          {/* College Name */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <School className="w-3.5 h-3.5 text-indigo-600" />
              <span>Affiliated College</span>
            </div>
            <p className="text-base font-bold text-slate-900 truncate">
              {college.name || 'N/A'}
            </p>
          </div>
        </div>

        {/* Issuance Date */}
        {generatedAt && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Card Generation Date:</span>
            </div>
            <span className="font-semibold text-slate-700 font-mono">
              {formatDate(generatedAt)}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Trust Badge */}
      <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
        <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">
          <Check className="w-3 h-3 stroke-[3]" />
        </div>
        <span>Cryptographically verified via secure School ID Cards verification registry</span>
      </div>
    </div>
  );
};

export default VerifiedStudentCard;


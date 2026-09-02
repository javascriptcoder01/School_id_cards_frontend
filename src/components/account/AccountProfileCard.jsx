import React from 'react';
import { User, Mail, Shield, School, CheckCircle2, XCircle } from 'lucide-react';

export const AccountProfileCard = ({ profile }) => {
  if (!profile) {
    return (
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs text-center text-slate-400 text-xs">
        Profile details not available.
      </div>
    );
  }

  const {
    name = 'User',
    email = 'N/A',
    role = 'USER',
    collegeId = null,
    isActive = true,
  } = profile;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
      <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-black text-2xl shadow-inner shrink-0">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-slate-900 truncate">{name}</h2>
          <p className="text-xs text-slate-500 truncate">{email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
          <span className="text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            Full Name
          </span>
          <p className="font-semibold text-slate-800 text-sm">{name || 'Not available'}</p>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
          <span className="text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            Email Address
          </span>
          <p className="font-semibold text-slate-800 text-sm truncate">{email || 'Not available'}</p>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
          <span className="text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            Assigned Role
          </span>
          <p className="font-semibold text-indigo-600 text-sm">{role || 'Not available'}</p>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
          <span className="text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1.5">
            <School className="w-3.5 h-3.5 text-slate-400" />
            Associated Institution
          </span>
          <p className="font-semibold text-slate-800 text-sm">
            {collegeId ? `College #${String(collegeId).slice(-6)}` : 'Platform Wide (Global)'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
        <span className="font-medium text-slate-600">Account Status</span>
        <div className="flex items-center gap-1.5 font-bold">
          {isActive ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-700">Active & Verified</span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-rose-500" />
              <span className="text-rose-700">Inactive</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountProfileCard;


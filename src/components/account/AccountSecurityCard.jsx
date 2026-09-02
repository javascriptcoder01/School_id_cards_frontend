import React from 'react';
import { ShieldCheck, KeyRound, LogOut, Info } from 'lucide-react';

export const AccountSecurityCard = ({ onLogoutClick }) => {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-800">Security & Session Management</h3>
          <p className="text-xs text-slate-500">Active session controls and institutional security policies</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-3">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-indigo-950">Institutional Account Governance</p>
          <p className="text-indigo-800 leading-relaxed">
            Administrative credentials, role assignments, and password updates are governed centrally by your educational institution and platform administrator.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-4 h-4 text-slate-400" />
            <div>
              <p className="font-bold text-slate-800">Authentication Protocol</p>
              <p className="text-slate-500 text-[11px]">JWT Bearer Token with automated session renewal</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-[11px] border border-emerald-200">
            Protected
          </span>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
          <div className="flex items-center gap-2.5">
            <LogOut className="w-4 h-4 text-rose-500" />
            <div>
              <p className="font-bold text-slate-800">Terminate Active Session</p>
              <p className="text-slate-500 text-[11px]">Sign out and clear local cryptographic session tokens</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogoutClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSecurityCard;


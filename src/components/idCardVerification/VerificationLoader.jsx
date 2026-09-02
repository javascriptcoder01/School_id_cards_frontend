import React from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';

export const VerificationLoader = ({
  message = 'Verifying Student ID Card Credential...',
}) => {
  return (
    <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full mx-auto text-center space-y-6">
      <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
        <div className="w-20 h-20 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
          <ShieldCheck className="w-10 h-10 animate-pulse" />
        </div>
        <Loader2 className="w-24 h-24 absolute -inset-2 text-indigo-600/30 animate-spin" />
      </div>

      <div>
        <h3 className="text-lg font-extrabold text-slate-800">
          Digital ID Card Verification
        </h3>
        <p className="text-xs text-slate-500 mt-1.5">{message}</p>
      </div>
    </div>
  );
};

export default VerificationLoader;


import React from 'react';
import { CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import { VERIFICATION_STATUS } from '../../constants/idCardVerification.js';

export const VerificationStatus = ({
  status = VERIFICATION_STATUS.FAILED,
  error = null,
}) => {
  const isVerified = status === VERIFICATION_STATUS.VERIFIED;

  if (isVerified) {
    return (
      <div className="bg-emerald-50 border-2 border-emerald-500/20 rounded-3xl p-6 sm:p-8 text-center space-y-3 shadow-xs">
        <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
        </div>
        <h2 className="text-xl font-extrabold text-emerald-900 tracking-tight">
          ID Card Authenticity Verified
        </h2>
        <p className="text-xs text-emerald-700 max-w-sm mx-auto font-medium">
          This student ID card credential has been verified against the official institution registry.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-rose-50 border-2 border-rose-500/20 rounded-3xl p-6 sm:p-8 text-center space-y-3 shadow-xs">
      <div className="w-14 h-14 bg-rose-500 text-white rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-rose-500/30">
        <ShieldAlert className="w-8 h-8 stroke-[2.5]" />
      </div>
      <h2 className="text-xl font-extrabold text-rose-900 tracking-tight">
        Verification Failed
      </h2>
      <p className="text-xs text-rose-700 max-w-sm mx-auto font-medium">
        {error || 'ID card verification record not found or invalid. The credential may have been revoked, expired, or was never issued.'}
      </p>
    </div>
  );
};

export default VerificationStatus;


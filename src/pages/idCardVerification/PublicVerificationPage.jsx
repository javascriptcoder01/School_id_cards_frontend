import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShieldCheck, GraduationCap } from 'lucide-react';
import {
  verifyRequested,
  clearVerification,
} from '../../features/idCardVerification/idCardVerificationSlice.js';
import {
  selectVerificationData,
  selectVerificationStatus,
  selectVerificationError,
  selectIsLoading,
  selectIsVerified,
} from '../../features/idCardVerification/idCardVerificationSelectors.js';
import { VERIFICATION_STATUS } from '../../constants/idCardVerification.js';
import { ROUTES } from '../../constants/routes.js';
import VerificationLoader from '../../components/idCardVerification/VerificationLoader.jsx';
import VerificationStatus from '../../components/idCardVerification/VerificationStatus.jsx';
import VerifiedStudentCard from '../../components/idCardVerification/VerifiedStudentCard.jsx';

export const PublicVerificationPage = () => {
  const { token } = useParams();
  const dispatch = useDispatch();

  const verificationData = useSelector(selectVerificationData);
  const status = useSelector(selectVerificationStatus);
  const error = useSelector(selectVerificationError);
  const isLoading = useSelector(selectIsLoading);
  const isVerified = useSelector(selectIsVerified);

  useEffect(() => {
    if (token) {
      dispatch(verifyRequested(token));
    } else {
      dispatch(clearVerification());
    }

    return () => {
      dispatch(clearVerification());
    };
  }, [dispatch, token]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-8 relative z-10">
        <Link to={ROUTES.HOME} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="font-black text-lg text-white tracking-tight block">School ID Cards</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest block">Official Verification Portal</span>
          </div>
        </Link>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300 backdrop-blur-md">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>QR Verification Registry</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-2xl mx-auto w-full my-auto py-8 relative z-10">
        {isLoading && <VerificationLoader />}

        {!isLoading && isVerified && (
          <div className="space-y-6">
            <VerificationStatus status={VERIFICATION_STATUS.VERIFIED} />
            <VerifiedStudentCard verificationData={verificationData} />
          </div>
        )}

        {!isLoading && status === VERIFICATION_STATUS.FAILED && (
          <div className="space-y-6">
            <VerificationStatus
              status={VERIFICATION_STATUS.FAILED}
              error={error}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-slate-500 pt-8 border-t border-slate-900 relative z-10">
        <p>&copy; {new Date().getFullYear()} School ID Cards Authentication System. All rights reserved.</p>
        <p className="text-[11px] text-slate-600 mt-1">This verification page is public and does not store or leak credential tokens.</p>
      </footer>
    </div>
  );
};

export default PublicVerificationPage;


import React from 'react';
import { Loader2 } from 'lucide-react';

export const PageLoader = ({ message = 'Loading content...' }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="py-16 flex flex-col items-center justify-center text-center space-y-3"
    >
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {message}
      </p>
    </div>
  );
};

export default PageLoader;


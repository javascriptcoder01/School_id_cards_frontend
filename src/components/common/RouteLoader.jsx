import React from 'react';
import { Loader2 } from 'lucide-react';

export const RouteLoader = ({ message = 'Loading page...' }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="w-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center"
    >
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-xs">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
      <p className="text-sm font-semibold text-slate-700 animate-pulse">
        {message}
      </p>
      <span className="sr-only">Loading content, please wait...</span>
    </div>
  );
};

export default RouteLoader;


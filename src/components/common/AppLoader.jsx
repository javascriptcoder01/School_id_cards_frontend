import React from 'react';
import { Loader2 } from 'lucide-react';

export const AppLoader = ({ message = 'Initializing Application...' }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-100 p-4"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xl">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">School ID Cards</h2>
          <p className="text-xs text-slate-400 mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default AppLoader;


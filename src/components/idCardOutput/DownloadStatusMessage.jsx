import React from 'react';
import { Loader2, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export const DownloadStatusMessage = ({
  status = 'IDLE',
  error = null,
  onDismiss,
}) => {
  if (status === 'IDLE') return null;

  if (status === 'DOWNLOADING') {
    return (
      <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
          <span>Generating binary stream and downloading file to your browser...</span>
        </div>
      </div>
    );
  }

  if (status === 'SUCCESS') {
    return (
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Download started successfully. Check your browser download manager.</span>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-emerald-700 hover:text-emerald-900 p-1"
            aria-label="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  if (status === 'FAILED') {
    return (
      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error || 'An error occurred while downloading the requested file.'}</span>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-rose-700 hover:text-rose-900 p-1"
            aria-label="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  return null;
};

export default DownloadStatusMessage;


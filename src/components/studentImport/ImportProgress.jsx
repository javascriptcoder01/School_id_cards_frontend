import React from 'react';
import { Loader2, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export const ImportProgress = ({ status = 'IDLE', errorMessage = null }) => {
  if (status === 'IDLE') {
    return null;
  }

  if (status === 'UPLOADING') {
    return (
      <div className="bg-white p-6 rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50/50 to-white shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">Uploading and Processing Student Records</h3>
            <p className="text-xs text-slate-500">
              Parsing file, validating student records, and inserting into database...
            </p>
          </div>
        </div>
        <div className="w-full bg-indigo-100 h-2 rounded-full overflow-hidden">
          <div className="bg-indigo-600 h-full w-2/3 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  if (status === 'COMPLETED') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl flex items-center gap-3.5 text-emerald-800">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
        <div>
          <h3 className="text-sm font-bold">Import Batch Finished</h3>
          <p className="text-xs text-emerald-700 mt-0.5">
            The spreadsheet was processed. Check the summary and errors below.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'FAILED') {
    return (
      <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl flex items-center gap-3.5 text-rose-800">
        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
        <div>
          <h3 className="text-sm font-bold">Bulk Import Failed</h3>
          <p className="text-xs text-rose-700 mt-0.5">
            {errorMessage || 'An error occurred while parsing the file. Please check file structure and try again.'}
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default ImportProgress;


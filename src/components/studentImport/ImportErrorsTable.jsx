import React from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';

export const ImportErrorsTable = ({ errors = [] }) => {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl border border-rose-200 shadow-xs overflow-hidden">
      <div className="p-6 bg-rose-50/50 border-b border-rose-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-rose-900">
            Import Errors ({errors.length})
          </h3>
          <p className="text-xs text-rose-700">
            The following records could not be imported. Correct the spreadsheet rows and re-upload.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" aria-label="Import Errors List">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 sm:px-6 w-24">Row #</th>
              <th className="py-3 px-4 w-44">Field</th>
              <th className="py-3 px-4 sm:px-6">Error Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {errors.map((err, index) => {
              // Normalize error structure
              const row = err.row ?? err.index ?? err.line ?? (index + 1);
              const field = err.field ?? err.key ?? err.property ?? 'Record';
              const message = err.message ?? (typeof err === 'string' ? err : 'Validation failed');

              return (
                <tr key={index} className="hover:bg-rose-50/30 transition-colors">
                  <td className="py-3 px-4 sm:px-6 font-mono font-bold text-slate-700">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                      Row {row}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 font-mono">
                    {String(field)}
                  </td>
                  <td className="py-3 px-4 sm:px-6 text-rose-700 font-medium">
                    {String(message)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ImportErrorsTable;


import React from 'react';
import { Archive, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { GENERATION_STATUS } from '../../constants/idCardGeneration.js';
import DownloadButton from './DownloadButton.jsx';

export const GenerationDownloadPanel = ({ generation = null }) => {
  if (!generation) return null;

  const isCompleted = generation.status === GENERATION_STATUS.COMPLETED;
  const isPending = generation.status === GENERATION_STATUS.PENDING;
  const isProcessing = generation.status === GENERATION_STATUS.PROCESSING;
  const isFailed = generation.status === GENERATION_STATUS.FAILED;

  const studentCount =
    generation.studentCount ??
    (Array.isArray(generation.studentIds) ? generation.studentIds.length : (generation.studentId ? 1 : 0));

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Complete ID Cards ZIP Package</h3>
            <p className="text-xs text-slate-500">
              Download all high-resolution printable ID cards for this job in a single compressed ZIP archive
            </p>
          </div>
        </div>

        <div>
          <DownloadButton
            type="ZIP"
            generationId={generation.id}
            disabled={!isCompleted}
          />
        </div>
      </div>

      {/* State Notices */}
      {isPending && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-800 text-xs font-semibold">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>This generation job is pending. Process the job before downloading the ZIP package.</span>
        </div>
      )}

      {isProcessing && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center gap-3 text-blue-800 text-xs font-semibold">
          <Clock className="w-4 h-4 text-blue-600 shrink-0 animate-spin" />
          <span>ID cards are currently generating. The ZIP package will be available once rendering finishes.</span>
        </div>
      )}

      {isCompleted && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-800 text-xs font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Ready for export: {studentCount} card(s) formatted in high-DPI printable PNG</span>
          </div>
        </div>
      )}

      {isFailed && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>Generation encountered errors. Check individual student outputs below.</span>
        </div>
      )}
    </div>
  );
};

export default GenerationDownloadPanel;


// ImportResultStep.jsx — Step 3: photo upload progress bar (polling) → result (created / skipped / failed),
// "View students", failed rows ki report, "Import another file".
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Download, Images, Loader2, RotateCcw, Users, UserX, SkipForward } from 'lucide-react';

const Stat = ({ icon: Icon, label, value, tone }) => (
  <div className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 ring-1 ${tone}`}>
    <Icon className="h-5 w-5 shrink-0" />
    <div>
      <p className="text-xl font-extrabold leading-none tabular-nums">{value}</p>
      <p className="text-[11px] font-semibold opacity-80">{label}</p>
    </div>
  </div>
);

/**
 * @param {object} props
 * @param {'IMPORTING'|'DONE'} props.step
 * @param {object} props.result - { created, skipped, failed[] }
 * @param {object|null} props.photoProgress - { status, total, processed, uploaded, failed, failures[] }
 * @param {string} props.studentsPath
 * @param {string|null} props.downloading
 * @param {() => void} props.onDownloadFailed
 * @param {() => void} props.onImportAnother
 */
export const ImportResultStep = ({ step, result, photoProgress, studentsPath, downloading, onDownloadFailed, onImportAnother }) => {
  const running = step === 'IMPORTING' && photoProgress?.status === 'RUNNING';
  const stalled = photoProgress?.status === 'STALLED';
  const pct = photoProgress?.total ? Math.round((photoProgress.processed / photoProgress.total) * 100) : 0;
  const failedRows = result?.failed || [];
  const photoFailures = photoProgress?.failures || [];
  const hasReport = failedRows.length > 0 || (result?.skipped || 0) > 0 || photoFailures.length > 0;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-emerald-200/80 bg-white shadow-sm">
        <div className="h-1 bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500" />
        <div className="space-y-4 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30">
              {running ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-slate-800">{running ? '3. Uploading photos…' : '3. Import finished'}</h2>
              <p className="text-xs text-slate-500">
                {running ? 'Students are already created. You can leave this page; photos keep uploading.' : 'Students without a photo can get one from their profile page.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Stat icon={Users} label="Created" value={result?.created || 0} tone="bg-emerald-50 text-emerald-800 ring-emerald-200" />
            <Stat icon={SkipForward} label="Skipped (errors)" value={result?.skipped || 0} tone="bg-amber-50 text-amber-800 ring-amber-200" />
            <Stat icon={UserX} label="Failed" value={failedRows.length} tone="bg-rose-50 text-rose-800 ring-rose-200" />
          </div>

          {photoProgress && (
            <div className="space-y-1.5 rounded-xl bg-slate-50 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 font-bold text-slate-700"><Images className="h-3.5 w-3.5 text-indigo-600" /> Photos</span>
                <span className="tabular-nums text-slate-600">
                  {photoProgress.processed}/{photoProgress.total} · {photoProgress.uploaded} uploaded{photoProgress.failed ? ` · ${photoProgress.failed} failed` : ''}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Photo upload progress">
                <div className="h-full rounded-full bg-linear-to-r from-indigo-500 via-violet-500 to-fuchsia-500 transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              {stalled && (
                <p className="flex items-center gap-1.5 text-xs text-amber-800"><AlertTriangle className="h-3.5 w-3.5" /> Photo upload stopped (server restarted). Add the missing photos from each student page.</p>
              )}
            </div>
          )}

          {(failedRows.length > 0 || photoFailures.length > 0) && (
            <ul className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-rose-100 bg-rose-50/40 p-3 text-xs">
              {[...failedRows, ...photoFailures].map((f, i) => (
                <li key={`${f.rowNo}-${i}`} className="text-rose-800">
                  <span className="font-mono">Row {f.rowNo}</span>{f.studentId ? ` · ${f.studentId}` : ''} — {f.reason}
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            {hasReport && (
              <button
                type="button"
                onClick={onDownloadFailed}
                disabled={downloading === 'errors' || running}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
              >
                {downloading === 'errors' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                Download failed rows
              </button>
            )}
            <button type="button" onClick={onImportAnother} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
              <RotateCcw className="h-3.5 w-3.5" /> Import another file
            </button>
            <Link to={studentsPath} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/25">
              <Users className="h-3.5 w-3.5" /> View students
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportResultStep;

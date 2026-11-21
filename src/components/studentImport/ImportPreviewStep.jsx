// ImportPreviewStep.jsx — Step 2: summary chips, filters (All / Errors / Missing photo), rows (desktop table,
// mobile cards) — errors laal, warnings amber, photo thumbnail ya status chip. "Import N students" (galat rows skip).
import React, { useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, Download, ImageOff, Images, Link2, Loader2, Package, Sheet, UserCheck, UserX, Copy, CheckCircle2 } from 'lucide-react';

const PAGE = 50;

const PHOTO_CHIP = {
  FOUND: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  MISSING: 'bg-slate-100 text-slate-500 ring-slate-200',
  INVALID: 'bg-rose-50 text-rose-700 ring-rose-200',
  TOO_LARGE: 'bg-amber-50 text-amber-800 ring-amber-200',
};
const PHOTO_LABEL = { FOUND: 'Photo found', MISSING: 'No photo', INVALID: 'Bad photo', TOO_LARGE: 'Photo too large' };
const SOURCE_LABEL = { EMBEDDED: 'in Excel', ZIP: 'from ZIP', FILE: 'from files', URL: 'from link', FILE_NAME: 'file not found' };
const SOURCE_ICON = { EMBEDDED: Sheet, ZIP: Package, FILE: Images, URL: Link2 };

// Seedhi image link ka chhota thumbnail (Drive / file ka nahi — wo server par hain)
const isDirectImageLink = (photo) =>
  photo?.source === 'URL' && photo.status === 'FOUND' && /^https:\/\//i.test(photo.value || '') && !/drive\.google|docs\.google/i.test(photo.value || '');

const PhotoCell = ({ photo }) => {
  const [broken, setBroken] = useState(false);
  const status = photo?.status || 'MISSING';
  const Icon = SOURCE_ICON[photo?.source] || (status === 'FOUND' ? CheckCircle2 : ImageOff);
  return (
    <div className="flex items-center gap-2">
      {isDirectImageLink(photo) && !broken ? (
        <img src={photo.value} alt="" referrerPolicy="no-referrer" loading="lazy" onError={() => setBroken(true)} className="h-9 w-8 shrink-0 rounded-md object-cover ring-1 ring-slate-200" />
      ) : null}
      <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${PHOTO_CHIP[status] || PHOTO_CHIP.MISSING}`}>
        <Icon className="h-3 w-3" />
        {PHOTO_LABEL[status] || status}
        {photo?.source && SOURCE_LABEL[photo.source] && status === 'FOUND' ? <span className="font-normal">· {SOURCE_LABEL[photo.source]}</span> : null}
      </span>
    </div>
  );
};

const Messages = ({ errors = [], warnings = [] }) =>
  errors.length || warnings.length ? (
    <ul className="space-y-0.5 text-xs">
      {errors.map((m, i) => (
        <li key={`e${i}`} className="text-rose-700">• {m}</li>
      ))}
      {warnings.map((m, i) => (
        <li key={`w${i}`} className="text-amber-700">• {m}</li>
      ))}
    </ul>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Ready</span>
  );

const classOf = (data) => [data?.className, data?.section].filter(Boolean).join(' - ') || '—';

const Chip = ({ icon: Icon, label, value, tone }) => (
  <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ring-1 ${tone}`}>
    <Icon className="h-4 w-4 shrink-0" />
    <div className="min-w-0">
      <p className="text-lg font-extrabold leading-none tabular-nums">{value}</p>
      <p className="truncate text-[11px] font-semibold opacity-80">{label}</p>
    </div>
  </div>
);

/**
 * @param {object} props
 * @param {object} props.preview - { importId, fileName, totals, rows, unknownHeaders, photoFiles }
 * @param {boolean} props.confirming
 * @param {string|null} props.downloading
 * @param {() => void} props.onBack
 * @param {() => void} props.onDownloadErrors
 * @param {() => void} props.onConfirm
 */
export const ImportPreviewStep = ({ preview, confirming, downloading, onBack, onDownloadErrors, onConfirm }) => {
  const [filter, setFilter] = useState('ALL');
  const [limit, setLimit] = useState(PAGE);
  const totals = preview?.totals || {};
  const rows = useMemo(() => preview?.rows || [], [preview]);

  const filtered = useMemo(() => {
    if (filter === 'ERRORS') return rows.filter((r) => r.errors.length > 0);
    if (filter === 'NO_PHOTO') return rows.filter((r) => r.photo?.status !== 'FOUND');
    return rows;
  }, [rows, filter]);
  const shown = filtered.slice(0, limit);

  const filters = [
    { key: 'ALL', label: 'All', count: rows.length },
    { key: 'ERRORS', label: 'Errors', count: totals.invalid || 0 },
    { key: 'NO_PHOTO', label: 'Missing photo', count: rows.filter((r) => r.photo?.status !== 'FOUND').length },
  ];

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-indigo-100/80 bg-white shadow-sm">
        <div className="h-1 bg-linear-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
        <div className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-sm font-extrabold text-slate-800">2. Check the preview</h2>
              <p className="truncate text-xs text-slate-500">
                {preview?.fileName || 'Your file'} · nothing is saved until you import
                {preview?.photoFiles ? ` · ${preview.photoFiles.count} photo file(s) uploaded` : ''}
              </p>
            </div>
            <button type="button" onClick={onBack} disabled={confirming} className="inline-flex items-center gap-1.5 self-start rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
              <ArrowLeft className="h-3.5 w-3.5" /> Choose another file
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <Chip icon={UserCheck} label="Valid" value={totals.valid || 0} tone="bg-emerald-50 text-emerald-800 ring-emerald-200" />
            <Chip icon={UserX} label="Invalid" value={totals.invalid || 0} tone="bg-rose-50 text-rose-800 ring-rose-200" />
            <Chip icon={Copy} label="Duplicates" value={totals.duplicates || 0} tone="bg-amber-50 text-amber-800 ring-amber-200" />
            <Chip icon={Images} label="Photos found" value={totals.photosFound || 0} tone="bg-indigo-50 text-indigo-800 ring-indigo-200" />
            <Chip icon={ImageOff} label="Photos missing" value={totals.photosMissing || 0} tone="bg-slate-50 text-slate-700 ring-slate-200" />
          </div>

          {preview?.unknownHeaders?.length > 0 && (
            <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
              <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" /> These columns were ignored: {preview.unknownHeaders.join(', ')}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Filter rows">
              {filters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  role="tab"
                  aria-selected={filter === f.key}
                  onClick={() => {
                    setFilter(f.key);
                    setLimit(PAGE);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold ${filter === f.key ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {f.label} <span className="tabular-nums opacity-70">{f.count}</span>
                </button>
              ))}
            </div>
            {totals.invalid > 0 && (
              <button
                type="button"
                onClick={onDownloadErrors}
                disabled={downloading === 'errors'}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
              >
                {downloading === 'errors' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                Download error report
              </button>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border border-slate-200 md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-3 py-2">Row</th>
                  <th className="px-3 py-2">Student</th>
                  <th className="px-3 py-2">Class</th>
                  <th className="px-3 py-2">Photo</th>
                  <th className="px-3 py-2">Check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shown.map((r) => (
                  <tr key={r.rowNo} className={r.errors.length ? 'bg-rose-50/40' : ''}>
                    <td className="px-3 py-2 align-top font-mono text-xs text-slate-500">{r.rowNo}</td>
                    <td className="px-3 py-2 align-top">
                      <p className="font-semibold text-slate-800">{r.data?.name || '—'}</p>
                      <p className="font-mono text-[11px] text-slate-500">{r.data?.studentId || '—'}</p>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 align-top text-slate-700">{classOf(r.data)}</td>
                    <td className="px-3 py-2 align-top"><PhotoCell photo={r.photo} /></td>
                    <td className="px-3 py-2 align-top"><Messages errors={r.errors} warnings={r.warnings} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-2 md:hidden">
            {shown.map((r) => (
              <li key={r.rowNo} className={`space-y-1.5 rounded-xl border p-3 ${r.errors.length ? 'border-rose-200 bg-rose-50/40' : 'border-slate-200 bg-white'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{r.data?.name || '—'}</p>
                    <p className="truncate text-[11px] text-slate-500">
                      <span className="font-mono">{r.data?.studentId || '—'}</span> · Class {classOf(r.data)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">Row {r.rowNo}</span>
                </div>
                <PhotoCell photo={r.photo} />
                <Messages errors={r.errors} warnings={r.warnings} />
              </li>
            ))}
          </ul>

          {filtered.length === 0 && <p className="py-6 text-center text-sm text-slate-500">No rows in this filter.</p>}
          {filtered.length > shown.length && (
            <div className="text-center">
              <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="rounded-xl border border-slate-200 px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
                Show more ({filtered.length - shown.length} left)
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-2 z-20 flex flex-col gap-2 rounded-2xl border border-indigo-200 bg-white/95 p-3 shadow-[0_-8px_24px_-12px_rgba(79,70,229,0.45)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-600">
          {totals.invalid > 0 ? <><strong className="text-rose-700">{totals.invalid}</strong> row(s) with errors will be skipped. </> : null}
          Photos upload in the background after import.
        </p>
        <button
          type="button"
          onClick={onConfirm}
          disabled={confirming || !(totals.valid > 0)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-500/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
          Import {totals.valid || 0} student{totals.valid === 1 ? '' : 's'}
        </button>
      </div>
    </div>
  );
};

export default ImportPreviewStep;

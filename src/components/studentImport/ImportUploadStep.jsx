// ImportUploadStep.jsx — Step 1: template download, Excel drop zone + optional photos (ZIP ya images),
// class / section (School Admin: khaali Class wali rows ke liye; Class Teacher: apni class, fixed).
import React, { useRef, useState } from 'react';
import { Download, FileSpreadsheet, GraduationCap, Images, Loader2, Upload, X, Info } from 'lucide-react';

const SHEET_ACCEPT = '.xlsx,.xls,.csv';
const PHOTOS_ACCEPT = '.zip,.jpg,.jpeg,.png,.webp,.heic,.heif';
const SHEET_MAX = 10 * 1024 * 1024;
const PHOTOS_MAX = 200 * 1024 * 1024;
const PHOTOS_MAX_FILES = 2000;

const extOf = (name) => (String(name).toLowerCase().match(/\.[a-z0-9]+$/) || [''])[0];
const mb = (bytes) => `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:opacity-60';

const DropZone = ({ id, icon: Icon, title, hint, accept, multiple, files, onFiles, onClear, disabled }) => {
  const inputRef = useRef(null);
  const [over, setOver] = useState(false);
  const has = files.length > 0;
  const label = has ? (files.length === 1 ? files[0].name : `${files.length} files`) : null;
  const size = files.reduce((sum, f) => sum + f.size, 0);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (!disabled) onFiles([...e.dataTransfer.files]);
      }}
      className={`relative rounded-2xl border-2 border-dashed p-4 transition-colors ${over ? 'border-indigo-400 bg-indigo-50/60' : has ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-200 bg-white hover:border-indigo-300'
        }`}
    >
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          onFiles([...(e.target.files || [])]);
          e.target.value = '';
        }}
      />
      <div className="flex items-center gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${has ? 'bg-linear-to-br from-emerald-500 to-teal-500 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-800">{label || title}</p>
          <p className="truncate text-xs text-slate-500">{has ? mb(size) : hint}</p>
        </div>
        {has ? (
          <button type="button" onClick={onClear} disabled={disabled} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label={`Remove ${title}`}>
            <X className="h-4 w-4" />
          </button>
        ) : (
          <label htmlFor={id} className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
            Choose
          </label>
        )}
      </div>
    </div>
  );
};

/**
 * @param {object} props
 * @param {boolean} props.isOperator
 * @param {string|null} props.operatorClass - "10th - A" (Class Teacher)
 * @param {boolean} props.loading
 * @param {string|null} props.downloading
 * @param {() => void} props.onTemplate
 * @param {(input: { file: File, photos: File[], className: string, section: string }) => void} props.onPreview
 */
export const ImportUploadStep = ({ isOperator, operatorClass, loading, downloading, onTemplate, onPreview }) => {
  const [sheet, setSheet] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [fileError, setFileError] = useState(null);

  const pickSheet = (files) => {
    setFileError(null);
    const file = files[0];
    if (!file) return;
    if (!['.xlsx', '.xls', '.csv'].includes(extOf(file.name))) return setFileError('Choose an .xlsx, .xls or .csv file.');
    if (file.size > SHEET_MAX) return setFileError('The Excel file cannot be larger than 10 MB.');
    setSheet([file]);
    return null;
  };

  const pickPhotos = (files) => {
    setFileError(null);
    if (files.length === 0) return null;
    const zips = files.filter((f) => extOf(f.name) === '.zip');
    if (zips.length > 1 || (zips.length === 1 && files.length > 1)) return setFileError('Choose one ZIP, or image files — not both.');
    const bad = files.find((f) => !PHOTOS_ACCEPT.split(',').includes(extOf(f.name)));
    if (bad) return setFileError(`"${bad.name}" is not a ZIP or image file.`);
    if (files.length > PHOTOS_MAX_FILES) return setFileError(`At most ${PHOTOS_MAX_FILES} photos.`);
    if (files.reduce((s, f) => s + f.size, 0) > PHOTOS_MAX) return setFileError('Photos cannot be larger than 200 MB in total.');
    setPhotos(files);
    return null;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!sheet[0] || loading) return;
    onPreview({ file: sheet[0], photos, className: isOperator ? '' : className.trim(), section: isOperator ? '' : section.trim() });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-indigo-100/80 bg-white shadow-sm">
        <div className="h-1 bg-linear-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
        <div className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800">1. Upload Student Data File</h2>
            </div>
            <button
              type="button"
              onClick={onTemplate}
              disabled={downloading === 'template'}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 disabled:opacity-60"
            >
              {downloading === 'template' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              Download template
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <DropZone
              id="import-sheet"
              icon={FileSpreadsheet}
              title="Excel / CSV file *"
              hint=".xlsx, .xls or .csv · up to 2,000 students · 10 MB"
              accept={SHEET_ACCEPT}
              files={sheet}
              onFiles={pickSheet}
              onClear={() => setSheet([])}
              disabled={loading}
            />
            <DropZone
              id="import-photos"
              icon={Images}
              title="Photos (optional)"
              hint="One ZIP or image files · up to 200 MB"
              accept={PHOTOS_ACCEPT}
              multiple
              files={photos}
              onFiles={pickPhotos}
              onClear={() => setPhotos([])}
              disabled={loading}
            />
          </div>

          <p className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <Info className="mt-px h-3.5 w-3.5 shrink-0 text-indigo-500" />
            <span>
              Photos: put them in the Photo column (inside Excel), or write file names and upload a ZIP, or paste image links. If the Photo cell is
              empty, a photo named after the Student ID (e.g. STU-1001.jpg) is used.
            </span>
          </p>

          {isOperator ? (
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 font-bold text-indigo-700">
                <GraduationCap className="h-3.5 w-3.5" /> Class {operatorClass || '—'}
              </span>
              <span>Only students of your class are imported.</span>
            </div>
          ) : (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
                Class for rows without a class <span className="font-normal normal-case text-slate-400">(optional)</span>
              </p>
              <div className="grid grid-cols-2 gap-2 sm:max-w-md">
                <input className={inputClass} value={className} maxLength={100} onChange={(e) => setClassName(e.target.value)} placeholder="Class, e.g. 10th" aria-label="Default class" disabled={loading} />
                <input className={inputClass} value={section} maxLength={50} onChange={(e) => setSection(e.target.value)} placeholder="Section, e.g. A" aria-label="Default section" disabled={loading} />
              </div>
            </div>
          )}

          {fileError && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">{fileError}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!sheet[0] || loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {loading ? (photos.length ? 'Uploading & checking photos…' : 'Checking file…') : 'Check file'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ImportUploadStep;

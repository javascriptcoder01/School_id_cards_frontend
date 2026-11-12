// ArtworkUploadForm.jsx — Super Admin: SVG upload (server sanitise karta hai; unsafe file reject)
import React, { useRef, useState } from 'react';
import { FileUp, Loader2, ShieldCheck, X } from 'lucide-react';

const ORIENTATIONS = [
  { key: 'ANY', label: 'Any' },
  { key: 'PORTRAIT', label: 'Portrait' },
  { key: 'LANDSCAPE', label: 'Landscape' },
];
const MAX_BYTES = 300 * 1024;
const labelClass = 'block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1';
const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500';

/**
 * @param {object} props
 * @param {boolean} props.saving
 * @param {string|null} props.error - server ka message (jaise "contains unsafe content: <script>")
 * @param {(data: { file: File, name: string, category: string, orientation: string }) => void} props.onSubmit
 * @param {() => void} props.onClearError
 */
export const ArtworkUploadForm = ({ saving, error, onSubmit, onClearError }) => {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [orientation, setOrientation] = useState('ANY');
  const [localError, setLocalError] = useState(null);

  const pickFile = (picked) => {
    onClearError();
    setLocalError(null);
    if (!picked) return setFile(null);
    if (!/\.svg$/i.test(picked.name) && picked.type !== 'image/svg+xml') {
      setLocalError('Choose an .svg file');
      return setFile(null);
    }
    if (picked.size > MAX_BYTES) {
      setLocalError('SVG file is larger than 300 KB');
      return setFile(null);
    }
    setFile(picked);
    if (!name.trim()) setName(picked.name.replace(/\.svg$/i, '').replace(/[-_]+/g, ' ').slice(0, 80));
  };

  const reset = () => {
    setFile(null);
    setName('');
    setCategory('');
    setOrientation('ANY');
    if (fileRef.current) fileRef.current.value = '';
  };

  const submit = (event) => {
    event.preventDefault();
    if (!file) return setLocalError('Choose an SVG file');
    if (name.trim().length < 2) return setLocalError('Name must be at least 2 characters long');
    onSubmit({ file, name: name.trim(), category: category.trim(), orientation, onDone: reset });
    return null;
  };

  const shownError = localError || error;

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-indigo-100/80 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex items-start gap-2">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        <p className="text-[11px] text-slate-600">
          Mark colours with <code className="rounded bg-slate-100 px-1">fill=&quot;{'{{primary}}'}&quot;</code>,{' '}
          <code className="rounded bg-slate-100 px-1">data-slot=&quot;wave&quot;</code> or{' '}
          <code className="rounded bg-slate-100 px-1">var(--slot-accent)</code>. Files with scripts, event handlers or external links are rejected.
        </p>
      </div>

      <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 px-3 py-4 text-center hover:border-indigo-400">
        <FileUp className="h-5 w-5 text-indigo-600" />
        <span className="text-xs font-bold text-slate-700">{file ? file.name : 'Choose an SVG file'}</span>
        <span className="text-[10px] text-slate-500">{file ? `${Math.round(file.size / 1024)} KB` : 'Up to 300 KB'}</span>
        <input ref={fileRef} type="file" accept=".svg,image/svg+xml" className="sr-only" onChange={(e) => pickFile(e.target.files?.[0] || null)} />
      </label>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label className={labelClass} htmlFor="artwork-name">Name</label>
          <input id="artwork-name" className={inputClass} value={name} maxLength={80} onChange={(e) => setName(e.target.value)} placeholder="e.g. Lotus Wave" />
        </div>
        <div>
          <label className={labelClass} htmlFor="artwork-category">Category</label>
          <input id="artwork-category" className={inputClass} value={category} maxLength={40} onChange={(e) => setCategory(e.target.value)} placeholder="General" />
        </div>
        <div>
          <span className={labelClass}>Orientation</span>
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {ORIENTATIONS.map((o) => (
              <button
                key={o.key}
                type="button"
                onClick={() => setOrientation(o.key)}
                aria-pressed={orientation === o.key}
                className={`flex-1 rounded-lg py-1.5 text-[11px] font-semibold ${orientation === o.key ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {shownError && (
        <p className="flex items-start gap-1.5 rounded-xl bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-700" role="alert">
          <X className="mt-0.5 h-3 w-3 shrink-0" /> {shownError}
        </p>
      )}

      <button
        type="submit"
        disabled={saving || !file}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-extrabold text-white shadow-md shadow-indigo-500/30 disabled:opacity-50 sm:w-auto"
      >
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileUp className="h-3.5 w-3.5" />}
        {saving ? 'Checking & uploading…' : 'Upload artwork'}
      </button>
    </form>
  );
};

export default ArtworkUploadForm;

// CustomUploadEditor.jsx — apna letterhead (PDF / PNG / JPG): page 1 + optional page 2+ background,
// safe zone (likhne ki jagah) mm mein — lines drag karke ya number se. DPI warning + "page 2 of my PDF".
import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Upload, FileUp, Loader2, AlertTriangle, Trash2, Layers, Ruler } from 'lucide-react';
import { Section, Field, NumberInput } from './LetterheadFields.jsx';
import { uploadCustomRequested } from '../../features/letterheads/letterheadSlice.js';
import { selectLetterheadUpload } from '../../features/letterheads/letterheadSelectors.js';
import { A4_MM, DEFAULT_MARGINS, MARGIN_LIMITS, LETTERHEAD_UPLOAD_ACCEPT, LETTERHEAD_UPLOAD_MAX_BYTES, marginsError } from '../../constants/letterhead.js';

const clampMm = (v) => Math.round(Math.min(MARGIN_LIMITS.maxEach, Math.max(0, v)) * 2) / 2;
const SIDES = [
  { key: 'topMm', label: 'Top' },
  { key: 'bottomMm', label: 'Bottom' },
  { key: 'leftMm', label: 'Left' },
  { key: 'rightMm', label: 'Right' },
];

const toPage = (uploaded, margins) => ({
  pdfUrl: uploaded.pdfUrl,
  pdfPublicId: uploaded.pdfPublicId,
  previewUrl: uploaded.previewUrl || null,
  sourceType: uploaded.sourceType,
  margins: { ...(margins || DEFAULT_MARGINS) },
});

/** Preview image + draggable safe-zone lines */
const SafeZoneCanvas = ({ previewUrl, margins, onChange }) => {
  const boxRef = useRef(null);
  const dragging = useRef(null);

  const onPointerDown = (side) => (e) => {
    e.preventDefault();
    dragging.current = side;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    const side = dragging.current;
    if (!side || !boxRef.current) return;
    const r = boxRef.current.getBoundingClientRect();
    const xMm = ((e.clientX - r.left) / r.width) * A4_MM.width;
    const yMm = ((e.clientY - r.top) / r.height) * A4_MM.height;
    const next = {
      topMm: () => clampMm(yMm),
      bottomMm: () => clampMm(A4_MM.height - yMm),
      leftMm: () => clampMm(xMm),
      rightMm: () => clampMm(A4_MM.width - xMm),
    }[side]();
    onChange({ ...margins, [side]: next });
  };
  const stop = () => {
    dragging.current = null;
  };

  const pct = (mm, total) => `${(mm / total) * 100}%`;
  const line = 'absolute touch-none bg-transparent';
  const handle = 'absolute rounded-full bg-indigo-600 shadow ring-2 ring-white';

  return (
    <div
      ref={boxRef}
      className="relative mx-auto aspect-[210/297] w-full max-w-sm select-none overflow-hidden rounded-xl border border-slate-200 bg-white shadow-inner"
      onPointerMove={onPointerMove}
      onPointerUp={stop}
      onPointerCancel={stop}
    >
      {previewUrl ? <img src={previewUrl} alt="Letterhead page" className="pointer-events-none h-full w-full object-fill" draggable={false} /> : null}
      {/* Safe zone */}
      <div
        className="pointer-events-none absolute border-2 border-dashed border-indigo-500 bg-indigo-500/10"
        style={{ top: pct(margins.topMm, A4_MM.height), bottom: pct(margins.bottomMm, A4_MM.height), left: pct(margins.leftMm, A4_MM.width), right: pct(margins.rightMm, A4_MM.width) }}
      >
        <span className="absolute left-1 top-1 rounded bg-indigo-600 px-1.5 py-0.5 text-[9px] font-bold text-white">Text area</span>
      </div>
      {/* Drag lines (bade touch target) */}
      <div className={`${line} inset-x-0 h-5 -translate-y-1/2 cursor-ns-resize`} style={{ top: pct(margins.topMm, A4_MM.height) }} onPointerDown={onPointerDown('topMm')} aria-label="Drag top margin">
        <span className={`${handle} left-1/2 top-1/2 h-2.5 w-8 -translate-x-1/2 -translate-y-1/2`} />
      </div>
      <div className={`${line} inset-x-0 h-5 translate-y-1/2 cursor-ns-resize`} style={{ bottom: pct(margins.bottomMm, A4_MM.height) }} onPointerDown={onPointerDown('bottomMm')} aria-label="Drag bottom margin">
        <span className={`${handle} left-1/2 top-1/2 h-2.5 w-8 -translate-x-1/2 -translate-y-1/2`} />
      </div>
      <div className={`${line} inset-y-0 w-5 -translate-x-1/2 cursor-ew-resize`} style={{ left: pct(margins.leftMm, A4_MM.width) }} onPointerDown={onPointerDown('leftMm')} aria-label="Drag left margin">
        <span className={`${handle} left-1/2 top-1/2 h-8 w-2.5 -translate-x-1/2 -translate-y-1/2`} />
      </div>
      <div className={`${line} inset-y-0 w-5 translate-x-1/2 cursor-ew-resize`} style={{ right: pct(margins.rightMm, A4_MM.width) }} onPointerDown={onPointerDown('rightMm')} aria-label="Drag right margin">
        <span className={`${handle} left-1/2 top-1/2 h-8 w-2.5 -translate-x-1/2 -translate-y-1/2`} />
      </div>
    </div>
  );
};

const PageEditor = ({ title, pageKey, page, onPage, onRemove, collegeId, onUploaded, extra }) => {
  const dispatch = useDispatch();
  const upload = useSelector(selectLetterheadUpload);
  const inputRef = useRef(null);
  const [localError, setLocalError] = useState(null);
  const busy = upload.loadingPage === pageKey;

  const pick = (file) => {
    if (!file) return;
    setLocalError(null);
    if (!/\.(pdf|png|jpe?g)$/i.test(file.name)) return setLocalError('Use a PDF, PNG or JPG file.');
    if (file.size > LETTERHEAD_UPLOAD_MAX_BYTES) return setLocalError('The file is larger than 15 MB.');
    dispatch(uploadCustomRequested({ file, page: pageKey, collegeId, onSuccess: onUploaded }));
  };

  const margins = page?.margins || DEFAULT_MARGINS;
  const error = page ? marginsError(margins) : null;

  return (
    <Section
      title={title}
      icon={pageKey === 'FIRST' ? FileUp : Layers}
      actions={
        page && onRemove ? (
          <button type="button" onClick={onRemove} className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-100">
            <Trash2 className="h-3 w-3" /> Remove
          </button>
        ) : null
      }
    >
      <input ref={inputRef} type="file" accept={LETTERHEAD_UPLOAD_ACCEPT} className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
      {!page ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files?.[0]); }}
          disabled={busy}
          className="flex w-full flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 px-4 py-8 text-center hover:border-indigo-400 disabled:opacity-70"
        >
          {busy ? <Loader2 className="h-6 w-6 animate-spin text-indigo-500" /> : <Upload className="h-6 w-6 text-indigo-500" />}
          <span className="text-sm font-bold text-slate-800">{busy ? 'Uploading & converting to A4…' : 'Upload PDF, PNG or JPG'}</span>
          <span className="text-[11px] text-slate-500">A4 portrait · up to 15 MB · best at 300 DPI (2480 × 3508 px)</span>
        </button>
      ) : (
        <>
          <SafeZoneCanvas previewUrl={page.previewUrl} margins={margins} onChange={(m) => onPage({ ...page, margins: m })} />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SIDES.map((s) => (
              <Field key={s.key} label={s.label} htmlFor={`lh-${pageKey}-${s.key}`}>
                <NumberInput id={`lh-${pageKey}-${s.key}`} value={margins[s.key]} onChange={(v) => onPage({ ...page, margins: { ...margins, [s.key]: v } })} min={0} max={MARGIN_LIMITS.maxEach} step={0.5} suffix="mm" />
              </Field>
            ))}
          </div>
          {error ? (
            <p className="text-[11px] font-semibold text-rose-600">{error}</p>
          ) : (
            <p className="flex items-center gap-1 text-[11px] text-slate-500">
              <Ruler className="h-3 w-3" /> Drag the blue lines so the text area avoids your header and footer.
            </p>
          )}
          <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 disabled:opacity-60">
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Replace file
          </button>
        </>
      )}
      {localError && <p className="text-[11px] font-semibold text-rose-600">{localError}</p>}
      {extra}
    </Section>
  );
};

export const CustomUploadEditor = ({ value, onChange, collegeId }) => {
  const upload = useSelector(selectLetterheadUpload);
  const [warnings, setWarnings] = useState([]);
  const [suggestion, setSuggestion] = useState(null);
  const config = value || { firstPage: null, continuationPage: null, dpiWarning: false };
  const set = (patch) => onChange({ ...config, ...patch });

  const onFirstUploaded = (result) => {
    setWarnings(result?.warnings || []);
    setSuggestion(result?.suggestedContinuation || null);
    set({ firstPage: toPage(result, config.firstPage?.margins), dpiWarning: Boolean(result?.dpiWarning) });
  };
  const onContinuationUploaded = (result) => {
    setWarnings(result?.warnings || []);
    set({ continuationPage: toPage(result, config.continuationPage?.margins || config.firstPage?.margins) });
  };

  return (
    <div className="space-y-3">
      {upload.error && !upload.loadingPage && (
        <p className="flex items-start gap-1.5 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {upload.error}
        </p>
      )}
      {config.dpiWarning && (
        <p className="flex items-start gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> The image is low resolution — the print may look blurry. 300 DPI (2480 × 3508 px) is recommended.
        </p>
      )}
      {warnings.length > 0 && (
        <ul className="space-y-1 rounded-xl bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
          {warnings.map((w) => (
            <li key={w}>• {w}</li>
          ))}
        </ul>
      )}

      <PageEditor
        title="Page 1 (first page)"
        pageKey="FIRST"
        page={config.firstPage}
        onPage={(p) => set({ firstPage: p })}
        collegeId={collegeId}
        onUploaded={onFirstUploaded}
      />

      <PageEditor
        title="Page 2 onwards (optional)"
        pageKey="CONTINUATION"
        page={config.continuationPage}
        onPage={(p) => set({ continuationPage: p })}
        onRemove={() => set({ continuationPage: null })}
        collegeId={collegeId}
        onUploaded={onContinuationUploaded}
        extra={
          !config.continuationPage ? (
            <div className="space-y-2">
              {suggestion && (
                <button
                  type="button"
                  onClick={() => { set({ continuationPage: toPage(suggestion, config.firstPage?.margins) }); setSuggestion(null); }}
                  className="w-full rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-3 py-2 text-xs font-bold text-white shadow-md"
                >
                  Use page 2 of my PDF
                </button>
              )}
              <p className="text-[11px] text-slate-500">If empty, page 1 is reused for every page.</p>
            </div>
          ) : null
        }
      />
    </div>
  );
};

export default CustomUploadEditor;

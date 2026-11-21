// LivePreview.jsx — server-rendered PDF (sample letter) iframe mein; page 1 / 2 tabs; mobile par "open" link.
import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Eye, ExternalLink, Loader2, AlertTriangle } from 'lucide-react';
import { selectLetterheadPreview } from '../../features/letterheads/letterheadSelectors.js';

export const LivePreview = ({ page = 1, onPageChange, disabledReason = null }) => {
  const { url, loading, error } = useSelector(selectLetterheadPreview);

  // Page chhodte waqt aakhri object URL free
  const lastUrl = useRef(url);
  useEffect(() => {
    lastUrl.current = url;
  }, [url]);
  useEffect(() => () => lastUrl.current && URL.revokeObjectURL(lastUrl.current), []);

  return (
    <section className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
        <h3 className="flex items-center gap-1.5 text-sm font-extrabold text-slate-900">
          <Eye className="h-4 w-4 text-indigo-600" /> Live preview
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />}
        </h3>
        <div className="flex items-center gap-1.5">
          {[1, 2].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${p === page ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              aria-pressed={p === page}
            >
              {p === 1 ? 'Page 1' : 'Page 2'}
            </button>
          ))}
          {url && (
            <a href={url} target="_blank" rel="noreferrer" className="rounded-lg bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200" title="Open PDF">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      <div className="relative h-32 w-full bg-slate-100 sm:h-auto sm:aspect-[210/297]">
        {disabledReason ? (
          <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-xs font-semibold text-slate-500">{disabledReason}</p>
        ) : error ? (
          <p className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-xs font-semibold text-rose-600">
            <AlertTriangle className="h-5 w-5" /> {error}
          </p>
        ) : url ? (
          <>
            {/* Mobile browsers aksar iframe mein PDF nahi dikhate — link dete hain */}
            <iframe key={url} src={`${url}#toolbar=0&navpanes=0&view=FitH`} title="Letterhead preview" className="hidden h-full w-full sm:block" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 sm:hidden">
              <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow">
                <ExternalLink className="h-3.5 w-3.5" /> Open preview PDF
              </a>
              <span className="text-[11px] text-slate-500">Page {page} · sample letter</span>
            </div>
          </>
        ) : (
          <p className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">{loading ? 'Rendering…' : 'Preview will appear here'}</p>
        )}
      </div>
      <p className="px-3 py-1.5 text-[10px] text-slate-400">Sample text. Your real letter body is added when you create a document.</p>
    </section>
  );
};

export default LivePreview;

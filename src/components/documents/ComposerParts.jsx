// ComposerParts.jsx — composer ke chhote hisse: list input (CC / enclosures), quick template picker, preview panel.
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { X, Plus, Wand2, Eye, ExternalLink, Loader2, AlertTriangle } from 'lucide-react';
import { Field, TextInput } from '../letterheads/LetterheadFields.jsx';
import { quickTemplatesFor, fillTemplate, LIST_MAX_ITEMS } from '../../constants/documents.js';
import { selectDocumentPreview } from '../../features/documents/documentSelectors.js';

/** CC / Enclosures: ek-ek item add karo (Enter ya +) */
export const ListInput = ({ id, label, items = [], onChange, placeholder }) => {
  const [text, setText] = useState('');
  const add = () => {
    const v = text.trim();
    if (!v || items.length >= LIST_MAX_ITEMS) return;
    onChange([...items, v.slice(0, 150)]);
    setText('');
  };
  return (
    <Field label={label} htmlFor={id} hint={items.length >= LIST_MAX_ITEMS ? `Up to ${LIST_MAX_ITEMS} items` : null}>
      <div className="flex gap-1.5">
        <div className="min-w-0 flex-1">
          <TextInput
            id={id}
            value={text}
            onChange={setText}
            placeholder={placeholder}
            maxLength={150}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                add();
              }
            }}
          />
        </div>
        <button type="button" onClick={add} className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100" aria-label={`Add ${label}`}>
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {items.length > 0 && (
        <ul className="mt-1.5 flex flex-wrap gap-1.5">
          {items.map((item, i) => (
            <li key={`${item}-${i}`} className="inline-flex max-w-full items-center gap-1 rounded-full bg-slate-100 py-0.5 pl-2.5 pr-1 text-[11px] font-semibold text-slate-700">
              <span className="truncate">{item}</span>
              <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="rounded-full p-0.5 hover:bg-slate-200" aria-label={`Remove ${item}`}>
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Field>
  );
};

/** Quick templates (segment ke) → placeholders form → body / subject / doc type */
export const QuickTemplatePicker = ({ segment, onApply }) => {
  const templates = quickTemplatesFor(segment);
  const [activeId, setActiveId] = useState(null);
  const [values, setValues] = useState({});
  const active = templates.find((t) => t.id === activeId) || null;
  if (!templates.length) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {templates.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setActiveId(t.id === activeId ? null : t.id);
              setValues({});
            }}
            aria-pressed={t.id === activeId}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold transition ${t.id === activeId ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {t.name}
          </button>
        ))}
      </div>
      {active && (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-3">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {active.fields.map((f) => (
              <Field key={f.key} label={f.label} htmlFor={`qt-${f.key}`}>
                <TextInput id={`qt-${f.key}`} value={values[f.key]} onChange={(v) => setValues((s) => ({ ...s, [f.key]: v }))} placeholder={f.placeholder} maxLength={300} />
              </Field>
            ))}
          </div>
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-slate-500">Empty fields become blanks (______) you can fill in the editor.</p>
            <button
              type="button"
              onClick={() => {
                onApply({ bodyHtml: fillTemplate(active.body, values), subject: active.subject, docType: active.docType });
                setActiveId(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-md"
            >
              <Wand2 className="h-3.5 w-3.5" /> Use this text
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/** Page 1 preview (server PDF) */
export const DocumentPreviewPanel = ({ onClose }) => {
  const { url, refNo, pageCount, loading, error } = useSelector(selectDocumentPreview);
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
        <h3 className="flex min-w-0 items-center gap-1.5 text-sm font-extrabold text-slate-900">
          <Eye className="h-4 w-4 shrink-0 text-indigo-600" /> Preview · page 1
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />}
        </h3>
        <div className="flex items-center gap-1.5">
          {url && (
            <a href={url} target="_blank" rel="noreferrer" className="rounded-lg bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200" title="Open PDF">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          <button type="button" onClick={onClose} className="rounded-lg bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200" aria-label="Close preview">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {(refNo || pageCount) && !error && (
        <p className="flex flex-wrap gap-x-3 gap-y-0.5 px-3 pt-2 text-[11px] text-slate-500">
          {refNo && (
            <span>
              Ref. no. <span className="font-mono font-bold text-slate-800">{refNo}</span> (confirmed on generate)
            </span>
          )}
          {pageCount && <span>{pageCount} page(s) in total</span>}
        </p>
      )}
      <div className="relative m-3 h-32 overflow-hidden rounded-xl bg-slate-100 sm:h-auto sm:aspect-[210/297]">
        {error ? (
          <p className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-xs font-semibold text-rose-600">
            <AlertTriangle className="h-5 w-5" /> {error}
          </p>
        ) : url ? (
          <>
            <iframe key={url} src={`${url}#toolbar=0&navpanes=0&view=FitH`} title="Document preview" className="hidden h-full w-full sm:block" />
            <div className="absolute inset-0 flex items-center justify-center sm:hidden">
              <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow">
                <ExternalLink className="h-3.5 w-3.5" /> Open preview PDF
              </a>
            </div>
          </>
        ) : (
          <p className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">{loading ? 'Rendering…' : 'No preview yet'}</p>
        )}
      </div>
    </section>
  );
};

export default ListInput;

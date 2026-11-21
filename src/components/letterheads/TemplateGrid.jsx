// TemplateGrid.jsx — segment ke system templates (thumbnail + naam); click = select.
import React from 'react';
import { Check, Loader2 } from 'lucide-react';

export const TemplateGrid = ({ templates = [], loading = false, selectedId, onSelect }) => {
  if (loading && !templates.length) {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading templates…
      </div>
    );
  }
  if (!templates.length) {
    return <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">No templates are available for this type.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {templates.map((t) => {
        const active = t.id === selectedId;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t)}
            className={`group relative overflow-hidden rounded-2xl border bg-white text-left transition ${active ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200 hover:border-indigo-300'}`}
            aria-pressed={active}
          >
            <div className="aspect-[210/297] w-full bg-slate-100">
              {t.thumbnail ? <img src={t.thumbnail} alt="" className="h-full w-full object-cover object-top" loading="lazy" /> : null}
            </div>
            <div className="px-2.5 py-2">
              <p className="truncate text-xs font-extrabold text-slate-900">{t.name}</p>
              <p className="line-clamp-2 text-[10px] leading-snug text-slate-500">{t.description}</p>
            </div>
            {active && (
              <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white shadow">
                <Check className="h-3.5 w-3.5" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default TemplateGrid;

// ThemeGallery.jsx — category chips, search, thumbnails (ek API call se), school ki apni themes
import React, { useEffect, useRef, useState } from 'react';
import { Check, Loader2, Pencil, Save, Search, Sparkles, Trash2, X } from 'lucide-react';
import ConfirmDialog from '../../common/ConfirmDialog.jsx';
import ThemeThumbnail from './ThemeThumbnail.jsx';

const ALL = 'ALL';
const SCHOOL = 'SCHOOL';
const NAME_MAX = 60;

const chipClass = (active) =>
  `shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold ${active ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`;

const matchesSearch = (theme, query) => {
  if (!query) return true;
  const text = `${theme.name} ${(theme.tags || []).join(' ')}`.toLowerCase();
  return text.includes(query);
};

// School theme ka naam: save aur rename dono
const ThemeNameDialog = ({ title, initialName, confirmLabel, onSubmit, onClose }) => {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const trimmed = name.trim();

  const handleSubmit = (e) => {
    // Designer khud ek form ke andar hai
    e.preventDefault();
    e.stopPropagation();
    if (saving || trimmed.length < 2) return;
    setSaving(true);
    setError(null);
    onSubmit(trimmed, {
      onSuccess: onClose,
      onError: (message) => {
        setSaving(false);
        setError(message);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="w-full max-w-sm space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <label htmlFor="school-theme-name" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Theme name</label>
        <input
          id="school-theme-name"
          ref={inputRef}
          type="text"
          maxLength={NAME_MAX}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit(e);
          }}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        />
        {error && <p className="text-xs text-rose-700" role="alert">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || trimmed.length < 2}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * @param {object} props
 * @param {object|null} props.themes - /templates/themes catalog
 * @param {string} props.presetKey - chuni hui theme
 * @param {(theme: object) => void} props.onApply
 * @param {(name: string, callbacks: object) => void} [props.onSave]
 * @param {(id: string, name: string, callbacks: object) => void} [props.onRename]
 * @param {(id: string, callbacks: object) => void} [props.onDelete]
 */
export const ThemeGallery = ({ themes, presetKey, onApply, onSave, onRename, onDelete }) => {
  const [category, setCategory] = useState(ALL);
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState(null); // { mode: 'SAVE' } | { mode: 'RENAME', theme }
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const presets = themes?.presets || [];
  const categories = themes?.categories || [];
  const schoolThemes = themes?.schoolThemes;
  const canSave = Array.isArray(schoolThemes) && Boolean(onSave);
  const query = search.trim().toLowerCase();

  const source = category === SCHOOL ? schoolThemes || [] : presets;
  const shown = source.filter((theme) => (category === ALL || category === SCHOOL || theme.category === category) && matchesSearch(theme, query));

  const confirmDelete = () => {
    setDeleteBusy(true);
    setDeleteError(null);
    onDelete(deleting.id, {
      onSuccess: () => {
        setDeleteBusy(false);
        setDeleting(null);
      },
      onError: (message) => {
        setDeleteBusy(false);
        setDeleteError(message);
        setDeleting(null);
      },
    });
  };

  return (
    <section className="space-y-3 pt-4 border-t border-slate-100 first:border-t-0 first:pt-0">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" /> Themes
        </h3>
        {canSave && (
          <button
            type="button"
            onClick={() => setDialog({ mode: 'SAVE' })}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Save className="h-3 w-3" /> Save as school theme
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.preventDefault();
          }}
          placeholder="Search themes"
          aria-label="Search themes"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="group" aria-label="Theme category">
        <button type="button" onClick={() => setCategory(ALL)} aria-pressed={category === ALL} className={chipClass(category === ALL)}>
          All ({presets.length})
        </button>
        {canSave && (
          <button type="button" onClick={() => setCategory(SCHOOL)} aria-pressed={category === SCHOOL} className={chipClass(category === SCHOOL)}>
            My school themes ({schoolThemes.length})
          </button>
        )}
        {categories.map(({ key, name, count }) => (
          <button key={key} type="button" onClick={() => setCategory(key)} aria-pressed={category === key} className={chipClass(category === key)}>
            {name} ({count})
          </button>
        ))}
      </div>

      {deleteError && <p className="text-[11px] text-rose-700" role="alert">{deleteError}</p>}

      {shown.length === 0 ? (
        <p className="py-4 text-center text-[11px] text-slate-500">
          {category === SCHOOL && !query ? 'No school themes yet. Design a card, then save it here.' : 'No themes match your search.'}
        </p>
      ) : (
        // Apne andar scroll: 50 themes ke neeche options aur colours door na chale jaayein
        <div className="grid max-h-[26rem] grid-cols-3 gap-1.5 overflow-y-auto pr-1">
          {shown.map((theme) => {
            const active = theme.key === presetKey;
            const isSchool = category === SCHOOL;
            return (
              <div key={theme.key} className="relative">
                <button
                  type="button"
                  onClick={() => onApply(theme)}
                  aria-pressed={active}
                  title={theme.description || theme.name}
                  className={`relative w-full rounded-xl border-2 p-1 text-left transition-colors ${active ? 'border-indigo-500 bg-indigo-50/50' : 'border-transparent hover:border-slate-300'}`}
                >
                  <ThemeThumbnail theme={theme} />
                  <span className="mt-1 block truncate text-[10px] font-semibold text-slate-700">{theme.name}</span>
                  {active && (
                    <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-indigo-600 text-white">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  )}
                </button>
                {isSchool && (
                  <div className="absolute bottom-6 right-1.5 flex gap-0.5">
                    <button type="button" onClick={() => setDialog({ mode: 'RENAME', theme })} aria-label={`Rename ${theme.name}`} className="rounded-md bg-white/90 p-1 text-slate-600 shadow-xs hover:text-indigo-700">
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError(null);
                        setDeleting(theme);
                      }}
                      aria-label={`Delete ${theme.name}`}
                      className="rounded-md bg-white/90 p-1 text-rose-600 shadow-xs hover:text-rose-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {dialog && (
        <ThemeNameDialog
          title={dialog.mode === 'SAVE' ? 'Save as school theme' : 'Rename school theme'}
          initialName={dialog.mode === 'RENAME' ? dialog.theme.name : ''}
          confirmLabel={dialog.mode === 'SAVE' ? 'Save theme' : 'Rename'}
          onClose={() => setDialog(null)}
          onSubmit={(name, callbacks) => {
            if (dialog.mode === 'SAVE') onSave(name, callbacks);
            else onRename(dialog.theme.id, name, callbacks);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        title="Delete this school theme?"
        message={deleting ? `"${deleting.name}" will be removed from your school themes.` : ''}
        confirmLabel="Delete theme"
        isLoading={deleteBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </section>
  );
};

export default ThemeGallery;

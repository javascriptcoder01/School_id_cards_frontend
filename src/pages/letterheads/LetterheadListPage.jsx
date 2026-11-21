// LetterheadListPage.jsx — Letterheads list (School Admin: apna school; Super Admin: school chunkar / sab).
// Card: naam, type, mode, version, default; actions: edit, duplicate, set default, delete.
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FileText, Plus, RefreshCw, Star, Copy, Pencil, Trash2, Loader2, Upload, LayoutTemplate, Layers } from 'lucide-react';
import { fetchLetterheadsRequested, letterheadActionRequested, fetchCollegeOptionsRequested } from '../../features/letterheads/letterheadSlice.js';
import { selectLetterheadList, selectLetterheadActionId, selectLetterheadCollegeOptions } from '../../features/letterheads/letterheadSelectors.js';
import { selectUserRole } from '../../features/auth/authSelectors.js';
import { ROUTES, getLetterheadEditRoute } from '../../constants/routes.js';
import { LETTERHEAD_SEGMENTS, SEGMENT_LABEL, LETTERHEAD_MODES } from '../../constants/letterhead.js';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import LetterheadSettingsCard from '../../components/letterheads/LetterheadSettingsCard.jsx';
import { ChoiceChips } from '../../components/letterheads/LetterheadFields.jsx';

const HeroChip = ({ icon: Icon, label, value }) => (
  <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-2.5 py-1.5 ring-1 ring-white/15 backdrop-blur-sm">
    <Icon className="h-3.5 w-3.5 text-indigo-200" />
    <span className="text-sm font-extrabold tabular-nums">{value}</span>
    <span className="text-[11px] font-medium text-indigo-200">{label}</span>
  </span>
);

const SEGMENT_FILTERS = [{ value: '', label: 'All' }, ...LETTERHEAD_SEGMENTS.map((s) => ({ value: s.value, label: s.short }))];

// System template ka mini "letterhead" (rangon se); custom ka Cloudinary preview
const Thumb = ({ letterhead }) => {
  const preview = letterhead.customUploadConfig?.firstPage?.previewUrl;
  if (preview) return <img src={preview} alt="" className="h-full w-full object-cover object-top" loading="lazy" />;
  const c = letterhead.systemTemplateConfig || {};
  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="h-[18%] w-full" style={{ background: c.primaryColor || '#4F46E5' }} />
      <div className="h-1 w-full" style={{ background: c.accentColor || '#F59E0B' }} />
      <div className="flex-1 space-y-1.5 px-[12%] pt-[10%]">
        {[80, 95, 70, 90, 60].map((w) => (
          <div key={w} className="h-1 rounded bg-slate-200" style={{ width: `${w}%` }} />
        ))}
      </div>
      <div className="h-[6%] w-full" style={{ background: c.secondaryColor || '#334155', opacity: 0.85 }} />
    </div>
  );
};

const LetterheadCard = ({ letterhead, busy, onAction }) => {
  const isCustom = letterhead.mode === LETTERHEAD_MODES.CUSTOM_UPLOAD;
  return (
    <article className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
      <Link to={getLetterheadEditRoute(letterhead.id)} className="aspect-[210/297] w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
        <Thumb letterhead={letterhead} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start gap-1.5">
          <Link to={getLetterheadEditRoute(letterhead.id)} className="min-w-0 flex-1 truncate text-sm font-extrabold text-slate-900 hover:text-indigo-700" title={letterhead.name}>
            {letterhead.name}
          </Link>
          {letterhead.isDefault && (
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Default
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">{SEGMENT_LABEL[letterhead.segment] || letterhead.segment}</span>
          <span className="inline-flex items-center gap-0.5 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
            {isCustom ? <Upload className="h-2.5 w-2.5" /> : <LayoutTemplate className="h-2.5 w-2.5" />}
            {isCustom ? 'Uploaded' : 'Template'}
          </span>
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">v{letterhead.version}</span>
        </div>
        <p className="mt-1 truncate font-mono text-[10px] text-slate-400">{letterhead.referenceFormat}</p>
        <div className="mt-auto flex flex-wrap items-center gap-1 pt-2">
          <Link to={getLetterheadEditRoute(letterhead.id)} className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100">
            <Pencil className="h-3 w-3" /> Edit
          </Link>
          <button type="button" disabled={busy} onClick={() => onAction('duplicate')} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-50">
            <Copy className="h-3 w-3" /> Duplicate
          </button>
          {!letterhead.isDefault && (
            <button type="button" disabled={busy} onClick={() => onAction('setDefault')} className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700 hover:bg-amber-100 disabled:opacity-50">
              <Star className="h-3 w-3" /> Default
            </button>
          )}
          <button type="button" disabled={busy} onClick={() => onAction('delete')} className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-100 disabled:opacity-50" aria-label="Delete">
            <Trash2 className="h-3 w-3" />
          </button>
          {busy && <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />}
        </div>
      </div>
    </article>
  );
};

export const LetterheadListPage = () => {
  const dispatch = useDispatch();
  const role = useSelector(selectUserRole);
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const { items, pagination, loading, error } = useSelector(selectLetterheadList);
  const actionId = useSelector(selectLetterheadActionId);
  const { items: colleges } = useSelector(selectLetterheadCollegeOptions);
  const [segment, setSegment] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const params = useMemo(() => ({ segment: segment || undefined, collegeId: collegeId || undefined, page: 1, limit: 100 }), [segment, collegeId]);
  useEffect(() => {
    dispatch(fetchLetterheadsRequested(params));
  }, [dispatch, params]);
  useEffect(() => {
    if (isSuperAdmin) dispatch(fetchCollegeOptionsRequested());
  }, [dispatch, isSuperAdmin]);

  const collegeName = useMemo(() => Object.fromEntries(colleges.map((c) => [c.id, c.name])), [colleges]);
  const defaults = items.filter((l) => l.isDefault).length;
  const newLink = isSuperAdmin && collegeId ? `${ROUTES.LETTERHEAD_NEW}?collegeId=${collegeId}` : ROUTES.LETTERHEAD_NEW;

  const onAction = (letterhead) => (kind) => {
    if (kind === 'delete') setConfirmDelete(letterhead);
    else dispatch(letterheadActionRequested({ id: letterhead.id, kind }));
  };

  // Super Admin "All schools" — school ke hisaab se group
  const groups = useMemo(() => {
    if (!isSuperAdmin || collegeId) return [{ key: 'all', title: null, items }];
    const map = new Map();
    items.forEach((l) => {
      if (!map.has(l.collegeId)) map.set(l.collegeId, []);
      map.get(l.collegeId).push(l);
    });
    return [...map.entries()].map(([key, list]) => ({ key, title: collegeName[key] || 'School', items: list }));
  }, [isSuperAdmin, collegeId, items, collegeName]);

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-indigo-900 to-violet-800 px-4 py-3.5 text-white shadow-xl sm:px-5">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-400 via-violet-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/30 ring-1 ring-white/30">
              <FileText className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-black tracking-tight sm:text-2xl">Letterheads</h1>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <HeroChip icon={Layers} label="Total" value={Number(pagination?.total || items.length || 0).toLocaleString('en-IN')} />
                <HeroChip icon={Star} label="Default" value={defaults} />
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => dispatch(fetchLetterheadsRequested(params))}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 hover:bg-white/20"
              aria-label="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link to={newLink} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white px-3 text-sm font-bold text-indigo-700 shadow-md hover:bg-indigo-50">
              <Plus className="h-4 w-4" /> New letterhead
            </Link>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="overflow-x-auto pb-1">
          <ChoiceChips value={segment} onChange={setSegment} options={SEGMENT_FILTERS} />
        </div>
        {isSuperAdmin && (
          <select
            value={collegeId}
            onChange={(e) => setCollegeId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm sm:w-64"
            aria-label="School"
          >
            <option value="">All schools</option>
            {colleges.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.code ? `(${c.code})` : ''}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && <ErrorMessage message={error} title="Could not load letterheads" />}

      {loading && !items.length ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-10 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading letterheads…
        </div>
      ) : !items.length ? (
        <div className="rounded-2xl border border-dashed border-indigo-200 bg-linear-to-br from-white to-indigo-50/60 px-4 py-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
            <FileText className="h-6 w-6" />
          </span>
          <p className="mt-3 text-sm font-bold text-slate-800">No letterheads yet</p>
          <p className="mt-0.5 text-xs text-slate-500">Pick a ready template or upload your own letterhead.</p>
          <Link to={newLink} className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-md">
            <Plus className="h-3.5 w-3.5" /> Create letterhead
          </Link>
        </div>
      ) : (
        groups.map((g) => (
          <div key={g.key} className="space-y-2">
            {g.title && <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-500">{g.title}</h2>}
            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
              {g.items.map((l) => (
                <LetterheadCard key={l.id} letterhead={l} busy={actionId === l.id} onAction={onAction(l)} />
              ))}
            </div>
          </div>
        ))
      )}

      {isSuperAdmin && <LetterheadSettingsCard />}

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete letterhead?"
        message={confirmDelete ? `"${confirmDelete.name}" will be removed. Documents already generated stay as they are.` : ''}
        confirmLabel="Delete"
        variant="danger"
        isConfirming={Boolean(confirmDelete && actionId === confirmDelete.id)}
        onConfirm={() => {
          dispatch(letterheadActionRequested({ id: confirmDelete.id, kind: 'delete', onSuccess: () => setConfirmDelete(null) }));
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default LetterheadListPage;

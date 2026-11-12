// ThemeArtworkPage.jsx — Super Admin "Theme Artwork": SVG upload (server sanitise), list (Table / Cards),
// preview + slot defaults, activate / deactivate, delete. Schools isse designer mein recolour karte hain.
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle2, LayoutGrid, Loader2, RefreshCw, Search, Shapes, Table2, XCircle } from 'lucide-react';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import ArtworkUploadForm from '../../components/themeArtwork/ArtworkUploadForm.jsx';
import ArtworkDetailPanel from '../../components/themeArtwork/ArtworkDetailPanel.jsx';
import {
  fetchArtworksRequested,
  fetchArtworkRequested,
  clearArtworkDetail,
  createArtworkRequested,
  updateArtworkRequested,
  clearArtworkSaveError,
  deleteArtworkRequested,
} from '../../features/themeArtwork/themeArtworkSlice.js';
import {
  selectThemeArtworks,
  selectThemeArtworksPagination,
  selectThemeArtworksLoading,
  selectThemeArtworksError,
  selectThemeArtworkDetail,
  selectThemeArtworkDetailLoading,
  selectThemeArtworkSaving,
  selectThemeArtworkSaveError,
  selectThemeArtworkDeletingId,
} from '../../features/themeArtwork/themeArtworkSelectors.js';

const VIEW_STORAGE_KEY = 'themeArtwork.viewMode';
const VIEWS = { TABLE: 'TABLE', CARDS: 'CARDS' };
const STATUS_FILTERS = [
  { key: '', label: 'All' },
  { key: 'true', label: 'Active' },
  { key: 'false', label: 'Inactive' },
];
const PAGE_SIZE = 20;

const readView = () => {
  try {
    const saved = window.localStorage.getItem(VIEW_STORAGE_KEY);
    if (saved === VIEWS.TABLE || saved === VIEWS.CARDS) return saved;
  } catch {
    // storage band: default
  }
  return typeof window !== 'undefined' && window.innerWidth < 768 ? VIEWS.CARDS : VIEWS.TABLE;
};
const saveView = (view) => {
  try {
    window.localStorage.setItem(VIEW_STORAGE_KEY, view);
  } catch {
    // ignore
  }
};

const StatusBadge = ({ active }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
    {active ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />} {active ? 'Active' : 'Inactive'}
  </span>
);

const Thumb = ({ artwork, className = 'h-14 w-10' }) => (
  <span className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-slate-200 ${className}`}>
    {artwork.thumbnailUrl ? <img src={artwork.thumbnailUrl} alt="" className="h-full w-full object-contain" /> : <Shapes className="h-4 w-4 text-slate-300" />}
  </span>
);

const ViewToggle = ({ value, onChange }) => (
  <div className="inline-flex rounded-xl bg-linear-to-r from-indigo-100/80 via-violet-100/70 to-fuchsia-100/70 p-1 ring-1 ring-indigo-200/50" role="tablist" aria-label="View">
    {[
      { key: VIEWS.TABLE, label: 'Table', icon: Table2 },
      { key: VIEWS.CARDS, label: 'Cards', icon: LayoutGrid },
    ].map(({ key, label, icon: Icon }) => (
      <button
        key={key}
        type="button"
        role="tab"
        aria-selected={value === key}
        onClick={() => onChange(key)}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${value === key ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30' : 'text-slate-600 hover:bg-white/70 hover:text-indigo-700'}`}
      >
        <Icon className="h-3.5 w-3.5" /> {label}
      </button>
    ))}
  </div>
);

export const ThemeArtworkPage = () => {
  const dispatch = useDispatch();
  const artworks = useSelector(selectThemeArtworks);
  const pagination = useSelector(selectThemeArtworksPagination);
  const loading = useSelector(selectThemeArtworksLoading);
  const listError = useSelector(selectThemeArtworksError);
  const detail = useSelector(selectThemeArtworkDetail);
  const detailLoading = useSelector(selectThemeArtworkDetailLoading);
  const saving = useSelector(selectThemeArtworkSaving);
  const saveError = useSelector(selectThemeArtworkSaveError);
  const deletingId = useSelector(selectThemeArtworkDeletingId);

  const [viewMode, setViewMode] = useState(readView);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [lastRemoved, setLastRemoved] = useState([]);

  const params = { page, limit: PAGE_SIZE, search: search.trim(), isActive: status };

  useEffect(() => {
    const timer = setTimeout(() => dispatch(fetchArtworksRequested({ params })), 250);
    return () => clearTimeout(timer);
    // params ka content in teen mein
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, page, search, status]);

  useEffect(() => () => dispatch(clearArtworkDetail()), [dispatch]);

  const openDetail = (id) => {
    setSelectedId(id);
    dispatch(clearArtworkSaveError());
    dispatch(fetchArtworkRequested({ artworkId: id }));
  };
  const closeDetail = () => {
    setSelectedId(null);
    dispatch(clearArtworkDetail());
  };

  const upload = ({ onDone, ...data }) =>
    dispatch(
      createArtworkRequested({
        ...data,
        onSuccess: (artwork, removed) => {
          onDone();
          setLastRemoved(removed);
          if (artwork?.id) openDetail(artwork.id);
        },
      })
    );

  const total = pagination?.total ?? artworks.length;
  const totalPages = pagination?.totalPages || 1;
  const activeCount = artworks.filter((a) => a.isActive).length;

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-indigo-900 to-violet-800 px-4 py-3.5 text-white shadow-xl sm:px-5">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-400 via-violet-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/30 ring-1 ring-white/30">
              <Shapes className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-black tracking-tight sm:text-2xl">Theme Artwork</h1>
              <p className="text-[11px] text-indigo-100/90">SVG designs that schools recolour in the card designer · {total} total · {activeCount} active on this page</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => dispatch(fetchArtworksRequested({ params }))}
            disabled={loading}
            className="inline-flex h-9 items-center gap-1.5 self-start rounded-xl bg-white/10 px-3 text-xs font-bold ring-1 ring-white/20 hover:bg-white/20 disabled:opacity-70 sm:self-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </section>

      <ArtworkUploadForm saving={saving && !selectedId} error={selectedId ? null : saveError} onSubmit={upload} onClearError={() => dispatch(clearArtworkSaveError())} />

      {lastRemoved.length > 0 && (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
          Uploaded. Harmless extras were removed while cleaning: {lastRemoved.join(', ')}.
        </p>
      )}

      {selectedId && (detailLoading || !detail ? (
        <p className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs text-slate-500 shadow-sm"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading artwork…</p>
      ) : (
        <ArtworkDetailPanel
          key={`${detail.id}-${detail.updatedAt}`}
          artwork={detail}
          saving={saving}
          error={saveError}
          deleting={deletingId === detail.id}
          onSave={(body) => dispatch(updateArtworkRequested({ artworkId: detail.id, body, onSuccess: () => openDetail(detail.id) }))}
          onDelete={() => setConfirmDelete(detail)}
          onClose={closeDetail}
        />
      ))}

      {listError && <ErrorMessage title="Error loading artwork" message={listError} />}

      <div className="rounded-2xl border border-indigo-100/80 bg-linear-to-r from-white via-indigo-50/50 to-violet-50/60 p-2 shadow-xs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search name or category"
              aria-label="Search artwork"
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-3 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.key || 'all'}
                type="button"
                onClick={() => {
                  setStatus(f.key);
                  setPage(1);
                }}
                aria-pressed={status === f.key}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${status === f.key ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 border-t border-indigo-100/70 pt-2">
          <p className="text-[11px] font-semibold text-slate-500">{loading && artworks.length === 0 ? 'Loading…' : `${artworks.length} on this page`}</p>
          <ViewToggle
            value={viewMode}
            onChange={(view) => {
              setViewMode(view);
              saveView(view);
            }}
          />
        </div>
      </div>

      {artworks.length === 0 && !loading ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-xs text-slate-500">No artwork yet. Upload an SVG above.</p>
      ) : viewMode === VIEWS.TABLE ? (
        <div className="overflow-x-auto rounded-2xl border border-indigo-100/80 bg-white shadow-sm">
          <div className="h-1 bg-linear-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
          <table className="w-full min-w-[560px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-2">Artwork</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Orientation</th>
                <th className="px-3 py-2">Slots</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {artworks.map((art) => (
                <tr key={art.id} className={selectedId === art.id ? 'bg-indigo-50/50' : 'hover:bg-slate-50/60'}>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Thumb artwork={art} />
                      <span className="font-bold text-slate-800">{art.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-slate-600">{art.category}</td>
                  <td className="px-3 py-2 text-slate-600">{art.orientation}</td>
                  <td className="px-3 py-2 text-slate-600">{art.slots.length}</td>
                  <td className="px-3 py-2"><StatusBadge active={art.isActive} /></td>
                  <td className="px-3 py-2 text-right">
                    <button type="button" onClick={() => openDetail(art.id)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-50">
                      Preview & edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {artworks.map((art) => (
            <button
              key={art.id}
              type="button"
              onClick={() => openDetail(art.id)}
              className={`flex flex-col gap-1.5 rounded-2xl border bg-white p-2 text-left shadow-xs hover:border-indigo-300 ${selectedId === art.id ? 'border-indigo-400' : 'border-slate-200'}`}
            >
              <Thumb artwork={art} className="aspect-[5/8] w-full" />
              <span className="truncate text-xs font-bold text-slate-800">{art.name}</span>
              <span className="flex items-center justify-between gap-1">
                <span className="truncate text-[10px] text-slate-500">{art.category} · {art.slots.length} slots</span>
                <StatusBadge active={art.isActive} />
              </span>
            </button>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 text-xs">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold disabled:opacity-40">Previous</button>
          <span className="text-slate-500">Page {page} of {totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold disabled:opacity-40">Next</button>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(confirmDelete)}
        title="Delete this artwork?"
        message={confirmDelete ? `"${confirmDelete.name}" will be deleted. Cards that use it will still print, just without this artwork layer.` : ''}
        confirmLabel="Delete artwork"
        isLoading={Boolean(deletingId)}
        onConfirm={() =>
          dispatch(
            deleteArtworkRequested({
              artworkId: confirmDelete.id,
              onSuccess: () => {
                setConfirmDelete(null);
                closeDetail();
              },
            })
          )
        }
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default ThemeArtworkPage;

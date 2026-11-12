// LayerList.jsx — side ki layers (upar wali layer list mein upar). Reorder (arrows), show / hide, lock,
// duplicate, delete, rename. "+ Add layer" menu thumbnails ke saath.
import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Lock, Pencil, Plus, Trash2, Unlock } from 'lucide-react';
import { THEME_LAYER_LIMITS, THEME_LAYER_TYPE_LABELS, THEME_LAYER_TYPE_VALUES } from '../../../../constants/themeBuilder.js';
import { ADDABLE_LAYER_TYPES, createLayer } from '../../../../utils/themeLayers.js';
import { CHECKER_STYLE, iconButtonClass, layersPreviewUrl, smallButtonClass } from './builderShared.js';

const layerName = (layer) => layer.name || THEME_LAYER_TYPE_LABELS[layer.type] || 'Layer';

/**
 * @param {object} props
 * @param {object[]} props.layers - draw order (pehla = neeche)
 * @param {object} props.roles
 * @param {string|null} props.selectedId
 * @param {(id: string) => void} props.onSelect
 * @param {(id: string, patch: object) => void} props.onUpdate
 * @param {(id: string, delta: number) => void} props.onMove
 * @param {(id: string) => void} props.onDuplicate
 * @param {(id: string) => void} props.onRemove
 */
export const LayerList = ({ layers, roles, artworks = [], selectedId, onSelect, onUpdate, onMove, onDuplicate, onRemove }) => {
  const [renamingId, setRenamingId] = useState(null);
  const [draftName, setDraftName] = useState('');
  const full = layers.length >= THEME_LAYER_LIMITS.MAX_LAYERS;

  const thumbs = useMemo(
    () =>
      Object.fromEntries(
        layers.map((l) => [
          l.id,
          // Artwork: catalog ka thumbnail (content alag se aata hai)
          l.type === 'ARTWORK'
            ? artworks.find((a) => a.id === l.artworkId)?.thumbnailUrl || ''
            : layersPreviewUrl([{ ...l, enabled: true, opacity: Math.max(l.opacity ?? 1, 0.35) }], roles, 36, 24),
        ])
      ),
    [layers, roles, artworks]
  );

  const commitRename = (id) => {
    onUpdate(id, { name: draftName.trim().slice(0, THEME_LAYER_LIMITS.NAME_MAX) || null });
    setRenamingId(null);
  };

  if (layers.length === 0) {
    return <p className="rounded-xl border border-dashed border-slate-200 px-3 py-4 text-center text-[11px] text-slate-500">No layers yet. Add one below.</p>;
  }

  // Upar wali layer pehle dikhe (Photoshop jaisa)
  const shown = layers.map((layer, index) => ({ layer, index })).reverse();

  return (
    <ul className="space-y-1" aria-label="Background layers">
      {shown.map(({ layer, index }) => {
        const selected = layer.id === selectedId;
        const locked = layer.locked === true;
        const hidden = layer.enabled === false;
        return (
          <li
            key={layer.id}
            className={`flex items-center gap-1.5 rounded-xl border px-1.5 py-1 ${selected ? 'border-indigo-300 bg-indigo-50/60' : 'border-slate-200 bg-white'}`}
          >
            <button
              type="button"
              onClick={() => onSelect(layer.id)}
              className={`flex min-w-0 flex-1 items-center gap-2 text-left ${hidden ? 'opacity-50' : ''}`}
              aria-pressed={selected}
            >
              <span className="block h-6 w-9 shrink-0 overflow-hidden rounded ring-1 ring-slate-200" style={CHECKER_STYLE}>
                {thumbs[layer.id] && <img src={thumbs[layer.id]} alt="" className="h-full w-full" />}
              </span>
              {renamingId === layer.id ? (
                <input
                  autoFocus
                  value={draftName}
                  maxLength={THEME_LAYER_LIMITS.NAME_MAX}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setDraftName(e.target.value)}
                  onBlur={() => commitRename(layer.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename(layer.id);
                    if (e.key === 'Escape') setRenamingId(null);
                  }}
                  className="min-w-0 flex-1 rounded-md border border-indigo-300 px-1.5 py-0.5 text-[11px] focus:outline-hidden"
                  aria-label="Layer name"
                />
              ) : (
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11px] font-semibold text-slate-700">{layerName(layer)}</span>
                  <span className="block truncate text-[9px] uppercase tracking-wide text-slate-400">{THEME_LAYER_TYPE_LABELS[layer.type]}</span>
                </span>
              )}
            </button>
            <div className="flex shrink-0 items-center">
              <button type="button" className={iconButtonClass} disabled={locked || index === layers.length - 1} onClick={() => onMove(layer.id, 1)} aria-label="Move layer up">
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button type="button" className={iconButtonClass} disabled={locked || index === 0} onClick={() => onMove(layer.id, -1)} aria-label="Move layer down">
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button type="button" className={iconButtonClass} onClick={() => onUpdate(layer.id, { enabled: hidden })} aria-label={hidden ? 'Show layer' : 'Hide layer'}>
                {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
              <button type="button" className={iconButtonClass} onClick={() => onUpdate(layer.id, { locked: !locked })} aria-label={locked ? 'Unlock layer' : 'Lock layer'}>
                {locked ? <Lock className="h-3.5 w-3.5 text-amber-600" /> : <Unlock className="h-3.5 w-3.5" />}
              </button>
              <details className="relative">
                <summary className={`${iconButtonClass} cursor-pointer list-none [&::-webkit-details-marker]:hidden`} aria-label="More layer actions">
                  <Pencil className="h-3.5 w-3.5" />
                </summary>
                <div className="absolute right-0 z-20 mt-1 w-36 space-y-0.5 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                    onClick={(e) => {
                      e.currentTarget.closest('details').open = false;
                      setDraftName(layer.name || '');
                      setRenamingId(layer.id);
                    }}
                  >
                    <Pencil className="h-3 w-3" /> Rename
                  </button>
                  <button
                    type="button"
                    disabled={full}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                    onClick={(e) => {
                      e.currentTarget.closest('details').open = false;
                      onDuplicate(layer.id);
                    }}
                  >
                    <Copy className="h-3 w-3" /> Duplicate
                  </button>
                  <button
                    type="button"
                    disabled={locked}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-40"
                    onClick={(e) => {
                      e.currentTarget.closest('details').open = false;
                      onRemove(layer.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </details>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

/**
 * "+ Add layer": har type ka thumbnail (inline grid, mobile par bahar nahi nikalta)
 * @param {{ roles: object, disabled: boolean, onAdd: (type: string) => void }} props
 */
export const AddLayerMenu = ({ roles, artworks = [], disabled, onAdd }) => {
  const [open, setOpen] = useState(false);
  // Artwork tile → pehle kaun si artwork
  const [pickArtwork, setPickArtwork] = useState(false);
  const thumbs = useMemo(
    () =>
      Object.fromEntries(
        ADDABLE_LAYER_TYPES.filter((type) => type !== 'ARTWORK').map((type) => [type, layersPreviewUrl([createLayer(type)], roles, 48, 32)])
      ),
    [roles]
  );

  return (
    <div className="space-y-2">
      <button
        type="button"
        className={`${smallButtonClass} w-full py-1.5`}
        disabled={disabled}
        onClick={() => {
          setOpen((v) => !v);
          setPickArtwork(false);
        }}
        aria-expanded={open}
      >
        <Plus className="h-3.5 w-3.5" /> {disabled ? `Max ${THEME_LAYER_LIMITS.MAX_LAYERS} layers` : 'Add layer'}
      </button>
      {open && !disabled && pickArtwork && (
        <div className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600">Choose artwork</span>
            <button type="button" className="text-[11px] font-semibold text-indigo-600" onClick={() => setPickArtwork(false)}>Back</button>
          </div>
          <div className="grid max-h-56 grid-cols-3 gap-1 overflow-y-auto">
            {artworks.map((art) => (
              <button
                key={art.id}
                type="button"
                onClick={() => {
                  onAdd('ARTWORK', { artworkId: art.id, name: art.name });
                  setOpen(false);
                  setPickArtwork(false);
                }}
                title={art.name}
                className="flex flex-col items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-1 text-[9px] font-semibold text-slate-600 hover:border-indigo-300 hover:text-indigo-700"
              >
                <span className="flex h-12 w-full items-center justify-center overflow-hidden rounded bg-white">
                  {art.thumbnailUrl && <img src={art.thumbnailUrl} alt="" className="h-full w-full object-contain" />}
                </span>
                <span className="w-full truncate">{art.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {open && !disabled && !pickArtwork && (
        <div className="grid grid-cols-4 gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1.5">
          {THEME_LAYER_TYPE_VALUES.map((type) => {
            const isArtwork = type === 'ARTWORK';
            const available = isArtwork ? artworks.length > 0 : ADDABLE_LAYER_TYPES.includes(type);
            return (
              <button
                key={type}
                type="button"
                disabled={!available}
                onClick={() => {
                  if (isArtwork) {
                    setPickArtwork(true);
                    return;
                  }
                  onAdd(type);
                  setOpen(false);
                }}
                title={available ? `Add ${THEME_LAYER_TYPE_LABELS[type]}` : 'No artwork has been published yet'}
                className="flex flex-col items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-1 text-[9px] font-semibold text-slate-600 hover:border-indigo-300 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="block h-7 w-full overflow-hidden rounded" style={CHECKER_STYLE}>
                  {isArtwork
                    ? artworks[0]?.thumbnailUrl && <img src={artworks[0].thumbnailUrl} alt="" className="h-full w-full object-cover" />
                    : thumbs[type] && <img src={thumbs[type]} alt="" className="h-full w-full" />}
                </span>
                <span className="w-full truncate">{THEME_LAYER_TYPE_LABELS[type]}{available ? '' : ' (none)'}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LayerList;

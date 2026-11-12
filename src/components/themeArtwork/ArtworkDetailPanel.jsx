// ArtworkDetailPanel.jsx — Super Admin: artwork preview (live slot colours), naam / category / orientation,
// har slot ka default (role ya fixed hex), activate / deactivate, delete.
import React, { useMemo, useState } from 'react';
import { Loader2, Power, Save, Trash2, X } from 'lucide-react';
import { DEFAULT_ROLE_COLORS, renderLayersSvg, svgToDataUrl } from '@app/theme-engine';
import { THEME_COLOR_ROLE_VALUES, THEME_ROLE_LABELS } from '../../constants/themeBuilder.js';

const labelClass = 'block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1';
const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500';
const HEX6 = /^#[0-9a-f]{6}$/i;
const CARD = { PORTRAIT: { w: 54, h: 86 }, LANDSCAPE: { w: 86, h: 54 } };

/**
 * @param {object} props
 * @param {object} props.artwork - detail (svg ke saath)
 * @param {boolean} props.saving
 * @param {string|null} props.error
 * @param {boolean} props.deleting
 * @param {(body: object) => void} props.onSave
 * @param {() => void} props.onDelete
 * @param {() => void} props.onClose
 */
export const ArtworkDetailPanel = ({ artwork, saving, error, deleting, onSave, onDelete, onClose }) => {
  const [name, setName] = useState(artwork.name);
  const [category, setCategory] = useState(artwork.category || '');
  const [orientation, setOrientation] = useState(artwork.orientation || 'ANY');
  const [slots, setSlots] = useState(() => artwork.slots.map((s) => ({ ...s })));
  // Sirf preview: "school ka palette" jaisa test (save nahi hota)
  const [previewRoles, setPreviewRoles] = useState({ ...DEFAULT_ROLE_COLORS });
  const [shape, setShape] = useState(artwork.orientation === 'LANDSCAPE' ? 'LANDSCAPE' : 'PORTRAIT');

  const card = CARD[shape];
  const previewUrl = useMemo(
    () =>
      svgToDataUrl(
        renderLayersSvg({
          layers: [{ id: 'p', type: 'ARTWORK', artworkId: artwork.id, fit: 'COVER', enabled: true, opacity: 1 }],
          roles: previewRoles,
          artworks: { [artwork.id]: { svg: artwork.svg, viewBox: artwork.viewBox, slots } },
          width: card.w,
          height: card.h,
          idPrefix: 'sa-',
        })
      ),
    [artwork, slots, previewRoles, card]
  );

  const setSlot = (index, patch) => setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));

  const save = () =>
    onSave({
      name: name.trim(),
      category: category.trim(),
      orientation,
      slots: slots.map((s) => ({ name: s.name, defaultRole: s.defaultRole || null, defaultHex: s.defaultRole ? null : s.defaultHex || '#000000' })),
    });

  return (
    <div className="space-y-3 rounded-2xl border border-indigo-100/80 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="truncate text-sm font-black text-slate-800">{artwork.name}</h2>
        <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100" aria-label="Close artwork details">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,220px)_1fr]">
        {/* Preview */}
        <div className="space-y-2">
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {['PORTRAIT', 'LANDSCAPE'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setShape(key)}
                aria-pressed={shape === key}
                className={`flex-1 rounded-lg py-1 text-[11px] font-semibold ${shape === key ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'}`}
              >
                {key === 'PORTRAIT' ? 'Portrait' : 'Landscape'}
              </button>
            ))}
          </div>
          <div className="mx-auto overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-slate-200" style={{ aspectRatio: `${card.w} / ${card.h}`, maxWidth: shape === 'PORTRAIT' ? 180 : 240 }}>
            {previewUrl && <img src={previewUrl} alt={`${artwork.name} preview`} className="h-full w-full" />}
          </div>
          <div>
            <span className={labelClass}>Try school colours (preview only)</span>
            <div className="flex flex-wrap gap-1">
              {THEME_COLOR_ROLE_VALUES.map((role) => (
                <label key={role} className="flex items-center gap-1 rounded-full border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600" title={THEME_ROLE_LABELS[role]}>
                  <input
                    type="color"
                    value={previewRoles[role]}
                    onChange={(e) => setPreviewRoles((prev) => ({ ...prev, [role]: e.target.value.toUpperCase() }))}
                    className="h-4 w-4 cursor-pointer rounded-full border-0 p-0"
                    aria-label={`Preview ${THEME_ROLE_LABELS[role]} colour`}
                  />
                  {THEME_ROLE_LABELS[role]}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Details + slots */}
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <div>
              <label className={labelClass} htmlFor="detail-name">Name</label>
              <input id="detail-name" className={inputClass} value={name} maxLength={80} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="detail-category">Category</label>
              <input id="detail-category" className={inputClass} value={category} maxLength={40} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="detail-orientation">Orientation</label>
              <select id="detail-orientation" className={inputClass} value={orientation} onChange={(e) => setOrientation(e.target.value)}>
                <option value="ANY">Any</option>
                <option value="PORTRAIT">Portrait</option>
                <option value="LANDSCAPE">Landscape</option>
              </select>
            </div>
          </div>

          <div>
            <span className={labelClass}>Colour slots ({slots.length})</span>
            {slots.length === 0 ? (
              <p className="rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-500">This artwork has no colour slots, so schools can’t recolour it.</p>
            ) : (
              <div className="space-y-1.5">
                {slots.map((slot, i) => (
                  <div key={slot.name} className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-2.5 py-2">
                    <code className="min-w-16 text-[11px] font-bold text-slate-700">{slot.name}</code>
                    <select
                      value={slot.defaultRole || 'FIXED'}
                      onChange={(e) => setSlot(i, e.target.value === 'FIXED' ? { defaultRole: null, defaultHex: slot.defaultHex || '#000000' } : { defaultRole: e.target.value })}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px]"
                      aria-label={`${slot.name} default`}
                    >
                      {THEME_COLOR_ROLE_VALUES.map((role) => (
                        <option key={role} value={role}>Follows {THEME_ROLE_LABELS[role]}</option>
                      ))}
                      <option value="FIXED">Fixed colour</option>
                    </select>
                    {!slot.defaultRole && (
                      <input
                        type="color"
                        value={HEX6.test(slot.defaultHex || '') ? slot.defaultHex : '#000000'}
                        onChange={(e) => setSlot(i, { defaultHex: e.target.value.toUpperCase() })}
                        className="h-7 w-8 cursor-pointer rounded-lg border border-slate-200 p-0.5"
                        aria-label={`${slot.name} fixed colour`}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-700" role="alert">{error}</p>}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={save}
              disabled={saving || name.trim().length < 2}
              className="inline-flex items-center gap-1.5 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-3.5 py-2 text-xs font-extrabold text-white shadow-md shadow-indigo-500/30 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save changes
            </button>
            <button
              type="button"
              onClick={() => onSave({ isActive: !artwork.isActive })}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Power className="h-3.5 w-3.5" /> {artwork.isActive ? 'Deactivate' : 'Activate'}
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />} Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkDetailPanel;

// LayerColorPicker.jsx — layer ka rang: pehle ROLE chips (palette ke saath badalte hain), phir custom hex + opacity.
import React, { useState } from 'react';
import { SliderField } from '../designerControls.jsx';
import { THEME_COLOR_ROLE_VALUES, THEME_ROLE_LABELS } from '../../../../constants/themeBuilder.js';
import { labelClass } from './builderShared.js';

const HEX6 = /^#[0-9a-f]{6}$/i;

/**
 * @param {object} props
 * @param {string} props.label
 * @param {{ role?: string, hex?: string, alpha?: number }|null} props.value
 * @param {object} props.roles - resolved role hex colours
 * @param {(color: object) => void} props.onChange
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.showAlpha]
 */
export const LayerColorPicker = ({ label, value, roles, onChange, disabled = false, showAlpha = true }) => {
  const alpha = value?.alpha ?? 1;
  const shownHex = value?.hex || (value?.role ? roles[value.role] : '#000000');
  const [draft, setDraft] = useState(value?.hex || '');
  const [seen, setSeen] = useState(value?.hex);
  if (value?.hex !== seen) {
    setSeen(value?.hex);
    setDraft(value?.hex || '');
  }

  const withAlpha = (next) => (alpha < 1 ? { ...next, alpha } : next);
  const commitHex = (next) => {
    setDraft(next);
    if (HEX6.test(next)) onChange(withAlpha({ hex: next.toUpperCase() }));
  };

  return (
    <div className="space-y-1.5">
      <span className={labelClass}>{label}</span>
      <div className="flex flex-wrap gap-1" role="group" aria-label={`${label} colour roles`}>
        {THEME_COLOR_ROLE_VALUES.map((role) => {
          const active = value?.role === role;
          return (
            <button
              key={role}
              type="button"
              disabled={disabled}
              onClick={() => onChange(withAlpha({ role }))}
              aria-pressed={active}
              title={`${THEME_ROLE_LABELS[role]} (changes with the palette)`}
              className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold disabled:opacity-40 ${active ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <span className="h-3 w-3 rounded-full ring-1 ring-black/10" style={{ backgroundColor: roles[role] }} />
              {THEME_ROLE_LABELS[role]}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={HEX6.test(shownHex || '') ? shownHex : '#000000'}
          disabled={disabled}
          onChange={(e) => commitHex(e.target.value)}
          className="h-8 w-9 shrink-0 cursor-pointer rounded-xl border border-slate-200 p-0.5 disabled:opacity-40"
          aria-label={`${label} custom colour`}
        />
        <input
          type="text"
          maxLength={7}
          value={draft}
          placeholder={value?.role ? `${THEME_ROLE_LABELS[value.role]} (${shownHex})` : '#RRGGBB'}
          disabled={disabled}
          onChange={(e) => commitHex(e.target.value.trim())}
          className={`w-full rounded-xl border bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${draft && !HEX6.test(draft) ? 'border-rose-300' : 'border-slate-200'}`}
          aria-label={`${label} hex`}
        />
      </div>
      {showAlpha && (
        <SliderField
          label="Opacity"
          value={Math.round(alpha * 100)}
          min={0}
          max={100}
          suffix="%"
          disabled={disabled}
          onChange={(v) => {
            const { alpha: _old, ...base } = value || { role: 'primary' };
            onChange(v >= 100 ? base : { ...base, alpha: v / 100 });
          }}
        />
      )}
    </div>
  );
};

export default LayerColorPicker;

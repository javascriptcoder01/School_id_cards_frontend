// ThemeDesignPanel.jsx
// Designer ka "Design" tab: preset gallery, custom colors, active side ka background (Solid / Gradient / Letterhead),
// decoration chips + intensity, validity (session / valid till).
// Yahan sirf choices hain — shapes / colors ka asli hisaab backend preview karta hai.
import React from 'react';
import { Check, Palette, Image as ImageIcon, Sparkles, CalendarDays, Loader2 } from 'lucide-react';
import {
  TEMPLATE_BACKGROUND_TYPES,
  TEMPLATE_BACKGROUND_TYPE_LABELS,
  TEMPLATE_BACKGROUND_FIT_VALUES,
  TEMPLATE_BACKGROUND_FIT_LABELS,
  CARD_DECORATION_LABELS,
  CARD_THEME_EDITABLE_COLORS,
  DEFAULT_CARD_THEME_KEY,
} from '../../../constants/template.js';

const sectionClass = 'space-y-3 pt-4 border-t border-slate-100 first:border-t-0 first:pt-0';
const titleClass = 'flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider';
const labelClass = 'block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1';
const inputClass =
  'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white';

const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

// Preset ka chhota swatch (sirf rang dikhane ke liye — asli design preview canvas par)
const PresetSwatch = ({ preset }) => {
  const c = preset.colors;
  const body = preset.background?.gradient
    ? `linear-gradient(${preset.background.gradient.angle}deg, ${preset.background.gradient.from}, ${preset.background.gradient.to})`
    : c.background;
  return (
    <div className="aspect-[86/54] w-full overflow-hidden rounded-lg ring-1 ring-slate-200" style={{ background: body }}>
      <div className="h-1/4" style={{ background: `linear-gradient(90deg, ${c.primary}, ${c.secondary})` }} />
      <div className="h-0.5" style={{ background: c.accent }} />
      <div className="space-y-1 p-1.5">
        <div className="h-1 w-3/5 rounded" style={{ background: c.text }} />
        <div className="h-1 w-2/5 rounded opacity-60" style={{ background: c.mutedText }} />
      </div>
    </div>
  );
};

/**
 * @param {object} props
 * @param {object|null} props.themes - /templates/themes catalog
 * @param {boolean} props.themesLoading
 * @param {object} props.theme - formData.theme
 * @param {'FRONT'|'BACK'} props.side
 * @param {object} props.sideBackground - { backgroundType, backgroundAssetId, background, backgroundFit }
 * @param {object[]} props.letterheads - LETTERHEAD assets
 * @param {object} props.validity - { session, validTill }
 * @param {(preset: object) => void} props.onApplyPreset
 * @param {(patch: object) => void} props.onThemeChange
 * @param {(patch: object) => void} props.onSideBackgroundChange
 * @param {(patch: object) => void} props.onValidityChange
 */
export const ThemeDesignPanel = ({
  themes,
  themesLoading,
  theme = {},
  side,
  sideBackground,
  letterheads = [],
  validity,
  onApplyPreset,
  onThemeChange,
  onSideBackgroundChange,
  onValidityChange,
}) => {
  const presets = themes?.presets || [];
  const presetKey = theme.presetKey || DEFAULT_CARD_THEME_KEY;
  const preset = presets.find((p) => p.key === presetKey) || null;
  const decorationKey = side === 'BACK' ? 'backDecoration' : 'frontDecoration';
  const presetDecoration = side === 'BACK' ? preset?.back?.decoration : preset?.front?.decoration;
  const presetIntensity = side === 'BACK' ? preset?.back?.intensity : preset?.front?.intensity;
  const colors = theme.colors || {};
  const bgType = sideBackground.backgroundType || TEMPLATE_BACKGROUND_TYPES.SOLID;
  const gradient = theme.background?.gradient || {};
  const intensity = theme.decorationIntensity ?? presetIntensity ?? 1;

  const setColor = (key, value) => onThemeChange({ colors: { ...colors, [key]: value || null } });
  const setGradient = (patch) =>
    onThemeChange({ background: { ...(theme.background || {}), gradient: { ...gradient, ...patch } } });

  if (themesLoading && !themes) {
    return (
      <p className="flex items-center gap-2 text-xs text-slate-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading themes…
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Presets */}
      <section className={sectionClass}>
        <h3 className={titleClass}><Sparkles className="h-3.5 w-3.5 text-indigo-600" /> Start from a preset</h3>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((p) => {
            const active = p.key === presetKey;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => onApplyPreset(p)}
                aria-pressed={active}
                title={p.description}
                className={`relative rounded-xl border-2 p-1.5 text-left transition-colors ${active ? 'border-indigo-500 bg-indigo-50/50' : 'border-transparent hover:border-slate-300'}`}
              >
                <PresetSwatch preset={p} />
                <span className="mt-1 block truncate text-[11px] font-semibold text-slate-700">{p.name}</span>
                {active && (
                  <span className="absolute right-2 top-2 grid h-4 w-4 place-items-center rounded-full bg-indigo-600 text-white">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Colors */}
      <section className={sectionClass}>
        <h3 className={titleClass}><Palette className="h-3.5 w-3.5 text-indigo-600" /> Colors</h3>
        <div className="space-y-2">
          {CARD_THEME_EDITABLE_COLORS.map(({ key, label }) => {
            const presetValue = preset?.colors?.[key] || '#000000';
            const value = colors[key] || '';
            const shown = HEX.test(value) ? value : presetValue;
            return (
              <div key={key} className="flex items-center gap-2">
                <input
                  type="color"
                  value={/^#[0-9a-f]{6}$/i.test(shown) ? shown : '#000000'}
                  onChange={(e) => setColor(key, e.target.value)}
                  className="h-8 w-8 shrink-0 cursor-pointer rounded-lg border border-slate-200 p-0.5"
                  aria-label={`${label} color`}
                />
                <span className="w-20 shrink-0 text-[11px] font-semibold text-slate-600">{label}</span>
                <input
                  type="text"
                  maxLength={7}
                  value={value}
                  placeholder={presetValue}
                  onChange={(e) => setColor(key, e.target.value.trim())}
                  className={`${inputClass} font-mono ${value && !HEX.test(value) ? 'border-rose-300' : ''}`}
                  aria-label={`${label} hex`}
                />
                {value && (
                  <button type="button" onClick={() => setColor(key, null)} className="text-[11px] font-semibold text-slate-500 hover:text-slate-700">
                    Reset
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-slate-400">Empty = preset color. Text color stays readable on dark backgrounds.</p>
      </section>

      {/* Background (active side) */}
      <section className={sectionClass}>
        <h3 className={titleClass}><ImageIcon className="h-3.5 w-3.5 text-indigo-600" /> {side === 'BACK' ? 'Back' : 'Front'} background</h3>
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
          {Object.values(TEMPLATE_BACKGROUND_TYPES).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onSideBackgroundChange({ backgroundType: type })}
              aria-pressed={bgType === type}
              className={`rounded-lg py-1.5 text-[11px] font-semibold ${bgType === type ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'}`}
            >
              {TEMPLATE_BACKGROUND_TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        {bgType === TEMPLATE_BACKGROUND_TYPES.GRADIENT && (
          <div className="space-y-2">
            <div>
              <label className={labelClass}>Angle: {gradient.angle ?? preset?.background?.gradient?.angle ?? 135}°</label>
              <input
                type="range"
                min="0"
                max="360"
                step="5"
                value={gradient.angle ?? preset?.background?.gradient?.angle ?? 135}
                onChange={(e) => setGradient({ angle: Number(e.target.value) })}
                className="w-full accent-indigo-600"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'from', label: 'From', fallback: preset?.background?.gradient?.from || preset?.colors?.primary },
                { key: 'to', label: 'To', fallback: preset?.background?.gradient?.to || preset?.colors?.secondary },
              ].map(({ key, label, fallback }) => (
                <div key={key}>
                  <label className={labelClass}>{label}</label>
                  <input
                    type="color"
                    value={HEX.test(gradient[key] || '') && gradient[key].length === 7 ? gradient[key] : fallback || '#000000'}
                    onChange={(e) => setGradient({ [key]: e.target.value })}
                    className="h-8 w-full cursor-pointer rounded-lg border border-slate-200 p-0.5"
                    aria-label={`Gradient ${label.toLowerCase()} color`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {bgType === TEMPLATE_BACKGROUND_TYPES.IMAGE && (
          <div className="space-y-2">
            {letterheads.length === 0 ? (
              <p className="text-[11px] text-slate-500">No letterhead uploaded yet. Upload a LETTERHEAD asset in the school profile.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {letterheads.map((asset) => {
                  const active = String(asset._id) === String(sideBackground.backgroundAssetId);
                  return (
                    <button
                      key={asset._id}
                      type="button"
                      onClick={() => onSideBackgroundChange({ backgroundAssetId: asset._id, background: asset.url, backgroundType: TEMPLATE_BACKGROUND_TYPES.IMAGE })}
                      aria-pressed={active}
                      title={asset.name}
                      className={`relative aspect-[86/54] overflow-hidden rounded-lg border-2 ${active ? 'border-indigo-500' : 'border-slate-200 hover:border-slate-400'}`}
                    >
                      <img src={asset.url} alt={asset.name || 'Letterhead'} className="h-full w-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
            {sideBackground.backgroundAssetId && (
              <div>
                <label className={labelClass}>Fit</label>
                <select
                  value={sideBackground.backgroundFit || 'COVER'}
                  onChange={(e) => onSideBackgroundChange({ backgroundFit: e.target.value })}
                  className={inputClass}
                >
                  {TEMPLATE_BACKGROUND_FIT_VALUES.map((fit) => (
                    <option key={fit} value={fit}>{TEMPLATE_BACKGROUND_FIT_LABELS[fit] || fit}</option>
                  ))}
                </select>
              </div>
            )}
            {!sideBackground.backgroundAssetId && letterheads.length > 0 && (
              <p className="text-[11px] text-amber-700">Pick a letterhead — until then the card uses the solid color.</p>
            )}
          </div>
        )}
      </section>

      {/* Decoration (active side) */}
      <section className={sectionClass}>
        <h3 className={titleClass}><Sparkles className="h-3.5 w-3.5 text-indigo-600" /> Decoration</h3>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onThemeChange({ [decorationKey]: null })}
            aria-pressed={!theme[decorationKey]}
            className={`rounded-lg border px-2 py-1 text-[11px] font-semibold ${!theme[decorationKey] ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            Preset ({CARD_DECORATION_LABELS[presetDecoration] || '—'})
          </button>
          {(themes?.decorationStyles || []).map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => onThemeChange({ [decorationKey]: style })}
              aria-pressed={theme[decorationKey] === style}
              className={`rounded-lg border px-2 py-1 text-[11px] font-semibold ${theme[decorationKey] === style ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {CARD_DECORATION_LABELS[style] || style}
            </button>
          ))}
        </div>
        {bgType === TEMPLATE_BACKGROUND_TYPES.IMAGE && !theme[decorationKey] && (
          <p className="text-[11px] text-slate-400">On a letterhead, decorations show only when you pick one.</p>
        )}
        <div>
          <label className={labelClass}>Intensity: {Math.round(intensity * 100)}%</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={intensity}
              onChange={(e) => onThemeChange({ decorationIntensity: Number(e.target.value) })}
              className="w-full accent-indigo-600"
            />
            {theme.decorationIntensity !== null && theme.decorationIntensity !== undefined && (
              <button type="button" onClick={() => onThemeChange({ decorationIntensity: null })} className="text-[11px] font-semibold text-slate-500 hover:text-slate-700">
                Reset
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Validity */}
      <section className={sectionClass}>
        <h3 className={titleClass}><CalendarDays className="h-3.5 w-3.5 text-indigo-600" /> Validity</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="validity-session" className={labelClass}>Session</label>
            <input
              id="validity-session"
              type="text"
              maxLength={20}
              value={validity?.session || ''}
              onChange={(e) => onValidityChange({ session: e.target.value })}
              placeholder="2026-27"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="validity-till" className={labelClass}>Valid till</label>
            <input
              id="validity-till"
              type="date"
              value={validity?.validTill ? String(validity.validTill).slice(0, 10) : ''}
              onChange={(e) => onValidityChange({ validTill: e.target.value || null })}
              className={inputClass}
            />
          </div>
        </div>
        <p className="text-[11px] text-slate-400">Add the Session / Valid Till fields to show these on the card.</p>
      </section>
    </div>
  );
};

export default ThemeDesignPanel;

// ThemeBuilderSection.jsx — Design tab ka Theme Builder (Design tab ke saath lazy load).
// EASY (default): Brand colour → poora palette (mode chips + Shuffle), style sliders, Reset to theme.
// ADVANCED ("Customise layers"): layer list + add menu + per-layer editor + front / back.
// Har badlav normal form change hai (Cancel kaam karta hai); preview turant shared renderer se.
import React, { useMemo, useState } from 'react';
import { Layers, Palette, RotateCcw, Shuffle, SlidersHorizontal, Copy, Loader2, Pipette } from 'lucide-react';
import { extractLogoColors } from '../../../../utils/logoColors.js';
import { buildPalette, checkPrintSafety, resolveRoles } from '@app/theme-engine';
import PrintCheckChip from '../../../idCards/PrintCheckChip.jsx';
import { useRafLatest, useRafMergedPatch } from '../../../../hooks/useRafThrottle.js';
import { SliderField, SwitchField } from '../designerControls.jsx';
import {
  THEME_LAYER_LIMITS,
  THEME_LAYER_TYPE_LABELS,
  THEME_PALETTE_MODE_LABELS,
  THEME_PALETTE_MODE_VALUES,
} from '../../../../constants/themeBuilder.js';
import {
  backUsesFront,
  getSideLayers,
  isCurvyLayer,
  isPatternLayer,
  layerStyleValues,
  presetThemeBuilderData,
  scaleLayerValues,
  themeLayersOf,
} from '../../../../utils/themeLayers.js';
import LayerEditor from './LayerEditor.jsx';
import { AddLayerMenu, LayerList } from './LayerList.jsx';
import { activeGradientClass, chipClass, labelClass, smallButtonClass, subTitleClass } from './builderShared.js';

const sectionClass = 'space-y-3 pt-4 border-t border-slate-100';
const titleClass = 'flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider';
const HEX6 = /^#[0-9a-f]{6}$/i;
const LIMITS = THEME_LAYER_LIMITS;
const PATTERN_SPAN = LIMITS.PATTERN_SIZE_MAX - LIMITS.PATTERN_SIZE_MIN;
const EMPTY_COLORS = Object.freeze({});

// Purane 7 colour keys (null = preset) → role fallback
const colorFallback = (presetColors = {}, colors = {}) => {
  const pick = (key) => (HEX6.test(colors[key] || '') ? colors[key] : presetColors[key]);
  return {
    primary: pick('primary'),
    secondary: pick('secondary'),
    accent: pick('accent'),
    surface: pick('background'),
    text: pick('text'),
    mutedText: pick('mutedText'),
    onPrimary: pick('onPrimary'),
  };
};

/**
 * @param {object} props
 * @param {object} props.theme - formData.theme
 * @param {object|null} props.preset - chuna hua preset / school theme (catalog)
 * @param {'FRONT'|'BACK'} props.side
 * @param {object} props.themeBuilder - TemplateForm ke handlers
 * @param {(patch: object) => void} props.onThemeChange
 * @param {string|null} [props.logoUrl] - school logo (designer mein pehle se load) → "Use school logo colours"
 * @param {((layerId: string) => void)|null} [props.onEditLayerOnCard] - curve / shape ko card par edit
 * @param {{ width: number, height: number, unit: string }|null} [props.card] - Print check (pattern size mm mein)
 */
export const ThemeBuilderSection = ({ theme, preset, side, themeBuilder: h, onThemeChange, logoUrl = null, onEditLayerOnCard = null, artworks = [], card = null }) => {
  const [advanced, setAdvanced] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [paletteMode, setPaletteMode] = useState(THEME_PALETTE_MODE_VALUES[0]);
  const [variant, setVariant] = useState(0);

  const colors = theme.colors || EMPTY_COLORS;
  const roles = useMemo(
    () => resolveRoles(colors.roles || preset?.roles, colorFallback(preset?.colors, colors)),
    [colors, preset]
  );
  // Apni layers; na hon to preset ki (pehla edit unhe copy karta hai)
  const layersObj = themeLayersOf(theme) || presetThemeBuilderData(preset).layers;
  const sideList = getSideLayers(layersObj, side);
  const otherSide = side === 'BACK' ? 'FRONT' : 'BACK';
  const selected = sideList.find((l) => l.id === selectedId) || null;
  const style = layerStyleValues(sideList);
  const [brand, setBrand] = useState(roles.primary);
  // Logo colours: { status: 'idle'|'loading'|'error', colors: string[] }
  const [logo, setLogo] = useState({ status: 'idle', colors: [] });

  // Print check (sirf warnings) — dono sides
  const printWarnings = useMemo(
    () => checkPrintSafety({ roles, layers: layersObj || { front: [], back: null } }, card || { width: 54, height: 86, unit: 'MM' }),
    [roles, layersObj, card]
  );

  // Slider / colour drag: ek frame mein ek form update (preview smooth, backend debounce waisa hi)
  const scheduleSides = useRafLatest((fn) => {
    h?.onLayersChange('FRONT', fn(getSideLayers(layersObj, 'FRONT')));
    if (layersObj && !backUsesFront(layersObj)) h?.onLayersChange('BACK', fn(getSideLayers(layersObj, 'BACK')));
  });
  const patchLayer = useRafMergedPatch((id, patch) => h?.onLayerUpdate(side, id, patch));

  if (!h) return null;

  /* ---------- Easy mode ---------- */

  const applyPalette = (base, mode, v) => {
    if (!HEX6.test(base)) return;
    const p = buildPalette(base, { mode, variant: v });
    // Purane colours bhi (purane presets + text readability) — poora card recolour
    onThemeChange({
      colors: {
        ...colors,
        primary: p.primary,
        secondary: p.secondary,
        accent: p.accent,
        background: p.surface,
        text: p.text,
        mutedText: p.mutedText,
        onPrimary: p.onPrimary,
        roles: p,
      },
    });
  };

  const chooseBrand = (hex) => {
    setBrand(hex);
    applyPalette(hex, paletteMode, variant);
  };

  const readLogoColours = async () => {
    setLogo({ status: 'loading', colors: [] });
    try {
      const found = await extractLogoColors(logoUrl);
      setLogo({ status: 'idle', colors: found });
      if (found[0]) chooseBrand(found[0]);
    } catch {
      // CORS / load fail: rang waise hi
      setLogo({ status: 'error', colors: [] });
    }
  };

  // Style slider: front aur (apna ho to) back dono — frame mein ek baar
  const applyToSides = scheduleSides;

  const resetToTheme = () => {
    // Easy mode ne purane colours bhi badle the → wo bhi preset jaise
    onThemeChange({ colors: {} });
    h.onResetThemeToPreset();
    setVariant(0);
    setSelectedId(null);
  };

  /* ---------- Advanced ---------- */

  const usesFront = side === 'BACK' && backUsesFront(layersObj);
  const addLayer = (type, layerPreset = null) => h.onLayerAdd(side, type, layerPreset);

  return (
    <>
      {(layersObj || colors.roles) && (
        <div className="pt-3">
          <PrintCheckChip warnings={printWarnings} />
        </div>
      )}

      {/* Step 2: Colours */}
      <section className={sectionClass}>
        <h3 className={titleClass}><Palette className="h-3.5 w-3.5 text-indigo-600" /> Brand colours</h3>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={HEX6.test(brand) ? brand : '#1E3A8A'}
            onChange={(e) => chooseBrand(e.target.value.toUpperCase())}
            className="h-9 w-10 shrink-0 cursor-pointer rounded-xl border border-slate-200 p-0.5"
            aria-label="Brand colour"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-slate-700">Brand colour</p>
            <p className="text-[10px] text-slate-500">The whole card recolours. Text stays readable.</p>
          </div>
        </div>
        {logoUrl && (
          <div className="space-y-1.5">
            <button type="button" className={`${smallButtonClass} w-full py-1.5`} disabled={logo.status === 'loading'} onClick={readLogoColours}>
              {logo.status === 'loading' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Pipette className="h-3 w-3" />} Use school logo colours
            </button>
            {logo.status === 'error' && (
              <p className="text-[11px] font-semibold text-amber-700">Couldn’t read logo colours. Your current colours are kept.</p>
            )}
            {logo.colors.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-slate-500">From logo:</span>
                {logo.colors.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => chooseBrand(hex)}
                    aria-pressed={brand === hex}
                    title={`Use ${hex} as brand colour`}
                    className={`h-6 w-6 rounded-full ring-1 ring-black/10 ${brand === hex ? 'outline-2 outline-offset-2 outline-indigo-500' : ''}`}
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        <div>
          <span className={labelClass}>Palette</span>
          <div className="flex flex-wrap gap-1">
            {THEME_PALETTE_MODE_VALUES.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setPaletteMode(mode);
                  applyPalette(brand, mode, variant);
                }}
                aria-pressed={paletteMode === mode}
                className={chipClass(paletteMode === mode)}
              >
                {THEME_PALETTE_MODE_LABELS[mode]}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                const next = variant + 1;
                setVariant(next);
                applyPalette(brand, paletteMode, next);
              }}
              className={`${chipClass(false)} inline-flex items-center gap-1`}
            >
              <Shuffle className="h-3 w-3" /> Shuffle
            </button>
          </div>
        </div>
        <div className="flex gap-1" aria-label="Current colours">
          {Object.entries(roles).map(([role, hex]) => (
            <span key={role} title={`${role}: ${hex}`} className="h-5 flex-1 rounded-md ring-1 ring-black/10" style={{ backgroundColor: hex }} />
          ))}
        </div>
      </section>

      {/* Step 3: Style (sirf layers wale theme par) */}
      {sideList.length > 0 && (
        <section className={sectionClass}>
          <h3 className={titleClass}><SlidersHorizontal className="h-3.5 w-3.5 text-indigo-600" /> Style</h3>
          <SliderField
            label="Background strength"
            value={Math.round(style.strength * 100)}
            min={5}
            max={100}
            suffix="%"
            onChange={(v) => applyToSides((list) => scaleLayerValues(list, () => true, 'opacity', v / 100, { min: 0, max: 1, fallback: 1 }))}
          />
          {style.hasCurves && (
            <SliderField
              label="Curve height"
              value={Math.round(style.curveHeight * 100)}
              min={0}
              max={100}
              suffix="%"
              onChange={(v) => applyToSides((list) => scaleLayerValues(list, isCurvyLayer, 'amplitude', v / 100, { min: 0, max: 1, fallback: 0.3 }))}
            />
          )}
          {style.hasPatterns && (
            <SliderField
              label="Pattern density"
              value={Math.round((1 - (style.patternSize - LIMITS.PATTERN_SIZE_MIN) / PATTERN_SPAN) * 100)}
              min={0}
              max={100}
              suffix="%"
              onChange={(v) =>
                applyToSides((list) =>
                  scaleLayerValues(list, isPatternLayer, 'size', LIMITS.PATTERN_SIZE_MIN + (1 - v / 100) * PATTERN_SPAN, {
                    min: LIMITS.PATTERN_SIZE_MIN,
                    max: LIMITS.PATTERN_SIZE_MAX,
                    fallback: 0.05,
                  })
                )
              }
            />
          )}
          <button type="button" className={smallButtonClass} onClick={resetToTheme}>
            <RotateCcw className="h-3 w-3" /> Reset to theme
          </button>
        </section>
      )}

      {/* Advanced */}
      <section className={sectionClass}>
        <SwitchField
          label={<span className="flex items-center gap-2"><Layers className="h-3.5 w-3.5 text-indigo-600" /> Customise layers</span>}
          checked={advanced}
          onChange={setAdvanced}
        />
        {advanced && (
          <div className="space-y-3">
            {side === 'BACK' && (
              <SwitchField
                label="Back uses front design"
                checked={usesFront}
                onChange={(on) => (on ? h.onLayersChange('BACK', null) : h.onCopyLayersToOtherSide('FRONT'))}
              />
            )}
            {usesFront && (
              <p className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-500">
                Showing the front layers. Editing them here gives the back its own copy.
              </p>
            )}

            <div className="flex items-center justify-between gap-2">
              <span className={subTitleClass}>{side === 'BACK' ? 'Back' : 'Front'} layers ({sideList.length}/{LIMITS.MAX_LAYERS})</span>
              <button type="button" className={smallButtonClass} disabled={sideList.length === 0} onClick={() => h.onCopyLayersToOtherSide(side)}>
                <Copy className="h-3 w-3" /> Copy to {otherSide === 'BACK' ? 'back' : 'front'}
              </button>
            </div>

            <LayerList
              layers={sideList}
              roles={roles}
              artworks={artworks}
              selectedId={selected?.id || null}
              onSelect={(id) => setSelectedId(id === selectedId ? null : id)}
              onUpdate={(id, patch) => h.onLayerUpdate(side, id, patch)}
              onMove={(id, delta) => h.onLayerMove(side, id, delta)}
              onDuplicate={(id) => h.onLayerDuplicate(side, id)}
              onRemove={(id) => {
                h.onLayerRemove(side, id);
                if (id === selectedId) setSelectedId(null);
              }}
            />
            <AddLayerMenu roles={roles} artworks={artworks} disabled={sideList.length >= LIMITS.MAX_LAYERS} onAdd={addLayer} />

            {selected && (
              <div className="space-y-2 rounded-xl border border-indigo-100 bg-white p-2.5">
                <p className={`rounded-lg px-2 py-1 text-[11px] font-bold ${activeGradientClass}`}>
                  {selected.name || THEME_LAYER_TYPE_LABELS[selected.type] || 'Layer'} settings
                </p>
                <LayerEditor
                  layer={selected}
                  roles={roles}
                  artworks={artworks}
                  onPatch={(patch) => patchLayer(selected.id, patch)}
                  onEditOnCard={onEditLayerOnCard ? () => onEditLayerOnCard(selected.id) : null}
                />
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
};

export default ThemeBuilderSection;

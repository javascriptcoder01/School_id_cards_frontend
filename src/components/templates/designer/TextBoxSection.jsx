// TextBoxSection.jsx — selected text field (jaise college name) ka box + effects:
// quick styles, background, border (style / sides / corners), padding, text outline, shadow, underline.
// field.textBox null = purana output. Lambai card units mein (preview + PDF dono yahi numbers lete hain).
import React from 'react';
import { RotateCcw, X } from 'lucide-react';
import {
  TEMPLATE_TEXT_BOX_BORDER_SIDES,
  TEMPLATE_TEXT_BOX_BORDER_STYLES,
  TEMPLATE_TEXT_BOX_DEFAULTS,
  TEMPLATE_TEXT_BOX_LIMITS,
  TEMPLATE_TEXT_DECORATIONS,
} from '../../../constants/template.js';
import { CollapsibleSection, HexColorField, SegmentedField, SliderField } from './designerControls.jsx';

const labelClass = 'block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1';
const smallButtonClass =
  'inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50';

const BORDER_STYLE_OPTIONS = [
  { key: TEMPLATE_TEXT_BOX_BORDER_STYLES.SOLID, text: 'Solid' },
  { key: TEMPLATE_TEXT_BOX_BORDER_STYLES.DASHED, text: 'Dashed' },
  { key: TEMPLATE_TEXT_BOX_BORDER_STYLES.DOTTED, text: 'Dotted' },
  { key: TEMPLATE_TEXT_BOX_BORDER_STYLES.DOUBLE, text: 'Double' },
];
const BORDER_SIDE_OPTIONS = [
  { key: TEMPLATE_TEXT_BOX_BORDER_SIDES.ALL, text: 'All sides' },
  { key: TEMPLATE_TEXT_BOX_BORDER_SIDES.TOP_BOTTOM, text: 'Top + bottom' },
  { key: TEMPLATE_TEXT_BOX_BORDER_SIDES.BOTTOM, text: 'Bottom' },
  { key: TEMPLATE_TEXT_BOX_BORDER_SIDES.TOP, text: 'Top' },
  { key: TEMPLATE_TEXT_BOX_BORDER_SIDES.LEFT_RIGHT, text: 'Left + right' },
  { key: TEMPLATE_TEXT_BOX_BORDER_SIDES.LEFT, text: 'Left' },
  { key: TEMPLATE_TEXT_BOX_BORDER_SIDES.RIGHT, text: 'Right' },
];
const DECORATION_OPTIONS = [
  { key: TEMPLATE_TEXT_DECORATIONS.NONE, text: 'None' },
  { key: TEMPLATE_TEXT_DECORATIONS.UNDERLINE, text: 'Underline' },
  { key: TEMPLATE_TEXT_DECORATIONS.LINE_THROUGH, text: 'Strike' },
];

// 1 "step" ≈ 1px ek 325px chaude card par; MM / bade PX card par usi anupaat mein
const stepFor = (cardWidth) => Math.max(cardWidth / 325, 0.05);
const round1 = (value) => Math.round(value * 10) / 10;

/**
 * Quick styles: sirf textBox (aur Banner par text ka rang) set karte hain; baad mein har control badal sakte hain.
 * @returns {Array<{ key: string, text: string, build: (field: object, s: number) => object }>}
 */
const QUICK_STYLES = [
  {
    key: 'BANNER',
    text: 'Banner',
    build: (field, s) => ({
      color: '#FFFFFF',
      textBox: { ...TEMPLATE_TEXT_BOX_DEFAULTS, backgroundColor: field.color && field.color.toUpperCase() !== '#FFFFFF' ? field.color : '#1E3A8A', borderRadius: round1(2 * s), padding: round1(2 * s) },
    }),
  },
  {
    key: 'OUTLINE_BOX',
    text: 'Bordered',
    build: (field, s) => ({
      textBox: { ...TEMPLATE_TEXT_BOX_DEFAULTS, borderWidth: round1(1 * s), borderColor: field.color || '#1E3A8A', borderRadius: round1(2 * s), padding: round1(2 * s) },
    }),
  },
  {
    key: 'DOUBLE_FRAME',
    text: 'Double frame',
    build: (field, s) => ({
      textBox: { ...TEMPLATE_TEXT_BOX_DEFAULTS, borderWidth: round1(3 * s), borderStyle: TEMPLATE_TEXT_BOX_BORDER_STYLES.DOUBLE, borderColor: field.color || '#1E3A8A', padding: round1(2.5 * s) },
    }),
  },
  {
    key: 'PILL',
    text: 'Pill',
    build: (field, s) => ({
      textBox: { ...TEMPLATE_TEXT_BOX_DEFAULTS, backgroundColor: '#EEF2FF', borderWidth: round1(1 * s), borderColor: field.color || '#1E3A8A', borderRadius: TEMPLATE_TEXT_BOX_LIMITS.BORDER_RADIUS_MAX, padding: round1(2 * s) },
    }),
  },
  {
    key: 'RULES',
    text: 'Top + bottom lines',
    build: (field, s) => ({
      textBox: { ...TEMPLATE_TEXT_BOX_DEFAULTS, borderWidth: round1(1.5 * s), borderSides: TEMPLATE_TEXT_BOX_BORDER_SIDES.TOP_BOTTOM, borderColor: field.color || '#1E3A8A', padding: round1(1.5 * s) },
    }),
  },
  {
    key: 'UNDERLINE_BAR',
    text: 'Underline bar',
    build: (field, s) => ({
      textBox: { ...TEMPLATE_TEXT_BOX_DEFAULTS, borderWidth: round1(2 * s), borderSides: TEMPLATE_TEXT_BOX_BORDER_SIDES.BOTTOM, borderColor: field.color || '#1E3A8A', padding: round1(1 * s) },
    }),
  },
  {
    key: 'SHADOW',
    text: 'Shadow',
    build: (field, s) => ({
      textBox: { ...TEMPLATE_TEXT_BOX_DEFAULTS, shadowColor: '#94A3B8', shadowX: round1(0.8 * s), shadowY: round1(0.8 * s) },
    }),
  },
  {
    key: 'OUTLINED_TEXT',
    text: 'Outlined text',
    build: (field, s) => ({
      textBox: { ...TEMPLATE_TEXT_BOX_DEFAULTS, strokeWidth: round1(0.4 * s), strokeColor: '#0F172A' },
    }),
  },
];

// Optional rang: picker + "None"
const OptionalColor = ({ label, value, fallback, onChange }) => (
  <div className="flex items-end gap-1.5">
    <div className="min-w-0 flex-1">
      <HexColorField label={label} value={value || ''} fallback={fallback} onChange={onChange} />
    </div>
    {value && (
      <button
        type="button"
        onClick={() => onChange(null)}
        title={`Remove ${label.toLowerCase()}`}
        aria-label={`Remove ${label.toLowerCase()}`}
        className="h-8.5 shrink-0 rounded-xl border border-slate-200 px-2 text-slate-500 hover:bg-slate-50"
      >
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
);

/**
 * @param {object} props
 * @param {object} props.field - draft field
 * @param {number} props.cardWidth - card units
 * @param {string} props.unitLabel - mm / px
 * @param {(patch: object) => void} props.onSet
 */
export const TextBoxSection = ({ field, cardWidth, unitLabel, onSet }) => {
  const box = { ...TEMPLATE_TEXT_BOX_DEFAULTS, ...(field.textBox || {}) };
  const s = stepFor(cardWidth);
  const fine = round1(Math.max(s / 10, 0.05));
  const textColor = field.color || '#000000';

  const set = (patch) => {
    const next = { ...box, ...patch };
    // Border ki moti line di aur rang nahi → text ka rang (warna kuch nahi dikhta)
    if (patch.borderWidth > 0 && !next.borderColor) next.borderColor = textColor;
    if (patch.strokeWidth > 0 && !next.strokeColor) next.strokeColor = '#FFFFFF';
    if ((patch.shadowX || patch.shadowY) && !next.shadowColor) next.shadowColor = '#94A3B8';
    onSet({ textBox: next });
  };

  const maxBorder = round1(Math.min(TEMPLATE_TEXT_BOX_LIMITS.BORDER_WIDTH_MAX, 6 * s));
  const maxPadding = round1(Math.min(TEMPLATE_TEXT_BOX_LIMITS.PADDING_MAX, 12 * s));
  const maxRadius = round1(Math.min(TEMPLATE_TEXT_BOX_LIMITS.BORDER_RADIUS_MAX, 30 * s));
  const maxStroke = round1(Math.min(TEMPLATE_TEXT_BOX_LIMITS.STROKE_WIDTH_MAX, 3 * s));
  const maxShadow = round1(Math.min(TEMPLATE_TEXT_BOX_LIMITS.SHADOW_OFFSET_MAX, 6 * s));
  const hasBorder = box.borderWidth > 0;

  return (
    <CollapsibleSection title="Text box & effects" defaultOpen={field.field === 'collegeName' || Boolean(field.textBox)}>
      <div>
        <p className={labelClass}>Quick styles</p>
        <div className="grid grid-cols-2 gap-1">
          {QUICK_STYLES.map((style) => (
            <button key={style.key} type="button" onClick={() => onSet(style.build(field, s))} className={smallButtonClass}>
              {style.text}
            </button>
          ))}
        </div>
      </div>

      <OptionalColor label="Background" value={box.backgroundColor} fallback="#EEF2FF" onChange={(backgroundColor) => set({ backgroundColor })} />
      {box.backgroundColor && (
        <SliderField
          label="Background opacity"
          value={Math.round(box.backgroundOpacity * 100)}
          min={0}
          max={100}
          suffix="%"
          onChange={(v) => set({ backgroundOpacity: v / 100 })}
        />
      )}

      <SliderField label={`Border width (${unitLabel})`} value={round1(box.borderWidth)} min={0} max={maxBorder} step={fine} onChange={(borderWidth) => set({ borderWidth })} />
      {hasBorder && (
        <>
          <HexColorField label="Border colour" value={box.borderColor || ''} fallback={textColor} onChange={(borderColor) => set({ borderColor })} />
          <SegmentedField label="Border style" options={BORDER_STYLE_OPTIONS} value={box.borderStyle} onChange={(borderStyle) => set({ borderStyle })} />
          <div>
            <label className={labelClass} htmlFor="text-box-sides">Border sides</label>
            <select
              id="text-box-sides"
              value={box.borderSides}
              onChange={(e) => set({ borderSides: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              {BORDER_SIDE_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>{option.text}</option>
              ))}
            </select>
          </div>
        </>
      )}
      <SliderField label={`Corner radius (${unitLabel})`} value={round1(Math.min(box.borderRadius, maxRadius))} min={0} max={maxRadius} step={fine} onChange={(borderRadius) => set({ borderRadius })} />
      <SliderField label={`Padding (${unitLabel})`} value={round1(box.padding)} min={0} max={maxPadding} step={fine} onChange={(padding) => set({ padding })} />

      <SliderField label={`Text outline (${unitLabel})`} value={round1(box.strokeWidth)} min={0} max={maxStroke} step={fine} onChange={(strokeWidth) => set({ strokeWidth })} />
      {box.strokeWidth > 0 && (
        <HexColorField label="Outline colour" value={box.strokeColor || ''} fallback="#FFFFFF" onChange={(strokeColor) => set({ strokeColor })} />
      )}

      <div className="grid grid-cols-2 gap-3">
        <SliderField label={`Shadow X (${unitLabel})`} value={round1(box.shadowX)} min={-maxShadow} max={maxShadow} step={fine} onChange={(shadowX) => set({ shadowX })} />
        <SliderField label={`Shadow Y (${unitLabel})`} value={round1(box.shadowY)} min={-maxShadow} max={maxShadow} step={fine} onChange={(shadowY) => set({ shadowY })} />
      </div>
      {(box.shadowX !== 0 || box.shadowY !== 0) && (
        <HexColorField label="Shadow colour" value={box.shadowColor || ''} fallback="#94A3B8" onChange={(shadowColor) => set({ shadowColor })} />
      )}

      <SegmentedField label="Line" options={DECORATION_OPTIONS} value={box.decoration} onChange={(decoration) => set({ decoration })} />

      {!field.width && (box.backgroundColor || hasBorder) && (
        <p className="text-[11px] text-amber-700">The box reaches the card edge. Set a box width above to fit it to the text.</p>
      )}
      {field.textBox && (
        <button type="button" onClick={() => onSet({ textBox: null })} className={smallButtonClass}>
          <RotateCcw className="h-3.5 w-3.5" /> Remove box & effects
        </button>
      )}
    </CollapsibleSection>
  );
};

export default TextBoxSection;

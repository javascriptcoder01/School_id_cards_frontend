// ImageLayerStyleSections.jsx — selected image layer: quick size + fit, frame (shape, border, padding, background), flip
import React from 'react';
import { Circle, FlipHorizontal2, FlipVertical2, Maximize, Pill, RectangleHorizontal, RotateCcw, Square, Squircle } from 'lucide-react';
import {
  TEMPLATE_BORDER_STYLES,
  TEMPLATE_IMAGE_BORDER_WIDTH_MAX,
  TEMPLATE_IMAGE_DEFAULT_BORDER_COLOR,
  TEMPLATE_IMAGE_FITS,
  TEMPLATE_IMAGE_SHAPES,
  TEMPLATE_IMAGE_STYLE_DEFAULTS,
  TEMPLATE_UNITS,
} from '../../../constants/template.js';
import { round2, toNumber } from '../../../utils/templateLayout.js';
import { imageLayerStyleOf, maxLayerPadding } from '../../../utils/templateDesigner.js';
import { CollapsibleSection, HexColorField, SegmentedField, SliderField, SwitchField } from './designerControls.jsx';

const QUICK_STEP = 1.15;

const FIT_OPTIONS = [
  { key: TEMPLATE_IMAGE_FITS.CONTAIN, text: 'Contain' },
  { key: TEMPLATE_IMAGE_FITS.COVER, text: 'Cover' },
  { key: TEMPLATE_IMAGE_FITS.STRETCH, text: 'Stretch' },
];

const SHAPE_OPTIONS = [
  { key: TEMPLATE_IMAGE_SHAPES.RECTANGLE, text: 'Rect', icon: RectangleHorizontal },
  { key: TEMPLATE_IMAGE_SHAPES.ROUNDED, text: 'Rounded', icon: Squircle },
  { key: TEMPLATE_IMAGE_SHAPES.CIRCLE, text: 'Circle', icon: Circle },
  { key: TEMPLATE_IMAGE_SHAPES.PILL, text: 'Pill', icon: Pill },
];

const BORDER_STYLE_OPTIONS = [
  { key: TEMPLATE_BORDER_STYLES.SOLID, text: 'Solid' },
  { key: TEMPLATE_BORDER_STYLES.DASHED, text: 'Dashed' },
  { key: TEMPLATE_BORDER_STYLES.DOTTED, text: 'Dotted' },
];

const quickButtonClass =
  'inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50';

/**
 * Size section ke andar: Wider / Taller / Square + Fit
 */
export const ImageLayerSizeControls = ({ layer, cardWidth, cardHeight, onChange }) => {
  const style = imageLayerStyleOf(layer);
  const w = toNumber(layer.width);
  const h = toNumber(layer.height);
  const roomW = cardWidth - toNumber(layer.x);
  const roomH = cardHeight - toNumber(layer.y);

  return (
    <>
      <div className="flex gap-1.5">
        <button type="button" onClick={() => onChange({ width: round2(Math.min(w * QUICK_STEP, roomW)) })} className={quickButtonClass}>
          <RectangleHorizontal className="h-3.5 w-3.5" /> Wider
        </button>
        <button type="button" onClick={() => onChange({ height: round2(Math.min(h * QUICK_STEP, roomH)) })} className={quickButtonClass}>
          <Maximize className="h-3.5 w-3.5" /> Taller
        </button>
        <button
          type="button"
          onClick={() => {
            const side = round2(Math.min(w, h));
            onChange({ width: side, height: side });
          }}
          className={quickButtonClass}
        >
          <Square className="h-3.5 w-3.5" /> Square
        </button>
      </div>
      <SegmentedField label="Fit" options={FIT_OPTIONS} value={style.fit} onChange={(fit) => onChange({ fit })} />
    </>
  );
};

/**
 * Frame section: shape, radius, border, padding, background
 */
export const ImageLayerFrameSection = ({ layer, unit, onChange }) => {
  const style = imageLayerStyleOf(layer);
  const w = toNumber(layer.width);
  const h = toNumber(layer.height);
  const smaller = Math.max(Math.min(w, h), 0);
  const isMm = unit === TEMPLATE_UNITS.MM;
  const step = isMm ? 0.1 : 1;
  const hasBackground = Boolean(style.backgroundColor);

  // Border bina rang ke banta nahi: width badhate hi default rang
  const setBorderWidth = (borderWidth) =>
    onChange({
      borderWidth,
      ...(borderWidth > 0 && !style.borderColor ? { borderColor: TEMPLATE_IMAGE_DEFAULT_BORDER_COLOR } : {}),
    });

  return (
    <CollapsibleSection title="Frame">
      <SegmentedField label="Shape" options={SHAPE_OPTIONS} value={style.shape} onChange={(shape) => onChange({ shape })} />
      {style.shape === TEMPLATE_IMAGE_SHAPES.ROUNDED && (
        <SliderField
          label="Corner radius"
          value={style.borderRadius}
          min={0}
          max={round2(smaller / 2)}
          step={step}
          onChange={(borderRadius) => onChange({ borderRadius })}
        />
      )}
      <SliderField
        label="Border width"
        value={style.borderWidth}
        min={0}
        max={round2(Math.min(smaller / 4, TEMPLATE_IMAGE_BORDER_WIDTH_MAX))}
        step={step}
        onChange={setBorderWidth}
      />
      {style.borderWidth > 0 && (
        <>
          <HexColorField
            label="Border colour"
            value={style.borderColor}
            fallback={TEMPLATE_IMAGE_DEFAULT_BORDER_COLOR}
            onChange={(borderColor) => onChange({ borderColor })}
          />
          <SegmentedField
            label="Border style"
            options={BORDER_STYLE_OPTIONS}
            value={style.borderStyle}
            onChange={(borderStyle) => onChange({ borderStyle })}
          />
        </>
      )}
      <SliderField
        label="Padding"
        value={style.padding}
        min={0}
        max={maxLayerPadding(layer)}
        step={step}
        onChange={(padding) => onChange({ padding })}
      />
      <SwitchField
        label="Background colour"
        checked={hasBackground}
        onChange={(on) => onChange({ backgroundColor: on ? '#FFFFFF' : null })}
      />
      {hasBackground && (
        <HexColorField
          label="Background"
          value={style.backgroundColor}
          fallback="#FFFFFF"
          onChange={(backgroundColor) => onChange({ backgroundColor })}
        />
      )}
    </CollapsibleSection>
  );
};

/**
 * Transform section ke andar: Flip H / Flip V
 */
export const ImageLayerFlipControls = ({ layer, onChange }) => {
  const style = imageLayerStyleOf(layer);
  const flipClass = (active) =>
    `${quickButtonClass} ${active ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : ''}`;

  return (
    <div className="flex gap-1.5">
      <button type="button" aria-pressed={style.flipX} onClick={() => onChange({ flipX: !style.flipX })} className={flipClass(style.flipX)}>
        <FlipHorizontal2 className="h-3.5 w-3.5" /> Flip H
      </button>
      <button type="button" aria-pressed={style.flipY} onClick={() => onChange({ flipY: !style.flipY })} className={flipClass(style.flipY)}>
        <FlipVertical2 className="h-3.5 w-3.5" /> Flip V
      </button>
    </div>
  );
};

export const ResetImageStyleButton = ({ onChange }) => (
  <button
    type="button"
    onClick={() => onChange({ ...TEMPLATE_IMAGE_STYLE_DEFAULTS })}
    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
  >
    <RotateCcw className="h-3.5 w-3.5" /> Reset style
  </button>
);

// BackgroundRemovalSection.jsx — selected image layer: kagaz ka rang hatao (Cloudinary delivery URL, original nahi badalti).
// Har badlav existing debounced preview-render se jaata hai; After image wahi se aati hai.
import React, { useRef, useState } from 'react';
import { AlertTriangle, Copy, Loader2, Pipette, RotateCcw } from 'lucide-react';
import {
  BG_REMOVAL_DEFAULTS,
  BG_REMOVAL_INK_SWATCHES,
  BG_REMOVAL_NOT_APPLICABLE_MESSAGE,
  BG_REMOVAL_PRESETS,
  isCloudinaryUploadUrl,
  presetSettings,
} from '../../../constants/imageProcessing.js';
import { CollapsibleSection, HexColorField, SegmentedField, SliderField, SwitchField } from './designerControls.jsx';

const CUSTOM_PRESET = 'CUSTOM';
const VIEWS = [
  { key: 'BEFORE', text: 'Before' },
  { key: 'AFTER', text: 'After' },
];
const CHECKERBOARD = {
  backgroundImage: 'conic-gradient(#CBD5E1 25%, #FFFFFF 0 50%, #CBD5E1 0 75%, #FFFFFF 0)',
  backgroundSize: '16px 16px',
};

const smallButtonClass =
  'inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50';


/**
 * @param {object} props
 * @param {object} props.layer - draft layer
 * @param {object} [props.renderLayer] - usi layer ka render data (source, originalSource, processing)
 * @param {boolean} [props.previewLoading]
 * @param {(patch: object) => void} props.onChange
 * @param {(settings: object) => void} [props.onApplyToAll]
 */
export const BackgroundRemovalSection = ({ layer, renderLayer, previewLoading = false, onChange, onApplyToAll }) => {
  const settings = { ...BG_REMOVAL_DEFAULTS, ...(layer.imageProcessing || {}) };
  const originalUrl = renderLayer?.originalSource || renderLayer?.source || layer.url || null;
  const applied = renderLayer?.processing?.applied === true;
  const processedUrl = applied ? renderLayer.source : null;
  // Render data ka reason; usse pehle bhi pata ho sakta hai (URL se)
  const reason = renderLayer?.processing?.reason
    || (originalUrl && !isCloudinaryUploadUrl(originalUrl) ? BG_REMOVAL_NOT_APPLICABLE_MESSAGE : null);

  const [view, setView] = useState('AFTER');
  const [loadError, setLoadError] = useState(false);
  const lastGoodRef = useRef(null);
  const canPick = typeof window !== 'undefined' && 'EyeDropper' in window;

  const shownUrl = view === 'AFTER' && settings.enabled && processedUrl ? processedUrl : originalUrl;
  // Kaun sa URL load ho chuka: naya URL aate hi spinner, purana "loaded" us par nahi lagta
  const [settledUrl, setSettledUrl] = useState(null);
  const imageLoading = Boolean(shownUrl) && settledUrl !== shownUrl;

  const save = (next) => {
    setLoadError(false);
    onChange({ imageProcessing: next });
  };
  // Koi bhi control badla = Custom
  const setControl = (patch) => save({ ...settings, ...patch, preset: null });

  const pickPreset = (key) => {
    if (key === CUSTOM_PRESET) {
      save({ ...settings, preset: null });
      return;
    }
    save({ ...settings, ...presetSettings(key), enabled: true, preset: key });
  };

  const pickFromImage = async () => {
    try {
      const { sRGBHex } = await new window.EyeDropper().open();
      setControl({ removeColor: sRGBHex.toUpperCase() });
    } catch {
      // User ne Esc dabaya: kuch nahi
    }
  };

  const onImageLoad = () => {
    setSettledUrl(shownUrl);
    if (shownUrl === processedUrl) lastGoodRef.current = settings;
  };

  const onImageError = () => {
    setSettledUrl(shownUrl);
    if (shownUrl !== processedUrl) return;
    setLoadError(true);
    // Purani chalti hui setting wapas, taaki card khaali na chhape
    if (lastGoodRef.current) onChange({ imageProcessing: lastGoodRef.current });
  };

  const presetOptions = [
    ...Object.entries(BG_REMOVAL_PRESETS).map(([key, value]) => ({ key, text: value.label })),
    { key: CUSTOM_PRESET, text: 'Custom' },
  ];
  const activePreset = settings.preset || CUSTOM_PRESET;
  const hasInk = Boolean(settings.inkColor);
  const busy = imageLoading || (previewLoading && settings.enabled);

  return (
    <CollapsibleSection title="Background removal" defaultOpen={layer.type === 'SIGNATURE' || layer.type === 'STAMP'}>
      <SwitchField
        label="Remove background"
        checked={settings.enabled}
        disabled={Boolean(reason)}
        onChange={(enabled) => save({ ...settings, enabled })}
      />
      {reason && <p className="text-[11px] text-amber-700">{reason}</p>}

      {settings.enabled && !reason && (
        <>
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Preset</p>
            <div className="grid grid-cols-2 gap-1">
              {presetOptions.map(({ key, text }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => pickPreset(key)}
                  aria-pressed={activePreset === key}
                  className={`rounded-lg border px-2 py-1.5 text-[11px] font-semibold ${activePreset === key ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {text}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end gap-1.5">
            <div className="min-w-0 flex-1">
              <HexColorField
                label="Remove colour"
                value={settings.removeColor}
                fallback="#FFFFFF"
                onChange={(removeColor) => setControl({ removeColor })}
              />
            </div>
            {canPick && (
              <button
                type="button"
                onClick={pickFromImage}
                title="Pick from image"
                aria-label="Pick from image"
                className="h-8.5 shrink-0 rounded-xl border border-slate-200 px-2 text-slate-600 hover:bg-slate-50"
              >
                <Pipette className="h-4 w-4" />
              </button>
            )}
          </div>

          <SliderField label="Tolerance" value={settings.tolerance} min={0} max={100} onChange={(tolerance) => setControl({ tolerance })} />
          <SwitchField label="Trim empty space" checked={settings.trim} onChange={(trim) => setControl({ trim })} />

          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Ink colour</p>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setControl({ inkColor: null, inkStrength: 0 })}
                aria-pressed={!hasInk}
                className={`rounded-lg border px-2 py-1 text-[11px] font-semibold ${!hasInk ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600'}`}
              >
                None
              </button>
              {BG_REMOVAL_INK_SWATCHES.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setControl({ inkColor: color, inkStrength: settings.inkStrength || 60 })}
                  aria-label={`Ink colour ${color}`}
                  aria-pressed={settings.inkColor === color}
                  className={`h-6 w-6 rounded-full ring-offset-1 ${settings.inkColor === color ? 'ring-2 ring-indigo-500' : 'ring-1 ring-slate-200'}`}
                  style={{ background: color }}
                />
              ))}
            </div>
          </div>
          {hasInk && (
            <>
              <HexColorField label="Ink hex" value={settings.inkColor} fallback="#1A237E" onChange={(inkColor) => setControl({ inkColor })} />
              <SliderField label="Ink strength" value={settings.inkStrength} min={0} max={100} onChange={(inkStrength) => setControl({ inkStrength })} />
            </>
          )}
          <SliderField label="Contrast" value={settings.contrast} min={-100} max={100} onChange={(contrast) => setControl({ contrast })} />
          <SliderField label="Sharpen" value={settings.sharpen} min={0} max={400} step={10} onChange={(sharpen) => setControl({ sharpen })} />
        </>
      )}

      {originalUrl && settings.enabled && !reason && (
        <>
          <SegmentedField label="Preview" options={VIEWS} value={view} onChange={setView} />
          <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-xl border border-slate-200" style={CHECKERBOARD}>
            {shownUrl && (
              <img
                key={shownUrl}
                src={shownUrl}
                alt={view === 'AFTER' ? 'After background removal' : 'Original image'}
                onLoad={onImageLoad}
                onError={onImageError}
                className="max-h-full max-w-full object-contain p-1"
              />
            )}
            {busy && (
              <span className="absolute inset-0 grid place-items-center bg-white/60" role="status" aria-label="Processing image">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
              </span>
            )}
          </div>
          {loadError && (
            <p className="flex items-start gap-1 text-[11px] text-rose-700" role="alert">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              Could not process this image with these settings
            </p>
          )}
        </>
      )}

      <div className="flex gap-1.5">
        {onApplyToAll && settings.enabled && !reason && (
          <button type="button" onClick={() => onApplyToAll(settings)} className={smallButtonClass}>
            <Copy className="h-3.5 w-3.5" /> Apply to all signatures and stamps
          </button>
        )}
        <button type="button" onClick={() => save(null)} className={smallButtonClass}>
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>
    </CollapsibleSection>
  );
};

export default BackgroundRemovalSection;

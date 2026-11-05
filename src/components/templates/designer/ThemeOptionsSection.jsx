// ThemeOptionsSection.jsx — header size, pattern, inner frame, text colour, card corners, shuffle, logo colours.
// Sirf choices; shapes aur asli contrast backend preview sambhalta hai.
import React, { useState } from 'react';
import { Loader2, Palette, Shuffle, SlidersHorizontal, Wand2 } from 'lucide-react';
import { HexColorField, SegmentedField, SliderField, SwitchField } from './designerControls.jsx';
import { readLogoPalette, shuffleOptions } from '../../../utils/themeColors.js';

const HEADER_DEFAULT = 0.2;
const PATTERN_DEFAULT = 0.2;
const FRAME_WIDTH_DEFAULT = 1;

const TEXT_MODES = [
  { key: 'AUTO', text: 'Auto' },
  { key: 'CUSTOM', text: 'Custom' },
];
const CORNERS = [
  { key: 'SQUARE', text: 'Square' },
  { key: 'ROUNDED', text: 'Rounded' },
];

const actionClass =
  'inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50';

const ResetLink = ({ onClick }) => (
  <button type="button" onClick={onClick} className="text-[11px] font-semibold text-slate-500 hover:text-slate-700">Reset</button>
);

/**
 * @param {object} props
 * @param {object} props.theme - formData.theme
 * @param {object|null} props.preset - chuni hui theme (colors, options)
 * @param {string|null} props.decoration - active side ki decoration style
 * @param {string[]} [props.headerSizeStyles]
 * @param {string[]} [props.patternStyles]
 * @param {string|null} [props.logoUrl]
 * @param {(patch: object) => void} props.onThemeChange
 */
export const ThemeOptionsSection = ({ theme = {}, preset, decoration, headerSizeStyles = [], patternStyles = [], logoUrl = null, onThemeChange }) => {
  const [shuffleStep, setShuffleStep] = useState(0);
  const [logoBusy, setLogoBusy] = useState(false);
  const [logoError, setLogoError] = useState(null);

  const options = theme.options || {};
  const frame = options.frame || {};
  const presetFrame = preset?.options?.frame || {};
  const frameEnabled = frame.enabled ?? presetFrame.enabled ?? false;
  const frameWidth = frame.width ?? presetFrame.width ?? FRAME_WIDTH_DEFAULT;
  const colors = theme.colors || {};

  const setOptions = (patch) => onThemeChange({ options: { ...options, ...patch } });
  const setFrame = (patch) => setOptions({ frame: { ...frame, ...patch } });

  const headerWorks = headerSizeStyles.includes(decoration);
  const patternWorks = patternStyles.includes(decoration);

  const palette = preset?.colors;
  const variations = palette?.primary && palette?.secondary && palette?.accent ? shuffleOptions(palette) : [];

  const shuffle = () => {
    onThemeChange({ colors: { ...colors, ...variations[shuffleStep % variations.length] } });
    setShuffleStep((step) => step + 1);
  };

  const matchLogo = async () => {
    setLogoBusy(true);
    setLogoError(null);
    try {
      const picked = await readLogoPalette(logoUrl);
      onThemeChange({
        colors: { ...colors, ...picked, text: null, mutedText: null },
        options: { ...options, textColorMode: 'AUTO' },
      });
    } catch {
      setLogoError('Could not read logo colours');
    } finally {
      setLogoBusy(false);
    }
  };

  return (
    <section className="space-y-3 pt-4 border-t border-slate-100 first:border-t-0 first:pt-0">
      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
        <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-600" /> Theme options
      </h3>

      <div className="flex gap-1.5">
        <button type="button" onClick={shuffle} disabled={variations.length === 0} className={actionClass}>
          <Shuffle className="h-3.5 w-3.5" /> Shuffle colours
        </button>
        <button type="button" onClick={matchLogo} disabled={!logoUrl || logoBusy} className={actionClass} title={logoUrl ? undefined : 'Upload a school logo first'}>
          {logoBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />} Match my logo colours
        </button>
      </div>
      {logoError && (
        <p className="flex items-center gap-1 text-[11px] text-rose-700" role="alert"><Palette className="h-3 w-3" /> {logoError}</p>
      )}

      <div>
        <SliderField
          label="Header size"
          value={options.headerSize ?? HEADER_DEFAULT}
          min={0.1}
          max={0.35}
          step={0.01}
          disabled={!headerWorks}
          onChange={(headerSize) => setOptions({ headerSize })}
        />
        {!headerWorks && <p className="text-[11px] text-slate-400">This decoration has no header.</p>}
        {options.headerSize != null && <ResetLink onClick={() => setOptions({ headerSize: null })} />}
      </div>

      <div>
        <SliderField
          label="Pattern intensity"
          value={options.patternOpacity ?? PATTERN_DEFAULT}
          min={0}
          max={1}
          step={0.05}
          disabled={!patternWorks}
          onChange={(patternOpacity) => setOptions({ patternOpacity })}
        />
        {!patternWorks && <p className="text-[11px] text-slate-400">This decoration has no pattern.</p>}
        {options.patternOpacity != null && <ResetLink onClick={() => setOptions({ patternOpacity: null })} />}
      </div>

      <SwitchField label="Inner frame" checked={frameEnabled} onChange={(enabled) => setFrame({ enabled })} />
      {frameEnabled && (
        <>
          <HexColorField
            label="Frame colour"
            value={frame.color || presetFrame.color || null}
            fallback={palette?.accent || '#000000'}
            onChange={(color) => setFrame({ color })}
          />
          <SliderField
            label="Frame width"
            value={frameWidth}
            min={0.1}
            max={5}
            step={0.1}
            suffix="%"
            onChange={(width) => setFrame({ width })}
          />
        </>
      )}

      <SegmentedField
        label="Text colour"
        options={TEXT_MODES}
        value={options.textColorMode || 'CUSTOM'}
        onChange={(textColorMode) => setOptions({ textColorMode })}
      />
      <SegmentedField
        label="Card corners (preview only)"
        options={CORNERS}
        value={options.cornerStyle || 'SQUARE'}
        onChange={(cornerStyle) => setOptions({ cornerStyle })}
      />
      <p className="text-[11px] text-slate-400">Cards always print with square corners.</p>
    </section>
  );
};

export default ThemeOptionsSection;

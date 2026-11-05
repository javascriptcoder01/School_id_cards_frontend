// designerControls.jsx — designer panels ke chhote controls (collapsible section, slider, rang, segmented, switch)
import React from 'react';
import { ChevronDown } from 'lucide-react';

const labelClass = 'block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1';
const hexInputClass =
  'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white';

// Band / khula section (browser ka details, keyboard apne aap chalta hai)
export const CollapsibleSection = ({ title, defaultOpen = true, children }) => (
  <details open={defaultOpen} className="group border-t border-slate-100 pt-3">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-xs font-bold text-slate-700 [&::-webkit-details-marker]:hidden">
      {title}
      <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
    </summary>
    <div className="mt-3 space-y-3">{children}</div>
  </details>
);

export const SliderField = ({ label, value, min, max, step = 1, suffix = '', disabled = false, onChange }) => (
  <div>
    <label className={labelClass}>{label}: {value}{suffix}</label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={Math.min(Math.max(value, min), max)}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-indigo-600 disabled:opacity-40"
      aria-label={label}
    />
  </div>
);

// Rang: picker + hex. Galat hex type ho raha ho to bhejte nahi, taaki backend 400 na de.
export const HexColorField = ({ label, value, fallback = '#000000', disabled = false, onChange }) => {
  const [draft, setDraft] = React.useState(value || '');
  const [seenValue, setSeenValue] = React.useState(value);
  if (value !== seenValue) {
    setSeenValue(value);
    setDraft(value || '');
  }

  const commit = (next) => {
    setDraft(next);
    if (/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(next)) onChange(next);
  };

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(value || '') ? value : fallback}
          disabled={disabled}
          onChange={(e) => commit(e.target.value)}
          className="h-8.5 w-9 shrink-0 cursor-pointer rounded-xl border border-slate-200 p-0.5 disabled:opacity-40"
          aria-label={`${label} picker`}
        />
        <input
          type="text"
          maxLength={7}
          value={draft}
          placeholder={fallback}
          disabled={disabled}
          onChange={(e) => commit(e.target.value)}
          className={hexInputClass}
          aria-label={`${label} hex`}
        />
      </div>
    </div>
  );
};

/**
 * @param {object} props
 * @param {string} props.label
 * @param {Array<{ key: string, text: string, icon?: React.ComponentType }>} props.options
 * @param {string} props.value
 * @param {(key: string) => void} props.onChange
 */
export const SegmentedField = ({ label, options, value, onChange }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <div className="flex gap-1 rounded-xl bg-slate-100 p-1" role="group" aria-label={label}>
      {options.map(({ key, text, icon: Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-pressed={value === key}
          className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[11px] font-semibold ${value === key ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          {Icon && <Icon className="h-3.5 w-3.5" />}
          <span className="truncate">{text}</span>
        </button>
      ))}
    </div>
  </div>
);

export const SwitchField = ({ label, checked, disabled = false, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className="flex w-full items-center justify-between gap-2 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {label}
    <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-slate-300'}`}>
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${checked ? 'left-4.5' : 'left-0.5'}`} />
    </span>
  </button>
);

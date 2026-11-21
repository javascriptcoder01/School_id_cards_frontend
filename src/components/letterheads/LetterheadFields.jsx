// LetterheadFields.jsx — Letterhead Studio ke chhote form pieces (compact, 390 px par bhi theek).
import React from 'react';

export const Section = ({ title, icon: Icon, children, actions = null }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs sm:p-4">
    <div className="mb-3 flex items-center justify-between gap-2">
      <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
        {Icon && (
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 text-white">
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
        {title}
      </h3>
      {actions}
    </div>
    <div className="space-y-3">{children}</div>
  </section>
);

export const Field = ({ label, hint, error, children, htmlFor }) => (
  <div className="min-w-0">
    {label && (
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-bold text-slate-700">
        {label}
      </label>
    )}
    {children}
    {error ? <p className="mt-1 text-[11px] font-semibold text-rose-600">{error}</p> : hint ? <p className="mt-1 text-[11px] text-slate-500">{hint}</p> : null}
  </div>
);

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50';

export const TextInput = ({ id, value, onChange, placeholder, maxLength, type = 'text', ...rest }) => (
  <input
    id={id}
    type={type}
    value={value ?? ''}
    placeholder={placeholder || ''}
    maxLength={maxLength}
    onChange={(e) => onChange(e.target.value)}
    className={inputClass}
    {...rest}
  />
);

export const NumberInput = ({ id, value, onChange, min, max, step = 1, suffix }) => (
  <div className="relative">
    <input
      id={id}
      type="number"
      inputMode="decimal"
      value={Number.isFinite(value) ? value : ''}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(e.target.value === '' ? NaN : Number(e.target.value))}
      className={`${inputClass} ${suffix ? 'pr-10' : ''}`}
    />
    {suffix && <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[11px] font-semibold text-slate-400">{suffix}</span>}
  </div>
);

export const Select = ({ id, value, onChange, options }) => (
  <select id={id} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={inputClass}>
    {options.map((o) => (
      <option key={o.value ?? o} value={o.value ?? o}>
        {o.label ?? o}
      </option>
    ))}
  </select>
);

export const Toggle = ({ checked, onChange, label }) => (
  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
    <span className="text-xs font-semibold text-slate-700">{label}</span>
    <button
      type="button"
      role="switch"
      aria-checked={Boolean(checked)}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition ${checked ? 'bg-indigo-600' : 'bg-slate-300'}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${checked ? 'left-4.5' : 'left-0.5'}`} />
    </button>
  </label>
);

export const ColorInput = ({ id, label, value, onChange }) => (
  <Field label={label} htmlFor={id}>
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5">
      <input id={id} type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value.toUpperCase())} className="h-7 w-9 shrink-0 cursor-pointer rounded-md border-0 bg-transparent p-0" />
      <input
        type="text"
        value={value || ''}
        maxLength={7}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        className="w-full min-w-0 bg-transparent text-xs font-mono text-slate-800 focus:outline-none"
        aria-label={`${label} hex`}
      />
    </div>
  </Field>
);

export const ChoiceChips = ({ value, onChange, options, size = 'sm' }) => (
  <div className="flex flex-wrap gap-1.5">
    {options.map((o) => {
      const active = o.value === value;
      return (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`rounded-full px-3 ${size === 'sm' ? 'py-1 text-xs' : 'py-1.5 text-sm'} font-bold transition ${active ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          aria-pressed={active}
        >
          {o.label}
        </button>
      );
    })}
  </div>
);

export default Section;

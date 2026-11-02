// DateRangeFilter.jsx — This month / Last month / This year / All time / Custom
import React from 'react';
import { DATE_RANGE_PRESETS } from '../../utils/commissionForm.js';

const dateInputClass =
  'px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 max-sm:w-full';

/**
 * @param {object} props
 * @param {{ preset: string, customFrom: string, customTo: string }} props.value
 * @param {(value: object) => void} props.onChange
 */
export const DateRangeFilter = ({ value, onChange }) => (
  <div className="flex flex-col gap-2 sm:items-end">
    <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1" role="group" aria-label="Date range">
      {DATE_RANGE_PRESETS.map(({ key, label }) => {
        const active = value.preset === key;
        return (
          <button
            key={key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange({ ...value, preset: key })}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${active ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-800'}`}
          >
            {label}
          </button>
        );
      })}
    </div>
    {value.preset === 'CUSTOM' && (
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <input
          type="date"
          aria-label="From date"
          value={value.customFrom}
          max={value.customTo || undefined}
          onChange={(e) => onChange({ ...value, customFrom: e.target.value })}
          className={dateInputClass}
        />
        <input
          type="date"
          aria-label="To date"
          value={value.customTo}
          min={value.customFrom || undefined}
          onChange={(e) => onChange({ ...value, customTo: e.target.value })}
          className={dateInputClass}
        />
      </div>
    )}
  </div>
);

export default DateRangeFilter;

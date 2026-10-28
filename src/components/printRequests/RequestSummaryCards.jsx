// RequestSummaryCards.jsx — KPI cards (click karke tab badlo)
import React from 'react';
import { toneClasses } from './requestTones.js';

/**
 * @param {object} props
 * @param {Array<{ key: string, label: string, count: number, icon?: React.ComponentType, tone?: string, hint?: string }>} props.cards
 * @param {string} [props.activeKey]
 * @param {(key: string) => void} [props.onSelect]
 * @param {boolean} [props.loading]
 */
export const RequestSummaryCards = ({ cards = [], activeKey = null, onSelect, loading = false }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
    {cards.map(({ key, label, count, icon: Icon, tone, hint }) => {
      const colors = toneClasses(tone);
      const isActive = activeKey === key;
      const clickable = typeof onSelect === 'function';
      return (
        <button
          key={key}
          type="button"
          onClick={clickable ? () => onSelect(key) : undefined}
          disabled={!clickable}
          aria-pressed={clickable ? isActive : undefined}
          className={`text-left rounded-2xl border bg-white p-4 shadow-xs transition-all ${isActive ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-slate-200'} ${clickable ? 'hover:border-indigo-200 hover:shadow-sm cursor-pointer' : 'cursor-default'}`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">{label}</span>
            {Icon && (
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colors.icon}`}>
                <Icon className="h-4 w-4" />
              </span>
            )}
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 tabular-nums">
            {loading ? <span className="inline-block h-7 w-10 rounded bg-slate-100 animate-pulse align-middle" /> : count ?? 0}
          </p>
          {hint && <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p>}
        </button>
      );
    })}
  </div>
);

export default RequestSummaryCards;

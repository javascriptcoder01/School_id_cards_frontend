// RequestTabs.jsx — counts ke saath tabs (mobile par horizontal scroll)
import React from 'react';

/**
 * @param {object} props
 * @param {Array<{ key: string, label: string, count?: number }>} props.tabs
 * @param {string} props.active
 * @param {(key: string) => void} props.onChange
 */
export const RequestTabs = ({ tabs = [], active, onChange }) => (
  <div className="border-b border-slate-200 overflow-x-auto">
    <div className="flex gap-1 min-w-max" role="tablist" aria-label="Print request status">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange?.(tab.key)}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 -mb-px border-b-2 text-sm font-semibold whitespace-nowrap transition-colors ${isActive ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`min-w-6 rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums ${isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  </div>
);

export default RequestTabs;

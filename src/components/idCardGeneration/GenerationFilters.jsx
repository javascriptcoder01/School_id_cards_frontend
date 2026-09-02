import React from 'react';
import { Filter, X } from 'lucide-react';
import { GENERATION_STATUS_VALUES } from '../../constants/idCardGeneration.js';

export const GenerationFilters = ({
  filters = { status: '', templateId: '', studentId: '' },
  templates = [],
  onFilterChange,
  onReset,
}) => {
  const hasActiveFilters = Boolean(filters.status || filters.templateId || filters.studentId);

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6 flex flex-col sm:flex-row items-center gap-3 justify-between">
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-indigo-600" />
          <span>Filters:</span>
        </div>

        {/* Status Filter */}
        <select
          aria-label="Filter by Status"
          value={filters.status || ''}
          onChange={(e) => onFilterChange({ status: e.target.value })}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
        >
          <option value="">All Statuses</option>
          {GENERATION_STATUS_VALUES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        {/* Template Filter */}
        {templates.length > 0 && (
          <select
            aria-label="Filter by Template"
            value={filters.templateId || ''}
            onChange={(e) => onFilterChange({ templateId: e.target.value })}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
          >
            <option value="">All Templates</option>
            {templates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      )}
    </div>
  );
};

export default GenerationFilters;


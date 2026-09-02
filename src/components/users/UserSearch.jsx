import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Shield } from 'lucide-react';
import { ROLES } from '../../constants/roles.js';

/**
 * UserSearch Component
 * Debounced search input, role filter dropdown, and active status filter dropdown
 */
export const UserSearch = ({
  search = '',
  role = '',
  isActive = '',
  isSuperAdmin = false,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onReset,
}) => {
  const [localSearch, setLocalSearch] = useState(search);

  // Sync with prop if changed externally
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, 350);

    return () => {
      clearTimeout(handler);
    };
  }, [localSearch, search, onSearchChange]);

  const handleClear = () => {
    setLocalSearch('');
    if (onReset) {
      onReset();
    } else {
      onSearchChange('');
      if (onRoleChange) onRoleChange('');
      onStatusChange('');
    }
  };

  const hasActiveFilters = Boolean(
    search || (role !== '' && role !== undefined) || (isActive !== '' && isActive !== undefined)
  );

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6 flex flex-col lg:flex-row items-center gap-3 justify-between">
      {/* Search Input */}
      <div className="relative w-full lg:max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
        />
        {localSearch && (
          <button
            type="button"
            onClick={() => setLocalSearch('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
        {/* Role Filter (SUPER_ADMIN only) */}
        {isSuperAdmin && (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>Role:</span>
            <select
              value={role}
              onChange={(e) => onRoleChange(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-hidden cursor-pointer"
              aria-label="Filter by role"
            >
              <option value="">All Roles</option>
              <option value={ROLES.COLLEGE_ADMIN}>College Admin</option>
              <option value={ROLES.OPERATOR}>Operator</option>
            </select>
          </div>
        )}

        {/* Status Filter */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Status:</span>
          <select
            value={isActive}
            onChange={(e) => onStatusChange(e.target.value)}
            className="bg-transparent font-medium text-slate-800 focus:outline-hidden cursor-pointer"
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default UserSearch;


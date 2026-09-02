import React, { useState } from 'react';
import { Search, Check, Users, User, X } from 'lucide-react';

export const StudentSelector = ({
  students = [],
  selectedStudentIds = [],
  onToggleStudent,
  onSelectAll,
  onClearAll,
  isBulkMode = false,
  isLoading = false,
}) => {
  const [search, setSearch] = useState('');

  const filteredStudents = students.filter((s) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      s.name?.toLowerCase().includes(term) ||
      s.studentId?.toLowerCase().includes(term) ||
      s.rollNumber?.toLowerCase().includes(term) ||
      s.className?.toLowerCase().includes(term)
    );
  });

  const selectedStudents = students.filter((s) => selectedStudentIds.includes(s.id));

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Select Student Records ({selectedStudentIds.length} Selected)
            </h3>
            <p className="text-xs text-slate-500">
              {isBulkMode
                ? 'Choose multiple students to generate ID cards in bulk'
                : 'Select one student record to generate a single ID card'}
            </p>
          </div>
        </div>

        {isBulkMode && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isLoading || filteredStudents.length === 0}
              onClick={() => onSelectAll(filteredStudents.map((s) => s.id))}
              className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors disabled:opacity-50"
            >
              Select All Shown ({filteredStudents.length})
            </button>
            {selectedStudentIds.length > 0 && (
              <button
                type="button"
                disabled={isLoading}
                onClick={onClearAll}
                className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors disabled:opacity-50"
              >
                Clear Selection
              </button>
            )}
          </div>
        )}
      </div>

      {/* Selected Student Chips Preview */}
      {selectedStudents.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 max-h-32 overflow-y-auto p-3 bg-slate-50 border border-slate-200 rounded-2xl">
          {selectedStudents.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 shadow-xs"
            >
              <User className="w-3 h-3 text-indigo-600" />
              <span className="font-semibold">{s.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">({s.studentId})</span>
              <button
                type="button"
                onClick={() => onToggleStudent(s.id)}
                className="text-slate-400 hover:text-rose-600 ml-1"
                aria-label={`Remove ${s.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={search}
          disabled={isLoading}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter students by name, student ID, roll number, or class..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
        />
      </div>

      {/* Student List */}
      <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-2xl divide-y divide-slate-100">
        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No students found matching your search.
          </div>
        ) : (
          filteredStudents.map((s) => {
            const isSelected = selectedStudentIds.includes(s.id);

            return (
              <div
                key={s.id}
                onClick={() => onToggleStudent(s.id)}
                className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50/70' : 'hover:bg-slate-50'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-slate-300 bg-white'
                      }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">{s.name}</span>
                    <span className="text-xs text-slate-500 font-mono">
                      ID: {s.studentId} &bull; Class: {s.className || 'N/A'} &bull; Roll: {s.rollNumber || 'N/A'}
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  {s.section ? `Sec ${s.section}` : 'General'}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentSelector;


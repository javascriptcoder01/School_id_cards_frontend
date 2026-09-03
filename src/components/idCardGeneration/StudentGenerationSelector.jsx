import React, { useState, useMemo } from 'react';
import { Search, Users, User, CheckCircle2, AlertCircle, Sparkles, Filter } from 'lucide-react';
import { calculateStudentCompletion } from '../../utils/studentCompletion.js';
import StudentCompletionMetric from '../students/StudentCompletionMetric.jsx';

/**
 * StudentGenerationSelector Component
 * Step 1 in Bulk ID Card Generation Wizard
 * Allows Operators to select eligible students (complete profiles only) for generation.
 */
export const StudentGenerationSelector = ({
  students = [],
  selectedStudentIds = [],
  onSelectionChange,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEligibility, setFilterEligibility] = useState('ALL'); // 'ALL' | 'ELIGIBLE' | 'PENDING'

  // Annotate students with completion status
  const analyzedStudents = useMemo(() => {
    return students.map((s) => {
      const completion = calculateStudentCompletion(s);
      return {
        ...s,
        completion,
        isEligible: completion.isComplete,
      };
    });
  }, [students]);

  const eligibleCount = useMemo(
    () => analyzedStudents.filter((s) => s.isEligible).length,
    [analyzedStudents]
  );
  const pendingCount = analyzedStudents.length - eligibleCount;

  // Filter based on search and eligibility tabs
  const filteredStudents = useMemo(() => {
    return analyzedStudents.filter((s) => {
      if (filterEligibility === 'ELIGIBLE' && !s.isEligible) return false;
      if (filterEligibility === 'PENDING' && s.isEligible) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        s.name?.toLowerCase().includes(term) ||
        s.studentId?.toLowerCase().includes(term) ||
        s.rollNumber?.toLowerCase().includes(term) ||
        s.className?.toLowerCase().includes(term) ||
        s.section?.toLowerCase().includes(term)
      );
    });
  }, [analyzedStudents, filterEligibility, searchTerm]);

  const visibleEligibleIds = useMemo(
    () => filteredStudents.filter((s) => s.isEligible).map((s) => s.id),
    [filteredStudents]
  );

  const isAllVisibleEligibleSelected =
    visibleEligibleIds.length > 0 &&
    visibleEligibleIds.every((id) => selectedStudentIds.includes(id));

  const handleSelectAllEligible = () => {
    if (isAllVisibleEligibleSelected) {
      // Unselect only the visible eligible ones
      const next = selectedStudentIds.filter((id) => !visibleEligibleIds.includes(id));
      onSelectionChange(next);
    } else {
      // Add all visible eligible to selection
      const nextSet = new Set([...selectedStudentIds, ...visibleEligibleIds]);
      onSelectionChange(Array.from(nextSet));
    }
  };

  const handleToggleStudent = (student) => {
    if (!student.isEligible) return; // Block incomplete
    if (selectedStudentIds.includes(student.id)) {
      onSelectionChange(selectedStudentIds.filter((id) => id !== student.id));
    } else {
      onSelectionChange([...selectedStudentIds, student.id]);
    }
  };

  const handleClearSelection = () => {
    onSelectionChange([]);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
      {/* Header and Counters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Select Students for Generation
            </h2>
            <p className="text-xs text-slate-500">
              Only students with complete profile data (100% completion) are eligible for ID card printing.
            </p>
          </div>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            data-testid="selected-count-badge"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Selected: {selectedStudentIds.length}</span>
          </span>

          <span
            data-testid="eligible-count-badge"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Eligible: {eligibleCount}</span>
          </span>

          {pendingCount > 0 && (
            <span
              data-testid="pending-count-badge"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Pending Completion: {pendingCount}</span>
            </span>
          )}
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, ID, class, or roll number..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* Eligibility Filter Tabs & Select All Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setFilterEligibility('ALL')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                filterEligibility === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({analyzedStudents.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterEligibility('ELIGIBLE')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                filterEligibility === 'ELIGIBLE'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Eligible ({eligibleCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterEligibility('PENDING')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                filterEligibility === 'PENDING'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Incomplete ({pendingCount})
            </button>
          </div>

          <button
            type="button"
            disabled={visibleEligibleIds.length === 0}
            onClick={handleSelectAllEligible}
            className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
          >
            {isAllVisibleEligibleSelected
              ? 'Unselect Visible Eligible'
              : `Select All Eligible (${visibleEligibleIds.length})`}
          </button>

          {selectedStudentIds.length > 0 && (
            <button
              type="button"
              onClick={handleClearSelection}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors"
            >
              Clear Selection
            </button>
          )}
        </div>
      </div>

      {/* Students Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={isAllVisibleEligibleSelected}
                    disabled={visibleEligibleIds.length === 0}
                    onChange={handleSelectAllEligible}
                    aria-label="Select all eligible students"
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="py-3 px-4">Student Name & ID</th>
                <th className="py-3 px-4">Class & Section</th>
                <th className="py-3 px-4">Completion Status</th>
                <th className="py-3 px-4">Eligibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No students match your current criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const isSelected = selectedStudentIds.includes(student.id);
                  const isEligible = student.isEligible;

                  return (
                    <tr
                      key={student.id}
                      onClick={() => isEligible && handleToggleStudent(student)}
                      className={`transition-colors ${
                        !isEligible
                          ? 'bg-slate-50/60 opacity-80 cursor-not-allowed'
                          : isSelected
                          ? 'bg-indigo-50/50 cursor-pointer'
                          : 'hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={!isEligible || isLoading}
                          onChange={() => handleToggleStudent(student)}
                          aria-label={`Select student ${student.name}`}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                      </td>

                      {/* Name & Photo */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {student.photo ? (
                            <img
                              src={student.photo}
                              alt={student.name}
                              className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                              <User className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{student.name}</p>
                            <p className="font-mono text-[11px] text-slate-400">{student.studentId}</p>
                          </div>
                        </div>
                      </td>

                      {/* Class & Section */}
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {student.className}{' '}
                        {student.section ? (
                          <span className="text-slate-500">(Sec {student.section})</span>
                        ) : null}
                      </td>

                      {/* Completion */}
                      <td className="py-3 px-4">
                        <StudentCompletionMetric student={student} showDetail={true} />
                      </td>

                      {/* Eligibility Status */}
                      <td className="py-3 px-4">
                        {isEligible ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>ELIGIBLE</span>
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200"
                            title={`Cannot generate ID card: missing ${student.completion.missingFields.join(
                              ', '
                            )}`}
                          >
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>DISABLED (Missing: {student.completion.missingFields.join(', ')})</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentGenerationSelector;

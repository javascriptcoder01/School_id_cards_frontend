// StudentPickerTable.jsx — students chuno: photo, naam, roll; "No photo" badge; doosri request mein ho to disabled
import React, { useMemo, useState } from 'react';
import { Search, UserRound } from 'lucide-react';

const photoOf = (student) => student?.studentPhoto?.url || student?.photo || student?.photoUrl || null;

const SkeletonRows = ({ rows = 5 }) =>
  Array.from({ length: rows }).map((_, index) => (
    <tr key={index} className="animate-pulse">
      <td className="px-4 py-3"><span className="block h-4 w-4 rounded bg-slate-100" /></td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="block h-11 w-9 rounded-md bg-slate-100" />
          <span className="block h-4 w-40 rounded bg-slate-100" />
        </div>
      </td>
      <td className="px-4 py-3"><span className="block h-4 w-12 rounded bg-slate-100" /></td>
      <td className="px-4 py-3"><span className="block h-4 w-20 rounded bg-slate-100" /></td>
    </tr>
  ));

/**
 * @param {object} props
 * @param {object[]} props.students
 * @param {string[]} props.selectedIds
 * @param {(ids: string[]) => void} props.onChange
 * @param {Record<string, string>} [props.lockedBy] - studentId → request number (doosri open request) → row disabled
 * @param {boolean} [props.loading]
 * @param {boolean} [props.readOnly] - sirf list (detail page)
 */
export const StudentPickerTable = ({
  students = [],
  selectedIds = [],
  onChange,
  lockedBy = {},
  loading = false,
  readOnly = false,
}) => {
  const [search, setSearch] = useState('');

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) =>
      [s.name, s.studentId, s.rollNumber].some((v) => String(v || '').toLowerCase().includes(q))
    );
  }, [students, search]);

  const selectable = visible.filter((s) => !lockedBy[s.id]);
  const allSelected = selectable.length > 0 && selectable.every((s) => selectedIds.includes(s.id));

  const toggle = (id) => {
    if (readOnly || lockedBy[id]) return;
    onChange?.(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  };

  const toggleAll = (checked) => {
    const ids = selectable.map((s) => s.id);
    onChange?.(checked ? [...new Set([...selectedIds, ...ids])] : selectedIds.filter((id) => !ids.includes(id)));
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border-b border-slate-100">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, ID or roll no."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>
        {!readOnly && (
          <p className="text-xs text-slate-500">
            <span className="font-semibold text-slate-800">{selectedIds.length}</span> selected of {students.length}
          </p>
        )}
      </div>

      <div className="max-h-128 overflow-y-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="w-10 px-4 py-3">
                {!readOnly && (
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => toggleAll(e.target.checked)}
                    disabled={selectable.length === 0}
                    aria-label="Select all students"
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                )}
              </th>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Roll No.</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <SkeletonRows />
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-500">
                  {students.length === 0 ? 'No students found in this class.' : 'No students match your search.'}
                </td>
              </tr>
            ) : (
              visible.map((student) => {
                const photo = photoOf(student);
                const lockedRequest = lockedBy[student.id];
                const checked = selectedIds.includes(student.id);
                return (
                  <tr
                    key={student.id}
                    onClick={() => toggle(student.id)}
                    className={`${lockedRequest ? 'bg-slate-50/60 text-slate-400' : readOnly ? '' : 'cursor-pointer hover:bg-indigo-50/40'} ${checked ? 'bg-indigo-50/50' : ''}`}
                  >
                    <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                      {!readOnly && (
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={Boolean(lockedRequest)}
                          onChange={() => toggle(student.id)}
                          aria-label={`Select ${student.name}`}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-40"
                        />
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        {photo ? (
                          <img src={photo} alt="" className="h-11 w-9 shrink-0 rounded-md object-cover border border-slate-200" />
                        ) : (
                          <span className="flex h-11 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 border border-slate-200 text-slate-400">
                            <UserRound className="h-4 w-4" />
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className={`font-semibold truncate ${lockedRequest ? 'text-slate-500' : 'text-slate-900'}`}>{student.name || '—'}</p>
                          <p className="text-xs text-slate-500 font-mono truncate">{student.studentId || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs font-mono text-slate-600">{student.rollNumber || '—'}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap gap-1.5">
                        {!photo && (
                          <span className="rounded-md border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-700">
                            No photo
                          </span>
                        )}
                        {lockedRequest && (
                          <span className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                            In request {lockedRequest}
                          </span>
                        )}
                        {photo && !lockedRequest && <span className="text-xs text-slate-400">Ready</span>}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentPickerTable;

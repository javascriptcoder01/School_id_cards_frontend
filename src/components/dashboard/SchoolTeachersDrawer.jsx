// SchoolTeachersDrawer.jsx — Super Admin: ek school ke class teachers aur har teacher ke students (read-only, daayein se drawer).
// Data: GET /dashboard/super-admin/colleges/:collegeId/progress (School Admin wala progress logic hi).
import React, { useEffect, useState } from 'react';
import { GraduationCap, Users, X } from 'lucide-react';
import ErrorMessage from '../common/ErrorMessage.jsx';
import InlineLoader from '../common/InlineLoader.jsx';
import { getSuperAdminCollegeProgress } from '../../features/dashboard/dashboardApi.js';

const classLabel = (className, section) => (className ? `${className}${section ? ` - ${section}` : ''}` : null);

const Tile = ({ icon: Icon, label, value, hint }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
      <Icon className="h-3.5 w-3.5" /> {label}
    </div>
    <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">{value}</p>
    {hint && <p className="text-xs text-slate-500">{hint}</p>}
  </div>
);

/**
 * @param {object} props
 * @param {{ collegeId: string, name?: string, code?: string }|null} props.college - null = band
 * @param {() => void} props.onClose
 */
export const SchoolTeachersDrawer = ({ college, onClose }) => (college ? <Drawer key={college.collegeId} college={college} onClose={onClose} /> : null);

const Drawer = ({ college, onClose }) => {
  const [state, setState] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    let alive = true;
    getSuperAdminCollegeProgress(college.collegeId)
      .then((data) => alive && setState({ loading: false, error: null, data }))
      .catch((e) => alive && setState({ loading: false, error: e?.message || 'Could not load class teachers', data: null }));
    return () => {
      alive = false;
    };
  }, [college.collegeId]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const { loading, error, data } = state;
  const summary = data?.summary || {};
  const teachers = Array.isArray(data?.operators) ? data.operators : [];
  const underTeachers = teachers.reduce((sum, t) => sum + (t.students?.total || 0), 0);
  const withoutTeacher = Math.max(0, (summary.totalStudents || 0) - underTeachers);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="school-teachers-title" onClick={onClose}>
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 p-5 border-b border-slate-100">
          <div className="min-w-0">
            <h2 id="school-teachers-title" className="text-base font-bold text-slate-900 break-words">
              {data?.college?.name || college.name || 'School'}
            </h2>
            <p className="mt-0.5 font-mono text-xs text-slate-500">{data?.college?.code || college.code}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {error && <ErrorMessage message={error} title="Couldn't load class teachers" />}
          {loading && <InlineLoader text="Loading class teachers…" />}

          {data && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Tile icon={Users} label="Class teachers" value={summary.totalOperators ?? 0} hint={`${summary.activeOperators ?? 0} active · ${summary.inactiveOperators ?? 0} inactive`} />
                <Tile icon={GraduationCap} label="Students" value={summary.totalStudents ?? 0} hint={`${summary.completedStudents ?? 0} complete · ${summary.pendingStudents ?? 0} pending`} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-2">Students per class teacher</h3>
                {teachers.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500">No class teachers in this school yet.</p>
                ) : (
                  <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                    {teachers.map((t) => {
                      const scope = t.assignments?.[0] || {};
                      const label = classLabel(scope.className, scope.section) || classLabel(t.assignment?.className, t.assignment?.sectionName);
                      return (
                        <li key={t.operator?.id} className="flex items-start justify-between gap-3 p-3 text-sm">
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 break-words">
                              {t.operator?.name || '—'}
                              {t.operator?.isActive === false && <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-500">Inactive</span>}
                            </p>
                            <p className="text-xs text-slate-500 break-all">{t.operator?.email}</p>
                            <p className="mt-0.5 text-xs text-slate-600">{label ? `Class ${label}` : 'No class assigned'}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="font-bold text-slate-900 tabular-nums">{t.students?.total ?? 0}</p>
                            <p className="text-[11px] text-slate-500">students</p>
                            <p className="text-[11px] text-slate-500 tabular-nums">{t.idCards?.generated ?? 0} cards</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {withoutTeacher > 0 && (
                  <p className="mt-2 text-xs text-amber-700">{withoutTeacher} student{withoutTeacher === 1 ? '' : 's'} in classes without a class teacher.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolTeachersDrawer;

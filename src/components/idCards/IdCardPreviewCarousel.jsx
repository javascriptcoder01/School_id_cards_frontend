// IdCardPreviewCarousel.jsx
// Kai students ke cards ek-ek karke: Prev / Next, "3 / 25", thumbnails strip, har card IdCardFlip mein.
// Data parent deta hai (Redux cache by studentId) — jo card dikh raha hai (aur agla) uska onNeedPreview chalta hai.
import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';
import IdCardFlip from './IdCardFlip.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';

const hasWarnings = (renderData) =>
  Boolean(
    renderData &&
      ((renderData.warnings && renderData.warnings.length > 0) ||
        renderData.warningsBySide?.front?.length > 0 ||
        renderData.warningsBySide?.back?.length > 0)
  );

/**
 * @param {object} props
 * @param {Array<{ id: string, name?: string, studentId?: string }>} props.students
 * @param {(studentId: string) => ({ data?: object, loading?: boolean, error?: string } | undefined)} props.getPreview
 * @param {(studentId: string) => void} props.onNeedPreview - preview chahiye (cache parent / saga sambhalta hai)
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {(index: number) => void} [props.onIndexChange]
 * @param {(studentId: string) => React.ReactNode} [props.renderBadge] - card ke upar badge (e.g. "Print copy")
 */
export const IdCardPreviewCarousel = ({ students = [], getPreview, onNeedPreview, size = 'md', onIndexChange, renderBadge }) => {
  const [index, setIndex] = useState(0);
  const total = students.length;
  // List chhoti ho gayi to index list ke andar (derived — effect nahi)
  const current = total === 0 ? 0 : Math.min(index, total - 1);
  const student = students[current];
  const nextStudent = students[current + 1];

  // Cache saaf hua (status badla) to dikh rahe card ko dobara maango
  const currentMissing = Boolean(student?.id) && !getPreview?.(student.id);

  // Dikh raha card + agla (Next jaldi khule)
  useEffect(() => {
    if (student?.id) onNeedPreview?.(student.id);
    if (nextStudent?.id) onNeedPreview?.(nextStudent.id);
  }, [student?.id, nextStudent?.id, onNeedPreview, currentMissing]);

  const go = (nextIndex) => {
    if (total === 0) return;
    const clamped = Math.min(Math.max(nextIndex, 0), total - 1);
    setIndex(clamped);
    onIndexChange?.(clamped);
  };

  if (total === 0) {
    return <p className="text-sm text-slate-500">No students to preview.</p>;
  }

  const preview = getPreview?.(student.id) || {};

  return (
    <div className="space-y-4">
      {/* Prev / Next */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => go(current - 1)}
          disabled={current === 0}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous student"
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </button>
        <div className="min-w-0 text-center">
          <p className="truncate text-sm font-semibold text-slate-800">{student.name || student.studentId || 'Student'}</p>
          <p className="text-xs text-slate-500 tabular-nums" aria-live="polite">
            {current + 1} / {total}
          </p>
        </div>
        <button
          type="button"
          onClick={() => go(current + 1)}
          disabled={current >= total - 1}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next student"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Card */}
      <div className="flex flex-col items-center gap-2">
        {renderBadge?.(student.id)}
        {preview.data ? (
          // key: naya student → flip wapas front par
          <IdCardFlip key={student.id} renderData={preview.data} size={size} />
        ) : preview.error ? (
          <ErrorMessage message={preview.error} title="Couldn't load this card" />
        ) : (
          <div className="flex h-40 w-full items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading card…
          </div>
        )}
      </div>

      {/* Thumbnails strip */}
      {total > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="list" aria-label="Students">
          {students.map((s, i) => {
            const cached = getPreview?.(s.id);
            const warn = hasWarnings(cached?.data);
            const active = i === current;
            return (
              <button
                key={s.id}
                type="button"
                role="listitem"
                onClick={() => go(i)}
                aria-current={active ? 'true' : undefined}
                title={warn ? `${s.name || s.studentId}: has warnings` : s.name || s.studentId}
                className={`relative shrink-0 max-w-[9rem] truncate px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  active
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="tabular-nums text-slate-400 mr-1">{i + 1}.</span>
                {s.name || s.studentId || 'Student'}
                {warn && (
                  <AlertTriangle className="ml-1 inline h-3.5 w-3.5 text-amber-500" aria-label="Has warnings" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default IdCardPreviewCarousel;

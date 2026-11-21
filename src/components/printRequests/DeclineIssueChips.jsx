// DeclineIssueChips.jsx — flagged student ki galtiyan (chips). onToggle diya ho to chunne wale buttons.
import React from 'react';
import { DECLINE_ISSUES, DECLINE_ISSUE_LABELS } from '../../constants/printRequestDecline.js';

/**
 * @param {object} props
 * @param {string[]} props.issues - chuni hui values
 * @param {(value: string) => void} [props.onToggle] - diya ho to saare options (picker); warna sirf chuni hui (read-only)
 * @param {string} [props.idPrefix]
 */
export const DeclineIssueChips = ({ issues = [], onToggle, idPrefix = 'issue' }) => {
  if (!onToggle) {
    return (
      <div className="flex flex-wrap gap-1">
        {issues.map((value) => (
          <span key={value} className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700 ring-1 ring-rose-200">
            {DECLINE_ISSUE_LABELS[value] || value}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Issues">
      {DECLINE_ISSUES.map((issue) => {
        const active = issues.includes(issue.value);
        return (
          <button
            key={issue.value}
            id={`${idPrefix}-${issue.value}`}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(issue.value)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors ${
              active
                ? 'bg-linear-to-r from-rose-500 to-pink-500 text-white shadow-sm shadow-rose-500/30'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-rose-50 hover:text-rose-700'
            }`}
          >
            {issue.label}
          </button>
        );
      })}
    </div>
  );
};

export default DeclineIssueChips;

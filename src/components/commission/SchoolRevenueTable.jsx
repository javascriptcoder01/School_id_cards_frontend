// SchoolRevenueTable.jsx — har school ki alag row: rate, upcoming, pending payment, paid, last payment
import React from 'react';
import { School, Users } from 'lucide-react';
import EmptyState from '../common/EmptyState.jsx';
import RateBadge from './RateBadge.jsx';
import { cardsLabel } from '../../utils/commissionForm.js';
import { formatDateTime } from '../../utils/idCardFormat.js';
import { formatInr } from '../../utils/money.js';

const AmountCell = ({ amount, cards, amountHint = '' }) => (
  <td className="px-4 py-3.5 whitespace-nowrap">
    <span className="block font-semibold text-slate-900 tabular-nums">
      {formatInr(amount)}
      {amountHint && amount !== null ? <span className="ml-1 text-[11px] font-normal italic text-slate-400">{amountHint}</span> : null}
    </span>
    <span className="block text-xs text-slate-500">{cardsLabel(cards)}</span>
  </td>
);

/**
 * @param {object} props
 * @param {object[]} [props.colleges] - dashboard overview ki rows
 * @param {boolean} [props.loading]
 * @param {(college: object) => React.ReactNode} [props.renderRateActions]
 * @param {(college: object) => React.ReactNode} [props.renderAction] - aakhri column
 * @param {(college: object) => void} [props.onRowClick]
 * @param {(college: object) => void} [props.onCountsClick] - diya ho to "Class teachers" + "Students" columns dikhte hain (Super Admin dashboard)
 */
export const SchoolRevenueTable = ({ colleges = [], loading = false, renderRateActions, renderAction, onRowClick, onCountsClick }) => {
  if (!loading && colleges.length === 0) {
    return <EmptyState title="No schools yet" description="Schools appear here once they are added." icon={School} />;
  }

  const showCounts = typeof onCountsClick === 'function';
  const columnCount = (renderAction ? 7 : 6) + (showCounts ? 2 : 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm" aria-label="School-wise revenue">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 sm:px-6 py-3">School</th>
              {showCounts && <th className="px-4 py-3">Class teachers</th>}
              {showCounts && <th className="px-4 py-3">Students</th>}
              <th className="px-4 py-3">Rate</th>
              <th className="px-4 py-3">Upcoming</th>
              <th className="px-4 py-3">Pending Payment</th>
              <th className="px-4 py-3">Paid</th>
              <th className="px-4 py-3">Last Payment</th>
              {renderAction && <th className="px-4 sm:px-6 py-3 text-right">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && colleges.length === 0
              ? Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: columnCount }).map((__, j) => (
                    <td key={j} className="px-4 py-4"><span className="block h-4 rounded bg-slate-100" /></td>
                  ))}
                </tr>
              ))
              : colleges.map((college) => (
                <tr
                  key={college.collegeId}
                  onClick={onRowClick ? () => onRowClick(college) : undefined}
                  onKeyDown={onRowClick ? (e) => {
                    if (e.key === 'Enter') onRowClick(college);
                  } : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  className={`hover:bg-slate-50/70 ${onRowClick ? 'cursor-pointer focus:outline-hidden focus-visible:bg-indigo-50' : ''}`}
                >
                  <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                    <span className="block font-semibold text-slate-900">{college.name}</span>
                    <span className="block font-mono text-[11px] text-slate-500">{college.code}</span>
                  </td>
                  {showCounts && (
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCountsClick(college);
                        }}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 tabular-nums hover:bg-indigo-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
                        aria-label={`View class teachers of ${college.name}`}
                      >
                        <Users className="h-3.5 w-3.5" />
                        {college.counts?.operators ?? 0}
                      </button>
                    </td>
                  )}
                  {showCounts && (
                    <td className="px-4 py-3.5 whitespace-nowrap font-semibold text-slate-900 tabular-nums">{college.counts?.students ?? 0}</td>
                  )}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <RateBadge rate={college.rate?.effective?.rate ?? null} scope={college.rate?.scope} />
                    {renderRateActions && <div className="mt-1.5 flex gap-3">{renderRateActions(college)}</div>}
                  </td>
                  <AmountCell amount={college.upcoming?.estimatedAmount ?? null} cards={college.upcoming?.cards} amountHint="Est." />
                  <AmountCell amount={college.pendingPayment?.amount} cards={college.pendingPayment?.cards} />
                  <AmountCell amount={college.paid?.amount} cards={college.paid?.cards} />
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {college.lastPayment ? (
                      <>
                        <span className="block font-semibold text-slate-900 tabular-nums">{formatInr(college.lastPayment.amount)}</span>
                        <span className="block text-xs text-slate-500">{formatDateTime(college.lastPayment.paidAt)}</span>
                      </>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  {renderAction && <td className="px-4 sm:px-6 py-3.5 text-right whitespace-nowrap">{renderAction(college)}</td>}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SchoolRevenueTable;

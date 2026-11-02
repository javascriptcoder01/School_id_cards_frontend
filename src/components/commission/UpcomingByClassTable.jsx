// UpcomingByClassTable.jsx — Pending Approval requests class-section wise: class teacher, cards, est. ₹ + total row
import React from 'react';
import { ClipboardList } from 'lucide-react';
import EmptyState from '../common/EmptyState.jsx';
import { formatInr, formatInrShort } from '../../utils/money.js';

/**
 * @param {object} props
 * @param {object[]} [props.rows] - overview.upcomingByClass
 * @param {object} [props.total] - overview.upcoming
 * @param {number|null} [props.rate] - rupees per card
 * @param {boolean} [props.loading]
 */
export const UpcomingByClassTable = ({ rows = [], total = null, rate = null, loading = false }) => {
  if (!loading && rows.length === 0) {
    return <EmptyState title="No upcoming requests" description="Requests waiting for your approval appear here." icon={ClipboardList} />;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {rate !== null && (
        <p className="px-4 sm:px-6 py-2.5 border-b border-slate-100 text-xs text-slate-500">
          Estimated at {formatInrShort(rate)} / card
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm" aria-label="Upcoming requests by class">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 sm:px-6 py-3">Class</th>
              <th className="px-4 py-3">Class Teacher</th>
              <th className="px-4 py-3 text-center">Requests</th>
              <th className="px-4 py-3 text-center">Cards</th>
              <th className="px-4 sm:px-6 py-3 text-right">Est. Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && rows.length === 0
              ? Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-4 py-4"><span className="block h-4 rounded bg-slate-100" /></td>
                  ))}
                </tr>
              ))
              : rows.map((row) => (
                <tr key={`${row.className}|${row.section}`} className="hover:bg-slate-50/70">
                  <td className="px-4 sm:px-6 py-3.5 font-semibold text-slate-900 whitespace-nowrap">
                    {row.className ? `${row.className}${row.section ? ` - ${row.section}` : ''}` : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">{row.operator?.name || '—'}</td>
                  <td className="px-4 py-3.5 text-center tabular-nums">{row.requests}</td>
                  <td className="px-4 py-3.5 text-center tabular-nums">{row.cards}</td>
                  <td className="px-4 sm:px-6 py-3.5 text-right font-semibold text-slate-900 whitespace-nowrap tabular-nums">{formatInr(row.estimatedAmount)}</td>
                </tr>
              ))}
          </tbody>
          {total && rows.length > 0 && (
            <tfoot className="border-t-2 border-slate-200 bg-slate-50 font-bold text-slate-900">
              <tr>
                <td className="px-4 sm:px-6 py-3" colSpan={2}>Total</td>
                <td className="px-4 py-3 text-center tabular-nums">{total.requests}</td>
                <td className="px-4 py-3 text-center tabular-nums">{total.cards}</td>
                <td className="px-4 sm:px-6 py-3 text-right whitespace-nowrap tabular-nums">{formatInr(total.estimatedAmount)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default UpcomingByClassTable;

// RateHistoryTable.jsx — har rate ka record (naya pehle): kab se kab tak, kisne set kiya / hataya
import React from 'react';
import { History } from 'lucide-react';
import EmptyState from '../common/EmptyState.jsx';
import { formatDateTime } from '../../utils/idCardFormat.js';
import { formatInrShort } from '../../utils/money.js';

const COLUMN_COUNT = 6;

/**
 * @param {object} props
 * @param {object[]} [props.rates] - API ke toSafeRate
 * @param {boolean} [props.loading]
 */
export const RateHistoryTable = ({ rates = [], loading = false }) => {
  if (!loading && rates.length === 0) {
    return <EmptyState title="No rate history yet" description="Rates appear here once you set one." icon={History} />;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm" aria-label="Rate history">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 sm:px-6 py-3">Rate</th>
              <th className="px-4 py-3">Applies to</th>
              <th className="px-4 py-3">From</th>
              <th className="px-4 py-3">Until</th>
              <th className="px-4 py-3">Set by</th>
              <th className="px-4 sm:px-6 py-3">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && rates.length === 0
              ? Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: COLUMN_COUNT }).map((__, j) => (
                    <td key={j} className="px-4 py-4"><span className="block h-4 rounded bg-slate-100" /></td>
                  ))}
                </tr>
              ))
              : rates.map((rate) => (
                <tr key={rate.id} className="hover:bg-slate-50/70">
                  <td className="px-4 sm:px-6 py-3.5 font-semibold text-slate-900 whitespace-nowrap tabular-nums">
                    {formatInrShort(rate.rate)} / card
                  </td>
                  <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">
                    {rate.scope === 'GLOBAL' ? 'Default (all schools)' : rate.college?.name || '—'}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">{formatDateTime(rate.effectiveFrom)}</td>
                  <td className="px-4 py-3.5 text-xs whitespace-nowrap">
                    {rate.isActive ? (
                      <span className="font-semibold text-emerald-700">Active</span>
                    ) : (
                      <span className="text-slate-500">
                        {formatDateTime(rate.endedAt)}
                        {rate.endedBy?.name ? <span className="block text-[11px] text-slate-400">by {rate.endedBy.name}</span> : null}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">{rate.setBy?.name || '—'}</td>
                  <td className="px-4 sm:px-6 py-3.5 text-xs text-slate-500 min-w-40">{rate.note || '—'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RateHistoryTable;

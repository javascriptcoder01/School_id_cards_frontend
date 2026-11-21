// LetterheadPrintOrgPanel.jsx — School Admin dashboard: "Letterhead printing" (teal) — ID card payments se alag panel.
// Mera rate, pending payment, paid, orders in print + Pay now (QR / UPI) letterhead ke pending amount ke saath.
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Printer, ArrowRight, BadgeIndianRupee, CheckCircle2, Inbox, Tag } from 'lucide-react';
import PayNowCard from '../commission/PayNowCard.jsx';
import { fetchLhMyRateRequested, selectLhOrders } from '../../features/letterheadOrders/letterheadOrdersSlice.js';
import { ROUTES } from '../../constants/routes.js';
import { formatPaise, rateSummary } from '../../constants/letterheadCommission.js';

const Stat = ({ icon: Icon, label, value, loading }) => (
  <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-teal-100 bg-white p-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-teal-500 to-cyan-600 text-white shadow-md">
      <Icon className="h-5 w-5" />
    </div>
    <div className="min-w-0">
      <p className="truncate text-base font-extrabold leading-tight text-slate-900 sm:text-lg">{loading ? '…' : value}</p>
      <p className="text-xs font-medium text-slate-500">{label}</p>
    </div>
  </div>
);

/**
 * @param {{ data: object|null|undefined, loading?: boolean }} props - college-admin dashboard ka letterheadPrint block
 */
export const LetterheadPrintOrgPanel = ({ data, loading = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myRate } = useSelector(selectLhOrders);

  useEffect(() => {
    dispatch(fetchLhMyRateRequested());
  }, [dispatch]);

  const rate = myRate.data?.resolved?.rate;
  const pendingPaise = data?.pendingPaymentPaise || 0;
  const hasActivity = Boolean(data && (data.pendingOrders || data.inPrint || data.completed || data.paidPaise || pendingPaise));

  return (
    <section className="rounded-3xl border border-teal-200/80 bg-linear-to-br from-teal-50 via-white to-cyan-50 p-4 shadow-xs sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Printer className="h-4 w-4 text-teal-600" /> Letterhead printing
          <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-700">separate from ID card payments</span>
        </h2>
        <button
          type="button"
          onClick={() => navigate(ROUTES.LETTERHEAD_MY_ORDERS)}
          className="group inline-flex items-center gap-1.5 rounded-xl bg-linear-to-r from-teal-600 to-cyan-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-teal-500/25 hover:shadow-lg"
        >
          My orders <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
      {data === null && !loading ? (
        <p className="text-xs text-slate-500">Letterhead printing totals are not available right now.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat icon={Tag} label="My rate" value={rate ? rateSummary(rate) : myRate.data?.rateMissing ? 'Not set' : '—'} loading={myRate.loading && !myRate.data} />
          <Stat icon={BadgeIndianRupee} label="Pending payment" value={formatPaise(pendingPaise)} loading={loading && !data} />
          <Stat icon={CheckCircle2} label="Paid" value={formatPaise(data?.paidPaise)} loading={loading && !data} />
          <Stat icon={Inbox} label="Orders in print" value={(data?.inPrint ?? 0) + (data?.pendingOrders ? ` · ${data.pendingOrders} new` : '')} loading={loading && !data} />
        </div>
      )}
      {/* Pay now — letterhead ka pending alag dikhta hai (ID card wala upar ke panel mein) */}
      {hasActivity && pendingPaise > 0 && (
        <div className="mt-4">
          <p className="mb-1.5 text-xs font-semibold text-teal-800">Pay for letterhead printing: {formatPaise(pendingPaise)}</p>
          <PayNowCard pendingAmount={pendingPaise / 100} />
        </div>
      )}
    </section>
  );
};

export default LetterheadPrintOrgPanel;

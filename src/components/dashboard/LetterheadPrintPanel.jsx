// LetterheadPrintPanel.jsx — Super Admin dashboard: "Letterhead printing" (teal). Apne totals — ID card revenue mein
// kabhi nahi jodte. Data: /dashboard/super-admin ka letterheadPrint block.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, ArrowRight, Inbox, PackageCheck, BadgeIndianRupee, CheckCircle2, Receipt } from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';
import { formatPaise } from '../../constants/letterheadCommission.js';

const Stat = ({ icon: Icon, label, value, loading }) => (
  <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-teal-100 bg-white p-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-teal-500 to-cyan-600 text-white shadow-md">
      <Icon className="h-5 w-5" />
    </div>
    <div className="min-w-0">
      <p className="truncate text-lg font-extrabold leading-tight text-slate-900">{loading ? '…' : value}</p>
      <p className="text-xs font-medium text-slate-500">{label}</p>
    </div>
  </div>
);

/**
 * @param {{ data: object|null|undefined, loading?: boolean }} props
 */
export const LetterheadPrintPanel = ({ data, loading = false }) => {
  const navigate = useNavigate();
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '');
  return (
    <section className="rounded-3xl border border-teal-200/80 bg-linear-to-br from-teal-50 via-white to-cyan-50 p-4 shadow-xs sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Printer className="h-4 w-4 text-teal-600" /> Letterhead printing
          <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-700">separate from ID cards · all time</span>
        </h2>
        <button
          type="button"
          onClick={() => navigate(ROUTES.LETTERHEAD_ORDERS)}
          className="group inline-flex items-center gap-1.5 rounded-xl bg-linear-to-r from-teal-600 to-cyan-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-teal-500/25 hover:shadow-lg"
        >
          Open orders <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
      {data === null && !loading ? (
        <p className="text-xs text-slate-500">Letterhead printing totals are not available right now.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <Stat icon={Inbox} label="New orders" value={data?.pendingOrders ?? 0} loading={loading && !data} />
            <Stat icon={Printer} label="In print" value={data?.inPrint ?? 0} loading={loading && !data} />
            <Stat icon={PackageCheck} label="Completed" value={data?.completed ?? 0} loading={loading && !data} />
            <Stat icon={BadgeIndianRupee} label="Pending payment" value={formatPaise(data?.pendingPaymentPaise)} loading={loading && !data} />
            <Stat icon={CheckCircle2} label="Paid" value={formatPaise(data?.paidPaise)} loading={loading && !data} />
          </div>
          {data?.lastPayment && (
            <p className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
              <Receipt className="h-3.5 w-3.5 text-teal-600" /> Last payment: <span className="font-semibold">{data.lastPayment.amount?.formatted}</span>
              {data.lastPayment.organisation?.name ? ` from ${data.lastPayment.organisation.name}` : ''} · {fmtDate(data.lastPayment.paidOn)}
            </p>
          )}
        </>
      )}
    </section>
  );
};

export default LetterheadPrintPanel;

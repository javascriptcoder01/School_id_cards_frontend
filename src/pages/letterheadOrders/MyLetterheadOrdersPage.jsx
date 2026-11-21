// MyLetterheadOrdersPage.jsx — School Admin: apne letterhead print orders (status tabs, cancel accept se pehle,
// PDF download, payment badge) + apne payments. Backend sirf apna organisation deta hai.
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ScrollText, RefreshCw, Download, Loader2, FilePenLine } from 'lucide-react';
import GradientRequestTabs from '../printRequests/GradientRequestTabs.jsx';
import {
  fetchLhOrdersRequested,
  lhOrderActionRequested,
  downloadLhOrderRequested,
  fetchLhPaymentsRequested,
  fetchLhMyRateRequested,
  selectLhOrders,
} from '../../features/letterheadOrders/letterheadOrdersSlice.js';
import { Chip, GhostButton } from '../../components/letterheadCommission/LhBits.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import { ROUTES } from '../../constants/routes.js';
import { LH_ORDER_TABS, LH_ORDER_STATUS_VIEW, LH_PAYMENT_STATUS_VIEW, LH_METHOD_LABEL, rateSummary } from '../../constants/letterheadCommission.js';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const TABS = [{ key: 'ALL', label: 'All', status: '', tone: 'indigo' }, ...LH_ORDER_TABS.filter((t) => !['ALL'].includes(t.key))];

export const MyLetterheadOrdersPage = () => {
  const dispatch = useDispatch();
  const { list, actionId, payments, myRate } = useSelector(selectLhOrders);
  const [tab, setTab] = useState('ALL');
  const [page, setPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState(null);

  const tabDef = TABS.find((t) => t.key === tab);
  const isPayments = tab === 'PAYMENTS';
  const params = useMemo(() => ({ status: tabDef?.status || undefined, page, limit: 20 }), [tabDef, page]);

  useEffect(() => {
    dispatch(fetchLhMyRateRequested());
  }, [dispatch]);
  useEffect(() => {
    if (isPayments) dispatch(fetchLhPaymentsRequested({ page, limit: 20 }));
    else dispatch(fetchLhOrdersRequested(params));
  }, [dispatch, isPayments, params, page]);

  const rate = myRate.data?.resolved?.rate;
  const pagination = isPayments ? payments.pagination : list.pagination;

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-teal-900 to-cyan-800 px-4 py-3.5 text-white shadow-xl sm:px-5">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-teal-400/25 blur-3xl" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-teal-400 to-cyan-500 shadow-lg ring-1 ring-white/30">
              <ScrollText className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-black tracking-tight sm:text-2xl">My letterhead orders</h1>
              <p className="text-xs text-teal-100">
                {rate ? `Your print rate: ${rateSummary(rate)}${rate.gstPercent ? ` + GST ${rate.gstPercent}%` : ''}` : myRate.data?.rateMissing ? 'Print rate not set yet' : 'Letterhead & document printing'}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link to={ROUTES.DOCUMENTS} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white px-3 text-sm font-bold text-teal-700 shadow-md hover:bg-teal-50">
              <FilePenLine className="h-4 w-4" /> Documents
            </Link>
            <button
              type="button"
              onClick={() => (isPayments ? dispatch(fetchLhPaymentsRequested({ page, limit: 20 })) : dispatch(fetchLhOrdersRequested(params)))}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 hover:bg-white/20"
              aria-label="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${list.loading || payments.loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </section>

      <GradientRequestTabs
        tabs={TABS.map((t) => ({ key: t.key, label: t.key === 'PAYMENTS' ? 'My payments' : t.label, tone: t.tone }))}
        active={tab}
        onChange={(k) => {
          setTab(k);
          setPage(1);
        }}
        ariaLabel="My letterhead order status"
      />

      {!isPayments && list.error && <ErrorMessage message={list.error} title="Couldn't load your orders" />}
      {isPayments && payments.error && <ErrorMessage message={payments.error} title="Couldn't load payments" />}

      {isPayments ? (
        !payments.items.length ? (
          <p className="rounded-2xl border border-dashed border-teal-200 bg-white py-10 text-center text-sm text-slate-500">{payments.loading ? 'Loading…' : 'No payments recorded yet.'}</p>
        ) : (
          <ul className="space-y-2">
            {payments.items.map((p) => (
              <li key={p.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
                <p className="text-sm font-bold text-slate-900">
                  <span className="font-mono">{p.paymentNumber}</span> · {p.amount?.formatted}
                  {p.reversed && <Chip tone="red" className="ml-1.5">Undone</Chip>}
                </p>
                <p className="text-[11px] text-slate-500">
                  {LH_METHOD_LABEL[p.method]}{p.referenceNo ? ` · ${p.referenceNo}` : ''} · {fmtDate(p.paidOn)} · {p.orderIds.length} order{p.orderIds.length > 1 ? 's' : ''}
                </p>
              </li>
            ))}
          </ul>
        )
      ) : list.loading && !list.items.length ? (
        <p className="flex items-center justify-center gap-2 rounded-2xl bg-white py-10 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading orders…</p>
      ) : !list.items.length ? (
        <div className="rounded-2xl border border-dashed border-teal-200 bg-white px-4 py-10 text-center">
          <p className="text-sm font-bold text-slate-800">No print orders here</p>
          <p className="mt-0.5 text-xs text-slate-500">Open a document and choose “Send to print”.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {list.items.map((o) => (
            <li key={o.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-mono text-xs font-bold text-slate-900">{o.orderNumber}</p>
                  <p className="truncate font-mono text-[11px] text-slate-500">Ref {o.refNo}</p>
                </div>
                <p className="shrink-0 text-base font-black text-slate-900">{o.pricing?.total?.formatted}</p>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                {o.pages}p × {o.copies} · {o.colour === 'BW' ? 'B/W' : 'Colour'}{o.doubleSided ? ' · 2-sided' : ''} · {fmtDate(o.createdAt)}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                <Chip tone={LH_ORDER_STATUS_VIEW[o.status]?.tone}>{LH_ORDER_STATUS_VIEW[o.status]?.label}</Chip>
                <Chip tone={LH_PAYMENT_STATUS_VIEW[o.payment?.status]?.tone}>{LH_PAYMENT_STATUS_VIEW[o.payment?.status]?.label}</Chip>
              </div>
              {o.declineReason && <p className="mt-1 text-[11px] text-rose-600">Declined: {o.declineReason}</p>}
              <div className="mt-2 flex flex-wrap items-center justify-end gap-1.5">
                {actionId === o.id && <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-600" />}
                {o.status === 'SUBMITTED' && (
                  <button type="button" disabled={actionId === o.id} onClick={() => setCancelTarget(o)} className="rounded-lg bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50">
                    Cancel
                  </button>
                )}
                {!['DECLINED', 'CANCELLED'].includes(o.status) && (
                  <button type="button" onClick={() => dispatch(downloadLhOrderRequested({ id: o.id, orderNumber: o.orderNumber }))} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200">
                    <Download className="h-3.5 w-3.5" /> PDF
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {pagination?.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-600">
          <GhostButton disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-2.5 py-1 text-xs">Prev</GhostButton>
          Page {page} of {pagination.totalPages}
          <GhostButton disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)} className="px-2.5 py-1 text-xs">Next</GhostButton>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title={cancelTarget ? `Cancel ${cancelTarget.orderNumber}?` : ''}
        message="The order is withdrawn before printing. Nothing will be charged."
        confirmLabel="Cancel order"
        variant="danger"
        isConfirming={Boolean(cancelTarget && actionId === cancelTarget.id)}
        onConfirm={() => dispatch(lhOrderActionRequested({ id: cancelTarget.id, action: 'cancel', onSuccess: () => setCancelTarget(null) }))}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
};

export default MyLetterheadOrdersPage;

// LetterheadOrdersPage.jsx — Super Admin: letterhead print orders (ID card Print Center se alag list).
// Tabs: New / In Print / Completed / Declined / All / Payments. Actions: Accept, Decline (reason), Printing, Complete,
// Download PDF, Mark as Paid (LetterheadPayment), Undo payment.
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Printer, RefreshCw, Download, Loader2, Search, BadgeIndianRupee, Undo2, Settings2 } from 'lucide-react';
import GradientRequestTabs from '../printRequests/GradientRequestTabs.jsx';
import {
  fetchLhOrdersRequested,
  lhOrderActionRequested,
  downloadLhOrderRequested,
  fetchLhPaymentsRequested,
  lhUndoPaymentRequested,
  clearLhOrderErrors,
  selectLhOrders,
} from '../../features/letterheadOrders/letterheadOrdersSlice.js';
import { fetchLhCollegesRequested, selectLhCommission } from '../../features/letterheadCommission/letterheadCommissionSlice.js';
import { LhMarkPaidModal, ReasonModal } from '../../components/letterheadOrders/LhOrderModals.jsx';
import { Chip, inputCls, GhostButton } from '../../components/letterheadCommission/LhBits.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import ProofButton from '../../components/commission/ProofButton.jsx';
import { ROUTES } from '../../constants/routes.js';
import { LH_ORDER_TABS, LH_ORDER_STATUS_VIEW, LH_PAYMENT_STATUS_VIEW, LH_METHOD_LABEL } from '../../constants/letterheadCommission.js';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const StatusChip = ({ status }) => <Chip tone={LH_ORDER_STATUS_VIEW[status]?.tone}>{LH_ORDER_STATUS_VIEW[status]?.label || status}</Chip>;
const PayChip = ({ payment }) => <Chip tone={LH_PAYMENT_STATUS_VIEW[payment?.status]?.tone}>{LH_PAYMENT_STATUS_VIEW[payment?.status]?.label || '—'}</Chip>;

// Har status par kaunse buttons
const OrderActions = ({ order, busy, onAction, onDecline, onDownload, onMarkPaid }) => {
  const btn = 'rounded-lg px-2.5 py-1 text-[11px] font-bold disabled:opacity-50';
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      {busy && <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-600" />}
      {order.status === 'SUBMITTED' && (
        <button type="button" disabled={busy} onClick={() => onAction('accept')} className={`${btn} bg-teal-600 text-white hover:bg-teal-700`}>Accept</button>
      )}
      {order.status === 'ACCEPTED' && (
        <button type="button" disabled={busy} onClick={() => onAction('printing')} className={`${btn} bg-violet-600 text-white hover:bg-violet-700`}>Printing</button>
      )}
      {order.status === 'PRINTING' && (
        <button type="button" disabled={busy} onClick={() => onAction('complete')} className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700`}>Complete</button>
      )}
      {['SUBMITTED', 'ACCEPTED'].includes(order.status) && order.payment?.status !== 'PAID' && (
        <button type="button" disabled={busy} onClick={onDecline} className={`${btn} bg-rose-50 text-rose-700 hover:bg-rose-100`}>Decline</button>
      )}
      {order.payment?.status === 'PENDING' && (
        <button type="button" disabled={busy} onClick={onMarkPaid} className={`${btn} bg-amber-50 text-amber-800 hover:bg-amber-100`}>Mark paid</button>
      )}
      {!['DECLINED', 'CANCELLED'].includes(order.status) && (
        <button type="button" onClick={onDownload} className={`${btn} bg-slate-100 text-slate-700 hover:bg-slate-200`} aria-label={`Download PDF ${order.orderNumber}`}>
          <Download className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

export const LetterheadOrdersPage = () => {
  const dispatch = useDispatch();
  const { list, actionId, payments, undo } = useSelector(selectLhOrders);
  const { colleges } = useSelector(selectLhCommission);
  const [tab, setTab] = useState('NEW');
  const [page, setPage] = useState(1);
  const [collegeId, setCollegeId] = useState('');
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [declineTarget, setDeclineTarget] = useState(null);
  const [markPaidOrg, setMarkPaidOrg] = useState(null);
  const [undoTarget, setUndoTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchLhCollegesRequested());
  }, [dispatch]);
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const tabDef = LH_ORDER_TABS.find((t) => t.key === tab);
  const isPayments = tab === 'PAYMENTS';
  const params = useMemo(() => ({ status: tabDef?.status || undefined, collegeId: collegeId || undefined, q: q || undefined, page, limit: 20 }), [tabDef, collegeId, q, page]);
  useEffect(() => {
    if (isPayments) dispatch(fetchLhPaymentsRequested({ collegeId: collegeId || undefined, page, limit: 20 }));
    else dispatch(fetchLhOrdersRequested(params));
  }, [dispatch, isPayments, params, collegeId, page]);

  const refresh = () => (isPayments ? dispatch(fetchLhPaymentsRequested({ collegeId: collegeId || undefined, page, limit: 20 })) : dispatch(fetchLhOrdersRequested(params)));
  const pagination = isPayments ? payments.pagination : list.pagination;
  const act = (order, action, reason, onSuccess) => dispatch(lhOrderActionRequested({ id: order.id, action, reason, onSuccess }));
  const openMarkPaid = (order) => setMarkPaidOrg({ collegeId: order.organisation?.id, name: order.organisation?.name || 'Organisation', preselect: [order.id] });

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-teal-900 to-cyan-800 px-4 py-3.5 text-white shadow-xl sm:px-5">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-teal-400/25 blur-3xl" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-teal-400 to-cyan-500 shadow-lg ring-1 ring-white/30">
              <Printer className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-black tracking-tight sm:text-2xl">Letterhead Orders</h1>
              <p className="text-xs text-teal-100">Letterhead &amp; document printing · separate from ID card Print Center</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link to={ROUTES.LETTERHEAD_RATES} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white/10 px-3 text-xs font-bold ring-1 ring-white/20 hover:bg-white/20">
              <Settings2 className="h-3.5 w-3.5" /> Rates
            </Link>
            <button type="button" onClick={refresh} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 hover:bg-white/20" aria-label="Refresh">
              <RefreshCw className={`h-4 w-4 ${list.loading || payments.loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </section>

      <GradientRequestTabs
        tabs={LH_ORDER_TABS.map((t) => ({ key: t.key, label: t.label, tone: t.tone }))}
        active={tab}
        onChange={(k) => {
          setTab(k);
          setPage(1);
        }}
        ariaLabel="Letterhead order status"
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <select value={collegeId} onChange={(e) => { setCollegeId(e.target.value); setPage(1); }} className={`${inputCls} sm:w-64`} aria-label="Organisation">
          <option value="">All organisations</option>
          {colleges.items.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {!isPayments && (
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Order no. or ref no." className={`${inputCls} pl-9`} aria-label="Search orders" />
          </div>
        )}
        {isPayments && collegeId && (
          <button
            type="button"
            onClick={() => setMarkPaidOrg({ collegeId, name: colleges.items.find((c) => c.id === collegeId)?.name || 'Organisation' })}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-sm font-bold text-white hover:bg-amber-600"
          >
            <BadgeIndianRupee className="h-4 w-4" /> Mark as Paid
          </button>
        )}
      </div>

      {!isPayments && list.error && <ErrorMessage message={list.error} title="Couldn't load orders" />}
      {isPayments && payments.error && <ErrorMessage message={payments.error} title="Couldn't load payments" />}

      {isPayments ? (
        payments.loading && !payments.items.length ? (
          <p className="flex items-center justify-center gap-2 rounded-2xl bg-white py-10 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading payments…</p>
        ) : !payments.items.length ? (
          <p className="rounded-2xl border border-dashed border-teal-200 bg-white py-10 text-center text-sm text-slate-500">No letterhead payments yet{collegeId ? ' for this organisation' : ''}.</p>
        ) : (
          <ul className="space-y-2">
            {payments.items.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">
                    <span className="font-mono">{p.paymentNumber}</span> · {p.amount?.formatted}
                    {p.reversed && <Chip tone="red" className="ml-1.5">Undone</Chip>}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {p.organisation?.name} · {LH_METHOD_LABEL[p.method]}{p.referenceNo ? ` · ${p.referenceNo}` : ''} · {fmtDate(p.paidOn)} · {p.orderIds.length} order{p.orderIds.length > 1 ? 's' : ''}
                    {p.reversed ? ` · undone: “${p.reversed.reason}”` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {p.proof?.url && <ProofButton path={`/letterhead-orders/payments/${p.id}/proof`} isPdf={/\/raw\/upload\/|\.pdf($|\?)/i.test(p.proof.url)} className="text-xs font-semibold text-teal-700" />}
                  {!p.reversed && (
                    <button type="button" onClick={() => { dispatch(clearLhOrderErrors()); setUndoTarget(p); }} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200">
                      <Undo2 className="h-3.5 w-3.5" /> Undo
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )
      ) : list.loading && !list.items.length ? (
        <p className="flex items-center justify-center gap-2 rounded-2xl bg-white py-10 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading orders…</p>
      ) : !list.items.length ? (
        <p className="rounded-2xl border border-dashed border-teal-200 bg-white py-10 text-center text-sm text-slate-500">No orders here.</p>
      ) : (
        <>
          {/* Mobile cards */}
          <ul className="space-y-2 md:hidden">
            {list.items.map((o) => (
              <li key={o.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-bold text-slate-900">{o.orderNumber}</p>
                    <p className="truncate text-sm font-semibold text-slate-800">{o.organisation?.name}</p>
                  </div>
                  <p className="shrink-0 text-sm font-black text-slate-900">{o.pricing?.total?.formatted}</p>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Ref {o.refNo} · {o.pages}p × {o.copies} · {o.colour === 'BW' ? 'B/W' : 'Colour'}{o.doubleSided ? ' · 2-sided' : ''} · {fmtDate(o.createdAt)}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1"><StatusChip status={o.status} /><PayChip payment={o.payment} /></div>
                {o.declineReason && <p className="mt-1 text-[11px] text-rose-600">Declined: {o.declineReason}</p>}
                <div className="mt-2">
                  <OrderActions order={o} busy={actionId === o.id} onAction={(a) => act(o, a)} onDecline={() => setDeclineTarget(o)} onDownload={() => dispatch(downloadLhOrderRequested({ id: o.id, orderNumber: o.orderNumber }))} onMarkPaid={() => openMarkPaid(o)} />
                </div>
              </li>
            ))}
          </ul>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Order</th>
                  <th className="px-3 py-2">Organisation</th>
                  <th className="px-3 py-2">Ref no.</th>
                  <th className="px-3 py-2">Pages × copies</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.items.map((o) => (
                  <tr key={o.id} className="align-top hover:bg-slate-50/60">
                    <td className="whitespace-nowrap px-3 py-2">
                      <p className="font-mono text-xs font-bold text-slate-900">{o.orderNumber}</p>
                      <p className="text-[11px] text-slate-400">{fmtDate(o.createdAt)}</p>
                    </td>
                    <td className="max-w-48 truncate px-3 py-2 text-xs">{o.organisation?.name}</td>
                    <td className="max-w-40 truncate px-3 py-2 font-mono text-xs">{o.refNo}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs">
                      {o.pages} × {o.copies} · {o.colour === 'BW' ? 'B/W' : 'Colour'}{o.doubleSided ? ' · 2-sided' : ''}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 font-semibold">{o.pricing?.total?.formatted}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1"><StatusChip status={o.status} /><PayChip payment={o.payment} /></div>
                      {o.declineReason && <p className="mt-0.5 max-w-48 truncate text-[11px] text-rose-600" title={o.declineReason}>{o.declineReason}</p>}
                    </td>
                    <td className="px-3 py-2">
                      <OrderActions order={o} busy={actionId === o.id} onAction={(a) => act(o, a)} onDecline={() => setDeclineTarget(o)} onDownload={() => dispatch(downloadLhOrderRequested({ id: o.id, orderNumber: o.orderNumber }))} onMarkPaid={() => openMarkPaid(o)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {pagination?.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-600">
          <GhostButton disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-2.5 py-1 text-xs">Prev</GhostButton>
          Page {page} of {pagination.totalPages}
          <GhostButton disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)} className="px-2.5 py-1 text-xs">Next</GhostButton>
        </div>
      )}

      {declineTarget && (
        <ReasonModal
          title={`Decline ${declineTarget.orderNumber}?`}
          subtitle={declineTarget.organisation?.name}
          confirmLabel="Decline order"
          busy={actionId === declineTarget.id}
          onConfirm={(reason) => act(declineTarget, 'decline', reason, () => setDeclineTarget(null))}
          onClose={() => setDeclineTarget(null)}
        />
      )}
      {undoTarget && (
        <ReasonModal
          title={`Undo ${undoTarget.paymentNumber}?`}
          subtitle={`${undoTarget.amount?.formatted} · its orders go back to pending payment`}
          confirmLabel="Undo payment"
          tone="amber"
          busy={undo.saving}
          error={undo.error}
          onConfirm={(reason) => dispatch(lhUndoPaymentRequested({ paymentId: undoTarget.id, reason, onSuccess: () => setUndoTarget(null) }))}
          onClose={() => setUndoTarget(null)}
        />
      )}
      {markPaidOrg?.collegeId && <LhMarkPaidModal organisation={markPaidOrg} onClose={() => setMarkPaidOrg(null)} />}
    </div>
  );
};

export default LetterheadOrdersPage;

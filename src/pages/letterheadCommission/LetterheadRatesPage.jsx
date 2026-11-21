// LetterheadRatesPage.jsx — Super Admin: letterhead PRINT rates (ID card Commission page se alag).
// Global default card · sector rates (Schools, Clinics …) · organisation rates (search) · rate checker · history.
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Printer, Globe2, Layers, Building2, Search, History, Loader2, Calculator, RefreshCw, ArrowLeft } from 'lucide-react';
import {
  fetchLhRatesRequested,
  fetchLhHistoryRequested,
  endLhRateRequested,
  checkLhPriceRequested,
  fetchLhCollegesRequested,
  selectLhCommission,
} from '../../features/letterheadCommission/letterheadCommissionSlice.js';
import { LhRateEditorModal } from '../../components/letterheadCommission/LhRateEditorModal.jsx';
import { Chip, Field, inputCls, PrimaryButton, GhostButton } from '../../components/letterheadCommission/LhBits.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import { ROUTES } from '../../constants/routes.js';
import { LH_SECTORS, LH_SECTOR_LABEL, LH_SCOPE_LABEL, rateSummary, formatPaiseShort } from '../../constants/letterheadCommission.js';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

const RateDetails = ({ rate }) => (
  <div className="mt-1.5 flex flex-wrap gap-1">
    {rate.doubleSidedExtraPaise ? <Chip tone="slate">Double-sided +{formatPaiseShort(rate.doubleSidedExtraPaise)}/sheet</Chip> : null}
    {rate.minOrderPaise ? <Chip tone="slate">Min {formatPaiseShort(rate.minOrderPaise)}</Chip> : null}
    {rate.gstPercent ? <Chip tone="slate">GST {rate.gstPercent}%</Chip> : null}
    {rate.slabs?.length ? <Chip tone="violet">{rate.slabs.length} tier{rate.slabs.length > 1 ? 's' : ''}</Chip> : null}
    {rate.validFrom && new Date(rate.validFrom) > new Date() ? <Chip tone="amber">Starts {fmtDate(rate.validFrom)}</Chip> : null}
    {rate.validTill ? <Chip tone="amber">Till {fmtDate(rate.validTill)}</Chip> : null}
  </div>
);

const Actions = ({ rate, onSet, onHistory, onEnd, ending }) => (
  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
    <button type="button" onClick={onSet} className="text-teal-700 hover:underline">{rate ? 'Change' : 'Set'}</button>
    <button type="button" onClick={onHistory} className="text-slate-600 hover:underline">History</button>
    {rate && (
      <button type="button" onClick={onEnd} disabled={ending} className="text-rose-600 hover:underline disabled:opacity-50">
        {ending ? 'Ending…' : 'End'}
      </button>
    )}
  </div>
);

export const LetterheadRatesPage = () => {
  const dispatch = useDispatch();
  const { current, history, historyPagination, historyParams, historyLoading, loading, error, endingId, checker, colleges } = useSelector(selectLhCommission);
  const [editor, setEditor] = useState(null); // { target, current }
  const [endTarget, setEndTarget] = useState(null);
  const [orgSearch, setOrgSearch] = useState('');
  const [check, setCheck] = useState({ collegeId: '', pages: '2', copies: '100', colour: 'COLOUR', doubleSided: false });

  useEffect(() => {
    dispatch(fetchLhRatesRequested());
    dispatch(fetchLhHistoryRequested({ page: 1, limit: 10 }));
    dispatch(fetchLhCollegesRequested());
  }, [dispatch]);

  const globalRate = current.find((r) => r.scope === 'GLOBAL') || null;
  const sectorRate = useMemo(() => Object.fromEntries(current.filter((r) => r.scope === 'SEGMENT').map((r) => [r.segment, r])), [current]);
  const orgRate = useMemo(() => Object.fromEntries(current.filter((r) => r.scope === 'ORGANISATION').map((r) => [r.organisation?.id, r])), [current]);

  const orgs = useMemo(() => {
    const q = orgSearch.trim().toLowerCase();
    const list = colleges.items.filter((c) => !q || c.name.toLowerCase().includes(q) || String(c.code || '').toLowerCase().includes(q));
    // Apne rate wale pehle
    return list.sort((a, b) => Number(Boolean(orgRate[b.id])) - Number(Boolean(orgRate[a.id]))).slice(0, 25);
  }, [colleges.items, orgSearch, orgRate]);

  // label sirf UI ke liye (saga API se pehle hata deta hai)
  const showHistory = (filter, label) => dispatch(fetchLhHistoryRequested({ ...filter, page: 1, limit: 10, label }));
  const historyLabel = historyParams?.label || 'All rates';
  const gotoHistoryPage = (page) => dispatch(fetchLhHistoryRequested({ ...(historyParams || {}), page }));

  const runCheck = () => {
    if (!check.collegeId) return;
    dispatch(checkLhPriceRequested({ params: { collegeId: check.collegeId, pages: check.pages, copies: check.copies, colour: check.colour, doubleSided: check.doubleSided } }));
  };

  const inheritedFor = (org) => {
    const sector = sectorRate[org.segment || 'ACADEMIC'];
    if (sector) return { tone: 'blue', text: `Inherited from Sector: ${LH_SECTOR_LABEL[org.segment || 'ACADEMIC']} ${rateSummary(sector)}` };
    if (globalRate) return { tone: 'slate', text: `Inherited from Global ${rateSummary(globalRate)}` };
    return { tone: 'red', text: 'No rate — orders cannot be submitted' };
  };

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
              <h1 className="truncate text-xl font-black tracking-tight sm:text-2xl">Letterhead Rates</h1>
              <p className="text-xs text-teal-100">Printing letterheads &amp; documents · separate from ID card commission</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link to={ROUTES.COMMISSION} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white/10 px-3 text-xs font-bold ring-1 ring-white/20 hover:bg-white/20">
              <ArrowLeft className="h-3.5 w-3.5" /> ID card commission
            </Link>
            <button type="button" onClick={() => dispatch(fetchLhRatesRequested())} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 hover:bg-white/20" aria-label="Refresh">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </section>

      {error && <ErrorMessage message={error} title="Couldn't load letterhead rates" />}

      {/* Global */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Globe2 className="h-4 w-4 text-teal-600" /> Global default
            </h2>
            {globalRate ? (
              <>
                <p className="mt-1 text-2xl font-black text-slate-900">{rateSummary(globalRate)}</p>
                <RateDetails rate={globalRate} />
              </>
            ) : (
              <p className="mt-1 text-sm font-semibold text-amber-700">Not set — organisations without a sector or own rate cannot submit print orders.</p>
            )}
          </div>
          <Actions
            rate={globalRate}
            ending={endingId === globalRate?.id}
            onSet={() => setEditor({ target: { scope: 'GLOBAL', title: 'Global default rate', subtitle: 'Used when no sector or organisation rate applies' }, current: globalRate })}
            onHistory={() => showHistory({ scope: 'GLOBAL' }, 'Global default')}
            onEnd={() => setEndTarget(globalRate)}
          />
        </div>
      </section>

      {/* Sectors */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
          <Layers className="h-4 w-4 text-teal-600" /> Sector rates
        </h2>
        <ul className="divide-y divide-slate-100">
          {LH_SECTORS.map((s) => {
            const rate = sectorRate[s.value] || null;
            return (
              <li key={s.value} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800">{s.label}</p>
                  {rate ? (
                    <>
                      <p className="text-xs font-semibold text-teal-700">{rateSummary(rate)}</p>
                      <RateDetails rate={rate} />
                    </>
                  ) : (
                    <Chip tone="slate" className="mt-0.5">Uses global{globalRate ? ` · ${rateSummary(globalRate)}` : ''}</Chip>
                  )}
                </div>
                <Actions
                  rate={rate}
                  ending={endingId === rate?.id}
                  onSet={() => setEditor({ target: { scope: 'SEGMENT', segment: s.value, title: `Sector rate — ${s.label}`, subtitle: 'Used by every organisation of this type without its own rate' }, current: rate || globalRate })}
                  onHistory={() => showHistory({ scope: 'SEGMENT', segment: s.value }, `Sector: ${s.label}`)}
                  onEnd={() => setEndTarget(rate)}
                />
              </li>
            );
          })}
        </ul>
      </section>

      {/* Organisations */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Building2 className="h-4 w-4 text-teal-600" /> Organisation rates
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={orgSearch} onChange={(e) => setOrgSearch(e.target.value)} placeholder="Search organisation" className={`${inputCls} pl-9`} aria-label="Search organisation" />
          </div>
        </div>
        {colleges.loading && !colleges.items.length ? (
          <p className="flex items-center gap-2 text-xs text-slate-500"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading organisations…</p>
        ) : !orgs.length ? (
          <p className="text-xs text-slate-500">No organisations found.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {orgs.map((org) => {
              const rate = orgRate[org.id] || null;
              const inherited = rate ? null : inheritedFor(org);
              return (
                <li key={org.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-800">
                      {org.name} <span className="font-mono text-[11px] font-semibold text-slate-400">{org.code}</span>
                    </p>
                    <p className="text-[11px] text-slate-500">{LH_SECTOR_LABEL[org.segment || 'ACADEMIC']}</p>
                    {rate ? (
                      <>
                        <p className="text-xs font-semibold text-teal-700">Own rate · {rateSummary(rate)}</p>
                        <RateDetails rate={rate} />
                      </>
                    ) : (
                      <Chip tone={inherited.tone} className="mt-0.5 max-w-full whitespace-normal">{inherited.text}</Chip>
                    )}
                  </div>
                  <Actions
                    rate={rate}
                    ending={endingId === rate?.id}
                    onSet={() => setEditor({ target: { scope: 'ORGANISATION', collegeId: org.id, title: `Organisation rate — ${org.name}`, subtitle: 'Used instead of the sector and global rates' }, current: rate || sectorRate[org.segment || 'ACADEMIC'] || globalRate })}
                    onHistory={() => showHistory({ scope: 'ORGANISATION', collegeId: org.id }, org.name)}
                    onEnd={() => setEndTarget(rate)}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Rate checker */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
          <Calculator className="h-4 w-4 text-teal-600" /> Rate checker
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
          <div className="col-span-2">
            <Field label="Organisation" htmlFor="chk-org">
              <select id="chk-org" value={check.collegeId} onChange={(e) => setCheck({ ...check, collegeId: e.target.value })} className={inputCls}>
                <option value="">Choose…</option>
                {colleges.items.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Pages" htmlFor="chk-pages">
            <input id="chk-pages" inputMode="numeric" value={check.pages} onChange={(e) => setCheck({ ...check, pages: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Copies" htmlFor="chk-copies">
            <input id="chk-copies" inputMode="numeric" value={check.copies} onChange={(e) => setCheck({ ...check, copies: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Colour" htmlFor="chk-colour">
            <select id="chk-colour" value={check.colour} onChange={(e) => setCheck({ ...check, colour: e.target.value })} className={inputCls}>
              <option value="COLOUR">Colour</option>
              <option value="BW">B/W</option>
            </select>
          </Field>
          <div className="flex items-end gap-2">
            <label className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
              <input type="checkbox" checked={check.doubleSided} onChange={(e) => setCheck({ ...check, doubleSided: e.target.checked })} /> 2-sided
            </label>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <PrimaryButton onClick={runCheck} disabled={!check.collegeId || checker.loading}>
            {checker.loading && <Loader2 className="h-4 w-4 animate-spin" />} Check price
          </PrimaryButton>
          {checker.error && <p className="text-xs font-semibold text-rose-600">{checker.error}</p>}
        </div>
        {checker.result && !checker.error && (
          <div className="mt-3 rounded-2xl bg-teal-50/60 p-3">
            {checker.result.rateMissing ? (
              <p className="text-sm font-semibold text-amber-700">{checker.result.message || 'Letterhead print rate is not set yet'}</p>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-slate-800">
                    {checker.result.organisation?.name} · winning level{' '}
                    <Chip tone="teal">
                      {LH_SCOPE_LABEL[checker.result.resolved.scope]}
                      {checker.result.resolved.scope === 'SEGMENT' ? `: ${LH_SECTOR_LABEL[checker.result.resolved.rate.segment]}` : ''}
                    </Chip>
                  </p>
                  <p className="text-xl font-black text-teal-800">{checker.result.amount.total.formatted}</p>
                </div>
                <ul className="mt-2 space-y-0.5 text-xs text-slate-600">
                  {checker.result.amount.breakdown.map((b) => (
                    <li key={b.key} className="flex justify-between gap-2">
                      <span className="min-w-0">{b.label}</span>
                      <span className="shrink-0 font-semibold">{b.formatted}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </section>

      {/* History */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <History className="h-4 w-4 text-teal-600" /> Rate history · <span className="font-semibold text-slate-500">{historyLabel}</span>
          </h2>
          {historyParams?.scope && <GhostButton onClick={() => showHistory({}, 'All rates')} className="px-2.5 py-1 text-xs">Show all</GhostButton>}
        </div>
        {historyLoading && !history.length ? (
          <p className="flex items-center gap-2 text-xs text-slate-500"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…</p>
        ) : !history.length ? (
          <p className="text-xs text-slate-500">No rates yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {history.map((r) => (
              <li key={r.id} className="flex flex-wrap items-start justify-between gap-2 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    {rateSummary(r)}{' '}
                    <span className="text-xs font-medium text-slate-500">
                      · {LH_SCOPE_LABEL[r.scope]}
                      {r.segment ? `: ${LH_SECTOR_LABEL[r.segment]}` : ''}
                      {r.organisation?.name ? `: ${r.organisation.name}` : ''}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    From {fmtDate(r.validFrom)}
                    {r.endedAt ? ` · ended ${fmtDate(r.endedAt)}${r.endedBy?.name ? ` by ${r.endedBy.name}` : ''}` : ''}
                    {r.createdBy?.name ? ` · set by ${r.createdBy.name}` : ''}
                    {r.note ? ` · “${r.note}”` : ''}
                  </p>
                </div>
                {r.isActive ? <Chip tone="emerald">Active</Chip> : <Chip tone="slate">Ended</Chip>}
              </li>
            ))}
          </ul>
        )}
        {historyPagination.totalPages > 1 && (
          <div className="mt-3 flex items-center justify-center gap-2 text-xs font-bold text-slate-600">
            <GhostButton disabled={historyPagination.page <= 1} onClick={() => gotoHistoryPage(historyPagination.page - 1)} className="px-2.5 py-1 text-xs">Prev</GhostButton>
            Page {historyPagination.page} of {historyPagination.totalPages}
            <GhostButton disabled={historyPagination.page >= historyPagination.totalPages} onClick={() => gotoHistoryPage(historyPagination.page + 1)} className="px-2.5 py-1 text-xs">Next</GhostButton>
          </div>
        )}
      </section>

      {editor && <LhRateEditorModal target={editor.target} current={editor.current} onClose={() => setEditor(null)} />}

      <ConfirmDialog
        open={Boolean(endTarget)}
        title="End this rate?"
        message={endTarget ? `${rateSummary(endTarget)} (${LH_SCOPE_LABEL[endTarget.scope]}) ends now. The next broader level applies to new orders; orders already submitted keep their locked price. ` : ''}
        confirmLabel="End rate"
        variant="warning"
        isConfirming={Boolean(endTarget && endingId === endTarget.id)}
        onConfirm={() => dispatch(endLhRateRequested({ id: endTarget.id, onSuccess: () => setEndTarget(null) }))}
        onCancel={() => setEndTarget(null)}
      />
    </div>
  );
};

export default LetterheadRatesPage;

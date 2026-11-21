// DocumentHistoryPage.jsx — banaye gaye documents: filters (type, date, ref no / subject search), saved copy
// re-download. Table (md+) / cards (mobile). Class Teacher sirf apne; Super Admin school chunkar.
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { History, Plus, Search, Download, Loader2, RefreshCw, FileText, ChevronLeft, ChevronRight, Printer } from 'lucide-react';
import { fetchDocumentsRequested, downloadDocumentRequested } from '../../features/documents/documentSlice.js';
import { selectDocumentHistory, selectDocumentDownloadingId } from '../../features/documents/documentSelectors.js';
import { fetchCollegeOptionsRequested } from '../../features/letterheads/letterheadSlice.js';
import { selectLetterheadCollegeOptions } from '../../features/letterheads/letterheadSelectors.js';
import { selectUserRole } from '../../features/auth/authSelectors.js';
import { ROUTES } from '../../constants/routes.js';
import { DOC_TYPES, DOC_TYPE_LABEL } from '../../constants/documents.js';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import SendToPrintModal from '../../components/letterheadOrders/SendToPrintModal.jsx';

const PAGE_SIZE = 20;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100';

// School Admin: saved copy wale document ko print order
const PrintButton = ({ doc, onPrint }) =>
  onPrint && doc.hasCopy ? (
    <button type="button" onClick={() => onPrint(doc)} className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-700 hover:bg-teal-100">
      <Printer className="h-3 w-3" /> Print
    </button>
  ) : null;

const DownloadButton = ({ doc, busy, onDownload }) =>
  doc.hasCopy ? (
    <button
      type="button"
      onClick={() => onDownload(doc)}
      disabled={busy}
      className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 disabled:opacity-60"
    >
      {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />} PDF
    </button>
  ) : (
    <span className="text-[11px] text-slate-400" title="“Save a copy” was off when this was generated">No copy</span>
  );

export const DocumentHistoryPage = () => {
  const dispatch = useDispatch();
  const role = useSelector(selectUserRole);
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const { items, pagination, loading, error } = useSelector(selectDocumentHistory);
  const downloadingId = useSelector(selectDocumentDownloadingId);
  const { items: colleges } = useSelector(selectLetterheadCollegeOptions);

  const [docType, setDocType] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [page, setPage] = useState(1);
  const [printDoc, setPrintDoc] = useState(null);
  const onPrint = role === 'COLLEGE_ADMIN' ? (doc) => setPrintDoc({ documentId: doc.id, refNo: doc.refNo }) : null;

  // Search 400 ms debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (isSuperAdmin) dispatch(fetchCollegeOptionsRequested());
  }, [dispatch, isSuperAdmin]);

  const dateError = from && to && to < from ? '“To” must be on or after “From”' : null;
  const params = useMemo(
    () => ({ docType: docType || undefined, from: from || undefined, to: to || undefined, q: q || undefined, collegeId: collegeId || undefined, page, limit: PAGE_SIZE }),
    [docType, from, to, q, collegeId, page]
  );
  useEffect(() => {
    if (!dateError) dispatch(fetchDocumentsRequested(params));
  }, [dispatch, params, dateError]);

  const filter = (fn) => (value) => {
    fn(value);
    setPage(1);
  };
  const onDownload = (doc) => dispatch(downloadDocumentRequested({ id: doc.id, refNo: doc.refNo }));
  const collegeName = useMemo(() => Object.fromEntries(colleges.map((c) => [c.id, c.name])), [colleges]);
  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-indigo-900 to-violet-800 px-4 py-3.5 text-white shadow-xl sm:px-5">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-400 via-violet-500 to-fuchsia-500 shadow-lg ring-1 ring-white/30">
              <History className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-black tracking-tight sm:text-2xl">Documents</h1>
              <p className="mt-0.5 text-xs text-indigo-200">{Number(pagination?.total || 0).toLocaleString('en-IN')} generated</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={() => dispatch(fetchDocumentsRequested(params))} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 hover:bg-white/20" aria-label="Refresh">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link to={ROUTES.DOCUMENT_NEW} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white px-3 text-sm font-bold text-indigo-700 shadow-md hover:bg-indigo-50">
              <Plus className="h-4 w-4" /> New document
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs md:grid-cols-5">
        <div className="relative col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ref. no. or subject" maxLength={100} className={`${inputClass} pl-9`} aria-label="Search" />
        </div>
        <select value={docType} onChange={(e) => filter(setDocType)(e.target.value)} className={`${inputClass} col-span-2 md:col-span-1`} aria-label="Document type">
          <option value="">All types</option>
          {DOC_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <input type="date" value={from} onChange={(e) => filter(setFrom)(e.target.value)} className={inputClass} aria-label="From date" />
        <input type="date" value={to} onChange={(e) => filter(setTo)(e.target.value)} className={inputClass} aria-label="To date" />
        {isSuperAdmin && (
          <select value={collegeId} onChange={(e) => filter(setCollegeId)(e.target.value)} className={`${inputClass} col-span-2 md:col-span-5`} aria-label="School">
            <option value="">All schools</option>
            {colleges.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.code ? `(${c.code})` : ''}
              </option>
            ))}
          </select>
        )}
        {dateError && <p className="col-span-2 text-[11px] font-semibold text-rose-600 md:col-span-5">{dateError}</p>}
      </div>

      {error && <ErrorMessage message={error} title="Could not load documents" />}

      {loading && !items.length ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-10 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading documents…
        </div>
      ) : !items.length ? (
        <div className="rounded-2xl border border-dashed border-indigo-200 bg-linear-to-br from-white to-indigo-50/60 px-4 py-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-lg">
            <FileText className="h-6 w-6" />
          </span>
          <p className="mt-3 text-sm font-bold text-slate-800">No documents found</p>
          <p className="mt-0.5 text-xs text-slate-500">Generate a letter or certificate, or change the filters.</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-2 md:hidden">
            {items.map((d) => (
              <article key={d.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 truncate font-mono text-xs font-bold text-slate-900">{d.refNo}</p>
                  <div className="flex items-center gap-1.5">
                    <PrintButton doc={d} onPrint={onPrint} />
                    <DownloadButton doc={d} busy={downloadingId === d.id} onDownload={onDownload} />
                  </div>
                </div>
                <p className="mt-1 truncate text-sm font-semibold text-slate-800">{d.subject || '(no subject)'}</p>
                <div className="mt-1.5 flex flex-wrap gap-1 text-[10px] font-bold">
                  <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-indigo-700">{DOC_TYPE_LABEL[d.docType] || d.docType}</span>
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-slate-600">{fmtDate(d.date)}</span>
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-slate-600">{d.pageCount || 1} page(s)</span>
                  {d.recipient?.name && <span className="truncate rounded-md bg-slate-100 px-1.5 py-0.5 text-slate-600">To: {d.recipient.name}</span>}
                </div>
                {isSuperAdmin && !collegeId && <p className="mt-1 truncate text-[10px] text-slate-400">{collegeName[d.collegeId] || ''}</p>}
              </article>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Ref. no.</th>
                  <th className="px-3 py-2">Subject</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Recipient</th>
                  {isSuperAdmin && !collegeId && <th className="px-3 py-2">School</th>}
                  <th className="px-3 py-2 text-right">Copy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/60">
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-xs font-bold text-slate-900">{d.refNo}</td>
                    <td className="max-w-64 truncate px-3 py-2 text-slate-800" title={d.subject || ''}>
                      {d.subject || <span className="text-slate-400">—</span>}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs">{DOC_TYPE_LABEL[d.docType] || d.docType}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs">{fmtDate(d.date)}</td>
                    <td className="max-w-48 truncate px-3 py-2 text-xs">{d.recipient?.name || '—'}</td>
                    {isSuperAdmin && !collegeId && <td className="max-w-48 truncate px-3 py-2 text-xs">{collegeName[d.collegeId] || '—'}</td>}
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <PrintButton doc={d} onPrint={onPrint} />
                        <DownloadButton doc={d} busy={downloadingId === d.id} onDownload={onDownload} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white ring-1 ring-slate-200 disabled:opacity-40" aria-label="Previous page">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold text-slate-600">
                Page {page} of {totalPages}
              </span>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white ring-1 ring-slate-200 disabled:opacity-40" aria-label="Next page">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
      {printDoc && <SendToPrintModal documentId={printDoc.documentId} refNo={printDoc.refNo} onClose={() => setPrintDoc(null)} />}
    </div>
  );
};

export default DocumentHistoryPage;

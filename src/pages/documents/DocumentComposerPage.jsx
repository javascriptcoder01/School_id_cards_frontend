// DocumentComposerPage.jsx — kisi bhi letterhead par letter / certificate / notice: letterhead (segment ka default
// pehle se chuna), type, ref no (khaali = auto), date, subject, recipient, body (TipTap + quick templates),
// signatory override, CC, enclosures, "save a copy". Preview (page 1) → Generate & download (filename = ref no).
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FilePenLine, History, FileText, Users, Paperclip, PenLine, Eye, Download, Loader2, CheckCircle2, Wand2, Hash, Printer } from 'lucide-react';
import { fetchLetterheadsRequested, fetchCollegeOptionsRequested } from '../../features/letterheads/letterheadSlice.js';
import { selectLetterheadList, selectLetterheadCollegeOptions } from '../../features/letterheads/letterheadSelectors.js';
import { generateDocumentRequested, clearGenerateError, documentPreviewRequested, documentPreviewCleared } from '../../features/documents/documentSlice.js';
import { selectDocumentGenerating, selectDocumentGenerateError, selectDocumentPreview } from '../../features/documents/documentSelectors.js';
import { selectUserRole } from '../../features/auth/authSelectors.js';
import { ROUTES } from '../../constants/routes.js';
import { DOC_TYPES, BODY_MAX_BYTES, todayIso } from '../../constants/documents.js';
import { SEGMENT_LABEL } from '../../constants/letterhead.js';
import { Section, Field, TextInput, Select, Toggle, ChoiceChips } from '../../components/letterheads/LetterheadFields.jsx';
import LetterBodyEditor from '../../components/documents/LetterBodyEditor.jsx';
import { ListInput, QuickTemplatePicker, DocumentPreviewPanel } from '../../components/documents/ComposerParts.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import SendToPrintModal from '../../components/letterheadOrders/SendToPrintModal.jsx';

const REF_PATTERN = /^[A-Za-z0-9/_\-. ]+$/;
const byteSize = (s) => new TextEncoder().encode(s || '').length;

const emptyForm = () => ({
  docType: 'LETTER',
  refNo: '',
  date: todayIso(),
  subject: '',
  recipient: { name: '', designation: '', address: '' },
  bodyHtml: '',
  overrideSignatory: false,
  signatory: { name: '', designation: '', showSignature: true, showStamp: true },
  cc: [],
  attachments: [],
  saveCopy: true,
});

export const DocumentComposerPage = () => {
  const dispatch = useDispatch();
  const role = useSelector(selectUserRole);
  const isSuperAdmin = role === 'SUPER_ADMIN';
  // Letterhead print order sirf School Admin (Class Teacher paisa nahi dekhte)
  const canPrint = role === 'COLLEGE_ADMIN';
  const { items: letterheads, loading: lhLoading, error: lhError } = useSelector(selectLetterheadList);
  const { items: colleges } = useSelector(selectLetterheadCollegeOptions);
  const generating = useSelector(selectDocumentGenerating);
  const generateError = useSelector(selectDocumentGenerateError);
  const preview = useSelector(selectDocumentPreview);

  const [collegeId, setCollegeId] = useState('');
  const [segment, setSegment] = useState(null);
  const [letterheadId, setLetterheadId] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [showPreview, setShowPreview] = useState(false);
  const [done, setDone] = useState(null); // { refNo, pageCount, documentId, hasCopy }
  const [printDoc, setPrintDoc] = useState(null); // { documentId, refNo } → Send to print modal
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  useEffect(() => {
    if (isSuperAdmin) dispatch(fetchCollegeOptionsRequested());
  }, [dispatch, isSuperAdmin]);

  useEffect(() => {
    if (isSuperAdmin && !collegeId) return;
    dispatch(fetchLetterheadsRequested({ collegeId: isSuperAdmin ? collegeId : undefined, page: 1, limit: 100 }));
  }, [dispatch, isSuperAdmin, collegeId]);

  // Page chhodte waqt preview URL free + generate error saaf
  useEffect(
    () => () => {
      dispatch(clearGenerateError());
    },
    [dispatch]
  );
  const previewUrl = useRef(null);
  useEffect(() => {
    previewUrl.current = preview.url;
  }, [preview.url]);
  useEffect(() => () => dispatch(documentPreviewCleared({ url: previewUrl.current })), [dispatch]);

  const usable = useMemo(() => (isSuperAdmin && !collegeId ? [] : letterheads.filter((l) => l.isActive !== false)), [letterheads, isSuperAdmin, collegeId]);
  const segments = useMemo(() => [...new Set(usable.map((l) => l.segment))], [usable]);
  const activeSegment = segment && segments.includes(segment) ? segment : usable.find((l) => l.isDefault)?.segment || segments[0] || null;
  const inSegment = usable.filter((l) => l.segment === activeSegment);
  // Chuna hua letterhead; na ho to segment ka default (warna pehla)
  const letterhead = inSegment.find((l) => l.id === letterheadId) || inSegment.find((l) => l.isDefault) || inSegment[0] || null;

  const bodySize = byteSize(form.bodyHtml);
  const refError = form.refNo.trim() && !REF_PATTERN.test(form.refNo.trim()) ? 'Use letters, digits, / - _ . and spaces' : null;
  const problem = !letterhead
    ? 'Choose a letterhead'
    : !form.bodyHtml.trim()
      ? 'Write the letter body'
      : bodySize > BODY_MAX_BYTES
        ? 'The letter body is larger than 200 KB'
        : !form.date
          ? 'Pick a date'
          : refError;

  // Body likhi hai aur generate nahi hua → tab band karne par poochho
  const unsaved = Boolean(form.bodyHtml.trim()) && !done;
  useEffect(() => {
    if (!unsaved) return undefined;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [unsaved]);

  const payload = () => {
    const { overrideSignatory, signatory, ...rest } = form;
    return {
      ...rest,
      letterheadId: letterhead.id,
      refNo: form.refNo.trim() || null,
      subject: form.subject.trim(),
      cc: form.cc,
      attachments: form.attachments,
      ...(overrideSignatory ? { signatory: { ...signatory, name: signatory.name.trim(), designation: signatory.designation.trim() } } : {}),
      ...(isSuperAdmin ? { collegeId } : {}),
    };
  };

  const runPreview = () => {
    if (problem) return;
    const body = payload();
    delete body.saveCopy; // preview kuch save nahi karta
    setShowPreview(true);
    dispatch(documentPreviewRequested({ body: { ...body, page: 1 } }));
  };

  const generate = () => {
    if (problem) return;
    setDone(null);
    const body = payload();
    dispatch(generateDocumentRequested({ body, onSuccess: (info) => setDone({ ...info, hasCopy: Boolean(body.saveCopy) }) }));
  };

  // Print ke liye asli PDF chahiye → copy hamesha save, phir Send to print modal
  const generateAndPrint = () => {
    if (problem) return;
    setDone(null);
    const body = { ...payload(), saveCopy: true };
    dispatch(
      generateDocumentRequested({
        body,
        onSuccess: (info) => {
          setDone({ ...info, hasCopy: true });
          if (info?.documentId) setPrintDoc({ documentId: info.documentId, refNo: info.refNo });
        },
      })
    );
  };

  const startNew = () => {
    setForm(emptyForm());
    setDone(null);
    setShowPreview(false);
  };

  // Form badla → purana "done" hatao (naya document)
  const edit = (patch) => {
    if (done) setDone(null);
    set(patch);
  };

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-indigo-900 to-violet-800 px-4 py-3.5 text-white shadow-xl sm:px-5">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-400 via-violet-500 to-fuchsia-500 shadow-lg ring-1 ring-white/30">
              <FilePenLine className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-black tracking-tight sm:text-2xl">New document</h1>
              <p className="mt-0.5 truncate text-xs text-indigo-200">{letterhead ? `On “${letterhead.name}”` : 'Letters, certificates and notices on your letterhead'}</p>
            </div>
          </div>
          <Link to={ROUTES.DOCUMENTS} className="inline-flex h-9 shrink-0 items-center gap-1.5 self-start rounded-xl bg-white/10 px-3 text-sm font-bold ring-1 ring-white/20 hover:bg-white/20 sm:self-auto">
            <History className="h-4 w-4" /> History
          </Link>
        </div>
      </section>

      {done && (
        <div className="flex flex-col gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm font-bold text-emerald-800">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>
              Downloaded · Ref. no. <span className="font-mono">{done.refNo}</span> · {done.pageCount || 1} page(s)
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {canPrint && done.hasCopy && done.documentId && (
              <button type="button" onClick={() => setPrintDoc({ documentId: done.documentId, refNo: done.refNo })} className="inline-flex items-center gap-1 rounded-xl bg-teal-600 px-3 py-1.5 text-xs font-bold text-white">
                <Printer className="h-3.5 w-3.5" /> Send to print
              </button>
            )}
            <button type="button" onClick={startNew} className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white">
              New document
            </button>
            <Link to={ROUTES.DOCUMENTS} className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
              View history
            </Link>
          </div>
        </div>
      )}
      {generateError && <ErrorMessage message={generateError} title="Could not generate" onDismiss={() => dispatch(clearGenerateError())} />}
      {lhError && <ErrorMessage message={lhError} title="Letterheads unavailable" />}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <div className="space-y-3">
          <Section title="Letterhead" icon={FileText}>
            {isSuperAdmin && (
              <select
                value={collegeId}
                onChange={(e) => {
                  setCollegeId(e.target.value);
                  setLetterheadId('');
                  setSegment(null);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                aria-label="School"
              >
                <option value="">Choose a school…</option>
                {colleges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.code ? `(${c.code})` : ''}
                  </option>
                ))}
              </select>
            )}
            {lhLoading && !usable.length ? (
              <p className="flex items-center gap-2 text-xs text-slate-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading letterheads…
              </p>
            ) : !usable.length ? (
              <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                {isSuperAdmin && !collegeId ? 'Choose a school to see its letterheads.' : 'No letterhead yet.'}{' '}
                {role !== 'OPERATOR' && (!isSuperAdmin || collegeId) && (
                  <Link to={ROUTES.LETTERHEAD_NEW} className="underline">
                    Create one
                  </Link>
                )}
              </p>
            ) : (
              <>
                {segments.length > 1 && (
                  <ChoiceChips
                    value={activeSegment}
                    onChange={(s) => {
                      setSegment(s);
                      setLetterheadId('');
                    }}
                    options={segments.map((s) => ({ value: s, label: SEGMENT_LABEL[s] || s }))}
                  />
                )}
                <Select
                  id="doc-lh"
                  value={letterhead?.id || ''}
                  onChange={setLetterheadId}
                  options={inSegment.map((l) => ({ value: l.id, label: `${l.name}${l.isDefault ? ' ★ default' : ''} · v${l.version}` }))}
                />
              </>
            )}
          </Section>

          <Section title="Details" icon={Hash}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Document type" htmlFor="doc-type">
                <Select id="doc-type" value={form.docType} onChange={(v) => edit({ docType: v })} options={DOC_TYPES} />
              </Field>
              <Field label="Reference no." htmlFor="doc-ref" error={refError} hint={!form.refNo ? 'Empty = next number automatically' : null}>
                <TextInput id="doc-ref" value={form.refNo} onChange={(v) => edit({ refNo: v })} placeholder={letterhead ? `Auto · ${letterhead.referenceFormat}` : 'Auto'} maxLength={80} />
              </Field>
              <Field label="Date" htmlFor="doc-date">
                <TextInput id="doc-date" type="date" value={form.date} onChange={(v) => edit({ date: v })} />
              </Field>
            </div>
            <Field label="Subject" htmlFor="doc-subject">
              <TextInput id="doc-subject" value={form.subject} onChange={(v) => edit({ subject: v })} placeholder="e.g. Bonafide Certificate" maxLength={300} />
            </Field>
          </Section>

          <Section title="Recipient" icon={Users}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Name" htmlFor="doc-rn">
                <TextInput id="doc-rn" value={form.recipient.name} onChange={(v) => edit({ recipient: { ...form.recipient, name: v } })} placeholder="Optional" maxLength={150} />
              </Field>
              <Field label="Designation" htmlFor="doc-rd">
                <TextInput id="doc-rd" value={form.recipient.designation} onChange={(v) => edit({ recipient: { ...form.recipient, designation: v } })} placeholder="Optional" maxLength={150} />
              </Field>
            </div>
            <Field label="Address" htmlFor="doc-ra">
              <textarea
                id="doc-ra"
                value={form.recipient.address}
                onChange={(e) => edit({ recipient: { ...form.recipient, address: e.target.value } })}
                rows={2}
                maxLength={500}
                placeholder="Optional"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </Field>
          </Section>

          <Section title="Letter" icon={FilePenLine}>
            <div>
              <p className="mb-1.5 flex items-center gap-1 text-xs font-bold text-slate-700">
                <Wand2 className="h-3.5 w-3.5 text-violet-600" /> Quick templates
              </p>
              <QuickTemplatePicker
                segment={activeSegment}
                onApply={({ bodyHtml, subject, docType }) => edit({ bodyHtml, docType, subject: form.subject.trim() ? form.subject : subject })}
              />
            </div>
            <LetterBodyEditor value={form.bodyHtml} onChange={(v) => edit({ bodyHtml: v })} />
            <p className={`text-right text-[10px] ${bodySize > BODY_MAX_BYTES ? 'font-bold text-rose-600' : 'text-slate-400'}`}>
              {Math.ceil(bodySize / 1024)} / 200 KB
            </p>
          </Section>

          <Section title="Signatory, CC & enclosures" icon={PenLine}>
            <Toggle label="Use a different signatory for this document" checked={form.overrideSignatory} onChange={(v) => edit({ overrideSignatory: v })} />
            {form.overrideSignatory && (
              <div className="space-y-2.5 rounded-xl bg-slate-50 p-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Name" htmlFor="doc-sn">
                    <TextInput id="doc-sn" value={form.signatory.name} onChange={(v) => edit({ signatory: { ...form.signatory, name: v } })} placeholder="Letterhead default" maxLength={120} />
                  </Field>
                  <Field label="Designation" htmlFor="doc-sd">
                    <TextInput id="doc-sd" value={form.signatory.designation} onChange={(v) => edit({ signatory: { ...form.signatory, designation: v } })} placeholder="Letterhead default" maxLength={120} />
                  </Field>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Toggle label="Show signature" checked={form.signatory.showSignature} onChange={(v) => edit({ signatory: { ...form.signatory, showSignature: v } })} />
                  <Toggle label="Show stamp" checked={form.signatory.showStamp} onChange={(v) => edit({ signatory: { ...form.signatory, showStamp: v } })} />
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ListInput id="doc-cc" label="CC" items={form.cc} onChange={(cc) => edit({ cc })} placeholder="e.g. The District Education Officer" />
              <ListInput id="doc-enc" label="Enclosures" items={form.attachments} onChange={(attachments) => edit({ attachments })} placeholder="e.g. Copy of fee receipt" />
            </div>
            <p className="flex items-center gap-1 text-[11px] text-slate-500">
              <Paperclip className="h-3 w-3" /> Enclosures are listed by name only; files are not attached.
            </p>
          </Section>
        </div>

        <div className="lg:sticky lg:top-4 lg:self-start">
          <div className="space-y-3">
            <section className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
              <Toggle label="Save a copy (re-download from history)" checked={form.saveCopy} onChange={(v) => edit({ saveCopy: v })} />
              {problem && <p className="mt-2 text-[11px] font-semibold text-amber-700">{problem}</p>}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={runPreview}
                  disabled={Boolean(problem) || preview.loading}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                >
                  {preview.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />} Preview
                </button>
                <button
                  type="button"
                  onClick={generate}
                  disabled={Boolean(problem) || generating}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-3 py-2 text-sm font-bold text-white shadow-md disabled:opacity-50"
                >
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Generate
                </button>
              </div>
              {canPrint && (
                <button
                  type="button"
                  onClick={generateAndPrint}
                  disabled={Boolean(problem) || generating}
                  className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-linear-to-r from-teal-600 to-cyan-600 px-3 py-2 text-sm font-bold text-white shadow-md disabled:opacity-50"
                >
                  <Printer className="h-4 w-4" /> Generate &amp; send to print
                </button>
              )}
              <p className="mt-2 text-[10px] text-slate-400">Generate takes the next reference number and downloads the PDF.{canPrint ? ' Sending to print always saves a copy.' : ''}</p>
            </section>
            {showPreview && <DocumentPreviewPanel onClose={() => setShowPreview(false)} />}
          </div>
        </div>
      </div>
      {printDoc && <SendToPrintModal documentId={printDoc.documentId} refNo={printDoc.refNo} onClose={() => setPrintDoc(null)} />}
    </div>
  );
};

export default DocumentComposerPage;

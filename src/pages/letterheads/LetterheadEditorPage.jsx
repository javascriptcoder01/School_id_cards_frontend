// LetterheadEditorPage.jsx — naya letterhead (mode + type + school) aur edit: system template ya apna upload,
// signatory, reference format, live preview (500 ms debounce). Save → version; unsaved changes guard.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, FileText, LayoutTemplate, Upload, Save, Loader2, Hash, Sparkles, ChevronRight } from 'lucide-react';
import {
  fetchLetterheadRequested,
  clearLetterheadDetail,
  saveLetterheadRequested,
  fetchTemplatesRequested,
  previewRequested,
  clearPreview,
  fetchLetterheadCollegeRequested,
  fetchCollegeOptionsRequested,
} from '../../features/letterheads/letterheadSlice.js';
import {
  selectLetterheadDetail,
  selectLetterheadSaving,
  selectLetterheadSaveError,
  selectLetterheadTemplates,
  selectLetterheadCollege,
  selectLetterheadCollegeOptions,
} from '../../features/letterheads/letterheadSelectors.js';
import { selectUserRole } from '../../features/auth/authSelectors.js';
import { ROUTES, getLetterheadEditRoute } from '../../constants/routes.js';
import {
  LETTERHEAD_MODES,
  LETTERHEAD_SEGMENTS,
  DEFAULT_REFERENCE_FORMAT,
  referenceFormatError,
  marginsError,
} from '../../constants/letterhead.js';
import { Section, Field, TextInput, Toggle, ChoiceChips } from '../../components/letterheads/LetterheadFields.jsx';
import TemplateGrid from '../../components/letterheads/TemplateGrid.jsx';
import SystemTemplateForm from '../../components/letterheads/SystemTemplateForm.jsx';
import CustomUploadEditor from '../../components/letterheads/CustomUploadEditor.jsx';
import SignatoryFields from '../../components/letterheads/SignatoryFields.jsx';
import ReferenceFormatField from '../../components/letterheads/ReferenceFormatField.jsx';
import LivePreview from '../../components/letterheads/LivePreview.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';

const SEGMENT_OPTIONS = LETTERHEAD_SEGMENTS.map((s) => ({ value: s.value, label: s.short }));
const ORG_KEYS = ['orgName', 'tagline', 'affiliation', 'registrationNo', 'gstin', 'address', 'phone', 'email', 'website'];

/* ---------- body builders (backend Joi sirf jaane fields leta hai) ---------- */
const isBlank = (v) => v === undefined || v === null || (typeof v === 'number' && Number.isNaN(v));
const prune = (obj) => {
  if (Array.isArray(obj)) return obj.map(prune);
  if (!obj || typeof obj !== 'object') return obj;
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([, v]) => !isBlank(v))
      .map(([k, v]) => [k, prune(v)])
  );
};
const pick = (obj, keys) => (obj ? Object.fromEntries(keys.map((k) => [k, obj[k]])) : undefined);
const imageRef = (ref, fallback) => {
  const source = ref?.source || fallback;
  return source === 'UPLOAD' ? { source, url: ref.url, publicId: ref.publicId } : { source };
};

const systemBody = (c) =>
  c
    ? prune({
      ...pick(c, ['templateId', 'primaryColor', 'secondaryColor', 'accentColor', 'textColor', 'fontFamily', 'headingFontFamily']),
      logo: imageRef(c.logo, 'SCHOOL_LOGO'),
      watermark: c.watermark ? pick(c.watermark, ['type', 'text', 'opacity', 'rotationDeg', 'sizePct']) : undefined,
      orgProfile: pick(c.orgProfile || {}, ORG_KEYS),
      header: c.header ? pick(c.header, ['layout', 'showTagline', 'showAffiliation', 'heightMm']) : undefined,
      footer: c.footer ? pick(c.footer, ['show', 'text', 'showContacts', 'showPageNumber', 'heightMm']) : undefined,
      continuation: c.continuation ? pick(c.continuation, ['headerStyle']) : undefined,
    })
    : undefined;

const pageBody = (p) => (p ? prune({ ...pick(p, ['pdfUrl', 'pdfPublicId', 'previewUrl', 'sourceType']), margins: pick(p.margins, ['topMm', 'bottomMm', 'leftMm', 'rightMm']) }) : null);
const customBody = (c) => (c?.firstPage ? { firstPage: pageBody(c.firstPage), continuationPage: pageBody(c.continuationPage), dpiWarning: Boolean(c.dpiWarning) } : undefined);

const signatoryBody = (s = {}) =>
  prune({ name: s.name || '', designation: s.designation || '', signature: imageRef(s.signature, 'SCHOOL_PRINCIPAL_SIGN'), stamp: imageRef(s.stamp, 'NONE') });

const configFor = (draft) =>
  draft.mode === LETTERHEAD_MODES.SYSTEM_TEMPLATE ? { systemTemplateConfig: systemBody(draft.systemTemplateConfig) } : { customUploadConfig: customBody(draft.customUploadConfig) };

const buildBody = (draft, isNew) => ({
  name: (draft.name || '').trim(),
  segment: draft.segment,
  isDefault: Boolean(draft.isDefault),
  signatory: signatoryBody(draft.signatory),
  referenceFormat: (draft.referenceFormat || DEFAULT_REFERENCE_FORMAT).trim(),
  ...configFor(draft),
  ...(isNew ? { mode: draft.mode, ...(draft.collegeId ? { collegeId: draft.collegeId } : {}) } : {}),
});

const fromView = (l) => ({
  name: l.name || '',
  mode: l.mode,
  segment: l.segment,
  collegeId: l.collegeId,
  isDefault: Boolean(l.isDefault),
  systemTemplateConfig: l.systemTemplateConfig || null,
  customUploadConfig: l.customUploadConfig || null,
  signatory: l.signatory || {},
  referenceFormat: l.referenceFormat || DEFAULT_REFERENCE_FORMAT,
});

const newDraft = (collegeId) => ({
  name: '',
  mode: null,
  segment: 'ACADEMIC',
  collegeId: collegeId || '',
  isDefault: false,
  systemTemplateConfig: null,
  customUploadConfig: null,
  signatory: { signature: { source: 'SCHOOL_PRINCIPAL_SIGN' }, stamp: { source: 'NONE' } },
  referenceFormat: DEFAULT_REFERENCE_FORMAT,
});

// Preview / save se pehle kya kami hai (null = sab theek)
const problemOf = (draft, isSuperAdmin) => {
  if (isSuperAdmin && !draft.collegeId) return 'Choose a school first';
  if (draft.mode === LETTERHEAD_MODES.SYSTEM_TEMPLATE) {
    const c = draft.systemTemplateConfig;
    if (!c?.templateId) return 'Pick a template to see the preview';
    if (c.watermark?.type === 'TEXT' && !c.watermark?.text) return 'Add the watermark text';
    if (c.header?.heightMm !== undefined && (!Number.isFinite(c.header.heightMm) || c.header.heightMm < 15 || c.header.heightMm > 90)) return 'Header height must be 15–90 mm';
  } else {
    const c = draft.customUploadConfig;
    if (!c?.firstPage) return 'Upload your letterhead to see the preview';
    const m = marginsError(c.firstPage.margins) || (c.continuationPage ? marginsError(c.continuationPage.margins) : null);
    if (m) return m;
  }
  return referenceFormatError(draft.referenceFormat);
};

/* ---------- step 1: mode + type (+ school) ---------- */
const ModeCard = ({ icon: Icon, title, text, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition ${active ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-200' : 'border-slate-200 bg-white hover:border-indigo-300'}`}
  >
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-md">
      <Icon className="h-5 w-5" />
    </span>
    <span className="min-w-0">
      <span className="block text-sm font-extrabold text-slate-900">{title}</span>
      <span className="mt-0.5 block text-xs text-slate-500">{text}</span>
    </span>
  </button>
);

export const LetterheadEditorPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isNew = !id;
  const role = useSelector(selectUserRole);
  const isSuperAdmin = role === 'SUPER_ADMIN';

  const detail = useSelector(selectLetterheadDetail);
  const saving = useSelector(selectLetterheadSaving);
  const saveError = useSelector(selectLetterheadSaveError);
  const templates = useSelector(selectLetterheadTemplates);
  const college = useSelector(selectLetterheadCollege);
  const collegeOptions = useSelector(selectLetterheadCollegeOptions);

  const [draft, setDraft] = useState(() => newDraft(searchParams.get('collegeId')));
  const [snapshot, setSnapshot] = useState(null); // saved body (JSON) — dirty check
  const [step, setStep] = useState(isNew ? 'setup' : 'edit');
  const [previewPage, setPreviewPage] = useState(1);
  const [leaveTo, setLeaveTo] = useState(null);
  const loadedId = useRef(null);

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  // Load / reset
  useEffect(() => {
    if (id) dispatch(fetchLetterheadRequested({ id }));
    return () => {
      dispatch(clearLetterheadDetail());
      dispatch(clearPreview());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (id && detail.data?.id === id && loadedId.current !== `${id}:${detail.data.version}`) {
      loadedId.current = `${id}:${detail.data.version}`;
      const d = fromView(detail.data);
      setDraft(d);
      setSnapshot(JSON.stringify(buildBody(d, false)));
      setStep('edit');
    }
  }, [id, detail.data]);

  useEffect(() => {
    if (isNew && snapshot === null) setSnapshot(JSON.stringify(buildBody(draft, true)));
  }, [isNew, snapshot, draft]);

  useEffect(() => {
    if (isSuperAdmin) dispatch(fetchCollegeOptionsRequested());
  }, [dispatch, isSuperAdmin]);

  // School (placeholders, logo colours, code)
  useEffect(() => {
    if (isSuperAdmin && !draft.collegeId) return;
    dispatch(fetchLetterheadCollegeRequested({ collegeId: isSuperAdmin ? draft.collegeId : null }));
  }, [dispatch, isSuperAdmin, draft.collegeId]);

  // Segment ke templates
  useEffect(() => {
    if (draft.mode === LETTERHEAD_MODES.SYSTEM_TEMPLATE) dispatch(fetchTemplatesRequested({ segment: draft.segment }));
  }, [dispatch, draft.mode, draft.segment]);

  // Naye system letterhead par pehla template khud chuno
  useEffect(() => {
    if (draft.mode !== LETTERHEAD_MODES.SYSTEM_TEMPLATE || draft.systemTemplateConfig?.templateId) return;
    if (templates.loading || templates.segment !== draft.segment || !templates.items.length) return;
    const t = templates.items[0];
    setDraft((d) => ({ ...d, systemTemplateConfig: { ...t.defaults, templateId: t.id, orgProfile: {} } }));
  }, [draft.mode, draft.segment, draft.systemTemplateConfig, templates]);

  const body = useMemo(() => buildBody(draft, isNew), [draft, isNew]);
  const bodyJson = useMemo(() => JSON.stringify(body), [body]);
  const dirty = snapshot !== null && bodyJson !== snapshot && step === 'edit';
  const problem = step === 'edit' ? problemOf(draft, isSuperAdmin) : 'Finish the first step';
  const nameError = draft.name.trim().length < 2 ? 'Name must be at least 2 characters' : null;

  // Live preview (saga 500 ms debounce). Saved + unchanged → letterheadId (server cache).
  useEffect(() => {
    if (step !== 'edit' || problem) return;
    const previewBody = !isNew && !dirty
      ? { letterheadId: id, page: previewPage }
      : {
        mode: draft.mode,
        segment: draft.segment,
        ...(isSuperAdmin && draft.collegeId ? { collegeId: draft.collegeId } : {}),
        ...configFor(draft),
        signatory: body.signatory,
        referenceFormat: body.referenceFormat,
        page: previewPage,
      };
    dispatch(previewRequested({ body: previewBody, page: previewPage }));
    // bodyJson draft ka stable roop hai
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, bodyJson, previewPage, step, problem, isNew, dirty, id]);

  // Tab / window band karte waqt guard
  useEffect(() => {
    if (!dirty) return undefined;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const leave = (to) => (dirty ? setLeaveTo(to) : navigate(to));

  const save = () => {
    if (problem || nameError) return;
    dispatch(
      saveLetterheadRequested({
        id: isNew ? null : id,
        body,
        onSuccess: (letterhead) => {
          if (!letterhead) return;
          const d = fromView(letterhead);
          setSnapshot(JSON.stringify(buildBody(d, false)));
          if (isNew) navigate(getLetterheadEditRoute(letterhead.id), { replace: true });
        },
      })
    );
  };

  const selectTemplate = (t) =>
    set({ systemTemplateConfig: { ...t.defaults, templateId: t.id, orgProfile: draft.systemTemplateConfig?.orgProfile || {} } });

  if (!isNew && detail.loading && !detail.data) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-16 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading letterhead…
      </div>
    );
  }
  if (!isNew && detail.error) {
    return (
      <div className="space-y-3">
        <ErrorMessage message={detail.error} title="Could not load the letterhead" />
        <Link to={ROUTES.LETTERHEADS} className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600">
          <ArrowLeft className="h-4 w-4" /> Back to letterheads
        </Link>
      </div>
    );
  }

  const collegeCode = college?.code || 'CODE';
  const setupReady = draft.mode && (!isSuperAdmin || draft.collegeId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-indigo-900 to-violet-800 px-4 py-3.5 text-white shadow-xl sm:px-5">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => leave(ROUTES.LETTERHEADS)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 hover:bg-white/20" aria-label="Back to letterheads">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-black tracking-tight sm:text-xl">{isNew ? 'New letterhead' : draft.name || 'Letterhead'}</h1>
              <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] font-semibold text-indigo-200">
                {college?.name && <span className="truncate">{college.name}</span>}
                {!isNew && detail.data && <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-white">v{detail.data.version}</span>}
                {dirty && <span className="rounded-md bg-amber-400/20 px-1.5 py-0.5 text-amber-200">Unsaved changes</span>}
              </div>
            </div>
          </div>
          {step === 'edit' && (
            <div className="flex shrink-0 items-center gap-2">
              <button type="button" onClick={() => leave(ROUTES.LETTERHEADS)} className="h-9 rounded-xl bg-white/10 px-3 text-sm font-bold ring-1 ring-white/20 hover:bg-white/20">
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving || Boolean(problem) || Boolean(nameError) || (!isNew && !dirty)}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white px-3 text-sm font-bold text-indigo-700 shadow-md hover:bg-indigo-50 disabled:opacity-60"
                title={problem || nameError || ''}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {isNew ? 'Create' : 'Save'}
              </button>
            </div>
          )}
        </div>
      </section>

      {saveError && <ErrorMessage message={saveError} title="Could not save" />}

      {step === 'setup' ? (
        <div className="mx-auto max-w-3xl space-y-3">
          {isSuperAdmin && (
            <Section title="School" icon={FileText}>
              <select
                value={draft.collegeId}
                onChange={(e) => set({ collegeId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                aria-label="School"
              >
                <option value="">Choose a school…</option>
                {collegeOptions.items.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.code ? `(${c.code})` : ''}
                  </option>
                ))}
              </select>
            </Section>
          )}
          <Section title="How do you want to make it?" icon={Sparkles}>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <ModeCard
                icon={LayoutTemplate}
                title="Use a ready template"
                text="Pick a design and fill in your colours, logo and details."
                active={draft.mode === LETTERHEAD_MODES.SYSTEM_TEMPLATE}
                onClick={() => set({ mode: LETTERHEAD_MODES.SYSTEM_TEMPLATE, customUploadConfig: null })}
              />
              <ModeCard
                icon={Upload}
                title="Upload my letterhead"
                text="Use your own printed letterhead as a PDF, PNG or JPG."
                active={draft.mode === LETTERHEAD_MODES.CUSTOM_UPLOAD}
                onClick={() => set({ mode: LETTERHEAD_MODES.CUSTOM_UPLOAD, systemTemplateConfig: null })}
              />
            </div>
          </Section>
          <Section title="Type of organisation" icon={FileText}>
            <ChoiceChips value={draft.segment} onChange={(segment) => set({ segment, systemTemplateConfig: null })} options={SEGMENT_OPTIONS} size="md" />
          </Section>
          <div className="flex justify-end">
            <button
              type="button"
              disabled={!setupReady}
              onClick={() => setStep('edit')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-bold text-white shadow-md disabled:opacity-50"
            >
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)]">
          <div className="lg:order-2">
            <div className="lg:sticky lg:top-4">
              <LivePreview page={previewPage} onPageChange={setPreviewPage} disabledReason={problem} />
            </div>
          </div>

          <div className="space-y-3 lg:order-1">
            <Section title="Basics" icon={FileText}>
              <Field label="Letterhead name" htmlFor="lh-name" error={draft.name && nameError ? nameError : null}>
                <TextInput id="lh-name" value={draft.name} onChange={(v) => set({ name: v })} placeholder="e.g. Official letterhead" maxLength={100} />
              </Field>
              <Field label="Type of organisation">
                <ChoiceChips value={draft.segment} onChange={(segment) => set({ segment })} options={SEGMENT_OPTIONS} />
              </Field>
              <Toggle label="Use as default letterhead" checked={draft.isDefault} onChange={(v) => set({ isDefault: v })} />
            </Section>

            {draft.mode === LETTERHEAD_MODES.SYSTEM_TEMPLATE ? (
              <>
                <Section title="Template" icon={LayoutTemplate}>
                  <TemplateGrid templates={templates.items} loading={templates.loading} selectedId={draft.systemTemplateConfig?.templateId} onSelect={selectTemplate} />
                </Section>
                {draft.systemTemplateConfig?.templateId && (
                  <SystemTemplateForm value={draft.systemTemplateConfig} onChange={(c) => set({ systemTemplateConfig: c })} college={college} />
                )}
              </>
            ) : (
              <CustomUploadEditor value={draft.customUploadConfig} onChange={(c) => set({ customUploadConfig: c })} collegeId={isSuperAdmin ? draft.collegeId : undefined} />
            )}

            <SignatoryFields value={draft.signatory} onChange={(s) => set({ signatory: s })} />

            <Section title="Reference number" icon={Hash}>
              <ReferenceFormatField value={draft.referenceFormat} onChange={(v) => set({ referenceFormat: v })} code={collegeCode} segment={draft.segment} />
            </Section>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(leaveTo)}
        title="Leave without saving?"
        message="Your changes to this letterhead will be lost."
        confirmLabel="Leave"
        variant="warning"
        onConfirm={() => {
          const to = leaveTo;
          setLeaveTo(null);
          setSnapshot(bodyJson); // guard band, phir jao
          navigate(to);
        }}
        onCancel={() => setLeaveTo(null)}
      />
    </div>
  );
};

export default LetterheadEditorPage;

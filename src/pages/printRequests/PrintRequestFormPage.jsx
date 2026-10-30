// PrintRequestFormPage.jsx — Class Teacher: New / Edit print request (3 steps: Template → Students → Review)
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, LayoutTemplate, Users, ClipboardCheck, Loader2, Save, Send, AlertTriangle, Info } from 'lucide-react';
import {
  fetchWizardTemplatesRequested,
  fetchWizardStudentsRequested,
  fetchRequestsRequested,
  fetchRequestRequested,
  fetchWizardCardPreviewRequested,
  saveRequestRequested,
  clearWizard,
  clearRequestDetail,
  clearFormError,
} from '../../features/printRequestWorkflow/printRequestWorkflowSlice.js';
import {
  selectWizardTemplates,
  selectWizardTemplatesLoading,
  selectWizardTemplatesError,
  selectWizardStudents,
  selectWizardClassScope,
  selectWizardStudentsLoading,
  selectWizardStudentsError,
  selectPrintRequests,
  selectPrintRequestDetail,
  selectPrintRequestStudents,
  selectPrintRequestDetailLoading,
  selectPrintRequestDetailError,
  selectWizardCardPreviews,
  selectPrintRequestSaving,
  selectPrintRequestFormError,
} from '../../features/printRequestWorkflow/printRequestWorkflowSelectors.js';
import { ROUTES, getPrintRequestDetailRoute, getPrintRequestEditRoute } from '../../constants/routes.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Loader from '../../components/common/Loader.jsx';
import StudentPickerTable from '../../components/printRequests/StudentPickerTable.jsx';
import TemplateFlipPreview from '../../components/templates/TemplateFlipPreview.jsx';
import IdCardPreviewCarousel from '../../components/idCards/IdCardPreviewCarousel.jsx';

const MAX_STUDENTS = 100;
const NOTE_MAX = 500;
// "Student already in an open request" lock ke liye (query ke status codes)
const OPEN_STATUSES = ['DRAFT', 'PENDING_APPROVAL', 'REJECTED_BY_ADMIN', 'APPROVED', 'PRINTING'];

const STEPS = [
  { key: 1, label: 'Template', icon: LayoutTemplate },
  { key: 2, label: 'Students', icon: Users },
  { key: 3, label: 'Review', icon: ClipboardCheck },
];

const photoOf = (student) => student?.studentPhoto?.url || student?.photo || student?.photoUrl || null;

/* ------------------------------------------------------------------ */
/* Outer: data load (templates, class students, open requests, edit)   */
/* ------------------------------------------------------------------ */

export const PrintRequestFormPage = () => {
  const { requestId } = useParams();
  const isEdit = Boolean(requestId);
  const dispatch = useDispatch();

  const templatesLoading = useSelector(selectWizardTemplatesLoading);
  const studentsLoading = useSelector(selectWizardStudentsLoading);
  const classScope = useSelector(selectWizardClassScope);
  const request = useSelector(selectPrintRequestDetail);
  const requestStudents = useSelector(selectPrintRequestStudents);
  const detailLoading = useSelector(selectPrintRequestDetailLoading);
  const detailError = useSelector(selectPrintRequestDetailError);

  useEffect(() => {
    dispatch(clearWizard());
    dispatch(fetchWizardTemplatesRequested({ isOperator: true }));
    dispatch(fetchWizardStudentsRequested({}));
    dispatch(fetchRequestsRequested({ params: { status: OPEN_STATUSES, page: 1, limit: 100 } }));
    if (isEdit) dispatch(fetchRequestRequested({ requestId }));
    return () => {
      dispatch(clearRequestDetail());
    };
  }, [dispatch, isEdit, requestId]);

  const editReady = !isEdit || (request && request.id === requestId);

  if (isEdit && detailError) {
    return (
      <div className="space-y-6">
        <Link to={ROUTES.PRINT_REQUESTS} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600">
          <ArrowLeft className="h-4 w-4" /> Back to requests
        </Link>
        <ErrorMessage message={detailError} title="Couldn't load this request" />
      </div>
    );
  }

  if ((isEdit && (!editReady || detailLoading)) || (templatesLoading && studentsLoading)) {
    return <Loader message="Loading request…" />;
  }

  if (classScope === null) {
    return (
      <EmptyState
        title="No Class Assigned"
        description="No class is assigned to you yet. Ask the school admin."
        icon={Users}
      />
    );
  }

  // Edit sirf jab request abhi bhi bheji ja sakti hai (DRAFT / REJECTED) — backend ke actions se
  if (isEdit && !request.availableActions?.includes('SUBMIT')) {
    return (
      <div className="space-y-6">
        <PageHeader title={`Edit ${request.requestNumber || 'request'}`} />
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <Info className="h-5 w-5 shrink-0" />
          <div>
            This request can no longer be edited ({request.statusView?.label}).{' '}
            <Link to={getPrintRequestDetailRoute(request.id)} className="font-semibold underline">View request</Link>
          </div>
        </div>
      </div>
    );
  }

  const initial = isEdit
    ? {
      templateId: request.template?.id || '',
      studentIds: requestStudents.map((s) => s.id),
      note: request.note || '',
    }
    : { templateId: '', studentIds: [], note: '' };

  // key: data aate hi form ek baar sahi initial values ke saath mount
  return <PrintRequestWizard key={isEdit ? request.id : 'new'} isEdit={isEdit} request={isEdit ? request : null} initial={initial} />;
};

/* ------------------------------------------------------------------ */
/* Inner: wizard form                                                  */
/* ------------------------------------------------------------------ */

const PrintRequestWizard = ({ isEdit, request, initial }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const templates = useSelector(selectWizardTemplates);
  const templatesError = useSelector(selectWizardTemplatesError);
  const templatesLoading = useSelector(selectWizardTemplatesLoading);
  const students = useSelector(selectWizardStudents);
  const studentsLoading = useSelector(selectWizardStudentsLoading);
  const studentsError = useSelector(selectWizardStudentsError);
  const classScope = useSelector(selectWizardClassScope);
  const openRequests = useSelector(selectPrintRequests);
  const cardPreviews = useSelector(selectWizardCardPreviews);
  const saving = useSelector(selectPrintRequestSaving);
  const formError = useSelector(selectPrintRequestFormError);

  const [step, setStep] = useState(1);
  const [templateId, setTemplateId] = useState(initial.templateId);
  const [selectedIds, setSelectedIds] = useState(initial.studentIds);
  const [note, setNote] = useState(initial.note);
  const [pendingAction, setPendingAction] = useState(null); // 'draft' | 'submit'
  // "Front aur back dekh liye" — isi template + students ke liye (badle to dobara tick)
  const [checkedKey, setCheckedKey] = useState(null);

  // Student → doosri open request ka number (ye request khud chhod kar) → picker mein locked
  const lockedBy = useMemo(() => {
    const map = {};
    openRequests
      .filter((r) => r.id !== request?.id)
      .forEach((r) => (r.studentIds || []).forEach((id) => { map[id] = r.requestNumber || 'another request'; }));
    return map;
  }, [openRequests, request]);

  const studentsById = useMemo(() => new Map(students.map((s) => [s.id, s])), [students]);
  const validSelected = selectedIds.filter((id) => studentsById.has(id) && !lockedBy[id]);
  const withoutPhoto = validSelected.filter((id) => !photoOf(studentsById.get(id)));
  const selectedTemplate = templates.find((t) => (t.id || t._id) === templateId) || null;

  const stepError =
    step === 1 && !templateId
      ? 'Choose a template to continue.'
      : step === 2 && validSelected.length === 0
        ? 'Select at least one student.'
        : step === 2 && validSelected.length > MAX_STUDENTS
          ? `A request can have at most ${MAX_STUDENTS} students.`
          : null;

  const goToStep = (next) => {
    dispatch(clearFormError());
    setStep(next);
  };

  // Review carousel: jo card dikh raha hai uska preview (saga cache karta hai)
  const needPreview = useCallback(
    (studentId) => {
      if (templateId) dispatch(fetchWizardCardPreviewRequested({ templateId, studentId }));
    },
    [dispatch, templateId]
  );
  const reviewKey = `${templateId}|${validSelected.join(',')}`;
  const cardsChecked = checkedKey === reviewKey;

  const save = (submit) => {
    if (saving || !templateId || validSelected.length === 0) return;
    if (submit && !cardsChecked) return;
    setPendingAction(submit ? 'submit' : 'draft');
    dispatch(
      saveRequestRequested({
        requestId: request?.id,
        submit,
        data: { templateId, studentIds: validSelected, note: note.trim() },
        onSuccess: (saved, { submitted }) => {
          if (!saved?.id) return;
          if (submit && !submitted) {
            // Draft bana lekin bhej nahi paye → edit page (dobara click par doosra draft na bane)
            if (!isEdit) navigate(getPrintRequestEditRoute(saved.id), { replace: true });
            return;
          }
          navigate(getPrintRequestDetailRoute(saved.id));
        },
      })
    );
  };

  const classLabel = classScope ? `${classScope.className}${classScope.section ? ` - ${classScope.section}` : ''}` : '';

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? `Edit ${request?.requestNumber || 'Request'}` : 'New Print Request'}
        description={classLabel ? `Class ${classLabel}` : 'Your class'}
        breadcrumbs={[{ label: 'Print Requests', path: ROUTES.PRINT_REQUESTS }, { label: isEdit ? 'Edit' : 'New Request' }]}
      />

      {/* Admin ne reject kiya tha → reason dikhao */}
      {isEdit && request?.rejectionReason && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
          <div className="text-sm text-rose-900">
            <p className="font-semibold">Rejected by the school admin</p>
            <p className="mt-0.5">{request.rejectionReason}</p>
            <p className="mt-1 text-xs text-rose-700">Fix the request and send it again.</p>
          </div>
        </div>
      )}

      {/* Step indicator */}
      <ol className="grid grid-cols-3 gap-2 sm:gap-3">
        {STEPS.map(({ key, label, icon: Icon }) => {
          const isCurrent = step === key;
          const isDone = step > key;
          return (
            <li
              key={key}
              className={`flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 sm:px-4 ${isCurrent ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white'}`}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${isDone ? 'bg-emerald-600 text-white' : isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </span>
              <span className="min-w-0">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Step {key}</span>
                <span className={`block text-sm font-semibold truncate ${isCurrent ? 'text-indigo-800' : 'text-slate-700'}`}>{label}</span>
              </span>
            </li>
          );
        })}
      </ol>

      {/* Step 1: Template */}
      {step === 1 && (
        <section className="space-y-3">
          {templatesError && <ErrorMessage message={templatesError} title="Couldn't load templates" />}
          {templatesLoading ? (
            <Loader message="Loading templates…" />
          ) : templates.length === 0 ? (
            <EmptyState title="No Active Templates" description="Your school has no active ID card template yet. Ask the school admin to create one." icon={LayoutTemplate} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {templates.map((template) => {
                const id = template.id || template._id;
                const isSelected = id === templateId;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTemplateId(id)}
                    aria-pressed={isSelected}
                    className={`text-left rounded-2xl border bg-white p-4 shadow-xs transition-all ${isSelected ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-indigo-200'}`}
                  >
                    <div className="flex justify-center rounded-xl bg-slate-50 p-3 overflow-hidden">
                      <TemplateFlipPreview templateId={template.id || template._id} size="sm" interactive={false} />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{template.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{String(template.orientation || '').toLowerCase() || '—'}</p>
                      </div>
                      {isSelected && (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Step 2: Students */}
      {step === 2 && (
        <section className="space-y-3">
          {studentsError && <ErrorMessage message={studentsError} title="Couldn't load students" />}
          {withoutPhoto.length > 0 && (
            <p className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {withoutPhoto.length} selected student(s) have no photo. You can save a draft, but sending for approval will fail until photos are added.
            </p>
          )}
          <StudentPickerTable
            students={students}
            selectedIds={selectedIds}
            onChange={setSelectedIds}
            lockedBy={lockedBy}
            loading={studentsLoading}
          />
        </section>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <h2 className="text-sm font-bold text-slate-800">Summary</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-3"><dt className="text-slate-500">Template</dt><dd className="font-semibold text-slate-800 text-right">{selectedTemplate?.name || '—'}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-slate-500">Class</dt><dd className="font-semibold text-slate-800">{classLabel || '—'}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-slate-500">Students</dt><dd className="font-semibold text-slate-800">{validSelected.length}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-slate-500">Without photo</dt><dd className={`font-semibold ${withoutPhoto.length ? 'text-rose-600' : 'text-emerald-600'}`}>{withoutPhoto.length}</dd></div>
              </dl>
            </div>

            {withoutPhoto.length > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="font-semibold">These students have no photo:</p>
                <ul className="mt-1 list-disc pl-5 text-xs">
                  {withoutPhoto.map((id) => <li key={id}>{studentsById.get(id)?.name}</li>)}
                </ul>
                <p className="mt-2 text-xs">Add their photos or remove them before sending for approval.</p>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <label htmlFor="request-note" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Note to admin <span className="normal-case font-normal text-slate-400">(optional)</span>
              </label>
              <textarea
                id="request-note"
                rows={4}
                maxLength={NOTE_MAX}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. New admissions of this month"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
              />
              <p className="mt-1 text-right text-[11px] text-slate-400">{note.length}/{NOTE_MAX}</p>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-sm font-bold text-slate-800">Check every card — front and back</h2>
              <p className="text-xs text-slate-500">Click a card or press Space to flip it.</p>
            </div>
            <IdCardPreviewCarousel
              students={validSelected.map((id) => ({ id, name: studentsById.get(id)?.name, studentId: studentsById.get(id)?.studentId }))}
              getPreview={(id) => cardPreviews[id]}
              onNeedPreview={needPreview}
              size="md"
            />
            <label className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={cardsChecked}
                onChange={(e) => setCheckedKey(e.target.checked ? reviewKey : null)}
                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>
                <span className="font-semibold">I have checked the front and back of the cards</span>
                <span className="block text-xs text-slate-500">Names, photos and details are correct for all {validSelected.length} student(s).</span>
              </span>
            </label>
          </div>
        </section>
      )}

      {formError && <ErrorMessage message={formError} title="Couldn't save" />}

      {/* Footer actions */}
      <div className="sticky bottom-0 -mx-4 sm:mx-0 border-t border-slate-200 bg-white/95 backdrop-blur px-4 py-3 sm:rounded-2xl sm:border flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {step > 1 ? (
            <button type="button" onClick={() => goToStep(step - 1)} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          ) : (
            <Link to={ROUTES.PRINT_REQUESTS} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </Link>
          )}
          {stepError && <span className="text-xs text-slate-500">{stepError}</span>}
        </div>

        <div className="flex items-center gap-2 justify-end">
          {(step === 3 || isEdit) && (
            <button
              type="button"
              onClick={() => save(false)}
              disabled={saving || !templateId || validSelected.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {saving && pendingAction === 'draft' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Draft
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={() => goToStep(step + 1)}
              disabled={Boolean(stepError)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold disabled:opacity-50"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => save(true)}
              disabled={saving || validSelected.length === 0 || !cardsChecked}
              title={cardsChecked ? undefined : 'Tick "I have checked the front and back of the cards" first'}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 disabled:opacity-50"
            >
              {saving && pendingAction === 'submit' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send for Approval
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrintRequestFormPage;

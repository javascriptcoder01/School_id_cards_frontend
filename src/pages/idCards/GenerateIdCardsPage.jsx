// GenerateIdCardsPage.jsx
// Card preview: template + student chuno → card dekho.
// Cards ab Print Requests se bante hain (Class Teacher request → School Admin approve) — yahan generate nahi.
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Search,
  Loader2,
  Info,
  Printer,
  ArrowRight,
} from 'lucide-react';
import {
  fetchCardTemplatesRequested,
  fetchCardStudentsRequested,
  previewIdCardRequested,
  clearIdCardPreview,
} from '../../features/idCards/idCardSlice.js';
import {
  selectCardTemplates,
  selectCardTemplatesLoading,
  selectCardTemplatesError,
  selectCardStudents,
  selectCardStudentsClassScope,
  selectCardStudentsLoading,
  selectCardStudentsError,
  selectIdCardPreview,
  selectIdCardPreviewLoading,
  selectIdCardPreviewError,
} from '../../features/idCards/idCardSelectors.js';
import { selectCurrentUser, selectUserRole } from '../../features/auth/authSelectors.js';
import { ROLES } from '../../constants/roles.js';
import { ROUTES } from '../../constants/routes.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import IdCardPreview from '../../components/idCards/IdCardPreview.jsx';

const inputClass =
  'w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all disabled:bg-slate-100 disabled:text-slate-500';
const labelClass = 'block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5';

const studentPhotoUrl = (student) => student?.studentPhoto?.url || student?.photo || null;
const templateIdOf = (template) => template?.id || template?._id || '';

export const GenerateIdCardsPage = () => {
  const dispatch = useDispatch();

  const currentUser = useSelector(selectCurrentUser);
  const userRole = useSelector(selectUserRole);
  const isOperator = (userRole || currentUser?.role) === ROLES.OPERATOR;

  const templates = useSelector(selectCardTemplates);
  const templatesLoading = useSelector(selectCardTemplatesLoading);
  const templatesError = useSelector(selectCardTemplatesError);
  const students = useSelector(selectCardStudents);
  const classScope = useSelector(selectCardStudentsClassScope);
  const studentsLoading = useSelector(selectCardStudentsLoading);
  const studentsError = useSelector(selectCardStudentsError);
  const preview = useSelector(selectIdCardPreview);
  const previewLoading = useSelector(selectIdCardPreviewLoading);
  const previewError = useSelector(selectIdCardPreviewError);

  const [templateId, setTemplateId] = useState('');
  const [classInput, setClassInput] = useState('');
  const [sectionInput, setSectionInput] = useState('');
  const [previewStudentId, setPreviewStudentId] = useState(null);

  // Page khulte hi templates + students (operator: backend apni class deta hai)
  useEffect(() => {
    dispatch(fetchCardTemplatesRequested({ isOperator }));
    dispatch(fetchCardStudentsRequested({}));
    dispatch(clearIdCardPreview());
  }, [dispatch, isOperator]);

  // User ne template nahi chuna → pehla active template
  const defaultTemplateId = templateIdOf(templates.find((t) => t.isActive !== false) || templates[0]);
  const activeTemplateId = templateId || defaultTemplateId;

  // Template ya student badla → preview dobara
  useEffect(() => {
    if (activeTemplateId && previewStudentId) {
      dispatch(previewIdCardRequested({ templateId: activeTemplateId, studentId: previewStudentId }));
    }
  }, [dispatch, activeTemplateId, previewStudentId]);

  const operatorHasNoClass = isOperator && classScope === null;
  const missingPhotoCount = useMemo(() => students.filter((s) => !studentPhotoUrl(s)).length, [students]);

  const handleLoadStudents = (e) => {
    e.preventDefault();
    setPreviewStudentId(null);
    dispatch(clearIdCardPreview());
    dispatch(fetchCardStudentsRequested({ className: classInput.trim(), section: sectionInput.trim() }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="ID Cards"
        description={
          isOperator
            ? 'Preview the ID cards of your class. To print cards, create a print request.'
            : 'Preview how student ID cards look with each template. Cards are generated when you approve a print request.'
        }
      />

      {operatorHasNoClass ? (
        <EmptyState
          title="No Class Assigned"
          description="No class is assigned to you yet. Ask the school admin."
          icon={CreditCard}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* LEFT: template, class, students */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <label htmlFor="card-template" className={labelClass}>Template</label>
                <select
                  id="card-template"
                  value={activeTemplateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  disabled={templatesLoading || templates.length === 0}
                  className={`${inputClass} cursor-pointer`}
                >
                  {templates.length === 0 && (
                    <option value="">{templatesLoading ? 'Loading templates…' : 'No active templates'}</option>
                  )}
                  {templates.map((t) => (
                    <option key={templateIdOf(t)} value={templateIdOf(t)}>
                      {t.name}{t.version ? ` (v${t.version})` : ''}
                    </option>
                  ))}
                </select>
                {templatesError && <p className="text-xs text-rose-600 mt-1.5">{templatesError}</p>}
              </div>

              {isOperator ? (
                <div className="flex items-center gap-2 text-sm text-slate-700 bg-indigo-50 border border-indigo-100 rounded-xl px-3.5 py-2.5">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    Your class:{' '}
                    <span className="font-semibold">
                      {classScope ? `${classScope.className} - ${classScope.section}` : '…'}
                    </span>
                  </span>
                </div>
              ) : (
                <form onSubmit={handleLoadStudents} className="flex flex-col sm:flex-row sm:items-end gap-3">
                  <div className="flex-1">
                    <label htmlFor="card-class" className={labelClass}>Class</label>
                    <input
                      id="card-class"
                      type="text"
                      maxLength={100}
                      value={classInput}
                      onChange={(e) => setClassInput(e.target.value)}
                      placeholder="e.g. 10th (empty = all)"
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:w-28">
                    <label htmlFor="card-section" className={labelClass}>Section</label>
                    <input
                      id="card-section"
                      type="text"
                      maxLength={50}
                      value={sectionInput}
                      onChange={(e) => setSectionInput(e.target.value)}
                      placeholder="e.g. A"
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={studentsLoading}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs disabled:opacity-50 transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    <span>Load Students</span>
                  </button>
                </form>
              )}
            </div>

            {studentsError && <ErrorMessage message={studentsError} title="Couldn't load students" />}

            {/* Student list */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Students ({students.length})
                </span>
                {missingPhotoCount > 0 && (
                  <span className="text-xs text-rose-600">{missingPhotoCount} without photo</span>
                )}
              </div>

              {studentsLoading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading students…
                </div>
              ) : students.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">No active students found.</p>
              ) : (
                <ul className="divide-y divide-slate-100 max-h-128 overflow-y-auto">
                  {students.map((student) => {
                    const photo = studentPhotoUrl(student);
                    const isPreviewed = previewStudentId === student.id;
                    return (
                      <li
                        key={student.id}
                        className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${isPreviewed ? 'bg-indigo-50/60' : 'hover:bg-slate-50'}`}
                      >
                        <button
                          type="button"
                          onClick={() => setPreviewStudentId(student.id)}
                          className="flex flex-1 items-center gap-3 text-left min-w-0"
                          title="Show card preview"
                        >
                          {photo ? (
                            <img src={photo} alt="" className="w-9 h-11 rounded-md object-cover border border-slate-200 shrink-0" />
                          ) : (
                            <div className="w-9 h-11 rounded-md bg-slate-100 border border-slate-200 shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900 truncate">{student.name}</p>
                            <p className="text-xs text-slate-500 truncate">
                              {student.studentId} · {student.className}{student.section ? ` - ${student.section}` : ''}
                              {student.rollNumber ? ` · Roll ${student.rollNumber}` : ''}
                            </p>
                          </div>
                          {!photo && (
                            <span className="text-[10px] font-bold uppercase tracking-wide text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-1.5 py-0.5 shrink-0">
                              No photo
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* RIGHT: preview + print requests */}
          <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h2 className="text-sm font-bold text-slate-800">Card Preview</h2>
              {!previewStudentId ? (
                <p className="text-sm text-slate-500">Click a student to see their card.</p>
              ) : previewLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading preview…
                </div>
              ) : previewError ? (
                <ErrorMessage message={previewError} title="Preview failed" />
              ) : preview ? (
                <IdCardPreview renderData={preview} width={344} className="max-w-full" />
              ) : null}
            </div>

            {/* Cards Print Requests se bante hain */}
            <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl space-y-3">
              <p className="flex items-start gap-2 text-sm text-slate-700">
                <Printer className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  {isOperator
                    ? 'Select students and a template in a print request. Your school admin approves it and the Print Center prints the cards.'
                    : 'Cards are generated through Print Requests: class teachers submit them, you approve them, and the Print Center prints them.'}
                </span>
              </p>
              <Link
                to={isOperator ? ROUTES.PRINT_REQUEST_NEW : ROUTES.PRINT_REQUESTS}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs transition-colors"
              >
                <span>{isOperator ? 'New Print Request' : 'Go to Print Requests'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateIdCardsPage;

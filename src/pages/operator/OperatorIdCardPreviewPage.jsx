import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, ArrowLeft, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import {
  previewOperatorIdCardRequested,
  loadOperatorStudentsRequested,
  loadOperatorTemplatesRequested,
  clearOperatorPreview,
} from '../../features/operator/operatorSlice.js';
import {
  selectOperatorStudents,
  selectOperatorTemplates,
  selectOperatorPreview,
  selectOperatorPreviewing,
  selectOperatorError,
} from '../../features/operator/operatorSelectors.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import InlineLoader from '../../components/common/InlineLoader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

export const OperatorIdCardPreviewPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const students = useSelector(selectOperatorStudents);
  const templates = useSelector(selectOperatorTemplates);
  const preview = useSelector(selectOperatorPreview);
  const isPreviewing = useSelector(selectOperatorPreviewing);
  const error = useSelector(selectOperatorError);

  const [selectedStudentId, setSelectedStudentId] = useState(searchParams.get('studentId') || '');
  const [selectedTemplateId, setSelectedTemplateId] = useState(searchParams.get('templateId') || '');

  useEffect(() => {
    dispatch(loadOperatorStudentsRequested());
    dispatch(loadOperatorTemplatesRequested());
    return () => {
      dispatch(clearOperatorPreview());
    };
  }, [dispatch]);

  // Set defaults once options load if none selected
  useEffect(() => {
    if (!selectedStudentId && students.length > 0) {
      setSelectedStudentId(students[0].id || students[0]._id);
    }
    if (!selectedTemplateId && templates.length > 0) {
      setSelectedTemplateId(templates[0].id || templates[0]._id);
    }
  }, [students, templates, selectedStudentId, selectedTemplateId]);

  const handleGeneratePreview = (e) => {
    if (e) e.preventDefault();
    if (!selectedStudentId || !selectedTemplateId) return;

    dispatch(
      previewOperatorIdCardRequested({
        studentId: selectedStudentId,
        templateId: selectedTemplateId,
      })
    );
  };

  const previewImage = preview?.previewImage || preview?.previewUrl || preview?.data?.previewUrl;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Live ID Card Preview"
        subtitle="Test rendered card output for any assigned student against active institution templates before batch printing."
        icon={Eye}
        action={
          <button
            type="button"
            onClick={() => navigate('/operator/students')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>Assigned Students</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Controls Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5 h-fit">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Preview Parameters
          </h2>

          <form onSubmit={handleGeneratePreview} className="space-y-4">
            <div>
              <label htmlFor="preview-student" className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Student
              </label>
              <select
                id="preview-student"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="" disabled>Choose assigned student...</option>
                {students.map((st) => (
                  <option key={st.id || st._id} value={st.id || st._id}>
                    {st.name} ({st.studentId || 'ID'} - Class {st.className})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="preview-template" className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Template
              </label>
              <select
                id="preview-template"
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="" disabled>Choose template layout...</option>
                {templates.map((tmpl) => (
                  <option key={tmpl.id || tmpl._id} value={tmpl.id || tmpl._id}>
                    {tmpl.name} ({tmpl.orientation || 'PORTRAIT'})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isPreviewing || !selectedStudentId || !selectedTemplateId}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isPreviewing ? (
                <>
                  <InlineLoader />
                  <span>Rendering Preview...</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Render Live Preview</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 flex items-start gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Live Preview Display Box */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center min-h-[380px]">
          {isPreviewing ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-xs font-medium text-slate-500">Generating real pixel card render...</p>
            </div>
          ) : previewImage ? (
            <div className="flex flex-col items-center gap-5 w-full">
              <div className="border border-slate-200 rounded-2xl p-2 bg-slate-50 shadow-inner max-w-sm">
                <img
                  src={previewImage}
                  alt="ID Card Preview"
                  className="rounded-xl shadow-md max-h-[440px] object-contain mx-auto"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/operator/id-cards/generate?studentId=${selectedStudentId}&templateId=${selectedTemplateId}`)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Proceed to Card Generation</span>
                </button>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No Preview Rendered"
              description="Choose a student and template above, then click 'Render Live Preview' to test the layout."
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OperatorIdCardPreviewPage;

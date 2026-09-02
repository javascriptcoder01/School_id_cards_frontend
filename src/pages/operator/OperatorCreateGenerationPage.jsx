import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, Check, CheckSquare, Square } from 'lucide-react';
import {
  loadOperatorStudentsRequested,
  loadOperatorTemplatesRequested,
  createOperatorGenerationRequested,
} from '../../features/operator/operatorSlice.js';
import {
  selectOperatorStudents,
  selectOperatorTemplates,
  selectOperatorGenerating,
  selectOperatorError,
} from '../../features/operator/operatorSelectors.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import InlineLoader from '../../components/common/InlineLoader.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';

export const OperatorCreateGenerationPage = () => {
  const [searchParams] = useSearchParams();
  const initialStudentId = searchParams.get('studentId') || '';
  const initialTemplateId = searchParams.get('templateId') || '';

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const students = useSelector(selectOperatorStudents);
  const templates = useSelector(selectOperatorTemplates);
  const isGenerating = useSelector(selectOperatorGenerating);
  const error = useSelector(selectOperatorError);

  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplateId);
  const [selectedStudentIds, setSelectedStudentIds] = useState(
    initialStudentId ? [initialStudentId] : []
  );

  useEffect(() => {
    dispatch(loadOperatorStudentsRequested());
    dispatch(loadOperatorTemplatesRequested());
  }, [dispatch]);

  useEffect(() => {
    if (templates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(templates[0].id || templates[0]._id || '');
    }
  }, [templates, selectedTemplateId]);

  const handleToggleStudent = (id) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    const allIds = (students || []).map((s) => s.id || s._id);
    if (selectedStudentIds.length === allIds.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(allIds);
    }
  };

  const handleStartGeneration = () => {
    if (!selectedTemplateId || selectedStudentIds.length === 0) return;
    dispatch(
      createOperatorGenerationRequested({
        templateId: selectedTemplateId,
        studentIds: selectedStudentIds,
      })
    );
    navigate('/operator/id-cards/generations');
  };

  const allSelected = students.length > 0 && selectedStudentIds.length === students.length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Generate ID Cards"
        subtitle="Initiate a card rendering job for your assigned students using an approved template."
        icon={Sparkles}
        action={
          <button
            type="button"
            onClick={() => navigate('/operator/id-cards/generations')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>Job History</span>
          </button>
        }
      />

      {error && <ErrorState title="Generation Request Failed" message={error} />}

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        {/* Template Selector */}
        <div>
          <label htmlFor="gen-template" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            1. Select ID Card Template *
          </label>
          <select
            id="gen-template"
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            disabled={isGenerating}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
          >
            <option value="">-- Choose Template --</option>
            {templates.map((t) => (
              <option key={t.id || t._id} value={t.id || t._id}>
                {t.name} ({t.orientation || 'PORTRAIT'})
              </option>
            ))}
          </select>
        </div>

        {/* Student Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. Select Students ({selectedStudentIds.length} of {students.length} selected) *
            </label>
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto rounded-2xl border border-slate-200 divide-y divide-slate-100 p-1">
            {students.map((student) => {
              const id = student.id || student._id;
              const isSelected = selectedStudentIds.includes(id);

              return (
                <div
                  key={id}
                  onClick={() => handleToggleStudent(id)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50/75 text-indigo-900 font-semibold' : 'hover:bg-slate-50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                        }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{student.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {student.studentId} • Class {student.className}-{student.section}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">Roll: {student.rollNumber || '—'}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={handleStartGeneration}
            disabled={isGenerating || !selectedTemplateId || selectedStudentIds.length === 0}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <InlineLoader />
                <span>Submitting Generation Job...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Start Generation Job ({selectedStudentIds.length} Cards)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OperatorCreateGenerationPage;


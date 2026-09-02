import React, { useState } from 'react';
import { CreditCard, Sparkles, Layers, ArrowRight } from 'lucide-react';
import StudentSelector from './StudentSelector.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';

export const GenerationCreateForm = ({
  templates = [],
  students = [],
  isLoading = false,
  errorMessage = null,
  onSubmit,
  onCancel,
}) => {
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [errors, setErrors] = useState({});

  const handleToggleStudent = (studentId) => {
    if (isBulkMode) {
      setSelectedStudentIds((prev) =>
        prev.includes(studentId)
          ? prev.filter((id) => id !== studentId)
          : [...prev, studentId]
      );
    } else {
      setSelectedStudentIds([studentId]);
    }
    if (errors.students) {
      setErrors((prev) => ({ ...prev, students: null }));
    }
  };

  const handleSelectAll = (allIds) => {
    setSelectedStudentIds(allIds);
    if (errors.students) {
      setErrors((prev) => ({ ...prev, students: null }));
    }
  };

  const handleClearAll = () => {
    setSelectedStudentIds([]);
  };

  const validate = () => {
    const newErrors = {};

    if (!selectedTemplateId) {
      newErrors.templateId = 'Please select an ID card template';
    }

    if (selectedStudentIds.length === 0) {
      newErrors.students = isBulkMode
        ? 'Please select at least one student for bulk generation'
        : 'Please select a student for ID card generation';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (validate()) {
      if (isBulkMode) {
        onSubmit({
          isBulk: true,
          payload: {
            templateId: selectedTemplateId,
            studentIds: selectedStudentIds,
          },
        });
      } else {
        onSubmit({
          isBulk: false,
          payload: {
            templateId: selectedTemplateId,
            studentId: selectedStudentIds[0],
          },
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8 max-w-4xl">
      {errorMessage && (
        <ErrorMessage message={errorMessage} title="Generation Request Error" />
      )}

      {/* Mode Selector */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Generation Mode
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              setIsBulkMode(false);
              setSelectedStudentIds((prev) => (prev.length > 0 ? [prev[0]] : []));
            }}
            className={`p-4 rounded-2xl border text-left transition-all ${!isBulkMode
                ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-600/20'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${!isBulkMode ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
              >
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Single ID Card</h4>
                <p className="text-xs text-slate-500">Generate for one student record</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setIsBulkMode(true)}
            className={`p-4 rounded-2xl border text-left transition-all ${isBulkMode
                ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-600/20'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${isBulkMode ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
              >
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Bulk Generation</h4>
                <p className="text-xs text-slate-500">Generate multiple student ID cards simultaneously</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Template Selection */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Select ID Card Template</h3>
            <p className="text-xs text-slate-500">Choose the active template layout for card printing</p>
          </div>
        </div>

        <div>
          <label
            htmlFor="template-select"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
          >
            Active Template <span className="text-rose-500">*</span>
          </label>
          <select
            id="template-select"
            value={selectedTemplateId}
            disabled={isLoading}
            onChange={(e) => {
              setSelectedTemplateId(e.target.value);
              if (errors.templateId) {
                setErrors((prev) => ({ ...prev, templateId: null }));
              }
            }}
            className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer ${errors.templateId ? 'border-rose-400' : 'border-slate-200'
              }`}
          >
            <option value="">-- Choose a template --</option>
            {templates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name} ({tpl.orientation} - {tpl.width}×{tpl.height} mm)
              </option>
            ))}
          </select>
          {errors.templateId && (
            <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.templateId}</p>
          )}
        </div>
      </div>

      {/* Student Selection */}
      <div>
        <StudentSelector
          students={students}
          selectedStudentIds={selectedStudentIds}
          onToggleStudent={handleToggleStudent}
          onSelectAll={handleSelectAll}
          onClearAll={handleClearAll}
          isBulkMode={isBulkMode}
          isLoading={isLoading}
        />
        {errors.students && (
          <p className="text-xs text-rose-500 mt-2 font-semibold px-2">{errors.students}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          disabled={isLoading}
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-100 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Creating Job...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>
                {isBulkMode
                  ? `Create Bulk Job (${selectedStudentIds.length} Students)`
                  : 'Create Generation Job'}
              </span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default GenerationCreateForm;


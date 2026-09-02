import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUsersList } from '../../features/users/userSelectors.js';
import InlineLoader from '../common/InlineLoader.jsx';

export const OperatorAssignmentForm = ({
  initialValues = null,
  onSubmit,
  onCancel,
  isSaving = false,
}) => {
  const allUsers = useSelector(selectUsersList);
  const operatorUsers = (allUsers || []).filter(
    (u) => (u.role === 'OPERATOR' || u.role === 'operator') && u.isActive !== false
  );

  const [operatorId, setOperatorId] = useState('');
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setOperatorId(
        initialValues.operatorId?._id ||
        initialValues.operatorId?.id ||
        initialValues.operatorId ||
        ''
      );
      setClassName(initialValues.className || '');
      setSection(initialValues.section || '');
    } else {
      setOperatorId('');
      setClassName('');
      setSection('');
    }
    setErrors({});
  }, [initialValues]);

  const validate = () => {
    const errs = {};
    if (!operatorId.trim()) errs.operatorId = 'Operator selection is required';
    if (!className.trim()) errs.className = 'Class name is required';
    if (!section.trim()) errs.section = 'Section is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      operatorId: operatorId.trim(),
      className: className.trim(),
      section: section.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Operator Select */}
      <div>
        <label htmlFor="assignment-operator" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
          Assigned Operator (Class Teacher) *
        </label>
        <select
          id="assignment-operator"
          name="operatorId"
          value={operatorId}
          disabled={Boolean(initialValues) || isSaving}
          onChange={(e) => {
            setOperatorId(e.target.value);
            if (errors.operatorId) setErrors((prev) => ({ ...prev, operatorId: null }));
          }}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${errors.operatorId ? 'border-red-400 bg-red-50/50' : 'border-slate-200 bg-white'
            }`}
        >
          <option value="">-- Select an active Operator --</option>
          {operatorUsers.map((op) => (
            <option key={op.id || op._id} value={op.id || op._id}>
              {op.name} ({op.email})
            </option>
          ))}
        </select>
        {errors.operatorId && <p className="text-xs text-red-600 mt-1 font-medium">{errors.operatorId}</p>}
      </div>

      {/* Class Name */}
      <div>
        <label htmlFor="assignment-class" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
          Class / Grade *
        </label>
        <input
          id="assignment-class"
          name="className"
          type="text"
          placeholder="e.g. 10 or 12th Grade"
          value={className}
          disabled={isSaving}
          onChange={(e) => {
            setClassName(e.target.value);
            if (errors.className) setErrors((prev) => ({ ...prev, className: null }));
          }}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${errors.className ? 'border-red-400 bg-red-50/50' : 'border-slate-200 bg-white'
            }`}
        />
        {errors.className && <p className="text-xs text-red-600 mt-1 font-medium">{errors.className}</p>}
      </div>

      {/* Section */}
      <div>
        <label htmlFor="assignment-section" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
          Section *
        </label>
        <input
          id="assignment-section"
          name="section"
          type="text"
          placeholder="e.g. A, B, or Green"
          value={section}
          disabled={isSaving}
          onChange={(e) => {
            setSection(e.target.value);
            if (errors.section) setErrors((prev) => ({ ...prev, section: null }));
          }}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${errors.section ? 'border-red-400 bg-red-50/50' : 'border-slate-200 bg-white'
            }`}
        />
        {errors.section && <p className="text-xs text-red-600 mt-1 font-medium">{errors.section}</p>}
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isSaving && <InlineLoader />}
          <span>{initialValues ? 'Save Changes' : 'Create Assignment'}</span>
        </button>
      </div>
    </form>
  );
};

export default OperatorAssignmentForm;


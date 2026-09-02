import React from 'react';
import { X, UserPlus, Edit3 } from 'lucide-react';
import OperatorAssignmentForm from './OperatorAssignmentForm.jsx';

export const OperatorAssignmentDialog = ({
  isOpen,
  initialValues = null,
  onSubmit,
  onClose,
  isSaving = false,
}) => {
  if (!isOpen) return null;

  const isEditing = Boolean(initialValues);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              {isEditing ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 id="dialog-title" className="text-base font-bold text-slate-900">
                {isEditing ? 'Edit Operator Assignment' : 'Assign Operator to Class'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? 'Update assigned class or section'
                  : 'Map a class teacher / operator to a specific class & section'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <OperatorAssignmentForm
            initialValues={initialValues}
            onSubmit={onSubmit}
            onCancel={onClose}
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  );
};

export default OperatorAssignmentDialog;


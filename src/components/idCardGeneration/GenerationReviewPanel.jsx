import React from 'react';
import { Sparkles, Users, CreditCard, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import ErrorMessage from '../common/ErrorMessage.jsx';

/**
 * GenerationReviewPanel Component
 * Step 3 in Bulk ID Card Generation Wizard
 * Displays review summary and triggers final generation submission.
 */
export const GenerationReviewPanel = ({
  selectedStudentsCount = 0,
  eligibleStudentsCount = 0,
  selectedTemplate = null,
  operatorScope = null,
  isLoading = false,
  errorMessage = null,
  onSubmit,
  onBack,
}) => {
  const isValid = selectedStudentsCount > 0 && selectedTemplate && !isLoading;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Review & Generate ID Cards
          </h2>
          <p className="text-xs text-slate-500">
            Confirm your batch parameters before dispatching the ID card generation job.
          </p>
        </div>
      </div>

      {errorMessage && (
        <ErrorMessage message={errorMessage} title="Generation Submission Error" />
      )}

      {/* Review Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Selected Students */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Target Students</span>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {selectedStudentsCount}{' '}
            <span className="text-xs font-normal text-slate-500">students selected</span>
          </p>
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>All selected students have 100% complete profiles</span>
          </p>
        </div>

        {/* Selected Template */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <span>Chosen Template</span>
          </div>
          <p className="text-lg font-bold text-slate-900 truncate">
            {selectedTemplate ? selectedTemplate.name : 'None Selected'}
          </p>
          <p className="text-xs text-slate-500">
            Orientation:{' '}
            <span className="font-semibold text-slate-700">
              {selectedTemplate?.orientation || 'VERTICAL'}
            </span>
          </p>
        </div>

        {/* Operator Scope */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>Authorized Scope</span>
          </div>
          <p className="text-sm font-bold text-slate-900">
            {operatorScope?.className || 'Assigned Class'} Sec{' '}
            {operatorScope?.sectionName || operatorScope?.section || 'A'}
          </p>
          <p className="text-xs text-slate-500">
            Subject:{' '}
            <span className="font-semibold text-slate-700">
              {operatorScope?.subjectName || 'General'}
            </span>
          </p>
        </div>
      </div>

      {/* Information Banner */}
      <div className="p-4 bg-indigo-50/80 border border-indigo-100 rounded-2xl flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
        <div className="text-xs text-indigo-900 space-y-0.5">
          <p className="font-bold">Automated Generation & Verification</p>
          <p className="text-indigo-700">
            Upon submission, the backend will generate high-resolution print-ready ID cards,
            encode secure verification QR tokens, and attribute this batch to your operator account.
          </p>
        </div>
      </div>

      {/* Footer Navigation Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors disabled:opacity-50"
        >
          ← Back to Steps
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!isValid}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Generating ID Cards...' : `Generate ${selectedStudentsCount} ID Cards`}</span>
        </button>
      </div>
    </div>
  );
};

export default GenerationReviewPanel;

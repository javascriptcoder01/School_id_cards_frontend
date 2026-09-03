import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, ArrowLeft, Check, Users, CreditCard, Layers } from 'lucide-react';
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
import { selectCurrentUser } from '../../features/auth/authSelectors.js';
import StudentGenerationSelector from '../../components/idCardGeneration/StudentGenerationSelector.jsx';
import TemplateGenerationSelector from '../../components/idCardGeneration/TemplateGenerationSelector.jsx';
import GenerationReviewPanel from '../../components/idCardGeneration/GenerationReviewPanel.jsx';
import { calculateStudentCompletion } from '../../utils/studentCompletion.js';
import { ROUTES } from '../../constants/routes.js';

/**
 * OperatorGenerateCardsPage Component
 * 3-Step Wizard for Bulk ID Card Generation:
 * Step 1: Select Eligible Students
 * Step 2: Select Approved Template
 * Step 3: Review & Generate
 */
export const OperatorGenerateCardsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const currentUser = useSelector(selectCurrentUser);
  const students = useSelector(selectOperatorStudents);
  const templates = useSelector(selectOperatorTemplates);
  const isGenerating = useSelector(selectOperatorGenerating);
  const error = useSelector(selectOperatorError);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  // Pre-populate if query params provide studentId or templateId
  useEffect(() => {
    dispatch(loadOperatorStudentsRequested());
    dispatch(loadOperatorTemplatesRequested());
  }, [dispatch]);

  useEffect(() => {
    const qStudentId = searchParams.get('studentId');
    const qTemplateId = searchParams.get('templateId');

    if (qStudentId && !selectedStudentIds.includes(qStudentId)) {
      setSelectedStudentIds([qStudentId]);
    }
    if (qTemplateId && !selectedTemplateId) {
      setSelectedTemplateId(qTemplateId);
    }
  }, [searchParams, selectedStudentIds, selectedTemplateId]);

  // If templates load and none selected, auto-select first
  useEffect(() => {
    if (templates?.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(templates[0].id || templates[0]._id);
    }
  }, [templates, selectedTemplateId]);

  const selectedTemplate = templates.find(
    (t) => (t.id || t._id) === selectedTemplateId
  );

  const eligibleStudentsCount = students.filter(
    (s) => calculateStudentCompletion(s).isComplete
  ).length;

  const handleNextFromStudents = () => {
    if (selectedStudentIds.length > 0) {
      setCurrentStep(2);
    }
  };

  const handleNextFromTemplates = () => {
    if (selectedTemplateId) {
      setCurrentStep(3);
    }
  };

  const handleSubmitGeneration = () => {
    if (selectedStudentIds.length === 0 || !selectedTemplateId || isGenerating) return;

    dispatch(
      createOperatorGenerationRequested({
        templateId: selectedTemplateId,
        studentIds: selectedStudentIds,
        onSuccess: () => {
          navigate(ROUTES.PRINT_REQUESTS || '/print-requests');
        },
      })
    );
  };

  const steps = [
    { number: 1, title: 'Select Students', icon: Users },
    { number: 2, title: 'Select Template', icon: CreditCard },
    { number: 3, title: 'Review & Dispatch', icon: Sparkles },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Bulk Card Generation Wizard
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Generate Student ID Cards
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Follow the 3-step workflow to validate student profiles, choose a template, and dispatch card generation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(ROUTES.STUDENTS || '/students')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students</span>
        </button>
      </div>

      {/* Step Progress Stepper */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-3 gap-2 sm:gap-4" role="tablist" aria-label="Wizard Steps">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCurrent = currentStep === step.number;
            const isCompleted = currentStep > step.number;

            return (
              <button
                key={step.number}
                type="button"
                onClick={() => {
                  if (step.number < currentStep || (step.number === 2 && selectedStudentIds.length > 0)) {
                    setCurrentStep(step.number);
                  }
                }}
                disabled={step.number > currentStep && selectedStudentIds.length === 0}
                className={`flex flex-col sm:flex-row items-center sm:items-start gap-3 p-3 rounded-2xl transition-all text-left ${
                  isCurrent
                    ? 'bg-indigo-50 border border-indigo-200 text-indigo-950 font-bold'
                    : isCompleted
                    ? 'bg-slate-50 text-slate-700 hover:bg-slate-100 cursor-pointer'
                    : 'text-slate-400 opacity-60 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.number}
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Step {step.number}
                  </p>
                  <p className="text-xs sm:text-sm font-bold truncate">{step.title}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 1: Student Selection */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <StudentGenerationSelector
            students={students}
            selectedStudentIds={selectedStudentIds}
            onSelectionChange={setSelectedStudentIds}
            isLoading={isGenerating}
          />

          <div className="flex items-center justify-end">
            <button
              type="button"
              disabled={selectedStudentIds.length === 0}
              onClick={handleNextFromStudents}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Next: Select Template ({selectedStudentIds.length} Selected) →</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Template Selection */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <TemplateGenerationSelector
            templates={templates}
            selectedTemplateId={selectedTemplateId}
            onSelectTemplate={setSelectedTemplateId}
            isLoading={isGenerating}
          />

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
            >
              ← Back to Students
            </button>

            <button
              type="button"
              disabled={!selectedTemplateId}
              onClick={handleNextFromTemplates}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Next: Review & Generate →</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Generate */}
      {currentStep === 3 && (
        <GenerationReviewPanel
          selectedStudentsCount={selectedStudentIds.length}
          eligibleStudentsCount={eligibleStudentsCount}
          selectedTemplate={selectedTemplate}
          operatorScope={{
            className: currentUser?.className,
            sectionName: currentUser?.sectionName || currentUser?.section,
            subjectName: currentUser?.subjectName,
          }}
          isLoading={isGenerating}
          errorMessage={error}
          onSubmit={handleSubmitGeneration}
          onBack={() => setCurrentStep(2)}
        />
      )}
    </div>
  );
};

export default OperatorGenerateCardsPage;

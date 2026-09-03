import React from 'react';
import { CreditCard, Check, Sparkles, Layout } from 'lucide-react';
import TemplateLivePreview from '../templates/designer/TemplateLivePreview.jsx';

/**
 * TemplateGenerationSelector Component
 * Step 2 in Bulk ID Card Generation Wizard
 * Allows Operators to select an approved ID card template for card rendering.
 */
export const TemplateGenerationSelector = ({
  templates = [],
  selectedTemplateId = '',
  onSelectTemplate,
  isLoading = false,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Select ID Card Template
            </h2>
            <p className="text-xs text-slate-500">
              Choose an approved template design for rendering the student ID cards.
            </p>
          </div>
        </div>

        {selectedTemplateId && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Template Selected</span>
          </span>
        )}
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="py-12 text-center text-slate-400 bg-slate-50 border border-slate-200 rounded-2xl">
          <Layout className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="font-semibold text-slate-700">No active templates available</p>
          <p className="text-xs text-slate-400 mt-1">
            Please contact your college administrator to create and activate ID card templates.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => {
            const isSelected = selectedTemplateId === template.id;

            return (
              <div
                key={template.id}
                onClick={() => onSelectTemplate(template.id)}
                className={`relative rounded-2xl border-2 p-5 flex flex-col justify-between transition-all cursor-pointer shadow-xs ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                }`}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectTemplate(template.id);
                  }
                }}
              >
                {/* Selection Indicator Badge */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}

                <div className="space-y-3">
                  {/* Template Meta */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {template.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase">
                        {template.orientation || 'VERTICAL'}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {template.dimensions?.width || 54} x {template.dimensions?.height || 86} mm
                      </span>
                    </div>
                  </div>

                  {/* Thumbnail / Live Preview */}
                  <div className="w-full h-44 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden p-2">
                    {template.layoutConfig ? (
                      <div className="scale-65 transform-gpu origin-center pointer-events-none">
                        <TemplateLivePreview
                          template={template}
                          previewData={{
                            name: 'Rahul Sharma',
                            studentId: 'STU-2026-001',
                            className: 'Class 10',
                            section: 'A',
                            rollNumber: '101',
                          }}
                        />
                      </div>
                    ) : (
                      <div className="text-center text-slate-400 text-xs">
                        <CreditCard className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                        <span>Standard ID Template</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">
                    {isSelected ? 'Selected' : 'Click to select'}
                  </span>
                  <input
                    type="radio"
                    name="templateSelection"
                    checked={isSelected}
                    onChange={() => onSelectTemplate(template.id)}
                    aria-label={`Select template ${template.name}`}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TemplateGenerationSelector;

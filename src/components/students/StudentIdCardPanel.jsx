// StudentIdCardPanel.jsx
// Student detail ka "ID Card" tab: active template chuno → is student ka card (front + back) flip ke saath.
// Data features/idCards se (templates + POST /id-cards/preview) — Redux saga, kuch save nahi hota.
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
import {
  fetchCardTemplatesRequested,
  previewIdCardRequested,
  clearIdCardPreview,
} from '../../features/idCards/idCardSlice.js';
import {
  selectCardTemplates,
  selectCardTemplatesLoading,
  selectCardTemplatesError,
  selectIdCardPreview,
  selectIdCardPreviewLoading,
  selectIdCardPreviewError,
} from '../../features/idCards/idCardSelectors.js';
import IdCardFlip from '../idCards/IdCardFlip.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';

const templateIdOf = (template) => template?.id || template?._id || '';

/**
 * @param {object} props
 * @param {string} props.studentId - Student ka Mongo id
 * @param {boolean} props.isOperator - Class Teacher (operator templates API)
 */
export const StudentIdCardPanel = ({ studentId, isOperator }) => {
  const dispatch = useDispatch();
  const templates = useSelector(selectCardTemplates);
  const templatesLoading = useSelector(selectCardTemplatesLoading);
  const templatesError = useSelector(selectCardTemplatesError);
  const preview = useSelector(selectIdCardPreview);
  const previewLoading = useSelector(selectIdCardPreviewLoading);
  const previewError = useSelector(selectIdCardPreviewError);

  const [templateId, setTemplateId] = useState('');
  const activeTemplates = templates.filter((t) => t.isActive !== false);
  // Chuna nahi → pehla active template
  const activeTemplateId = templateId || templateIdOf(activeTemplates[0]);

  useEffect(() => {
    dispatch(fetchCardTemplatesRequested({ isOperator }));
    return () => {
      dispatch(clearIdCardPreview());
    };
  }, [dispatch, isOperator]);

  useEffect(() => {
    if (activeTemplateId && studentId) {
      dispatch(previewIdCardRequested({ templateId: activeTemplateId, studentId }));
    }
  }, [dispatch, activeTemplateId, studentId]);

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-800">ID Card</h2>
          <p className="text-xs text-slate-500">How this student&apos;s card looks with each active template. Nothing is saved.</p>
        </div>
        <div className="sm:w-72">
          <label htmlFor="student-card-template" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Template
          </label>
          <select
            id="student-card-template"
            value={activeTemplateId}
            onChange={(e) => setTemplateId(e.target.value)}
            disabled={templatesLoading || activeTemplates.length === 0}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {activeTemplates.length === 0 && <option value="">{templatesLoading ? 'Loading templates…' : 'No active templates'}</option>}
            {activeTemplates.map((t) => (
              <option key={templateIdOf(t)} value={templateIdOf(t)}>
                {t.name}{t.version ? ` (v${t.version})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {templatesError && <ErrorMessage message={templatesError} title="Couldn't load templates" />}

      <div className="flex justify-center rounded-2xl border border-slate-200 bg-slate-100/70 p-6">
        {previewLoading ? (
          <p className="flex items-center gap-2 py-10 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading card…
          </p>
        ) : previewError ? (
          <ErrorMessage message={previewError} title="Preview failed" />
        ) : preview ? (
          <IdCardFlip renderData={preview} size="lg" />
        ) : (
          <p className="py-10 text-sm text-slate-500">
            {activeTemplates.length === 0 && !templatesLoading ? 'Ask the school admin to create an active template.' : 'Choose a template.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default StudentIdCardPanel;

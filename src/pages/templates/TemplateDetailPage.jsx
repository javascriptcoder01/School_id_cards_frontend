import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  CreditCard,
  Palette,
  Layers,
  Image,
  ArrowLeft,
  Edit3,
  Eye,
} from 'lucide-react';
import {
  fetchTemplateDetailRequested,
  clearSelectedTemplate,
} from '../../features/templates/templateSlice.js';
import {
  selectSelectedTemplate,
  selectTemplateDetailLoading,
  selectTemplateError,
} from '../../features/templates/templateSelectors.js';
import { selectUserRole } from '../../features/auth/authSelectors.js';
import { ROUTES, getTemplateEditRoute } from '../../constants/routes.js';
import { ROLES } from '../../constants/roles.js';
import { TEMPLATE_FIELD_LABELS } from '../../constants/template.js';
import TemplateStatusBadge from '../../components/templates/TemplateStatusBadge.jsx';
import TemplateLivePreview from '../../components/templates/designer/TemplateLivePreview.jsx';
import Loader from '../../components/common/Loader.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';

export const TemplateDetailPage = () => {
  const { templateId } = useParams();
  const dispatch = useDispatch();
  const userRole = useSelector(selectUserRole);

  const template = useSelector(selectSelectedTemplate);
  const isLoading = useSelector(selectTemplateDetailLoading);
  const error = useSelector(selectTemplateError);

  const isCollegeAdmin = userRole === ROLES.COLLEGE_ADMIN;

  useEffect(() => {
    if (templateId) {
      dispatch(fetchTemplateDetailRequested(templateId));
    }

    return () => {
      dispatch(clearSelectedTemplate());
    };
  }, [dispatch, templateId]);

  if (isLoading) {
    return <Loader message="Loading template details..." />;
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.TEMPLATES}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Templates</span>
          </Link>
        </div>
        <ErrorMessage message={error} title="Template Not Found or Inaccessible" />
      </div>
    );
  }

  if (!template) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to={ROUTES.TEMPLATES}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Templates Directory</span>
        </Link>

        {isCollegeAdmin && (
          <Link
            to={getTemplateEditRoute(template.id)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/30 transition-all"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Template</span>
          </Link>
        )}
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
            <CreditCard className="w-8 h-8" />
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {template.name}
              </h1>
              <TemplateStatusBadge isActive={template.isActive} />
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 flex-wrap">
              <span className="bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-slate-700">
                Orientation: {template.orientation || 'PORTRAIT'}
              </span>
              <span className="font-mono bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md text-slate-600">
                Dimensions: {template.width} × {template.height} mm
              </span>
              <span className="font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                {template.fields?.length || 0} Dynamic Field(s)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Live Preview Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Visual Card Layout</h2>
              <p className="text-xs text-slate-500">Rendered preview with sample student mock credentials</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center p-6 bg-slate-100/70 rounded-2xl border border-slate-200">
          <TemplateLivePreview template={template} scale={1.1} />
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Specifications & Branding */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Palette className="w-5 h-5 text-indigo-600" />
            Styling & Branding Theme
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Primary Color:</span>
              <div className="flex items-center gap-2">
                {template.primaryColor && (
                  <div
                    className="w-4 h-4 rounded-full border border-slate-300 shadow-xs"
                    style={{ backgroundColor: template.primaryColor }}
                  />
                )}
                <span className="font-mono font-medium text-slate-800">
                  {template.primaryColor || 'None'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Secondary Color:</span>
              <div className="flex items-center gap-2">
                {template.secondaryColor && (
                  <div
                    className="w-4 h-4 rounded-full border border-slate-300 shadow-xs"
                    style={{ backgroundColor: template.secondaryColor }}
                  />
                )}
                <span className="font-mono font-medium text-slate-800">
                  {template.secondaryColor || 'None'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Background URL:</span>
              <span className="font-medium text-slate-900 truncate max-w-[200px]">
                {template.background ? (
                  <a href={template.background} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                    {template.background}
                  </a>
                ) : (
                  <span className="text-slate-400 italic">None</span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500">Logo URL:</span>
              <span className="font-medium text-slate-900 truncate max-w-[200px]">
                {template.logo ? (
                  <a href={template.logo} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                    {template.logo}
                  </a>
                ) : (
                  <span className="text-slate-400 italic">None</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Photo Box Config */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Image className="w-5 h-5 text-purple-600" />
            Photo Box Placement
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">X Position:</span>
              <span className="font-mono font-medium text-slate-900">{template.photo?.x ?? 0} mm</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Y Position:</span>
              <span className="font-mono font-medium text-slate-900">{template.photo?.y ?? 0} mm</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Photo Width:</span>
              <span className="font-mono font-medium text-slate-900">{template.photo?.width ?? 25} mm</span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500">Photo Height:</span>
              <span className="font-mono font-medium text-slate-900">{template.photo?.height ?? 30} mm</span>
            </div>
          </div>
        </div>

        {/* Dynamic Fields Table */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 md:col-span-2">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Layers className="w-5 h-5 text-amber-600" />
            Mapped Dynamic Fields ({template.fields?.length || 0})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-4">Field Variable</th>
                  <th className="py-2.5 px-4">Label</th>
                  <th className="py-2.5 px-4">X (mm)</th>
                  <th className="py-2.5 px-4">Y (mm)</th>
                  <th className="py-2.5 px-4">Font Size</th>
                  <th className="py-2.5 px-4">Font Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {template.fields?.map((f, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-slate-800 font-sans">
                      {TEMPLATE_FIELD_LABELS[f.field] || f.field}
                      <span className="text-[11px] text-slate-400 font-mono ml-2">({f.field})</span>
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-600">{f.label || '--'}</td>
                    <td className="py-2.5 px-4 text-slate-700">{f.x}</td>
                    <td className="py-2.5 px-4 text-slate-700">{f.y}</td>
                    <td className="py-2.5 px-4 text-slate-700">{f.fontSize} pt</td>
                    <td className="py-2.5 px-4 font-sans text-slate-700">{f.fontWeight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateDetailPage;

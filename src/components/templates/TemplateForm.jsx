import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Palette,
  Layers,
  Image,
  Save,
  Trash2,
  Layout,
  Sliders,
} from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';
import {
  TEMPLATE_ORIENTATIONS,
  TEMPLATE_ORIENTATION_VALUES,
  TEMPLATE_FONT_WEIGHTS,
  TEMPLATE_FIELDS,
  TEMPLATE_FIELD_LABELS,
  TEMPLATE_FIELD_VALUES,
} from '../../constants/template.js';
import ErrorMessage from '../common/ErrorMessage.jsx';
import RouteLoader from '../common/RouteLoader.jsx';

// Lazy load the visual template designer to optimize initial bundle size
const TemplateDesigner = lazy(() => import('./designer/TemplateDesigner.jsx'));

const DEFAULT_FIELDS = [
  { field: TEMPLATE_FIELDS.NAME, label: 'Student Name', x: 10, y: 30, fontSize: 14, fontWeight: TEMPLATE_FONT_WEIGHTS.BOLD, visible: true },
  { field: TEMPLATE_FIELDS.STUDENT_ID, label: 'Student ID', x: 10, y: 40, fontSize: 11, fontWeight: TEMPLATE_FONT_WEIGHTS.NORMAL, visible: true },
  { field: TEMPLATE_FIELDS.CLASS_NAME, label: 'Class', x: 10, y: 48, fontSize: 11, fontWeight: TEMPLATE_FONT_WEIGHTS.NORMAL, visible: true },
  { field: TEMPLATE_FIELDS.ROLL_NUMBER, label: 'Roll No', x: 10, y: 56, fontSize: 11, fontWeight: TEMPLATE_FONT_WEIGHTS.NORMAL, visible: true },
];

export const TemplateForm = ({
  initialValues = null,
  isEdit = false,
  isLoading = false,
  errorMessage = null,
  onSubmit,
  onCancel,
}) => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('DESIGNER'); // 'DESIGNER' | 'SPECIFICATIONS'

  const [formData, setFormData] = useState({
    name: '',
    orientation: TEMPLATE_ORIENTATIONS.PORTRAIT,
    width: 86,
    height: 54,
    background: '',
    logo: '',
    primaryColor: '#4F46E5',
    secondaryColor: '#9333EA',
    fields: DEFAULT_FIELDS,
    photo: {
      x: 55,
      y: 20,
      width: 25,
      height: 30,
      visible: true,
    },
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setFormData({
        name: initialValues.name || '',
        orientation: initialValues.orientation || TEMPLATE_ORIENTATIONS.PORTRAIT,
        width: initialValues.width || 86,
        height: initialValues.height || 54,
        background: initialValues.background || '',
        logo: initialValues.logo || '',
        primaryColor: initialValues.primaryColor || '#4F46E5',
        secondaryColor: initialValues.secondaryColor || '#9333EA',
        fields: Array.isArray(initialValues.fields) && initialValues.fields.length > 0
          ? initialValues.fields
          : DEFAULT_FIELDS,
        photo: initialValues.photo || {
          x: 55,
          y: 20,
          width: 25,
          height: 30,
          visible: true,
        },
      });
    }
  }, [initialValues]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handlePhotoChange = (fieldOrProp, value) => {
    if (fieldOrProp === 'photo' && typeof value === 'object') {
      setFormData((prev) => ({
        ...prev,
        photo: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        photo: {
          ...prev.photo,
          [fieldOrProp]: value,
        },
      }));
    }
  };

  const handleFieldChange = (index, prop, value) => {
    setFormData((prev) => {
      const updated = [...prev.fields];
      updated[index] = { ...updated[index], [prop]: value };
      return { ...prev, fields: updated };
    });
  };

  const handleAddField = (fieldName) => {
    if (formData.fields.some((f) => f.field === fieldName)) return;

    const newField = {
      field: fieldName,
      label: TEMPLATE_FIELD_LABELS[fieldName] || fieldName,
      x: 10,
      y: 20 + formData.fields.length * 8,
      fontSize: 11,
      fontWeight: TEMPLATE_FONT_WEIGHTS.NORMAL,
      visible: true,
    };

    setFormData((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
  };

  const handleRemoveField = (index) => {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const newErrors = {};

    const nameTrimmed = formData.name.trim();
    if (!nameTrimmed) {
      newErrors.name = 'Template name is required';
    } else if (nameTrimmed.length < 2) {
      newErrors.name = 'Template name must be at least 2 characters long';
    } else if (nameTrimmed.length > 150) {
      newErrors.name = 'Template name cannot exceed 150 characters';
    }

    if (!formData.orientation) {
      newErrors.orientation = 'Orientation is required';
    }

    if (!formData.width || Number(formData.width) <= 0) {
      newErrors.width = 'Width must be a positive number';
    }

    if (!formData.height || Number(formData.height) <= 0) {
      newErrors.height = 'Height must be a positive number';
    }

    if (!formData.fields || formData.fields.length === 0) {
      newErrors.fields = 'At least one field must be configured';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (validate()) {
      const payload = {
        name: formData.name.trim(),
        orientation: formData.orientation,
        width: Number(formData.width),
        height: Number(formData.height),
        background: formData.background ? formData.background.trim() : null,
        logo: formData.logo ? formData.logo.trim() : null,
        primaryColor: formData.primaryColor ? formData.primaryColor.trim() : null,
        secondaryColor: formData.secondaryColor ? formData.secondaryColor.trim() : null,
        fields: formData.fields.map((f) => ({
          field: f.field,
          label: f.label ? f.label.trim() : null,
          x: Number(f.x) || 0,
          y: Number(f.y) || 0,
          fontSize: Number(f.fontSize) || 12,
          fontWeight: f.fontWeight || TEMPLATE_FONT_WEIGHTS.NORMAL,
          visible: f.visible !== false,
        })),
        photo: formData.photo
          ? {
              x: Number(formData.photo.x) || 0,
              y: Number(formData.photo.y) || 0,
              width: Number(formData.photo.width) || 25,
              height: Number(formData.photo.height) || 30,
              visible: formData.photo.visible !== false,
            }
          : null,
      };

      onSubmit(payload);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(ROUTES.TEMPLATES);
    }
  };

  const availableFieldOptions = TEMPLATE_FIELD_VALUES.filter(
    (fieldVal) => !formData.fields.some((f) => f.field === fieldVal)
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8 max-w-5xl">
      {errorMessage && (
        <ErrorMessage message={errorMessage} title="Submission Error" />
      )}

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('DESIGNER')}
          className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'DESIGNER'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>Visual Card Designer</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('SPECIFICATIONS')}
          className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'SPECIFICATIONS'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Form Specifications & Variables</span>
        </button>
      </div>

      {/* Section 1: Template General Properties (Always accessible) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Template Specifications</h2>
            <p className="text-xs text-slate-500">Name, card orientation, and physical dimensions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Template Name */}
          <div className="sm:col-span-2">
            <label
              htmlFor="template-name"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
            >
              Template Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="template-name"
              type="text"
              value={formData.name}
              disabled={isLoading}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Standard Student ID 2026"
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all ${
                errors.name ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200'
              }`}
            />
            {errors.name && (
              <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.name}</p>
            )}
          </div>

          {/* Orientation */}
          <div>
            <label
              htmlFor="template-orientation"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
            >
              Card Orientation <span className="text-rose-500">*</span>
            </label>
            <select
              id="template-orientation"
              value={formData.orientation}
              disabled={isLoading}
              onChange={(e) => handleChange('orientation', e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
            >
              {TEMPLATE_ORIENTATION_VALUES.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Dimensions (Width & Height) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="template-width"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
              >
                Width (mm) <span className="text-rose-500">*</span>
              </label>
              <input
                id="template-width"
                type="number"
                min="1"
                value={formData.width}
                disabled={isLoading}
                onChange={(e) => handleChange('width', e.target.value)}
                className={`w-full px-4 py-2.5 font-mono bg-slate-50 border rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all ${
                  errors.width ? 'border-rose-400' : 'border-slate-200'
                }`}
              />
            </div>
            <div>
              <label
                htmlFor="template-height"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
              >
                Height (mm) <span className="text-rose-500">*</span>
              </label>
              <input
                id="template-height"
                type="number"
                min="1"
                value={formData.height}
                disabled={isLoading}
                onChange={(e) => handleChange('height', e.target.value)}
                className={`w-full px-4 py-2.5 font-mono bg-slate-50 border rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all ${
                  errors.height ? 'border-rose-400' : 'border-slate-200'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tab View 1: Visual Designer View */}
      {activeTab === 'DESIGNER' && (
        <div className="space-y-6">
          <Suspense fallback={<RouteLoader message="Loading visual card designer..." />}>
            <TemplateDesigner
              formData={formData}
              onPhotoChange={handlePhotoChange}
              onFieldChange={handleFieldChange}
              onAddField={handleAddField}
              onRemoveField={handleRemoveField}
            />
          </Suspense>
        </div>
      )}

      {/* Tab View 2: Specifications & Variable Inputs */}
      {activeTab === 'SPECIFICATIONS' && (
        <>
          {/* Section 2: Branding & Style */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center font-bold">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Branding & Color Theme</h2>
                <p className="text-xs text-slate-500">Logos, background artwork, and theme accents</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Background URL */}
              <div>
                <label
                  htmlFor="template-bg"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
                >
                  Background Image URL
                </label>
                <input
                  id="template-bg"
                  type="url"
                  value={formData.background}
                  disabled={isLoading}
                  onChange={(e) => handleChange('background', e.target.value)}
                  placeholder="https://example.com/id-bg.png"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              {/* Logo URL */}
              <div>
                <label
                  htmlFor="template-logo"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
                >
                  College Logo URL
                </label>
                <input
                  id="template-logo"
                  type="url"
                  value={formData.logo}
                  disabled={isLoading}
                  onChange={(e) => handleChange('logo', e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              {/* Primary Color */}
              <div>
                <label
                  htmlFor="template-primary"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
                >
                  Primary Theme Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.primaryColor || '#4F46E5'}
                    disabled={isLoading}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="w-10 h-10 p-0 border border-slate-200 rounded-xl cursor-pointer"
                  />
                  <input
                    id="template-primary"
                    type="text"
                    value={formData.primaryColor}
                    disabled={isLoading}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    placeholder="#4F46E5"
                    className="w-full px-4 py-2.5 font-mono bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div>
                <label
                  htmlFor="template-secondary"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
                >
                  Secondary Theme Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.secondaryColor || '#9333EA'}
                    disabled={isLoading}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    className="w-10 h-10 p-0 border border-slate-200 rounded-xl cursor-pointer"
                  />
                  <input
                    id="template-secondary"
                    type="text"
                    value={formData.secondaryColor}
                    disabled={isLoading}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    placeholder="#9333EA"
                    className="w-full px-4 py-2.5 font-mono bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Dynamic Data Fields Configuration */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Dynamic Text Fields ({formData.fields.length})</h2>
                  <p className="text-xs text-slate-500">Map data variables and coordinates on the card layout</p>
                </div>
              </div>

              {availableFieldOptions.length > 0 && (
                <div className="flex items-center gap-2">
                  <select
                    id="add-field-select"
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddField(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors cursor-pointer"
                    defaultValue=""
                  >
                    <option value="" disabled>+ Add Variable Field</option>
                    {availableFieldOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {TEMPLATE_FIELD_LABELS[opt] || opt}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {errors.fields && (
              <p className="text-xs text-rose-500 font-semibold">{errors.fields}</p>
            )}

            <div className="space-y-3">
              {formData.fields.map((f, idx) => (
                <div
                  key={f.field}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-[180px]">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 font-mono">
                      {idx + 1}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {TEMPLATE_FIELD_LABELS[f.field] || f.field}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        var: {f.field}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full sm:w-auto">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">X (mm)</label>
                      <input
                        type="number"
                        value={f.x}
                        onChange={(e) => handleFieldChange(idx, 'x', e.target.value)}
                        className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Y (mm)</label>
                      <input
                        type="number"
                        value={f.y}
                        onChange={(e) => handleFieldChange(idx, 'y', e.target.value)}
                        className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Size (pt)</label>
                      <input
                        type="number"
                        value={f.fontSize}
                        onChange={(e) => handleFieldChange(idx, 'fontSize', e.target.value)}
                        className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Weight</label>
                      <select
                        value={f.fontWeight}
                        onChange={(e) => handleFieldChange(idx, 'fontWeight', e.target.value)}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="NORMAL">Normal</option>
                        <option value="BOLD">Bold</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveField(idx)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition-colors self-end sm:self-center"
                    title="Remove field"
                    aria-label={`Remove ${f.field}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Photo Placement Configuration */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <Image className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Student Photo Box Position</h2>
                <p className="text-xs text-slate-500">Define photo container dimensions and offsets</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Photo X (mm)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.photo?.x ?? 55}
                  disabled={isLoading}
                  onChange={(e) => handlePhotoChange('x', e.target.value)}
                  className="w-full px-4 py-2.5 font-mono bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Photo Y (mm)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.photo?.y ?? 20}
                  disabled={isLoading}
                  onChange={(e) => handlePhotoChange('y', e.target.value)}
                  className="w-full px-4 py-2.5 font-mono bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Photo Width (mm)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.photo?.width ?? 25}
                  disabled={isLoading}
                  onChange={(e) => handlePhotoChange('width', e.target.value)}
                  className="w-full px-4 py-2.5 font-mono bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Photo Height (mm)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.photo?.height ?? 30}
                  disabled={isLoading}
                  onChange={(e) => handlePhotoChange('height', e.target.value)}
                  className="w-full px-4 py-2.5 font-mono bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          disabled={isLoading}
          onClick={handleCancel}
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
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isEdit ? 'Save Template' : 'Create Template'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default TemplateForm;

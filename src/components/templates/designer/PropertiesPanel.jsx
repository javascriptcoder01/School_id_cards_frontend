import React from 'react';
import { Sliders, Trash2, Eye, EyeOff } from 'lucide-react';
import {
  TEMPLATE_FONT_WEIGHTS,
  TEMPLATE_FIELD_LABELS,
  FIELD_MIN_FONT_SIZE,
  FIELD_MAX_FONT_SIZE,
  PHOTO_BOX_MIN_WIDTH,
  PHOTO_BOX_MIN_HEIGHT,
} from '../../../constants/template.js';
import { normalizeCoordinate } from '../../../utils/templateDesignerValidation.js';

export const PropertiesPanel = ({
  selectedElement,
  formData,
  onUpdatePhoto,
  onUpdateField,
  onRemoveField,
}) => {
  if (!selectedElement) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs text-center space-y-3">
        <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Sliders className="w-5 h-5" />
        </div>
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Properties Inspector</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Click an element on the canvas or card palette to adjust its position and typography.
        </p>
      </div>
    );
  }

  const cardWidth = Number(formData.width) || 86;
  const cardHeight = Number(formData.height) || 54;

  // 1. Photo Properties
  if (selectedElement.type === 'PHOTO') {
    const photo = formData.photo || { x: 55, y: 20, width: 25, height: 30, visible: true };

    const handlePhotoNumChange = (prop, value) => {
      let min = 0;
      let max = prop === 'x' || prop === 'width' ? cardWidth : cardHeight;
      if (prop === 'width') min = PHOTO_BOX_MIN_WIDTH;
      if (prop === 'height') min = PHOTO_BOX_MIN_HEIGHT;

      const normalized = normalizeCoordinate(value, min, max, photo[prop] ?? 0);
      onUpdatePhoto({ ...photo, [prop]: normalized });
    };

    return (
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Photo Box Properties</h3>
            <p className="text-[11px] text-slate-400">Position & bounding dimensions</p>
          </div>
          <button
            type="button"
            onClick={() => onUpdatePhoto({ ...photo, visible: photo.visible === false ? true : false })}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title={photo.visible !== false ? 'Hide Photo' : 'Show Photo'}
            aria-label="Toggle photo visibility"
          >
            {photo.visible !== false ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">X Position (mm)</label>
            <input
              type="number"
              min="0"
              max={cardWidth}
              value={photo.x ?? 0}
              onChange={(e) => handlePhotoNumChange('x', e.target.value)}
              className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Y Position (mm)</label>
            <input
              type="number"
              min="0"
              max={cardHeight}
              value={photo.y ?? 0}
              onChange={(e) => handlePhotoNumChange('y', e.target.value)}
              className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Width (mm)</label>
            <input
              type="number"
              min={PHOTO_BOX_MIN_WIDTH}
              max={cardWidth}
              value={photo.width ?? 25}
              onChange={(e) => handlePhotoNumChange('width', e.target.value)}
              className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Height (mm)</label>
            <input
              type="number"
              min={PHOTO_BOX_MIN_HEIGHT}
              max={cardHeight}
              value={photo.height ?? 30}
              onChange={(e) => handlePhotoNumChange('height', e.target.value)}
              className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>
      </div>
    );
  }

  // 2. Field Properties
  const fieldIndex = formData.fields.findIndex((f) => f.field === selectedElement.id);
  const field = formData.fields[fieldIndex];

  if (!field) {
    return (
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs text-xs text-slate-400">
        Field no longer configured.
      </div>
    );
  }

  const handleFieldNumChange = (prop, value) => {
    let min = 0;
    let max = prop === 'x' ? cardWidth : cardHeight;
    if (prop === 'fontSize') {
      min = FIELD_MIN_FONT_SIZE;
      max = FIELD_MAX_FONT_SIZE;
    }

    const normalized = normalizeCoordinate(value, min, max, field[prop] ?? 0);
    onUpdateField(fieldIndex, prop, normalized);
  };

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            {TEMPLATE_FIELD_LABELS[field.field] || field.field}
          </h3>
          <p className="text-[11px] font-mono text-slate-400">var: {field.field}</p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onUpdateField(fieldIndex, 'visible', field.visible === false ? true : false)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title={field.visible !== false ? 'Hide Field' : 'Show Field'}
            aria-label="Toggle field visibility"
          >
            {field.visible !== false ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
          </button>
          <button
            type="button"
            onClick={() => onRemoveField(fieldIndex)}
            className="p-1.5 rounded-lg border border-slate-200 text-rose-500 hover:bg-rose-50 transition-colors"
            title="Remove from card"
            aria-label={`Remove ${field.field}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Display Label</label>
          <input
            type="text"
            value={field.label ?? ''}
            onChange={(e) => onUpdateField(fieldIndex, 'label', e.target.value)}
            placeholder="e.g. Student Name"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">X Position (mm)</label>
            <input
              type="number"
              min="0"
              max={cardWidth}
              value={field.x ?? 0}
              onChange={(e) => handleFieldNumChange('x', e.target.value)}
              className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Y Position (mm)</label>
            <input
              type="number"
              min="0"
              max={cardHeight}
              value={field.y ?? 0}
              onChange={(e) => handleFieldNumChange('y', e.target.value)}
              className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Font Size (pt)</label>
            <input
              type="number"
              min={FIELD_MIN_FONT_SIZE}
              max={FIELD_MAX_FONT_SIZE}
              value={field.fontSize ?? 11}
              onChange={(e) => handleFieldNumChange('fontSize', e.target.value)}
              className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Weight</label>
            <select
              value={field.fontWeight || TEMPLATE_FONT_WEIGHTS.NORMAL}
              onChange={(e) => onUpdateField(fieldIndex, 'fontWeight', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value={TEMPLATE_FONT_WEIGHTS.NORMAL}>Normal</option>
              <option value={TEMPLATE_FONT_WEIGHTS.BOLD}>Bold</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;


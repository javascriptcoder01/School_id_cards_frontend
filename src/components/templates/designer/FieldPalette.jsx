import React from 'react';
import { Layers, Image, CheckCircle, PlusCircle } from 'lucide-react';
import {
  TEMPLATE_FIELDS,
  TEMPLATE_FIELD_LABELS,
  TEMPLATE_FIELD_VALUES,
} from '../../../constants/template.js';

export const FieldPalette = ({
  fields = [],
  photo = null,
  selectedElement = null,
  onSelectElement,
  onAddField,
}) => {
  const placedFieldNames = new Set(fields.map((f) => f.field));

  const handleFieldClick = (fieldName) => {
    if (placedFieldNames.has(fieldName)) {
      onSelectElement({ type: 'FIELD', id: fieldName });
    } else {
      onAddField(fieldName);
      onSelectElement({ type: 'FIELD', id: fieldName });
    }
  };

  const handlePhotoClick = () => {
    onSelectElement({ type: 'PHOTO', id: 'photo' });
  };

  const isPhotoSelected = selectedElement?.type === 'PHOTO';

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <Layers className="w-4 h-4 text-indigo-600" />
        <h3 className="text-sm font-bold text-slate-800">Card Elements</h3>
      </div>

      <div className="space-y-1.5">
        {/* Student Photo Item */}
        <button
          type="button"
          onClick={handlePhotoClick}
          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-left transition-all ${isPhotoSelected
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
              : 'hover:bg-slate-50 text-slate-700 border border-transparent'
            }`}
        >
          <div className="flex items-center gap-2">
            <Image className="w-3.5 h-3.5 text-slate-400" />
            <span>Student Photo Box</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
            Placed
          </span>
        </button>

        <div className="pt-2 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Dynamic Fields
        </div>

        {/* Dynamic Field Items */}
        {TEMPLATE_FIELD_VALUES.map((fieldName) => {
          const isPlaced = placedFieldNames.has(fieldName);
          const isSelected =
            selectedElement?.type === 'FIELD' && selectedElement?.id === fieldName;

          return (
            <button
              key={fieldName}
              type="button"
              onClick={() => handleFieldClick(fieldName)}
              className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium text-left transition-all ${isSelected
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs font-bold'
                  : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                }`}
            >
              <span className="truncate">{TEMPLATE_FIELD_LABELS[fieldName] || fieldName}</span>
              {isPlaced ? (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : (
                <PlusCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FieldPalette;


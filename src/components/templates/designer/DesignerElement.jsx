import React, { memo } from 'react';
import { SAMPLE_STUDENT_PREVIEW } from '../../../constants/templatePreviewData.js';
import { TEMPLATE_FONT_WEIGHTS } from '../../../constants/template.js';

export const DesignerElement = memo(({
  field,
  cardWidth = 86,
  cardHeight = 54,
  isSelected = false,
  isDesignMode = true,
  onSelect,
}) => {
  if (!field || field.visible === false) return null;

  const leftPercent = (field.x / cardWidth) * 100;
  const topPercent = (field.y / cardHeight) * 100;

  const previewValue = SAMPLE_STUDENT_PREVIEW[field.field] || 'Sample Data';
  const displayLabel = field.label ? `${field.label}: ` : '';

  const isBold = field.fontWeight === TEMPLATE_FONT_WEIGHTS.BOLD;

  return (
    <div
      onClick={(e) => {
        if (isDesignMode) {
          e.stopPropagation();
          onSelect?.();
        }
      }}
      style={{
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        fontSize: `${field.fontSize || 11}px`,
      }}
      className={`absolute whitespace-nowrap select-none transition-all py-0.5 px-1 rounded-sm ${
        isDesignMode ? 'cursor-pointer hover:bg-indigo-50/50' : ''
      } ${
        isSelected && isDesignMode
          ? 'ring-2 ring-indigo-600 ring-offset-1 bg-indigo-50/80 text-indigo-950 font-bold z-20'
          : isDesignMode
            ? 'border border-dashed border-slate-300 text-slate-800 z-10'
            : 'text-slate-900'
      } ${isBold ? 'font-bold' : 'font-normal'}`}
      title={`Field: ${field.field}`}
    >
      <span className="opacity-75 text-[0.85em]">{displayLabel}</span>
      <span>{previewValue}</span>
    </div>
  );
});

DesignerElement.displayName = 'DesignerElement';

export default DesignerElement;

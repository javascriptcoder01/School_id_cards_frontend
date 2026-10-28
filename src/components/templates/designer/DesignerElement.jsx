import React, { memo } from 'react';
import { SAMPLE_STUDENT_PREVIEW } from '../../../constants/templatePreviewData.js';
import {
  TEMPLATE_FONT_WEIGHTS,
  TEMPLATE_FIELDS,
  TEMPLATE_TEXT_ALIGNS,
} from '../../../constants/template.js';
import { pct, fontSizeToCqw, toNumber } from '../../../utils/templateLayout.js';

const ALIGN_CSS = {
  [TEMPLATE_TEXT_ALIGNS.LEFT]: 'left',
  [TEMPLATE_TEXT_ALIGNS.CENTER]: 'center',
  [TEMPLATE_TEXT_ALIGNS.RIGHT]: 'right',
};

/** One text field on the card (student name, roll no, ...) */
export const DesignerElement = memo(
  ({ field, unit, cardWidth = 86, cardHeight = 54, isSelected = false, isDesignMode = true, onSelect }) => {
    if (!field || field.visible === false) return null;

    const previewValue = SAMPLE_STUDENT_PREVIEW?.[field.field] || 'Sample Data';
    const displayLabel = field.label ? `${field.label}: ` : '';
    const isBold = field.fontWeight === TEMPLATE_FONT_WEIGHTS.BOLD;
    const hasWidth = toNumber(field.width) > 0;
    const maxLines = Math.max(1, toNumber(field.maxLines, 1));

    // Legacy signature field (purane templates)
    const isSignature = field.field === TEMPLATE_FIELDS.COLLEGE_ADMIN_SIGNATURE;
    const isImageSig = isSignature && /^(data:image\/|https?:\/\/)/.test(previewValue);

    const style = {
      left: pct(field.x, cardWidth),
      top: pct(field.y, cardHeight),
      width: hasWidth ? pct(field.width, cardWidth) : undefined,
      fontSize: `${fontSizeToCqw(field.fontSize, unit, cardWidth)}cqw`,
      lineHeight: 1.2,
      color: field.color || '#000000',
      fontFamily: field.fontFamily || 'Arial',
      fontWeight: isBold ? 700 : 400,
      textAlign: ALIGN_CSS[field.textAlign] || 'left',
      zIndex: isSelected ? 60 : 50,
      ...(hasWidth
        ? {
          whiteSpace: 'normal',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: maxLines,
          WebkitBoxOrient: 'vertical',
          wordBreak: 'break-word',
        }
        : { whiteSpace: 'nowrap' }),
    };

    return (
      <div
        onClick={(e) => {
          if (isDesignMode) {
            e.stopPropagation();
            onSelect?.();
          }
        }}
        style={style}
        className={`absolute select-none ${isDesignMode ? 'cursor-pointer hover:bg-indigo-50/60' : ''
          } ${isSelected && isDesignMode
            ? 'outline-2 outline-indigo-600 outline-offset-1 bg-indigo-50/70'
            : isDesignMode
              ? 'outline-1 outline-dashed outline-slate-400/70'
              : ''
          }`}
        title={isDesignMode ? `Field: ${field.field}` : undefined}
      >
        {isSignature ? (
          isImageSig ? (
            <img src={previewValue} alt="" className="max-h-[2em] object-contain pointer-events-none" />
          ) : (
            <span className="font-serif italic">Signature</span>
          )
        ) : (
          <>
            {displayLabel && <span style={{ opacity: 0.75 }}>{displayLabel}</span>}
            <span>{previewValue}</span>
          </>
        )}
      </div>
    );
  }
);

DesignerElement.displayName = 'DesignerElement';

export default DesignerElement;
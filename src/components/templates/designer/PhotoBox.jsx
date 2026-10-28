import React, { memo } from 'react';
import { User } from 'lucide-react';
import { TEMPLATE_PHOTO_SHAPES } from '../../../constants/template.js';
import { pct, unitsToCqw, toNumber } from '../../../utils/templateLayout.js';

/** Student photo placeholder (real photo Student model se aati hai) */
export const PhotoBox = memo(
  ({ photo, cardWidth = 86, cardHeight = 54, isSelected = false, isDesignMode = true, onSelect }) => {
    if (!photo || photo.visible === false) return null;

    let borderRadius = '0';
    if (photo.shape === TEMPLATE_PHOTO_SHAPES.CIRCLE) borderRadius = '50%';
    if (photo.shape === TEMPLATE_PHOTO_SHAPES.ROUNDED) {
      borderRadius = `${unitsToCqw(photo.borderRadius, cardWidth)}cqw`;
    }
    const borderWidth = toNumber(photo.borderWidth);

    return (
      <div
        onClick={(e) => {
          if (isDesignMode) {
            e.stopPropagation();
            onSelect?.();
          }
        }}
        style={{
          left: pct(photo.x, cardWidth),
          top: pct(photo.y, cardHeight),
          width: pct(photo.width, cardWidth),
          height: pct(photo.height, cardHeight),
          borderRadius,
          border: borderWidth > 0 ? `${unitsToCqw(borderWidth, cardWidth)}cqw solid ${photo.borderColor || '#ffffff'}` : undefined,
          zIndex: isSelected ? 45 : 15,
        }}
        className={`absolute select-none overflow-hidden ${isDesignMode ? 'cursor-pointer' : ''} ${isSelected && isDesignMode ? 'outline-2 outline-indigo-600 outline-offset-1' : ''
          }`}
        title={isDesignMode ? 'Student photo' : undefined}
      >
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-100 to-slate-300 text-slate-500">
          <User className="w-1/2 h-1/2 text-slate-400" aria-hidden="true" />
          <span className="font-bold uppercase tracking-wider text-slate-500" style={{ fontSize: '1.6cqw' }}>
            Photo
          </span>
        </div>
      </div>
    );
  }
);

PhotoBox.displayName = 'PhotoBox';

export default PhotoBox;
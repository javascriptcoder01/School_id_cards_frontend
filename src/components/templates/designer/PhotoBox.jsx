import React, { memo } from 'react';
import { User } from 'lucide-react';

export const PhotoBox = memo(({
  photo,
  cardWidth = 86,
  cardHeight = 54,
  isSelected = false,
  isDesignMode = true,
  onSelect,
}) => {
  if (!photo || photo.visible === false) return null;

  const leftPercent = (photo.x / cardWidth) * 100;
  const topPercent = (photo.y / cardHeight) * 100;
  const widthPercent = (photo.width / cardWidth) * 100;
  const heightPercent = (photo.height / cardHeight) * 100;

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
        width: `${widthPercent}%`,
        height: `${heightPercent}%`,
      }}
      className={`absolute select-none transition-all rounded-md overflow-hidden bg-slate-200 border flex flex-col items-center justify-center text-slate-400 ${
        isDesignMode ? 'cursor-pointer' : ''
      } ${
        isSelected && isDesignMode
          ? 'ring-2 ring-indigo-600 ring-offset-1 border-indigo-500 shadow-md z-20'
          : 'border-slate-300 z-10'
      }`}
      title="Student Photo"
    >
      <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-b from-slate-100 to-slate-200 text-slate-500 p-1">
        <User className="w-1/2 h-1/2 max-h-8 text-slate-400" />
        <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
          Photo
        </span>
      </div>
    </div>
  );
});

PhotoBox.displayName = 'PhotoBox';

export default PhotoBox;

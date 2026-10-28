import React from 'react';
import CardSurface from './CardSurface.jsx';
import { TEMPLATE_DESIGNER_MODES, DESIGNER_BASE_WIDTH_PX } from '../../../constants/template.js';

export const TemplateCanvas = ({
  template,
  mode = TEMPLATE_DESIGNER_MODES.DESIGN,
  zoom = 1.0,
  selectedElement = null,
  onSelectElement,
}) => {
  if (!template) return null;
  const isDesignMode = mode === TEMPLATE_DESIGNER_MODES.DESIGN;

  return (
    <div
      onClick={() => isDesignMode && onSelectElement?.(null)}
      className="w-full flex items-center justify-center p-4 sm:p-8 bg-slate-100 rounded-3xl border border-slate-200/80 shadow-inner overflow-auto min-h-[360px]"
    >
      <CardSurface
        template={template}
        widthPx={DESIGNER_BASE_WIDTH_PX * zoom}
        isDesignMode={isDesignMode}
        selectedElement={selectedElement}
        onSelectElement={onSelectElement}
        className="rounded-xl shadow-2xl ring-1 ring-slate-300"
      />
    </div>
  );
};

export default TemplateCanvas;
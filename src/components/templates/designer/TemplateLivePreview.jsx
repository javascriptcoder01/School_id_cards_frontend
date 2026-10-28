import React from 'react';
import CardSurface from './CardSurface.jsx';

/** Read-only card preview (template list / detail pages) */
export const TemplateLivePreview = ({ template, scale = 1.0 }) => {
  if (!template) return null;
  return (
    <CardSurface
      template={template}
      widthPx={344 * scale}
      isDesignMode={false}
      className="rounded-2xl shadow-xl ring-1 ring-slate-200"
    />
  );
};

export default TemplateLivePreview;
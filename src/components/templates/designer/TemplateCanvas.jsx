import React from 'react';
import { School } from 'lucide-react';
import PhotoBox from './PhotoBox.jsx';
import DesignerElement from './DesignerElement.jsx';
import { TEMPLATE_DESIGNER_MODES } from '../../../constants/template.js';

const isSafeImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();
  return (
    (trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('/') ||
      trimmed.startsWith('data:image/')) &&
    !trimmed.includes('<script') &&
    !trimmed.startsWith('javascript:')
  );
};

export const TemplateCanvas = ({
  template,
  mode = TEMPLATE_DESIGNER_MODES.DESIGN,
  zoom = 1.0,
  selectedElement = null,
  onSelectElement,
}) => {
  if (!template) return null;

  const width = Number(template.width) || 86;
  const height = Number(template.height) || 54;
  const aspectRatio = `${width} / ${height}`;

  const primaryColor = template.primaryColor || '#4F46E5';
  const secondaryColor = template.secondaryColor || '#9333EA';

  const defaultBackground = `linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)`;
  const headerGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;

  const isDesignMode = mode === TEMPLATE_DESIGNER_MODES.DESIGN;
  const hasSafeBg = isSafeImageUrl(template.background);
  const hasSafeLogo = isSafeImageUrl(template.logo);

  return (
    <div
      onClick={() => isDesignMode && onSelectElement?.(null)}
      className="w-full flex items-center justify-center p-4 sm:p-8 bg-slate-100 rounded-3xl border border-slate-200/80 shadow-inner overflow-auto min-h-[360px]"
    >
      <div
        style={{
          width: `${width * 4.5 * zoom}px`,
          maxWidth: '100%',
          aspectRatio,
        }}
        className="relative rounded-2xl shadow-2xl overflow-hidden border border-slate-300 bg-white transition-transform origin-center"
      >
        {/* Background Layer */}
        {hasSafeBg ? (
          <img
            src={template.background}
            alt="Card Background"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: defaultBackground }}
          />
        )}

        {/* Decorative Card Header Bar */}
        <div
          className="h-3 w-full absolute top-0 left-0 pointer-events-none"
          style={{ background: headerGradient }}
        />

        {/* College Logo / Header Area */}
        {hasSafeLogo ? (
          <div className="absolute top-4 left-4 z-10 pointer-events-none">
            <img
              src={template.logo}
              alt="Logo"
              className="h-8 max-w-[120px] object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 opacity-40 pointer-events-none">
            <School className="w-5 h-5 text-slate-700" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-700">
              Institution ID
            </span>
          </div>
        )}

        {/* Photo Box */}
        {template.photo && (
          <PhotoBox
            photo={template.photo}
            cardWidth={width}
            cardHeight={height}
            isSelected={selectedElement?.type === 'PHOTO'}
            isDesignMode={isDesignMode}
            onSelect={() => onSelectElement?.({ type: 'PHOTO', id: 'photo' })}
          />
        )}

        {/* Dynamic Fields */}
        {Array.isArray(template.fields) &&
          template.fields.map((field) => (
            <DesignerElement
              key={field.field}
              field={field}
              cardWidth={width}
              cardHeight={height}
              isSelected={
                selectedElement?.type === 'FIELD' &&
                selectedElement?.id === field.field
              }
              isDesignMode={isDesignMode}
              onSelect={() =>
                onSelectElement?.({ type: 'FIELD', id: field.field })
              }
            />
          ))}

        {/* Decorative Card Footer Accent */}
        <div
          className="h-1.5 w-full absolute bottom-0 left-0 pointer-events-none"
          style={{ background: headerGradient }}
        />
      </div>
    </div>
  );
};

export default TemplateCanvas;


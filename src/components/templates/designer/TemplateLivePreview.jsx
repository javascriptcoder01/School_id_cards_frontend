import React from 'react';
import { School } from 'lucide-react';
import PhotoBox from './PhotoBox.jsx';
import DesignerElement from './DesignerElement.jsx';

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

export const TemplateLivePreview = ({
  template,
  scale = 1.0,
}) => {
  if (!template) return null;

  const width = Number(template.width) || 86;
  const height = Number(template.height) || 54;
  const aspectRatio = `${width} / ${height}`;

  const primaryColor = template.primaryColor || '#4F46E5';
  const secondaryColor = template.secondaryColor || '#9333EA';

  const defaultBackground = `linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)`;
  const headerGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;

  const hasSafeBg = isSafeImageUrl(template.background);
  const hasSafeLogo = isSafeImageUrl(template.logo);

  return (
    <div
      style={{
        width: `${width * 4 * scale}px`,
        maxWidth: '100%',
        aspectRatio,
      }}
      className="relative rounded-2xl shadow-xl overflow-hidden border border-slate-200 select-none bg-white transition-all"
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
        className="h-3 w-full absolute top-0 left-0"
        style={{ background: headerGradient }}
      />

      {/* College Logo / Header Area */}
      {hasSafeLogo ? (
        <div className="absolute top-4 left-4 z-10">
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
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 opacity-40">
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
          isSelected={false}
          isDesignMode={false}
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
            isSelected={false}
            isDesignMode={false}
          />
        ))}

      {/* Decorative Card Footer Accent */}
      <div
        className="h-1.5 w-full absolute bottom-0 left-0"
        style={{ background: headerGradient }}
      />
    </div>
  );
};

export default TemplateLivePreview;


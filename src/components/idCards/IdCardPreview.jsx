// IdCardPreview.jsx
// Ek card renderData (POST /id-cards/preview ya batch snapshot) se HTML/CSS mein — backend PDF jaisa.
// Pure presentational: Redux nahi.
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { AlertTriangle } from 'lucide-react';

// Purane templates (unit save nahi hua, default PX) ka size mm mein tha (80 x 50).
// Itna chhota PX card asli nahi hota → MM (backend utils/idCardPdfRenderer.js jaisa rule)
const LEGACY_MM_MAX_SIZE = 150;
const MM_PER_PT = 25.4 / 72;

const FIT_CLASS = {
  COVER: 'object-cover',
  CONTAIN: 'object-contain',
  STRETCH: 'object-fill',
};

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const isImageUrl = (value) => typeof value === 'string' && /^(https?:\/\/|data:image\/)/i.test(value.trim());

const resolveUnit = (template) => {
  const declared = template?.unit === 'MM' ? 'MM' : 'PX';
  const legacy =
    declared === 'PX' &&
    toNumber(template?.width) <= LEGACY_MM_MAX_SIZE &&
    toNumber(template?.height) <= LEGACY_MM_MAX_SIZE;
  return legacy ? 'MM' : declared;
};

// Photo placeholder (photo na ho)
const PhotoPlaceholder = () => (
  <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="w-full h-full bg-slate-100">
    <circle cx="50" cy="40" r="17" fill="#94A3B8" />
    <ellipse cx="50" cy="92" rx="34" ry="26" fill="#94A3B8" />
  </svg>
);

/**
 * @param {object} props
 * @param {object} props.renderData - Backend renderData
 * @param {number} [props.width=320] - Card ki chaudai (px); height aspect ratio se
 * @param {boolean} [props.showWarnings=true]
 * @param {string} [props.className]
 */
export const IdCardPreview = ({ renderData, width = 320, showWarnings = true, className = '' }) => {
  const template = renderData?.template;
  const cardW = toNumber(template?.width);
  const cardH = toNumber(template?.height);

  if (!template || cardW <= 0 || cardH <= 0) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400 ${className}`}
        style={{ width, height: Math.round(width * 0.63) }}
      >
        No preview
      </div>
    );
  }

  const unit = resolveUnit(template);
  const scale = width / cardW; // px per template unit
  const height = cardH * scale;
  const px = (value, fallback = 0) => toNumber(value, fallback) * scale;
  // MM: fontSize pt mein; PX: card units mein (backend PDF jaisa)
  const fontPx = (size) => (unit === 'MM' ? toNumber(size, 12) * MM_PER_PT * scale : toNumber(size, 12) * scale);

  const primary = template.primaryColor || '#4F46E5';
  const secondary = template.secondaryColor || '#9333EA';
  const accent = `linear-gradient(90deg, ${primary} 0%, ${secondary} 100%)`;

  const photo = renderData.photo;
  const qr = renderData.qrCode;
  const qrValue = renderData.verification?.verificationUrl || qr?.data || '';
  const layers = [...(renderData.imageLayers || [])].sort((a, b) => toNumber(a.zIndex, 10) - toNumber(b.zIndex, 10));
  const hasLogoLayer = layers.some((layer) => layer.type === 'LOGO');
  const warnings = Array.isArray(renderData.warnings) ? renderData.warnings : [];

  const photoRadius =
    photo?.shape === 'CIRCLE' ? '50%' : photo?.shape === 'ROUNDED' ? `${px(photo.borderRadius)}px` : 0;

  return (
    <div className={className} style={{ width }}>
      <div
        className="relative overflow-hidden bg-white shadow-md ring-1 ring-slate-200"
        style={{ width, height }}
        aria-label="ID card preview"
      >
        {/* 1. Background (letterhead) ya white + theme patti */}
        {isImageUrl(template.background) ? (
          <img
            src={template.background}
            alt=""
            className={`absolute inset-0 w-full h-full ${FIT_CLASS[template.backgroundFit] || 'object-cover'}`}
          />
        ) : (
          <>
            <div className="absolute top-0 left-0 w-full" style={{ height: '3%', background: accent }} />
            <div className="absolute bottom-0 left-0 w-full" style={{ height: '2%', background: accent }} />
          </>
        )}

        {/* 2. Photo */}
        {photo && photo.visible !== false && (
          <div
            className="absolute overflow-hidden"
            style={{
              left: px(photo.x),
              top: px(photo.y),
              width: px(photo.width, 25),
              height: px(photo.height, 30),
              borderRadius: photoRadius,
              border: toNumber(photo.borderWidth) > 0 ? `${px(photo.borderWidth)}px solid ${photo.borderColor || '#000'}` : 'none',
            }}
          >
            {isImageUrl(photo.source) ? (
              <img
                src={photo.source}
                alt="Student"
                className={`w-full h-full ${photo.objectFit === 'CONTAIN' ? 'object-contain' : 'object-cover'}`}
              />
            ) : (
              <PhotoPlaceholder />
            )}
          </div>
        )}

        {/* 3. Text fields (displayValue, kabhi raw ISO date nahi) */}
        {(renderData.fields || []).map((field, index) => {
          if (!field || field.visible === false) return null;
          const left = px(field.x);
          const top = px(field.y);
          const size = fontPx(field.fontSize);

          if (field.kind === 'IMAGE') {
            return isImageUrl(field.value) ? (
              <img
                key={`${field.field}-${index}`}
                src={field.value}
                alt=""
                className="absolute object-contain object-left-top"
                style={{ left, top, width: size * 4, height: size * 1.5 }}
              />
            ) : null;
          }

          const value = typeof field.displayValue === 'string' ? field.displayValue.trim() : '';
          if (!value) return null;
          const maxLines = Math.max(1, Math.round(toNumber(field.maxLines, 1)));

          return (
            <div
              key={`${field.field}-${index}`}
              className="absolute overflow-hidden break-words"
              style={{
                left,
                top,
                width: field.width ? px(field.width) : Math.max(width - left, 1),
                fontSize: size,
                lineHeight: 1.2,
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: String(field.fontWeight).toUpperCase() === 'BOLD' ? 700 : 400,
                color: field.color || '#000000',
                textAlign: (field.textAlign || 'LEFT').toLowerCase(),
                display: '-webkit-box',
                WebkitLineClamp: maxLines,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {field.label ? `${field.label}: ${value}` : value}
            </div>
          );
        })}

        {/* 4. QR */}
        {qr && qr.visible !== false && px(qr.width) > 0 && px(qr.height) > 0 && (
          <div
            className="absolute flex items-center justify-center"
            style={{ left: px(qr.x), top: px(qr.y), width: px(qr.width), height: px(qr.height) }}
          >
            {qrValue && !qrValue.startsWith('data:') ? (
              <QRCodeSVG
                value={qrValue}
                size={Math.min(px(qr.width), px(qr.height))}
                marginSize={0}
                level="M"
              />
            ) : (
              <div className="w-full h-full border border-dashed border-slate-400 flex items-center justify-center text-[10px] text-slate-500">
                QR
              </div>
            )}
          </div>
        )}

        {/* 5. Purana logo (sirf jab LOGO layer na ho) */}
        {!hasLogoLayer && isImageUrl(template.logo) && (
          <img
            src={template.logo}
            alt=""
            className="absolute object-contain object-left-top"
            style={{ left: width * 0.04, top: height * 0.04, width: width * 0.35, height: height * 0.14 }}
          />
        )}

        {/* 6. Image layers (logo / signature / stamp) zIndex order */}
        {layers.map((layer, index) =>
          layer && layer.visible !== false && isImageUrl(layer.source) ? (
            <img
              key={layer.id || `${layer.type}-${index}`}
              src={layer.source}
              alt=""
              className="absolute object-contain"
              style={{
                left: px(layer.x),
                top: px(layer.y),
                width: px(layer.width),
                height: px(layer.height),
                opacity: Math.min(Math.max(toNumber(layer.opacity, 1), 0), 1),
                transform: `rotate(${toNumber(layer.rotation)}deg)`,
                zIndex: toNumber(layer.zIndex, 10),
              }}
            />
          ) : null
        )}
      </div>

      {showWarnings && warnings.length > 0 && (
        <ul className="mt-2 space-y-1 rounded-lg border border-amber-200 bg-amber-50 p-2.5">
          {warnings.map((warning, index) => (
            <li key={`${warning}-${index}`} className="flex items-start gap-1.5 text-xs text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 mt-px shrink-0" />
              <span>{warning}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default IdCardPreview;

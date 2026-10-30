// IdCardSide.jsx
// Card ka EK side (renderData.sides.front / back) inline SVG mein — backend PDF jaisa hi.
// viewBox = template units (backend ke numbers seedhe), theme / decoration ka koi hisaab frontend mein nahi.
// Draw order PDF jaisa: background → decorations → photo → fields → QR → image layers.
// Pure presentational: Redux nahi.
import React, { useId } from 'react';
import { QRCodeSVG } from 'qrcode.react';

// Purane templates (unit save nahi hua, default PX) ka size mm mein tha → MM (backend jaisa rule)
const LEGACY_MM_MAX_SIZE = 150;
const MM_PER_PT = 25.4 / 72;
// Text foreignObject andar se ~1000px chauda render hota hai, phir scale — browser ki minimum font size se bachne ke liye
const TEXT_RENDER_WIDTH = 1000;
// PDF (Helvetica) ki line height ≈ 1.156 × font size; template ka 1.2 = PDF ka default (lineGap 0)
const PDF_LINE_HEIGHT = 1.156;
const DEFAULT_LINE_HEIGHT = 1.2;

const ASPECT = {
  COVER: 'xMidYMid slice',
  CONTAIN: 'xMidYMid meet',
  STRETCH: 'none',
};

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const isImageUrl = (value) => typeof value === 'string' && /^(https?:\/\/|data:image\/)/i.test(value.trim());

const colorOr = (value, fallback) => (typeof value === 'string' && value.trim() ? value.trim() : fallback);

const resolveUnit = (unit, width, height) => {
  const declared = unit === 'MM' ? 'MM' : 'PX';
  const legacy = declared === 'PX' && width <= LEGACY_MM_MAX_SIZE && height <= LEGACY_MM_MAX_SIZE;
  return legacy ? 'MM' : declared;
};

// SVG id: useId ke special characters url(#…) mein nahi chalte
const safeId = (id) => id.replace(/[^a-zA-Z0-9_-]/g, '');

/* ---------------- Background + decorations ---------------- */

const SideBackground = ({ background, W, H, uid }) => {
  const color = colorOr(background?.color, '#FFFFFF');
  const g = background?.gradient;
  const image = background?.image;

  return (
    <g>
      {g && background.type === 'GRADIENT' && (
        <defs>
          <linearGradient id={`${uid}-bg`} x1={toNumber(g.x1)} y1={toNumber(g.y1)} x2={toNumber(g.x2, 1)} y2={toNumber(g.y2, 1)}>
            {(g.stops || []).map((stop, i) => (
              <stop key={i} offset={toNumber(stop.offset)} stopColor={stop.color} />
            ))}
          </linearGradient>
        </defs>
      )}
      <rect x={0} y={0} width={W} height={H} fill={g && background.type === 'GRADIENT' ? `url(#${uid}-bg)` : color} />
      {background?.type === 'IMAGE' && isImageUrl(image?.url) && (
        <image
          href={image.url}
          x={0}
          y={0}
          width={W}
          height={H}
          preserveAspectRatio={ASPECT[image.fit] || ASPECT.COVER}
        />
      )}
    </g>
  );
};

const Decorations = ({ shapes, uid }) => (
  <g>
    {(shapes || []).map((shape, i) => {
      const opacity = Math.min(Math.max(toNumber(shape.opacity, 1), 0), 1);
      const gradient = shape.fill && typeof shape.fill === 'object' ? shape.fill.gradient : null;
      const gradientId = `${uid}-d${i}`;
      const fillProps = gradient
        ? { fill: `url(#${gradientId})` }
        : { fill: colorOr(shape.fill, '#000000'), fillOpacity: opacity };

      let element = null;
      if (shape.kind === 'rect') {
        element = <rect x={shape.x} y={shape.y} width={shape.width} height={shape.height} {...fillProps} />;
      } else if (shape.kind === 'circle') {
        element = <circle cx={shape.cx} cy={shape.cy} r={shape.r} {...fillProps} />;
      } else if (shape.kind === 'polygon' && Array.isArray(shape.points)) {
        element = <polygon points={shape.points.map(([x, y]) => `${x},${y}`).join(' ')} {...fillProps} />;
      } else if (shape.kind === 'path' && shape.d) {
        element = <path d={shape.d} {...fillProps} />;
      }
      if (!element) return null;

      return (
        <g key={i}>
          {gradient && (
            <defs>
              <linearGradient
                id={gradientId}
                gradientUnits="userSpaceOnUse"
                x1={gradient.x1}
                y1={gradient.y1}
                x2={gradient.x2}
                y2={gradient.y2}
              >
                {(gradient.stops || []).map((stop, j) => (
                  <stop key={j} offset={toNumber(stop.offset)} stopColor={stop.color} stopOpacity={opacity} />
                ))}
              </linearGradient>
            </defs>
          )}
          {element}
        </g>
      );
    })}
  </g>
);

/* ---------------- Photo ---------------- */

const photoShape = (photo, x, y, w, h, extra = {}) => {
  if (photo.shape === 'CIRCLE') return <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} {...extra} />;
  const r = photo.shape === 'ROUNDED' ? Math.min(toNumber(photo.borderRadius), w / 2, h / 2) : 0;
  return <rect x={x} y={y} width={w} height={h} rx={r} ry={r} {...extra} />;
};

const Photo = ({ photo, uid }) => {
  if (!photo || photo.visible === false) return null;
  const x = toNumber(photo.x);
  const y = toNumber(photo.y);
  const w = toNumber(photo.width, 25);
  const h = toNumber(photo.height, 30);
  const head = Math.min(w, h) * 0.22;
  const borderWidth = toNumber(photo.borderWidth);

  return (
    <g>
      <defs>
        <clipPath id={`${uid}-photo`}>{photoShape(photo, x, y, w, h)}</clipPath>
      </defs>
      <g clipPath={`url(#${uid}-photo)`}>
        {isImageUrl(photo.source) ? (
          <image
            href={photo.source}
            x={x}
            y={y}
            width={w}
            height={h}
            preserveAspectRatio={photo.objectFit === 'CONTAIN' ? ASPECT.CONTAIN : ASPECT.COVER}
          />
        ) : (
          // PDF jaisa placeholder
          <g aria-label="No photo">
            <rect x={x} y={y} width={w} height={h} fill="#F1F5F9" />
            <circle cx={x + w / 2} cy={y + h / 2 - head * 0.3} r={head} fill="#94A3B8" />
            <ellipse cx={x + w / 2} cy={y + h / 2 + head * 1.9} rx={Math.min(w, h) * 0.38} ry={head * 1.2} fill="#94A3B8" />
          </g>
        )}
      </g>
      {borderWidth > 0 &&
        photoShape(photo, x, y, w, h, {
          fill: 'none',
          stroke: colorOr(photo.borderColor, '#000000'),
          strokeWidth: borderWidth,
        })}
    </g>
  );
};

/* ---------------- Text fields ---------------- */

const Field = ({ field, unit, W, S }) => {
  if (!field || field.visible === false) return null;
  const x = toNumber(field.x);
  const y = toNumber(field.y);
  // MM template: fontSize pt mein; PX: card units mein (backend PDF jaisa)
  const fontUnits = unit === 'MM' ? toNumber(field.fontSize, 12) * MM_PER_PT : toNumber(field.fontSize, 12);

  // Legacy collegeAdminSignature field → image (PDF: fontSize × 4 / × 1.5)
  if (field.kind === 'IMAGE') {
    return isImageUrl(field.value) ? (
      <image href={field.value} x={x} y={y} width={fontUnits * 4} height={fontUnits * 1.5} preserveAspectRatio={ASPECT.CONTAIN} />
    ) : null;
  }

  const value = typeof field.displayValue === 'string' ? field.displayValue.trim() : '';
  if (!value) return null;

  const maxLines = Math.max(1, Math.round(toNumber(field.maxLines, 1)));
  const width = field.width ? toNumber(field.width) : Math.max(W - x, 1);
  const lineHeight = PDF_LINE_HEIGHT + (toNumber(field.lineHeight, DEFAULT_LINE_HEIGHT) - DEFAULT_LINE_HEIGHT);
  const letterSpacing = unit === 'MM' ? toNumber(field.letterSpacing) * MM_PER_PT : toNumber(field.letterSpacing);
  const height = fontUnits * lineHeight * maxLines + fontUnits * 0.2;
  const color = colorOr(field.color, '#000000');

  return (
    <foreignObject x={x * S} y={y * S} width={width * S} height={height * S}>
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        style={{
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontSize: fontUnits * S,
          fontWeight: String(field.fontWeight).toUpperCase() === 'BOLD' ? 700 : 400,
          fontStyle: String(field.fontStyle).toUpperCase() === 'ITALIC' ? 'italic' : 'normal',
          letterSpacing: letterSpacing * S,
          lineHeight,
          color,
          textAlign: ['CENTER', 'RIGHT'].includes(field.textAlign) ? field.textAlign.toLowerCase() : 'left',
          display: '-webkit-box',
          WebkitLineClamp: maxLines,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          overflowWrap: 'anywhere',
          margin: 0,
        }}
      >
        {field.label && <span style={{ color: colorOr(field.labelColor, color) }}>{field.label}: </span>}
        {value}
      </div>
    </foreignObject>
  );
};

/* ---------------- QR ---------------- */

const QrCode = ({ qr, verification }) => {
  if (!qr || qr.visible === false) return null;
  const x = toNumber(qr.x);
  const y = toNumber(qr.y);
  const w = toNumber(qr.width);
  const h = toNumber(qr.height);
  if (w <= 0 || h <= 0) return null;

  // Student QR = verification URL; school details / contact card / custom = qr.data (PDF jaisa)
  const isVerification = !qr.contentType || qr.contentType === 'STUDENT_VERIFICATION';
  const data = (isVerification && verification?.verificationUrl) || qr.data;
  const fg = colorOr(qr.foregroundColor, '#000000');
  const bg = colorOr(qr.backgroundColor, '#FFFFFF');
  const padding = Math.max(0, toNumber(qr.padding));
  const inner = Math.min(padding, w / 2 - 0.5, h / 2 - 0.5);
  const size = Math.max(Math.min(w - inner * 2, h - inner * 2), 0);
  const qx = x + (w - size) / 2;
  const qy = y + (h - size) / 2;

  const hasCode = typeof data === 'string' && data && !data.startsWith('data:');
  if (!hasCode && !isImageUrl(qr.source)) return null;

  return (
    <g>
      {(padding > 0 || bg.toUpperCase() !== '#FFFFFF') && <rect x={x} y={y} width={w} height={h} fill={bg} />}
      {hasCode ? (
        <QRCodeSVG value={data} size={size} x={qx} y={qy} fgColor={fg} bgColor={bg} level="M" marginSize={0} />
      ) : (
        <image href={qr.source} x={qx} y={qy} width={size} height={size} preserveAspectRatio={ASPECT.CONTAIN} />
      )}
    </g>
  );
};

/* ---------------- Image layers ---------------- */

const ImageLayers = ({ layers, template, includeLegacyLogo, W, H }) => {
  const sorted = [...(layers || [])].sort((a, b) => toNumber(a.zIndex, 10) - toNumber(b.zIndex, 10));
  const hasLogoLayer = sorted.some((layer) => layer.type === 'LOGO');

  return (
    <g>
      {/* Purana template.logo (sirf front, LOGO layer na ho): top 4%, left 4%, 35% × 14% */}
      {includeLegacyLogo && !hasLogoLayer && isImageUrl(template?.logo) && (
        <image href={template.logo} x={W * 0.04} y={H * 0.04} width={W * 0.35} height={H * 0.14} preserveAspectRatio={ASPECT.CONTAIN} />
      )}
      {sorted.map((layer, i) => {
        if (!layer || layer.visible === false || !isImageUrl(layer.source)) return null;
        const x = toNumber(layer.x);
        const y = toNumber(layer.y);
        const w = toNumber(layer.width);
        const h = toNumber(layer.height);
        if (w <= 0 || h <= 0) return null;
        const rotation = toNumber(layer.rotation);
        return (
          <image
            key={layer.id || i}
            href={layer.source}
            x={x}
            y={y}
            width={w}
            height={h}
            opacity={Math.min(Math.max(toNumber(layer.opacity, 1), 0), 1)}
            transform={rotation ? `rotate(${rotation} ${x + w / 2} ${y + h / 2})` : undefined}
            preserveAspectRatio={ASPECT.CONTAIN}
          />
        );
      })}
    </g>
  );
};

/**
 * @param {object} props
 * @param {object} props.renderData - Backend renderData (sides ke saath)
 * @param {'FRONT'|'BACK'} [props.side='FRONT']
 * @param {string} [props.className] - Width container se (SVG 100% chauda, height aspect ratio se)
 * @param {string} [props.title] - Screen reader ke liye
 */
export const IdCardSide = ({ renderData, side = 'FRONT', className = '', title }) => {
  const uid = safeId(useId());
  const isBack = String(side).toUpperCase() === 'BACK';
  const sideData = isBack ? renderData?.sides?.back : renderData?.sides?.front;
  const W = toNumber(sideData?.width);
  const H = toNumber(sideData?.height);

  if (!sideData || W <= 0 || H <= 0) return null;

  const unit = resolveUnit(sideData.unit, W, H);
  // Text ke liye internal scale (foreignObject andar badi px values)
  const S = TEXT_RENDER_WIDTH / W;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={`block w-full h-auto ${className}`}
      role="img"
      aria-label={title || `${isBack ? 'Back' : 'Front'} of ID card`}
    >
      <SideBackground background={sideData.background} W={W} H={H} uid={uid} />
      <Decorations shapes={sideData.decorations} uid={uid} />
      <Photo photo={sideData.photo} uid={uid} />
      <g transform={`scale(${1 / S})`}>
        {(sideData.fields || []).map((field, i) => (
          <Field key={`${field.field}-${i}`} field={field} unit={unit} W={W} S={S} />
        ))}
      </g>
      <QrCode qr={sideData.qrCode} verification={renderData.verification} />
      <ImageLayers
        layers={sideData.imageLayers}
        template={renderData.template}
        includeLegacyLogo={!isBack}
        W={W}
        H={H}
      />
    </svg>
  );
};

export default IdCardSide;

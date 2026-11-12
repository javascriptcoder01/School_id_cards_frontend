// IdCardSide.jsx
// Card ka EK side (renderData.sides.front / back) inline SVG mein — backend PDF jaisa hi.
// viewBox = template units (backend ke numbers seedhe), theme / decoration ka koi hisaab frontend mein nahi.
// Draw order PDF jaisa: background → theme layers → decorations → photo → fields → QR → image layers.
// Theme layers (Theme Builder) shared @app/theme-engine se SVG banti hain — backend PDF bhi wahi function chalata hai.
// Pure presentational: Redux nahi.
import React, { Suspense, useId, useMemo } from 'react';
import { ENGINE_VERSION, artworkIdsOf, renderLayersSvg, svgToDataUrl } from '@app/theme-engine';
import { useThemeArtworkContent } from '../../hooks/useThemeArtworkContent.js';
import { QRCodeSVG } from 'qrcode.react';
import { TEMPLATE_BUNDLED_FONTS as BUNDLED_FONTS } from '../../constants/template.js';
import { getIconComponent, fieldIconLayout, ICON_CHIP_INNER } from '../../utils/fieldIcons.js';
import { useLocalProcessedImage } from '../../hooks/useLocalProcessedImage.js';
import { textBoxBorderPaths, textBoxDash, textBoxRect } from '../../utils/fieldTextBox.js';

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

// Half-done deploy mein hi alag ho sakta hai: dev mein ek baar warning
let engineVersionWarned = false;
const warnEngineVersion = (version) => {
  if (!import.meta.env.DEV || engineVersionWarned || !version || version === ENGINE_VERSION) return;
  engineVersionWarned = true;
  console.warn(`Theme engine version mismatch: server ${version}, browser ${ENGINE_VERSION}. Reload after the deploy finishes.`);
};

/**
 * Theme Builder layers (renderData side.themeLayers). <image> data URL: andar ke ids is card se kabhi
 * clash nahi karte, aur PDF wala hi SVG banta hai.
 */
export const ThemeLayers = ({ themeLayers, W, H, sideKey }) => {
  // ARTWORK layers: sanitised SVG id se (ek baar fetch, sab cards share)
  const artworkIds = useMemo(() => artworkIdsOf(themeLayers?.layers), [themeLayers]);
  const artworks = useThemeArtworkContent(artworkIds, themeLayers?.artworks);
  const href = useMemo(() => {
    if (!themeLayers) return '';
    warnEngineVersion(themeLayers.engineVersion);
    return svgToDataUrl(
      renderLayersSvg({ layers: themeLayers.layers, roles: themeLayers.roles, width: W, height: H, idPrefix: `${sideKey}-`, artworks })
    );
  }, [themeLayers, W, H, sideKey, artworks]);
  if (!href) return null;
  return <image href={href} x={0} y={0} width={W} height={H} preserveAspectRatio="none" />;
};

export const SideBackground = ({ background, W, H, uid }) => {
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

export const Decorations = ({ shapes, uid }) => (
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

// Field icon (sirf naye renderData mein). Numbers backend PDF (drawFieldIcon) jaise; coordinates × S
// kyunki fields wala group scale(1/S) mein hai. Library icon lazy load hota hai, tab tak kuch nahi.
const FieldIcon = ({ icon, layout, S }) => {
  const size = layout.size * S;
  const x = layout.iconX * S;
  const y = layout.iconY * S;
  const inner = icon.background ? size * ICON_CHIP_INNER : size;
  const offset = (size - inner) / 2;
  const isUpload = icon.source === 'UPLOAD';
  // getIconComponent har key ka EK hi lazy component cache se deta hai (har render par naya nahi)
  const Icon = isUpload ? null : getIconComponent(icon.key);

  return (
    <g data-field-icon={isUpload ? 'upload' : icon.key}>
      {icon.background && <circle cx={x + size / 2} cy={y + size / 2} r={size / 2} fill={icon.background} />}
      {isUpload ? (
        isImageUrl(icon.url) && (
          <image href={icon.url} x={x + offset} y={y + offset} width={inner} height={inner} preserveAspectRatio={ASPECT.CONTAIN} />
        )
      ) : (
        Icon && (
          <Suspense fallback={null}>
            {React.createElement(Icon, {
              x: x + offset,
              y: y + offset,
              size: inner,
              color: colorOr(icon.color, '#000000'),
              'aria-hidden': 'true',
            })}
          </Suspense>
        )
      )}
    </g>
  );
};

// Field ka box (sirf jab render data mein textBox ho). Numbers backend PDF (drawFieldTextBox) jaise; × S.
const FieldTextBox = ({ box, field, x, y, textY, width, fontUnits, S }) => {
  const rect = textBoxRect({ x, y, textY, width, fontSize: fontUnits, lineHeight: field.lineHeight, maxLines: field.maxLines, padding: toNumber(box.padding) });
  const radius = Math.min(toNumber(box.borderRadius), rect.width / 2, rect.height / 2);
  const borderWidth = toNumber(box.borderWidth);
  const paths = borderWidth > 0 && box.borderColor
    ? textBoxBorderPaths(rect, { borderStyle: box.borderStyle, borderSides: box.borderSides, borderWidth, borderRadius: radius })
    : [];
  const backgroundOpacity = Math.min(Math.max(toNumber(box.backgroundOpacity, 1), 0), 1);

  return (
    <g data-field-box="true">
      {box.backgroundColor && backgroundOpacity > 0 && (
        <rect
          x={rect.x * S}
          y={rect.y * S}
          width={rect.width * S}
          height={rect.height * S}
          rx={radius > 0 ? radius * S : undefined}
          fill={box.backgroundColor}
          fillOpacity={backgroundOpacity}
        />
      )}
      {paths.map((path, i) => {
        const dash = textBoxDash(box.borderStyle, path.lineWidth);
        const stroke = {
          fill: 'none',
          stroke: colorOr(box.borderColor, '#000000'),
          strokeWidth: path.lineWidth * S,
          strokeDasharray: dash ? `${dash[0] * S} ${dash[1] * S}` : undefined,
        };
        return path.type === 'RECT' ? (
          <rect key={i} x={path.x * S} y={path.y * S} width={path.width * S} height={path.height * S} rx={path.radius > 0 ? path.radius * S : undefined} {...stroke} />
        ) : (
          <line key={i} x1={path.x1 * S} y1={path.y1 * S} x2={path.x2 * S} y2={path.y2 * S} {...stroke} />
        );
      })}
    </g>
  );
};

// Text effects (outline / shadow / underline) — PDF drawEffectText jaise
const textEffectStyle = (box, S) => {
  if (!box) return {};
  const strokeWidth = toNumber(box.strokeWidth);
  const shadowX = toNumber(box.shadowX);
  const shadowY = toNumber(box.shadowY);
  return {
    WebkitTextStroke: strokeWidth > 0 && box.strokeColor ? `${strokeWidth * S}px ${box.strokeColor}` : undefined,
    textShadow: box.shadowColor && (shadowX || shadowY) ? `${shadowX * S}px ${shadowY * S}px 0 ${box.shadowColor}` : undefined,
    textDecoration: box.decoration === 'UNDERLINE' ? 'underline' : box.decoration === 'LINE_THROUGH' ? 'line-through' : undefined,
  };
};

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
  const boxWidth = field.width ? toNumber(field.width) : Math.max(W - x, 1);
  const align = ['CENTER', 'RIGHT'].includes(field.textAlign) ? field.textAlign.toLowerCase() : 'left';
  // Icon ho to text uski jagah chhod kar (LEFT / RIGHT: chaudai kam, TOP: neeche)
  const iconLayout = field.icon ? fieldIconLayout(field.icon, { x, y, width: boxWidth, fontUnits, align }) : null;
  const textX = iconLayout ? iconLayout.textX : x;
  const textY = iconLayout ? iconLayout.textY : y;
  const width = iconLayout ? iconLayout.textWidth : boxWidth;
  const lineHeight = PDF_LINE_HEIGHT + (toNumber(field.lineHeight, DEFAULT_LINE_HEIGHT) - DEFAULT_LINE_HEIGHT);
  const letterSpacing = unit === 'MM' ? toNumber(field.letterSpacing) * MM_PER_PT : toNumber(field.letterSpacing);
  const height = fontUnits * lineHeight * maxLines + fontUnits * 0.2;
  const color = colorOr(field.color, '#000000');

  const text = (
    <foreignObject x={textX * S} y={textY * S} width={width * S} height={height * S}>
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        style={{
          // Bundled font (file aayi ho) warna PDF jaisa Helvetica; purane naam pehle jaise
          fontFamily: BUNDLED_FONTS.includes(field.fontFamily)
            ? `'${field.fontFamily}', Helvetica, Arial, sans-serif`
            : 'Helvetica, Arial, sans-serif',
          fontSize: fontUnits * S,
          fontWeight: String(field.fontWeight).toUpperCase() === 'BOLD' ? 700 : 400,
          fontStyle: String(field.fontStyle).toUpperCase() === 'ITALIC' ? 'italic' : 'normal',
          letterSpacing: letterSpacing * S,
          lineHeight,
          color,
          textAlign: align,
          // Value ki line breaks PDF jaisi dikhein (custom address); bina line break wali value par koi fark nahi
          whiteSpace: 'pre-line',
          display: '-webkit-box',
          WebkitLineClamp: maxLines,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          overflowWrap: 'anywhere',
          margin: 0,
          ...textEffectStyle(field.textBox, S),
        }}
      >
        {field.label && <span style={{ color: colorOr(field.labelColor, color) }}>{field.label}: </span>}
        {value}
      </div>
    </foreignObject>
  );

  if (!iconLayout && !field.textBox) return text;
  return (
    <g>
      {field.textBox && (
        <FieldTextBox box={field.textBox} field={field} x={x} y={y} textY={textY} width={boxWidth} fontUnits={fontUnits} S={S} />
      )}
      {iconLayout && <FieldIcon icon={field.icon} layout={iconLayout} S={S} />}
      {text}
    </g>
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

// School profile image jo upload nahi hai (layer.missing) — sirf preview mein dashed box (PDF mein kuch nahi chhapta)
const PROFILE_IMAGE_NAMES = {
  LOGO: 'School logo',
  PRINCIPAL_SIGNATURE: 'Principal signature',
  STAMP: 'School stamp',
};

const MissingImage = ({ layer, x, y, w, h, rotation, S }) => {
  const name = PROFILE_IMAGE_NAMES[layer.profileKey] || 'School image';
  // Text bade px mein render karke scale (browser minimum font size se bachne ke liye)
  const font = Math.min(h * 0.22, (w / Math.max(name.length, 8)) * 1.7) * S;
  const stroke = Math.max(Math.min(w, h) * 0.02, 0.2);
  return (
    <g transform={rotation ? `rotate(${rotation} ${x + w / 2} ${y + h / 2})` : undefined} data-missing-image={layer.profileKey || ''}>
      <title>{`${name} is not uploaded in the school profile`}</title>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={Math.min(w, h) * 0.06}
        fill="#F8FAFC"
        fillOpacity={0.85}
        stroke="#94A3B8"
        strokeWidth={stroke}
        strokeDasharray={`${stroke * 4} ${stroke * 3}`}
      />
      <g transform={`scale(${1 / S})`}>
        <text
          x={(x + w / 2) * S}
          y={(y + h / 2) * S}
          fontSize={font}
          fill="#64748B"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="Arial, Helvetica, sans-serif"
        >
          {name}
        </text>
      </g>
    </g>
  );
};

// Frame ka shape: background, clip aur border teeno yahi (PDF ke traceImageLayerShape jaisa)
const layerShape = (shape, x, y, w, h, radius, props = {}) => {
  if (shape === 'CIRCLE') return <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} {...props} />;
  const half = Math.min(w, h) / 2;
  const rx = shape === 'PILL' ? half : shape === 'ROUNDED' ? Math.min(Math.max(radius, 0), half) : 0;
  return <rect x={x} y={y} width={w} height={h} rx={rx || undefined} {...props} />;
};

const BORDER_DASHES = {
  DASHED: (width) => `${width * 3} ${width * 2}`,
  DOTTED: (width) => `${width} ${width * 1.5}`,
};

// Purani layer (bina frame): wahi ek <image> jo pehle banta tha
const isPlainLayer = (layer) =>
  (!layer.fit || layer.fit === 'CONTAIN')
  && (!layer.shape || layer.shape === 'RECTANGLE')
  && !layer.backgroundColor
  && !toNumber(layer.padding)
  && !(toNumber(layer.borderWidth) > 0 && layer.borderColor)
  && layer.flipX !== true
  && layer.flipY !== true;

// Frame ke saath image. Numbers aur order PDF (drawStyledImageLayer) jaise: background → clip → image → border.
// Opacity har hisse par alag, jaise PDF mein lagti hai.
const StyledImageLayer = ({ layer, x, y, w, h, rotation, opacity, clipId }) => {
  const shape = layer.shape || 'RECTANGLE';
  const radius = toNumber(layer.borderRadius);
  const framed = shape !== 'RECTANGLE';

  const padding = Math.min(Math.max(toNumber(layer.padding), 0), Math.max(Math.min(w, h) / 2 - 0.5, 0));
  const innerX = x + padding;
  const innerY = y + padding;
  const innerW = w - padding * 2;
  const innerH = h - padding * 2;

  const scaleX = layer.flipX === true ? -1 : 1;
  const scaleY = layer.flipY === true ? -1 : 1;
  const centerX = innerX + innerW / 2;
  const centerY = innerY + innerH / 2;
  const flip = scaleX !== 1 || scaleY !== 1
    ? `translate(${centerX} ${centerY}) scale(${scaleX} ${scaleY}) translate(${-centerX} ${-centerY})`
    : undefined;

  const borderWidth = toNumber(layer.borderWidth);
  const hasBorder = borderWidth > 0 && Boolean(layer.borderColor) && w > borderWidth && h > borderWidth;

  return (
    <g transform={rotation ? `rotate(${rotation} ${x + w / 2} ${y + h / 2})` : undefined}>
      {framed && <clipPath id={clipId}>{layerShape(shape, x, y, w, h, radius)}</clipPath>}
      {layer.backgroundColor && layerShape(shape, x, y, w, h, radius, { fill: layer.backgroundColor, opacity })}
      <g clipPath={framed ? `url(#${clipId})` : undefined}>
        <image
          href={layer.source}
          x={innerX}
          y={innerY}
          width={innerW}
          height={innerH}
          opacity={opacity}
          transform={flip}
          preserveAspectRatio={ASPECT[layer.fit] || ASPECT.CONTAIN}
        />
      </g>
      {hasBorder && layerShape(
        shape,
        x + borderWidth / 2,
        y + borderWidth / 2,
        w - borderWidth,
        h - borderWidth,
        Math.max(radius - borderWidth / 2, 0),
        {
          fill: 'none',
          stroke: layer.borderColor,
          strokeWidth: borderWidth,
          strokeDasharray: BORDER_DASHES[layer.borderStyle]?.(borderWidth),
          opacity,
        }
      )}
    </g>
  );
};

// LOCAL processing wali layer: processed image (tab tak original) ko usi ImageLayers se draw karo — frame / fit / rotation sab same
const LocalProcessedLayer = ({ layer, W, H, S, uid }) => {
  const { url } = useLocalProcessedImage(layer.source, layer.processing.settings);
  return (
    <ImageLayers
      layers={[{ ...layer, source: url || layer.source, processing: null }]}
      template={null}
      includeLegacyLogo={false}
      W={W}
      H={H}
      S={S}
      uid={uid}
    />
  );
};

const ImageLayers = ({ layers, template, includeLegacyLogo, W, H, S, uid }) => {
  const sorted = [...(layers || [])].sort((a, b) => toNumber(a.zIndex, 10) - toNumber(b.zIndex, 10));
  const hasLogoLayer = sorted.some((layer) => layer.type === 'LOGO');

  return (
    <g>
      {/* Purana template.logo (sirf front, LOGO layer na ho): top 4%, left 4%, 35% × 14% */}
      {includeLegacyLogo && !hasLogoLayer && isImageUrl(template?.logo) && (
        <image href={template.logo} x={W * 0.04} y={H * 0.04} width={W * 0.35} height={H * 0.14} preserveAspectRatio={ASPECT.CONTAIN} />
      )}
      {sorted.map((layer, i) => {
        if (!layer || layer.visible === false) return null;
        const missing = layer.missing === true;
        if (!missing && !isImageUrl(layer.source)) return null;
        const x = toNumber(layer.x);
        const y = toNumber(layer.y);
        const w = toNumber(layer.width);
        const h = toNumber(layer.height);
        if (w <= 0 || h <= 0) return null;
        const rotation = toNumber(layer.rotation);
        if (missing) {
          return <MissingImage key={layer.id || i} layer={layer} x={x} y={y} w={w} h={h} rotation={rotation} S={S} />;
        }
        // Base64 image ka background removal (LOCAL): browser mein process karke wahi drawing (neeche wala code)
        if (layer.processing?.mode === 'LOCAL' && layer.processing.settings) {
          return <LocalProcessedLayer key={layer.id || i} layer={layer} W={W} H={H} S={S} uid={`${uid}-local${i}`} />;
        }
        const opacity = Math.min(Math.max(toNumber(layer.opacity, 1), 0), 1);
        if (!isPlainLayer(layer)) {
          return (
            <StyledImageLayer
              key={layer.id || i}
              layer={layer}
              x={x}
              y={y}
              w={w}
              h={h}
              rotation={rotation}
              opacity={opacity}
              clipId={`${uid}-layer-${i}`}
            />
          );
        }
        return (
          <image
            key={layer.id || i}
            href={layer.source}
            x={x}
            y={y}
            width={w}
            height={h}
            opacity={opacity}
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
// dimElements: designer ka "Edit on card" (background layer edit) — photo / text / QR / images halke (sirf preview)
export const IdCardSide = ({ renderData, side = 'FRONT', className = '', title, dimElements = false }) => {
  const uid = safeId(useId());
  const isBack = String(side).toUpperCase() === 'BACK';
  const sideData = isBack ? renderData?.sides?.back : renderData?.sides?.front;
  const W = toNumber(sideData?.width);
  const H = toNumber(sideData?.height);

  if (!sideData || W <= 0 || H <= 0) return null;

  const unit = resolveUnit(sideData.unit, W, H);
  // Text ke liye internal scale (foreignObject andar badi px values)
  const S = TEXT_RENDER_WIDTH / W;

  const elements = (
    <>
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
        S={S}
        uid={uid}
      />
    </>
  );

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={`block w-full h-auto ${className}`}
      // Sirf preview: print hamesha square
      style={sideData.cornerStyle === 'ROUNDED' ? { borderRadius: '4%' } : undefined}
      role="img"
      aria-label={title || `${isBack ? 'Back' : 'Front'} of ID card`}
    >
      <SideBackground background={sideData.background} W={W} H={H} uid={uid} />
      <ThemeLayers themeLayers={sideData.themeLayers} W={W} H={H} sideKey={isBack ? 'back' : 'front'} />
      <Decorations shapes={sideData.decorations} uid={uid} />
      {dimElements ? <g opacity="0.25">{elements}</g> : elements}
    </svg>
  );
};

export default IdCardSide;

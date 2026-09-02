import {
  PHOTO_BOX_MIN_WIDTH,
  PHOTO_BOX_MIN_HEIGHT,
  FIELD_MIN_FONT_SIZE,
  FIELD_MAX_FONT_SIZE,
  TEMPLATE_ORIENTATIONS,
  TEMPLATE_FONT_WEIGHTS,
} from '../constants/template.js';

/**
 * Checks if a value is a valid finite number
 */
export const isFiniteNumber = (value) => {
  if (value === null || value === undefined || value === '') return false;
  const num = Number(value);
  return Number.isFinite(num) && !Number.isNaN(num);
};

/**
 * Normalizes a coordinate or dimension to a valid finite number within [min, max]
 */
export const normalizeCoordinate = (value, min = 0, max = Infinity, fallback = 0) => {
  if (!isFiniteNumber(value)) return fallback;
  const num = Number(value);
  return Math.max(min, Math.min(max, num));
};

/**
 * Validates photo box coordinates and dimensions against card bounds
 */
export const validatePhotoBox = (photo, cardBounds = { width: 86, height: 54 }) => {
  if (!photo) return { isValid: true, sanitized: null };

  const x = normalizeCoordinate(photo.x, 0, cardBounds.width, 55);
  const y = normalizeCoordinate(photo.y, 0, cardBounds.height, 20);
  const width = normalizeCoordinate(
    photo.width,
    PHOTO_BOX_MIN_WIDTH,
    cardBounds.width,
    25
  );
  const height = normalizeCoordinate(
    photo.height,
    PHOTO_BOX_MIN_HEIGHT,
    cardBounds.height,
    30
  );

  const isWithinBounds =
    x + width <= cardBounds.width && y + height <= cardBounds.height;

  return {
    isValid: isWithinBounds,
    sanitized: {
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      width: Math.round(width * 10) / 10,
      height: Math.round(height * 10) / 10,
      visible: photo.visible !== false,
    },
  };
};

/**
 * Validates dynamic field placement and typography against card bounds
 */
export const validateFieldPlacement = (field, cardBounds = { width: 86, height: 54 }) => {
  if (!field) return { isValid: false, sanitized: null };

  const x = normalizeCoordinate(field.x, 0, cardBounds.width, 10);
  const y = normalizeCoordinate(field.y, 0, cardBounds.height, 20);
  const fontSize = normalizeCoordinate(
    field.fontSize,
    FIELD_MIN_FONT_SIZE,
    FIELD_MAX_FONT_SIZE,
    11
  );
  const fontWeight =
    field.fontWeight === TEMPLATE_FONT_WEIGHTS.BOLD
      ? TEMPLATE_FONT_WEIGHTS.BOLD
      : TEMPLATE_FONT_WEIGHTS.NORMAL;

  const isWithinBounds = x <= cardBounds.width && y <= cardBounds.height;

  return {
    isValid: isWithinBounds,
    sanitized: {
      ...field,
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      fontSize: Math.round(fontSize),
      fontWeight,
      visible: field.visible !== false,
    },
  };
};

/**
 * Normalizes full template designer configuration
 */
export const normalizeDesignerConfig = (config) => {
  if (!config) return null;

  const width = normalizeCoordinate(config.width, 10, 1000, 86);
  const height = normalizeCoordinate(config.height, 10, 1000, 54);
  const cardBounds = { width, height };

  const orientation =
    config.orientation === TEMPLATE_ORIENTATIONS.LANDSCAPE
      ? TEMPLATE_ORIENTATIONS.LANDSCAPE
      : TEMPLATE_ORIENTATIONS.PORTRAIT;

  const photoValidation = validatePhotoBox(config.photo, cardBounds);
  const normalizedFields = Array.isArray(config.fields)
    ? config.fields.map((f) => validateFieldPlacement(f, cardBounds).sanitized)
    : [];

  return {
    ...config,
    orientation,
    width,
    height,
    photo: photoValidation.sanitized,
    fields: normalizedFields,
  };
};

export default {
  isFiniteNumber,
  normalizeCoordinate,
  validatePhotoBox,
  validateFieldPlacement,
  normalizeDesignerConfig,
};


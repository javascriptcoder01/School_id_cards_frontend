import { describe, it, expect } from 'vitest';
import {
  isFiniteNumber,
  normalizeCoordinate,
  validatePhotoBox,
  validateFieldPlacement,
  normalizeDesignerConfig,
} from '../utils/templateDesignerValidation.js';
import {
  PHOTO_BOX_MIN_WIDTH,
  PHOTO_BOX_MIN_HEIGHT,
  FIELD_MIN_FONT_SIZE,
  FIELD_MAX_FONT_SIZE,
} from '../constants/template.js';

describe('TEMPLATE DESIGNER VALIDATION UTILITIES', () => {
  it('1. isFiniteNumber correctly identifies finite numbers and rejects non-numbers / NaN / Infinity', () => {
    expect(isFiniteNumber(42)).toBe(true);
    expect(isFiniteNumber('42')).toBe(true);
    expect(isFiniteNumber(0)).toBe(true);
    expect(isFiniteNumber(-5)).toBe(true);

    expect(isFiniteNumber(NaN)).toBe(false);
    expect(isFiniteNumber(Infinity)).toBe(false);
    expect(isFiniteNumber(-Infinity)).toBe(false);
    expect(isFiniteNumber(null)).toBe(false);
    expect(isFiniteNumber(undefined)).toBe(false);
    expect(isFiniteNumber('')).toBe(false);
    expect(isFiniteNumber('abc')).toBe(false);
  });

  it('2. normalizeCoordinate clamps values within min and max boundaries', () => {
    expect(normalizeCoordinate(50, 0, 100)).toBe(50);
    expect(normalizeCoordinate(-10, 0, 100)).toBe(0);
    expect(normalizeCoordinate(150, 0, 100)).toBe(100);
    expect(normalizeCoordinate(NaN, 0, 100, 25)).toBe(25);
  });

  it('3. validatePhotoBox enforces card bounds and minimum photo dimensions', () => {
    const cardBounds = { width: 86, height: 54 };

    // Valid placement
    const valid = validatePhotoBox(
      { x: 50, y: 15, width: 25, height: 30, visible: true },
      cardBounds
    );
    expect(valid.isValid).toBe(true);
    expect(valid.sanitized.width).toBe(25);

    // Negative coordinates & under-sized
    const invalid = validatePhotoBox(
      { x: -5, y: -10, width: 2, height: 2, visible: true },
      cardBounds
    );
    expect(invalid.sanitized.x).toBe(0);
    expect(invalid.sanitized.y).toBe(0);
    expect(invalid.sanitized.width).toBe(PHOTO_BOX_MIN_WIDTH);
    expect(invalid.sanitized.height).toBe(PHOTO_BOX_MIN_HEIGHT);
  });

  it('4. validateFieldPlacement clamps font size and coordinate ranges', () => {
    const cardBounds = { width: 86, height: 54 };

    const result = validateFieldPlacement(
      { field: 'name', label: 'Name', x: 10, y: 30, fontSize: 250, fontWeight: 'BOLD' },
      cardBounds
    );

    expect(result.sanitized.fontSize).toBe(FIELD_MAX_FONT_SIZE);
    expect(result.sanitized.fontWeight).toBe('BOLD');
  });

  it('5. normalizeDesignerConfig sanitizes entire template structure', () => {
    const rawConfig = {
      name: 'Test Template',
      orientation: 'LANDSCAPE',
      width: 86,
      height: 54,
      photo: { x: 10, y: 10, width: 25, height: 30 },
      fields: [
        { field: 'name', x: 10, y: 20, fontSize: 12 },
      ],
    };

    const normalized = normalizeDesignerConfig(rawConfig);
    expect(normalized.orientation).toBe('LANDSCAPE');
    expect(normalized.width).toBe(86);
    expect(normalized.photo.x).toBe(10);
    expect(normalized.fields).toHaveLength(1);
  });
});


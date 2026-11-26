// index.d.ts — editor types for @app/theme-engine (runtime is plain JS; this file only helps autocomplete).

export type ColorRole = 'primary' | 'secondary' | 'accent' | 'surface' | 'text' | 'mutedText' | 'onPrimary';
export type Roles = Record<ColorRole, string>;
export type LayerColor = { role: ColorRole; alpha?: number } | { hex: string; alpha?: number };
export type LayerType =
  | 'SOLID'
  | 'LINEAR_GRADIENT'
  | 'RADIAL_GRADIENT'
  | 'MESH_GRADIENT'
  | 'PATTERN'
  | 'SHAPE'
  | 'CURVE'
  | 'ARTWORK';

export interface Layer {
  id: string;
  type: LayerType;
  name?: string | null;
  enabled?: boolean;
  opacity?: number;
  blendMode?: string;
  locked?: boolean;
  [key: string]: unknown;
}

export interface ThemeLayers {
  front: Layer[];
  back: Layer[] | null;
}

export interface Artwork {
  svg: string;
  viewBox: string | number[];
  slots?: Array<{ name: string; defaultRole?: ColorRole | null; defaultHex?: string | null }>;
}

export interface PrintWarning {
  code: string;
  message: string;
  side?: 'front' | 'back';
}

/* constants.js */
export const ENGINE_VERSION: string;
export const COLOR_ROLES: Readonly<Record<string, ColorRole>>;
export const COLOR_ROLE_VALUES: readonly ColorRole[];
export const LAYER_TYPES: Readonly<Record<LayerType, LayerType>>;
export const LAYER_TYPE_VALUES: readonly LayerType[];
export const PATTERN_TYPES: Readonly<Record<string, string>>;
export const PATTERN_TYPE_VALUES: readonly string[];
export const SHAPE_TYPES: Readonly<Record<string, string>>;
export const SHAPE_TYPE_VALUES: readonly string[];
export const BLEND_MODES: Readonly<Record<string, string>>;
export const BLEND_MODE_VALUES: readonly string[];
export const CURVE_FILL_TO: Readonly<Record<string, string>>;
export const CURVE_FILL_TO_VALUES: readonly string[];
export const ARTWORK_FITS: Readonly<Record<string, string>>;
export const ARTWORK_FIT_VALUES: readonly string[];
export const LAYER_LIMITS: Readonly<Record<string, number>>;
export const THEME_SCHEMA_VERSIONS: Readonly<{ LEGACY: number; LAYERS: number }>;

/* renderLayers.js */
export const DEFAULT_ROLE_COLORS: Readonly<Roles>;
export function normalizeHex(value: unknown): string | null;
export function resolveRoles(roles?: Partial<Record<ColorRole, string | null>> | null, fallback?: Partial<Record<ColorRole, string | null>>): Roles;
export function resolveLayerColor(color: LayerColor | null | undefined, roles: Roles): { hex: string; alpha: number } | null;
export function hasVisibleLayers(layers: Layer[] | null | undefined): boolean;
export function renderLayersSvg(input: {
  layers: Layer[];
  roles?: Partial<Roles> | null;
  width: number;
  height: number;
  idPrefix?: string;
  outputWidth?: number;
  outputHeight?: number;
  artworks?: Record<string, Artwork> | null;
}): string;
export function svgToDataUrl(svg: string): string;
export function layersForSide(layers: ThemeLayers | null | undefined, sideKey: 'front' | 'back'): Layer[] | null;
export function artworkIdsOf(layers: Layer[] | null | undefined): string[];
export function parseViewBox(value: string | number[] | null | undefined): number[] | null;

/* palette.js */
export const PALETTE_MODES: Readonly<Record<'ANALOGOUS' | 'COMPLEMENTARY' | 'TRIADIC' | 'MONO', string>>;
export const PALETTE_MODE_VALUES: readonly string[];
export const MIN_CONTRAST: number;
export function buildPalette(baseHex: string, options?: { mode?: string; variant?: number }): Roles;
export function contrastRatio(a: string, b: string): number;
export function hexToHsl(hex: string): { h: number; s: number; l: number };
export function hslToHex(hsl: { h: number; s: number; l: number }): string;

/* migrations.js */
export const CURRENT_THEME_SCHEMA: number;
export function migrateTheme<T>(theme: T): T;
export function migrateThemeWithInfo<T>(theme: T): { theme: T; from: number; to: number; changed: boolean };

/* printCheck.js */
export function checkPrintSafety(
  theme: { roles?: Partial<Roles> | null; layers?: ThemeLayers | Layer[] | null },
  card?: { width: number; height: number; unit?: string }
): PrintWarning[];

/* stableStringify.js */
export function stableStringify(value: unknown): string;

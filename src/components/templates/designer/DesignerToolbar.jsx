import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Eye, Layout } from 'lucide-react';
import {
  TEMPLATE_DESIGNER_MODES,
  MIN_DESIGNER_ZOOM,
  MAX_DESIGNER_ZOOM,
  DEFAULT_DESIGNER_ZOOM,
  ZOOM_STEP,
} from '../../../constants/template.js';

export const DesignerToolbar = ({
  mode = TEMPLATE_DESIGNER_MODES.DESIGN,
  zoom = DEFAULT_DESIGNER_ZOOM,
  onModeChange,
  onZoomChange,
}) => {
  const handleZoomIn = () => {
    const nextZoom = Math.min(MAX_DESIGNER_ZOOM, Math.round((zoom + ZOOM_STEP) * 10) / 10);
    onZoomChange(nextZoom);
  };

  const handleZoomOut = () => {
    const nextZoom = Math.max(MIN_DESIGNER_ZOOM, Math.round((zoom - ZOOM_STEP) * 10) / 10);
    onZoomChange(nextZoom);
  };

  const handleZoomReset = () => {
    onZoomChange(DEFAULT_DESIGNER_ZOOM);
  };

  const isDesignMode = mode === TEMPLATE_DESIGNER_MODES.DESIGN;

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-xs">
      {/* Mode Switcher */}
      <div className="inline-flex p-1 bg-slate-100 rounded-xl">
        <button
          type="button"
          onClick={() => onModeChange(TEMPLATE_DESIGNER_MODES.DESIGN)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${isDesignMode
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
            }`}
          aria-pressed={isDesignMode}
        >
          <Layout className="w-3.5 h-3.5" />
          <span>Design Canvas</span>
        </button>
        <button
          type="button"
          onClick={() => onModeChange(TEMPLATE_DESIGNER_MODES.PREVIEW)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${!isDesignMode
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
            }`}
          aria-pressed={!isDesignMode}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Live Preview</span>
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleZoomOut}
          disabled={zoom <= MIN_DESIGNER_ZOOM}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <span className="text-xs font-mono font-bold text-slate-700 min-w-[48px] text-center">
          {Math.round(zoom * 100)}%
        </span>

        <button
          type="button"
          onClick={handleZoomIn}
          disabled={zoom >= MAX_DESIGNER_ZOOM}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleZoomReset}
          disabled={zoom === DEFAULT_DESIGNER_ZOOM}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors ml-1"
          title="Reset Zoom (100%)"
          aria-label="Reset Zoom"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DesignerToolbar;


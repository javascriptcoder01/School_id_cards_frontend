// CardDesigner.jsx
// School Admin ka card designer: top bar (Front | Back, back side switch, zoom, snap),
// left (Design / Elements tabs), centre canvas (backend preview + drag / resize), right (properties).
// Saara data TemplateForm ke paas; ye selection, tabs, zoom sambhalta hai.
import React, { useState } from 'react';
import { Minus, Plus, Magnet, Loader2, AlertTriangle, Palette, Layers } from 'lucide-react';
import DesignerCanvas from './DesignerCanvas.jsx';
import ThemeDesignPanel from './ThemeDesignPanel.jsx';
import ElementsPanel from './ElementsPanel.jsx';
import PropertiesPanel from './PropertiesPanel.jsx';
import ConfirmDialog from '../../common/ConfirmDialog.jsx';
import {
  DESIGNER_ELEMENT_TYPES,
  TEMPLATE_SIDES,
  TEMPLATE_REPEATABLE_FIELDS,
  LETTERHEAD_ASSET_TYPE,
} from '../../../constants/template.js';
import { toNumber } from '../../../utils/templateLayout.js';
import { sideOf, mergeDraftIntoRender } from '../../../utils/templateDesigner.js';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1.5;
const ZOOM_STEP = 0.1;

const panelClass = 'bg-white p-4 rounded-3xl border border-slate-200 shadow-xs';

/**
 * @param {object} props
 * @param {object} props.formData
 * @param {object|null} props.themes
 * @param {boolean} props.themesLoading
 * @param {object[]} props.usableAssets
 * @param {boolean} props.assetsLoading
 * @param {object|null} props.previewData - backend renderData (preview-render)
 * @param {boolean} props.previewLoading
 * @param {string|null} props.previewError
 * @param {string[]} props.invalidLabels - card ke bahar wale elements
 * @param {object} props.handlers - TemplateForm ke side-aware handlers
 */
export const CardDesigner = ({
  formData,
  themes,
  themesLoading,
  usableAssets = [],
  assetsLoading = false,
  previewData,
  previewLoading,
  previewError,
  invalidLabels = [],
  handlers,
}) => {
  const [side, setSide] = useState(TEMPLATE_SIDES.FRONT);
  const [leftTab, setLeftTab] = useState('DESIGN');
  const [zoom, setZoom] = useState(1);
  const [snap, setSnap] = useState(true);
  const [selected, setSelected] = useState(null);
  const [confirmRecommended, setConfirmRecommended] = useState(false);

  // Back off ho to front
  const activeSide = side === TEMPLATE_SIDES.BACK && !formData.hasBack ? TEMPLATE_SIDES.FRONT : side;
  const sideData = sideOf(formData, activeSide);
  const W = toNumber(formData.width, 86);
  const H = toNumber(formData.height, 54);
  const unit = formData.unit;
  // PropertiesPanel ek side ko "template" ki tarah dekhta hai
  const sideView = { ...sideData, width: formData.width, height: formData.height, unit };
  const renderData = mergeDraftIntoRender(previewData, formData, activeSide);
  const letterheads = usableAssets.filter((a) => a.type === LETTERHEAD_ASSET_TYPE);

  const switchSide = (next) => {
    setSide(next);
    setSelected(null);
  };

  /* ---------- Canvas / panel → TemplateForm handlers ---------- */

  const changeElement = (sel, patch) => {
    if (sel.type === DESIGNER_ELEMENT_TYPES.FIELD) handlers.onUpdateField(activeSide, sel.index, patch);
    else if (sel.type === DESIGNER_ELEMENT_TYPES.PHOTO && sideData.photo) handlers.onUpdatePhoto(activeSide, { ...sideData.photo, ...patch });
    else if (sel.type === DESIGNER_ELEMENT_TYPES.QR && sideData.qrCode) handlers.onUpdateQrCode(activeSide, { ...sideData.qrCode, ...patch });
    else if (sel.type === DESIGNER_ELEMENT_TYPES.LAYER) handlers.onUpdateLayer(activeSide, sel.id, patch);
  };

  const removeElement = (sel) => {
    if (sel.type === DESIGNER_ELEMENT_TYPES.FIELD) handlers.onRemoveField(activeSide, sel.index);
    else if (sel.type === DESIGNER_ELEMENT_TYPES.PHOTO) handlers.onUpdatePhoto(activeSide, null);
    else if (sel.type === DESIGNER_ELEMENT_TYPES.QR) handlers.onUpdateQrCode(activeSide, null);
    else if (sel.type === DESIGNER_ELEMENT_TYPES.LAYER) handlers.onRemoveLayer(activeSide, sel.id);
    setSelected(null);
  };

  const addField = (fieldName) => {
    const already = sideData.fields.some((f) => f.field === fieldName) && !TEMPLATE_REPEATABLE_FIELDS.includes(fieldName);
    if (already) return;
    const index = sideData.fields.length;
    handlers.onAddField(activeSide, fieldName);
    setSelected({ type: DESIGNER_ELEMENT_TYPES.FIELD, id: fieldName, index });
  };

  const addLayer = (type) => {
    const key = handlers.onAddLayer(activeSide, type);
    if (key) setSelected({ type: DESIGNER_ELEMENT_TYPES.LAYER, id: key });
  };

  const backHasElements =
    (formData.back?.fields?.length || 0) + (formData.back?.imageLayers?.length || 0) > 0 || Boolean(formData.back?.qrCode || formData.back?.photo);

  const applyRecommended = () => {
    handlers.onApplyRecommendedBack();
    setSelected(null);
    setConfirmRecommended(false);
  };

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Card side">
            {[TEMPLATE_SIDES.FRONT, TEMPLATE_SIDES.BACK].map((s) => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={activeSide === s}
                disabled={s === TEMPLATE_SIDES.BACK && !formData.hasBack}
                onClick={() => switchSide(s)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  activeSide === s ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s === TEMPLATE_SIDES.FRONT ? 'Front' : 'Back'}
              </button>
            ))}
          </div>
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              role="switch"
              checked={Boolean(formData.hasBack)}
              onChange={(e) => {
                handlers.onToggleBack(e.target.checked);
                switchSide(e.target.checked ? TEMPLATE_SIDES.BACK : TEMPLATE_SIDES.FRONT);
              }}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Back side
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {previewLoading && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
              <Loader2 className="h-3 w-3 animate-spin" /> Updating preview
            </span>
          )}
          <button
            type="button"
            onClick={() => setSnap((v) => !v)}
            aria-pressed={snap}
            title="Snap to grid and centre lines (hold Alt while dragging to turn off)"
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold ${
              snap ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600'
            }`}
          >
            <Magnet className="h-3.5 w-3.5" /> Snap
          </button>
          <div className="inline-flex items-center rounded-lg border border-slate-200">
            <button type="button" onClick={() => setZoom((z) => Math.max(MIN_ZOOM, Math.round((z - ZOOM_STEP) * 10) / 10))} disabled={zoom <= MIN_ZOOM} className="p-1.5 disabled:opacity-40" aria-label="Zoom out">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-12 text-center text-[11px] font-semibold tabular-nums text-slate-700">{Math.round(zoom * 100)}%</span>
            <button type="button" onClick={() => setZoom((z) => Math.min(MAX_ZOOM, Math.round((z + ZOOM_STEP) * 10) / 10))} disabled={zoom >= MAX_ZOOM} className="p-1.5 disabled:opacity-40" aria-label="Zoom in">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {previewError && (
        <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900" role="status">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Preview couldn&apos;t update: {previewError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* Left: Design / Elements */}
        <div className={`${panelClass} xl:col-span-3 order-2 xl:order-1 max-h-[78vh] overflow-y-auto`}>
          <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1" role="tablist">
            {[
              { key: 'DESIGN', label: 'Design', icon: Palette },
              { key: 'ELEMENTS', label: 'Elements', icon: Layers },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={leftTab === key}
                onClick={() => setLeftTab(key)}
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold ${
                  leftTab === key ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
          </div>

          {leftTab === 'DESIGN' ? (
            <ThemeDesignPanel
              themes={themes}
              themesLoading={themesLoading}
              theme={formData.theme}
              side={activeSide}
              sideBackground={sideData}
              letterheads={letterheads}
              validity={formData.validity}
              onApplyPreset={handlers.onApplyPreset}
              onThemeChange={handlers.onThemeChange}
              onSideBackgroundChange={(patch) => handlers.onSideBackgroundChange(activeSide, patch)}
              onValidityChange={handlers.onValidityChange}
            />
          ) : (
            <ElementsPanel
              themes={themes}
              side={activeSide}
              sideData={sideData}
              usableAssets={usableAssets}
              assetsLoading={assetsLoading}
              selected={selected}
              onSelect={setSelected}
              onAddField={addField}
              onAddPhoto={() => {
                handlers.onAddPhoto(activeSide);
                setSelected({ type: DESIGNER_ELEMENT_TYPES.PHOTO, id: 'photo' });
              }}
              onAddQrCode={() => {
                handlers.onAddQrCode(activeSide);
                setSelected({ type: DESIGNER_ELEMENT_TYPES.QR, id: 'qrCode' });
              }}
              onAddLayer={addLayer}
              onRecommendedBack={() => (backHasElements ? setConfirmRecommended(true) : applyRecommended())}
            />
          )}
        </div>

        {/* Centre: canvas */}
        <div className="xl:col-span-6 order-1 xl:order-2 space-y-2">
          <DesignerCanvas
            renderData={renderData}
            sideData={sideData}
            side={activeSide}
            unit={unit}
            cardWidth={W}
            cardHeight={H}
            zoom={zoom}
            snap={snap}
            selected={selected}
            onSelect={setSelected}
            onChangeElement={changeElement}
            onRemoveElement={removeElement}
            invalidLabels={invalidLabels}
            loading={previewLoading}
          />
          <p className="text-center text-[11px] text-slate-400">
            Drag to move · corner handles to resize · arrow keys nudge (Shift = bigger) · Delete removes
          </p>
        </div>

        {/* Right: properties */}
        <div className="xl:col-span-3 order-3">
          <PropertiesPanel
            selectedElement={selected}
            formData={sideView}
            usableAssets={usableAssets}
            onUpdateField={(index, patch) => handlers.onUpdateField(activeSide, index, patch)}
            onRemoveField={(index) => {
              handlers.onRemoveField(activeSide, index);
              setSelected(null);
            }}
            onUpdatePhoto={(photo) => {
              handlers.onUpdatePhoto(activeSide, photo);
              if (photo === null) setSelected(null);
            }}
            onUpdateQrCode={(qr) => {
              handlers.onUpdateQrCode(activeSide, qr);
              if (qr === null) setSelected(null);
            }}
            onUpdateLayer={(key, patch) => handlers.onUpdateLayer(activeSide, key, patch)}
            onRemoveLayer={(key) => {
              handlers.onRemoveLayer(activeSide, key);
              setSelected(null);
            }}
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmRecommended}
        title="Replace the back side?"
        message="The recommended layout replaces everything currently on the back side."
        confirmLabel="Replace back side"
        variant="warning"
        onConfirm={applyRecommended}
        onCancel={() => setConfirmRecommended(false)}
      />
    </div>
  );
};

export default CardDesigner;

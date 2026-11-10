// CardDesigner.jsx
// School Admin ka card designer: top bar (Front | Back, back side switch, zoom, snap),
// left (Design / Elements tabs), centre canvas (backend preview + drag / resize), right (properties).
// Saara data TemplateForm ke paas; ye selection, tabs, zoom sambhalta hai.
import React, { useState } from 'react';
import { Minus, Plus, Magnet, Loader2, AlertTriangle, Palette, Layers, Sliders, AlignCenter } from 'lucide-react';
import DesignerCanvas from './DesignerCanvas.jsx';
import ThemeDesignPanel from './ThemeDesignPanel.jsx';
import ElementsPanel from './ElementsPanel.jsx';
import PropertiesPanel from './PropertiesPanel.jsx';
import ConfirmDialog from '../../common/ConfirmDialog.jsx';
import {
  DESIGNER_ELEMENT_TYPES,
  TEMPLATE_SIDES,
  TEMPLATE_REPEATABLE_FIELDS,
  TEMPLATE_MAX_FIELDS,
  LETTERHEAD_ASSET_TYPE,
  SIGN_WITH_SEAL_COMBO,
} from '../../../constants/template.js';
import { toNumber, clamp, getLayerKey } from '../../../utils/templateLayout.js';
import { sideOf, mergeDraftIntoRender } from '../../../utils/templateDesigner.js';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1.5;
const ZOOM_STEP = 0.1;

const panelClass =
  'p-3 rounded-2xl border border-indigo-100/80 bg-linear-to-b from-white via-white to-indigo-50/60 shadow-sm shadow-indigo-500/5';

// lg se chhoti screen: canvas ke neeche ek hi tab bar (Design | Elements | Properties)
const MOBILE_TABS = [
  { key: 'DESIGN', label: 'Design', icon: Palette },
  { key: 'ELEMENTS', label: 'Elements', icon: Layers },
  { key: 'PROPERTIES', label: 'Properties', icon: Sliders },
];

/**
 * @param {object} props
 * @param {object} props.formData
 * @param {object|null} props.themes
 * @param {boolean} props.themesLoading
 * @param {object[]} props.usableAssets
 * @param {boolean} props.assetsLoading
 * @param {object[]} props.schoolImages - designer-context schoolImages (logo / principal signature / stamp)
 * @param {boolean} props.schoolImagesLoading
 * @param {string|null} props.schoolImagesError
 * @param {() => void} props.onRetrySchoolImages
 * @param {object|null} props.profileUrls - profileKey → url | null
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
  schoolImages = [],
  schoolImagesLoading = false,
  schoolImagesError = null,
  onRetrySchoolImages,
  profileUrls = null,
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
  const [selected, setSelectedState] = useState(null);
  const [mobileTab, setMobileTab] = useState('DESIGN');
  const [confirmRecommended, setConfirmRecommended] = useState(false);

  // Element select hua → mobile par Properties tab (lg+ par mobileTab ka koi asar nahi)
  const setSelected = (sel) => {
    setSelectedState(sel);
    if (sel) setMobileTab('PROPERTIES');
  };

  const pickMobileTab = (key) => {
    setMobileTab(key);
    if (key !== 'PROPERTIES') setLeftTab(key);
  };

  // Back off ho to front
  const activeSide = side === TEMPLATE_SIDES.BACK && !formData.hasBack ? TEMPLATE_SIDES.FRONT : side;
  const sideData = sideOf(formData, activeSide);
  const W = toNumber(formData.width, 86);
  const H = toNumber(formData.height, 54);
  const unit = formData.unit;
  // PropertiesPanel ek side ko "template" ki tarah dekhta hai
  const sideView = { ...sideData, width: formData.width, height: formData.height, unit };
  const renderData = mergeDraftIntoRender(previewData, formData, activeSide, profileUrls);
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

  // extras (optional): "Add with icon" ka displayMode + icon — field banne ke baad usi par lagta hai
  const addField = (fieldName, extras = null) => {
    const already = sideData.fields.some((f) => f.field === fieldName) && !TEMPLATE_REPEATABLE_FIELDS.includes(fieldName);
    if (already) return;
    const index = sideData.fields.length;
    handlers.onAddField(activeSide, fieldName);
    // Limit par field banti hi nahi — tab extras bhi nahi
    if (extras && index < TEMPLATE_MAX_FIELDS) handlers.onUpdateField(activeSide, index, extras);
    setSelected({ type: DESIGNER_ELEMENT_TYPES.FIELD, id: fieldName, index });
  };

  const addLayer = (type) => {
    const key = handlers.onAddLayer(activeSide, type);
    if (key) setSelected({ type: DESIGNER_ELEMENT_TYPES.LAYER, id: key });
  };

  // School Images tile click / card par drop (at = drop point, template units)
  const addSchoolImage = (profileKey, at = null) => {
    const key =
      profileKey === SIGN_WITH_SEAL_COMBO
        ? handlers.onAddSignWithSeal(activeSide)
        : handlers.onAddProfileImage(activeSide, profileKey, at);
    if (key) setSelected({ type: DESIGNER_ELEMENT_TYPES.LAYER, id: key });
  };

  // Layer order: 'FRONT' / 'BACK' (sabse upar / neeche) ya +1 / -1 ([ / ])
  const reorderLayer = (key, mode) => {
    const layers = sideData.imageLayers || [];
    const layer = layers.find((l) => getLayerKey(l) === key);
    if (!layer) return;
    const current = toNumber(layer.zIndex, 10);
    const others = layers.filter((l) => getLayerKey(l) !== key).map((l) => toNumber(l.zIndex, 10));
    let next = current + (typeof mode === 'number' ? mode : 0);
    if (mode === 'FRONT') next = others.length ? Math.max(current, Math.max(...others) + 1) : current;
    if (mode === 'BACK') next = others.length ? Math.min(current, Math.min(...others) - 1) : current;
    next = clamp(Math.round(next), 0, 100);
    if (next !== current) handlers.onUpdateLayer(activeSide, key, { zIndex: next });
  };

  // Portrait card: photo upar beech mein, text uske neeche
  const isPortrait = H > W;
  const canCenterLayout = Boolean(sideData.photo) || (sideData.fields || []).length > 0;
  // Layout TemplateForm banata hai (naye portrait template ka default bhi wahi)
  const applyCenterLayout = () => {
    handlers.onApplyCenterLayout(activeSide);
    setSelectedState(null);
  };

  const backHasElements =
    (formData.back?.fields?.length || 0) + (formData.back?.imageLayers?.length || 0) > 0 || Boolean(formData.back?.qrCode || formData.back?.photo);

  const applyRecommended = () => {
    handlers.onApplyRecommendedBack();
    setSelected(null);
    setConfirmRecommended(false);
  };

  return (
    <div className="space-y-3 rounded-3xl bg-linear-to-br from-indigo-50 via-violet-50/70 to-fuchsia-50 p-2 ring-1 ring-indigo-100/70 sm:p-3">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/70 bg-linear-to-r from-white/90 via-white/80 to-indigo-50/80 px-3 py-2 shadow-sm shadow-indigo-500/10 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-xl bg-linear-to-r from-indigo-100/80 via-violet-100/70 to-fuchsia-100/70 p-1 ring-1 ring-indigo-200/50" role="tablist" aria-label="Card side">
            {[TEMPLATE_SIDES.FRONT, TEMPLATE_SIDES.BACK].map((s) => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={activeSide === s}
                disabled={s === TEMPLATE_SIDES.BACK && !formData.hasBack}
                onClick={() => switchSide(s)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${activeSide === s ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30' : 'text-slate-600 hover:bg-white/70 hover:text-indigo-700'
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
              className="rounded border-indigo-300 text-violet-600 focus:ring-violet-500"
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
          {isPortrait && (
            <button
              type="button"
              onClick={applyCenterLayout}
              disabled={!canCenterLayout}
              aria-label="Center layout: photo on top, text below"
              title="Photo on top centre, text fields below it"
              className="inline-flex items-center gap-1 rounded-lg bg-linear-to-r from-indigo-600 to-violet-600 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm shadow-indigo-500/30 transition-shadow hover:shadow-md focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <AlignCenter className="h-3.5 w-3.5" />
              <span className="max-sm:hidden">Center layout</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setSnap((v) => !v)}
            aria-pressed={snap}
            title="Snap to grid and centre lines (hold Alt while dragging to turn off)"
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold ${snap ? 'border-violet-200 bg-linear-to-r from-indigo-50 to-violet-100 text-violet-700' : 'border-slate-200 bg-white text-slate-600'
              }`}
          >
            <Magnet className="h-3.5 w-3.5" /> Snap
          </button>
          <div className="inline-flex items-center rounded-lg border border-indigo-100 bg-white shadow-xs">
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
        <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-linear-to-r from-amber-50 via-orange-50 to-yellow-50 px-3 py-2 text-xs text-amber-900" role="status">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Preview couldn&apos;t update: {previewError}</span>
        </div>
      )}

      {/* Left / right panels patle (fixed width), beech ka canvas baaki saari jagah le */}
      <div className="grid grid-cols-1 gap-3 items-start xl:grid-cols-[15rem_minmax(0,1fr)_15rem] 2xl:grid-cols-[16.5rem_minmax(0,1fr)_16.5rem]">
        {/* Left: Design / Elements */}
        <div
          className={`${panelClass} min-w-0 order-2 xl:order-1 max-h-[85vh] overflow-y-auto overscroll-contain [scrollbar-width:thin] xl:h-[calc(100dvh-7rem)] xl:min-h-[32rem] xl:max-h-none ${mobileTab === 'PROPERTIES' ? 'max-lg:hidden' : ''
            }`}
        >
          {/* lg se chhoti screen par ye tabs canvas ke neeche wale tab bar mein hain */}
          <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-linear-to-r from-indigo-100/80 via-violet-100/70 to-fuchsia-100/70 p-1 ring-1 ring-indigo-200/50 max-lg:hidden" role="tablist">
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
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-all ${leftTab === key ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30' : 'text-slate-600 hover:bg-white/70 hover:text-indigo-700'
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
              onSaveSchoolTheme={handlers.onSaveSchoolTheme}
              onRenameSchoolTheme={handlers.onRenameSchoolTheme}
              onDeleteSchoolTheme={handlers.onDeleteSchoolTheme}
              logoUrl={profileUrls?.LOGO || null}
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
              schoolImages={schoolImages}
              schoolImagesLoading={schoolImagesLoading}
              schoolImagesError={schoolImagesError}
              onRetrySchoolImages={onRetrySchoolImages}
              onAddSchoolImage={addSchoolImage}
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
        <div className="min-w-0 order-1 xl:order-2 space-y-2">
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
            onReorderLayer={(sel, delta) => reorderLayer(sel.id, delta)}
            onDropSchoolImage={addSchoolImage}
            invalidLabels={invalidLabels}
            loading={previewLoading}
          />
          <p className="text-center text-[11px] font-medium text-indigo-400 max-lg:hidden">
            Drag to move
          </p>
          <p className="text-center text-[11px] font-medium text-indigo-400 lg:hidden">
            Tap to select · drag to move · drag handles to resize · top handle rotates
          </p>
        </div>

        {/* Mobile tab bar (lg se chhota): canvas ke theek neeche */}
        <div className="order-1 lg:hidden grid grid-cols-3 gap-1 rounded-xl bg-linear-to-r from-indigo-100/80 via-violet-100/70 to-fuchsia-100/70 p-1 ring-1 ring-indigo-200/50" role="tablist" aria-label="Designer panels">
          {MOBILE_TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={mobileTab === key}
              onClick={() => pickMobileTab(key)}
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${mobileTab === key ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30' : 'text-slate-600 hover:bg-white/70 hover:text-indigo-700'
                }`}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </div>

        {/* Right: properties */}
        <div className={`min-w-0 order-3 ${mobileTab === 'PROPERTIES' ? '' : 'max-lg:hidden'}`}>
          <PropertiesPanel
            selectedElement={selected}
            formData={sideView}
            usableAssets={usableAssets}
            schoolImages={schoolImages}
            profileUrls={profileUrls}
            onReorderLayer={reorderLayer}
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
            renderLayers={renderData?.sides?.[activeSide === TEMPLATE_SIDES.BACK ? 'back' : 'front']?.imageLayers || []}
            renderFields={previewData?.sides?.[activeSide === TEMPLATE_SIDES.BACK ? 'back' : 'front']?.fields || []}
            previewLoading={previewLoading}
            onApplyImageProcessingToAll={handlers.onApplyImageProcessingToAll}
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
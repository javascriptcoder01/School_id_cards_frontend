// DesignerCanvas.jsx

import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import IdCardSide from '../../idCards/IdCardSide.jsx';
import { BackgroundEditOverlay, BackgroundEditToolbar } from './themeBuilder/BackgroundEditOverlay.jsx';
import {
  DESIGNER_ELEMENT_TYPES,
  TEMPLATE_FIELD_LABELS,
  TEMPLATE_IMAGE_LAYER_LABELS,
  TEMPLATE_COLLEGE_PROFILE_IMAGE_LABELS,
  SCHOOL_IMAGE_DRAG_TYPE,
  isProfileImageLayer,
} from '../../../constants/template.js';
import { toNumber, getLayerKey, clamp } from '../../../utils/templateLayout.js';
import {
  fieldBox,
  gridFor,
  nudgeFor,
  snapTo,
  clampBox,
  resizeLockedBox,
  normalizeRotation,
} from '../../../utils/templateDesigner.js';
import { withFieldIconBox } from '../../../utils/fieldIcons.js';

const BASE_CANVAS_WIDTH = 900; // bada card (A4) ke liye; chhoti jagah mein apne aap fit
const MIN_CANVAS_WIDTH = 160;
// Portrait card poora screen mein dikhe: canvas ki height bhi screen ke hisaab se
const MIN_FIT_HEIGHT = 240; // isse chhota fit nahi karte (bahut chhoti screen par scroll theek hai)
const MAX_TOP_OFFSET = 112; // sticky header ka andaaza (neeche stacked layout mein isse zyada nahi ghatate)
const BOTTOM_GAP = 12;
const CORNER_HANDLES = ['nw', 'ne', 'sw', 'se'];
const SIDE_HANDLES = ['w', 'e'];
const LAYER_HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
const ROTATE_HANDLE = 'rotate';
const ROTATION_STEP = 15;
const NO_GUIDES = { v: false, h: false, l: false, r: false, t: false, b: false };
// Touch (coarse pointer): handle dikhne mein wahi, pakadne ki jagah ≥ 28px (10px + 2 × 9px)
const TOUCH_HIT = "before:absolute before:content-[''] pointer-coarse:before:-inset-[9px]";

const HANDLE_POSITION = {
  nw: 'left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize',
  ne: 'right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize',
  sw: 'left-0 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize',
  se: 'right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize',
  w: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize',
  e: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize',
  n: 'left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize',
  s: 'left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-ns-resize',
};

const sameSelection = (a, b) =>
  Boolean(a && b && a.type === b.type && (a.type === DESIGNER_ELEMENT_TYPES.FIELD ? a.index === b.index : a.id === b.id));

const hasSchoolImage = (event) => Array.from(event.dataTransfer?.types || []).includes(SCHOOL_IMAGE_DRAG_TYPE);

/**
 * Side ke elements → canvas items { sel, box, kind, label, outsideLabel }
 */
const buildItems = (side, unit, W, prefix) => {
  const items = [];
  (side.fields || []).forEach((field, index) => {
    items.push({
      sel: { type: DESIGNER_ELEMENT_TYPES.FIELD, id: field.field, index },
      // TOP icon field ke upar hai: selection box usse bhi gher le
      box: withFieldIconBox(fieldBox(field, unit, W), field, unit),
      kind: 'FIELD',
      label: field.field === 'customText' ? field.customText || 'Custom text' : TEMPLATE_FIELD_LABELS[field.field] || field.field,
      outsideLabel: `${prefix}Field "${field.field}"`,
      hidden: field.visible === false,
    });
  });
  if (side.photo) {
    items.push({
      sel: { type: DESIGNER_ELEMENT_TYPES.PHOTO, id: 'photo' },
      box: side.photo,
      kind: 'BOX',
      label: 'Photo',
      outsideLabel: `${prefix}Photo`,
      hidden: side.photo.visible === false,
    });
  }
  if (side.qrCode) {
    items.push({
      sel: { type: DESIGNER_ELEMENT_TYPES.QR, id: 'qrCode' },
      box: side.qrCode,
      kind: 'BOX',
      label: 'QR code',
      outsideLabel: `${prefix}QR Code`,
      hidden: side.qrCode.visible === false,
    });
  }
  (side.imageLayers || []).forEach((layer, i) => {
    items.push({
      sel: { type: DESIGNER_ELEMENT_TYPES.LAYER, id: getLayerKey(layer) },
      box: layer,
      kind: 'LAYER',
      layer,
      lockAspect: layer.lockAspectRatio !== false,
      rotation: toNumber(layer.rotation),
      label: isProfileImageLayer(layer)
        ? TEMPLATE_COLLEGE_PROFILE_IMAGE_LABELS[layer.profileKey] || layer.profileKey
        : TEMPLATE_IMAGE_LAYER_LABELS[layer.type] || layer.type,
      outsideLabel: `${prefix}Image layer ${i + 1} (${layer.type})`,
      hidden: layer.visible === false,
    });
  });
  return items;
};

/**
 * @param {object} props
 * @param {object|null} props.renderData - Turant wala render (mergeDraftIntoRender)
 * @param {object} props.sideData - { fields, photo, qrCode, imageLayers } (draft)
 * @param {'FRONT'|'BACK'} props.side
 * @param {string} props.unit
 * @param {number} props.cardWidth
 * @param {number} props.cardHeight
 * @param {number} props.zoom - 0.5..1.5
 * @param {boolean} props.snap
 * @param {object|null} props.selected
 * @param {(sel: object|null) => void} props.onSelect
 * @param {(sel: object, patch: object) => void} props.onChangeElement
 * @param {(sel: object) => void} props.onRemoveElement
 * @param {(sel: object, delta: number) => void} [props.onReorderLayer] - [ / ] keys
 * @param {(profileKey: string, at: { x: number, y: number }) => void} [props.onDropSchoolImage]
 * @param {string[]} [props.invalidLabels] - card ke bahar / galat elements (laal outline)
 * @param {boolean} [props.loading] - backend preview aa raha hai
 * @param {{ layer: object, onPatch: (patch: object) => void, onDone: () => void }|null} [props.backgroundEdit]
 *   Theme Builder "Edit on card": background curve / shape edit (card ke elements dim + locked)
 */
export const DesignerCanvas = ({
  renderData,
  sideData,
  side,
  unit,
  cardWidth: W,
  cardHeight: H,
  zoom = 1,
  snap = true,
  selected,
  onSelect,
  onChangeElement,
  onRemoveElement,
  onReorderLayer,
  onDropSchoolImage,
  invalidLabels = [],
  loading = false,
  backgroundEdit = null,
}) => {
  // Background edit: chuna hua curve point
  const [bgPoint, setBgPoint] = useState(0);
  const overlayRef = useRef(null);
  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const scrollRef = useRef(null);
  const stageRef = useRef(null);
  const [guides, setGuides] = useState(NO_GUIDES);
  const [dropActive, setDropActive] = useState(false);
  const [available, setAvailable] = useState(null); // { width, height }

  useEffect(() => {
    const scrollEl = scrollRef.current;
    const stageEl = stageRef.current;
    if (!scrollEl || !stageEl) return undefined;

    const measure = () => {
      const style = window.getComputedStyle(stageEl);
      const padX = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
      const padY = (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0);
      const width = Math.max(0, Math.floor(scrollEl.clientWidth - padX));

      // Canvas page par kahan se shuru hota hai (scroll se farak na pade)
      const docTop = scrollEl.getBoundingClientRect().top + window.scrollY;
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const height = Math.max(
        MIN_FIT_HEIGHT,
        Math.floor(viewportHeight - Math.min(docTop, MAX_TOP_OFFSET) - padY - BOTTOM_GAP)
      );

      setAvailable((prev) => (prev && prev.width === width && prev.height === height ? prev : { width, height }));
    };

    measure();
    window.addEventListener('resize', measure);
    window.visualViewport?.addEventListener('resize', measure);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(scrollEl);
    return () => {
      window.removeEventListener('resize', measure);
      window.visualViewport?.removeEventListener('resize', measure);
      observer?.disconnect();
    };
  }, []);

  // 100% = fit: chaudai mein bhi aur screen ki unchai mein bhi (max BASE_CANVAS_WIDTH); zoom isi ke hisaab se
  const ratio = toNumber(W) > 0 && toNumber(H) > 0 ? toNumber(W) / toNumber(H) : 1;
  const fitWidth = available
    ? Math.min(BASE_CANVAS_WIDTH, available.width, Math.floor(available.height * ratio))
    : BASE_CANVAS_WIDTH;
  const canvasWidth = Math.max(MIN_CANVAS_WIDTH, Math.round(fitWidth * zoom));

  const prefix = side === 'BACK' ? 'Back: ' : '';
  const items = buildItems(sideData, unit, W, prefix);
  const invalid = new Set(invalidLabels);
  const grid = gridFor(unit);
  const minSize = grid;

  const startDrag = (event, item, handle = null) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    onSelect(item.sel);
    // Arrow keys / Delete canvas par chalein
    canvasRef.current?.focus({ preventScroll: true });
    const rect = overlayRef.current.getBoundingClientRect();
    const box = item.box;
    dragRef.current = {
      item,
      handle,
      startX: event.clientX,
      startY: event.clientY,
      box: { ...box },
      scale: W / rect.width,
      centerX: rect.left + ((toNumber(box.x) + toNumber(box.width) / 2) / W) * rect.width,
      centerY: rect.top + ((toNumber(box.y) + toNumber(box.height) / 2) / H) * rect.height,
    };
    overlayRef.current.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = (event.clientX - drag.startX) * drag.scale;
    const dy = (event.clientY - drag.startY) * drag.scale;
    const useSnap = snap && !event.altKey;
    const start = drag.box;
    const isField = drag.item.kind === 'FIELD';

    if (drag.handle === ROTATE_HANDLE) {
      // Handle upar hai, isliye +90°
      let angle = (Math.atan2(event.clientY - drag.centerY, event.clientX - drag.centerX) * 180) / Math.PI + 90;
      if (event.shiftKey) angle = Math.round(angle / ROTATION_STEP) * ROTATION_STEP;
      onChangeElement(drag.item.sel, { rotation: normalizeRotation(angle, drag.item.layer) });
      return;
    }

    if (!drag.handle) {
      let x = toNumber(start.x) + dx;
      let y = toNumber(start.y) + dy;
      if (useSnap) {
        x = snapTo(x, grid);
        y = snapTo(y, grid);
      }
      const w = toNumber(start.width);
      const h = toNumber(start.height);
      const near = (a, b) => useSnap && Math.abs(a - b) < grid / 2;
      const nearV = !start.autoWidth && near(x + w / 2, W / 2);
      const nearH = near(y + h / 2, H / 2);
      const nearL = near(x, 0);
      const nearR = !start.autoWidth && !nearV && near(x + w, W);
      const nearT = near(y, 0);
      const nearB = !nearH && near(y + h, H);
      if (nearV) x = W / 2 - w / 2;
      if (nearH) y = H / 2 - h / 2;
      if (nearL) x = 0;
      if (nearR) x = W - w;
      if (nearT) y = 0;
      if (nearB) y = H - h;
      setGuides({ v: nearV, h: nearH, l: nearL, r: nearR, t: nearT, b: nearB });

      const clamped = clampBox({ x, y, width: start.autoWidth ? 1 : w, height: h }, W, H, 0.01);
      onChangeElement(drag.item.sel, { x: clamped.x, y: clamped.y });
      return;
    }
    if (drag.item.kind === 'LAYER' && drag.item.lockAspect && !event.shiftKey) {
      onChangeElement(drag.item.sel, resizeLockedBox(start, drag.handle, dx, dy, W, H, minSize));
      return;
    }
    let { x, y, width, height } = { x: toNumber(start.x), y: toNumber(start.y), width: toNumber(start.width), height: toNumber(start.height) };
    if (drag.handle.includes('e')) width += dx;
    if (drag.handle.includes('w')) {
      x += dx;
      width -= dx;
    }
    if (!isField && drag.handle.includes('s')) height += dy;
    if (!isField && drag.handle.includes('n')) {
      y += dy;
      height -= dy;
    }
    if (useSnap) {
      const right = snapTo(x + width, grid);
      const bottom = snapTo(y + height, grid);
      x = snapTo(x, grid);
      y = snapTo(y, grid);
      width = right - x;
      height = bottom - y;
    }
    const clamped = clampBox({ x, y, width: Math.max(width, minSize), height: Math.max(height, minSize) }, W, H, minSize);
    onChangeElement(
      drag.item.sel,
      isField ? { x: clamped.x, width: clamped.width } : clamped
    );
  };

  const endDrag = (event) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setGuides(NO_GUIDES);
    if (overlayRef.current?.hasPointerCapture(event.pointerId)) overlayRef.current.releasePointerCapture(event.pointerId);
  };

  const onKeyDown = (event) => {
    if (!selected) return;
    const item = items.find((it) => sameSelection(it.sel, selected));
    if (!item) return;

    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      onRemoveElement(selected);
      return;
    }
    if ((event.key === '[' || event.key === ']') && item.kind === 'LAYER' && onReorderLayer) {
      event.preventDefault();
      onReorderLayer(selected, event.key === ']' ? 1 : -1);
      return;
    }
    const step = nudgeFor(unit, event.shiftKey);
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    const box = item.box;
    const clamped = clampBox(
      {
        x: toNumber(box.x) + move[0],
        y: toNumber(box.y) + move[1],
        width: box.autoWidth ? 1 : toNumber(box.width),
        height: toNumber(box.height),
      },
      W,
      H,
      0.01
    );
    onChangeElement(selected, { x: clamped.x, y: clamped.y });
  };

  /* ---------- School image drop (Elements panel se) ---------- */

  const onDragOver = (event) => {
    if (!onDropSchoolImage || !hasSchoolImage(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    if (!dropActive) setDropActive(true);
  };

  const onDrop = (event) => {
    setDropActive(false);
    if (!onDropSchoolImage || !hasSchoolImage(event)) return;
    event.preventDefault();
    const key = event.dataTransfer.getData(SCHOOL_IMAGE_DRAG_TYPE);
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!key || !rect?.width) return;
    const x = clamp(((event.clientX - rect.left) / rect.width) * W, 0, W);
    const y = clamp(((event.clientY - rect.top) / rect.height) * H, 0, H);
    onDropSchoolImage(key, { x, y });
    canvasRef.current?.focus({ preventScroll: true });
  };

  const pct = (value, total) => `${(toNumber(value) / total) * 100}%`;

  return (
    <div className="relative w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-indigo-200/60 bg-linear-to-br from-indigo-100 via-violet-50 to-fuchsia-100 shadow-inner shadow-indigo-500/5">
      {/* Rangeen chamak + halka dot grid — design table jaisa feel */}
      {/* Blur filter ki jagah radial gradients: kone saaf rehte hain aur scroll/drag par GPU par bojh kam */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(129,140,248,0.35),transparent_45%),radial-gradient(circle_at_100%_100%,rgba(232,121,249,0.3),transparent_45%),radial-gradient(circle_at_50%_35%,rgba(125,211,252,0.18),transparent_40%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#a5b4fc_1px,transparent_1px)] bg-size-[14px_14px] opacity-50"
        aria-hidden="true"
      />

      {/* Kaun si side + size: chhota chip */}
      <span className="pointer-events-none absolute left-1/2 top-1.5 -translate-x-1/2 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-bold text-slate-700 shadow-sm shadow-indigo-500/10 ring-1 ring-indigo-200/70 backdrop-blur-sm">
        <span className={`h-1.5 w-1.5 rounded-full bg-linear-to-br ${side === 'BACK' ? 'from-violet-500 to-fuchsia-500' : 'from-indigo-500 to-sky-500'}`} />
        {side === 'BACK' ? 'Back' : 'Front'}
        <span className="font-mono font-medium text-slate-400">
          {toNumber(W)} × {toNumber(H)} {String(unit || '').toLowerCase()}
        </span>
      </span>

      {loading && (
        <span className="pointer-events-none absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-bold text-indigo-600 shadow-xs ring-1 ring-indigo-100 backdrop-blur-sm">
          <Loader2 className="h-3 w-3 animate-spin" /> Updating
        </span>
      )}

      {backgroundEdit && (
        <div className="relative z-10 px-2 pt-8 sm:px-3">
          <BackgroundEditToolbar
            layer={backgroundEdit.layer}
            selectedPoint={bgPoint}
            onSelectPoint={setBgPoint}
            onPatch={backgroundEdit.onPatch}
            onDone={backgroundEdit.onDone}
          />
        </div>
      )}

      <div ref={scrollRef} className="relative w-full min-w-0 max-w-full overflow-auto overscroll-contain">
        {/* pt: selected label / rotate handle card ke upar kat na jaaye */}
        <div ref={stageRef} className="flex w-max min-w-full justify-center px-2 pb-2 pt-7 sm:px-3 sm:pb-3">
          <div
            ref={canvasRef}
            className={`relative shrink-0 rounded-xl shadow-2xl shadow-indigo-900/25 ring-1 ring-white/60 outline-hidden transition-[width] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-indigo-500 motion-reduce:transition-none ${dropActive ? 'outline-2 outline-dashed outline-offset-4 outline-indigo-500' : ''
              }`}
            style={{ width: canvasWidth }}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onDragOver={onDragOver}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) setDropActive(false);
            }}
            onDrop={onDrop}
            aria-label="Card canvas. Select an element, drag to move, arrow keys to nudge, Delete to remove."
          >
            {renderData ? (
              <div className="rounded-xl overflow-hidden">
                <IdCardSide renderData={renderData} side={side} dimElements={Boolean(backgroundEdit)} />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 bg-white text-sm text-slate-500 rounded-xl" style={{ aspectRatio: `${W} / ${H}` }}>
                <Loader2 className="h-4 w-4 animate-spin" /> Rendering preview…
              </div>
            )}

            <div
              ref={overlayRef}
              className="absolute inset-0 select-none touch-none"
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onPointerDown={(e) => {
                if (e.target === overlayRef.current) onSelect(null);
              }}
            >
              {guides.v && <div className="pointer-events-none absolute top-0 bottom-0 left-1/2 w-px bg-pink-500" />}
              {guides.h && <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-px bg-pink-500" />}
              {guides.l && <div className="pointer-events-none absolute top-0 bottom-0 left-0 w-px bg-pink-500" />}
              {guides.r && <div className="pointer-events-none absolute top-0 bottom-0 right-0 w-px bg-pink-500" />}
              {guides.t && <div className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-pink-500" />}
              {guides.b && <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-px bg-pink-500" />}

              {items.map((item) => {
                const isSel = sameSelection(item.sel, selected);
                const isInvalid = invalid.has(item.outsideLabel);
                const isLayer = item.kind === 'LAYER';
                const box = item.box;
                const handles = item.kind === 'FIELD' ? SIDE_HANDLES : isLayer ? LAYER_HANDLES : CORNER_HANDLES;
                return (
                  <div
                    key={`${item.sel.type}-${item.sel.index ?? item.sel.id}`}
                    role="button"
                    tabIndex={-1}
                    aria-label={`${item.label}${isSel ? ' (selected)' : ''}`}
                    onPointerDown={(e) => startDrag(e, item)}
                    className={`absolute cursor-move rounded-[2px] ${isSel
                      ? 'ring-2 ring-indigo-500 ring-offset-1 ring-offset-white/0'
                      : isInvalid
                        ? 'ring-2 ring-rose-500'
                        : 'hover:outline-1 hover:outline-dashed hover:outline-indigo-400'
                      } ${item.hidden ? 'opacity-40 outline-1 outline-dashed outline-slate-400' : ''}`}
                    style={{
                      left: pct(box.x, W),
                      top: pct(box.y, H),
                      width: pct(box.width, W),
                      height: pct(box.height, H),
                      // Card par image centre se ghoomti hai — box bhi waise hi
                      transform: isLayer && item.rotation ? `rotate(${item.rotation}deg)` : undefined,
                    }}
                  >
                    {isSel && (
                      <>
                        <span
                          className={`pointer-events-none absolute left-0 z-10 whitespace-nowrap rounded-md bg-linear-to-r from-indigo-600 to-violet-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-md shadow-indigo-500/30 ${isLayer ? '-bottom-5' : '-top-5'
                            }`}
                        >
                          {item.label}
                          {isLayer && item.rotation ? ` · ${Math.round(item.rotation)}°` : ''}
                        </span>
                        {handles.map((handle) => (
                          <span
                            key={handle}
                            onPointerDown={(e) => startDrag(e, item, handle)}
                            className={`absolute h-2.5 w-2.5 rounded-full border-2 border-indigo-600 bg-white shadow-sm ${HANDLE_POSITION[handle]} ${TOUCH_HIT}`}
                          />
                        ))}
                        {isLayer && (
                          <>
                            <span className="pointer-events-none absolute left-1/2 -top-4 h-4 w-px -translate-x-1/2 bg-indigo-600" />
                            <span
                              onPointerDown={(e) => startDrag(e, item, ROTATE_HANDLE)}
                              title="Drag to rotate (Shift = 15° steps)"
                              className={`absolute left-1/2 -top-6 h-3 w-3 -translate-x-1/2 cursor-grab rounded-full border-2 border-violet-600 bg-white shadow-sm active:cursor-grabbing ${TOUCH_HIT}`}
                            />
                          </>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {backgroundEdit && (
              <BackgroundEditOverlay
                layer={backgroundEdit.layer}
                cardWidth={W}
                cardHeight={H}
                snap={snap}
                grid={grid}
                selectedPoint={bgPoint}
                onSelectPoint={setBgPoint}
                onPatch={backgroundEdit.onPatch}
                onDone={backgroundEdit.onDone}
              />
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignerCanvas;
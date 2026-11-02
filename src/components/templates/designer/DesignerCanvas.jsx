// DesignerCanvas.jsx

import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import IdCardSide from '../../idCards/IdCardSide.jsx';
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

const BASE_CANVAS_WIDTH = 520;
const MIN_CANVAS_WIDTH = 160;
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
      box: fieldBox(field, unit, W),
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
}) => {
  const overlayRef = useRef(null);
  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const scrollRef = useRef(null);
  const stageRef = useRef(null);
  const [guides, setGuides] = useState(NO_GUIDES);
  const [dropActive, setDropActive] = useState(false);
  const [availableWidth, setAvailableWidth] = useState(null);

  // Container ki asli khaali width (padding ke baad) — resize / sidebar / mobile rotate par update
  useEffect(() => {
    const scrollEl = scrollRef.current;
    const stageEl = stageRef.current;
    if (!scrollEl || !stageEl) return undefined;

    const measure = () => {
      const style = window.getComputedStyle(stageEl);
      const padX = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
      const next = Math.max(0, Math.floor(scrollEl.clientWidth - padX));
      setAvailableWidth((prev) => (prev === next ? prev : next));
    };

    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(scrollEl);
    return () => observer.disconnect();
  }, []);

  // 100% = fit (max BASE_CANVAS_WIDTH); zoom isi ke hisaab se
  const fitWidth = availableWidth ? Math.min(BASE_CANVAS_WIDTH, availableWidth) : BASE_CANVAS_WIDTH;
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
      // Rotation: element ka centre (screen px)
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
      // Move
      let x = toNumber(start.x) + dx;
      let y = toNumber(start.y) + dy;
      if (useSnap) {
        x = snapTo(x, grid);
        y = snapTo(y, grid);
      }
      const w = toNumber(start.width);
      const h = toNumber(start.height);
      const near = (a, b) => useSnap && Math.abs(a - b) < grid / 2;
      // Card ki centre line / edges ke paas → wahin chipko
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

    // Image layer: ratio lock (Shift = free)
    if (drag.item.kind === 'LAYER' && drag.item.lockAspect && !event.shiftKey) {
      onChangeElement(drag.item.sel, resizeLockedBox(start, drag.handle, dx, dy, W, H, minSize));
      return;
    }

    // Resize
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
    // Scroll box: sirf yahi scroll hota hai (page nahi). min-w-0 = grid/flex column mein sikud sake.
    <div ref={scrollRef} className="w-full min-w-0 max-w-full overflow-auto overscroll-x-contain rounded-2xl bg-slate-100">
      {/* Stage: w-max + min-w-full → card chhota ho to beech mein, bada ho to left se shuru (left kabhi nahi katta) */}
      <div ref={stageRef} className="flex w-max min-w-full justify-center p-6 max-sm:px-3 max-sm:pt-8 max-sm:pb-5">
        <div
          ref={canvasRef}
          className={`relative shrink-0 shadow-lg rounded-xl outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 ${dropActive ? 'outline-2 outline-dashed outline-offset-4 outline-indigo-500' : ''
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
              <IdCardSide renderData={renderData} side={side} />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 bg-white text-sm text-slate-500 rounded-xl" style={{ aspectRatio: `${W} / ${H}` }}>
              <Loader2 className="h-4 w-4 animate-spin" /> Rendering preview…
            </div>
          )}

          {/* Interaction overlay */}
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
                  className={`absolute cursor-move ${isSel
                    ? 'ring-2 ring-indigo-500'
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
                        className={`pointer-events-none absolute left-0 whitespace-nowrap rounded bg-indigo-600 px-1.5 py-0.5 text-[10px] font-semibold text-white ${isLayer ? '-bottom-5' : '-top-5'
                          }`}
                      >
                        {item.label}
                        {isLayer && item.rotation ? ` · ${Math.round(item.rotation)}°` : ''}
                      </span>
                      {handles.map((handle) => (
                        <span
                          key={handle}
                          onPointerDown={(e) => startDrag(e, item, handle)}
                          className={`absolute h-2.5 w-2.5 rounded-sm border border-indigo-600 bg-white ${HANDLE_POSITION[handle]} ${TOUCH_HIT}`}
                        />
                      ))}
                      {isLayer && (
                        <>
                          <span className="pointer-events-none absolute left-1/2 -top-4 h-4 w-px -translate-x-1/2 bg-indigo-600" />
                          <span
                            onPointerDown={(e) => startDrag(e, item, ROTATE_HANDLE)}
                            title="Drag to rotate (Shift = 15° steps)"
                            className={`absolute left-1/2 -top-6 h-3 w-3 -translate-x-1/2 cursor-grab rounded-full border border-indigo-600 bg-white active:cursor-grabbing ${TOUCH_HIT}`}
                          />
                        </>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {loading && (
            <span className="pointer-events-none absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-600 shadow-xs">
              <Loader2 className="h-3 w-3 animate-spin" /> Updating
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignerCanvas;
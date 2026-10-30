// DesignerCanvas.jsx
// Card canvas: neeche backend ka render (IdCardSide), upar interaction overlay —
// select, drag (move), corner / side handles (resize), arrow keys (1 / Shift 10), Delete,
// 8px (2mm) grid + card centre lines par snap (Alt = snap band), card ke andar clamp.
// Element positions draft (formData) se aate hain, isliye drag turant dikhta hai.
import React, { useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import IdCardSide from '../../idCards/IdCardSide.jsx';
import { DESIGNER_ELEMENT_TYPES, TEMPLATE_FIELD_LABELS, TEMPLATE_IMAGE_LAYER_LABELS } from '../../../constants/template.js';
import { toNumber, getLayerKey } from '../../../utils/templateLayout.js';
import { fieldBox, gridFor, nudgeFor, snapTo, clampBox } from '../../../utils/templateDesigner.js';

const BASE_CANVAS_WIDTH = 520;
const CORNER_HANDLES = ['nw', 'ne', 'sw', 'se'];
const SIDE_HANDLES = ['w', 'e'];

const HANDLE_POSITION = {
  nw: 'left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize',
  ne: 'right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize',
  sw: 'left-0 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize',
  se: 'right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize',
  w: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize',
  e: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize',
};

const sameSelection = (a, b) =>
  Boolean(a && b && a.type === b.type && (a.type === DESIGNER_ELEMENT_TYPES.FIELD ? a.index === b.index : a.id === b.id));

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
      kind: 'BOX',
      label: TEMPLATE_IMAGE_LAYER_LABELS[layer.type] || layer.type,
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
  invalidLabels = [],
  loading = false,
}) => {
  const overlayRef = useRef(null);
  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const [guides, setGuides] = useState({ v: false, h: false });

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
    dragRef.current = {
      item,
      handle,
      startX: event.clientX,
      startY: event.clientY,
      box: { ...item.box },
      scale: W / rect.width,
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
      // Card ki centre line ke paas → beech mein
      const nearV = useSnap && !start.autoWidth && Math.abs(x + w / 2 - W / 2) < grid / 2;
      const nearH = useSnap && Math.abs(y + h / 2 - H / 2) < grid / 2;
      if (nearV) x = W / 2 - w / 2;
      if (nearH) y = H / 2 - h / 2;
      setGuides({ v: nearV, h: nearH });

      const clamped = clampBox({ x, y, width: start.autoWidth ? 1 : w, height: h }, W, H, 0.01);
      onChangeElement(drag.item.sel, { x: clamped.x, y: clamped.y });
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
    setGuides({ v: false, h: false });
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

  const pct = (value, total) => `${(toNumber(value) / total) * 100}%`;

  return (
    <div className="overflow-auto rounded-2xl bg-slate-100 p-6 flex justify-center">
      <div
        ref={canvasRef}
        className="relative shrink-0 shadow-lg rounded-xl outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
        style={{ width: BASE_CANVAS_WIDTH * zoom }}
        tabIndex={0}
        onKeyDown={onKeyDown}
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

          {items.map((item) => {
            const isSel = sameSelection(item.sel, selected);
            const isInvalid = invalid.has(item.outsideLabel);
            const box = item.box;
            return (
              <div
                key={`${item.sel.type}-${item.sel.index ?? item.sel.id}`}
                role="button"
                tabIndex={-1}
                aria-label={`${item.label}${isSel ? ' (selected)' : ''}`}
                onPointerDown={(e) => startDrag(e, item)}
                className={`absolute cursor-move ${
                  isSel
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
                }}
              >
                {isSel && (
                  <>
                    <span className="pointer-events-none absolute -top-5 left-0 whitespace-nowrap rounded bg-indigo-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {item.label}
                    </span>
                    {(item.kind === 'FIELD' ? SIDE_HANDLES : CORNER_HANDLES).map((handle) => (
                      <span
                        key={handle}
                        onPointerDown={(e) => startDrag(e, item, handle)}
                        className={`absolute h-2.5 w-2.5 rounded-sm border border-indigo-600 bg-white ${HANDLE_POSITION[handle]}`}
                      />
                    ))}
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
  );
};

export default DesignerCanvas;

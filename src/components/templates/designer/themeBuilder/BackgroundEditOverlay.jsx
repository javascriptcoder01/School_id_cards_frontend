// BackgroundEditOverlay.jsx — "Edit on card": background layer ko seedha card par edit.
// CURVE: points (gol) + bezier handles (chaukor, guide lines). Drag (mouse + touch), line par double-click /
//   long-press = naya point, Delete = point hatao (min 2), Shift-click = seedhi line, double-click point = smooth / seedha.
// SHAPE: box khiskao + kono se resize.
// Ye overlay card ke upar sab pointer events le leta hai → purana element drag / resize / rotate code bilkul alag rehta hai.
// Drag updates requestAnimationFrame se (ek frame mein ek hi form update).
import React, { useEffect, useRef, useState } from 'react';
import { Check, FlipHorizontal2, Spline, Trash2 } from 'lucide-react';
import {
  THEME_CURVE_FILL_TO_LABELS,
  THEME_CURVE_FILL_TO_VALUES,
  THEME_LAYER_LIMITS,
  THEME_LAYER_TYPES,
} from '../../../../constants/themeBuilder.js';
import {
  CURVE_PRESETS,
  insertPointOnCurve,
  mirrorHorizontally,
  moveHandle,
  movePoint,
  nearestOnCurve,
  removePoint,
  smoothAll,
  withoutHandles,
} from '../../../../utils/curveEditing.js';
import { snapTo } from '../../../../utils/templateDesigner.js';
import { smallButtonClass } from './builderShared.js';

const LIMITS = THEME_LAYER_LIMITS;
const LONG_PRESS_MS = 500;
const LONG_PRESS_MOVE_PX = 6;
const SHAPE_MIN = 0.02;
const round4 = (v) => Math.round(v * 10000) / 10000;

const hasIn = (p) => typeof p.cx1 === 'number' && typeof p.cy1 === 'number';
const hasOut = (p) => typeof p.cx2 === 'number' && typeof p.cy2 === 'number';

// Renderer jaisa path (0..100 viewBox)
const curvePathD = (points, closed) => {
  if (points.length < 2) return '';
  const P = (v) => round4(v * 100);
  const seg = (a, b) =>
    !hasOut(a) && !hasIn(b)
      ? `L${P(b.x)} ${P(b.y)}`
      : `C${P(hasOut(a) ? a.cx2 : a.x)} ${P(hasOut(a) ? a.cy2 : a.y)} ${P(hasIn(b) ? b.cx1 : b.x)} ${P(hasIn(b) ? b.cy1 : b.y)} ${P(b.x)} ${P(b.y)}`;
  let d = `M${P(points[0].x)} ${P(points[0].y)}`;
  for (let i = 1; i < points.length; i += 1) d += seg(points[i - 1], points[i]);
  if (closed) d += `${seg(points[points.length - 1], points[0])}Z`;
  return d;
};

const pct = (v) => `${v * 100}%`;

/* ---------------- Toolbar (canvas ke upar) ---------------- */

/**
 * @param {object} props
 * @param {object} props.layer
 * @param {number} props.selectedPoint
 * @param {(patch: object) => void} props.onPatch
 * @param {(index: number) => void} props.onSelectPoint
 * @param {() => void} props.onDone
 */
export const BackgroundEditToolbar = ({ layer, selectedPoint, onPatch, onSelectPoint, onDone }) => {
  const isCurve = layer.type === THEME_LAYER_TYPES.CURVE;
  const path = layer.path || { points: [], closed: false, fillTo: 'NONE' };
  const points = path.points || [];
  const setPath = (patch) => onPatch({ path: { ...path, ...patch } });

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-indigo-200 bg-white/95 px-2 py-1.5 shadow-sm">
      <span className="mr-1 inline-flex items-center gap-1 rounded-lg bg-linear-to-r from-indigo-600 to-violet-600 px-2 py-0.5 text-[11px] font-bold text-white">
        <Spline className="h-3 w-3" /> {layer.name || (isCurve ? 'Custom curve' : 'Shape')}
      </span>
      {isCurve && (
        <>
          <button type="button" className={smallButtonClass} aria-pressed={path.closed === true} onClick={() => setPath({ closed: !path.closed })}>
            {path.closed ? 'Open shape' : 'Close shape'}
          </button>
          {!path.closed && (
            <label className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600">
              Fill to
              <select
                value={path.fillTo || 'NONE'}
                onChange={(e) => setPath({ fillTo: e.target.value })}
                className="rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-[11px]"
              >
                {THEME_CURVE_FILL_TO_VALUES.map((key) => (
                  <option key={key} value={key}>{THEME_CURVE_FILL_TO_LABELS[key]}</option>
                ))}
              </select>
            </label>
          )}
          <button type="button" className={smallButtonClass} onClick={() => setPath({ points: mirrorHorizontally(points) })}>
            <FlipHorizontal2 className="h-3 w-3" /> Mirror
          </button>
          <button type="button" className={smallButtonClass} onClick={() => setPath({ points: smoothAll(points, path.closed === true) })}>
            Smooth all
          </button>
          <button
            type="button"
            className={smallButtonClass}
            disabled={points.length <= LIMITS.MIN_CURVE_POINTS}
            onClick={() => {
              setPath({ points: removePoint(points, selectedPoint) });
              onSelectPoint(Math.max(0, selectedPoint - 1));
            }}
          >
            <Trash2 className="h-3 w-3" /> Point
          </button>
          <label className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600">
            Start from
            <select
              value=""
              onChange={(e) => {
                const preset = CURVE_PRESETS.find((p) => p.key === e.target.value);
                if (preset) {
                  onPatch({ path: preset.build() });
                  onSelectPoint(0);
                }
              }}
              className="rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-[11px]"
            >
              <option value="">Preset…</option>
              {CURVE_PRESETS.map((p) => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </select>
          </label>
        </>
      )}
      <button type="button" onClick={onDone} className="ml-auto inline-flex items-center gap-1 rounded-lg bg-linear-to-r from-indigo-600 to-violet-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
        <Check className="h-3 w-3" /> Done
      </button>
      <p className="w-full text-[10px] text-slate-500">
        {isCurve
          ? 'Drag points and handles · double-click or long-press the line to add a point · Delete removes a point · Shift-click a point for a straight line · Esc = Done'
          : 'Drag to move · drag a corner to resize · Esc = Done'}
      </p>
    </div>
  );
};

/* ---------------- Overlay (card ke upar) ---------------- */

/**
 * @param {object} props
 * @param {object} props.layer - CURVE ya SHAPE layer
 * @param {number} props.cardWidth - template units
 * @param {number} props.cardHeight
 * @param {boolean} props.snap
 * @param {number} props.grid - template units
 * @param {number} props.selectedPoint
 * @param {(index: number) => void} props.onSelectPoint
 * @param {(patch: object) => void} props.onPatch
 * @param {() => void} props.onDone
 */
export const BackgroundEditOverlay = ({ layer, cardWidth: W, cardHeight: H, snap, grid, selectedPoint, onSelectPoint, onPatch, onDone }) => {
  const rootRef = useRef(null);
  const dragRef = useRef(null);
  const frameRef = useRef(0);
  const pendingRef = useRef(null);
  const pressRef = useRef(null);
  // Point par capture ke baad double-click root par aata hai → kaun sa point dabaya tha
  const lastPointRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const isCurve = layer.type === THEME_LAYER_TYPES.CURVE;
  const path = layer.path || { points: [], closed: false };
  const points = path.points || [];
  const closed = path.closed === true;

  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true });
    // Mobile par panel neeche ho sakta hai: card dikhao
    rootRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
    return () => {
      cancelAnimationFrame(frameRef.current);
      clearTimeout(pressRef.current?.timer);
    };
  }, []);

  // Ek frame mein ek hi update (slider / drag smooth)
  const schedule = (patch) => {
    pendingRef.current = patch;
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      const next = pendingRef.current;
      pendingRef.current = null;
      if (next) onPatch(next);
    });
  };
  const flush = () => {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = 0;
    if (pendingRef.current) onPatch(pendingRef.current);
    pendingRef.current = null;
  };

  // Pointer → normalised (Snap: grid par, Alt = snap band)
  const normFrom = (event) => {
    const rect = rootRef.current.getBoundingClientRect();
    let x = (event.clientX - rect.left) / rect.width;
    let y = (event.clientY - rect.top) / rect.height;
    if (snap && !event.altKey && W > 0 && H > 0) {
      x = snapTo(x * W, grid) / W;
      y = snapTo(y * H, grid) / H;
    }
    return { x: round4(x), y: round4(y) };
  };

  const begin = (event, info) => {
    if (event.button !== undefined && event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    rootRef.current.setPointerCapture(event.pointerId);
    dragRef.current = info;
    setDragging(true);
  };

  const onPointerMove = (event) => {
    const press = pressRef.current;
    if (press && Math.hypot(event.clientX - press.x, event.clientY - press.y) > LONG_PRESS_MOVE_PX) {
      clearTimeout(press.timer);
      pressRef.current = null;
    }
    const drag = dragRef.current;
    if (!drag) return;
    const at = normFrom(event);
    if (drag.kind === 'point') {
      const next = drag.startPoints.map((p, i) => (i === drag.index ? movePoint(p, at.x, at.y) : p));
      schedule({ path: { ...path, points: next } });
    } else if (drag.kind === 'handle') {
      const next = drag.startPoints.map((p, i) => (i === drag.index ? moveHandle(p, drag.which, at.x, at.y, !event.altKey) : p));
      schedule({ path: { ...path, points: next } });
    } else if (drag.kind === 'box') {
      const dx = at.x - drag.start.x;
      const dy = at.y - drag.start.y;
      const b = drag.box;
      if (!drag.corner) {
        schedule({ x: round4(clampPos(b.x + dx)), y: round4(clampPos(b.y + dy)) });
      } else {
        let { x, y, w, h } = b;
        if (drag.corner.includes('e')) w = Math.max(SHAPE_MIN, b.w + dx);
        if (drag.corner.includes('s')) h = Math.max(SHAPE_MIN, b.h + dy);
        if (drag.corner.includes('w')) {
          w = Math.max(SHAPE_MIN, b.w - dx);
          x = b.x + b.w - w;
        }
        if (drag.corner.includes('n')) {
          h = Math.max(SHAPE_MIN, b.h - dy);
          y = b.y + b.h - h;
        }
        schedule({ x: round4(clampPos(x)), y: round4(clampPos(y)), w: round4(Math.min(LIMITS.SIZE_MAX, w)), h: round4(Math.min(LIMITS.SIZE_MAX, h)) });
      }
    }
  };

  const endDrag = () => {
    if (pressRef.current) {
      clearTimeout(pressRef.current.timer);
      pressRef.current = null;
    }
    if (!dragRef.current) return;
    dragRef.current = null;
    setDragging(false);
    flush();
  };

  const addPointAt = (at) => {
    if (points.length >= LIMITS.MAX_CURVE_POINTS) return;
    const near = nearestOnCurve(points, closed, at, H / W);
    if (!near) return;
    const result = insertPointOnCurve(points, closed, near.segment, near.t);
    if (result.index < 0) return;
    onPatch({ path: { ...path, points: result.points } });
    onSelectPoint(result.index);
  };

  const toggleSmooth = (index) => {
    const p = points[index];
    const next = hasIn(p) || hasOut(p)
      ? points.map((q, i) => (i === index ? withoutHandles(q) : q))
      : points.map((q, i) => (i === index ? smoothAll(points, closed)[index] : q));
    onPatch({ path: { ...path, points: next } });
  };

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onDone();
      return;
    }
    if (!isCurve) return;
    if ((event.key === 'Delete' || event.key === 'Backspace') && points.length > LIMITS.MIN_CURVE_POINTS) {
      event.preventDefault();
      event.stopPropagation();
      onPatch({ path: { ...path, points: removePoint(points, selectedPoint) } });
      onSelectPoint(Math.max(0, selectedPoint - 1));
      return;
    }
    const arrows = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (arrows[event.key] && points[selectedPoint]) {
      event.preventDefault();
      event.stopPropagation();
      const [ax, ay] = arrows[event.key];
      const p = points[selectedPoint];
      const next = points.map((q, i) => (i === selectedPoint ? movePoint(q, p.x + (ax * grid) / W, p.y + (ay * grid) / H) : q));
      onPatch({ path: { ...path, points: next } });
    }
  };

  const sel = points[selectedPoint];

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      role="application"
      aria-label={isCurve ? 'Curve editor on the card' : 'Shape editor on the card'}
      className={`absolute inset-0 z-20 select-none touch-none rounded-xl outline-hidden ring-2 ring-indigo-400/70 ${dragging ? 'cursor-grabbing' : ''}`}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      onDoubleClick={() => {
        if (isCurve && lastPointRef.current !== null && points[lastPointRef.current]) toggleSmooth(lastPointRef.current);
      }}
    >
      {isCurve && (
        <>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
            {/* Line par click area (double-click / long-press = naya point) */}
            <path
              d={curvePathD(points, closed)}
              fill="none"
              stroke="transparent"
              strokeWidth="16"
              vectorEffect="non-scaling-stroke"
              style={{ pointerEvents: 'stroke', cursor: 'copy' }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                addPointAt(normFrom(e));
              }}
              onPointerDown={(e) => {
                lastPointRef.current = null;
                if (e.pointerType === 'mouse') return;
                const at = normFrom(e);
                pressRef.current = {
                  x: e.clientX,
                  y: e.clientY,
                  timer: setTimeout(() => {
                    pressRef.current = null;
                    addPointAt(at);
                  }, LONG_PRESS_MS),
                };
              }}
            />
            <path d={curvePathD(points, closed)} fill="none" stroke="#4F46E5" strokeWidth="1.5" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
            {sel && hasIn(sel) && <line x1={sel.x * 100} y1={sel.y * 100} x2={sel.cx1 * 100} y2={sel.cy1 * 100} stroke="#7C3AED" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
            {sel && hasOut(sel) && <line x1={sel.x * 100} y1={sel.y * 100} x2={sel.cx2 * 100} y2={sel.cy2 * 100} stroke="#7C3AED" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
          </svg>

          {points.map((p, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Curve point ${i + 1}`}
              aria-pressed={i === selectedPoint}
              onPointerDown={(e) => {
                onSelectPoint(i);
                lastPointRef.current = i;
                if (e.shiftKey) {
                  e.preventDefault();
                  e.stopPropagation();
                  onPatch({ path: { ...path, points: points.map((q, j) => (j === i ? withoutHandles(q) : q)) } });
                  return;
                }
                begin(e, { kind: 'point', index: i, startPoints: points });
              }}
              className={`absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow-sm before:absolute before:-inset-2.5 before:content-[''] ${i === selectedPoint ? 'border-white bg-indigo-600 ring-2 ring-indigo-300' : 'border-indigo-600 bg-white'}`}
              style={{ left: pct(p.x), top: pct(p.y) }}
            />
          ))}

          {sel &&
            [
              ['in', hasIn(sel), sel.cx1, sel.cy1],
              ['out', hasOut(sel), sel.cx2, sel.cy2],
            ].map(([which, present, hx, hy]) =>
              present ? (
                <button
                  key={which}
                  type="button"
                  aria-label={`${which === 'in' ? 'Incoming' : 'Outgoing'} curve handle`}
                  onPointerDown={(e) => begin(e, { kind: 'handle', index: selectedPoint, which, startPoints: points })}
                  className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 border-2 border-violet-600 bg-white before:absolute before:-inset-3 before:content-['']"
                  style={{ left: pct(hx), top: pct(hy) }}
                />
              ) : null
            )}
        </>
      )}

      {!isCurve && (
        <div
          role="presentation"
          className="absolute cursor-move border-2 border-dashed border-indigo-500 bg-indigo-500/5"
          style={{ left: pct(layer.x ?? 0), top: pct(layer.y ?? 0), width: pct(layer.w ?? 1), height: pct(layer.h ?? 1) }}
          onPointerDown={(e) => begin(e, { kind: 'box', corner: null, start: normFrom(e), box: { x: layer.x ?? 0, y: layer.y ?? 0, w: layer.w ?? 1, h: layer.h ?? 1 } })}
        >
          {['nw', 'ne', 'sw', 'se'].map((corner) => (
            <span
              key={corner}
              role="presentation"
              onPointerDown={(e) => begin(e, { kind: 'box', corner, start: normFrom(e), box: { x: layer.x ?? 0, y: layer.y ?? 0, w: layer.w ?? 1, h: layer.h ?? 1 } })}
              className={`absolute h-3 w-3 rounded-sm border-2 border-indigo-600 bg-white before:absolute before:-inset-2.5 before:content-[''] ${corner.includes('n') ? '-top-1.5' : '-bottom-1.5'} ${corner.includes('w') ? '-left-1.5' : '-right-1.5'} ${corner === 'nw' || corner === 'se' ? 'cursor-nwse-resize' : 'cursor-nesw-resize'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const clampPos = (v) => Math.min(LIMITS.POSITION_MAX, Math.max(LIMITS.POSITION_MIN, v));

export default BackgroundEditOverlay;

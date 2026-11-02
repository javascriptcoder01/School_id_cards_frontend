// IdCardFlip.jsx
// Card ka front / back — 3D flip (click / Space / Enter / touch par swipe), Front–Back toggle, "Side by side" view.
// Mobile (sm se chhota): card min(100%, 360px), toggles poori width.
// Purane snapshots (renderData.sides nahi) → purana IdCardPreview (sirf front).
// Pure presentational: Redux nahi.
import React, { useRef, useState } from 'react';
import { RotateCw, Columns2, AlertTriangle } from 'lucide-react';
import IdCardSide from './IdCardSide.jsx';
import IdCardPreview from './IdCardPreview.jsx';

const SIZE_WIDTH = {
  sm: 240,
  md: 340,
  lg: 480,
};

const VIEWS = { FLIP: 'FLIP', SIDE_BY_SIDE: 'SIDE_BY_SIDE' };

// Desktop: size wali width (container se zyada nahi); sm se chhota: min(100%, 360px)
const CARD_WIDTH_CLASS = 'w-[min(100%,var(--card-w))] max-sm:w-[min(100%,360px)]';
// Itna aadha khiskao (px) to swipe = flip
const SWIPE_MIN_PX = 40;

const toggleClass = (active, disabled) =>
  `px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
    active ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-800'
  } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`;

const WarningGroups = ({ renderData }) => {
  const bySide = renderData?.warningsBySide;
  const groups = bySide
    ? [
      { label: 'Front', items: bySide.front || [] },
      { label: 'Back', items: bySide.back || [] },
    ]
    : [{ label: 'Front', items: renderData?.warnings || [] }];
  const visible = groups.filter((group) => group.items.length > 0);
  if (visible.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 space-y-1.5" role="status">
      {visible.map((group) => (
        <div key={group.label}>
          <p className="flex items-center gap-1.5 font-semibold">
            <AlertTriangle className="h-3.5 w-3.5" /> {group.label}
          </p>
          <ul className="ml-5 list-disc">
            {group.items.map((item) => (
              <li key={item}>{item.replace(/^Back: /, '')}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

/**
 * @param {object} props
 * @param {object} props.renderData - Backend renderData
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {'FRONT'|'BACK'} [props.initialSide='FRONT']
 * @param {boolean} [props.showToggle=true] - Front / Back / Side by side buttons
 * @param {boolean} [props.showWarnings=true]
 * @param {string} [props.className]
 */
export const IdCardFlip = ({
  renderData,
  size = 'md',
  initialSide = 'FRONT',
  showToggle = true,
  showWarnings = true,
  className = '',
}) => {
  const hasSides = Boolean(renderData?.sides?.front);
  const hasBack = Boolean(renderData?.sides?.back);
  const [isBack, setIsBack] = useState(initialSide === 'BACK');
  const [view, setView] = useState(VIEWS.FLIP);
  const width = SIZE_WIDTH[size] || SIZE_WIDTH.md;
  const showingBack = hasBack && isBack;

  const swipeRef = useRef(null);
  const swipedRef = useRef(false);

  const flip = () => {
    if (hasBack) setIsBack((prev) => !prev);
  };

  // Touch / pen: left-right swipe se flip (mouse par sirf click)
  const onPointerDown = (event) => {
    swipeRef.current = event.pointerType === 'mouse' ? null : { x: event.clientX, y: event.clientY };
  };
  const onPointerUp = (event) => {
    const start = swipeRef.current;
    swipeRef.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) >= SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy)) {
      swipedRef.current = true;
      flip();
    }
  };
  const onClick = () => {
    // Swipe ke baad aane wala click dobara flip na kare
    if (swipedRef.current) {
      swipedRef.current = false;
      return;
    }
    flip();
  };

  const onKeyDown = (event) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      flip();
    }
  };

  // Purana snapshot: sirf front, purana renderer
  if (!hasSides) {
    return (
      <div className={`space-y-2 ${className}`}>
        <IdCardPreview renderData={renderData} width={width} showWarnings={showWarnings} className="rounded-xl overflow-hidden shadow-sm" />
        <p className="text-xs text-slate-500">No back side in this template</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {showToggle && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 max-sm:grid max-sm:w-full max-sm:grid-cols-2" role="group" aria-label="Card side">
            <button
              type="button"
              onClick={() => {
                setView(VIEWS.FLIP);
                setIsBack(false);
              }}
              className={toggleClass(view === VIEWS.FLIP && !showingBack, false)}
              aria-pressed={view === VIEWS.FLIP && !showingBack}
            >
              Front
            </button>
            <button
              type="button"
              onClick={() => {
                setView(VIEWS.FLIP);
                setIsBack(true);
              }}
              disabled={!hasBack}
              className={toggleClass(view === VIEWS.FLIP && showingBack, !hasBack)}
              aria-pressed={view === VIEWS.FLIP && showingBack}
            >
              Back
            </button>
          </div>
          <button
            type="button"
            onClick={() => setView((v) => (v === VIEWS.SIDE_BY_SIDE ? VIEWS.FLIP : VIEWS.SIDE_BY_SIDE))}
            disabled={!hasBack}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors max-sm:w-full max-sm:justify-center ${
              view === VIEWS.SIDE_BY_SIDE
                ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            aria-pressed={view === VIEWS.SIDE_BY_SIDE}
          >
            <Columns2 className="h-3.5 w-3.5" /> Side by side
          </button>
        </div>
      )}

      {view === VIEWS.SIDE_BY_SIDE && hasBack ? (
        <div className="flex flex-wrap gap-3">
          {['FRONT', 'BACK'].map((side) => (
            <figure key={side} className={`space-y-1 ${CARD_WIDTH_CLASS}`} style={{ '--card-w': `${width}px` }}>
              <div className="rounded-xl overflow-hidden shadow-sm ring-1 ring-slate-200">
                <IdCardSide renderData={renderData} side={side} />
              </div>
              <figcaption className="text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {side === 'FRONT' ? 'Front' : 'Back'}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <div className={CARD_WIDTH_CLASS} style={{ '--card-w': `${width}px`, perspective: '1200px' }}>
          <div
            role="button"
            tabIndex={0}
            aria-pressed={showingBack}
            aria-disabled={!hasBack}
            aria-label={hasBack ? (showingBack ? 'Show front side' : 'Show back side') : 'ID card front (no back side)'}
            onClick={onClick}
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => {
              swipeRef.current = null;
            }}
            className={`relative grid rounded-xl touch-pan-y focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-transform duration-[600ms] ease-in-out motion-reduce:transition-none ${
              hasBack ? 'cursor-pointer' : 'cursor-default'
            }`}
            style={{ transformStyle: 'preserve-3d', transform: showingBack ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          >
            <div
              className="col-start-1 row-start-1 rounded-xl overflow-hidden shadow-sm ring-1 ring-slate-200"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              <IdCardSide renderData={renderData} side="FRONT" />
            </div>
            {hasBack && (
              <div
                className="col-start-1 row-start-1 rounded-xl overflow-hidden shadow-sm ring-1 ring-slate-200"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <IdCardSide renderData={renderData} side="BACK" />
              </div>
            )}
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
            {hasBack ? (
              <>
                <RotateCw className="h-3 w-3" />
                <span className="pointer-coarse:hidden">Click or press Space to flip</span>
                <span className="hidden pointer-coarse:inline">Tap or swipe to flip</span>
              </>
            ) : (
              'No back side in this template'
            )}
          </p>
        </div>
      )}

      {showWarnings && <WarningGroups renderData={renderData} />}
    </div>
  );
};

export default IdCardFlip;

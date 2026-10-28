import React, { memo } from 'react';
import { pct } from '../../../utils/templateLayout.js';

// Fixed placeholder pattern (asli QR card generate hote waqt banta hai)
const SIZE = 21;
// Teen corner "finder" squares + baaki deterministic dots
const finderOrigin = (r, c) => {
    if (r < 7 && c < 7) return [0, 0];
    if (r < 7 && c >= SIZE - 7) return [0, SIZE - 7];
    if (r >= SIZE - 7 && c < 7) return [SIZE - 7, 0];
    return null;
};
const isFinderOn = (r, c, [r0, c0]) => {
    const rr = r - r0;
    const cc = c - c0;
    const ring = rr === 0 || rr === 6 || cc === 0 || cc === 6;
    const core = rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4;
    return ring || core;
};
const CELLS = [];
for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
        const origin = finderOrigin(r, c);
        const on = origin ? isFinderOn(r, c, origin) : (r * 7 + c * 13 + r * c) % 3 === 0;
        if (on) CELLS.push([r, c]);
    }
}

export const QrCodeBox = memo(
    ({ qrCode, cardWidth = 86, cardHeight = 54, isSelected = false, isDesignMode = true, onSelect }) => {
        if (!qrCode || qrCode.visible === false) return null;

        return (
            <div
                onClick={(e) => {
                    if (isDesignMode) {
                        e.stopPropagation();
                        onSelect?.();
                    }
                }}
                style={{
                    left: pct(qrCode.x, cardWidth),
                    top: pct(qrCode.y, cardHeight),
                    width: pct(qrCode.width, cardWidth),
                    height: pct(qrCode.height, cardHeight),
                    zIndex: isSelected ? 45 : 15,
                }}
                className={`absolute bg-white p-[3%] select-none ${isDesignMode ? 'cursor-pointer' : ''} ${isSelected && isDesignMode ? 'outline-2 outline-indigo-600 outline-offset-1' : ''
                    }`}
                title={isDesignMode ? 'QR code' : undefined}
            >
                <svg viewBox={`0 0 ${SIZE} ${SIZE}`} preserveAspectRatio="none" className="w-full h-full" aria-hidden="true">
                    {CELLS.map(([r, c]) => (
                        <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#0f172a" />
                    ))}
                </svg>
            </div>
        );
    }
);

QrCodeBox.displayName = 'QrCodeBox';

export default QrCodeBox;
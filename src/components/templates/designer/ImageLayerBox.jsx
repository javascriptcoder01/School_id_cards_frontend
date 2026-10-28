import React, { memo, useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';
import { TEMPLATE_IMAGE_LAYER_LABELS } from '../../../constants/template.js';
import { pct, toNumber } from '../../../utils/templateLayout.js';

/** Logo / Signature / Stamp / Custom image placed on the card */
export const ImageLayerBox = memo(
    ({ layer, cardWidth = 86, cardHeight = 54, isSelected = false, isDesignMode = true, onSelect }) => {
        const [failed, setFailed] = useState(false);
        useEffect(() => setFailed(false), [layer?.url]);

        if (!layer || layer.visible === false) return null;

        const zIndex = toNumber(layer.zIndex, 10);

        return (
            <div
                onClick={(e) => {
                    if (isDesignMode) {
                        e.stopPropagation();
                        onSelect?.();
                    }
                }}
                style={{
                    left: pct(layer.x, cardWidth),
                    top: pct(layer.y, cardHeight),
                    width: pct(layer.width, cardWidth),
                    height: pct(layer.height, cardHeight),
                    opacity: toNumber(layer.opacity, 1),
                    transform: `rotate(${toNumber(layer.rotation)}deg)`,
                    // fields (50) ke neeche, selected ho to sabse upar
                    zIndex: isSelected ? 55 : Math.min(zIndex, 49),
                }}
                className={`absolute select-none ${isDesignMode ? 'cursor-pointer' : ''} ${isSelected && isDesignMode
                    ? 'outline-2 outline-indigo-600 outline-offset-1'
                    : isDesignMode
                        ? 'outline-1 outline-dashed outline-slate-400/70'
                        : ''
                    }`}
                title={isDesignMode ? TEMPLATE_IMAGE_LAYER_LABELS[layer.type] : undefined}
            >
                {layer.url && !failed ? (
                    <img
                        src={layer.url}
                        alt=""
                        draggable={false}
                        className="w-full h-full object-contain pointer-events-none"
                        onError={() => setFailed(true)}
                    />
                ) : (
                    <div className="w-full h-full grid place-items-center bg-slate-100/80 text-slate-400">
                        <ImageOff className="w-1/2 h-1/2 max-w-6 max-h-6" aria-hidden="true" />
                    </div>
                )}
            </div>
        );
    }
);

ImageLayerBox.displayName = 'ImageLayerBox';

export default ImageLayerBox;
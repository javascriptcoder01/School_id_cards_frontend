import React from 'react';
import PhotoBox from './PhotoBox.jsx';
import QrCodeBox from './QrCodeBox.jsx';
import ImageLayerBox from './ImageLayerBox.jsx';
import DesignerElement from './DesignerElement.jsx';
import {
    TEMPLATE_BACKGROUND_FITS,
    TEMPLATE_IMAGE_LAYER_TYPES,
    TEMPLATE_UNITS,
    DESIGNER_ELEMENT_TYPES,
} from '../../../constants/template.js';
import { isSafeImageUrl, getLayerKey, toNumber } from '../../../utils/templateLayout.js';

const FIT_CLASS = {
    [TEMPLATE_BACKGROUND_FITS.COVER]: 'object-cover',
    [TEMPLATE_BACKGROUND_FITS.CONTAIN]: 'object-contain',
    [TEMPLATE_BACKGROUND_FITS.STRETCH]: 'object-fill',
};

/**
 * Card ka asli render (letterhead, photo, QR, image layers, text fields).
 * Designer canvas aur Live Preview dono isi ko use karte hain, taaki dono hamesha same dikhein.
 * Sizes `cqw` (card width ka %) mein hain, isliye zoom par sab proportion mein rehta hai.
 */
export const CardSurface = ({
    template,
    widthPx = null,
    isDesignMode = false,
    selectedElement = null,
    onSelectElement,
    className = '',
}) => {
    if (!template) return null;

    const width = toNumber(template.width, 86) || 86;
    const height = toNumber(template.height, 54) || 54;
    const unit = template.unit || TEMPLATE_UNITS.PX;

    const primaryColor = template.primaryColor || '#4F46E5';
    const secondaryColor = template.secondaryColor || '#9333EA';
    const accent = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;

    const background = isSafeImageUrl(template.background) ? template.background : null;
    const layers = Array.isArray(template.imageLayers) ? template.imageLayers : [];
    const hasLogoLayer = layers.some((l) => l.type === TEMPLATE_IMAGE_LAYER_TYPES.LOGO);
    // Purana `logo` field sirf tab dikhao jab naya LOGO layer na ho
    const legacyLogo = !hasLogoLayer && isSafeImageUrl(template.logo) ? template.logo : null;

    const isSelected = (type, id) =>
        selectedElement?.type === type && (id === undefined || selectedElement?.id === id);
    const select = (type, id) => () => onSelectElement?.({ type, id });

    return (
        <div
            style={{
                width: widthPx ? `${widthPx}px` : '100%',
                maxWidth: '100%',
                aspectRatio: `${width} / ${height}`,
                containerType: 'inline-size',
            }}
            className={`relative overflow-hidden bg-white select-none ${className}`}
        >
            {/* Letterhead / background */}
            {background ? (
                <img
                    src={background}
                    alt=""
                    className={`absolute inset-0 w-full h-full pointer-events-none ${FIT_CLASS[template.backgroundFit] || 'object-cover'
                        }`}
                />
            ) : (
                <>
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white to-slate-50" />
                    {/* Letterhead na ho to theme colors se halki decoration */}
                    <div className="absolute top-0 left-0 w-full pointer-events-none" style={{ height: '3%', background: accent }} />
                    <div className="absolute bottom-0 left-0 w-full pointer-events-none" style={{ height: '2%', background: accent }} />
                </>
            )}

            {legacyLogo && (
                <img
                    src={legacyLogo}
                    alt=""
                    className="absolute pointer-events-none object-contain"
                    style={{ top: '4%', left: '4%', height: '14%', maxWidth: '35%', zIndex: 5 }}
                />
            )}

            {layers.map((layer) => {
                const key = getLayerKey(layer);
                return (
                    <ImageLayerBox
                        key={key}
                        layer={layer}
                        cardWidth={width}
                        cardHeight={height}
                        isDesignMode={isDesignMode}
                        isSelected={isSelected(DESIGNER_ELEMENT_TYPES.LAYER, key)}
                        onSelect={select(DESIGNER_ELEMENT_TYPES.LAYER, key)}
                    />
                );
            })}

            {template.photo && (
                <PhotoBox
                    photo={template.photo}
                    cardWidth={width}
                    cardHeight={height}
                    isDesignMode={isDesignMode}
                    isSelected={isSelected(DESIGNER_ELEMENT_TYPES.PHOTO)}
                    onSelect={select(DESIGNER_ELEMENT_TYPES.PHOTO, 'photo')}
                />
            )}

            {template.qrCode && (
                <QrCodeBox
                    qrCode={template.qrCode}
                    cardWidth={width}
                    cardHeight={height}
                    isDesignMode={isDesignMode}
                    isSelected={isSelected(DESIGNER_ELEMENT_TYPES.QR)}
                    onSelect={select(DESIGNER_ELEMENT_TYPES.QR, 'qrCode')}
                />
            )}

            {(template.fields || []).map((field) => (
                <DesignerElement
                    key={field.field}
                    field={field}
                    unit={unit}
                    cardWidth={width}
                    cardHeight={height}
                    isDesignMode={isDesignMode}
                    isSelected={isSelected(DESIGNER_ELEMENT_TYPES.FIELD, field.field)}
                    onSelect={select(DESIGNER_ELEMENT_TYPES.FIELD, field.field)}
                />
            ))}
        </div>
    );
};

export default CardSurface;
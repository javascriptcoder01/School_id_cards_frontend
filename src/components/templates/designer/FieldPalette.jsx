import React from 'react';
import {
  Layers,
  Image as ImageIcon,
  QrCode,
  CheckCircle,
  PlusCircle,
  PenTool,
  Stamp,
  Shapes,
  School,
  Loader2,
} from 'lucide-react';
import {
  TEMPLATE_FIELD_LABELS,
  TEMPLATE_PALETTE_FIELD_VALUES,
  TEMPLATE_IMAGE_LAYER_TYPE_VALUES,
  TEMPLATE_IMAGE_LAYER_LABELS,
  TEMPLATE_IMAGE_LAYER_ASSET_TYPE,
  TEMPLATE_MAX_IMAGE_LAYERS,
  TEMPLATE_MAX_FIELDS,
  DESIGNER_ELEMENT_TYPES,
} from '../../../constants/template.js';
import { getLayerKey } from '../../../utils/templateLayout.js';

const LAYER_ICONS = { LOGO: School, SIGNATURE: PenTool, STAMP: Stamp, CUSTOM: Shapes };

const SectionTitle = ({ children }) => (
  <div className="pt-3 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{children}</div>
);

const ItemButton = ({ isSelected, onClick, disabled, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`w-full flex items-center justify-between gap-2 p-2 rounded-xl text-xs text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isSelected
        ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 font-bold'
        : 'hover:bg-slate-50 text-slate-700 font-medium'
      }`}
  >
    {children}
  </button>
);

export const FieldPalette = ({
  formData,
  usableAssets = [],
  assetsLoading = false,
  selectedElement = null,
  onSelectElement,
  onAddField,
  onAddPhoto,
  onAddQrCode,
  onAddLayer,
}) => {
  const fields = formData.fields || [];
  const layers = formData.imageLayers || [];
  const placed = new Set(fields.map((f) => f.field));
  // Legacy fields sirf tab dikhte hain jab template mein pehle se hon
  const fieldOptions = [
    ...TEMPLATE_PALETTE_FIELD_VALUES,
    ...fields.map((f) => f.field).filter((f) => !TEMPLATE_PALETTE_FIELD_VALUES.includes(f)),
  ];
  const isSel = (type, id) => selectedElement?.type === type && (id === undefined || selectedElement?.id === id);
  const layerLimitReached = layers.length >= TEMPLATE_MAX_IMAGE_LAYERS;
  const fieldLimitReached = fields.length >= TEMPLATE_MAX_FIELDS;

  const assetCountFor = (type) => {
    const assetType = TEMPLATE_IMAGE_LAYER_ASSET_TYPE[type];
    return usableAssets.filter((a) => !assetType || a.type === assetType).length;
  };

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <Layers className="w-4 h-4 text-indigo-600" />
        <h3 className="text-sm font-bold text-slate-800">Card Elements</h3>
      </div>

      <div className="space-y-1 max-h-[640px] overflow-y-auto pr-1">
        <SectionTitle>Photo & QR</SectionTitle>
        <ItemButton
          isSelected={isSel(DESIGNER_ELEMENT_TYPES.PHOTO)}
          onClick={() => (formData.photo ? onSelectElement({ type: DESIGNER_ELEMENT_TYPES.PHOTO, id: 'photo' }) : onAddPhoto())}
        >
          <span className="flex items-center gap-2">
            <ImageIcon className="w-3.5 h-3.5 text-slate-400" /> Student Photo
          </span>
          {formData.photo ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />}
        </ItemButton>
        <ItemButton
          isSelected={isSel(DESIGNER_ELEMENT_TYPES.QR)}
          onClick={() => (formData.qrCode ? onSelectElement({ type: DESIGNER_ELEMENT_TYPES.QR, id: 'qrCode' }) : onAddQrCode())}
        >
          <span className="flex items-center gap-2">
            <QrCode className="w-3.5 h-3.5 text-slate-400" /> QR Code
          </span>
          {formData.qrCode ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />}
        </ItemButton>

        <SectionTitle>Logo, Signature & Stamp</SectionTitle>
        {layers.map((layer, i) => {
          const key = getLayerKey(layer);
          const Icon = LAYER_ICONS[layer.type] || Shapes;
          return (
            <ItemButton
              key={key}
              isSelected={isSel(DESIGNER_ELEMENT_TYPES.LAYER, key)}
              onClick={() => onSelectElement({ type: DESIGNER_ELEMENT_TYPES.LAYER, id: key })}
            >
              <span className="flex items-center gap-2 min-w-0">
                <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">
                  {TEMPLATE_IMAGE_LAYER_LABELS[layer.type]} {layers.filter((l) => l.type === layer.type).length > 1 ? i + 1 : ''}
                </span>
              </span>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            </ItemButton>
          );
        })}

        {assetsLoading ? (
          <p className="flex items-center gap-1.5 text-[11px] text-slate-400 px-2 py-1.5">
            <Loader2 className="w-3 h-3 animate-spin" /> Loading college images
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {TEMPLATE_IMAGE_LAYER_TYPE_VALUES.map((type) => {
              const count = assetCountFor(type);
              const Icon = LAYER_ICONS[type] || Shapes;
              const disabled = layerLimitReached || count === 0;
              return (
                <button
                  key={type}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    const key = onAddLayer(type);
                    if (key) onSelectElement({ type: DESIGNER_ELEMENT_TYPES.LAYER, id: key });
                  }}
                  title={
                    count === 0
                      ? `Upload a ${TEMPLATE_IMAGE_LAYER_LABELS[type].toLowerCase()} in the College profile first`
                      : layerLimitReached
                        ? `Maximum ${TEMPLATE_MAX_IMAGE_LAYERS} image layers`
                        : `Add ${TEMPLATE_IMAGE_LAYER_LABELS[type]}`
                  }
                  className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-dashed border-slate-300 text-[11px] font-semibold text-slate-600 hover:border-indigo-400 hover:text-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-300 disabled:hover:text-slate-600"
                >
                  <Icon className="w-3 h-3" />
                  {type === 'CUSTOM' ? 'Custom' : TEMPLATE_IMAGE_LAYER_LABELS[type].split(' ').pop()}
                </button>
              );
            })}
          </div>
        )}

        <SectionTitle>Student Fields</SectionTitle>
        {fieldOptions.map((fieldName) => {
          const isPlaced = placed.has(fieldName);
          return (
            <ItemButton
              key={fieldName}
              isSelected={isSel(DESIGNER_ELEMENT_TYPES.FIELD, fieldName)}
              disabled={!isPlaced && fieldLimitReached}
              onClick={() => {
                if (!isPlaced) onAddField(fieldName);
                onSelectElement({ type: DESIGNER_ELEMENT_TYPES.FIELD, id: fieldName });
              }}
            >
              <span className="truncate">{TEMPLATE_FIELD_LABELS[fieldName] || fieldName}</span>
              {isPlaced ? (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : (
                <PlusCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              )}
            </ItemButton>
          );
        })}
      </div>
    </div>
  );
};

export default FieldPalette;
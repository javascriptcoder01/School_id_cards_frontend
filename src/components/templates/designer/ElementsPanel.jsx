// ElementsPanel.jsx
// Designer ka "Elements" tab: grouped field palette (Student / School / Card / Custom), images
// (Logo / Signature / Stamp / Custom), Photo, QR, is side par lage elements ki list, recommended back layout.
import React from 'react';
import {
  PlusCircle,
  CheckCircle,
  Image as ImageIcon,
  QrCode,
  Stamp,
  PenTool,
  Shapes,
  Loader2,
  LayoutTemplate,
  Type,
} from 'lucide-react';
import {
  DESIGNER_ELEMENT_TYPES,
  TEMPLATE_FIELD_LABELS,
  TEMPLATE_IMAGE_LAYER_LABELS,
  TEMPLATE_IMAGE_LAYER_TYPE_VALUES,
  TEMPLATE_IMAGE_LAYER_ASSET_TYPE,
  TEMPLATE_MAX_IMAGE_LAYERS,
  TEMPLATE_MAX_FIELDS,
  TEMPLATE_REPEATABLE_FIELDS,
} from '../../../constants/template.js';
import { getLayerKey } from '../../../utils/templateLayout.js';

const GROUP_LABELS = { STUDENT: 'Student', SCHOOL: 'School', CARD: 'Card', CUSTOM: 'Custom' };
const LAYER_ICONS = { LOGO: ImageIcon, SIGNATURE: PenTool, STAMP: Stamp, CUSTOM: Shapes };

const titleClass = 'pt-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider';
const itemClass = (active) =>
  `w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors ${
    active ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
  }`;

const isSel = (selected, type, id, index) =>
  selected?.type === type && (index !== undefined ? selected.index === index : selected.id === id);

/**
 * @param {object} props
 * @param {object|null} props.themes - fieldGroups ke liye
 * @param {'FRONT'|'BACK'} props.side
 * @param {object} props.sideData - { fields, photo, qrCode, imageLayers }
 * @param {object[]} props.usableAssets
 * @param {boolean} props.assetsLoading
 * @param {object|null} props.selected
 * @param {(sel: object) => void} props.onSelect
 * @param {(fieldName: string) => void} props.onAddField
 * @param {() => void} props.onAddPhoto
 * @param {() => void} props.onAddQrCode
 * @param {(type: string) => void} props.onAddLayer
 * @param {() => void} [props.onRecommendedBack] - sirf back side
 */
export const ElementsPanel = ({
  themes,
  side,
  sideData,
  usableAssets = [],
  assetsLoading = false,
  selected,
  onSelect,
  onAddField,
  onAddPhoto,
  onAddQrCode,
  onAddLayer,
  onRecommendedBack,
}) => {
  const fields = sideData.fields || [];
  const layers = sideData.imageLayers || [];
  const placed = new Set(fields.map((f) => f.field));
  const groups = themes?.fieldGroups || null;
  const fieldLimit = fields.length >= TEMPLATE_MAX_FIELDS;
  const layerLimit = layers.length >= TEMPLATE_MAX_IMAGE_LAYERS;

  const assetCountFor = (type) => {
    const assetType = TEMPLATE_IMAGE_LAYER_ASSET_TYPE[type];
    return usableAssets.filter((a) => !assetType || a.type === assetType).length;
  };

  return (
    <div className="space-y-1">
      {side === 'BACK' && onRecommendedBack && (
        <button
          type="button"
          onClick={onRecommendedBack}
          className="mb-2 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
        >
          <LayoutTemplate className="h-4 w-4" /> Use recommended back layout
        </button>
      )}

      {/* On this side */}
      <p className={titleClass}>On this side</p>
      {fields.length === 0 && !sideData.photo && !sideData.qrCode && layers.length === 0 && (
        <p className="px-2.5 text-[11px] text-slate-400">Nothing yet — add elements below.</p>
      )}
      {fields.map((f, index) => (
        <button
          key={`${f.field}-${index}`}
          type="button"
          onClick={() => onSelect({ type: DESIGNER_ELEMENT_TYPES.FIELD, id: f.field, index })}
          className={itemClass(isSel(selected, DESIGNER_ELEMENT_TYPES.FIELD, f.field, index))}
        >
          <span className="flex min-w-0 items-center gap-2">
            <Type className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate">
              {f.field === 'customText' ? f.customText || 'Custom text' : TEMPLATE_FIELD_LABELS[f.field] || f.field}
            </span>
          </span>
          {f.visible === false && <span className="text-[10px] text-slate-400">hidden</span>}
        </button>
      ))}
      {sideData.photo && (
        <button type="button" onClick={() => onSelect({ type: DESIGNER_ELEMENT_TYPES.PHOTO, id: 'photo' })} className={itemClass(isSel(selected, DESIGNER_ELEMENT_TYPES.PHOTO, 'photo'))}>
          <span className="flex items-center gap-2"><ImageIcon className="h-3.5 w-3.5 text-slate-400" /> Student photo</span>
        </button>
      )}
      {sideData.qrCode && (
        <button type="button" onClick={() => onSelect({ type: DESIGNER_ELEMENT_TYPES.QR, id: 'qrCode' })} className={itemClass(isSel(selected, DESIGNER_ELEMENT_TYPES.QR, 'qrCode'))}>
          <span className="flex items-center gap-2"><QrCode className="h-3.5 w-3.5 text-slate-400" /> QR code</span>
        </button>
      )}
      {layers.map((layer) => {
        const key = getLayerKey(layer);
        const Icon = LAYER_ICONS[layer.type] || Shapes;
        return (
          <button key={key} type="button" onClick={() => onSelect({ type: DESIGNER_ELEMENT_TYPES.LAYER, id: key })} className={itemClass(isSel(selected, DESIGNER_ELEMENT_TYPES.LAYER, key))}>
            <span className="flex items-center gap-2"><Icon className="h-3.5 w-3.5 text-slate-400" /> {TEMPLATE_IMAGE_LAYER_LABELS[layer.type]}</span>
          </button>
        );
      })}

      {/* Photo + QR */}
      <p className={titleClass}>Photo & QR</p>
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={sideData.photo ? () => onSelect({ type: DESIGNER_ELEMENT_TYPES.PHOTO, id: 'photo' }) : onAddPhoto}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
        >
          {sideData.photo ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> : <PlusCircle className="h-3.5 w-3.5 text-indigo-500" />} Photo
        </button>
        <button
          type="button"
          onClick={sideData.qrCode ? () => onSelect({ type: DESIGNER_ELEMENT_TYPES.QR, id: 'qrCode' }) : onAddQrCode}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
        >
          {sideData.qrCode ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> : <PlusCircle className="h-3.5 w-3.5 text-indigo-500" />} QR code
        </button>
      </div>
      {side === 'BACK' && !sideData.photo && (
        <p className="text-[10px] text-slate-400">Photo is usually only on the front.</p>
      )}

      {/* Images */}
      <p className={titleClass}>Images</p>
      {assetsLoading ? (
        <p className="flex items-center gap-1.5 px-2 text-[11px] text-slate-400">
          <Loader2 className="h-3 w-3 animate-spin" /> Loading school images
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-1.5">
          {TEMPLATE_IMAGE_LAYER_TYPE_VALUES.map((type) => {
            const count = assetCountFor(type);
            const Icon = LAYER_ICONS[type] || Shapes;
            const disabled = count === 0 || layerLimit;
            return (
              <button
                key={type}
                type="button"
                disabled={disabled}
                onClick={() => onAddLayer(type)}
                title={count === 0 ? 'Upload this image in the school profile first' : `Add ${TEMPLATE_IMAGE_LAYER_LABELS[type]}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Icon className="h-3.5 w-3.5 text-indigo-500" /> {TEMPLATE_IMAGE_LAYER_LABELS[type].replace('College ', '')}
              </button>
            );
          })}
        </div>
      )}

      {/* Field palette */}
      {!groups ? (
        <p className="flex items-center gap-1.5 px-2 pt-3 text-[11px] text-slate-400">
          <Loader2 className="h-3 w-3 animate-spin" /> Loading fields
        </p>
      ) : (
        Object.entries(groups).map(([group, names]) => (
          <div key={group}>
            <p className={titleClass}>{GROUP_LABELS[group] || group}</p>
            <div className="flex flex-wrap gap-1.5">
              {names.map((name) => {
                const repeatable = TEMPLATE_REPEATABLE_FIELDS.includes(name);
                const already = placed.has(name) && !repeatable;
                return (
                  <button
                    key={name}
                    type="button"
                    disabled={already || fieldLimit}
                    onClick={() => onAddField(name)}
                    title={already ? 'Already on this side' : `Add ${TEMPLATE_FIELD_LABELS[name] || name}`}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium ${
                      already ? 'border-emerald-200 bg-emerald-50 text-emerald-700 cursor-default' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    } disabled:cursor-not-allowed`}
                  >
                    {already ? <CheckCircle className="h-3 w-3" /> : <PlusCircle className="h-3 w-3 text-indigo-500" />}
                    {TEMPLATE_FIELD_LABELS[name] || name}
                  </button>
                );
              })}
            </div>
          </div>
        ))
      )}
      {fieldLimit && <p className="pt-2 text-[11px] text-amber-700">This side already has {TEMPLATE_MAX_FIELDS} fields.</p>}
    </div>
  );
};

export default ElementsPanel;

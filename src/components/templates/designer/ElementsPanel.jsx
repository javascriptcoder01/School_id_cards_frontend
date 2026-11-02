// ElementsPanel.jsx
// Designer ka "Elements" tab: School Images (school profile ki logo / principal signature / stamp +
// "Principal Sign + Seal", click ya card par drag), is side par lage elements ki list, Photo, QR,
// custom image (uploaded assets), grouped field palette (Student / School / Card / Custom), recommended back layout.
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
  RefreshCw,
  School,
} from 'lucide-react';
import {
  DESIGNER_ELEMENT_TYPES,
  TEMPLATE_FIELD_LABELS,
  TEMPLATE_IMAGE_LAYER_LABELS,
  TEMPLATE_IMAGE_LAYER_TYPES,
  TEMPLATE_IMAGE_LAYER_ASSET_TYPE,
  TEMPLATE_MAX_IMAGE_LAYERS,
  TEMPLATE_MAX_FIELDS,
  TEMPLATE_REPEATABLE_FIELDS,
  TEMPLATE_COLLEGE_PROFILE_IMAGES,
  TEMPLATE_COLLEGE_PROFILE_IMAGE_LABELS,
  SIGN_WITH_SEAL_COMBO,
  SCHOOL_IMAGE_DRAG_TYPE,
  isProfileImageLayer,
} from '../../../constants/template.js';
import { getLayerKey, isSafeImageUrl } from '../../../utils/templateLayout.js';

const GROUP_LABELS = { STUDENT: 'Student', SCHOOL: 'School', CARD: 'Card', CUSTOM: 'Custom' };
const LAYER_ICONS = { LOGO: ImageIcon, SIGNATURE: PenTool, STAMP: Stamp, CUSTOM: Shapes };

const titleClass = 'pt-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider';
const itemClass = (active) =>
  `w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors ${
    active ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
  }`;

const isSel = (selected, type, id, index) =>
  selected?.type === type && (index !== undefined ? selected.index === index : selected.id === id);

const PROFILE_ICONS = {
  [TEMPLATE_COLLEGE_PROFILE_IMAGES.LOGO]: ImageIcon,
  [TEMPLATE_COLLEGE_PROFILE_IMAGES.PRINCIPAL_SIGNATURE]: PenTool,
  [TEMPLATE_COLLEGE_PROFILE_IMAGES.STAMP]: Stamp,
};

const Thumb = ({ url, icon: Icon, className = '' }) =>
  isSafeImageUrl(url) ? (
    <img src={url} alt="" draggable={false} className={`max-h-full max-w-full object-contain ${className}`} />
  ) : (
    <Icon className="h-5 w-5 text-slate-300" />
  );

/**
 * School Images tile: click = add (ya added ho to select), drag = card par jahan chhodo wahan.
 */
const SchoolImageTile = ({ dragKey, label, preview, available, added, note, disabled, onAdd, onSelectAdded }) => {
  const canAdd = available && !added && !disabled;
  const status = added ? 'Added' : !available ? note || 'Not uploaded — ask Super Admin' : disabled ? 'Image limit reached' : 'Click or drag to card';
  return (
    <button
      type="button"
      draggable={canAdd}
      onDragStart={(e) => {
        e.dataTransfer.setData(SCHOOL_IMAGE_DRAG_TYPE, dragKey);
        e.dataTransfer.effectAllowed = 'copy';
      }}
      disabled={!added && !canAdd}
      onClick={added ? onSelectAdded : onAdd}
      title={added ? `${label} is on this side — click to select it` : status}
      className={`flex flex-col items-stretch gap-1.5 rounded-xl border p-2 text-left transition-colors disabled:cursor-not-allowed ${
        added
          ? 'border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50'
          : canAdd
            ? 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 cursor-grab active:cursor-grabbing'
            : 'border-dashed border-slate-200 bg-slate-50 opacity-70'
      }`}
    >
      <span className="relative flex h-12 items-center justify-center overflow-hidden rounded-lg bg-slate-50">{preview}</span>
      <span className="truncate text-[11px] font-semibold text-slate-700">{label}</span>
      <span
        className={`flex items-start gap-1 text-[10px] leading-tight ${
          added ? 'text-emerald-700' : available ? 'text-slate-400' : 'text-amber-700'
        }`}
      >
        {added && <CheckCircle className="h-3 w-3 shrink-0" />}
        {status}
      </span>
    </button>
  );
};

/**
 * @param {object} props
 * @param {object|null} props.themes - fieldGroups ke liye
 * @param {'FRONT'|'BACK'} props.side
 * @param {object} props.sideData - { fields, photo, qrCode, imageLayers }
 * @param {object[]} props.usableAssets
 * @param {boolean} props.assetsLoading
 * @param {object[]} [props.schoolImages] - designer-context schoolImages
 * @param {boolean} [props.schoolImagesLoading]
 * @param {string|null} [props.schoolImagesError]
 * @param {() => void} [props.onRetrySchoolImages]
 * @param {(profileKey: string) => void} [props.onAddSchoolImage] - profileKey ya SIGN_WITH_SEAL
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
  schoolImages = [],
  schoolImagesLoading = false,
  schoolImagesError = null,
  onRetrySchoolImages,
  onAddSchoolImage,
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

  // School profile images: is side par lagi layer (profileKey se)
  const profileLayer = (key) => layers.find((l) => isProfileImageLayer(l) && l.profileKey === key) || null;
  const selectLayer = (layer) => layer && onSelect({ type: DESIGNER_ELEMENT_TYPES.LAYER, id: getLayerKey(layer) });
  const imageByKey = Object.fromEntries(schoolImages.map((img) => [img.key, img]));
  const signImage = imageByKey[TEMPLATE_COLLEGE_PROFILE_IMAGES.PRINCIPAL_SIGNATURE];
  const stampImage = imageByKey[TEMPLATE_COLLEGE_PROFILE_IMAGES.STAMP];
  const signLayer = profileLayer(TEMPLATE_COLLEGE_PROFILE_IMAGES.PRINCIPAL_SIGNATURE);
  const stampLayer = profileLayer(TEMPLATE_COLLEGE_PROFILE_IMAGES.STAMP);
  const comboAvailable = Boolean(signImage?.available && stampImage?.available);
  const comboAdded = Boolean(signLayer && stampLayer);
  const comboSlots = (signLayer ? 0 : 1) + (stampLayer ? 0 : 1);

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

      {/* School Images (school profile se) */}
      {onAddSchoolImage && (
        <>
          <p className={`${titleClass} flex items-center gap-1.5`}>
            <School className="h-3 w-3" /> School Images
          </p>
          {schoolImagesLoading && schoolImages.length === 0 ? (
            <p className="flex items-center gap-1.5 px-2 text-[11px] text-slate-400">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading school images
            </p>
          ) : schoolImagesError && schoolImages.length === 0 ? (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-[11px] text-amber-900">
              <span>School images couldn&apos;t be loaded.</span>
              {onRetrySchoolImages && (
                <button type="button" onClick={onRetrySchoolImages} className="inline-flex items-center gap-1 font-semibold hover:underline">
                  <RefreshCw className="h-3 w-3" /> Retry
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-1.5">
                {schoolImages.map((img) => {
                  const layer = profileLayer(img.key);
                  return (
                    <SchoolImageTile
                      key={img.key}
                      dragKey={img.key}
                      label={img.label || TEMPLATE_COLLEGE_PROFILE_IMAGE_LABELS[img.key] || img.key}
                      preview={<Thumb url={img.url} icon={PROFILE_ICONS[img.key] || ImageIcon} className="p-1" />}
                      available={Boolean(img.available)}
                      added={Boolean(layer)}
                      note={img.note}
                      disabled={layerLimit}
                      onAdd={() => onAddSchoolImage(img.key)}
                      onSelectAdded={() => selectLayer(layer)}
                    />
                  );
                })}
                {signImage && stampImage && (
                  <SchoolImageTile
                    dragKey={SIGN_WITH_SEAL_COMBO}
                    label="Principal Sign + Seal"
                    preview={
                      <span className="relative flex h-full w-full items-center justify-center">
                        <Thumb url={signImage.url} icon={PenTool} className="max-w-[70%]" />
                        {isSafeImageUrl(stampImage.url) && (
                          <img
                            src={stampImage.url}
                            alt=""
                            draggable={false}
                            className="absolute right-[12%] top-1/2 h-9 w-9 -translate-y-1/2 -rotate-12 object-contain opacity-85"
                          />
                        )}
                      </span>
                    }
                    available={comboAvailable}
                    added={comboAdded}
                    note={!comboAvailable ? 'Needs both principal signature and stamp' : null}
                    disabled={layers.length + comboSlots > TEMPLATE_MAX_IMAGE_LAYERS}
                    onAdd={() => onAddSchoolImage(SIGN_WITH_SEAL_COMBO)}
                    onSelectAdded={() => selectLayer(signLayer)}
                  />
                )}
              </div>
              <p className="px-1 pt-1 text-[10px] text-slate-400">
                Always the latest image from the school profile. The Super Admin uploads or changes them.
              </p>
            </>
          )}
        </>
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
        const profile = isProfileImageLayer(layer);
        const Icon = (profile && PROFILE_ICONS[layer.profileKey]) || LAYER_ICONS[layer.type] || Shapes;
        const label = profile
          ? TEMPLATE_COLLEGE_PROFILE_IMAGE_LABELS[layer.profileKey] || layer.profileKey
          : TEMPLATE_IMAGE_LAYER_LABELS[layer.type];
        return (
          <button key={key} type="button" onClick={() => onSelect({ type: DESIGNER_ELEMENT_TYPES.LAYER, id: key })} className={itemClass(isSel(selected, DESIGNER_ELEMENT_TYPES.LAYER, key))}>
            <span className="flex min-w-0 items-center gap-2">
              <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="truncate">{label}</span>
            </span>
            {layer.visible === false ? (
              <span className="text-[10px] text-slate-400">hidden</span>
            ) : (
              profile && <span className="shrink-0 text-[10px] text-slate-400">profile</span>
            )}
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

      {/* Other images (uploaded assets) — logo / signature / stamp ab School Images se */}
      <p className={titleClass}>Other images</p>
      {assetsLoading ? (
        <p className="flex items-center gap-1.5 px-2 text-[11px] text-slate-400">
          <Loader2 className="h-3 w-3 animate-spin" /> Loading uploaded images
        </p>
      ) : (
        (() => {
          const type = TEMPLATE_IMAGE_LAYER_TYPES.CUSTOM;
          const count = assetCountFor(type);
          return (
            <button
              type="button"
              disabled={count === 0 || layerLimit}
              onClick={() => onAddLayer(type)}
              title={count === 0 ? 'No uploaded images yet' : `Add ${TEMPLATE_IMAGE_LAYER_LABELS[type]}`}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Shapes className="h-3.5 w-3.5 text-indigo-500" /> {TEMPLATE_IMAGE_LAYER_LABELS[type]}
            </button>
          );
        })()
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

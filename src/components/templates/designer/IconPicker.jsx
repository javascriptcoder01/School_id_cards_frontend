// IconPicker.jsx — field ke icon ka chunaav: curated library (search, category, set) ya school ka upload.
// Desktop par trigger ke paas popover, mobile (< 640 px) par bottom sheet. Esc band karta hai, focus trigger par wapas.
import React, { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search, Upload, X, Ban, Loader2, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { TEMPLATE_ICON_SOURCES } from '../../../constants/template.js';
import {
  FIELD_ICON_CATEGORIES,
  FIELD_ICON_SETS,
  getIconComponent,
  fieldIconName,
  searchIcons,
} from '../../../utils/fieldIcons.js';
import { uploadImage, UPLOAD_FOLDERS, ICON_UPLOAD_TYPES, ICON_MAX_UPLOAD_BYTES } from '../../../utils/imageUpload.js';
import { isSafeImageUrl } from '../../../utils/templateLayout.js';

const PAGE_SIZE = 120;
const GRID_COLUMNS = 6;
const POPOVER_WIDTH = 352;
const POPOVER_HEIGHT = 470;
const MOBILE_QUERY = '(max-width: 639px)';
const ACTIVE_CLASS = 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/30';

const chipClass = (active) =>
  `shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
    active ? ACTIVE_CLASS : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
  }`;

const isMobileScreen = () => typeof window !== 'undefined' && window.matchMedia?.(MOBILE_QUERY).matches;

const uploadErrorMessage = (err) =>
  err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Icon upload failed. Please try again';

/**
 * Catalog icon (lazy). Set load hone tak khaali jagah.
 * getIconComponent har key ka ek hi cached component deta hai.
 */
export const IconGlyph = ({ iconKey, size = 18, color = 'currentColor', className = '' }) => {
  const Icon = getIconComponent(iconKey);
  if (!Icon) return <span className={className} style={{ width: size, height: size, display: 'inline-block' }} />;
  return (
    <Suspense fallback={<span className={className} style={{ width: size, height: size, display: 'inline-block' }} />}>
      {React.createElement(Icon, { size, color, className, 'aria-hidden': 'true' })}
    </Suspense>
  );
};

/** Field ke icon ka chhota preview (library ya upload) */
export const FieldIconPreview = ({ icon, size = 18, color }) => {
  if (!icon) return <Ban className="text-slate-300" style={{ width: size, height: size }} aria-hidden="true" />;
  if (icon.source === TEMPLATE_ICON_SOURCES.UPLOAD) {
    return isSafeImageUrl(icon.url) ? (
      <img src={icon.url} alt="" style={{ width: size, height: size }} className="object-contain" />
    ) : (
      <ImageIcon className="text-slate-300" style={{ width: size, height: size }} aria-hidden="true" />
    );
  }
  return <IconGlyph iconKey={icon.key} size={size} color={color || 'currentColor'} />;
};

/* ------------------------------------------------------------------ */
/* Library tab                                                         */
/* ------------------------------------------------------------------ */

const LibraryTab = ({ currentKey, onPick, searchRef }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(null);
  const [set, setSet] = useState(null);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const gridRef = useRef(null);

  const results = useMemo(() => searchIcons(query, category, set), [query, category, set]);
  const visible = results.slice(0, limit);

  const resetPaging = () => setLimit(PAGE_SIZE);

  // Grid mein arrow keys se ghoomna (roving focus)
  const onGridKeyDown = (e) => {
    const moves = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: GRID_COLUMNS, ArrowUp: -GRID_COLUMNS };
    const buttons = gridRef.current ? [...gridRef.current.querySelectorAll('button[data-icon-index]')] : [];
    const current = buttons.indexOf(document.activeElement);
    if (current === -1) return;
    let next = null;
    if (e.key in moves) next = current + moves[e.key];
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = buttons.length - 1;
    if (next === null) return;
    e.preventDefault();
    if (e.key === 'ArrowUp' && next < 0) {
      searchRef.current?.focus();
      return;
    }
    buttons[Math.min(Math.max(next, 0), buttons.length - 1)]?.focus();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            resetPaging();
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              gridRef.current?.querySelector('button[data-icon-index]')?.focus();
            }
          }}
          placeholder="Search icons (mail, phone, blood…)"
          aria-label="Search icons"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="group" aria-label="Icon category">
        <button type="button" onClick={() => { setCategory(null); resetPaging(); }} aria-pressed={!category} className={chipClass(!category)}>
          All
        </button>
        {Object.entries(FIELD_ICON_CATEGORIES).map(([key, text]) => (
          <button
            key={key}
            type="button"
            onClick={() => { setCategory(key); resetPaging(); }}
            aria-pressed={category === key}
            className={chipClass(category === key)}
          >
            {text}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2">
        <label className="sr-only" htmlFor="icon-picker-set">Icon library</label>
        <select
          id="icon-picker-set"
          value={set || ''}
          onChange={(e) => {
            setSet(e.target.value || null);
            resetPaging();
          }}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All libraries</option>
          {Object.entries(FIELD_ICON_SETS).map(([key, text]) => (
            <option key={key} value={key}>{text}</option>
          ))}
        </select>
        <span className="shrink-0 text-[10px] text-slate-400" aria-live="polite">
          {results.length} icon{results.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/60 p-1.5">
        {results.length === 0 ? (
          <p className="px-2 py-6 text-center text-[11px] text-slate-400">No icon matches. Try another word or library.</p>
        ) : (
          <>
            <div ref={gridRef} className="grid grid-cols-6 gap-1" role="listbox" aria-label="Icons" onKeyDown={onGridKeyDown}>
              {visible.map((icon, index) => {
                const selected = icon.key === currentKey;
                return (
                  <button
                    key={icon.key}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    data-icon-index={index}
                    tabIndex={index === 0 ? 0 : -1}
                    onClick={() => onPick(icon.key)}
                    title={`${icon.label} · ${FIELD_ICON_SETS[icon.set]}`}
                    aria-label={`${icon.label}, ${FIELD_ICON_SETS[icon.set]}`}
                    className={`relative flex aspect-square items-center justify-center rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                      selected ? ACTIVE_CLASS : 'bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'
                    }`}
                  >
                    <IconGlyph iconKey={icon.key} size={18} />
                    {selected && (
                      <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white text-indigo-600 shadow-sm">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {results.length > limit && (
              <button
                type="button"
                onClick={() => setLimit((n) => n + PAGE_SIZE)}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white py-1.5 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-50"
              >
                Show more ({results.length - limit} left)
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Upload tab (existing upload flow, folder Icons)                     */
/* ------------------------------------------------------------------ */

const UploadTab = ({ current, onUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const currentUpload = current?.source === TEMPLATE_ICON_SOURCES.UPLOAD ? current : null;

  useEffect(() => () => abortRef.current?.abort(), []);

  const onFile = async (file) => {
    setError(null);
    if (!file) return;
    if (!ICON_UPLOAD_TYPES.includes(file.type)) {
      setError('Use a PNG or WebP image (SVG is not allowed).');
      return;
    }
    if (file.size > ICON_MAX_UPLOAD_BYTES) {
      setError('The icon must be 512 KB or smaller.');
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setUploading(true);
    setProgress(0);
    try {
      const result = await uploadImage(file, { folder: UPLOAD_FOLDERS.ICONS, onProgress: setProgress, signal: controller.signal });
      onUploaded({ url: result.url, publicId: result.publicId || null });
    } catch (err) {
      if (!controller.signal.aborted) setError(uploadErrorMessage(err));
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white">
          {currentUpload && isSafeImageUrl(currentUpload.url) ? (
            <img src={currentUpload.url} alt="Uploaded icon" className="h-10 w-10 object-contain" />
          ) : (
            <ImageIcon className="h-6 w-6 text-slate-300" />
          )}
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">
          {currentUpload ? 'This field uses your uploaded icon.' : 'Upload your own small icon.'} PNG or WebP, square, up to 512 KB.
          A transparent background looks best.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ICON_UPLOAD_TYPES.join(',')}
        className="sr-only"
        id="icon-picker-upload"
        onChange={(e) => onFile(e.target.files?.[0])}
        disabled={uploading}
      />
      <label
        htmlFor="icon-picker-upload"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
          uploading ? 'pointer-events-none bg-slate-100 text-slate-400' : ACTIVE_CLASS
        }`}
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {uploading ? `Uploading… ${progress}%` : currentUpload ? 'Upload a different icon' : 'Choose icon image'}
      </label>

      {error && (
        <p className="flex items-start gap-1.5 text-[11px] text-rose-600" role="alert">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Picker                                                              */
/* ------------------------------------------------------------------ */

/**
 * @param {object} props
 * @param {object|null} props.icon - field.icon
 * @param {string} [props.color] - preview ka rang (icon / text color)
 * @param {(icon: object|null) => void} props.onChange - { source, key } | { source, url, publicId } | null
 */
export const IconPicker = ({ icon, color, onChange }) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('LIBRARY');
  const [mobile, setMobile] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const searchRef = useRef(null);

  const close = () => {
    setOpen(false);
    // Focus wapas trigger par
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const openPicker = () => {
    setMobile(isMobileScreen());
    setTab(icon?.source === TEMPLATE_ICON_SOURCES.UPLOAD ? 'UPLOAD' : 'LIBRARY');
    setOpen(true);
  };

  // Desktop: trigger ke neeche (jagah na ho to upar), screen ke andar
  useLayoutEffect(() => {
    if (!open || mobile) return undefined;
    const place = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(POPOVER_WIDTH, window.innerWidth - 16);
      const height = Math.min(POPOVER_HEIGHT, window.innerHeight - 16);
      const below = rect.bottom + 6;
      const top = below + height <= window.innerHeight - 8 ? below : Math.max(8, rect.top - 6 - height);
      const left = Math.min(Math.max(8, rect.right - width), window.innerWidth - width - 8);
      setPosition({ top, left, width, height });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, mobile]);

  // Khulte hi search par focus
  useEffect(() => {
    if (open && tab === 'LIBRARY') requestAnimationFrame(() => searchRef.current?.focus());
  }, [open, tab]);

  // Bahar click = band (desktop popover)
  useEffect(() => {
    if (!open || mobile) return undefined;
    const onDown = (e) => {
      if (panelRef.current?.contains(e.target) || triggerRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, mobile]);

  // Esc band; Tab panel ke andar hi ghoome
  const onPanelKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      close();
      return;
    }
    if (e.key !== 'Tab' || !panelRef.current) return;
    const focusable = [...panelRef.current.querySelectorAll('button, input, select, label[tabindex], [tabindex="0"]')].filter(
      (el) => !el.disabled && el.tabIndex !== -1 && el.offsetParent !== null
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const pick = (next) => {
    onChange(next);
    close();
  };

  const tabButton = (key, text, Icon) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === key}
      onClick={() => setTab(key)}
      className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-semibold ${
        tab === key ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
      }`}
    >
      <Icon className="h-3.5 w-3.5" /> {text}
    </button>
  );

  const panel = (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal={mobile ? 'true' : undefined}
      aria-label="Choose an icon"
      onKeyDown={onPanelKeyDown}
      className={
        mobile
          ? 'fixed inset-x-0 bottom-0 z-60 flex max-h-[85vh] flex-col gap-3 rounded-t-3xl border border-slate-200 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl'
          : 'fixed z-60 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl'
      }
      style={mobile ? { height: '85vh' } : { top: position.top, left: position.left, width: position.width, height: position.height }}
    >
      {mobile && <span className="mx-auto -mt-1 h-1 w-10 shrink-0 rounded-full bg-slate-200" aria-hidden="true" />}
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-xs font-bold text-slate-800">Choose an icon</h4>
        <button type="button" onClick={close} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Close icon picker">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex gap-1 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Icon source">
        {tabButton('LIBRARY', 'Library', Search)}
        {tabButton('UPLOAD', 'Upload icon', Upload)}
      </div>

      {tab === 'LIBRARY' ? (
        <LibraryTab
          currentKey={icon?.source === TEMPLATE_ICON_SOURCES.UPLOAD ? null : icon?.key}
          searchRef={searchRef}
          onPick={(key) => pick({ source: TEMPLATE_ICON_SOURCES.LIBRARY, key })}
        />
      ) : (
        <UploadTab current={icon} onUploaded={({ url, publicId }) => pick({ source: TEMPLATE_ICON_SOURCES.UPLOAD, url, publicId })} />
      )}

      <button
        type="button"
        onClick={() => pick(null)}
        aria-pressed={!icon}
        className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-semibold ${
          !icon ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
        }`}
      >
        <Ban className="h-3.5 w-3.5" /> No icon
        {!icon && <Check className="h-3.5 w-3.5" />}
      </button>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? close() : openPicker())}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs text-slate-800 hover:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white">
          <FieldIconPreview icon={icon} size={14} color={color} />
        </span>
        <span className="min-w-0 flex-1 truncate">{fieldIconName(icon)}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open &&
        createPortal(
          <>
            {mobile && <div className="fixed inset-0 z-59 bg-slate-900/40" onClick={close} aria-hidden="true" />}
            {panel}
          </>,
          document.body
        )}
    </>
  );
};

export default IconPicker;

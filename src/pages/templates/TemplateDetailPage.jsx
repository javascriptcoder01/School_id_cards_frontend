import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  CreditCard,
  Palette,
  Layers,
  Image,
  ArrowLeft,
  Edit3,
  Eye,
  RotateCcw,
  Ruler,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import {
  fetchTemplateDetailRequested,
  clearSelectedTemplate,
} from '../../features/templates/templateSlice.js';
import {
  selectSelectedTemplate,
  selectTemplateDetailLoading,
  selectTemplateError,
} from '../../features/templates/templateSelectors.js';
import { selectUserRole } from '../../features/auth/authSelectors.js';
import { ROUTES, getTemplateEditRoute } from '../../constants/routes.js';
import { ROLES } from '../../constants/roles.js';
import { TEMPLATE_FIELD_LABELS } from '../../constants/template.js';
import TemplateStatusBadge from '../../components/templates/TemplateStatusBadge.jsx';
import TemplateFlipPreview from '../../components/templates/TemplateFlipPreview.jsx';
import Loader from '../../components/common/Loader.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';

/* ------------------------------------------------------------------ */
/* Small pieces (sirf is page ke liye)                                 */
/* ------------------------------------------------------------------ */

const HEADER_TONES = {
  violet: 'from-violet-600 via-fuchsia-600 to-pink-500',
  sky: 'from-sky-500 via-blue-600 to-indigo-600',
  amber: 'from-amber-400 via-orange-500 to-rose-500',
};

const FIELDS_OPEN_STORAGE_KEY = 'templateDetail.showFields';

const readOpen = (key, fallback) => {
  try {
    const saved = window.localStorage.getItem(key);
    return saved === null ? fallback : saved === 'true';
  } catch {
    return fallback;
  }
};

const saveOpen = (key, value) => {
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    // storage band ho to bhi chalta rahe
  }
};

/**
 * White card jiske upar rangeen gradient header patti hai.
 * `onToggle` diya ho to poora header click karke card khulta / band hota hai (smooth, bina jhatke).
 */
const GradientCard = ({ id, icon: Icon, title, tone, aside, className = '', open = true, onToggle, children }) => {
  const isCollapsible = typeof onToggle === 'function';
  const [mounted, setMounted] = useState(open);
  // Content pehle opacity 0 par aata hai, agle frame mein fade-in shuru — tabhi khulna bhi smooth lagta hai
  const [visible, setVisible] = useState(open);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (isCollapsible) bodyRef.current?.toggleAttribute('inert', !open);
    if (!open) {
      setVisible(false);
      return undefined;
    }
    setMounted(true);
    let frame2;
    const frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => setVisible(true));
    });
    return () => {
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
    };
  }, [open, isCollapsible]);

  const handleTransitionEnd = (event) => {
    if (event.target === event.currentTarget && event.propertyName === 'grid-template-rows' && !open) {
      setMounted(false);
    }
  };

  const headerInner = (
    <>
      <span className="pointer-events-none absolute -right-6 -top-10 h-24 w-24 rounded-full bg-white/15 transition-transform duration-500 group-hover:scale-125 motion-reduce:transition-none" />
      <span className="relative flex min-w-0 items-center gap-2 text-sm font-bold">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/20 ring-1 ring-white/30">
          <Icon className="h-4 w-4" />
        </span>
        <span className="truncate">{title}</span>
      </span>
      {(aside || isCollapsible) && (
        <span className="relative flex shrink-0 items-center gap-2">
          {aside}
          {isCollapsible && (
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 ring-1 ring-white/30 transition-colors group-hover:bg-white/30">
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
              />
            </span>
          )}
        </span>
      )}
    </>
  );

  const headerClass = `group relative flex w-full items-center justify-between gap-3 overflow-hidden bg-linear-to-r px-4 py-3 text-left text-white ${HEADER_TONES[tone]}`;

  return (
    <section className={`overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs ${className}`}>
      {isCollapsible ? (
        <h2>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={id}
            className={`${headerClass} cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white`}
          >
            {headerInner}
          </button>
        </h2>
      ) : (
        <h2 className={headerClass}>{headerInner}</h2>
      )}

      {isCollapsible ? (
        <div
          id={id}
          ref={bodyRef}
          aria-hidden={!open}
          onTransitionEnd={handleTransitionEnd}
          /* Khulte waqt: pehle height badhti hai, phir content dheere se aata hai.
             Band hote waqt: pehle content fade hota hai, phir height dheere se simatti hai. */
          className={`grid transition-[grid-template-rows] duration-[650ms] ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none ${open ? 'grid-rows-[1fr] delay-0' : 'grid-rows-[0fr] delay-150'
            }`}
        >
          <div className="min-h-0 min-w-0 overflow-hidden">
            {(mounted || open) && (
              <div
                className={`p-4 transition-[opacity,transform] ease-out motion-reduce:transition-none ${visible
                    ? 'translate-y-0 opacity-100 duration-500 delay-200'
                    : '-translate-y-2 opacity-0 duration-200 delay-0'
                  }`}
              >
                {children}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4">{children}</div>
      )}
    </section>
  );
};

/** Hero ke andar glass chip */
const HeroChip = ({ children, mono = false }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-indigo-100 ring-1 ring-white/15 backdrop-blur-sm ${mono ? 'font-mono' : ''}`}
  >
    {children}
  </span>
);

/** Rang ka bada swatch */
const ColorSwatch = ({ label, color }) => (
  <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-2.5">
    <span
      className={`h-10 w-10 shrink-0 rounded-xl shadow-md ring-2 ring-white ${color ? '' : 'bg-[repeating-linear-gradient(45deg,#e2e8f0_0_4px,#f8fafc_4px_8px)]'}`}
      style={color ? { backgroundColor: color } : undefined}
    />
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="truncate font-mono text-sm font-bold text-slate-800">{color || 'None'}</p>
    </div>
  </div>
);

/** URL wali line (Background / Logo) */
const LinkRow = ({ label, url }) => (
  <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl px-1 py-2 text-sm">
    <span className="shrink-0 text-slate-500">{label}</span>
    {url ? (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        title={url}
        className="inline-flex min-w-0 items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
      >
        <span className="truncate">{url}</span>
        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
      </a>
    ) : (
      <span className="italic text-slate-400">None</span>
    )}
  </div>
);

/** Photo box ke chhote number tiles */
const MeasureTile = ({ label, value }) => (
  <div className="rounded-2xl border border-sky-100 bg-linear-to-br from-sky-50 to-indigo-50 p-3">
    <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-700/80">{label}</p>
    <p className="mt-0.5 font-mono text-lg font-extrabold text-slate-900">
      {value}
      <span className="ml-1 text-xs font-semibold text-slate-400">mm</span>
    </p>
  </div>
);

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export const TemplateDetailPage = () => {
  const { templateId } = useParams();
  const dispatch = useDispatch();
  const userRole = useSelector(selectUserRole);

  const template = useSelector(selectSelectedTemplate);
  const isLoading = useSelector(selectTemplateDetailLoading);
  const error = useSelector(selectTemplateError);

  const isCollegeAdmin = userRole === ROLES.COLLEGE_ADMIN;

  // Mapped Dynamic Fields khula / band — browser mein yaad rehta hai
  const [showFields, setShowFields] = useState(() => readOpen(FIELDS_OPEN_STORAGE_KEY, true));
  const toggleFields = () =>
    setShowFields((prev) => {
      saveOpen(FIELDS_OPEN_STORAGE_KEY, !prev);
      return !prev;
    });

  useEffect(() => {
    if (templateId) {
      dispatch(fetchTemplateDetailRequested(templateId));
    }

    return () => {
      dispatch(clearSelectedTemplate());
    };
  }, [dispatch, templateId]);

  if (isLoading) {
    return <Loader message="Loading template details..." />;
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.TEMPLATES}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Templates</span>
          </Link>
        </div>
        <ErrorMessage message={error} title="Template Not Found or Inaccessible" />
      </div>
    );
  }

  if (!template) {
    return null;
  }

  const fields = template.fields || [];
  const primary = template.primaryColor || '';
  const secondary = template.secondaryColor || '';

  return (
    <div className="max-w-5xl space-y-5">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3">
        <Link
          to={ROUTES.TEMPLATES}
          className="group inline-flex items-center gap-2 rounded-xl px-1 py-1 text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none" />
          <span>Back to Templates</span>
        </Link>

        {isCollegeAdmin && (
          <Link
            to={getTemplateEditRoute(template.id)}
            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-violet-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl focus:outline-hidden focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit Template</span>
          </Link>
        )}
      </div>

      {/* Hero + Preview: ek hi dark "stage" */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-950 via-indigo-950 to-violet-900 text-white shadow-2xl shadow-indigo-900/30">
        <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-fuchsia-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-sky-500/25 blur-3xl" />
        {/* Template ke apne rang ki halki chamak */}
        {primary && (
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 rounded-full opacity-25 blur-3xl"
            style={{ backgroundColor: primary }}
          />
        )}

        {/* Header */}
        <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-400 via-violet-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/30 ring-1 ring-white/30">
              <CreditCard className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black tracking-tight break-words sm:text-3xl">{template.name}</h1>
                <TemplateStatusBadge isActive={template.isActive} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <HeroChip>
                  <RotateCcw className="h-3 w-3" />
                  {template.orientation || 'PORTRAIT'}
                </HeroChip>
                <HeroChip mono>
                  <Ruler className="h-3 w-3" />
                  {template.width} × {template.height} mm
                </HeroChip>
                <HeroChip>
                  <Layers className="h-3 w-3" />
                  {fields.length} Field{fields.length === 1 ? '' : 's'}
                </HeroChip>
              </div>
            </div>
          </div>

          {(primary || secondary) && (
            <div className="flex shrink-0 items-center gap-2 self-start rounded-2xl bg-white/10 px-3 py-2 ring-1 ring-white/15 backdrop-blur-sm sm:self-center">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-200">Theme</span>
              {[primary, secondary].filter(Boolean).map((c) => (
                <span key={c} className="h-5 w-5 rounded-full ring-2 ring-white/70" style={{ backgroundColor: c }} title={c} />
              ))}
            </div>
          )}
        </div>

        {/* Preview stage */}
        <div className="relative border-t border-white/10 bg-white/[0.03] px-3 pb-6 pt-4 sm:px-6">
          <p className="mb-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-indigo-200">
            <Eye className="h-3.5 w-3.5" />
            Live Card Preview
          </p>
          <div className="relative mx-auto flex max-w-full justify-center overflow-x-auto">
            {/* Card ke peeche spotlight */}
            <div className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto h-40 max-w-md -translate-y-1/2 rounded-full bg-white/15 blur-3xl" />
            <div className="relative drop-shadow-[0_25px_35px_rgba(0,0,0,0.45)]">
              <TemplateFlipPreview templateId={template.id} size="lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Styling & Branding */}
        <GradientCard icon={Palette} title="Styling & Branding" tone="violet">
          <div className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2">
            <ColorSwatch label="Primary" color={primary} />
            <ColorSwatch label="Secondary" color={secondary} />
          </div>

          {primary && secondary && (
            <div
              className="mt-3 h-2.5 rounded-full shadow-inner"
              style={{ backgroundImage: `linear-gradient(90deg, ${primary}, ${secondary})` }}
              aria-hidden="true"
            />
          )}

          <div className="mt-2 divide-y divide-slate-100">
            <LinkRow label="Background" url={template.background} />
            <LinkRow label="Logo" url={template.logo} />
          </div>
        </GradientCard>

        {/* Photo Box */}
        <GradientCard icon={Image} title="Photo Box Placement" tone="sky">
          <div className="grid grid-cols-2 gap-2.5">
            <MeasureTile label="X Position" value={template.photo?.x ?? 0} />
            <MeasureTile label="Y Position" value={template.photo?.y ?? 0} />
            <MeasureTile label="Width" value={template.photo?.width ?? 25} />
            <MeasureTile label="Height" value={template.photo?.height ?? 30} />
          </div>
        </GradientCard>

        {/* Dynamic Fields */}
        <GradientCard
          id="template-dynamic-fields"
          icon={Layers}
          title="Mapped Dynamic Fields"
          tone="amber"
          className="md:col-span-2"
          open={showFields}
          onToggle={toggleFields}
          aside={
            <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-xs font-bold tabular-nums ring-1 ring-white/30">
              {fields.length}
            </span>
          }
        >
          {fields.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">No dynamic fields mapped</p>
          ) : (
            <div className="-mx-4 -mb-4 overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-2.5">Field</th>
                    <th className="px-4 py-2.5">Label</th>
                    <th className="px-4 py-2.5">X (mm)</th>
                    <th className="px-4 py-2.5">Y (mm)</th>
                    <th className="px-4 py-2.5">Font Size</th>
                    <th className="px-4 py-2.5">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {fields.map((f, i) => (
                    <tr key={i} className="transition-colors hover:bg-amber-50/50">
                      <td className="whitespace-nowrap px-4 py-2.5 font-sans">
                        <span className="flex items-center gap-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-amber-400 to-orange-500 text-[10px] font-bold text-white shadow-sm">
                            {i + 1}
                          </span>
                          <span className="font-bold text-slate-800">{TEMPLATE_FIELD_LABELS[f.field] || f.field}</span>
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">{f.field}</span>
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 font-sans text-slate-600">{f.label || '--'}</td>
                      <td className="px-4 py-2.5 text-slate-700">{f.x}</td>
                      <td className="px-4 py-2.5 text-slate-700">{f.y}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-slate-700">{f.fontSize} pt</td>
                      <td className="px-4 py-2.5 font-sans">
                        <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-700 ring-1 ring-orange-100">
                          {f.fontWeight}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GradientCard>
      </div>
    </div>
  );
};

export default TemplateDetailPage;
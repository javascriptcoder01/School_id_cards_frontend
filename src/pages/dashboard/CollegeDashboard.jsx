// DashboardKit.jsx
import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

// 30760 → 30,760 (Indian grouping). String (jaise '₹60 / card') waise hi.
export const formatCount = (value) =>
    typeof value === 'number' || (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value)))
        ? Number(value).toLocaleString('en-IN')
        : value ?? '0';

const readShow = (key, defaultOpen) => {
    try {
        const saved = window.localStorage.getItem(key);
        return saved === null ? defaultOpen : saved !== 'false';
    } catch {
        return defaultOpen;
    }
};

const saveShow = (key, value) => {
    try {
        window.localStorage.setItem(key, String(value));
    } catch {
        // storage band ho to bhi chalta rahe
    }
};

/** Show / hide state jo browser mein yaad rehti hai */
export const usePersistedToggle = (key, defaultOpen = true) => {
    const [open, setOpen] = useState(() => readShow(key, defaultOpen));
    const toggle = () =>
        setOpen((prev) => {
            saveShow(key, !prev);
            return !prev;
        });
    return [open, toggle];
};

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

export const ValueSkeleton = ({ className = 'h-7 w-24' }) => (
    <span className={`block animate-pulse rounded-lg bg-current opacity-15 ${className}`} />
);

/** Page ke upar dark gradient banner */
export const DashboardHero = ({ eyebrow, title, aside }) => (
    <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-indigo-900 to-violet-800 p-5 text-white shadow-xl sm:p-6">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/4 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
                {eyebrow && <p className="text-xs font-semibold uppercase tracking-widest text-indigo-200">{eyebrow}</p>}
                <h1 className="mt-1 text-2xl font-black tracking-tight break-words sm:truncate sm:text-3xl">{title}</h1>
            </div>
            {aside}
        </div>
    </section>
);

/** Hero ke andar chhote stat chips */
export const HeroStat = ({ icon: Icon, label, value, loading }) => (
    <div className="flex min-w-0 items-center gap-2.5 rounded-2xl bg-white/10 px-2.5 py-2 ring-1 ring-white/15 backdrop-blur-sm transition-colors hover:bg-white/15 sm:px-3">
        <Icon className="hidden h-4 w-4 shrink-0 text-indigo-200 min-[400px]:block" />
        <div className="min-w-0 leading-tight">
            {loading ? (
                <ValueSkeleton className="h-4 w-10" />
            ) : (
                <p className="truncate text-base font-extrabold">{formatCount(value)}</p>
            )}
            <p className="truncate text-[11px] font-medium text-indigo-200">{label}</p>
        </div>
    </div>
);

const MONEY_TONES = {
    blue: 'from-sky-500 via-blue-500 to-indigo-600 shadow-blue-500/25',
    amber: 'from-amber-400 via-orange-500 to-rose-500 shadow-orange-500/25',
    emerald: 'from-emerald-400 via-teal-500 to-cyan-600 shadow-teal-500/25',
    violet: 'from-violet-500 via-purple-500 to-fuchsia-500 shadow-violet-500/25',
};

/** Bade gradient cards (₹ amounts) */
export const MoneyCard = ({ icon: Icon, title, value, subtitle, tone = 'blue', loading, badge }) => (
    <div
        className={`group relative overflow-hidden rounded-2xl bg-linear-to-br p-4 text-white shadow-lg transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-5 ${MONEY_TONES[tone]}`}
    >
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/15 transition-transform duration-500 group-hover:scale-125 motion-reduce:transition-none" />
        <div className="relative flex items-start justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/85">{title}</p>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30">
                <Icon className="h-4.5 w-4.5" />
            </div>
        </div>
        <div className="relative mt-2 min-w-0">
            {loading ? (
                <ValueSkeleton className="h-8 w-32" />
            ) : (
                <p className="text-2xl font-black tracking-tight wrap-anywhere sm:text-3xl">{value}</p>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-2">
                {subtitle && <span className="text-xs font-semibold text-white/85">{subtitle}</span>}
                {badge}
            </div>
        </div>
    </div>
);

const MINI_TONES = {
    indigo: 'from-indigo-500 to-violet-500 shadow-indigo-500/30',
    violet: 'from-violet-500 to-fuchsia-500 shadow-violet-500/30',
    emerald: 'from-emerald-500 to-teal-500 shadow-emerald-500/30',
    sky: 'from-sky-500 to-cyan-500 shadow-sky-500/30',
    amber: 'from-amber-400 to-orange-500 shadow-orange-500/30',
};

/** Chhote stat tiles */
export const MiniStat = ({ icon: Icon, label, value, tone = 'indigo', loading }) => (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 transition-shadow hover:shadow-md">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br text-white shadow-md ${MINI_TONES[tone]}`}>
            <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
            {loading ? (
                <ValueSkeleton className="h-6 w-12 text-slate-900" />
            ) : (
                <p className="text-xl font-extrabold leading-tight text-slate-900">{formatCount(value)}</p>
            )}
            <p className="line-clamp-2 text-xs font-medium leading-snug text-slate-500">{label}</p>
        </div>
    </div>
);

/** White card section with a small title */
export const Panel = ({ title, icon: Icon, action, children, className = '' }) => (
    <section className={`rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5 ${className}`}>
        {(title || action) && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                {title && (
                    <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                        {Icon && <Icon className="h-4 w-4 text-indigo-600" />}
                        {title}
                    </h2>
                )}
                {action}
            </div>
        )}
        {children}
    </section>
);

/**
 * Show / hide block.
 * Smooth: band hote waqt content animation khatam hone tak rehta hai (jhatka nahi),
 * height (grid rows) + opacity saath mein animate hote hain, band hone par content focus/click se bahar (inert).
 */
export const Collapsible = ({ id, icon: Icon, title, count, open, onToggle, action, children }) => {
    const [mounted, setMounted] = useState(open);
    const panelRef = useRef(null);

    useEffect(() => {
        if (open) setMounted(true);
        // inert attribute DOM par seedha (React 18 aur 19 dono mein same chale)
        panelRef.current?.toggleAttribute('inert', !open);
    }, [open]);

    const handleTransitionEnd = (event) => {
        if (event.target === event.currentTarget && event.propertyName === 'grid-template-rows' && !open) {
            setMounted(false);
        }
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
            <div className="flex items-center bg-slate-50/80">
                <button
                    type="button"
                    onClick={onToggle}
                    aria-expanded={open}
                    aria-controls={id}
                    className="flex min-w-0 flex-1 items-center justify-between gap-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
                >
                    <span className="flex min-w-0 items-center gap-2 text-sm font-bold text-slate-800">
                        {Icon && <Icon className="h-4 w-4 shrink-0 text-indigo-600" />}
                        <span className="truncate">{title}</span>
                        {typeof count === 'number' && (
                            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-bold tabular-nums text-indigo-700">
                                {count}
                            </span>
                        )}
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-slate-500">
                        {/* Dono shabd ek hi jagah par — width nahi badalti, header nahi hilta */}
                        <span className="grid text-right">
                            <span className={`col-start-1 row-start-1 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}>
                                Hide
                            </span>
                            <span className={`col-start-1 row-start-1 transition-opacity duration-200 ${open ? 'opacity-0' : 'opacity-100'}`}>
                                Show
                            </span>
                        </span>
                        <ChevronDown
                            className={`h-4 w-4 transition-transform duration-300 ease-out motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
                        />
                    </span>
                </button>
                {action && <div className="shrink-0 pr-3">{action}</div>}
            </div>

            <div
                id={id}
                ref={panelRef}
                aria-hidden={!open}
                onTransitionEnd={handleTransitionEnd}
                className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
            >
                <div className="min-h-0 min-w-0 overflow-hidden">
                    {(mounted || open) && (
                        <div
                            className={`p-3 transition-opacity duration-300 ease-out motion-reduce:transition-none sm:p-4 ${open ? 'opacity-100' : 'opacity-0'
                                }`}
                        >
                            {children}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default {
    formatCount,
    usePersistedToggle,
    ValueSkeleton,
    DashboardHero,
    HeroStat,
    MoneyCard,
    MiniStat,
    Panel,
    Collapsible,
};
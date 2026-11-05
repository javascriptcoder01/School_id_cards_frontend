// GradientRequestTabs.jsx
import React, { useEffect, useRef } from 'react';

const TONES = {
    amber: { active: 'from-amber-400 to-orange-500 shadow-orange-500/30', dot: 'bg-amber-500' },
    blue: { active: 'from-sky-500 to-blue-600 shadow-blue-500/30', dot: 'bg-blue-500' },
    violet: { active: 'from-violet-500 to-fuchsia-500 shadow-violet-500/30', dot: 'bg-violet-500' },
    emerald: { active: 'from-emerald-500 to-teal-500 shadow-emerald-500/30', dot: 'bg-emerald-500' },
    rose: { active: 'from-rose-500 to-pink-500 shadow-rose-500/30', dot: 'bg-rose-500' },
    red: { active: 'from-red-500 to-rose-600 shadow-red-500/30', dot: 'bg-red-500' },
    indigo: { active: 'from-indigo-500 to-violet-600 shadow-indigo-500/30', dot: 'bg-indigo-500' },
};

/**
 * @param {object} props
 * @param {{ key: string, label: string, count?: number, tone?: string }[]} props.tabs
 * @param {string} props.active
 * @param {(key: string) => void} props.onChange
 * @param {string} [props.ariaLabel]
 */
export const GradientRequestTabs = ({ tabs, active, onChange, ariaLabel = 'Request status' }) => {
    const listRef = useRef(null);

    // Active tab hamesha dikhe (mobile par scroll karke)
    useEffect(() => {
        const el = listRef.current?.querySelector('[aria-selected="true"]');
        if (!el || !listRef.current) return;
        const list = listRef.current;
        const left = el.offsetLeft - list.offsetLeft;
        const right = left + el.offsetWidth;
        if (left < list.scrollLeft || right > list.scrollLeft + list.clientWidth) {
            list.scrollTo({ left: Math.max(0, left - 8), behavior: 'smooth' });
        }
    }, [active]);

    const onKeyDown = (event) => {
        const index = tabs.findIndex((t) => t.key === active);
        const moves = { ArrowRight: 1, ArrowLeft: -1, Home: -index, End: tabs.length - 1 - index };
        if (!(event.key in moves) || index < 0) return;
        event.preventDefault();
        const next = tabs[(index + moves[event.key] + tabs.length) % tabs.length];
        onChange(next.key);
        requestAnimationFrame(() => listRef.current?.querySelector(`[data-tab="${next.key}"]`)?.focus());
    };

    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-1 shadow-xs">
            <div
                ref={listRef}
                role="tablist"
                aria-label={ariaLabel}
                onKeyDown={onKeyDown}
                className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {tabs.map((tab) => {
                    const isActive = tab.key === active;
                    const tone = TONES[tab.tone] || TONES.indigo;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            role="tab"
                            data-tab={tab.key}
                            aria-selected={isActive}
                            tabIndex={isActive ? 0 : -1}
                            onClick={() => onChange(tab.key)}
                            className={`group inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 motion-reduce:transition-none ${isActive
                                ? `bg-linear-to-r text-white shadow-md ${tone.active}`
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                        >
                            {!isActive && <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} aria-hidden="true" />}
                            {tab.label}
                            {typeof tab.count === 'number' && (
                                <span
                                    className={`min-w-5 rounded-full px-1.5 py-px text-center text-[10px] font-bold tabular-nums ${isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-white'
                                        }`}
                                >
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default GradientRequestTabs;
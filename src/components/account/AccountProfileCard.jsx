// AccountProfileCard.jsx
import React, { useState } from 'react';
import {
  User,
  Mail,
  Shield,
  School,
  Globe2,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  Table2,
  IdCard,
} from 'lucide-react';
import { appearClass, getInstitution, getRoleLabel, useAppear } from '../../utils/accountDisplay';

const VIEW_STORAGE_KEY = 'account.profileView';
const VIEWS = { GRID: 'GRID', CARDS: 'CARDS' };

const readView = () => {
  try {
    const saved = window.localStorage.getItem(VIEW_STORAGE_KEY);
    return saved === VIEWS.GRID || saved === VIEWS.CARDS ? saved : VIEWS.CARDS;
  } catch {
    return VIEWS.CARDS;
  }
};

const saveView = (view) => {
  try {
    window.localStorage.setItem(VIEW_STORAGE_KEY, view);
  } catch {
    // storage band ho to bhi page chalta rahe
  }
};

const TILE_TONES = {
  indigo: 'from-indigo-500 to-violet-500 shadow-indigo-500/25',
  sky: 'from-sky-500 to-cyan-500 shadow-sky-500/25',
  amber: 'from-amber-500 to-orange-500 shadow-amber-500/25',
  emerald: 'from-emerald-500 to-teal-500 shadow-emerald-500/25',
  rose: 'from-rose-500 to-pink-500 shadow-rose-500/25',
  violet: 'from-fuchsia-500 to-purple-600 shadow-fuchsia-500/25',
};

const buildItems = (profile) => {
  const institution = getInstitution(profile);
  const isActive = profile.isActive !== false;
  return [
    { key: 'name', label: 'Full Name', value: profile.name || '—', icon: User, tone: 'indigo' },
    { key: 'role', label: 'Role', value: getRoleLabel(profile.role), icon: Shield, tone: 'amber' },
    { key: 'email', label: 'Email', value: profile.email || '—', icon: Mail, tone: 'sky', wide: true },
    {
      key: 'institution',
      label: institution.isPlatform ? 'Access' : 'School',
      value: institution.name,
      sub: institution.code,
      icon: institution.isPlatform ? Globe2 : School,
      tone: 'violet',
      multiline: true,
    },
    {
      key: 'status',
      label: 'Status',
      value: isActive ? 'Active' : 'Inactive',
      icon: isActive ? CheckCircle2 : XCircle,
      tone: isActive ? 'emerald' : 'rose',
      status: isActive ? 'active' : 'inactive',
    },
  ];
};

const ViewToggle = ({ view, onChange }) => (
  <div className="inline-flex rounded-xl bg-slate-100 p-1" role="group" aria-label="Change view">
    {[
      { key: VIEWS.GRID, label: 'Grid', icon: Table2 },
      { key: VIEWS.CARDS, label: 'Cards', icon: LayoutGrid },
    ].map(({ key, label, icon: Icon }) => {
      const active = view === key;
      return (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-pressed={active}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 ${active ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      );
    })}
  </div>
);

/* ---------- Grid view: table jaisa ---------- */
const GridView = ({ items }) => (
  <dl className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100">
    {items.map(({ key, label, value, sub, icon: Icon, status }) => (
      <div
        key={key}
        className="grid grid-cols-1 gap-1 px-4 py-3 transition-colors hover:bg-slate-50 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center sm:gap-4"
      >
        <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Icon className="h-4 w-4" />
          {label}
        </dt>
        <dd className="min-w-0 text-sm font-semibold text-slate-800">
          {status ? (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {value}
            </span>
          ) : (
            <span className="block break-words" title={value}>
              {value}
              {sub && <span className="ml-2 rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-500">{sub}</span>}
            </span>
          )}
        </dd>
      </div>
    ))}
  </dl>
);

/* ---------- Cards view: gradient tiles ---------- */
const CardsView = ({ items }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    {items.map(({ key, label, value, sub, icon: Icon, tone, wide, multiline }, index) => (
      <div
        key={key}
        style={{ transitionDelay: `${index * 60}ms` }}
        className={`group relative overflow-hidden rounded-2xl bg-linear-to-br p-4 text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${TILE_TONES[tone]
          } ${wide ? 'sm:col-span-2' : ''}`}
      >
        <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/15 transition-transform duration-500 group-hover:scale-125 motion-reduce:transition-none" />
        <div className="relative flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/75">{label}</p>
            <p className={`text-base font-bold ${multiline ? 'line-clamp-2 break-words' : 'truncate'}`} title={value}>
              {value}
            </p>
            {sub && <p className="text-xs font-semibold text-white/80">Code: {sub}</p>}
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const AccountProfileCard = ({ profile }) => {
  const shown = useAppear();
  const [view, setView] = useState(readView);

  if (!profile) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400 shadow-xs">
        Profile not available.
      </div>
    );
  }

  const handleViewChange = (next) => {
    setView(next);
    saveView(next);
  };

  const items = buildItems(profile);

  return (
    <section
      className={`space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 ${appearClass(shown)}`}
      style={{ transitionDelay: '80ms' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25">
            <IdCard className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Profile</h3>
        </div>
        <ViewToggle view={view} onChange={handleViewChange} />
      </div>

      {view === VIEWS.GRID ? <GridView items={items} /> : <CardsView items={items} />}
    </section>
  );
};

export default AccountProfileCard;
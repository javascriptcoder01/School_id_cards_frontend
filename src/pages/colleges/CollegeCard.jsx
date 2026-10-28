import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    MapPin,
    Mail,
    Phone,
    Globe,
    Pencil,
    Loader2,
    Users,
    CalendarDays,
    ArrowUpRight,
} from 'lucide-react';

// Each college gets a stable colour based on its name, so the grid is easy to scan
const TINTS = [
    'bg-indigo-50 text-indigo-700 ring-indigo-200',
    'bg-sky-50 text-sky-700 ring-sky-200',
    'bg-emerald-50 text-emerald-700 ring-emerald-200',
    'bg-amber-50 text-amber-800 ring-amber-200',
    'bg-rose-50 text-rose-700 ring-rose-200',
    'bg-violet-50 text-violet-700 ring-violet-200',
    'bg-teal-50 text-teal-700 ring-teal-200',
];

const STOP_WORDS = ['of', 'and', 'the', '&', 'for'];

const getInitials = (name = '') =>
    name
        .split(/\s+/)
        .filter((w) => w && /[A-Za-z]/.test(w[0]) && !STOP_WORDS.includes(w.toLowerCase()))
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('') || '?';

const getTint = (str = '') => {
    let h = 0;
    for (const c of str) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return TINTS[h % TINTS.length];
};

const getLocation = (college) => {
    const a = college.address;
    if (typeof a === 'string') {
        return [a, college.city, college.state].filter(Boolean).join(', ');
    }
    return [a?.city ?? college.city, a?.state ?? college.state].filter(Boolean).join(', ');
};

const formatDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const InfoRow = ({ icon: Icon, children, href }) => (
    <div className="flex items-start gap-2.5 text-sm text-slate-600 min-w-0">
        <Icon className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
        {href ? (
            <a
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className="truncate hover:text-indigo-600 hover:underline underline-offset-2"
            >
                {children}
            </a>
        ) : (
            <span className="truncate">{children}</span>
        )}
    </div>
);

export const CollegeCard = ({ college, isSuperAdmin, isToggling, onStatusToggle }) => {
    const [confirmingDeactivate, setConfirmingDeactivate] = useState(false);

    const id = college.id ?? college._id;
    const isActive = Boolean(college.isActive);
    const location = getLocation(college);
    const joinedOn = formatDate(college.createdAt);
    const studentCount = college.studentsCount ?? college.studentCount ?? college._count?.students;
    // Model: contact.{email,phone}, collegeLogo.url (logo = legacy string)
    const email = college.contact?.email || college.email;
    const phone = college.contact?.phone || college.phone;
    const logoUrl = college.collegeLogo?.url || college.logo || college.logoUrl;
    const website = college.website;
    const websiteHref = website && !/^https?:\/\//.test(website) ? `https://${website}` : website;

    const handleSwitchClick = () => {
        if (isToggling) return;
        // Deactivation needs a confirm; activation goes straight through
        if (isActive) {
            setConfirmingDeactivate(true);
            return;
        }
        onStatusToggle(id, true);
    };

    const confirmDeactivate = () => {
        setConfirmingDeactivate(false);
        onStatusToggle(id, false);
    };

    return (
        <article
            className={`relative flex flex-col rounded-2xl border bg-white overflow-hidden transition-colors ${isActive ? 'border-slate-200 hover:border-indigo-300' : 'border-slate-200 bg-slate-50/70'
                }`}
        >
            {/* Status strip */}
            <span
                aria-hidden="true"
                className={`h-1 w-full ${isActive ? 'bg-indigo-500' : 'bg-slate-300'}`}
            />

            {/* Identity */}
            <div className="flex items-start gap-3.5 p-5 pb-4">
                {logoUrl ? (
                    <img
                        src={logoUrl}
                        alt=""
                        className={`w-12 h-12 shrink-0 rounded-xl object-cover ring-1 ring-slate-200 ${isActive ? '' : 'grayscale opacity-70'
                            }`}
                    />
                ) : (
                    <div
                        aria-hidden="true"
                        className={`w-12 h-12 shrink-0 rounded-xl ring-1 grid place-items-center text-base font-bold ${isActive ? getTint(college.name) : 'bg-slate-100 text-slate-400 ring-slate-200'
                            }`}
                    >
                        {getInitials(college.name)}
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    <h3
                        className={`font-bold leading-snug line-clamp-2 ${isActive ? 'text-slate-900' : 'text-slate-500'
                            }`}
                        title={college.name}
                    >
                        {college.name}
                    </h3>
                    {college.code && (
                        <p className="text-xs font-medium text-slate-500 mt-0.5">Code {college.code}</p>
                    )}
                </div>

                <span
                    className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200/70 text-slate-600'
                        }`}
                >
                    <span
                        className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}
                    />
                    {isActive ? 'Active' : 'Inactive'}
                </span>
            </div>

            {/* Contact details */}
            <div className="px-5 space-y-2 flex-1">
                {location && <InfoRow icon={MapPin}>{location}</InfoRow>}
                {email && (
                    <InfoRow icon={Mail} href={`mailto:${email}`}>
                        {email}
                    </InfoRow>
                )}
                {phone && (
                    <InfoRow icon={Phone} href={`tel:${phone}`}>
                        {phone}
                    </InfoRow>
                )}
                {website && (
                    <InfoRow icon={Globe} href={websiteHref}>
                        {website.replace(/^https?:\/\//, '')}
                    </InfoRow>
                )}
                {!location && !email && !phone && !website && (
                    <p className="text-sm text-slate-400">No contact details added yet</p>
                )}
            </div>

            {/* Meta */}
            {(studentCount != null || joinedOn) && (
                <div className="mx-5 mt-4 flex items-center gap-4 text-xs text-slate-500">
                    {studentCount != null && (
                        <span className="inline-flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" aria-hidden="true" />
                            {studentCount.toLocaleString('en-IN')} students
                        </span>
                    )}
                    {joinedOn && (
                        <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5" aria-hidden="true" />
                            Added {joinedOn}
                        </span>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="mt-5 border-t border-slate-100 px-5 py-3.5">
                {confirmingDeactivate ? (
                    <div className="flex items-center justify-between gap-3" role="alertdialog" aria-live="polite">
                        <p className="text-sm text-slate-700">Deactivate this college?</p>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setConfirmingDeactivate(false)}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeactivate}
                                className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
                            >
                                Deactivate
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between gap-3">
                        <Link
                            to={`/colleges/${id}`}
                            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            View profile
                            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                        </Link>

                        {isSuperAdmin && (
                            <div className="flex items-center gap-1.5">
                                <Link
                                    to={`/colleges/${id}/edit`}
                                    title="Edit college"
                                    aria-label={`Edit ${college.name}`}
                                    className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                >
                                    <Pencil className="w-4 h-4" />
                                </Link>

                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={isActive}
                                    aria-label={`${isActive ? 'Deactivate' : 'Activate'} ${college.name}`}
                                    title={isActive ? 'Deactivate college' : 'Activate college'}
                                    onClick={handleSwitchClick}
                                    disabled={isToggling}
                                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-wait ${isActive ? 'bg-emerald-500' : 'bg-slate-300'
                                        }`}
                                >
                                    <span
                                        className={`inline-grid place-items-center h-5 w-5 rounded-full bg-white shadow transition-transform motion-reduce:transition-none ${isActive ? 'translate-x-5' : 'translate-x-0.5'
                                            }`}
                                    >
                                        {isToggling && <Loader2 className="w-3 h-3 animate-spin text-slate-500" />}
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </article>
    );
};

export const CollegeCardSkeleton = () => (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden" aria-hidden="true">
        <div className="h-1 bg-slate-200" />
        <div className="p-5 animate-pulse motion-reduce:animate-none">
            <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-slate-200" />
                <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 w-3/4 rounded bg-slate-200" />
                    <div className="h-3 w-1/3 rounded bg-slate-100" />
                </div>
            </div>
            <div className="mt-5 space-y-2.5">
                <div className="h-3 w-2/3 rounded bg-slate-100" />
                <div className="h-3 w-1/2 rounded bg-slate-100" />
                <div className="h-3 w-2/5 rounded bg-slate-100" />
            </div>
            <div className="mt-6 h-8 rounded-lg bg-slate-100" />
        </div>
    </div>
);

export default CollegeCard;
// AccountHeroCard.jsx (NEW)
import { Shield, School, CheckCircle2, XCircle, Globe2 } from 'lucide-react';
import { getRoleLabel, getInstitution, getInitials, useAppear, appearClass } from '../../utils/accountDisplay';

const Chip = ({ icon: Icon, children, tone = 'light', wrap = false }) => (
    <span
        className={`inline-flex max-w-full items-center gap-1.5 px-3 py-1 text-xs font-semibold backdrop-blur-sm ${wrap ? 'rounded-xl' : 'rounded-full'
            } ${tone === 'success'
                ? 'bg-emerald-400/20 text-emerald-50 ring-1 ring-emerald-300/40'
                : tone === 'danger'
                    ? 'bg-rose-400/20 text-rose-50 ring-1 ring-rose-300/40'
                    : 'bg-white/15 text-white ring-1 ring-white/25'
            }`}
    >
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className={wrap ? 'break-words' : 'truncate'}>{children}</span>
    </span>
);

export const AccountHeroCard = ({ profile }) => {
    const shown = useAppear();
    if (!profile) return null;

    const { name = 'User', email = '', role, isActive = true } = profile;
    const institution = getInstitution(profile);

    return (
        <section
            className={`relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-600 via-violet-600 to-fuchsia-500 p-6 text-white shadow-lg shadow-indigo-600/20 sm:p-8 ${appearClass(shown)}`}
        >
            {/* Decorative glow */}
            <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-fuchsia-300/25 blur-3xl" />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative w-fit shrink-0 self-start sm:self-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 text-2xl font-black tracking-wide ring-2 ring-white/40 backdrop-blur-sm transition-transform duration-300 hover:scale-105 motion-reduce:transition-none">
                        {getInitials(name)}
                    </div>
                    <span
                        className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white ${isActive ? 'bg-emerald-400' : 'bg-rose-400'
                            }`}
                        aria-label={isActive ? 'Active' : 'Inactive'}
                    />
                </div>

                <div className="min-w-0 flex-1 space-y-3">
                    <div className="min-w-0">
                        <h2 className="truncate text-2xl font-extrabold tracking-tight sm:text-3xl">{name}</h2>
                        {email && <p className="truncate text-sm text-white/80">{email}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Chip icon={Shield}>{getRoleLabel(role)}</Chip>
                        <Chip icon={institution.isPlatform ? Globe2 : School} wrap>
                            {institution.name}
                            {institution.code ? ` · ${institution.code}` : ''}
                        </Chip>
                        <Chip icon={isActive ? CheckCircle2 : XCircle} tone={isActive ? 'success' : 'danger'}>
                            {isActive ? 'Active' : 'Inactive'}
                        </Chip>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AccountHeroCard;
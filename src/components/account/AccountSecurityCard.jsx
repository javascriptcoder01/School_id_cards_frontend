// AccountSecurityCard.jsx
import { ShieldCheck, LockKeyhole, LogOut, BadgeCheck } from 'lucide-react';
import { appearClass, useAppear } from '../../utils/accountDisplay';

const Row = ({ icon: Icon, iconTone, title, children }) => (
  <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition-colors hover:bg-slate-50">
    <div className="flex min-w-0 items-center gap-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconTone}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <p className="truncate text-sm font-semibold text-slate-800">{title}</p>
    </div>
    {children}
  </div>
);

export const AccountSecurityCard = ({ onLogoutClick }) => {
  const shown = useAppear();

  return (
    <section
      className={`space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 ${appearClass(shown)}`}
      style={{ transitionDelay: '160ms' }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Security</h3>
      </div>

      <div className="space-y-3">
        <Row icon={BadgeCheck} iconTone="bg-emerald-100 text-emerald-600" title="Current session">
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Protected
          </span>
        </Row>

        <Row icon={LockKeyhole} iconTone="bg-indigo-100 text-indigo-600" title="Password & role">
          <span className="shrink-0 text-xs font-medium text-slate-500">Managed by admin</span>
        </Row>
      </div>

      <button
        type="button"
        onClick={onLogoutClick}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-rose-500 to-pink-500 px-4 py-3 text-sm font-bold text-white shadow-md shadow-rose-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
        Sign Out
      </button>
    </section>
  );
};

export default AccountSecurityCard;
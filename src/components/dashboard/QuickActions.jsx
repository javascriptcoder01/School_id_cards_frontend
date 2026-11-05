import React from 'react';
import { Link } from 'react-router-dom';
import {
  School,
  UserPlus,
  GraduationCap,
  FileSpreadsheet,
  CreditCard,
  Sparkles,
  QrCode,
  User,
  ArrowUpRight,
  Printer,
} from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';

// Har tone: icon ka gradient + hover par card ka halka tint
const TONES = {
  indigo: {
    icon: 'from-indigo-500 to-violet-500 shadow-indigo-500/30',
    hover: 'hover:border-indigo-200 focus-visible:ring-indigo-500',
    glow: 'from-indigo-50',
  },
  purple: {
    icon: 'from-violet-500 to-fuchsia-500 shadow-violet-500/30',
    hover: 'hover:border-violet-200 focus-visible:ring-violet-500',
    glow: 'from-violet-50',
  },
  emerald: {
    icon: 'from-emerald-500 to-teal-500 shadow-emerald-500/30',
    hover: 'hover:border-emerald-200 focus-visible:ring-emerald-500',
    glow: 'from-emerald-50',
  },
  amber: {
    icon: 'from-amber-400 to-orange-500 shadow-orange-500/30',
    hover: 'hover:border-amber-200 focus-visible:ring-amber-500',
    glow: 'from-amber-50',
  },
  blue: {
    icon: 'from-sky-500 to-blue-600 shadow-blue-500/30',
    hover: 'hover:border-sky-200 focus-visible:ring-sky-500',
    glow: 'from-sky-50',
  },
  slate: {
    icon: 'from-slate-500 to-slate-700 shadow-slate-500/30',
    hover: 'hover:border-slate-300 focus-visible:ring-slate-500',
    glow: 'from-slate-50',
  },
};

export const QuickActions = ({ role }) => {
  const getActions = () => {
    switch (role) {
      case 'SUPER_ADMIN':
        return [
          { label: 'Register College', path: ROUTES.COLLEGES_NEW, icon: School, tone: 'indigo' },
          { label: 'Create User', path: ROUTES.USERS_NEW, icon: UserPlus, tone: 'purple' },
          { label: 'ID Card Templates', path: ROUTES.TEMPLATES, icon: CreditCard, tone: 'emerald' },
          { label: 'Central Print Center', path: ROUTES.ADMIN_PRINT_REQUESTS, icon: Printer, tone: 'amber' },
        ];

      case 'COLLEGE_ADMIN':
        return [
          {
            label: 'Add Student',
            path: ROUTES.STUDENTS_NEW,
            icon: GraduationCap,
            tone: 'indigo',
          },
          {
            label: 'Bulk Import',
            path: ROUTES.STUDENT_IMPORT,
            icon: FileSpreadsheet,
            tone: 'blue',
          },
          {
            label: 'Generate Cards',
            path: ROUTES.ID_CARD_GENERATIONS,
            icon: Sparkles,
            tone: 'emerald',
          },
          {
            label: 'Print Request Queue',
            path: ROUTES.PRINT_REQUESTS,
            icon: Printer,
            tone: 'amber',
          },
        ];

      case 'OPERATOR':
        return [
          {
            label: 'Verify ID Card',
            description: 'Scan or enter the QR code',
            path: ROUTES.PUBLIC_VERIFY_FORM,
            icon: QrCode,
            tone: 'indigo',
          },
          {
            label: 'My Print Requests',
            description: 'Track your requests',
            path: ROUTES.PRINT_REQUESTS,
            icon: Printer,
            tone: 'purple',
          },
          {
            label: 'My Account',
            description: 'Profile and security',
            path: ROUTES.ACCOUNT,
            icon: User,
            tone: 'slate',
          },
        ];

      default:
        return [
          {
            label: 'My Account',
            description: 'Profile and security',
            path: ROUTES.ACCOUNT,
            icon: User,
            tone: 'slate',
          },
        ];
    }
  };

  const actions = getActions();
  const desktopCols = actions.length === 3 ? 'lg:grid-cols-3' : actions.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-2';

  return (
    <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${desktopCols}`}>
      {actions.map((action) => {
        const Icon = action.icon;
        const tone = TONES[action.tone] || TONES.indigo;
        return (
          <Link
            key={action.label}
            to={action.path}
            aria-label={action.description ? `${action.label}: ${action.description}` : action.label}
            className={`group relative flex min-w-0 items-center gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${tone.hover}`}
          >
            {/* Hover par halka gradient tint */}
            <span
              className={`pointer-events-none absolute inset-0 bg-linear-to-r ${tone.glow} to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none`}
            />

            <span
              className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-hover:rotate-0 ${tone.icon}`}
            >
              <Icon className="h-5 w-5" />
            </span>

            <span className="relative min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-slate-900">{action.label}</span>
              {action.description && (
                <span className="block truncate text-xs text-slate-500">{action.description}</span>
              )}
            </span>

            <ArrowUpRight
              aria-hidden="true"
              className="relative h-4 w-4 shrink-0 text-slate-300 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-600 motion-reduce:transition-none"
            />
          </Link>
        );
      })}
    </div>
  );
};

export default QuickActions;
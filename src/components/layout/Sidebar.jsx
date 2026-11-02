import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  X,
  LayoutDashboard,
  School,
  Users,
  GraduationCap,
  FileSpreadsheet,
  CreditCard,
  Sparkles,
  User,
  UserCheck,
  Printer,
  IndianRupee,
} from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';
import { selectUserRole } from '../../features/auth/authSelectors.js';
import { selectSidebarOpen, selectMobileNavOpen, closeMobileNav } from '../../store/slices/appSlice.js';
import { fetchBadgeCountsRequested } from '../../features/printRequestWorkflow/printRequestWorkflowSlice.js';
import { selectPrintRequestBadgeCounts } from '../../features/printRequestWorkflow/printRequestWorkflowSelectors.js';
import { MOBILE_NAV_ID, MOBILE_NAV_TOGGLE_ID } from './Header.jsx';

// Badge counts har 60 s (pages apna 30 s poll alag karte hain)
const BADGE_REFRESH_MS = 60000;
// Tailwind lg breakpoint — isse upar drawer nahi, normal sidebar
const DESKTOP_QUERY = '(min-width: 1024px)';
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const Sidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const userRole = useSelector(selectUserRole);
  const isOpen = useSelector(selectSidebarOpen);
  const mobileOpen = useSelector(selectMobileNavOpen);
  const badgeCounts = useSelector(selectPrintRequestBadgeCounts);
  const drawerRef = useRef(null);
  const closeRef = useRef(null);
  // Drawer ke links sirf khulne par (band hone ki slide khatam hone tak) — DOM mein nav do baar na rahe
  const [drawerContent, setDrawerContent] = useState(mobileOpen);
  if (mobileOpen && !drawerContent) setDrawerContent(true);

  useEffect(() => {
    if (!userRole) return undefined;
    dispatch(fetchBadgeCountsRequested());
    const timer = setInterval(() => dispatch(fetchBadgeCountsRequested()), BADGE_REFRESH_MS);
    return () => clearInterval(timer);
  }, [dispatch, userRole]);

  /* ---------- Mobile drawer ---------- */

  // Route badla → drawer band
  useEffect(() => {
    dispatch(closeMobileNav());
  }, [dispatch, location.pathname]);

  // Screen lg ya bada hua → drawer band
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const media = window.matchMedia(DESKTOP_QUERY);
    const onChange = (event) => {
      if (event.matches) dispatch(closeMobileNav());
    };
    media.addEventListener?.('change', onChange);
    return () => media.removeEventListener?.('change', onChange);
  }, [dispatch]);

  // Khula: page scroll band, focus X par, Esc / Tab trap; band: focus wapas hamburger par
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        dispatch(closeMobileNav());
        return;
      }
      if (event.key !== 'Tab' || !drawerRef.current) return;
      const items = Array.from(drawerRef.current.querySelectorAll(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || !drawerRef.current.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      body.style.overflow = previousOverflow;
      document.getElementById(MOBILE_NAV_TOGGLE_ID)?.focus({ preventScroll: true });
    };
  }, [mobileOpen, dispatch]);

  // Navigation Configuration with Granular Role-Based Access
  const navItems = [
    {
      label: 'Dashboard',
      path: ROUTES.DASHBOARD,
      icon: LayoutDashboard,
      roles: ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'OPERATOR'],
    },
    {
      label: 'Colleges',
      path: ROUTES.COLLEGES,
      icon: School,
      roles: ['SUPER_ADMIN', 'COLLEGE_ADMIN'],
    },
    {
      label: 'Users',
      path: ROUTES.USERS,
      icon: Users,
      roles: ['SUPER_ADMIN', 'COLLEGE_ADMIN'],
    },
    // College Admin Specific
    {
      label: 'Operator Assignments',
      path: ROUTES.OPERATOR_ASSIGNMENTS,
      icon: UserCheck,
      roles: ['COLLEGE_ADMIN'],
    },
    {
      label: 'Students',
      path: ROUTES.STUDENTS,
      icon: GraduationCap,
      roles: ['COLLEGE_ADMIN', 'OPERATOR'],
    },
    {
      label: 'Bulk Import',
      path: ROUTES.STUDENT_IMPORT,
      icon: FileSpreadsheet,
      roles: ['COLLEGE_ADMIN', 'OPERATOR'],
    },
    {
      label: 'Templates',
      path: ROUTES.TEMPLATES,
      icon: CreditCard,
      roles: ['SUPER_ADMIN', 'COLLEGE_ADMIN'],
    },
    // Purane "ID Card Generation" / "Generate ID Cards" pages URL se ab bhi khulte hain (print requests ke liye)
    {
      label: 'ID Cards',
      path: ROUTES.ID_CARDS,
      icon: Sparkles,
      roles: ['COLLEGE_ADMIN', 'OPERATOR'],
    },
    // Badge: Operator → Rejected, School Admin → Pending Approval
    {
      label: 'Print Requests',
      path: ROUTES.PRINT_REQUESTS,
      icon: Printer,
      roles: ['COLLEGE_ADMIN', 'OPERATOR'],
      badgeStatusByRole: { OPERATOR: 'REJECTED_BY_ADMIN', COLLEGE_ADMIN: 'PENDING_APPROVAL' },
    },
    // Super Admin Print Center — badge: New Requests
    {
      label: 'Print Center',
      path: ROUTES.PRINT_CENTER,
      icon: Printer,
      roles: ['SUPER_ADMIN'],
      badgeStatusByRole: { SUPER_ADMIN: 'APPROVED' },
    },
    // Rate per card + payments
    {
      label: 'Commission',
      path: ROUTES.COMMISSION,
      icon: IndianRupee,
      roles: ['SUPER_ADMIN'],
    },
    // Account Settings (All Authenticated)
    {
      label: 'My Account',
      path: ROUTES.ACCOUNT,
      icon: User,
      roles: ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'OPERATOR'],
    },
  ];

  // Filter items allowed for the authenticated user's role
  const visibleNavItems = navItems.filter(
    (item) => !item.roles || (userRole && item.roles.includes(userRole))
  );

  // Print request badge: is role ko kitni requests par dhyan dena hai
  const badgeFor = (item) => {
    const status = item.badgeStatusByRole?.[userRole];
    return status ? badgeCounts[status] || 0 : 0;
  };

  // Desktop aur mobile drawer dono yahi nav dikhate hain (expanded = labels ke saath)
  const renderNav = (expanded) => (
    <nav className="space-y-1" aria-label="Primary">
      {visibleNavItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`
            }
            title={!expanded ? item.label : undefined}
          >
            <span className="relative shrink-0">
              <Icon className="w-5 h-5" />
              {!expanded && badgeFor(item) > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-slate-900" aria-hidden="true" />
              )}
            </span>
            {expanded && <span className="flex-1">{item.label}</span>}
            {expanded && badgeFor(item) > 0 && (
              <span
                className="ml-auto min-w-5 rounded-full bg-rose-500 px-1.5 py-0.5 text-center text-[11px] font-bold leading-none text-white tabular-nums"
                aria-label={`${badgeFor(item)} need attention`}
              >
                {badgeFor(item) > 99 ? '99+' : badgeFor(item)}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/80 text-xs text-slate-400">
      <p className="font-semibold text-slate-300">School ID Cards System</p>
      <p className="text-[11px] text-slate-500 mt-0.5">Enterprise Release v2.0</p>
    </div>
  );

  return (
    <>
      {/* Desktop (lg+): pehle jaisa, layout ke andar */}
      <aside
        className={`bg-slate-900 text-slate-200 border-r border-slate-800 transition-all duration-300 hidden lg:flex flex-col z-20 shrink-0 ${isOpen ? 'w-64' : 'w-0 sm:w-20 overflow-hidden'
          }`}
        aria-label="Sidebar navigation"
      >
        <div className="p-4 flex flex-col h-full justify-between">
          <div className="space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {isOpen ? 'Main Navigation' : '•••'}
            </div>
            {renderNav(isOpen)}
          </div>

          {/* Sidebar Footer */}
          {isOpen && footer}
        </div>
      </aside>

      {/* Mobile (lg se chhota): overlay drawer — content ko dabata nahi */}
      <div className="lg:hidden">
        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-slate-900/50" aria-hidden="true" onClick={() => dispatch(closeMobileNav())} />
        )}
        <aside
          id={MOBILE_NAV_ID}
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Main menu"
          inert={!mobileOpen}
          onTransitionEnd={(e) => {
            if (!mobileOpen && e.target === e.currentTarget) setDrawerContent(false);
          }}
          className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] h-dvh overflow-y-auto bg-slate-900 text-slate-200 shadow-2xl transition-[transform,visibility] duration-200 ease-out motion-reduce:transition-none ${
            mobileOpen ? 'translate-x-0 visible' : '-translate-x-full invisible'
          }`}
        >
          {drawerContent && (
          <div className="p-4 flex flex-col min-h-full justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Main Navigation</span>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => dispatch(closeMobileNav())}
                  className="-mr-2 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {renderNav(true)}
            </div>
            {footer}
          </div>
          )}
        </aside>
      </div>
    </>
  );
};

export default Sidebar;

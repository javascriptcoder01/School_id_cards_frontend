import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
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
} from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';
import { selectUserRole } from '../../features/auth/authSelectors.js';
import { selectSidebarOpen } from '../../store/slices/appSlice.js';
import { fetchBadgeCountsRequested } from '../../features/printRequestWorkflow/printRequestWorkflowSlice.js';
import { selectPrintRequestBadgeCounts } from '../../features/printRequestWorkflow/printRequestWorkflowSelectors.js';

// Badge counts har 60 s (pages apna 30 s poll alag karte hain)
const BADGE_REFRESH_MS = 60000;

export const Sidebar = () => {
  const dispatch = useDispatch();
  const userRole = useSelector(selectUserRole);
  const isOpen = useSelector(selectSidebarOpen);
  const badgeCounts = useSelector(selectPrintRequestBadgeCounts);

  useEffect(() => {
    if (!userRole) return undefined;
    dispatch(fetchBadgeCountsRequested());
    const timer = setInterval(() => dispatch(fetchBadgeCountsRequested()), BADGE_REFRESH_MS);
    return () => clearInterval(timer);
  }, [dispatch, userRole]);

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

  return (
    <aside
      className={`bg-slate-900 text-slate-200 border-r border-slate-800 transition-all duration-300 flex flex-col z-20 shrink-0 ${isOpen ? 'w-64' : 'w-0 sm:w-20 overflow-hidden'
        }`}
      aria-label="Sidebar navigation"
    >
      <div className="p-4 flex flex-col h-full justify-between">
        <div className="space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {isOpen ? 'Main Navigation' : '•••'}
          </div>

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
                  title={!isOpen ? item.label : undefined}
                >
                  <span className="relative shrink-0">
                    <Icon className="w-5 h-5" />
                    {!isOpen && badgeFor(item) > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-slate-900" aria-hidden="true" />
                    )}
                  </span>
                  {isOpen && <span className="flex-1">{item.label}</span>}
                  {isOpen && badgeFor(item) > 0 && (
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
        </div>

        {/* Sidebar Footer */}
        {isOpen && (
          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/80 text-xs text-slate-400">
            <p className="font-semibold text-slate-300">School ID Cards System</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Enterprise Release v2.0</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

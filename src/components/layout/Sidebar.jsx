import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
  Eye,
} from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';
import { selectUserRole } from '../../features/auth/authSelectors.js';
import { selectSidebarOpen } from '../../store/slices/appSlice.js';

export const Sidebar = () => {
  const userRole = useSelector(selectUserRole);
  const isOpen = useSelector(selectSidebarOpen);

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
    {
      label: 'ID Card Generation',
      path: ROUTES.ID_CARD_GENERATIONS,
      icon: Sparkles,
      roles: ['COLLEGE_ADMIN'],
    },
    {
      label: 'Generate ID Cards',
      path: ROUTES.ID_CARD_GENERATE,
      icon: Sparkles,
      roles: ['OPERATOR'],
    },
    {
      label: 'Print Requests',
      path: ROUTES.PRINT_REQUESTS,
      icon: Printer,
      roles: ['COLLEGE_ADMIN', 'OPERATOR'],
    },
    // Super Admin Print Center
    {
      label: 'Print Center',
      path: ROUTES.SUPER_ADMIN_PRINT_CENTER,
      icon: Printer,
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
                  <Icon className="w-5 h-5 shrink-0" />
                  {isOpen && <span>{item.label}</span>}
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

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
} from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';
import { selectUserRole } from '../../features/auth/authSelectors.js';
import { selectSidebarOpen } from '../../store/slices/appSlice.js';

export const Sidebar = () => {
  const userRole = useSelector(selectUserRole);
  const isOpen = useSelector(selectSidebarOpen);

  // Navigation Configuration
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
    {
      label: 'Students',
      path: ROUTES.STUDENTS,
      icon: GraduationCap,
      roles: ['COLLEGE_ADMIN'],
    },
    {
      label: 'Bulk Import',
      path: ROUTES.STUDENT_IMPORT,
      icon: FileSpreadsheet,
      roles: ['COLLEGE_ADMIN'],
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
      className={`bg-slate-900 text-slate-200 border-r border-slate-800 transition-all duration-300 flex flex-col z-20 shrink-0 ${
        isOpen ? 'w-64' : 'w-0 sm:w-20 overflow-hidden'
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
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                  title={item.label}
                >
                  <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                  {isOpen && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {isOpen && (
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-400">
            <p className="font-semibold text-slate-300">School ID Cards</p>
            <p className="text-[11px] mt-0.5 text-slate-400">Security & Account Foundation</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

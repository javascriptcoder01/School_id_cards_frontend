import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut, User, Menu } from 'lucide-react';
import { logout } from '../../features/auth/authSlice.js';
import { selectCurrentUser } from '../../features/auth/authSelectors.js';
import { toggleSidebar } from '../../store/slices/appSlice.js';
import { ROUTES } from '../../constants/routes.js';

export const Header = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);

  const handleLogout = () => {
    dispatch(logout());
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'COLLEGE_ADMIN':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'OPERATOR':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => dispatch(toggleSidebar())}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            School ID Cards
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <Link
            to={ROUTES.ACCOUNT}
            className="flex items-center gap-3 group p-1.5 -m-1.5 rounded-2xl hover:bg-slate-50 transition-colors"
            title="View Account Settings"
          >
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
                {user.name || user.email || 'User'}
              </span>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full border mt-0.5 ${getRoleBadgeColor(
                  user.role
                )}`}
              >
                {user.role || 'USER'}
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform">
              <User className="w-4 h-4" />
            </div>
          </Link>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 focus:outline-hidden focus:ring-2 focus:ring-red-500"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;

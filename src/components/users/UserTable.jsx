import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit3, CheckCircle, XCircle, Users, Mail, Building, UserCheck } from 'lucide-react';
import { getUserDetailRoute, getUserEditRoute } from '../../constants/routes.js';
import { ROLES } from '../../constants/roles.js';
import EmptyState from '../common/EmptyState.jsx';
import Loader from '../common/Loader.jsx';

/**
 * UserTable Component
 * Renders the list of users with responsive table design, role badges, status toggling, and action links
 */
export const UserTable = ({
  users = [],
  isLoading = false,
  canEdit = false,
  statusLoadingId = null,
  onStatusToggle,
}) => {
  if (isLoading) {
    return <Loader message="Fetching users list..." />;
  }

  if (!users || users.length === 0) {
    return (
      <EmptyState
        title="No Users Found"
        description="No user accounts match your search or filter criteria. Try adjusting your query or create a new user."
        icon={Users}
      />
    );
  }

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case ROLES.SUPER_ADMIN:
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case ROLES.COLLEGE_ADMIN:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case ROLES.OPERATOR:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const formatRoleLabel = (role) => {
    switch (role) {
      case ROLES.SUPER_ADMIN:
        return 'Super Admin';
      case ROLES.COLLEGE_ADMIN:
        return 'College Admin';
      case ROLES.OPERATOR:
        return 'Operator';
      default:
        return role;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" aria-label="Users Directory">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">User</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Assigned College</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {users.map((user) => {
              const isToggling = statusLoadingId === user.id;

              return (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* User Profile */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {user.name ? user.name.slice(0, 2).toUpperCase() : <Users className="w-5 h-5" />}
                      </div>
                      <div>
                        <Link
                          to={getUserDetailRoute(user.id)}
                          className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors block"
                        >
                          {user.name}
                        </Link>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${getRoleBadgeStyle(
                        user.role
                      )}`}
                    >
                      {formatRoleLabel(user.role)}
                    </span>
                  </td>

                  {/* College Reference */}
                  <td className="py-4 px-4 text-xs text-slate-600">
                    {user.collegeId ? (
                      <div className="flex items-center gap-1.5 font-mono">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[150px]">{user.collegeId}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">System-wide</span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${user.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                    >
                      {user.isActive ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-rose-500" />
                          Inactive
                        </>
                      )}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      {/* View Action */}
                      <Link
                        to={getUserDetailRoute(user.id)}
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View details"
                        aria-label={`View ${user.name}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {/* Edit Action */}
                      {canEdit && (
                        <Link
                          to={getUserEditRoute(user.id)}
                          className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit user"
                          aria-label={`Edit ${user.name}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                      )}

                      {/* Status Toggle Action */}
                      {canEdit && onStatusToggle && (
                        <button
                          type="button"
                          disabled={isToggling}
                          onClick={() => onStatusToggle(user.id, !user.isActive)}
                          className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50 ${user.isActive
                              ? 'text-rose-600 border-rose-200 hover:bg-rose-50'
                              : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                            }`}
                          title={user.isActive ? 'Deactivate user' : 'Activate user'}
                        >
                          {isToggling ? '...' : user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;


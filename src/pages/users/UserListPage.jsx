import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Plus,
  Users,
  RefreshCw,
  LayoutGrid,
  Table2,
  Mail,
  Phone,
  School,
  BookOpen,
  UserCheck,
  UserX,
  Loader2,
} from 'lucide-react';
import {
  fetchUsersRequested,
  updateUserStatusRequested,
  setFilters,
  setPage,
  clearUserErrors,
} from '../../features/users/userSlice.js';
import {
  selectUsersList,
  selectUserPagination,
  selectUserFilters,
  selectUserListLoading,
  selectUserStatusLoading,
  selectUserListError,
  selectUserStatusError,
} from '../../features/users/userSelectors.js';
import { selectUserRole } from '../../features/auth/authSelectors.js';
import { ROUTES } from '../../constants/routes.js';
import { ROLES } from '../../constants/roles.js';
import UserSearch from '../../components/users/UserSearch.jsx';
import UserTable from '../../components/users/UserTable.jsx';
import UserPagination from '../../components/users/UserPagination.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';

/* ------------------------------------------------------------------ */
/* View mode (Table / Cards) — browser mein yaad rehta hai              */
/* ------------------------------------------------------------------ */

const VIEW_STORAGE_KEY = 'userList.viewMode';
const VIEWS = { TABLE: 'TABLE', CARDS: 'CARDS' };

const readView = () => {
  try {
    const saved = window.localStorage.getItem(VIEW_STORAGE_KEY);
    if (saved === VIEWS.TABLE || saved === VIEWS.CARDS) return saved;
  } catch {
    // storage band ho to default
  }
  // Pehli baar: chhoti screen par cards, badi par table
  return typeof window !== 'undefined' && window.innerWidth < 768 ? VIEWS.CARDS : VIEWS.TABLE;
};

const saveView = (view) => {
  try {
    window.localStorage.setItem(VIEW_STORAGE_KEY, view);
  } catch {
    // storage band ho to bhi chale
  }
};

/* ------------------------------------------------------------------ */
/* Card helpers (backend ke alag-alag shape sambhalte hain)             */
/* ------------------------------------------------------------------ */

const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  COLLEGE_ADMIN: 'School Admin',
  OPERATOR: 'Class Teacher',
};

const userIdOf = (user) => user?.id || user?._id;

const initialsOf = (name = '') =>
  String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || '?';

const collegeNameOf = (user) =>
  user?.college?.name || user?.collegeName || (typeof user?.collegeId === 'object' ? user.collegeId?.name : '') || '';

const classOf = (user) => {
  const source = user?.assignedClass || user?.classAssignment || user;
  const className = source?.className || source?.class || '';
  const section = source?.section || '';
  return className ? `${className}${section ? ` - ${section}` : ''}` : '';
};

// Naam ke pehle akshar se avatar ka rang (har user ka apna, par hamesha same)
const AVATAR_TONES = [
  'from-indigo-500 to-violet-600',
  'from-sky-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-amber-400 to-orange-500',
  'from-rose-500 to-pink-600',
  'from-fuchsia-500 to-purple-600',
];
const avatarToneOf = (name = '') => AVATAR_TONES[(String(name).charCodeAt(0) || 0) % AVATAR_TONES.length];

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

const HeroChip = ({ icon: Icon, label, value }) => (
  <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-2.5 py-1.5 ring-1 ring-white/15 backdrop-blur-sm">
    <Icon className="h-3.5 w-3.5 text-indigo-200" />
    <span className="text-sm font-extrabold tabular-nums">{value}</span>
    <span className="text-[11px] font-medium text-indigo-200">{label}</span>
  </span>
);

const ViewToggle = ({ value, onChange }) => (
  <div
    className="inline-flex rounded-xl bg-linear-to-r from-indigo-100/80 via-violet-100/70 to-fuchsia-100/70 p-1 ring-1 ring-indigo-200/50"
    role="tablist"
    aria-label="View"
  >
    {[
      { key: VIEWS.TABLE, label: 'Table', icon: Table2 },
      { key: VIEWS.CARDS, label: 'Cards', icon: LayoutGrid },
    ].map(({ key, label, icon: Icon }) => {
      const active = value === key;
      return (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={active}
          onClick={() => onChange(key)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 ${active
            ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30'
            : 'text-slate-600 hover:bg-white/70 hover:text-indigo-700'
            }`}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      );
    })}
  </div>
);

const UserCard = ({ user, canEdit, busy, onStatusToggle }) => {
  const id = userIdOf(user);
  const active = user?.isActive !== false;
  const className = classOf(user);
  const college = collegeNameOf(user);
  const phone = user?.phone || user?.mobile || user?.contact?.phone || '';

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border bg-white shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/10 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${active ? 'border-indigo-100' : 'border-slate-200'
        }`}
    >
      {/* Upar rangeen patti: active = indigo-violet, inactive = grey */}
      <div
        className={`h-1.5 bg-linear-to-r ${active ? 'from-indigo-500 via-violet-500 to-fuchsia-500' : 'from-slate-300 to-slate-400'}`}
      />

      <div className="p-3">
        <div className="flex items-start gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br text-sm font-black text-white shadow-md ${active ? avatarToneOf(user?.name) : 'from-slate-400 to-slate-500'
              }`}
          >
            {initialsOf(user?.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900" title={user?.name}>
              {user?.name || '—'}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-1">
              {user?.role && (
                <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 ring-1 ring-indigo-100">
                  {ROLE_LABELS[user.role] || user.role}
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ring-1 ${active ? 'bg-emerald-50 text-emerald-700 ring-emerald-100' : 'bg-slate-100 text-slate-500 ring-slate-200'
                  }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                {active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        <dl className="mt-3 space-y-1.5 text-xs">
          {user?.email && (
            <div className="flex min-w-0 items-center gap-2 text-slate-600">
              <Mail className="h-3.5 w-3.5 shrink-0 text-sky-500" />
              <dd className="truncate" title={user.email}>{user.email}</dd>
            </div>
          )}
          {phone && (
            <div className="flex min-w-0 items-center gap-2 text-slate-600">
              <Phone className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              <dd className="truncate">{phone}</dd>
            </div>
          )}
          {className && (
            <div className="flex min-w-0 items-center gap-2 text-slate-600">
              <BookOpen className="h-3.5 w-3.5 shrink-0 text-amber-500" />
              <dd className="truncate font-semibold text-slate-700">{className}</dd>
            </div>
          )}
          {college && (
            <div className="flex min-w-0 items-center gap-2 text-slate-600">
              <School className="h-3.5 w-3.5 shrink-0 text-violet-500" />
              <dd className="truncate" title={college}>{college}</dd>
            </div>
          )}
        </dl>

        {canEdit && id && (
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
            <span className="text-[11px] font-semibold text-slate-500">Access</span>
            {/* Wahi status toggle jo table mein hai */}
            <button
              type="button"
              role="switch"
              aria-checked={active}
              aria-label={`${active ? 'Deactivate' : 'Activate'} ${user?.name || 'user'}`}
              disabled={busy}
              onClick={() => onStatusToggle(id, !active)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-wait ${active ? 'bg-linear-to-r from-emerald-500 to-teal-500' : 'bg-slate-300'
                }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 motion-reduce:transition-none ${active ? 'translate-x-5.5' : 'translate-x-0.5'
                  }`}
              >
                {busy && <Loader2 className="h-3 w-3 animate-spin text-slate-500" />}
              </span>
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

const CardSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
    <div className="h-1.5 bg-slate-100" />
    <div className="animate-pulse space-y-3 p-3">
      <div className="flex items-center gap-3">
        <span className="h-10 w-10 rounded-xl bg-slate-100" />
        <span className="h-4 flex-1 rounded bg-slate-100" />
      </div>
      <span className="block h-3 w-3/4 rounded bg-slate-100" />
      <span className="block h-3 w-1/2 rounded bg-slate-100" />
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export const UserListPage = () => {
  const dispatch = useDispatch();

  const userRole = useSelector(selectUserRole);
  const users = useSelector(selectUsersList);
  const pagination = useSelector(selectUserPagination);
  const filters = useSelector(selectUserFilters);
  const isLoading = useSelector(selectUserListLoading);
  const isStatusLoading = useSelector(selectUserStatusLoading);
  const listError = useSelector(selectUserListError);
  const statusError = useSelector(selectUserStatusError);

  const [togglingId, setTogglingId] = useState(null);
  const [viewMode, setViewMode] = useState(readView);

  const isSuperAdmin = userRole === ROLES.SUPER_ADMIN;
  const isCollegeAdmin = userRole === ROLES.COLLEGE_ADMIN;
  const canManageUsers = isSuperAdmin || isCollegeAdmin;

  // Fetch users on filter or pagination changes
  useEffect(() => {
    if (canManageUsers) {
      const queryParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        isActive: filters.isActive,
      };

      if (isSuperAdmin && filters.role) {
        queryParams.role = filters.role;
      }
      if (isSuperAdmin && filters.collegeId) {
        queryParams.collegeId = filters.collegeId;
      }

      dispatch(fetchUsersRequested(queryParams));
    }
  }, [
    dispatch,
    canManageUsers,
    isSuperAdmin,
    pagination.page,
    pagination.limit,
    filters.search,
    filters.role,
    filters.isActive,
    filters.collegeId,
  ]);

  const handleSearchChange = (searchTerm) => {
    dispatch(setFilters({ search: searchTerm }));
  };

  const handleRoleFilterChange = (roleValue) => {
    dispatch(setFilters({ role: roleValue }));
  };

  const handleStatusFilterChange = (statusValue) => {
    dispatch(setFilters({ isActive: statusValue }));
  };

  const handleResetFilters = () => {
    dispatch(setFilters({ search: '', role: '', isActive: '', collegeId: '' }));
  };

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
  };

  const handleStatusToggle = (userId, newStatus) => {
    setTogglingId(userId);
    dispatch(
      updateUserStatusRequested({
        id: userId,
        isActive: newStatus,
        onSuccess: () => setTogglingId(null),
      })
    );
  };

  const handleRefresh = () => {
    const queryParams = {
      page: pagination.page,
      limit: pagination.limit,
      search: filters.search,
      isActive: filters.isActive,
    };
    if (isSuperAdmin && filters.role) queryParams.role = filters.role;
    if (isSuperAdmin && filters.collegeId) queryParams.collegeId = filters.collegeId;

    dispatch(fetchUsersRequested(queryParams));
  };

  const changeView = (view) => {
    setViewMode(view);
    saveView(view);
  };

  const list = Array.isArray(users) ? users : [];
  const total = pagination?.total ?? pagination?.totalItems ?? pagination?.totalDocs ?? list.length;
  const activeOnPage = list.filter((u) => u?.isActive !== false).length;
  const inactiveOnPage = list.length - activeOnPage;

  return (
    <div className="space-y-4">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-indigo-900 to-violet-800 px-4 py-3.5 text-white shadow-xl sm:px-5">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl" />

        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-400 via-violet-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/30 ring-1 ring-white/30">
              <Users className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-black tracking-tight sm:text-2xl">Class Teachers</h1>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <HeroChip icon={Users} label="Total" value={Number(total || 0).toLocaleString('en-IN')} />
                <HeroChip icon={UserCheck} label="Active" value={activeOnPage} />
                <HeroChip icon={UserX} label="Inactive" value={inactiveOnPage} />
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white/10 px-3 text-xs font-bold ring-1 ring-white/20 backdrop-blur-sm transition-colors hover:bg-white/20 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white disabled:cursor-wait disabled:opacity-70"
              title="Refresh directory"
              aria-label="Refresh directory"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin motion-reduce:animate-none' : ''}`} />
              <span className="hidden sm:inline">{isLoading ? 'Updating…' : 'Refresh'}</span>
            </button>

            {canManageUsers && (
              <Link
                to={ROUTES.USERS_NEW}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white px-3.5 text-xs font-extrabold text-indigo-700 shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:bg-indigo-50 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <Plus className="h-4 w-4" />
                <span>Add User</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Error Banners */}
      {listError && (
        <ErrorMessage
          message={listError}
          title="Error Loading Users"
          onDismiss={() => dispatch(clearUserErrors())}
        />
      )}

      {statusError && (
        <ErrorMessage
          message={statusError}
          title="Status Update Failed"
          onDismiss={() => dispatch(clearUserErrors())}
        />
      )}

      {/* Search & Filters + view toggle */}
      <div className="rounded-2xl border border-indigo-100/80 bg-linear-to-r from-white via-indigo-50/50 to-violet-50/60 p-2 shadow-xs">
        <UserSearch
          search={filters.search}
          role={filters.role}
          isActive={filters.isActive}
          isSuperAdmin={isSuperAdmin}
          onSearchChange={handleSearchChange}
          onRoleChange={handleRoleFilterChange}
          onStatusChange={handleStatusFilterChange}
          onReset={handleResetFilters}
        />
        <div className="mt-2 flex items-center justify-between gap-2 border-t border-indigo-100/70 pt-2">
          <p className="text-[11px] font-semibold text-slate-500">
            {isLoading && list.length === 0 ? 'Loading…' : `${list.length} on this page`}
          </p>
          <ViewToggle value={viewMode} onChange={changeView} />
        </div>
      </div>

      {/* Users: Table ya Cards */}
      {viewMode === VIEWS.TABLE ? (
        <div className="overflow-hidden rounded-2xl border border-indigo-100/80 bg-white shadow-sm shadow-indigo-500/5">
          <div className="h-1 bg-linear-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
          <UserTable
            users={users}
            isLoading={isLoading}
            canEdit={canManageUsers}
            statusLoadingId={isStatusLoading ? togglingId : null}
            onStatusToggle={handleStatusToggle}
          />
        </div>
      ) : isLoading && list.length === 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-indigo-200 bg-linear-to-br from-white to-indigo-50/60 px-4 py-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
            <Users className="h-6 w-6" />
          </span>
          <p className="mt-3 text-sm font-bold text-slate-800">No users found</p>
          <p className="mt-0.5 text-xs text-slate-500">Try another search or reset the filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {list.map((user) => {
            const id = userIdOf(user);
            return (
              <UserCard
                key={id}
                user={user}
                canEdit={canManageUsers}
                busy={isStatusLoading && togglingId === id}
                onStatusToggle={handleStatusToggle}
              />
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <UserPagination
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default UserListPage;
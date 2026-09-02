import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Plus, CreditCard, RefreshCw } from 'lucide-react';
import {
  fetchTemplatesRequested,
  updateTemplateStatusRequested,
  setTemplateFilters,
  clearTemplateErrors,
} from '../../features/templates/templateSlice.js';
import {
  selectTemplates,
  selectTemplatePagination,
  selectTemplateFilters,
  selectTemplatesLoading,
  selectTemplateStatusLoading,
  selectTemplateError,
} from '../../features/templates/templateSelectors.js';
import { selectUserRole } from '../../features/auth/authSelectors.js';
import { ROUTES } from '../../constants/routes.js';
import { ROLES } from '../../constants/roles.js';
import TemplateSearch from '../../components/templates/TemplateSearch.jsx';
import TemplateTable from '../../components/templates/TemplateTable.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';

export const TemplateListPage = () => {
  const dispatch = useDispatch();
  const userRole = useSelector(selectUserRole);

  const templates = useSelector(selectTemplates);
  const pagination = useSelector(selectTemplatePagination);
  const filters = useSelector(selectTemplateFilters);
  const isLoading = useSelector(selectTemplatesLoading);
  const isStatusLoading = useSelector(selectTemplateStatusLoading);
  const error = useSelector(selectTemplateError);

  const [togglingId, setTogglingId] = useState(null);

  const isCollegeAdmin = userRole === ROLES.COLLEGE_ADMIN;

  useEffect(() => {
    dispatch(
      fetchTemplatesRequested({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        collegeId: filters.collegeId,
      })
    );
  }, [dispatch, pagination.page, pagination.limit, filters.search, filters.collegeId]);

  const handleSearchChange = (searchTerm) => {
    dispatch(setTemplateFilters({ search: searchTerm }));
  };

  const handleResetSearch = () => {
    dispatch(setTemplateFilters({ search: '' }));
  };

  const handleStatusToggle = (templateId, newStatus) => {
    setTogglingId(templateId);
    dispatch(
      updateTemplateStatusRequested({
        id: templateId,
        isActive: newStatus,
        onSuccess: () => setTogglingId(null),
      })
    );
  };

  const handleRefresh = () => {
    dispatch(
      fetchTemplatesRequested({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        collegeId: filters.collegeId,
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-indigo-600" />
            ID Card Templates
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure ID card specifications, physical dimensions, and dynamic layout fields
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
            title="Refresh templates"
            aria-label="Refresh templates"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {isCollegeAdmin && (
            <Link
              to={ROUTES.TEMPLATES_NEW}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Template</span>
            </Link>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <ErrorMessage
          message={error}
          title="Error Loading Templates"
          onDismiss={() => dispatch(clearTemplateErrors())}
        />
      )}

      {/* Search Input */}
      <TemplateSearch
        search={filters.search}
        onSearchChange={handleSearchChange}
        onReset={handleResetSearch}
      />

      {/* Templates Table */}
      <TemplateTable
        templates={templates}
        isLoading={isLoading}
        canEdit={isCollegeAdmin}
        statusLoadingId={isStatusLoading ? togglingId : null}
        onStatusToggle={isCollegeAdmin ? handleStatusToggle : undefined}
      />
    </div>
  );
};

export default TemplateListPage;


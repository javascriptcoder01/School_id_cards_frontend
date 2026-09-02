import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit3, CreditCard, LayoutTemplate } from 'lucide-react';
import { getTemplateDetailRoute, getTemplateEditRoute } from '../../constants/routes.js';
import TemplateStatusBadge from './TemplateStatusBadge.jsx';
import EmptyState from '../common/EmptyState.jsx';
import Loader from '../common/Loader.jsx';

export const TemplateTable = ({
  templates = [],
  isLoading = false,
  canEdit = true,
  statusLoadingId = null,
  onStatusToggle,
}) => {
  if (isLoading) {
    return <Loader message="Fetching templates..." />;
  }

  if (!templates || templates.length === 0) {
    return (
      <EmptyState
        title="No Templates Found"
        description="No ID card templates match your query. Create a template to define layout, dimensions, and dynamic fields."
        icon={CreditCard}
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" aria-label="Templates Directory">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Template</th>
              <th className="py-3.5 px-4">Orientation</th>
              <th className="py-3.5 px-4">Dimensions</th>
              <th className="py-3.5 px-4">Fields</th>
              <th className="py-3.5 px-4">Colors</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {templates.map((tpl) => {
              const isToggling = statusLoadingId === tpl.id;

              return (
                <tr key={tpl.id} className="hover:bg-slate-50/80 transition-colors group">
                  {/* Template Name */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                        <LayoutTemplate className="w-5 h-5" />
                      </div>
                      <div>
                        <Link
                          to={getTemplateDetailRoute(tpl.id)}
                          className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors block"
                        >
                          {tpl.name}
                        </Link>
                        <span className="text-xs text-slate-400">
                          {tpl.fields ? `${tpl.fields.length} dynamic field(s)` : 'Layout Config'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Orientation */}
                  <td className="py-4 px-4 text-xs font-semibold">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                      {tpl.orientation || 'PORTRAIT'}
                    </span>
                  </td>

                  {/* Dimensions */}
                  <td className="py-4 px-4 text-xs font-mono text-slate-600">
                    {tpl.width} × {tpl.height} mm
                  </td>

                  {/* Fields Count */}
                  <td className="py-4 px-4 text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">{tpl.fields?.length || 0}</span> fields
                  </td>

                  {/* Colors Swatches */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5">
                      {tpl.primaryColor ? (
                        <div
                          className="w-4 h-4 rounded-full border border-slate-300 shadow-xs"
                          style={{ backgroundColor: tpl.primaryColor }}
                          title={`Primary: ${tpl.primaryColor}`}
                        />
                      ) : (
                        <span className="text-xs text-slate-400 italic">--</span>
                      )}
                      {tpl.secondaryColor && (
                        <div
                          className="w-4 h-4 rounded-full border border-slate-300 shadow-xs"
                          style={{ backgroundColor: tpl.secondaryColor }}
                          title={`Secondary: ${tpl.secondaryColor}`}
                        />
                      )}
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4 text-center">
                    <TemplateStatusBadge isActive={tpl.isActive} />
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      <Link
                        to={getTemplateDetailRoute(tpl.id)}
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View details"
                        aria-label={`View ${tpl.name}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {canEdit && (
                        <Link
                          to={getTemplateEditRoute(tpl.id)}
                          className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit template"
                          aria-label={`Edit ${tpl.name}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                      )}

                      {canEdit && onStatusToggle && (
                        <button
                          type="button"
                          disabled={isToggling}
                          onClick={() => onStatusToggle(tpl.id, !tpl.isActive)}
                          className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50 ${tpl.isActive
                              ? 'text-rose-600 border-rose-200 hover:bg-rose-50'
                              : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                            }`}
                          title={tpl.isActive ? 'Deactivate template' : 'Activate template'}
                        >
                          {isToggling ? '...' : tpl.isActive ? 'Deactivate' : 'Activate'}
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

export default TemplateTable;


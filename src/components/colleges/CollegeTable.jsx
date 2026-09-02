import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit3, CheckCircle, XCircle, School, Mail, Phone, MapPin } from 'lucide-react';
import { getCollegeDetailRoute, getCollegeEditRoute } from '../../constants/routes.js';
import EmptyState from '../common/EmptyState.jsx';
import Loader from '../common/Loader.jsx';

/**
 * CollegeTable Component
 * Renders the list of colleges with responsive table design, status toggling, and action links
 */
export const CollegeTable = ({
  colleges = [],
  isLoading = false,
  isSuperAdmin = false,
  statusLoadingId = null,
  onStatusToggle,
}) => {
  if (isLoading) {
    return <Loader message="Fetching colleges list..." />;
  }

  if (!colleges || colleges.length === 0) {
    return (
      <EmptyState
        title="No Colleges Found"
        description="No colleges match your current search or filter criteria. Try adjusting your query or create a new college."
        icon={School}
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" aria-label="Colleges Directory">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">College</th>
              <th className="py-3.5 px-4">Location</th>
              <th className="py-3.5 px-4">Contact</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {colleges.map((college) => {
              const address = college.address || {};
              const contact = college.contact || {};
              const locationStr = [address.city, address.state].filter(Boolean).join(', ');
              const isToggling = statusLoadingId === college._id;

              return (
                <tr
                  key={college._id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* College Name & Code */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      {college.logo ? (
                        <img
                          src={college.logo}
                          alt={`${college.name} logo`}
                          className="w-10 h-10 rounded-xl object-contain bg-slate-50 border border-slate-200 shrink-0"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                          {college.code ? college.code.slice(0, 2) : <School className="w-5 h-5" />}
                        </div>
                      )}
                      <div>
                        <Link
                          to={getCollegeDetailRoute(college._id)}
                          className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors block"
                        >
                          {college.name}
                        </Link>
                        <span className="inline-flex items-center text-xs font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md mt-0.5">
                          {college.code}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-4 px-4 text-slate-600 text-xs">
                    {locationStr ? (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{locationStr}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Not provided</span>
                    )}
                  </td>

                  {/* Contact */}
                  <td className="py-4 px-4 text-slate-600 text-xs">
                    <div className="space-y-1">
                      {contact.email ? (
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{contact.email}</span>
                        </div>
                      ) : null}
                      {contact.phone ? (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{contact.phone}</span>
                        </div>
                      ) : null}
                      {!contact.email && !contact.phone && (
                        <span className="text-slate-400 italic">No contact info</span>
                      )}
                    </div>
                  </td>

                  {/* Status Badge & Toggle */}
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${college.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                    >
                      {college.isActive ? (
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
                        to={getCollegeDetailRoute(college._id)}
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View details"
                        aria-label={`View ${college.name}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {/* Edit Action (SUPER_ADMIN) */}
                      {isSuperAdmin && (
                        <Link
                          to={getCollegeEditRoute(college._id)}
                          className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit college"
                          aria-label={`Edit ${college.name}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                      )}

                      {/* Status Toggle Action (SUPER_ADMIN) */}
                      {isSuperAdmin && onStatusToggle && (
                        <button
                          type="button"
                          disabled={isToggling}
                          onClick={() => onStatusToggle(college._id, !college.isActive)}
                          className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50 ${college.isActive
                              ? 'text-rose-600 border-rose-200 hover:bg-rose-50'
                              : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                            }`}
                          title={college.isActive ? 'Deactivate college' : 'Activate college'}
                        >
                          {isToggling ? '...' : college.isActive ? 'Deactivate' : 'Activate'}
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

export default CollegeTable;


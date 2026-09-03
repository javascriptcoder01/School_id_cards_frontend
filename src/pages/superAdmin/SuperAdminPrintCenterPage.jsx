import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Printer,
  Building,
  Clock,
  CheckCircle,
  RefreshCw,
  Layers,
  Search,
  Filter,
} from 'lucide-react';
import { fetchAdminPrintRequestsRequested } from '../../features/printRequests/printRequestSlice.js';
import {
  selectPrintRequests,
  selectIsPrintRequestLoading,
  selectPrintRequestError,
  selectPrintRequestsGroupedByCollege,
} from '../../features/printRequests/printRequestSelectors.js';
import { PRINT_REQUEST_STATUS } from '../../constants/printRequest.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import SuperAdminPrintQueueTable from '../../components/printRequests/SuperAdminPrintQueueTable.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';

export const SuperAdminPrintCenterPage = () => {
  const dispatch = useDispatch();
  const requests = useSelector(selectPrintRequests);
  const collegeGroups = useSelector(selectPrintRequestsGroupedByCollege);
  const isLoading = useSelector(selectIsPrintRequestLoading);
  const error = useSelector(selectPrintRequestError);

  const [filterCollegeId, setFilterCollegeId] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = () => {
    dispatch(fetchAdminPrintRequestsRequested());
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  // Aggregate Metrics from Loaded Queue Data
  const totalRequests = requests.length;
  const pendingReview = requests.filter(
    (r) => r.status === PRINT_REQUEST_STATUS.SENT_TO_SUPER_ADMIN
  ).length;
  const approved = requests.filter(
    (r) => r.status === PRINT_REQUEST_STATUS.SUPER_ADMIN_APPROVED
  ).length;
  const printing = requests.filter(
    (r) => r.status === PRINT_REQUEST_STATUS.PRINTING
  ).length;
  const completed = requests.filter(
    (r) => r.status === PRINT_REQUEST_STATUS.COMPLETED
  ).length;
  const rejected = requests.filter(
    (r) => r.status === PRINT_REQUEST_STATUS.SUPER_ADMIN_REJECTED
  ).length;

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    const cId =
      req.collegeId && typeof req.collegeId === 'object'
        ? req.collegeId.id || req.collegeId._id
        : req.collegeId;

    const collegeName =
      req.collegeId && typeof req.collegeId === 'object'
        ? req.collegeId.name || ''
        : '';

    if (filterCollegeId !== 'ALL' && cId !== filterCollegeId) return false;
    if (filterStatus !== 'ALL' && req.status !== filterStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = String(req.id || req._id).toLowerCase().includes(q);
      const matchCollege = collegeName.toLowerCase().includes(q);
      const matchOperator = (req.requestedBy?.name || '').toLowerCase().includes(q);
      if (!matchId && !matchCollege && !matchOperator) return false;
    }

    return true;
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Central ID Card Print Center"
        subtitle="Global multi-institution print queue management and export center"
        icon={Printer}
        action={
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        }
      />

      {error && <ErrorMessage message={error} title="Print Center Queue Error" />}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Colleges
          </span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{collegeGroups.length || 0}</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Requests
          </span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalRequests}</p>
        </div>

        <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-200 shadow-xs">
          <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
            Awaiting Approval
          </span>
          <p className="text-2xl font-extrabold text-indigo-900 mt-1">{pendingReview}</p>
        </div>

        <div className="p-4 bg-cyan-50/70 rounded-2xl border border-cyan-200 shadow-xs">
          <span className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider block">
            Approved
          </span>
          <p className="text-2xl font-extrabold text-cyan-900 mt-1">{approved}</p>
        </div>

        <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
            Printing
          </span>
          <p className="text-2xl font-extrabold text-amber-900 mt-1">{printing}</p>
        </div>

        <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
            Completed
          </span>
          <p className="text-2xl font-extrabold text-emerald-900 mt-1">{completed}</p>
        </div>

        <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200 shadow-xs">
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
            Rejected
          </span>
          <p className="text-2xl font-extrabold text-rose-900 mt-1">{rejected}</p>
        </div>
      </div>

      {/* College-Wise Breakdown View */}
      {collegeGroups.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-800">
              Institution Print Production Overview
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collegeGroups.map((group) => {
              const cId = group.college.id || group.college._id;
              const isSelected = filterCollegeId === cId;

              return (
                <div
                  key={cId}
                  onClick={() => setFilterCollegeId(isSelected ? 'ALL' : cId)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/60 border-indigo-400 ring-2 ring-indigo-500/20'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm truncate max-w-[180px]">
                      {group.college.name}
                    </h3>
                    <span className="text-xs font-mono font-semibold text-indigo-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {group.totalCards} Cards
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mt-3 text-center text-xs">
                    <div className="p-1 bg-white rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block">PENDING</span>
                      <span className="font-bold text-indigo-600">{group.pending}</span>
                    </div>
                    <div className="p-1 bg-white rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block">APPRVD</span>
                      <span className="font-bold text-cyan-600">{group.approved}</span>
                    </div>
                    <div className="p-1 bg-white rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block">PRINT</span>
                      <span className="font-bold text-amber-600">{group.printing}</span>
                    </div>
                    <div className="p-1 bg-white rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block">DONE</span>
                      <span className="font-bold text-emerald-600">{group.completed}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by request ID, institution name, operator..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value={PRINT_REQUEST_STATUS.SENT_TO_SUPER_ADMIN}>Pending Review</option>
            <option value={PRINT_REQUEST_STATUS.SUPER_ADMIN_APPROVED}>Super Admin Approved</option>
            <option value={PRINT_REQUEST_STATUS.PRINTING}>Printing in Progress</option>
            <option value={PRINT_REQUEST_STATUS.COMPLETED}>Completed</option>
            <option value={PRINT_REQUEST_STATUS.SUPER_ADMIN_REJECTED}>Rejected</option>
          </select>

          {filterCollegeId !== 'ALL' && (
            <button
              type="button"
              onClick={() => setFilterCollegeId('ALL')}
              className="px-3 py-2 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-xl hover:bg-indigo-100 transition-colors"
            >
              Clear College Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Print Queue Table */}
      <SuperAdminPrintQueueTable requests={filteredRequests} isLoading={isLoading} />
    </div>
  );
};

export default SuperAdminPrintCenterPage;

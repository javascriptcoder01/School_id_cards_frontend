import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Printer, RefreshCw, Search } from 'lucide-react';
import { loadPrintSummaryRequested } from '../../features/superAdminPrint/superAdminPrintSlice.js';
import {
  selectPrintSummaryColleges,
  selectPrintLoading,
  selectPrintError,
  selectIsPrintInitialized,
} from '../../features/superAdminPrint/superAdminPrintSelectors.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import PageLoader from '../../components/common/PageLoader.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import SuperAdminPrintSummary from '../../components/superAdmin/SuperAdminPrintSummary.jsx';
import CollegePrintQueueTable from '../../components/superAdmin/CollegePrintQueueTable.jsx';

export const SuperAdminPrintCenterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const colleges = useSelector(selectPrintSummaryColleges);
  const isLoading = useSelector(selectPrintLoading);
  const error = useSelector(selectPrintError);
  const isInitialized = useSelector(selectIsPrintInitialized);

  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(loadPrintSummaryRequested());
  }, [dispatch]);

  const handleRefresh = () => {
    if (!isLoading) {
      dispatch(loadPrintSummaryRequested());
    }
  };

  const handleViewCollege = (collegeId) => {
    navigate(`/super-admin/print-center/${collegeId}`);
  };

  const filteredColleges = (colleges || []).filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = item.college?.name?.toLowerCase() || '';
    const code = item.college?.code?.toLowerCase() || '';
    return name.includes(q) || code.includes(q);
  });

  if (isLoading && !isInitialized) {
    return <PageLoader message="Loading Central Print Management Queues..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Central Print Management"
        subtitle="Global oversight of student ID card printing queues, batch downloads, and PDF exports across all colleges."
        icon={Printer}
        action={
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
            title="Refresh Print Queues"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        }
      />

      {error && !isInitialized && (
        <ErrorState
          title="Print Center Error"
          message={error}
          onRetry={handleRefresh}
        />
      )}

      {/* Global Print Metrics Overview */}
      <SuperAdminPrintSummary colleges={colleges} isLoading={isLoading} />

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by college name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
          />
        </div>
      </div>

      {/* College Print Queues Table */}
      <CollegePrintQueueTable
        colleges={filteredColleges}
        onViewCollege={handleViewCollege}
      />
    </div>
  );
};

export default SuperAdminPrintCenterPage;

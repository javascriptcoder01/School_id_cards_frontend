import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UserCheck, Plus, RefreshCw, Search } from 'lucide-react';
import {
  loadOperatorAssignmentsRequested,
  createOperatorAssignmentRequested,
  updateOperatorAssignmentRequested,
  deleteOperatorAssignmentRequested,
} from '../../features/operatorAssignments/operatorAssignmentSlice.js';
import {
  selectOperatorAssignments,
  selectOperatorAssignmentsLoading,
  selectOperatorAssignmentsSaving,
  selectOperatorAssignmentsError,
  selectIsOperatorAssignmentsInitialized,
} from '../../features/operatorAssignments/operatorAssignmentSelectors.js';
import { fetchUsersRequested } from '../../features/users/userSlice.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import PageLoader from '../../components/common/PageLoader.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import OperatorAssignmentTable from '../../components/operatorAssignments/OperatorAssignmentTable.jsx';
import OperatorAssignmentDialog from '../../components/operatorAssignments/OperatorAssignmentDialog.jsx';

export const OperatorAssignmentsPage = () => {
  const dispatch = useDispatch();

  const assignments = useSelector(selectOperatorAssignments);
  const isLoading = useSelector(selectOperatorAssignmentsLoading);
  const isSaving = useSelector(selectOperatorAssignmentsSaving);
  const error = useSelector(selectOperatorAssignmentsError);
  const isInitialized = useSelector(selectIsOperatorAssignmentsInitialized);

  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [deactivatingId, setDeactivatingId] = useState(null);

  useEffect(() => {
    dispatch(loadOperatorAssignmentsRequested());
    dispatch(fetchUsersRequested({ role: 'OPERATOR' }));
  }, [dispatch]);

  const handleRefresh = () => {
    if (!isLoading) {
      dispatch(loadOperatorAssignmentsRequested());
      dispatch(fetchUsersRequested({ role: 'OPERATOR' }));
    }
  };

  const handleOpenCreate = () => {
    setEditingAssignment(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (assignment) => {
    setEditingAssignment(assignment);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAssignment(null);
  };

  const handleSubmitAssignment = (formData) => {
    if (editingAssignment) {
      dispatch(
        updateOperatorAssignmentRequested({
          assignmentId: editingAssignment.id || editingAssignment._id,
          updates: formData,
        })
      );
    } else {
      dispatch(createOperatorAssignmentRequested(formData));
    }
    handleCloseDialog();
  };

  const handleConfirmDeactivate = () => {
    if (deactivatingId) {
      dispatch(deleteOperatorAssignmentRequested(deactivatingId));
      setDeactivatingId(null);
    }
  };

  const filteredAssignments = (assignments || []).filter((asgn) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const opName = asgn.operatorId?.name?.toLowerCase() || '';
    const opEmail = asgn.operatorId?.email?.toLowerCase() || '';
    const className = asgn.className?.toLowerCase() || '';
    const section = asgn.section?.toLowerCase() || '';
    return (
      opName.includes(q) ||
      opEmail.includes(q) ||
      className.includes(q) ||
      section.includes(q)
    );
  });

  if (isLoading && !isInitialized) {
    return <PageLoader message="Loading operator assignments..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Class Operator Assignments"
        subtitle="Delegate student roster management, data entry, and ID card generation to operators per class and section."
        icon={UserCheck}
        action={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Assign Operator</span>
            </button>
          </div>
        }
      />

      {error && !isInitialized && (
        <ErrorState
          title="Failed to Load Assignments"
          message={error}
          onRetry={handleRefresh}
        />
      )}

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by operator, class, or section..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
          />
        </div>
      </div>

      {/* Assignments Table */}
      <OperatorAssignmentTable
        assignments={filteredAssignments}
        onEdit={handleOpenEdit}
        onDeactivate={(id) => setDeactivatingId(id)}
      />

      {/* Create / Edit Dialog */}
      <OperatorAssignmentDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        initialValues={editingAssignment}
        onSubmit={handleSubmitAssignment}
        isSaving={isSaving}
      />

      {/* Deactivate Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deactivatingId)}
        onClose={() => setDeactivatingId(null)}
        onConfirm={handleConfirmDeactivate}
        title="Deactivate Operator Assignment"
        message="Are you sure you want to revoke this operator's management access for this class and section? The operator will no longer be able to create or edit students in this scope."
        confirmText="Deactivate"
        variant="danger"
      />
    </div>
  );
};

export default OperatorAssignmentsPage;

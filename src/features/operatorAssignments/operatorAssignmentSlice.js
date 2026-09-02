import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    assignments: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    loading: false,
    saving: false,
    deleting: false,
    error: null,
    initialized: false,
};

export const operatorAssignmentSlice = createSlice({
    name: 'operatorAssignments',
    initialState,
    reducers: {
        // 1. Load Operator Assignments List
        loadOperatorAssignmentsRequested: (state) => {
            state.loading = true;
            state.error = null;
        },
        loadOperatorAssignmentsSucceeded: (state, action) => {
            state.loading = false;
            state.initialized = true;
            state.assignments = action.payload?.assignments || [];
            state.pagination = action.payload?.pagination || initialState.pagination;
            state.error = null;
        },
        loadOperatorAssignmentsFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload || 'Failed to load operator assignments';
        },

        // 2. Create Operator Assignment
        createOperatorAssignmentRequested: (state) => {
            state.saving = true;
            state.error = null;
        },
        createOperatorAssignmentSucceeded: (state, action) => {
            state.saving = false;
            const created = action.payload?.assignment || action.payload;
            if (created) {
                state.assignments.unshift(created);
            }
            state.error = null;
        },
        createOperatorAssignmentFailed: (state, action) => {
            state.saving = false;
            state.error = action.payload || 'Failed to create operator assignment';
        },

        // 3. Update Operator Assignment
        updateOperatorAssignmentRequested: (state) => {
            state.saving = true;
            state.error = null;
        },
        updateOperatorAssignmentSucceeded: (state, action) => {
            state.saving = false;
            const updated = action.payload?.assignment || action.payload;
            if (updated) {
                const id = updated.id || updated._id;
                state.assignments = state.assignments.map((item) =>
                    (item.id || item._id) === id ? updated : item
                );
            }
            state.error = null;
        },
        updateOperatorAssignmentFailed: (state, action) => {
            state.saving = false;
            state.error = action.payload || 'Failed to update operator assignment';
        },

        // 4. Delete / Deactivate Operator Assignment
        deleteOperatorAssignmentRequested: (state) => {
            state.deleting = true;
            state.error = null;
        },
        deleteOperatorAssignmentSucceeded: (state, action) => {
            state.deleting = false;
            const assignmentId = action.payload?.assignmentId || action.payload;
            if (assignmentId) {
                state.assignments = state.assignments.filter(
                    (item) => (item.id || item._id) !== assignmentId
                );
            }
            state.error = null;
        },
        deleteOperatorAssignmentFailed: (state, action) => {
            state.deleting = false;
            state.error = action.payload || 'Failed to deactivate operator assignment';
        },

        // 5. Clear / Reset
        clearOperatorAssignmentError: (state) => {
            state.error = null;
        },
        resetOperatorAssignmentState: () => initialState,
    },
    extraReducers: (builder) => {
        builder.addCase('auth/logoutSucceeded', () => initialState);
        builder.addCase('auth/logout', () => initialState);
    },
});

export const {
    loadOperatorAssignmentsRequested,
    loadOperatorAssignmentsSucceeded,
    loadOperatorAssignmentsFailed,
    createOperatorAssignmentRequested,
    createOperatorAssignmentSucceeded,
    createOperatorAssignmentFailed,
    updateOperatorAssignmentRequested,
    updateOperatorAssignmentSucceeded,
    updateOperatorAssignmentFailed,
    deleteOperatorAssignmentRequested,
    deleteOperatorAssignmentSucceeded,
    deleteOperatorAssignmentFailed,
    clearOperatorAssignmentError,
    resetOperatorAssignmentState,
} = operatorAssignmentSlice.actions;

export default operatorAssignmentSlice.reducer;


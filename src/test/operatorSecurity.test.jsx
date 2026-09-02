import { describe, it, expect } from 'vitest';
import operatorReducer from '../features/operator/operatorSlice.js';

describe('OPERATOR WORKSPACE SECURITY & STATE PURGE', () => {
  it('1. Operator state is completely purged on auth/logout', () => {
    const populatedState = {
      dashboard: { summary: { totalStudents: 50 } },
      students: [{ id: 's-1', name: 'Aarav' }],
      selectedStudent: { id: 's-1' },
      templates: [{ id: 't-1' }],
      preview: { previewImage: 'data:...' },
      generations: [{ id: 'g-1' }],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      generationsPagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      loading: false,
      loadingStudents: false,
      loadingTemplates: false,
      loadingGenerations: false,
      saving: false,
      importing: false,
      previewing: false,
      generating: false,
      error: null,
      initialized: true,
    };

    const state = operatorReducer(populatedState, { type: 'auth/logout' });
    expect(state.dashboard).toBeNull();
    expect(state.students).toHaveLength(0);
    expect(state.preview).toBeNull();
    expect(state.generations).toHaveLength(0);
    expect(state.initialized).toBe(false);
  });
});

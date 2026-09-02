import { describe, it, expect } from 'vitest';
import collegeProgressReducer from '../features/collegeProgress/collegeProgressSlice.js';

describe('COLLEGE PROGRESS SECURITY & PURGE', () => {
  it('1. College progress state is completely purged on auth/logout', () => {
    const populated = {
      progress: {
        summary: { totalStudents: 100 },
        operators: [{ operator: { name: 'Teacher' } }],
      },
      loading: false,
      error: null,
      initialized: true,
    };

    const state = collegeProgressReducer(populated, { type: 'auth/logout' });
    expect(state.progress).toBeNull();
    expect(state.initialized).toBe(false);
  });
});

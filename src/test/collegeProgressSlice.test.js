import { describe, it, expect } from 'vitest';
import collegeProgressReducer, {
  loadCollegeProgressRequested,
  loadCollegeProgressSucceeded,
  loadCollegeProgressFailed,
  clearCollegeProgress,
  resetCollegeProgressState,
} from '../features/collegeProgress/collegeProgressSlice.js';

describe('COLLEGE PROGRESS SLICE', () => {
  const initialState = {
    progress: null,
    loading: false,
    error: null,
    initialized: false,
  };

  it('1. returns expected initial state', () => {
    expect(collegeProgressReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('2. handles loadCollegeProgressRequested and Succeeded', () => {
    let state = collegeProgressReducer(initialState, loadCollegeProgressRequested());
    expect(state.loading).toBe(true);

    const mockProgress = { summary: { totalOperators: 2 }, operators: [] };
    state = collegeProgressReducer(state, loadCollegeProgressSucceeded(mockProgress));
    expect(state.loading).toBe(false);
    expect(state.initialized).toBe(true);
    expect(state.progress).toEqual(mockProgress);
  });

  it('3. clears state on auth/logoutSucceeded', () => {
    const populated = { progress: { summary: {} }, loading: false, error: null, initialized: true };
    const state = collegeProgressReducer(populated, { type: 'auth/logoutSucceeded' });
    expect(state).toEqual(initialState);
  });
});

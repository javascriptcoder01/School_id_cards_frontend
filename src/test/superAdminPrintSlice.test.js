import { describe, it, expect } from 'vitest';
import superAdminPrintReducer, {
  loadPrintSummaryRequested,
  loadPrintSummarySucceeded,
  loadCollegePrintDetailsRequested,
  loadCollegePrintDetailsSucceeded,
  downloadResultPngRequested,
  downloadResultPngSucceeded,
  downloadCollegeZipRequested,
  downloadCollegeZipSucceeded,
  downloadCollegePdfRequested,
  downloadCollegePdfSucceeded,
  resetSuperAdminPrintState,
} from '../features/superAdminPrint/superAdminPrintSlice.js';

describe('SUPER ADMIN PRINT CENTER SLICE', () => {
  const initialState = {
    summary: null,
    selectedCollege: null,
    loading: false,
    loadingCollege: false,
    downloading: false,
    downloadType: null,
    currentDownload: null,
    error: null,
    initialized: false,
  };

  it('1. returns expected initial state', () => {
    expect(superAdminPrintReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('2. handles summary and college loading', () => {
    let state = superAdminPrintReducer(initialState, loadPrintSummaryRequested());
    expect(state.loading).toBe(true);

    state = superAdminPrintReducer(state, loadPrintSummarySucceeded({ colleges: [{ college: { id: 'col-1' } }] }));
    expect(state.loading).toBe(false);
    expect(state.initialized).toBe(true);
    expect(state.summary.colleges).toHaveLength(1);
  });

  it('3. handles download state lifecycle for PNG, ZIP, and PDF', () => {
    let state = superAdminPrintReducer(initialState, downloadResultPngRequested({ resultId: 'res-1' }));
    expect(state.downloading).toBe(true);
    expect(state.downloadType).toBe('PNG');

    state = superAdminPrintReducer(state, downloadResultPngSucceeded());
    expect(state.downloading).toBe(false);
    expect(state.downloadType).toBeNull();

    state = superAdminPrintReducer(state, downloadCollegePdfRequested({ collegeId: 'col-1' }));
    expect(state.downloading).toBe(true);
    expect(state.downloadType).toBe('PDF');

    state = superAdminPrintReducer(state, downloadCollegePdfSucceeded());
    expect(state.downloading).toBe(false);
  });

  it('4. clears state on auth/logoutSucceeded', () => {
    const populated = { ...initialState, summary: { colleges: [] }, initialized: true };
    const state = superAdminPrintReducer(populated, { type: 'auth/logoutSucceeded' });
    expect(state).toEqual(initialState);
  });
});


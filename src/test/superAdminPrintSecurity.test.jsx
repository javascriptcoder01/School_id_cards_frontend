import { describe, it, expect } from 'vitest';
import superAdminPrintReducer from '../features/superAdminPrint/superAdminPrintSlice.js';

describe('SUPER ADMIN PRINT SECURITY & PURGE', () => {
  it('1. Print Center state is completely purged on auth/logout', () => {
    const populated = {
      summary: { colleges: [{ college: { id: 'c-1' } }] },
      selectedCollege: { college: { id: 'c-1' }, cards: [] },
      loading: false,
      loadingCollege: false,
      downloading: false,
      downloadType: null,
      currentDownload: null,
      error: null,
      initialized: true,
    };

    const state = superAdminPrintReducer(populated, { type: 'auth/logout' });
    expect(state.summary).toBeNull();
    expect(state.selectedCollege).toBeNull();
    expect(state.initialized).toBe(false);
  });
});

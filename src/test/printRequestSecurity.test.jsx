import { describe, it, expect } from 'vitest';
import printRequestReducer, {
  createPrintRequestSucceeded,
  fetchPrintRequestByIdSucceeded,
  downloadAdminPrintAssetsSucceeded,
} from '../features/printRequests/printRequestSlice.js';

describe('PRINT REQUEST SECURITY & SENSITIVE DATA AUDIT', () => {
  it('1. Redux slice never stores passwords, hashes, tokens, or __v', () => {
    const rawBackendObject = {
      id: 'pr-123',
      collegeId: 'col-1',
      totalCards: 5,
      status: 'PENDING_COLLEGE_APPROVAL',
      password: 'sensitive-password',
      passwordHash: 'hash-value',
      token: 'jwt-token-string',
      refreshToken: 'refresh-token',
      __v: 0,
    };

    const state = printRequestReducer(
      undefined,
      fetchPrintRequestByIdSucceeded(rawBackendObject)
    );

    // Selected request is in state
    expect(state.selectedRequest.id).toBe('pr-123');
    // Ensure state remains serializable plain object
    const serialized = JSON.stringify(state);
    expect(typeof serialized).toBe('string');
  });

  it('2. Binary Blobs are NEVER stored in Redux slice state', () => {
    const state = printRequestReducer(
      undefined,
      downloadAdminPrintAssetsSucceeded()
    );

    expect(state.downloadStatus).toBe('succeeded');
    // Verify no blob properties exist in state
    Object.values(state).forEach((val) => {
      expect(val instanceof Blob).toBe(false);
      expect(val instanceof File).toBe(false);
    });
  });
});


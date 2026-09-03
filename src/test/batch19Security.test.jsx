import { describe, it, expect } from 'vitest';
import { getSanitizedErrorMessage } from '../api/apiError.js';
import printRequestReducer from '../features/printRequests/printRequestSlice.js';
import operatorReducer from '../features/operator/operatorSlice.js';

describe('Batch 19 Security & State Invariants', () => {
  describe('Error Sanitization', () => {
    it('sanitizes MongoDB and backend internal errors into user-friendly messages', () => {
      const dbError = {
        response: {
          data: {
            message: 'E11000 duplicate key error collection: students index: studentId_1 dup key: { studentId: "STU-001" }',
          },
        },
      };
      const sanitized = getSanitizedErrorMessage(dbError, 'Failed to create student');
      expect(sanitized).toBe('Something went wrong. Please try again.');
    });

    it('sanitizes validation errors properly', () => {
      const valError = {
        response: {
          data: {
            message: 'Validation failed: name is required, photo is required',
          },
        },
      };
      const sanitized = getSanitizedErrorMessage(valError, 'Validation error');
      expect(sanitized).toBe('Validation failed: name is required, photo is required');
    });
  });

  describe('Redux State Purity & Invariants', () => {
    it('ensures printRequestSlice does NOT store binary Blob objects in Redux state', () => {
      const state = printRequestReducer(undefined, { type: '@@INIT' });
      expect(state.downloadStatus).toBe('idle');
      expect(state.error).toBeNull();
      // Ensure no blob property exists in state
      expect(state.blob).toBeUndefined();
      expect(state.fileData).toBeUndefined();
    });

    it('ensures operatorSlice state holds serializable values only', () => {
      const state = operatorReducer(undefined, { type: '@@INIT' });
      expect(Array.isArray(state.students)).toBe(true);
      expect(Array.isArray(state.templates)).toBe(true);
      expect(typeof state.loading).toBe('boolean');
    });
  });
});

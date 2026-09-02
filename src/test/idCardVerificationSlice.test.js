import { describe, it, expect } from 'vitest';
import idCardVerificationReducer, {
  verifyRequested,
  verifySucceeded,
  verifyFailed,
  clearVerification,
} from '../features/idCardVerification/idCardVerificationSlice.js';

describe('ID CARD VERIFICATION REDUX SLICE', () => {
  const initialState = {
    verificationData: null,
    status: 'IDLE',
    error: null,
    initialized: false,
  };

  it('1. Returns initial state on init', () => {
    expect(idCardVerificationReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('2. Handles verifyRequested transition', () => {
    const loadingState = idCardVerificationReducer(initialState, verifyRequested('test-token'));
    expect(loadingState.status).toBe('VERIFYING');
    expect(loadingState.error).toBeNull();
    expect(loadingState.initialized).toBe(true);
    expect(loadingState.verificationData).toBeNull();
  });

  it('3. Handles verifySucceeded and strictly sanitizes payload', () => {
    const rawPayload = {
      verified: true,
      student: { studentId: 'STU-001', name: 'Aarav Patel', _id: 'mongo123', password: 'secret' },
      college: { name: 'Stanford University', _id: 'col123' },
      generatedAt: '2026-08-31T18:45:00.000Z',
      token: 'raw-token-should-not-be-kept',
      storageKey: '/var/www/uploads/cards/card.png',
    };

    const successState = idCardVerificationReducer(
      { ...initialState, status: 'VERIFYING' },
      verifySucceeded(rawPayload)
    );

    expect(successState.status).toBe('VERIFIED');
    expect(successState.error).toBeNull();
    expect(successState.verificationData).toEqual({
      verified: true,
      student: {
        studentId: 'STU-001',
        name: 'Aarav Patel',
      },
      college: {
        name: 'Stanford University',
      },
      generatedAt: '2026-08-31T18:45:00.000Z',
    });
    // Ensure sensitive properties are omitted
    expect(successState.verificationData).not.toHaveProperty('token');
    expect(successState.verificationData).not.toHaveProperty('storageKey');
    expect(successState.verificationData.student).not.toHaveProperty('_id');
    expect(successState.verificationData.student).not.toHaveProperty('password');
  });

  it('4. Handles verifyFailed transition', () => {
    const failState = idCardVerificationReducer(
      { ...initialState, status: 'VERIFYING' },
      verifyFailed('ID card verification record not found or invalid.')
    );
    expect(failState.status).toBe('FAILED');
    expect(failState.verificationData).toBeNull();
    expect(failState.error).toBe('ID card verification record not found or invalid.');
  });

  it('5. Handles clearVerification', () => {
    const dirtyState = {
      verificationData: { verified: true },
      status: 'VERIFIED',
      error: null,
      initialized: true,
    };
    expect(idCardVerificationReducer(dirtyState, clearVerification())).toEqual(initialState);
  });
});


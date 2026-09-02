import { describe, it, expect } from 'vitest';
import {
  normalizeApiError,
  formatSafeApiError,
} from '../api/apiError.js';

describe('GLOBAL ERROR NORMALIZATION', () => {
  it('1. Returns safe generic fallback for empty error', () => {
    const error = normalizeApiError(null);
    expect(error).toEqual({
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong. Please try again.',
      errors: [],
    });
  });

  it('2. Extracts message from Axios response data', () => {
    const axiosError = {
      response: {
        status: 400,
        data: { message: 'College name is already in use.', code: 'DUPLICATE_NAME' },
      },
    };
    const normalized = normalizeApiError(axiosError);
    expect(normalized.statusCode).toBe(400);
    expect(normalized.code).toBe('DUPLICATE_NAME');
    expect(normalized.message).toBe('College name is already in use.');
  });

  it('3. Sanitizes backend database errors and server stack traces', () => {
    const leakedDbError = {
      response: {
        status: 500,
        data: {
          message: 'MongoServerError: E11000 duplicate key error collection: test.colleges index at /server/db.js:40',
        },
      },
    };
    const normalized = normalizeApiError(leakedDbError);
    expect(normalized.message).toBe('Something went wrong. Please try again.');
    expect(normalized.message).not.toContain('MongoServerError');
    expect(normalized.message).not.toContain('/server/');
  });

  it('4. formatSafeApiError produces concise { message, code } output', () => {
    const axiosError = {
      response: {
        status: 404,
        data: { message: 'Template not found.', code: 'NOT_FOUND' },
      },
    };
    const formatted = formatSafeApiError(axiosError);
    expect(formatted).toEqual({
      message: 'Template not found.',
      code: 'NOT_FOUND',
    });
  });
});


import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient, { setUnauthorizedHandler } from '../api/apiClient.js';
import { getAuthToken, setAuthTokens } from '../utils/storage.js';

describe('BATCH 16 — SESSION FAILURE & 401 HANDLING', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('1. 401 Unauthorized clears auth storage and invokes unauthorized handler', async () => {
    setAuthTokens('stale-token-123', 'stale-refresh-token');

    const mockUnauthorizedHandler = vi.fn();
    setUnauthorizedHandler(mockUnauthorizedHandler);

    // Mock axios error to reject with 401
    const axiosError = {
      response: {
        status: 401,
        data: { message: 'Token expired or invalid', code: 'UNAUTHORIZED' },
      },
    };

    // Trigger response interceptor rejection
    const responseInterceptor = apiClient.interceptors.response.handlers[0].rejected;

    await expect(responseInterceptor(axiosError)).rejects.toMatchObject({
      statusCode: 401,
      message: 'Token expired or invalid',
    });

    // Verify auth token was cleared
    expect(getAuthToken()).toBeNull();
    expect(mockUnauthorizedHandler).toHaveBeenCalledTimes(1);
  });

  it('2. 403 Forbidden is distinguishable from 401 and does not clear session storage', async () => {
    setAuthTokens('active-token-456', 'active-refresh-token');

    const mockUnauthorizedHandler = vi.fn();
    setUnauthorizedHandler(mockUnauthorizedHandler);

    const axios403Error = {
      response: {
        status: 403,
        data: { message: 'Insufficient role permissions', code: 'FORBIDDEN' },
      },
    };

    const responseInterceptor = apiClient.interceptors.response.handlers[0].rejected;

    await expect(responseInterceptor(axios403Error)).rejects.toMatchObject({
      statusCode: 403,
      message: 'Insufficient role permissions',
    });

    // 403 must NOT clear authentication storage
    expect(getAuthToken()).toBe('active-token-456');
    expect(mockUnauthorizedHandler).not.toHaveBeenCalled();
  });
});


import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient, setUnauthorizedHandler } from '../api/apiClient.js';
import { normalizeApiError } from '../api/apiError.js';
import { setAuthTokens, clearAuthStorage, getAuthToken } from '../utils/storage.js';

describe('GROUP B — API CLIENT & ERROR NORMALIZATION', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. API client baseURL is configured with default or environment value', () => {
    expect(apiClient.defaults.baseURL).toBeDefined();
    expect(apiClient.defaults.baseURL).toContain('/api');
  });

  it('2. Request interceptor attaches Bearer token when token exists in storage', async () => {
    setAuthTokens('valid-jwt-token-xyz', 'refresh-token-xyz');
    expect(getAuthToken()).toBe('valid-jwt-token-xyz');

    const config = { headers: {} };
    // Get the registered request fulfillment interceptor
    const requestInterceptor = apiClient.interceptors.request.handlers[0].fulfilled;
    const modifiedConfig = await requestInterceptor(config);

    expect(modifiedConfig.headers.Authorization).toBe('Bearer valid-jwt-token-xyz');
  });

  it('3. Request interceptor does NOT attach Authorization header when token is missing', async () => {
    clearAuthStorage();
    expect(getAuthToken()).toBeNull();

    const config = { headers: {} };
    const requestInterceptor = apiClient.interceptors.request.handlers[0].fulfilled;
    const modifiedConfig = await requestInterceptor(config);

    expect(modifiedConfig.headers.Authorization).toBeUndefined();
  });

  it('4. Request interceptor does NOT attach "Bearer null" or "Bearer undefined"', async () => {
    localStorage.setItem('school_id_cards_access_token', 'null');
    const config1 = { headers: {} };
    const requestInterceptor = apiClient.interceptors.request.handlers[0].fulfilled;
    const res1 = await requestInterceptor(config1);
    expect(res1.headers.Authorization).toBeUndefined();

    localStorage.setItem('school_id_cards_access_token', 'undefined');
    const config2 = { headers: {} };
    const res2 = await requestInterceptor(config2);
    expect(res2.headers.Authorization).toBeUndefined();
  });

  it('5. normalizeApiError converts backend response error into safe normalized format', () => {
    const axiosError = {
      response: {
        status: 400,
        data: {
          success: false,
          message: 'Invalid credentials provided',
          errors: [{ field: 'email', message: 'Email is invalid' }],
        },
      },
    };

    const normalized = normalizeApiError(axiosError);
    expect(normalized.statusCode).toBe(400);
    expect(normalized.message).toBe('Invalid credentials provided');
    expect(normalized.errors).toHaveLength(1);
  });

  it('6. normalizeApiError handles network failures safely without crashing', () => {
    const networkError = {
      request: {},
      message: 'Network Error',
    };

    const normalized = normalizeApiError(networkError);
    expect(normalized.statusCode).toBe(0);
    expect(normalized.message).toContain('Unable to connect to the server');
    expect(normalized.errors).toEqual([]);
  });

  it('7. normalizeApiError handles completely unexpected error objects safely', () => {
    const unexpectedError = new Error('Random JS runtime exception');
    const normalized = normalizeApiError(unexpectedError);
    expect(normalized.statusCode).toBe(500);
    expect(normalized.message).toBe('Random JS runtime exception');
  });

  it('8. Response interceptor on 401 triggers unauthorized handler and clears storage', async () => {
    setAuthTokens('some-token', 'some-refresh');
    const mockHandler = vi.fn();
    setUnauthorizedHandler(mockHandler);

    const errorInterceptor = apiClient.interceptors.response.handlers[0].rejected;
    const axios401Error = {
      response: {
        status: 401,
        data: { message: 'Token expired' },
      },
    };

    await expect(errorInterceptor(axios401Error)).rejects.toMatchObject({
      statusCode: 401,
      message: 'Token expired',
    });

    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(getAuthToken()).toBeNull();
  });
});


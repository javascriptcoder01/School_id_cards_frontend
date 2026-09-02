import { describe, it, expect } from 'vitest';
import { getApiBaseUrl } from '../api/apiClient.js';

describe('BATCH 16 — ENVIRONMENT & DEPLOYMENT READINESS', () => {
  it('1. API Base URL resolution provides valid string URL', () => {
    const url = getApiBaseUrl();
    expect(typeof url).toBe('string');
    expect(url.length).toBeGreaterThan(0);
  });

  it('2. API client has configured timeout for production resilience', async () => {
    const { apiClient } = await import('../api/apiClient.js');
    expect(apiClient.defaults.timeout).toBe(30000);
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('3. Source environment template does not leak real credentials or tokens', async () => {
    // Basic sanity check that environment variables are not exposing keys
    expect(process.env.VITE_SUPER_ADMIN_PASSWORD).toBeUndefined();
    expect(process.env.SECRET_KEY).toBeUndefined();
    expect(process.env.JWT_SECRET).toBeUndefined();
  });
});


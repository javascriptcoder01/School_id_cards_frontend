import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../api/apiClient.js';
import { verifyIdCard } from '../features/idCardVerification/idCardVerificationApi.js';

describe('ID CARD VERIFICATION API SERVICE', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. verifyIdCard calls GET /public/id-card/verify/:token with encoded token', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          verified: true,
          student: { studentId: 'STU-001', name: 'Aarav Patel' },
          college: { name: 'Stanford University' },
          generatedAt: '2026-08-31T18:45:00.000Z',
        },
      },
    };
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue(mockResponse);

    const res = await verifyIdCard('secure-qr-token-123');
    expect(getSpy).toHaveBeenCalledWith('/public/id-card/verify/secure-qr-token-123');
    expect(res).toEqual(mockResponse);
  });

  it('2. verifyIdCard handles API errors and rejects promise', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValue(new Error('Network error'));
    await expect(verifyIdCard('invalid-token')).rejects.toThrow('Network error');
  });
});


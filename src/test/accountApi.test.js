import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as storage from '../utils/storage.js';
import { getCurrentAccount } from '../features/account/accountApi.js';

describe('ACCOUNT API SERVICE', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. getCurrentAccount retrieves authenticated user details from storage context', async () => {
    vi.spyOn(storage, 'getUserData').mockReturnValue({
      id: 'usr_100',
      name: 'Dr. Jane Smith',
      email: 'jane@stanford.edu',
      role: 'COLLEGE_ADMIN',
      collegeId: 'col_500',
      isActive: true,
    });

    const account = await getCurrentAccount();
    expect(account).toEqual({
      id: 'usr_100',
      name: 'Dr. Jane Smith',
      email: 'jane@stanford.edu',
      role: 'COLLEGE_ADMIN',
      collegeId: 'col_500',
      isActive: true,
    });
  });

  it('2. getCurrentAccount throws error when no active session exists', async () => {
    vi.spyOn(storage, 'getUserData').mockReturnValue(null);
    await expect(getCurrentAccount()).rejects.toThrow('User session not found');
  });
});


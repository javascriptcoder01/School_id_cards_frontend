import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../api/apiClient.js';
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  updateUserStatus,
} from '../features/users/userApi.js';

describe('GROUP A — USER API SERVICE INTEGRATION', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. listUsers sends GET request with formatted query params', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] });

    await listUsers({ page: 2, limit: 20, search: 'Jane', role: 'OPERATOR', isActive: 'true' });

    expect(getSpy).toHaveBeenCalledWith('/users', {
      params: {
        page: 2,
        limit: 20,
        search: 'Jane',
        role: 'OPERATOR',
        isActive: true,
      },
    });
  });

  it('2. listUsers omits empty or null query parameters', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] });

    await listUsers({ page: 1, limit: 10, search: '', role: '', collegeId: '', isActive: '' });

    expect(getSpy).toHaveBeenCalledWith('/users', {
      params: {
        page: 1,
        limit: 10,
      },
    });
  });

  it('3. getUser calls GET /users/:userId', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: {} });
    await getUser('u-555');
    expect(getSpy).toHaveBeenCalledWith('/users/u-555');
  });

  it('4. createUser sends POST /users with request payload', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: {} });
    const payload = { name: 'David', email: 'david@col.edu', role: 'OPERATOR' };
    await createUser(payload);
    expect(postSpy).toHaveBeenCalledWith('/users', payload);
  });

  it('5. updateUser sends PUT /users/:userId with payload', async () => {
    const putSpy = vi.spyOn(apiClient, 'put').mockResolvedValue({ data: {} });
    const payload = { name: 'David Updated' };
    await updateUser('u-555', payload);
    expect(putSpy).toHaveBeenCalledWith('/users/u-555', payload);
  });

  it('6. updateUserStatus sends PATCH /users/:userId/status with { isActive }', async () => {
    const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValue({ data: {} });
    await updateUserStatus('u-555', false);
    expect(patchSpy).toHaveBeenCalledWith('/users/u-555/status', { isActive: false });
  });
});


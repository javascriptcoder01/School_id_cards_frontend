import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../api/apiClient.js';
import {
  getCollegesApi,
  getMyCollegeApi,
  getCollegeByIdApi,
  createCollegeApi,
  updateCollegeApi,
  updateCollegeStatusApi,
} from '../features/colleges/collegeApi.js';

describe('GROUP B — COLLEGE API SERVICE INTEGRATION', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. getCollegesApi sends GET request with formatted query params', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] });

    await getCollegesApi({ page: 2, limit: 20, search: 'Tech', isActive: 'true' });

    expect(getSpy).toHaveBeenCalledWith('/colleges', {
      params: {
        page: 2,
        limit: 20,
        search: 'Tech',
        isActive: true,
      },
    });
  });

  it('2. getCollegesApi omits empty/null query parameters', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] });

    await getCollegesApi({ page: 1, limit: 10, search: '', isActive: '' });

    expect(getSpy).toHaveBeenCalledWith('/colleges', {
      params: {
        page: 1,
        limit: 10,
      },
    });
  });

  it('3. getMyCollegeApi calls GET /colleges/me', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: {} });
    await getMyCollegeApi();
    expect(getSpy).toHaveBeenCalledWith('/colleges/me');
  });

  it('4. getCollegeByIdApi calls GET /colleges/:collegeId', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: {} });
    await getCollegeByIdApi('60d5ec49f1b2c8b1f8e4e1a1');
    expect(getSpy).toHaveBeenCalledWith('/colleges/60d5ec49f1b2c8b1f8e4e1a1');
  });

  it('5. createCollegeApi sends POST /colleges with request payload', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: {} });
    const payload = { name: 'Imperial', code: 'IMP01' };
    await createCollegeApi(payload);
    expect(postSpy).toHaveBeenCalledWith('/colleges', payload);
  });

  it('6. updateCollegeApi sends PUT /colleges/:id with payload', async () => {
    const putSpy = vi.spyOn(apiClient, 'put').mockResolvedValue({ data: {} });
    const payload = { name: 'Imperial College London' };
    await updateCollegeApi('imp-1', payload);
    expect(putSpy).toHaveBeenCalledWith('/colleges/imp-1', payload);
  });

  it('7. updateCollegeStatusApi sends PATCH /colleges/:id/status with { isActive }', async () => {
    const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValue({ data: {} });
    await updateCollegeStatusApi('imp-1', false);
    expect(patchSpy).toHaveBeenCalledWith('/colleges/imp-1/status', { isActive: false });
  });
});


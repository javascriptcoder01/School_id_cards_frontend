import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../api/apiClient.js';
import { getCollegeProgress } from '../features/collegeProgress/collegeProgressApi.js';

describe('COLLEGE PROGRESS API SERVICE', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. getCollegeProgress sends GET request to /college/dashboard/progress', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: { success: true, data: { summary: { totalStudents: 100 }, operators: [] } },
    });

    const res = await getCollegeProgress();
    expect(getSpy).toHaveBeenCalledWith('/college/dashboard/progress');
    expect(res).toEqual({ summary: { totalStudents: 100 }, operators: [] });
  });
});

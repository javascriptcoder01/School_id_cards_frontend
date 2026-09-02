import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../api/apiClient.js';
import {
  getSuperAdminSummary,
  getCollegeAdminSummary,
  getOperatorSummary,
} from '../features/dashboard/dashboardApi.js';

describe('DASHBOARD API SERVICE', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. getSuperAdminSummary aggregates colleges, users, and templates', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockImplementation((url) => {
      if (url === '/colleges') {
        return Promise.resolve({
          data: {
            colleges: [{ id: 'c1', name: 'MIT', createdAt: '2026-09-01T10:00:00Z' }],
            pagination: { total: 10 },
          },
        });
      }
      if (url === '/users') {
        return Promise.resolve({
          data: {
            users: [{ id: 'u1', name: 'Admin One', role: 'SUPER_ADMIN', createdAt: '2026-09-01T10:00:00Z' }],
            pagination: { total: 25 },
          },
        });
      }
      if (url === '/templates') {
        return Promise.resolve({
          data: {
            templates: [{ id: 't1', name: 'Standard Layout' }],
            pagination: { total: 5 },
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    const result = await getSuperAdminSummary();
    expect(getSpy).toHaveBeenCalledWith('/colleges', { params: { limit: 5 } });
    expect(getSpy).toHaveBeenCalledWith('/users', { params: { limit: 5 } });
    expect(getSpy).toHaveBeenCalledWith('/templates', { params: { limit: 5 } });

    expect(result.summary).toEqual({
      totalColleges: 10,
      totalUsers: 25,
      totalTemplates: 5,
    });
    expect(result.activity.length).toBe(2);
  });

  it('2. getCollegeAdminSummary aggregates students, templates, and generation jobs', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockImplementation((url) => {
      if (url === '/students') {
        return Promise.resolve({
          data: {
            students: [{ id: 's1', name: 'Aarav Patel' }],
            pagination: { total: 500 },
          },
        });
      }
      if (url === '/templates') {
        return Promise.resolve({
          data: {
            templates: [{ id: 't1', name: 'Standard Template' }],
            pagination: { total: 2 },
          },
        });
      }
      if (url === '/id-cards/generations') {
        return Promise.resolve({
          data: {
            generations: [
              { id: 'g1', templateName: 'Standard', status: 'COMPLETED', studentCount: 100 },
              { id: 'g2', templateName: 'Standard', status: 'PENDING', studentCount: 50 },
            ],
            pagination: { total: 2 },
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    const result = await getCollegeAdminSummary();
    expect(getSpy).toHaveBeenCalledWith('/students', { params: { limit: 5 } });
    expect(getSpy).toHaveBeenCalledWith('/templates', { params: { limit: 5 } });
    expect(getSpy).toHaveBeenCalledWith('/id-cards/generations', { params: { limit: 10 } });

    expect(result.summary.totalStudents).toBe(500);
    expect(result.summary.totalTemplates).toBe(2);
    expect(result.summary.totalGenerations).toBe(2);
    expect(result.generationStats.completed).toBe(1);
    expect(result.generationStats.pending).toBe(1);
  });

  it('3. getOperatorSummary returns read-only operational summary', async () => {
    const result = await getOperatorSummary();
    expect(result.summary).toEqual({
      operationalStatus: 'ACTIVE',
      accessLevel: 'READ_ONLY',
    });
  });
});


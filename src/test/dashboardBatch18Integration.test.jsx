import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as dashboardApi from '../features/dashboard/dashboardApi.js';
import apiClient from '../api/apiClient.js';

vi.mock('../api/apiClient.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('DASHBOARD BATCH 18 INTEGRATION & ENDPOINTS', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. getOperatorSummary consumes GET /api/dashboard/operator-summary', async () => {
    const mockData = {
      summary: {
        totalStudents: 45,
        completedStudents: 40,
        pendingStudents: 5,
        completionPercentage: 89,
        generatedCards: 38,
        pendingGeneration: 2,
        printRequested: 35,
        printApproved: 30,
        printRejected: 2,
      },
      assignment: {
        subjectName: 'Mathematics',
        className: '10',
        sectionName: 'A',
      },
    };

    apiClient.get.mockResolvedValueOnce({ data: { success: true, data: mockData } });

    const res = await dashboardApi.getOperatorSummary();
    expect(apiClient.get).toHaveBeenCalledWith('/dashboard/operator-summary');
    expect(res.summary.totalStudents).toBe(45);
    expect(res.summary.completedStudents).toBe(40);
    expect(res.summary.completionPercentage).toBe(89);
    expect(res.assignment.subjectName).toBe('Mathematics');
  });

  it('2. getCollegeAdminSummary integrates college-operator-progress data', async () => {
    const mockProgress = {
      summary: {
        totalOperators: 3,
        totalStudents: 120,
        completedStudents: 110,
        pendingStudents: 10,
        pendingPrintRequests: 4,
      },
      operators: [
        {
          id: 'op-1',
          name: 'Teacher One',
          subjectName: 'Math',
          className: '10',
          sectionName: 'A',
          totalStudents: 40,
          completedStudents: 38,
          pendingStudents: 2,
        },
      ],
    };

    apiClient.get.mockImplementation((url) => {
      if (url === '/dashboard/college-operator-progress') {
        return Promise.resolve({ data: { success: true, data: mockProgress } });
      }
      return Promise.resolve({ data: { success: true, data: {} } });
    });

    const res = await dashboardApi.getCollegeAdminSummary();
    expect(res.summary.totalOperators).toBe(3);
    expect(res.summary.completedStudents).toBe(110);
    expect(res.operatorProgress).toHaveLength(1);
    expect(res.operatorProgress[0].name).toBe('Teacher One');
  });
});


import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../api/apiClient.js';
import {
  getOperatorDashboard,
  getOperatorStudents,
  getOperatorStudentById,
  createOperatorStudent,
  updateOperatorStudent,
  importOperatorStudents,
  getOperatorTemplates,
  previewOperatorIdCard,
  createOperatorGeneration,
  getOperatorGenerations,
} from '../features/operator/operatorApi.js';

describe('OPERATOR WORKSPACE API SERVICE', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. getOperatorDashboard calls GET /operator/dashboard', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: { success: true, data: { summary: {}, assignments: [] } },
    });
    const res = await getOperatorDashboard();
    expect(getSpy).toHaveBeenCalledWith('/operator/dashboard');
    expect(res).toEqual({ summary: {}, assignments: [] });
  });

  it('2. getOperatorStudents calls GET /operator/students', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: { success: true, data: { students: [] } },
    });
    await getOperatorStudents({ page: 1, limit: 20 });
    expect(getSpy).toHaveBeenCalledWith('/operator/students', { params: { page: 1, limit: 20 } });
  });

  it('3. getOperatorStudentById calls GET /operator/students/:studentId', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: { success: true, data: { student: { id: 's-1' } } },
    });
    await getOperatorStudentById('s-1');
    expect(getSpy).toHaveBeenCalledWith('/operator/students/s-1');
  });

  it('4. createOperatorStudent calls POST /operator/students', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { success: true, data: { student: { id: 's-1' } } },
    });
    const payload = { name: 'Aarav', studentId: 'S-1', className: '10', section: 'A' };
    await createOperatorStudent(payload);
    expect(postSpy).toHaveBeenCalledWith('/operator/students', payload);
  });

  it('5. importOperatorStudents calls POST /operator/students/import', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { success: true, data: { successCount: 1, failedCount: 0 } },
    });
    await importOperatorStudents([{ studentId: 'S-1', name: 'Aarav', className: '10', section: 'A' }]);
    expect(postSpy).toHaveBeenCalledWith('/operator/students/import', {
      students: [{ studentId: 'S-1', name: 'Aarav', className: '10', section: 'A' }],
    });
  });

  it('6. previewOperatorIdCard calls POST /operator/id-cards/preview', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { success: true, data: { previewUrl: 'data:image/png;base64,...' } },
    });
    await previewOperatorIdCard({ studentId: 's-1', templateId: 't-1' });
    expect(postSpy).toHaveBeenCalledWith('/operator/id-cards/preview', { studentId: 's-1', templateId: 't-1' });
  });

  it('7. createOperatorGeneration calls POST /operator/id-cards/generations', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { success: true, data: { generation: { id: 'g-1' } } },
    });
    await createOperatorGeneration({ templateId: 't-1', studentIds: ['s-1'] });
    expect(postSpy).toHaveBeenCalledWith('/operator/id-cards/generations', { templateId: 't-1', studentIds: ['s-1'] });
  });
});


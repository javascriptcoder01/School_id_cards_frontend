import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../api/apiClient.js';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  updateStudentStatus,
} from '../features/students/studentApi.js';

describe('GROUP A — STUDENT API SERVICE INTEGRATION', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. getStudents sends GET request with page, limit, and search parameters', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] });

    await getStudents({ page: 2, limit: 20, search: 'Rahul' });

    expect(getSpy).toHaveBeenCalledWith('/students', {
      params: {
        page: 2,
        limit: 20,
        search: 'Rahul',
      },
    });
  });

  it('2. getStudents omits empty or undefined query parameters', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] });

    await getStudents({ page: 1, limit: 10, search: '' });

    expect(getSpy).toHaveBeenCalledWith('/students', {
      params: {
        page: 1,
        limit: 10,
      },
    });
  });

  it('3. getStudentById calls GET /students/:studentId', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: {} });
    await getStudentById('stu-12345');
    expect(getSpy).toHaveBeenCalledWith('/students/stu-12345');
  });

  it('4. createStudent sends POST /students with request payload', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: {} });
    const payload = { studentId: 'STU-1', name: 'Rahul', className: '10th' };
    await createStudent(payload);
    expect(postSpy).toHaveBeenCalledWith('/students', payload);
  });

  it('5. updateStudent sends PUT /students/:studentId with payload', async () => {
    const putSpy = vi.spyOn(apiClient, 'put').mockResolvedValue({ data: {} });
    const payload = { name: 'Rahul Sharma' };
    await updateStudent('stu-12345', payload);
    expect(putSpy).toHaveBeenCalledWith('/students/stu-12345', payload);
  });

  it('6. updateStudentStatus sends PATCH /students/:studentId/status with { isActive }', async () => {
    const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValue({ data: {} });
    await updateStudentStatus('stu-12345', false);
    expect(patchSpy).toHaveBeenCalledWith('/students/stu-12345/status', { isActive: false });
  });
});


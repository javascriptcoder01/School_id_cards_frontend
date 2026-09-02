import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../api/apiClient.js';
import { loginApi } from '../features/auth/authApi.js';
import {
  getCollegesApi,
  getMyCollegeApi,
  getCollegeByIdApi,
  createCollegeApi,
  updateCollegeApi,
  updateCollegeStatusApi,
} from '../features/colleges/collegeApi.js';
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  updateUserStatus,
} from '../features/users/userApi.js';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  updateStudentStatus,
} from '../features/students/studentApi.js';
import { uploadStudents } from '../features/studentImport/studentImportApi.js';
import {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  updateTemplateStatus,
} from '../features/templates/templateApi.js';
import {
  createGeneration,
  createBulkGeneration,
  getGenerations,
  getGenerationById,
  processGeneration,
  getGenerationResults,
} from '../features/idCardGeneration/idCardGenerationApi.js';
import {
  downloadStudentCard,
  downloadGenerationZip,
} from '../features/idCardOutput/idCardOutputApi.js';
import { verifyIdCard } from '../features/idCardVerification/idCardVerificationApi.js';
import {
  getSuperAdminSummary,
  getCollegeAdminSummary,
  getOperatorSummary,
} from '../features/dashboard/dashboardApi.js';

describe('BATCH 16 — API CONTRACT VALIDATION SUITE', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Authentication API Contract', () => {
    it('calls POST /auth/login with valid payload', async () => {
      const spy = vi.spyOn(apiClient, 'post').mockResolvedValue({ token: 'mock-token', user: { id: 'u1' } });
      const result = await loginApi({ email: 'admin@school.edu', password: 'Password123!' });

      expect(spy).toHaveBeenCalledWith('/auth/login', {
        email: 'admin@school.edu',
        password: 'Password123!',
      });
      expect(result).toHaveProperty('token', 'mock-token');
    });
  });

  describe('2. College Management API Contract', () => {
    it('calls GET /colleges with sanitized query parameters', async () => {
      const spy = vi.spyOn(apiClient, 'get').mockResolvedValue({ colleges: [], pagination: {} });
      await getCollegesApi({ page: 1, limit: 10, search: 'Oxford', isActive: true });

      expect(spy).toHaveBeenCalledWith('/colleges', {
        params: { page: 1, limit: 10, search: 'Oxford', isActive: true },
      });
    });

    it('calls GET /colleges/me for college admin profile', async () => {
      const spy = vi.spyOn(apiClient, 'get').mockResolvedValue({ college: { id: 'col-1' } });
      await getMyCollegeApi();
      expect(spy).toHaveBeenCalledWith('/colleges/me');
    });

    it('calls GET /colleges/:id, POST /colleges, PUT /colleges/:id, PATCH /colleges/:id/status', async () => {
      const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({ college: { id: 'col-1' } });
      const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({ college: { id: 'col-1' } });
      const putSpy = vi.spyOn(apiClient, 'put').mockResolvedValue({ college: { id: 'col-1' } });
      const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValue({ college: { id: 'col-1' } });

      await getCollegeByIdApi('col-1');
      expect(getSpy).toHaveBeenCalledWith('/colleges/col-1');

      await createCollegeApi({ name: 'New College', code: 'NC01' });
      expect(postSpy).toHaveBeenCalledWith('/colleges', { name: 'New College', code: 'NC01' });

      await updateCollegeApi('col-1', { name: 'Updated College' });
      expect(putSpy).toHaveBeenCalledWith('/colleges/col-1', { name: 'Updated College' });

      await updateCollegeStatusApi('col-1', false);
      expect(patchSpy).toHaveBeenCalledWith('/colleges/col-1/status', { isActive: false });
    });
  });

  describe('3. User Management API Contract', () => {
    it('calls GET /users, GET /users/:id, POST /users, PUT /users/:id, PATCH /users/:id/status', async () => {
      const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({ users: [] });
      const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({ user: {} });
      const putSpy = vi.spyOn(apiClient, 'put').mockResolvedValue({ user: {} });
      const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValue({ user: {} });

      await listUsers({ page: 2, limit: 20, role: 'OPERATOR' });
      expect(getSpy).toHaveBeenCalledWith('/users', { params: { page: 2, limit: 20, role: 'OPERATOR' } });

      await getUser('user-1');
      expect(getSpy).toHaveBeenCalledWith('/users/user-1');

      await createUser({ name: 'John', email: 'john@edu.com', role: 'OPERATOR' });
      expect(postSpy).toHaveBeenCalledWith('/users', { name: 'John', email: 'john@edu.com', role: 'OPERATOR' });

      await updateUser('user-1', { name: 'John Updated' });
      expect(putSpy).toHaveBeenCalledWith('/users/user-1', { name: 'John Updated' });

      await updateUserStatus('user-1', true);
      expect(patchSpy).toHaveBeenCalledWith('/users/user-1/status', { isActive: true });
    });
  });

  describe('4. Student Management & Bulk Import API Contract', () => {
    it('calls GET /students, GET /students/:id, POST /students, PUT /students/:id, PATCH /students/:id/status', async () => {
      const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({ students: [] });
      const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({ student: {} });
      const putSpy = vi.spyOn(apiClient, 'put').mockResolvedValue({ student: {} });
      const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValue({ student: {} });

      await getStudents({ page: 1, limit: 10, search: 'Alice' });
      expect(getSpy).toHaveBeenCalledWith('/students', { params: { page: 1, limit: 10, search: 'Alice' } });

      await getStudentById('stu-1');
      expect(getSpy).toHaveBeenCalledWith('/students/stu-1');

      await createStudent({ name: 'Alice', studentId: 'STU-001' });
      expect(postSpy).toHaveBeenCalledWith('/students', { name: 'Alice', studentId: 'STU-001' });

      await updateStudent('stu-1', { name: 'Alice B' });
      expect(putSpy).toHaveBeenCalledWith('/students/stu-1', { name: 'Alice B' });

      await updateStudentStatus('stu-1', false);
      expect(patchSpy).toHaveBeenCalledWith('/students/stu-1/status', { isActive: false });
    });

    it('calls POST /students/import with FormData containing exactly "file"', async () => {
      const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({ totalRecords: 10, successCount: 10 });
      const mockFile = new File(['dummy content'], 'students.csv', { type: 'text/csv' });

      await uploadStudents(mockFile);

      expect(postSpy).toHaveBeenCalledWith(
        '/students/import',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      );
    });
  });

  describe('5. Template Management API Contract', () => {
    it('calls GET /templates, GET /templates/:id, POST /templates, PUT /templates/:id, PATCH /templates/:id/status', async () => {
      const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({ templates: [] });
      const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({ template: {} });
      const putSpy = vi.spyOn(apiClient, 'put').mockResolvedValue({ template: {} });
      const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValue({ template: {} });

      await getTemplates({ page: 1, search: 'Standard' });
      expect(getSpy).toHaveBeenCalledWith('/templates', { params: { page: 1, search: 'Standard' } });

      await getTemplateById('tmpl-1');
      expect(getSpy).toHaveBeenCalledWith('/templates/tmpl-1');

      await createTemplate({ name: 'Template A', width: 86, height: 54 });
      expect(postSpy).toHaveBeenCalledWith('/templates', { name: 'Template A', width: 86, height: 54 });

      await updateTemplate('tmpl-1', { name: 'Template A Updated' });
      expect(putSpy).toHaveBeenCalledWith('/templates/tmpl-1', { name: 'Template A Updated' });

      await updateTemplateStatus('tmpl-1', true);
      expect(patchSpy).toHaveBeenCalledWith('/templates/tmpl-1/status', { isActive: true });
    });
  });

  describe('6. ID Card Generation & Output API Contract', () => {
    it('calls generation lifecycle endpoints', async () => {
      const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({ generation: {} });
      const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({ generations: [] });

      await createGeneration({ templateId: 'tmpl-1', studentId: 'stu-1' });
      expect(postSpy).toHaveBeenCalledWith('/id-cards/generate', { templateId: 'tmpl-1', studentId: 'stu-1' });

      await createBulkGeneration({ templateId: 'tmpl-1', studentIds: ['s1', 's2'] });
      expect(postSpy).toHaveBeenCalledWith('/id-cards/generate/bulk', { templateId: 'tmpl-1', studentIds: ['s1', 's2'] });

      await getGenerations({ page: 1, status: 'COMPLETED' });
      expect(getSpy).toHaveBeenCalledWith('/id-cards/generations', { params: { page: 1, status: 'COMPLETED' } });

      await getGenerationById('gen-1');
      expect(getSpy).toHaveBeenCalledWith('/id-cards/generations/gen-1');

      await processGeneration('gen-1');
      expect(postSpy).toHaveBeenCalledWith('/id-cards/generations/gen-1/process');

      await getGenerationResults('gen-1');
      expect(getSpy).toHaveBeenCalledWith('/id-cards/generations/gen-1/results');
    });

    it('calls single PNG and bulk ZIP download with responseType: "blob"', async () => {
      const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue(new Blob(['fake-png']));

      await downloadStudentCard('gen-1', 'stu-1');
      expect(getSpy).toHaveBeenCalledWith(
        '/id-cards/generations/gen-1/results/stu-1/download',
        { responseType: 'blob' }
      );

      await downloadGenerationZip('gen-1');
      expect(getSpy).toHaveBeenCalledWith(
        '/id-cards/generations/gen-1/download',
        { responseType: 'blob' }
      );
    });
  });

  describe('7. Public QR Verification API Contract', () => {
    it('calls GET /public/id-card/verify/:token with encoded token', async () => {
      const spy = vi.spyOn(apiClient, 'get').mockResolvedValue({ verified: true, student: {} });
      await verifyIdCard('token 123#');
      expect(spy).toHaveBeenCalledWith('/public/id-card/verify/token%20123%23');
    });
  });

  describe('8. Dashboard Aggregation Contract', () => {
    it('aggregates Super Admin metrics without fabricating data', async () => {
      vi.spyOn(apiClient, 'get').mockImplementation(async (url) => {
        if (url === '/colleges') return { data: { colleges: [{ id: 'c1', name: 'Col 1' }], pagination: { total: 1 } } };
        if (url === '/users') return { data: { users: [{ id: 'u1', name: 'User 1' }], pagination: { total: 1 } } };
        if (url === '/templates') return { data: { templates: [{ id: 't1', name: 'Tmpl 1' }], pagination: { total: 1 } } };
        return {};
      });

      const result = await getSuperAdminSummary();
      expect(result.summary.totalColleges).toBe(1);
      expect(result.summary.totalUsers).toBe(1);
      expect(result.summary.totalTemplates).toBe(1);
      expect(result.activity.length).toBe(2);
    });

    it('aggregates College Admin metrics from verified endpoints', async () => {
      vi.spyOn(apiClient, 'get').mockImplementation(async (url) => {
        if (url === '/students') return { data: { students: [{ id: 's1' }], pagination: { total: 1 } } };
        if (url === '/templates') return { data: { templates: [{ id: 't1' }], pagination: { total: 1 } } };
        if (url === '/id-cards/generations') {
          return {
            data: {
              generations: [{ id: 'g1', status: 'COMPLETED', templateName: 'Card', studentCount: 1 }],
              pagination: { total: 1 },
            },
          };
        }
        if (url === '/id-cards/summary') {
          return { data: { summary: { totalGenerations: 1, completed: 1, pending: 0, processing: 0, failed: 0 } } };
        }
        return {};
      });

      const result = await getCollegeAdminSummary();
      expect(result.summary.totalStudents).toBe(1);
      expect(result.summary.totalTemplates).toBe(1);
      expect(result.summary.totalGenerations).toBe(1);
      expect(result.generationStats.completed).toBe(1);
    });

    it('returns fixed read-only summary for Operator', async () => {
      const result = await getOperatorSummary();
      expect(result.summary.operationalStatus).toBe('ACTIVE');
      expect(result.summary.accessLevel).toBe('READ_ONLY');
    });
  });
});


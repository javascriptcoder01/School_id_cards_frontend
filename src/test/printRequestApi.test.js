import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as printRequestApi from '../features/printRequests/printRequestApi.js';
import apiClient from '../api/apiClient.js';

vi.mock('../api/apiClient.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('PRINT REQUEST API SERVICE', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. createPrintRequest calls POST /api/print-requests', async () => {
    const payload = { generationId: 'gen-1', studentIds: ['s-1', 's-2'], requestType: 'BULK' };
    apiClient.post.mockResolvedValueOnce({ data: { success: true, data: { printRequest: { id: 'pr-1' } } } });

    const res = await printRequestApi.createPrintRequest(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/print-requests', payload);
    expect(res).toEqual({ id: 'pr-1' });
  });

  it('2. getMyPrintRequests calls GET /api/print-requests/my', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { success: true, data: { printRequests: [{ id: 'pr-1' }] } } });

    const res = await printRequestApi.getMyPrintRequests({ limit: 10 });
    expect(apiClient.get).toHaveBeenCalledWith('/print-requests/my', { params: { limit: 10 } });
    expect(res.printRequests).toHaveLength(1);
  });

  it('3. getCollegePrintRequests calls GET /api/print-requests', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { success: true, data: { printRequests: [{ id: 'pr-2' }] } } });

    const res = await printRequestApi.getCollegePrintRequests({ status: 'PENDING_COLLEGE_APPROVAL' });
    expect(apiClient.get).toHaveBeenCalledWith('/print-requests', { params: { status: 'PENDING_COLLEGE_APPROVAL' } });
    expect(res.printRequests).toHaveLength(1);
  });

  it('4. getPrintRequestById calls GET /api/print-requests/:requestId', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { success: true, data: { printRequest: { id: 'pr-123' } } } });

    const res = await printRequestApi.getPrintRequestById('pr-123');
    expect(apiClient.get).toHaveBeenCalledWith('/print-requests/pr-123');
    expect(res.id).toBe('pr-123');
  });

  it('5. approveCollegePrintRequest calls PATCH /api/print-requests/:requestId/approve', async () => {
    apiClient.patch.mockResolvedValueOnce({ data: { success: true, data: { printRequest: { id: 'pr-1', status: 'COLLEGE_APPROVED' } } } });

    const res = await printRequestApi.approveCollegePrintRequest('pr-1');
    expect(apiClient.patch).toHaveBeenCalledWith('/print-requests/pr-1/approve');
    expect(res.status).toBe('COLLEGE_APPROVED');
  });

  it('6. rejectCollegePrintRequest calls PATCH /api/print-requests/:requestId/reject with reason', async () => {
    apiClient.patch.mockResolvedValueOnce({ data: { success: true, data: { printRequest: { id: 'pr-1', status: 'COLLEGE_REJECTED' } } } });

    const res = await printRequestApi.rejectCollegePrintRequest('pr-1', 'Invalid photos');
    expect(apiClient.patch).toHaveBeenCalledWith('/print-requests/pr-1/reject', { reason: 'Invalid photos' });
    expect(res.status).toBe('COLLEGE_REJECTED');
  });

  it('7. forwardToSuperAdmin calls POST /api/print-requests/:requestId/send-to-super-admin', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { success: true, data: { printRequest: { id: 'pr-1', status: 'SENT_TO_SUPER_ADMIN' } } } });

    const res = await printRequestApi.forwardToSuperAdmin('pr-1');
    expect(apiClient.post).toHaveBeenCalledWith('/print-requests/pr-1/send-to-super-admin');
    expect(res.status).toBe('SENT_TO_SUPER_ADMIN');
  });

  it('8. getAdminPrintRequests calls GET /api/admin/print-requests', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { success: true, data: { printRequests: [{ id: 'pr-sa-1' }] } } });

    const res = await printRequestApi.getAdminPrintRequests();
    expect(apiClient.get).toHaveBeenCalledWith('/admin/print-requests', { params: {} });
    expect(res.printRequests).toHaveLength(1);
  });

  it('9. approveAdminPrintRequest calls PATCH /api/admin/print-requests/:requestId/approve', async () => {
    apiClient.patch.mockResolvedValueOnce({ data: { success: true, data: { printRequest: { id: 'pr-sa-1', status: 'SUPER_ADMIN_APPROVED' } } } });

    const res = await printRequestApi.approveAdminPrintRequest('pr-sa-1');
    expect(apiClient.patch).toHaveBeenCalledWith('/admin/print-requests/pr-sa-1/approve');
    expect(res.status).toBe('SUPER_ADMIN_APPROVED');
  });

  it('10. rejectAdminPrintRequest calls PATCH /api/admin/print-requests/:requestId/reject with reason', async () => {
    apiClient.patch.mockResolvedValueOnce({ data: { success: true, data: { printRequest: { id: 'pr-sa-1', status: 'SUPER_ADMIN_REJECTED' } } } });

    const res = await printRequestApi.rejectAdminPrintRequest('pr-sa-1', 'Incorrect layout');
    expect(apiClient.patch).toHaveBeenCalledWith('/admin/print-requests/pr-sa-1/reject', { reason: 'Incorrect layout' });
    expect(res.status).toBe('SUPER_ADMIN_REJECTED');
  });

  it('11. markAdminPrinting calls PATCH /api/admin/print-requests/:requestId/printing', async () => {
    apiClient.patch.mockResolvedValueOnce({ data: { success: true, data: { printRequest: { id: 'pr-sa-1', status: 'PRINTING' } } } });

    const res = await printRequestApi.markAdminPrinting('pr-sa-1');
    expect(apiClient.patch).toHaveBeenCalledWith('/admin/print-requests/pr-sa-1/printing');
    expect(res.status).toBe('PRINTING');
  });

  it('12. markAdminComplete calls PATCH /api/admin/print-requests/:requestId/complete', async () => {
    apiClient.patch.mockResolvedValueOnce({ data: { success: true, data: { printRequest: { id: 'pr-sa-1', status: 'COMPLETED' } } } });

    const res = await printRequestApi.markAdminComplete('pr-sa-1');
    expect(apiClient.patch).toHaveBeenCalledWith('/admin/print-requests/pr-sa-1/complete');
    expect(res.status).toBe('COMPLETED');
  });

  it('13. downloadAdminPrintAssets calls GET /api/admin/print-requests/:requestId/download with responseType blob', async () => {
    const mockBlob = new Blob(['PK mock zip'], { type: 'application/zip' });
    apiClient.get.mockResolvedValueOnce({ data: mockBlob });

    const res = await printRequestApi.downloadAdminPrintAssets('pr-sa-1');
    expect(apiClient.get).toHaveBeenCalledWith('/admin/print-requests/pr-sa-1/download', { responseType: 'blob' });
    expect(res).toBe(mockBlob);
  });
});


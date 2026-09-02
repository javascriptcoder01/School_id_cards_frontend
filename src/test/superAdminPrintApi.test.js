import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../api/apiClient.js';
import {
  getPrintSummary,
  getCollegePrintDetails,
  downloadResultPng,
  downloadCollegeZip,
  downloadCollegePdf,
} from '../features/superAdminPrint/superAdminPrintApi.js';

describe('SUPER ADMIN PRINT CENTER API SERVICE', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. getPrintSummary calls GET /super-admin/id-cards/print-summary', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: { success: true, data: { colleges: [] } },
    });
    await getPrintSummary({ page: 1, limit: 20 });
    expect(getSpy).toHaveBeenCalledWith('/super-admin/id-cards/print-summary', {
      params: { page: 1, limit: 20 },
    });
  });

  it('2. getCollegePrintDetails calls GET /super-admin/id-cards/colleges/:collegeId', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: { success: true, data: { college: { id: 'col-1' } } },
    });
    await getCollegePrintDetails('col-1');
    expect(getSpy).toHaveBeenCalledWith('/super-admin/id-cards/colleges/col-1');
  });

  it('3. downloadResultPng requests blob from /super-admin/id-cards/results/:resultId/download', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: new Blob(['fake-png-bytes'], { type: 'image/png' }),
    });
    await downloadResultPng('res-1');
    expect(getSpy).toHaveBeenCalledWith('/super-admin/id-cards/results/res-1/download', {
      responseType: 'blob',
    });
  });

  it('4. downloadCollegeZip requests blob from /super-admin/id-cards/colleges/:collegeId/download', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: new Blob(['fake-zip-bytes'], { type: 'application/zip' }),
    });
    await downloadCollegeZip('col-1');
    expect(getSpy).toHaveBeenCalledWith('/super-admin/id-cards/colleges/col-1/download', {
      responseType: 'blob',
    });
  });

  it('5. downloadCollegePdf requests blob from /super-admin/id-cards/colleges/:collegeId/download/pdf', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: new Blob(['fake-pdf-bytes'], { type: 'application/pdf' }),
    });
    await downloadCollegePdf('col-1');
    expect(getSpy).toHaveBeenCalledWith('/super-admin/id-cards/colleges/col-1/download/pdf', {
      responseType: 'blob',
    });
  });
});

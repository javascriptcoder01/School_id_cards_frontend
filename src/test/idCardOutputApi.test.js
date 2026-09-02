import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../api/apiClient.js';
import {
  downloadStudentCard,
  downloadGenerationZip,
} from '../features/idCardOutput/idCardOutputApi.js';

describe('ID CARD OUTPUT API SERVICE', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. downloadStudentCard calls GET /id-cards/generations/:id/results/:studentId/download with responseType blob', async () => {
    const mockBlob = new Blob(['PNG_BYTES'], { type: 'image/png' });
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: mockBlob,
      headers: { 'content-disposition': 'attachment; filename="student-card-1.png"' },
    });

    const result = await downloadStudentCard('gen-1', 'stu-1');
    expect(getSpy).toHaveBeenCalledWith(
      '/id-cards/generations/gen-1/results/stu-1/download',
      { responseType: 'blob' }
    );
    expect(result.data).toBe(mockBlob);
  });

  it('2. downloadGenerationZip calls GET /id-cards/generations/:id/download with responseType blob', async () => {
    const mockBlob = new Blob(['ZIP_BYTES'], { type: 'application/zip' });
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: mockBlob,
      headers: { 'content-disposition': 'attachment; filename="cards.zip"' },
    });

    const result = await downloadGenerationZip('gen-1');
    expect(getSpy).toHaveBeenCalledWith(
      '/id-cards/generations/gen-1/download',
      { responseType: 'blob' }
    );
    expect(result.data).toBe(mockBlob);
  });
});

